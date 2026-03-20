import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";
const STORY_EXPIRE = 24 * 60 * 60 * 1000;
const STORY_DURATION = 5000; // 5 soniya

const Story = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [stories, setStories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const timerRef = useRef(null);
  const commentInputRef = useRef(null);
  const videoRef = useRef(null);
  const pausedRef = useRef(false);
  const holdTimer = useRef(null);

  // Admin tekshirish
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  // Storiylarni yuklash
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "stories"), orderBy("createdAt", "desc")),
      (snap) => {
        const now = Date.now();
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((s) => {
            if (!s.createdAt) return true;
            const created = s.createdAt?.toDate?.()?.getTime?.() ?? Date.now();
            return now - created < STORY_EXPIRE;
          });
        setStories(list);
        snap.docs.forEach((d) => {
          const created = d.data().createdAt?.toDate?.()?.getTime?.();
          if (created && now - created >= STORY_EXPIRE) {
            deleteDoc(doc(db, "stories", d.id)).catch(() => {});
          }
        });
      }
    );
    return () => unsub();
  }, []);

  // Commentlarni yuklash
  useEffect(() => {
    if (!viewing) { setComments([]); return; }
    const storyId = viewing[viewIndex]?.id;
    if (!storyId) return;
    const unsub = onSnapshot(
      query(collection(db, "storyComments"), orderBy("createdAt")),
      (snap) => {
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.storyId === storyId));
      }
    );
    return () => unsub();
  }, [viewing, viewIndex]);

  // Rasm yuklash
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1080 * 2400) { showToast(t.imageSizeError, "error"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error();
      await addDoc(collection(db, "stories"), {
        imageUrl: data.data.url,
        mediaType: "image",
        uid: user.uid,
        name: user.displayName || user.email,
        avatar: user.photoURL || null,
        likes: [],
        createdAt: serverTimestamp(),
      });
      showToast("Story qo'shildi! 🎉", "success");
    } catch { showToast(t.imageError, "error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  // Video yuklash — base64 sifatida Firestore ga
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1000 * 1080 * 2400) { showToast("Video 1000MB dan kichik bo'lishi kerak!", "error"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        await addDoc(collection(db, "stories"), {
          videoData: reader.result,
          mediaType: "video",
          uid: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL || null,
          likes: [],
          createdAt: serverTimestamp(),
        });
        showToast("Video story qo'shildi! 🎉", "success");
        setUploading(false);
      };
    } catch { showToast("Xatolik yuz berdi!", "error"); setUploading(false); }
    finally { e.target.value = ""; }
  };

  // Like toggle
  const handleLike = async (e) => {
    e.stopPropagation();
    const story = viewing?.[viewIndex];
    if (!story) return;
    const liked = story.likes?.includes(user.uid);
    try {
      await updateDoc(doc(db, "stories", story.id), {
        likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      setViewing(prev => prev.map((s, i) =>
        i === viewIndex ? {
          ...s,
          likes: liked
            ? (s.likes || []).filter(id => id !== user.uid)
            : [...(s.likes || []), user.uid]
        } : s
      ));
    } catch {console.error}
  };

  // Comment yuborish
  const handleComment = async () => {
    if (!commentText.trim() || !viewing) return;
    const story = viewing[viewIndex];
    const text = commentText;
    setCommentText("");
    await addDoc(collection(db, "storyComments"), {
      storyId: story.id,
      uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || null,
      text,
      createdAt: serverTimestamp(),
    });
  };

  // Comment o'chirish
  const handleDeleteComment = async (commentId) => {
    await deleteDoc(doc(db, "storyComments", commentId)).catch(() => {});
  };

  // Story o'chirish
  const handleDeleteStory = async (e) => {
    e.stopPropagation();
    const story = viewing?.[viewIndex];
    if (!story) return;
    await deleteDoc(doc(db, "stories", story.id)).catch(() => {});
    showToast("Story o'chirildi", "success");
    clearInterval(timerRef.current);
    setViewing(null);
    setShowComments(false);
  };

  // Progress boshqaruv
  const startProgress = (userStories, index) => {
    clearInterval(timerRef.current);
    setProgress(0);
    pausedRef.current = false;
    let p = 0;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        if (index + 1 < userStories.length) {
          setViewIndex(index + 1);
          setShowComments(false);
          startProgress(userStories, index + 1);
        } else {
          setViewing(null);
        }
      }
    }, 100);
  };

  const openStory = (userStories, index = 0) => {
    setViewing(userStories);
    setViewIndex(index);
    setProgress(0);
    setShowComments(false);
    setPaused(false);
    startProgress(userStories, index);
  };

  // Pause / Resume
  const pauseStory = () => {
    pausedRef.current = true;
    setPaused(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const resumeStory = () => {
    pausedRef.current = false;
    setPaused(false);
    if (videoRef.current) videoRef.current.play();
  };

  // PC: click = pause/resume toggle
  const handleMediaClick = (e) => {
    e.stopPropagation();
    if (showComments) return;
    if (paused) resumeStory();
    else pauseStory();
  };

  // Telefon: bosib tursa pause, qo'ysa resume
  const handleTouchStart = (e) => {
    e.stopPropagation();
    holdTimer.current = setTimeout(() => pauseStory(), 100);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    clearTimeout(holdTimer.current);
    if (paused) resumeStory();
  };

  // Comment panel ochish
  const toggleComments = (e) => {
    e.stopPropagation();
    if (!showComments) {
      pauseStory();
    } else {
      resumeStory();
    }
    setShowComments(!showComments);
    setTimeout(() => commentInputRef.current?.focus(), 150);
  };

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);

  const grouped = stories.reduce((acc, story) => {
    if (!acc[story.uid]) acc[story.uid] = { uid: story.uid, name: story.name, avatar: story.avatar, stories: [] };
    acc[story.uid].stories.push(story);
    return acc;
  }, {});

  const groupedList = Object.values(grouped);
  const myStories = grouped[user.uid]?.stories || [];
  const currentStory = viewing?.[viewIndex];
  const isLiked = currentStory?.likes?.includes(user.uid);
  const likeCount = currentStory?.likes?.length || 0;
  const canDelete = currentStory?.uid === user.uid || isAdmin;

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 py-6 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        📸 Stories
      </h1>

      {/* Story ro'yxati */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">

        {/* O'z story */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => myStories.length > 0 ? openStory(myStories) : null}
              className={`relative w-16 h-16 rounded-full border-2 ${
                myStories.length > 0 ? "border-blue-500" : "border-dashed border-gray-400"
              } flex items-center justify-center overflow-hidden transition`}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {user.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
            {/* + tugmasi */}
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow transition">
              +
            </button>
          </div>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {myStories.length > 0 ? "Sizning" : "Qo'shish"}
          </span>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
        <input ref={videoInputRef} type="file" accept="video/*" onChange={handleUploadVideo} className="hidden" />

        {/* Boshqalar */}
        {groupedList.filter((g) => g.uid !== user.uid).map((group) => (
          <div key={group.uid} className="flex flex-col items-center gap-2 shrink-0">
            <button onClick={() => openStory(group.stories)}
              className="w-16 h-16 rounded-full border-2 border-blue-500 flex items-center justify-center overflow-hidden transition">
              {group.avatar
                ? <img src={group.avatar} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {group.name?.[0]?.toUpperCase() || "?"}
                  </div>
              }
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

      {/* Media tanlash tugmalari */}
      <div className="flex gap-3 mb-2">
        <button onClick={() => fileInputRef.current?.click()}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
          📷 Rasm yuklash
        </button>
        <button onClick={() => videoInputRef.current?.click()}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
          🎥 Video yuklash
        </button>
      </div>

      {/* Story viewer — to'liq vertikal */}
      {viewing && (
        <div className="fixed inset-0 z-9999 bg-black flex items-center justify-center">
          {/* Orqa fon bosilganda yopilsin */}
          <div className="absolute inset-0" onClick={() => {
            if (showComments) return;
            clearInterval(timerRef.current);
            setViewing(null);
          }} />

          {/* Vertikal story container */}
          <div className="relative w-full max-w-[400px] h-full flex flex-col"
            style={{ maxHeight: "100dvh" }}>

            {/* Progress bars */}
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              {viewing.map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-none"
                    style={{ width: i < viewIndex ? "100%" : i === viewIndex ? `${progress}%` : "0%" }} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white/50">
                  {currentStory?.avatar
                    ? <img src={currentStory.avatar} alt="" className="w-full h-full object-cover" />
                    : currentStory?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-white text-sm font-semibold drop-shadow">{currentStory?.name}</span>
                {paused && <span className="text-white/60 text-xs">⏸</span>}
              </div>
              <div className="flex items-center gap-3">
                {canDelete && (
                  <button onClick={handleDeleteStory} className="text-white/70 hover:text-red-400 transition">
                    🗑️
                  </button>
                )}
                <button onClick={() => { clearInterval(timerRef.current); setViewing(null); setShowComments(false); }}
                  className="text-white text-2xl hover:opacity-70 drop-shadow">✕</button>
              </div>
            </div>

            {/* Media — to'liq balandlik */}
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer select-none"
              onClick={handleMediaClick}
              onMouseDown={(e) => { e.stopPropagation(); }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentStory?.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={currentStory.videoData}
                  autoPlay
                  playsInline
                  muted={false}
                  loop={false}
                  className="w-full h-full object-contain"
                  onEnded={() => {
                    if (viewIndex + 1 < viewing.length) {
                      setViewIndex(viewIndex + 1);
                      setShowComments(false);
                      startProgress(viewing, viewIndex + 1);
                    } else {
                      setViewing(null);
                    }
                  }}
                />
              ) : (
                <img
                  src={currentStory?.imageUrl}
                  alt="story"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              )}
            </div>

            {/* Prev/Next zones — faqat chetlarda */}
            <button className="absolute left-0 top-16 bottom-24 w-12 z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (viewIndex > 0) { setViewIndex(viewIndex - 1); setShowComments(false); startProgress(viewing, viewIndex - 1); }
                else { clearInterval(timerRef.current); setViewing(null); }
              }} />
            <button className="absolute right-0 top-16 bottom-24 w-12 z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (viewIndex + 1 < viewing.length) { setViewIndex(viewIndex + 1); setShowComments(false); startProgress(viewing, viewIndex + 1); }
                else { clearInterval(timerRef.current); setViewing(null); }
              }} />

            {/* Like & Comment */}
            <div className="absolute bottom-5 left-4 right-4 z-20 flex items-center gap-3">
              <button onClick={handleLike}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/50 text-white text-sm font-semibold backdrop-blur-sm transition hover:bg-black/70 active:scale-95">
                <span className={`text-lg transition-all duration-200 ${isLiked ? "scale-125" : "scale-100"}`}>
                  {isLiked ? "❤️" : "🤍"}
                </span>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>

              <button onClick={toggleComments}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold backdrop-blur-sm transition active:scale-95 ${
                  showComments ? "bg-blue-500/80" : "bg-black/50 hover:bg-black/70"
                }`}>
                <span className="text-lg">💬</span>
                {comments.length > 0 && <span>{comments.length}</span>}
              </button>
            </div>

            {/* Comment panel */}
            {showComments && (
              <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md rounded-t-2xl flex flex-col"
                style={{ maxHeight: "55%" }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-white text-sm font-semibold">💬 Izohlar ({comments.length})</span>
                  <button onClick={toggleComments} className="text-white/60 hover:text-white text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                  {comments.length === 0 ? (
                    <p className="text-white/50 text-xs text-center py-4">Hali izoh yo'q. Birinchi bo'ling! 💬</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2 group">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                          {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : c.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-blue-300 text-xs font-semibold mr-2">{c.name}</span>
                          <span className="text-white text-sm wrap-break-words">{c.text}</span>
                        </div>
                        {(c.uid === user.uid || isAdmin) && (
                          <button onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 text-xs transition shrink-0 mt-0.5">
                            🗑️
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10">
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder={t.commentPlaceholder}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleComment()}
                    className="flex-1 bg-white/10 text-white placeholder-white/40 text-sm px-3 py-2 rounded-xl outline-none focus:bg-white/15 transition"
                  />
                  <button onClick={handleComment} disabled={!commentText.trim()}
                    className="w-9 h-9 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shrink-0">
                    ➤
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;