import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";

const DM = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Foydalanuvchilarni yuklash
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== user.uid);
      setUsers(list);
    });
    return () => unsub();
  }, [user]);

  // DM xabarlarini yuklash
  useEffect(() => {
    if (!selectedUser) return;
    const dmId = [user.uid, selectedUser.id].sort().join("_");
    const q = query(
      collection(db, "dmMessages"),
      where("dmId", "==", dmId),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDmId = () => [user.uid, selectedUser.id].sort().join("_");

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    const sendText = text;
    setText("");
    await addDoc(collection(db, "dmMessages"), {
      dmId: getDmId(),
      text: sendText,
      uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || null,
      type: "text",
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
        dmId: getDmId(),
        text: "",
        imageUrl: data.data.url,
        uid: user.uid,
        name: user.displayName || user.email,
        avatar: user.photoURL || null,
        type: "image",
        createdAt: serverTimestamp(),
      });
    } catch { showToast(t.imageError, "error"); }
    finally { setImageUploading(false); e.target.value = ""; }
  };

  const filteredUsers = users.filter((u) =>
    (u.displayName || u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`page-transition w-full max-w-5xl mx-auto px-4 py-6 mt-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"} min-h-[calc(100vh-64px)]`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        💬 Direct Messages
      </h1>

      <div className="flex gap-4 h-[calc(100vh-200px)]">

        {/* Users list */}
        <div className={`w-72 shrink-0 rounded-2xl shadow overflow-hidden flex flex-col ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          {/* Search */}
          <div className="p-3 border-b border-slate-700">
            <input
              type="text"
              placeholder="🔍 Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm outline-none ${
                darkMode ? "bg-slate-700 text-white placeholder-gray-500" : "bg-gray-100 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className={`text-center text-sm py-8 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Foydalanuvchilar yo'q
              </p>
            ) : (
              filteredUsers.map((u) => (
                <button key={u.id} onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                    selectedUser?.id === u.id
                      ? darkMode ? "bg-slate-700" : "bg-blue-50"
                      : darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                  }`}>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : u.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {u.displayName || u.email}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 rounded-2xl shadow flex flex-col overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div className={`flex items-center gap-3 px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {selectedUser.avatarUrl
                    ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : selectedUser.displayName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedUser.displayName || selectedUser.email}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedUser.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className={`text-center text-sm my-auto ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Hali xabar yo'q. Birinchi xabar yuboring! 👋
                  </p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.uid === user.uid;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {msg.avatar
                          ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                          : msg.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                        {msg.type === "text" && (
                          <div className={`px-4 py-2 rounded-2xl text-sm ${
                            isMe ? "bg-blue-500 text-white rounded-br-sm"
                            : darkMode ? "bg-slate-700 text-white rounded-bl-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}>{msg.text}</div>
                        )}
                        {msg.type === "image" && (
                          <img src={msg.imageUrl} alt="rasm"
                            className="max-w-[240px] max-h-[200px] object-cover rounded-2xl cursor-pointer hover:opacity-90 transition" />
                        )}
                        <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                          {msg.createdAt?.toDate?.()?.toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" }) || ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={`px-4 py-3 border-t flex items-center gap-3 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                <button onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
                  {imageUploading ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : "📎"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <input type="text" placeholder={t.messagePlaceholderChat} value={text}
                  onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
                  className={`flex-1 bg-transparent outline-none text-sm ${darkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`} />
                <button onClick={handleSend} disabled={!text.trim()}
                  className="w-9 h-9 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition">
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="text-5xl">💬</div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Chap tomonda foydalanuvchi tanlang
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DM;