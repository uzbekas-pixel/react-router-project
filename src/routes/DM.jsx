import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, deleteDoc, doc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { useNavigate } from "react-router-dom";
import {
  LuSend, LuPaperclip, LuMic, LuKeyboard,
  LuArrowLeft, LuTrash2, LuMessageSquare, LuUser, LuSearch, LuCheck, LuCheckCheck
} from "react-icons/lu";
import { getNameStyleByKey } from "../constants/shopConstants";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";
const MSG_EXPIRE = 24 * 60 * 60 * 1000;

const DM = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputMode, setInputMode] = useState("text");
  const [recording, setRecording] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesContainerRef = useRef(null);
  const fileInputRef         = useRef(null);
  const mediaRecorderRef     = useRef(null);
  const audioChunksRef       = useRef([]);
  const messagesEndRef       = useRef(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== user.uid);
      setUsers(list);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "dmMessages"),
      where("toUid", "==", user.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const counts = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const senderId = data.uid;
        counts[senderId] = (counts[senderId] || 0) + 1;
      });
      setUnreadCounts(counts);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    const dmId = [user.uid, selectedUser.id].sort().join("_");
    const q = query(
      collection(db, "dmMessages"),
      where("dmId", "==", dmId),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const list = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        const created = data.createdAt?.toDate?.()?.getTime?.();
        if (created && now - created > MSG_EXPIRE) {
          deleteDoc(doc(db, "dmMessages", d.id)).catch(() => {});
        } else {
          list.push({ id: d.id, ...data });
        }
      });
      setMessages(list);
    });
    return () => unsub();
  }, [selectedUser, user]);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const markAsRead = async () => {
      const q = query(
        collection(db, "dmMessages"),
        where("dmId", "==", [user.uid, selectedUser.id].sort().join("_")),
        where("toUid", "==", user.uid),
        where("read", "==", false)
      );
      const snap = await import("firebase/firestore").then(({ getDocs }) => getDocs(q));
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
    };

    markAsRead();
  }, [selectedUser, messages, user]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getDmId = () => [user.uid, selectedUser.id].sort().join("_");

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    const sendText = text;
    setText("");
    await addDoc(collection(db, "dmMessages"), {
      dmId:      getDmId(),
      text:      sendText,
      uid:       user.uid,
      toUid:     selectedUser.id,
      read:      false,
      name:      user.displayName || user.email,
      avatar:    user.photoURL || null,
      type:      "text",
      createdAt: serverTimestamp(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    if (file.size > 5 * 1024 * 1024) { showToast(t.imageSizeError, "error"); return; }
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.success) throw new Error();
      await addDoc(collection(db, "dmMessages"), {
        dmId:      getDmId(),
        text:      "",
        imageUrl:  data.data.url,
        uid:       user.uid,
        toUid:     selectedUser.id,
        read:      false,
        name:      user.displayName || user.email,
        avatar:    user.photoURL || null,
        type:      "image",
        createdAt: serverTimestamp(),
      });
    } catch { showToast(t.imageError, "error"); }
    finally { setImageUploading(false); e.target.value = ""; }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current   = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size > 1 * 1024 * 1024) { showToast(t.audioSizeError, "error"); stream.getTracks().forEach((t) => t.stop()); return; }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          await addDoc(collection(db, "dmMessages"), {
            dmId:      getDmId(),
            text:      "",
            audioData: reader.result,
            uid:       user.uid,
            toUid:     selectedUser.id,
            read:      false,
            name:      user.displayName || user.email,
            avatar:    user.photoURL || null,
            type:      "audio",
            createdAt: serverTimestamp(),
          });
        };
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { showToast(t.micError, "error"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const handleDeleteMsg = async (msgId, msgUid) => {
    if (msgUid !== user.uid && !isAdmin) return;
    await deleteDoc(doc(db, "dmMessages", msgId));
  };

  const filteredUsers = users.filter((u) =>
    (u.displayName || u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const selectUser = (u) => {
    setSelectedUser(u);
    setMobileView("chat");
  };

  const backToList = () => {
    setMobileView("list");
    setSelectedUser(null);
    setMessages([]);
  };

  // в”Ђв”Ђ Users list в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const usersListJSX = (
    <div className={`flex flex-col h-full ${darkMode ? "bg-slate-800" : "bg-white"} rounded-2xl shadow overflow-hidden`}>
      <div className={`p-3 border-b shrink-0 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
        <div className="relative">
          <LuSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-500" : "text-gray-400"}`} size={14} />
          <input
            type="text"
            placeholder={t.searchPlaceholderChat}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none ${
              darkMode ? "bg-slate-700 text-white placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className={`text-center text-sm py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {t.noUsersFound}
          </p>
        ) : (
          filteredUsers.map((u) => {
            const unread = unreadCounts[u.id] || 0;
            const isSelected = selectedUser?.id === u.id;
            return (
              <button key={u.id} onClick={() => selectUser(u)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition relative ${
                  isSelected
                    ? darkMode ? "bg-slate-700" : "bg-blue-50"
                    : darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                }`}>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0" {...getNameStyleByKey(u.nameColor)}>
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : u.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  {unread > 0 && (
                    <span style={{
                      position: "absolute",
                      top: -3, right: -3,
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: `2px solid ${darkMode ? "#1e293b" : "#fff"}`,
                      lineHeight: 1,
                    }}>
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>

                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      unread > 0
                        ? "font-bold " + (darkMode ? "text-white" : "text-gray-899")
                        : "font-semibold " + (darkMode ? "text-white" : "text-gray-900")
                    }`} {...getNameStyleByKey(u.nameColor)}>
                      {u.displayName || u.email}
                    </p>
                    {unread > 0 && !isSelected && (
                      <span style={{
                        background: "#3b82f6",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        minWidth: 20,
                        height: 20,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 5px",
                        flexShrink: 0,
                        marginLeft: 6,
                      }}>
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // в”Ђв”Ђ Chat area в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const chatAreaJSX = (
    <div className={`flex flex-col h-full ${darkMode ? "bg-slate-800" : "bg-white"} rounded-2xl shadow overflow-hidden`}>
      {selectedUser ? (
        <>
          {/* Header */}
          <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
            <button onClick={backToList}
              className={`md:hidden w-8 h-8 flex items-center justify-center rounded-xl shrink-0 ${darkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-600"}`}>
              <LuArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
              {selectedUser.avatarUrl
                ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" {...getNameStyleByKey(selectedUser.nameColor)}/>
                : selectedUser.displayName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              {/* Ism — bosiladigan, profilga o'tadi */}
              <p
                onClick={() => navigate(`/profile/${selectedUser.id}`)}
                className={`text-sm font-semibold truncate cursor-pointer hover:text-blue-400 transition ${darkMode ? "text-white" : "text-gray-900"}`}
                title={t.viewProfile} {...getNameStyleByKey(selectedUser.nameColor)}
              >
                {selectedUser.displayName || selectedUser.email}
              </p>
              <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedUser.email}</p>
            </div>
            {/* Profil tugmasi */}
            <button
              onClick={() => navigate(`/profile/${selectedUser.id}`)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 ${darkMode ? "bg-slate-700 text-blue-400 hover:bg-slate-600" : "bg-blue-50 text-blue-500 hover:bg-blue-100"}`}
              title={t.viewProfile}
            >
              <LuUser size={15} />
            </button>
            {selectedUser.isOnline && (
              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }}/>
                <span style={{ fontSize:11, color:"#10b981", fontWeight:600 }}>{t.statusOnline}</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 chat-scroll">
            {messages.length === 0 && (
              <p className={`text-center text-sm my-auto ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <LuMessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                {t.noMessages}
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.uid === user.uid;
              return (
                <div key={msg.id} className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar — bosiladigan (boshqa odam bo'lsa) */}
                  <div
                    onClick={() => !isMe && navigate(`/profile/${msg.uid}`)}
                    className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0"
                    style={{ cursor: isMe ? "default" : "pointer" }}
                  >
                    {msg.avatar
                      ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                      : msg.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                    {msg.type === "text" && (
                      <div className={`px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : darkMode ? "bg-slate-700 text-white rounded-bl-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}>{msg.text}</div>
                    )}
                    {msg.type === "image" && (
                      <img src={msg.imageUrl} alt={t.imageRef}
                        className="max-w-[200px] max-h-[200px] object-cover rounded-2xl cursor-pointer hover:opacity-90 transition" />
                    )}
                    {msg.type === "audio" && (
                      <div className={`px-3 py-2 rounded-2xl ${isMe ? "bg-blue-500 rounded-br-sm" : darkMode ? "bg-slate-700 rounded-bl-sm" : "bg-gray-100 rounded-bl-sm"}`}>
                        <audio controls src={msg.audioData} className="h-8 w-44 max-w-full" />
                      </div>
                    )}
                    {(isMe || isAdmin) && (
                      <button onClick={() => handleDeleteMsg(msg.id, msg.uid)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-300 transition mt-0.5 flex items-center gap-1">
                        <LuTrash2 size={12} />
                      </button>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                        {msg.createdAt?.toDate?.()?.toLocaleTimeString("uz", { hour:"2-digit", minute:"2-digit" }) || ""}
                      </span>
                      {isMe && (
                        <span style={{ fontSize:10, color: msg.read ? "#3b82f6" : "#6b7280" }}>
                          {msg.read ? <LuCheckCheck className="inline" /> : <LuCheck className="inline" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`px-3 py-3 border-t flex items-center gap-2 shrink-0 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
            <button onClick={() => setInputMode(inputMode === "text" ? "voice" : "text")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                inputMode === "voice" ? "bg-blue-500 text-white"
                : darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}>
              {inputMode === "text" ? <LuMic size={18} /> : <LuKeyboard size={18} />}
            </button>

            {inputMode === "text" ? (
              <>
                <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
                  {imageUploading ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <LuPaperclip size={17} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <input
                  type="text"
                  placeholder={t.messagePlaceholderChat}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`flex-1 min-w-0 px-3 py-2 rounded-xl text-sm outline-none ${
                    darkMode ? "bg-slate-700 text-white placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button onClick={handleSend} disabled={!text.trim()}
                  className="w-9 h-9 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition">
                  <LuSend size={16} />
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
                  className={`w-14 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                    recording ? "bg-red-500 text-white animate-pulse" : "bg-blue-500 hover:bg-blue-400 text-white"
                  }`}>
                  <LuMic size={18} />
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <LuMessageSquare size={64} className="text-blue-500 opacity-20" />
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t.selectUserPrompt}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-transition w-full max-w-5xl mx-auto px-4 py-6 mt-10"
      style={{ height: "calc(100vh - 130px)" }}>
      <div className="flex items-center gap-3 mb-4">
        <h1 className={`text-2xl font-extrabold flex items-center gap-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
          <LuMessageSquare className="text-blue-500" /> {t.dmTitle}
        </h1>
        {totalUnread > 0 && (
          <span style={{
            background: "#ef4444",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 12,
          }}>
            {totalUnread} {t.newSuffix}
          </span>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex gap-4" style={{ height: "calc(100% - 56px)" }}>
        <div className="w-72 shrink-0">{usersListJSX}</div>
        <div className="flex-1">{chatAreaJSX}</div>
      </div>

      {/* Mobil */}
      <div className="md:hidden" style={{ height: "calc(100% - 56px)" }}>
        {mobileView === "list" ? usersListJSX : chatAreaJSX}
      </div>
    </div>
  );
};

export default DM;
