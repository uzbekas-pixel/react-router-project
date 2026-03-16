import { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";
const STORY_EXPIRE = 24 * 60 * 60 * 1000; // 24 soat

const Story = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [stories, setStories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  // Storiylarni yuklash
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "stories"), orderBy("createdAt", "desc")),
      (snap) => {
        const now = Date.now();
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => {
            const created = s.createdAt?.toDate?.()?.getTime() || 0;
            return now - created < STORY_EXPIRE;
          });
        setStories(list);

        // Eskirgan storiylarni o'chirish
        snap.docs.forEach((d) => {
          const created = d.data().createdAt?.toDate?.()?.getTime() || 0;
          if (now - created >= STORY_EXPIRE) {
            deleteDoc(doc(db, "stories", d.id)).catch(() => {});
          }
        });
      }
    );
    return () => unsub();
  }, []);

  // Story yuklash
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast(t.imageSizeError, "error"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.success) throw new Error();
      await addDoc(collection(db, "stories"), {
        imageUrl: data.data.url,
        uid: user.uid,
        name: user.displayName || user.email,
        avatar: user.photoURL || null,
        views: [],
        createdAt: serverTimestamp(),
      });
      showToast("Story qo'shildi! 🎉", "success");
    } catch { showToast(t.imageError, "error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  // Story ko'rish
  const openStory = (userStories, index = 0) => {
    setViewing(userStories);
    setViewIndex(index);
    setProgress(0);
    startProgress(userStories, index);
  };

  const startProgress = (userStories, index) => {
    clearInterval(timerRef.current);
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        if (index + 1 < userStories.length) {
          setViewIndex(index + 1);
          startProgress(userStories, index + 1);
        } else {
          setViewing(null);
        }
      }
    }, 100);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Foydalanuvchilar bo'yicha guruhlash
  const grouped = stories.reduce((acc, story) => {
    if (!acc[story.uid]) acc[story.uid] = { uid: story.uid, name: story.name, avatar: story.avatar, stories: [] };
    acc[story.uid].stories.push(story);
    return acc;
  }, {});

  const groupedList = Object.values(grouped);
  const myStories = grouped[user.uid]?.stories || [];

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 py-6 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        📸 Stories
      </h1>

      {/* Story qo'shish + ko'rish */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
        {/* O'z story */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={() => myStories.length > 0 ? openStory(myStories) : fileInputRef.current?.click()}
            className={`relative w-16 h-16 rounded-full border-2 ${
              myStories.length > 0 ? "border-blue-500" : "border-dashed border-gray-400"
            } flex items-center justify-center overflow-hidden transition hover:scale-105`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {user.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            {!myStories.length && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-2xl">+</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {myStories.length > 0 ? "Sizning" : "Qo'shish"}
          </span>
          {!myStories.length && (
            <button onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-400 hover:underline">+ Story</button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

        {/* Boshqalar */}
        {groupedList.filter((g) => g.uid !== user.uid).map((group) => (
          <div key={group.uid} className="flex flex-col items-center gap-2 shrink-0">
            <button onClick={() => openStory(group.stories)}
              className="w-16 h-16 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden transition hover:scale-105">
              {group.avatar ? (
                <img src={group.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {group.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </button>
            <span className={`text-xs max-w-[64px] truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {group.name?.split(" ")[0] || "User"}
            </span>
          </div>
        ))}

        {groupedList.length === 0 && (
          <div className={`flex items-center justify-center flex-1 py-4 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Hali story yo'q. Birinchi bo'lib qo'shing! 🌟
          </div>
        )}
      </div>

      {/* Story viewer */}
      {viewing && (
        <div className="fixed inset-0 z-9999 bg-black flex items-center justify-center"
          onClick={() => { clearInterval(timerRef.current); setViewing(null); }}>
          <div className="relative w-full max-w-sm h-full max-h-[700px]"
            onClick={(e) => e.stopPropagation()}>

            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
              {viewing.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-none rounded-full"
                    style={{ width: i < viewIndex ? "100%" : i === viewIndex ? `${progress}%` : "0%" }} />
                </div>
              ))}
            </div>

            {/* User info */}
            <div className="absolute top-8 left-4 z-10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {viewing[viewIndex]?.avatar
                  ? <img src={viewing[viewIndex].avatar} alt="" className="w-full h-full object-cover" />
                  : viewing[viewIndex]?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-white text-sm font-semibold">{viewing[viewIndex]?.name}</span>
            </div>

            {/* Close */}
            <button onClick={() => { clearInterval(timerRef.current); setViewing(null); }}
              className="absolute top-8 right-4 z-10 text-white text-2xl hover:opacity-70">✕</button>

            {/* Image */}
            <img src={viewing[viewIndex]?.imageUrl} alt="story"
              className="w-full h-full object-contain rounded-2xl" />

            {/* Prev/Next */}
            <button className="absolute left-0 top-0 bottom-0 w-1/3"
              onClick={(e) => {
                e.stopPropagation();
                if (viewIndex > 0) { setViewIndex(viewIndex - 1); startProgress(viewing, viewIndex - 1); }
                else { clearInterval(timerRef.current); setViewing(null); }
              }} />
            <button className="absolute right-0 top-0 bottom-0 w-1/3"
              onClick={(e) => {
                e.stopPropagation();
                if (viewIndex + 1 < viewing.length) { setViewIndex(viewIndex + 1); startProgress(viewing, viewIndex + 1); }
                else { clearInterval(timerRef.current); setViewing(null); }
              }} />
          </div>
        </div>
      )}

      {/* Story qo'shish tugmasi */}
      <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-xl flex items-center justify-center text-2xl transition">
        {uploading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "📸"}
      </button>
    </div>
  );
};

export default Story;