import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "2c3941d0b08d4c01b2735b6259550335";
const TOKEN = null;
const REACTIONS = ["❤️", "😂", "👍", "😮", "😢"];

const Chat = ({ darkMode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showReactions, setShowReactions] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevLengthRef = useRef(0);

  // Video call states
  const [inCall, setInCall] = useState(false);
  const [localTracks, setLocalTracks] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const clientRef = useRef(null);

  // Messages
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Faqat yangi xabar kelganda scroll
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  // Typing — listen
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "typing"), (snap) => {
      const users = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((d) => d.uid !== user?.uid && d.isTyping);
      setTypingUsers(users);
    });
    return () => unsub();
  }, [user]);

  // Sahifadan chiqqanda typing o'chirish
  useEffect(() => {
    return () => {
      if (user) {
        setDoc(doc(db, "typing", user.uid), { uid: user.uid, isTyping: false }, { merge: true }).catch(() => {});
      }
    };
  }, [user]);

  // Typing yoqish — setDoc ishlatamiz (document yo'q bo'lsa yaratadi)
 const setTypingStatus = async (isTyping) => {
  if (!user) return;
  try {
    await setDoc(doc(db, "typing", user.uid), {
      uid: user.uid,
      name: user.displayName || user.email,
      isTyping,
    }, { merge: true });
  } catch  {
    // ignore
  }
};

  const handleTyping = (e) => {
    setText(e.target.value);
    setTypingStatus(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 2000);
  };

  // Input blur — typing o'chirish (Telegram uslubi)
 const handleBlur = async () => {
  clearTimeout(typingTimeoutRef.current);
  await setTypingStatus(false);
};

