import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, rtdb } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import AgoraRTC from "agora-rtc-sdk-ng";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useChatSound } from "../hooks/useChatSound";

const APP_ID = "2c3941d0b08d4c01b2735b6259550335";
const TOKEN = null;
const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";
const REACTIONS = ["❤️", "😂", "👍", "😮", "😢"];
const MSG_EXPIRE = 24 * 60 * 60 * 1000;

const Chat = ({ darkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [longPressMsg, setLongPressMsg] = useState(null);
  const [recording, setRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [inputMode, setInputMode] = useState("text");
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("chat_sound") !== "false");
  const { playMessage, playSend, playNotification } = useChatSound(soundOn);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const prevLengthRef = useRef(0);
  const longPressTimer = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [inCall, setInCall] = useState(false);
  const [localTracks, setLocalTracks] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const clientRef = useRef(null);

  // Admin tekshirish
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  // Xabarlarni yuklash + 24 soat eski xabarlarni o'chirish
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const list = [];

      snap.docs.forEach((d) => {
        const data = d.data();
        const created = data.createdAt?.toDate?.()?.getTime?.();

        // 24 soatdan eski bo'lsa o'chir
        if (created && now - created > MSG_EXPIRE) {
          deleteDoc(doc(db, "messages", d.id)).catch(() => {});
        } else {
          list.push({ id: d.id, ...data });
        }
      });

      setMessages(list);
    });
    return () => unsub();
  }, []);

  // Oxirgi xabarga scroll + ovoz
  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      // Faqat boshqalar xabariga ovoz
      const lastMsg = messages[messages.length - 1];
      if (prevLengthRef.current > 0 && lastMsg && lastMsg.uid !== user?.uid) {
        playMessage();
      }
    }
    prevLengthRef.current = messages.length;
  }, [messages, user, playMessage]);

  useEffect(() => {
    const onlineRef = ref(rtdb, "online");
    const unsub = onValue(onlineRef, (snap) => { setOnlineUsers(snap.val() || {}); });
    return () => unsub();
  }, []);

  const handleLongPress = (msgId) => { longPressTimer.current = setTimeout(() => setLongPressMsg(msgId), 500); };
  const handleLongPressEnd = () => clearTimeout(longPressTimer.current);
  const handleTyping = (e) => setText(e.target.value);

  const handleSend = async () => {
    if (!text.trim()) return;
    const sendText = text;
    const replyData = replyTo;
    setText("");
    setReplyTo(null);
    playSend();
    await addDoc(collection(db, "messages"), {
      text: sendText, uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || null,
      type: "text", reactions: {},
      replyTo: replyData || null,
      createdAt: serverTimestamp(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // O'z xabarini o'chirish + admin istalgan xabarni o'chira oladi
  const handleDelete = async (msgId, msgUid) => {
    if (msgUid !== user.uid && !isAdmin) return;
    await deleteDoc(doc(db, "messages", msgId));
    setLongPressMsg(null);
  };

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
    setLongPressMsg(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(t.imageSizeError); return; }
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.success) throw new Error();
      await addDoc(collection(db, "messages"), {
        text: "", imageUrl: data.data.url,
        uid: user.uid, name: user.displayName || user.email,
        avatar: user.photoURL || null,
        type: "image", reactions: {},
        createdAt: serverTimestamp(),
      });
    } catch { alert(t.imageError); }
    finally { setImageUploading(false); e.target.value = ""; }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 1 * 1024 * 1024) { alert(t.audioSizeError); stream.getTracks().forEach((tr) => tr.stop()); return; }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          await addDoc(collection(db, "messages"), {
            text: "", audioData: reader.result,
            uid: user.uid, name: user.displayName || user.email,
            avatar: user.photoURL || null,
            type: "audio", reactions: {},
            createdAt: serverTimestamp(),
          });
        };
        stream.getTracks().forEach((tr) => tr.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { alert(t.micError); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const joinCall = async () => {
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === "audio") remoteUser.audioTrack?.play();
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
    } catch { alert(t.videoError); }
  };

  const leaveCall = async () => {
    localTracks?.mic?.close(); localTracks?.cam?.close();
    await clientRef.current?.leave();
    setLocalTracks(null); setRemoteUsers([]); setInCall(false); setMicOn(true); setCamOn(true);
  };

  const toggleMic = () => { localTracks?.mic?.setEnabled(!micOn); setMicOn(!micOn); };
  const toggleCam = () => { localTracks?.cam?.setEnabled(!camOn); setCamOn(!camOn); };

  return (
    <div className="page-transition w-full max-w-3xl mx-auto px-4 py-6 mt-10 flex flex-col h-[calc(100vh-120px)] overflow-hidden">

      {/* Header */}
      <div className={`rounded-2xl px-6 py-4 mb-4 flex items-center gap-3 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">💬</div>
        <div>
          <h2 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>{t.chatTitle}</h2>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.chatSub}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Ovoz on/off */}
          <button onClick={() => {
            const next = !soundOn;
            setSoundOn(next);
            localStorage.setItem("chat_sound", next);
            if (next) playNotification();
          }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition text-lg ${
              darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={soundOn ? "Ovozni o'chirish" : "Ovozni yoqish"}>
            {soundOn ? "🔔" : "🔕"}
          </button>
          {!inCall ? (
            <button onClick={joinCall} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-xl transition">
              {t.videoCall}
            </button>
          ) : (
            <button onClick={leaveCall} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-semibold rounded-xl transition">
              {t.leaveCall}
            </button>
          )}
          <button onClick={() => navigate("/dm")}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition ${
              darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            ✉️ DM
          </button>
        </div>
      </div>

      {/* Video call */}
      {inCall && (
        <div className={`rounded-2xl p-4 mb-4 shadow ${darkMode ? "bg-slate-900" : "bg-gray-100"}`}>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <div className="w-40 h-28 rounded-xl overflow-hidden bg-black"
                ref={(el) => { if (el && localTracks?.cam) localTracks.cam.play(el); }} />
              <span className="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">👤 {t.you}</span>
              {!camOn && <div className="absolute inset-0 rounded-xl bg-slate-800 flex items-center justify-center"><span className="text-2xl">📷</span></div>}
            </div>
            {remoteUsers.map((remoteUser) => (
              <div key={remoteUser.uid} className="relative">
                <div className="w-40 h-28 rounded-xl overflow-hidden bg-black"
                  ref={(el) => { if (el && remoteUser.videoTrack) remoteUser.videoTrack.play(el); }} />
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">👤 {t.guest}</span>
              </div>
            ))}
            {remoteUsers.length === 0 && (
              <div className={`w-40 h-28 rounded-xl flex items-center justify-center ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}>
                <p className={`text-xs text-center px-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t.noOneYet}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={toggleMic} className={`px-3 py-1.5 text-white text-xs rounded-xl transition ${micOn ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"}`}>
              {micOn ? t.micOn : t.micOff}
            </button>
            <button onClick={toggleCam} className={`px-3 py-1.5 text-white text-xs rounded-xl transition ${camOn ? "bg-slate-600 hover:bg-slate-500" : "bg-red-500 hover:bg-red-400"}`}>
              {camOn ? t.camOn : t.camOff}
            </button>
          </div>
        </div>
      )}

      {/* Xabarlar */}
      <div
        ref={messagesContainerRef}
        className={`chat-scroll flex-1 overflow-y-auto rounded-2xl p-4 mb-2 flex flex-col gap-3 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}
        onClick={() => { setShowReactions(null); setLongPressMsg(null); }}>
        {messages.length === 0 && (
          <p className={`text-center text-sm my-auto ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {t.noMessages}
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.uid === user?.uid;
          const canDelete = isMe || isAdmin;
          return (
            <div key={msg.id}
              className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
              onTouchStart={() => handleLongPress(msg.id)}
              onTouchEnd={handleLongPressEnd}
              onTouchMove={handleLongPressEnd}
              onContextMenu={(e) => e.preventDefault()}>
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {msg.avatar ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" /> : msg.name?.[0]?.toUpperCase() || "?"}
                </div>
                {onlineUsers[msg.uid]?.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>

              <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.name}</span>}
                <div className="relative">
                  {/* Reply preview xabar ichida */}
                  {msg.replyTo && (
                    <div className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-blue-400 ${
                      isMe ? "bg-blue-600/40 text-blue-100" : darkMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-600"
                    }`}>
                      <span className="font-semibold text-blue-400">{msg.replyTo.name}</span>
                      <p className="truncate mt-0.5">
                        {msg.replyTo.type === "image" ? "📷 Rasm" : msg.replyTo.type === "audio" ? "🎙️ Ovozli xabar" : msg.replyTo.text}
                      </p>
                    </div>
                  )}
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
                  {msg.type === "audio" && (
                    <div className={`px-3 py-2 rounded-2xl ${isMe ? "bg-blue-500 rounded-br-sm" : darkMode ? "bg-slate-700 rounded-bl-sm" : "bg-gray-100 rounded-bl-sm"}`}>
                      <audio controls src={msg.audioData} className="h-8 w-48 max-w-full" />
                    </div>
                  )}

                  <div className={`absolute top-0 ${isMe ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} hidden group-hover:flex items-center gap-1`}>
                    {/* Reply tugmasi */}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setReplyTo({ id: msg.id, name: msg.name, text: msg.text, type: msg.type });
                      inputRef.current?.focus();
                    }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-200 hover:bg-gray-300"}`}>
                      ↩️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowReactions(showReactions === msg.id ? null : msg.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-200 hover:bg-gray-300"}`}>
                      😊
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(msg.id, msg.uid)}
                        className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white text-xs transition">
                        🗑️
                      </button>
                    )}
                    {isAdmin && !isMe && (
                      <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-full">A</span>
                    )}
                  </div>

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
      </div>

      {/* Long press menyu */}
      {longPressMsg && (() => {
        const msg = messages.find((m) => m.id === longPressMsg);
        const isMe = msg?.uid === user?.uid;
        const canDelete = isMe || isAdmin;
        return (
          <div className="fixed inset-0 z-9998 bg-black/40 flex items-end justify-center pb-24"
            onClick={() => setLongPressMsg(null)}>
            <div className={`w-full max-w-sm rounded-2xl shadow-xl overflow-hidden mx-4 ${darkMode ? "bg-slate-700" : "bg-white"}`}
              onClick={(e) => e.stopPropagation()}>
              <div className={`flex justify-around p-4 border-b ${darkMode ? "border-slate-600" : "border-gray-100"}`}>
                {REACTIONS.map((emoji) => (
                  <button key={emoji} onClick={() => handleReaction(longPressMsg, emoji)}
                    className="text-2xl hover:scale-125 transition-transform active:scale-110">{emoji}</button>
                ))}
              </div>
              <button onClick={() => {
                setReplyTo({ id: msg.id, name: msg.name, text: msg.text, type: msg.type });
                setLongPressMsg(null);
                inputRef.current?.focus();
              }}
                className={`w-full px-6 py-4 text-sm font-semibold text-left transition flex items-center gap-3 ${darkMode ? "text-gray-300 hover:bg-slate-600" : "text-gray-700 hover:bg-gray-50"}`}>
                ↩️ Javob berish
              </button>
              {canDelete && (
                <button onClick={() => handleDelete(longPressMsg, msg.uid)}
                  className="w-full px-6 py-4 text-red-400 text-sm font-semibold text-left hover:bg-red-500/10 transition flex items-center gap-3">
                  {t.deleteMessage}
                </button>
              )}
              <button onClick={() => setLongPressMsg(null)}
                className={`w-full px-6 py-4 text-sm font-semibold text-left transition flex items-center gap-3 ${darkMode ? "text-gray-400 hover:bg-slate-600" : "text-gray-500 hover:bg-gray-50"}`}>
                {t.cancel}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Input */}
      <div className={`rounded-2xl px-4 py-3 flex flex-col gap-2 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        {/* Reply preview */}
        {replyTo && (
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl border-l-2 border-blue-400 ${darkMode ? "bg-slate-700" : "bg-blue-50"}`}>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-blue-400">{replyTo.name}</span>
              <p className={`text-xs truncate mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {replyTo.type === "image" ? "📷 Rasm" : replyTo.type === "audio" ? "🎙️ Ovozli xabar" : replyTo.text}
              </p>
            </div>
            <button onClick={() => setReplyTo(null)}
              className={`ml-2 text-lg shrink-0 ${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              ✕
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
        <button onClick={() => setInputMode(inputMode === "text" ? "voice" : "text")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
            inputMode === "voice" ? "bg-blue-500 text-white"
            : darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}>
          {inputMode === "text" ? "🎙️" : "⌨️"}
        </button>

        {inputMode === "text" ? (
          <>
            <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
              {imageUploading ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : "📎"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <input ref={inputRef} type="text" placeholder={t.messagePlaceholderChat} value={text}
              onChange={handleTyping} onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`} />
            <button onClick={handleSend} disabled={!text.trim()}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition">
              ➤
            </button>
          </>
        ) : (
          <>
            <div className={`flex-1 flex items-center justify-center rounded-xl py-2 text-sm font-medium ${
              recording ? "bg-red-500/20 text-red-400" : darkMode ? "bg-slate-700 text-gray-400" : "bg-gray-100 text-gray-500"
            }`}>
              {recording ? t.recording : t.holdToRecord}
            </div>
            <button
              onMouseDown={startRecording} onMouseUp={stopRecording}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }} onTouchEnd={stopRecording}
              className={`w-14 h-10 rounded-xl flex items-center justify-center transition ${recording ? "bg-red-500 text-white animate-pulse" : "bg-blue-500 hover:bg-blue-400 text-white"}`}>
              🎙️
            </button>
          </>
        )}
        </div>
      </div>

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