const handleSend = async () => {
  if (!text.trim()) return;
  clearTimeout(typingTimeoutRef.current);
  await setTypingStatus(false);
  await addDoc(collection(db, "messages"), {
    text,
    uid: user.uid,
    name: user.displayName || user.email,
    avatar: user.photoURL || null,
    type: "text",
    reactions: {},
    createdAt: serverTimestamp(),
  });
  setText("");
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Xabarni o'chirish
  const handleDelete = async (msgId, msgUid) => {
    if (msgUid !== user.uid) return;
    await deleteDoc(doc(db, "messages", msgId));
  };

  // Reaction
  const handleReaction = async (msgId, emoji) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const reactions = { ...(msg.reactions || {}) };
    if (reactions[emoji]?.includes(user.uid)) {
      reactions[emoji] = reactions[emoji].filter((id) => id !== user.uid);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...(reactions[emoji] || []), user.uid];
    }
    await updateDoc(doc(db, "messages", msgId), { reactions });
    setShowReactions(null);
  };

  // Rasm yuborish
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Rasm 5MB dan kichik bo'lishi kerak!"); return; }
    setImageUploading(true);
    try {
      const storageRef = ref(storage, `chat-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "messages"), {
        text: "", imageUrl: url, uid: user.uid,
        name: user.displayName || user.email,
        avatar: user.photoURL || null,
        type: "image", reactions: {},
        createdAt: serverTimestamp(),
      });
    } catch { alert("Rasm yuklashda xatolik!"); }
    finally { setImageUploading(false); e.target.value = ""; }
  };

  // Video call
  const joinCall = async () => {
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === remoteUser.uid);
          if (exists) return prev.map((u) => u.uid === remoteUser.uid ? remoteUser : u);
          return [...prev, remoteUser];
        });
      });
      client.on("user-unpublished", (remoteUser) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
      });
      await client.join(APP_ID, "general-chat", TOKEN, null);
      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      await client.publish([micTrack, camTrack]);
      setLocalTracks({ mic: micTrack, cam: camTrack });
      setInCall(true);
    } catch { alert("Video call xatoligi!"); }
  };

  const leaveCall = async () => {
    localTracks?.mic?.close();
    localTracks?.cam?.close();
    await clientRef.current?.leave();
    setLocalTracks(null);
    setRemoteUsers([]);
    setInCall(false);
    setMicOn(true);
    setCamOn(true);
  };

  const toggleMic = () => { localTracks?.mic?.setEnabled(!micOn); setMicOn(!micOn); };
  const toggleCam = () => { localTracks?.cam?.setEnabled(!camOn); setCamOn(!camOn); };

  return (
    <div className="page-transition w-full max-w-3xl mx-auto px-4 py-6 mt-10 flex flex-col h-[calc(100vh-120px)]">

      {/* Header */}
      <div className={`rounded-2xl px-6 py-4 mb-4 flex items-center gap-3 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">💬</div>
        <div>
          <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>Umumiy chat</h2>
          {/* Typing indicator — Telegram uslubi: header ostida */}
          {typingUsers.length > 0 ? (
            <p className="text-xs text-blue-400 flex items-center gap-1">
              <span>{typingUsers[0]?.name} yozyapti</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </p>
          ) : (
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Barcha foydalanuvchilar</p>
          )}
        </div>
        <div className="ml-auto">
          {!inCall ? (
            <button onClick={joinCall} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-xl transition">
              📹 Video
            </button>
          ) : (
            <button onClick={leaveCall} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-xl transition">
              📵 Chiqish
            </button>
          )}
        </div>
      </div>

      {/* Video call */}
      {inCall && (
        <div className={`rounded-2xl p-4 mb-4 shadow ${darkMode ? "bg-slate-900" : "bg-gray-100"}`}>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <div className="w-40 h-28 rounded-xl overflow-hidden bg-black"
                ref={(el) => { if (el && localTracks?.cam) localTracks.cam.play(el); }} />
              <span className="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">👤 Siz</span>
              {!camOn && <div className="absolute inset-0 rounded-xl bg-slate-800 flex items-center justify-center"><span className="text-2xl">📷</span></div>}
            </div>
            {remoteUsers.map((remoteUser) => (
              <div key={remoteUser.uid} className="relative">
                <div className="w-40 h-28 rounded-xl overflow-hidden bg-black"
                  ref={(el) => { if (el && remoteUser.videoTrack) remoteUser.videoTrack.play(el); }} />
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">👤 Mehmon</span>
              </div>
            ))}
            {remoteUsers.length === 0 && (
              <div className={`w-40 h-28 rounded-xl flex items-center justify-center ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}>
                <p className={`text-xs text-center px-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Hali hech kim yo'q</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={toggleMic} className={`px-3 py-1.5 text-white text-xs rounded-xl transition ${micOn ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"}`}>
              {micOn ? "🎤 Ovoz yoq" : "🔇 Ovoz o'chiq"}
            </button>
            <button onClick={toggleCam} className={`px-3 py-1.5 text-white text-xs rounded-xl transition ${camOn ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"}`}>
              {camOn ? "📷 Kamera yoq" : "🚫 Kamera o'chiq"}
            </button>
          </div>
        </div>
      )}

      {/* Xabarlar */}
      <div className={`flex-1 overflow-y-auto rounded-2xl p-4 mb-2 flex flex-col gap-3 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}
        onClick={() => setShowReactions(null)}>
        {messages.length === 0 && (
          <p className={`text-center text-sm my-auto ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Hali xabarlar yo'q. Birinchi bo'lib yozing! 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          return (
            <div key={msg.id} className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                {msg.avatar ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" /> : msg.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.name}</span>}
                <div className="relative">
                  {msg.type === "text" && (
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe ? "bg-blue-500 text-white rounded-br-sm"
                      : darkMode ? "bg-slate-700 text-white rounded-bl-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}>{msg.text}</div>
                  )}
                  {msg.type === "image" && (
                    <div className={`rounded-2xl overflow-hidden ${isMe ? "rounded-br-sm" : "rounded-bl-sm"}`}>
                      <img src={msg.imageUrl} alt="rasm"
                        className="max-w-[240px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => setPreviewImage(msg.imageUrl)} />
                    </div>
                  )}

                  {/* Hover amallar */}
                  <div className={`absolute top-0 ${isMe ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} hidden group-hover:flex items-center gap-1`}>
                    <button onClick={(e) => { e.stopPropagation(); setShowReactions(showReactions === msg.id ? null : msg.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-200 hover:bg-gray-300"}`}>
                      😊
                    </button>
                    {isMe && (
                      <button onClick={() => handleDelete(msg.id, msg.uid)}
                        className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white text-xs transition">
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Reaction picker */}
                  {showReactions === msg.id && (
                    <div onClick={(e) => e.stopPropagation()}
                      className={`absolute bottom-full mb-1 ${isMe ? "right-0" : "left-0"} flex gap-1 p-2 rounded-2xl shadow-xl z-50 ${darkMode ? "bg-slate-700" : "bg-white border border-gray-100"}`}>
                      {REACTIONS.map((emoji) => (
                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}
                          className="text-xl hover:scale-125 transition-transform">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactionlar */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(msg.reactions).map(([emoji, uids]) =>
                      uids.length > 0 ? (
                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs transition ${
                            uids.includes(user.uid) ? "bg-blue-500 text-white" : darkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-700"
                          }`}>
                          {emoji} {uids.length}
                        </button>
                      ) : null
                    )}
                  </div>
                )}

                <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                  {msg.createdAt?.toDate?.()?.toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" }) || ""}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
          {imageUploading ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : "📎"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <input
          type="text"
          placeholder="Xabar yozing..."
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
        />
        <button onClick={handleSend} disabled={!text.trim()}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition">
          ➤
        </button>
      </div>

      {/* Rasm preview */}
      {previewImage && (
        <div className="fixed inset-0 z-9999 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="preview" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white text-3xl hover:opacity-70">✕</button>
        </div>
      )}
    </div>
  );
};

export default Chat;