import React, { useState, useEffect, useMemo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { doc, setDoc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  LuStar, LuUsers, LuGraduationCap, LuSearch, 
  LuHeart, LuBot, LuX, LuPuzzle, LuLaptop, 
  LuMessageSquare, LuRocket, LuArrowRight,
  LuTarget,LuCheck
} from "react-icons/lu";
import CourseDetail from "./CourseDetail";

const categoriesBase = ["HTML", "CSS", "JavaScript", "React", "English", "Russian", "French"];
const catColors = { HTML: "#e44d26", CSS: "#264de4", JavaScript: "#d4a017", React: "#0ea5e9", English: "#003580", Russian: "#c0392b", French: "#002395" };

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <LuStar
        key={s}
        size={12}
        className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
      />
    ))}
  </div>
);

/* ─── CSS injected once for AI Preview Modal ─── */
const AI_PREVIEW_CSS = `
  @keyframes ai-float    { 0%,100%{transform:translateY(0) scale(1)}   50%{transform:translateY(-8px) scale(1.04)} }
  @keyframes ai-ring-out { 0%{box-shadow:0 0 0 0 var(--rc)55}         70%{box-shadow:0 0 0 14px transparent} 100%{box-shadow:0 0 0 0 transparent} }
  @keyframes ai-scan     { 0%{transform:translateY(-100%)}             100%{transform:translateY(400%)} }
  @keyframes ai-slide-up { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  @keyframes ai-dot-blink{ 0%,80%,100%{opacity:0} 40%{opacity:1} }

  .ai-preview-slide { animation: ai-slide-up 0.42s cubic-bezier(.22,.68,0,1.2) both; }
  .ai-preview-feature:hover { transform: translateX(4px); }
  .ai-preview-feature { transition: transform 0.18s ease; }
  .ai-start-btn:hover { filter: brightness(1.12) !important; transform: translateY(-2px) !important; }
  .ai-start-btn { transition: all 0.2s ease !important; }
`;

const AIPreviewModal = ({ course, onClose, darkMode, onDetail, t }) => {
  const accentColor = course.color || "#3b82f6";

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    const id = "__ai-preview-css__";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id; style.textContent = AI_PREVIEW_CSS;
      document.head.appendChild(style);
    }
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const renderStars = (rating) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <LuStar 
          key={s} 
          size={14} 
          style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#374151" }} 
          fill={s <= Math.round(rating) ? "#f59e0b" : "transparent"} 
        />
      ))}
    </div>
  );

  const features = [
    { icon: <LuBot />, label: t.aiTutorLabel, desc: t.aiTutorDesc },
    { icon: <LuLaptop />, label: t.interactiveLabLabel, desc: t.interactiveLabDesc },
    { icon: <LuPuzzle />, label: t.miniQuizLabel, desc: t.miniQuizDesc },
    { icon: <LuMessageSquare />, label: t.aiChatLabel, desc: t.aiChatDesc },
    { icon: <LuBarChart3 />, label: t.progressTrackerLabel, desc: t.progressTrackerDesc },
  ];

  const modalBg   = darkMode ? "#080d1a"        : "#f8fafc";
  const cardBg    = darkMode ? "rgba(15,25,50,.7)" : "rgba(255,255,255,.9)";
  const textMain  = darkMode ? "#f1f5f9"        : "#0f172a";
  const textSub   = darkMode ? "#94a3b8"        : "#64748b";
  const borderC   = darkMode ? "#1e2d45"        : "#e2e8f0";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(12px)" }}
    >
      <div
        className="ai-preview-slide"
        onClick={(e) => e.stopPropagation()}
        style={{ "--rc": accentColor, width: "100%", maxWidth: 500, borderRadius: 26, overflow: "hidden", background: modalBg, boxShadow: `0 0 0 1.5px ${accentColor}55, 0 40px 100px rgba(0,0,0,0.65)` }}
      >
        <div style={{ position: "relative", height: 170, background: `linear-gradient(140deg, ${accentColor}f0 0%, ${accentColor}80 60%, #0a0f1e 100%)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div className="ai-scan" style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`, opacity: 0.6 }} />
          </div>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${accentColor}15 1px, transparent 1px), linear-gradient(90deg, ${accentColor}15 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", textAlign: "center", zIndex: 2 }}>
            <div
              style={{ width: 72, height: 72, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${accentColor}ff, ${accentColor}55)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", animation: "ai-float 3.5s ease-in-out infinite", boxShadow: `0 0 0 3px ${accentColor}44, 0 8px 30px ${accentColor}55`, animationName: "ai-ring-out, ai-float" }}
            >
              <LuBot size={34} color="#fff" />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "0.18em", textTransform: "uppercase", textShadow: `0 0 20px ${accentColor}` }}>
              {t.aiPreviewTitle}
            </div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", animation: `ai-dot-blink 1.4s ${i * 0.22}s ease-in-out infinite` }} />)}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>{t.liveLesson}</span>
            </div>
          </div>
          <span style={{ position: "absolute", bottom: 14, left: 18, background: accentColor, color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 11px", borderRadius: 20, letterSpacing: "0.05em" }}>{course.category}</span>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.45)", border: `1px solid rgba(255,255,255,.15)`, borderRadius: "50%", width: 32, height: 32, color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <LuX />
          </button>
        </div>
        <div style={{ padding: "20px 22px 22px" }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: "0 0 5px", fontSize: 17, fontWeight: 800, color: textMain, lineHeight: 1.3 }}>{t.courseData[course.id]?.title || course.title}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {renderStars(course.rating)}
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{course.rating}</span>
              </span>
            </div>
          </div>
          <div style={{ borderRadius: 16, background: cardBg, border: `1px solid ${borderC}`, padding: "14px 16px", marginBottom: 16, backdropFilter: "blur(10px)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
              <LuTarget className="inline mr-1" /> {t.whatIncluded}
            </div>
            {features.map((f, i) => (
              <div key={i} className="ai-preview-feature" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < features.length - 1 ? `1px solid ${borderC}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accentColor}18`, border: `1px solid ${accentColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, color: accentColor }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: textMain }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: textSub }}>{f.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${accentColor}22`, border: `1px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: accentColor, fontWeight: 800 }}>
                  <LuCheckCircle />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: course.price === 0 ? "#10b981" : accentColor, lineHeight: 1 }}>
                {course.price === 0 ? t.freeLabel : `${course.price.toLocaleString()} ${t.priceLabel}`}
              </div>
              {course.price > 0 && <div style={{ fontSize: 10, color: textSub, marginTop: 2 }}>{t.oneTimePayment}</div>}
            </div>
            <button
              className="ai-start-btn"
              onClick={() => { onDetail(course.id); onClose(); }}
              style={{ padding: "12px 22px", background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, color: "#fff", border: "none", borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 22px ${accentColor}55`, letterSpacing: "0.03em", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}
            >
              <LuRocket /> {t.startLesson}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, isFav, onToggleFav, onPlay, onDetail, darkMode, purchased }) => {
  const { t } = useLang();
  const [hovered, setHovered] = useState(false);
  const localizedTitle = t.courseData[course.id]?.title || course.title;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ 
        borderRadius: 20, 
        overflow: "hidden", 
        background: darkMode ? "rgba(30,41,59,0.7)" : "#fff", 
        backdropFilter: "blur(10px)",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, 
        boxShadow: hovered ? "0 20px 40px -15px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)", 
        transform: hovered ? "translateY(-6px)" : "translateY(0)", 
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
        display: "flex", 
        flexDirection: "column" 
      }}>
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img src={course.thumbnail} alt={localizedTitle} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div onClick={() => onPlay(course)} style={{ position: "absolute", inset: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: hovered ? "rgba(0,0,0,0.4)" : "transparent", transition: "background 0.3s" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "all 0.3s", transform: hovered ? "scale(1)" : "scale(0.8)", fontSize: 24, color: course.color }}>
            <LuBot />
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleFav(course.id); }}
          style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.2s", color: isFav ? "#ef4444" : "#64748b" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <LuHeart className={isFav ? "fill-current" : ""} />
        </button>
        {purchased && (
          <span style={{ position: "absolute", top: 12, left: 12, background: "#10b981", color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 10px rgba(16,185,129,0.3)" }}>
            <LuCheck size={12} /> {t.purchasedLabel}
          </span>
        )}
        <span style={{ position: "absolute", bottom: 12, left: 12, background: course.color, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, boxShadow: `0 4px 12px ${course.color}44` }}>{course.category}</span>
      </div>
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111827", lineHeight: 1.4 }}>{localizedTitle}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars rating={course.rating} />
          <span style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{course.rating}</span>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 13, color: darkMode ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <LuUsers size={16} className="text-blue-500" /> {course.students.toLocaleString()}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"}`, background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", gap: 10 }}>
        <span style={{ fontWeight: 900, fontSize: 17, color: purchased || course.price === 0 ? "#10b981" : "#3b82f6", display: "flex", alignItems: "center", gap: 6 }}>
          {purchased ? (
            <>
              <LuCheck size={18} /> {t.openLabel}
            </>
          ) : course.price === 0 ? t.freeLabel : `${course.price.toLocaleString()} ${t.priceLabel}`}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onPlay(course)}
            style={{ width: 40, height: 40, background: "transparent", color: course.color, border: `2px solid ${course.color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = course.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = course.color; }}>
            <LuBot size={20} />
          </button>
          <button onClick={() => onDetail(course.id)}
            style={{ height: 40, padding: "0 18px", background: course.color, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.3s", boxShadow: `0 4px 12px ${course.color}44` }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}>
            {t.detailBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsBar = ({ darkMode, courses, t }) => {
  const totalCourses = (courses || []).length;
  const totalStudents = (courses || []).reduce((sum, c) => sum + c.students, 0);
  const avgRating = ((courses || []).reduce((sum, c) => sum + c.rating, 0) / (totalCourses || 1)).toFixed(1);
  const formattedStudents = totalStudents >= 1000 ? Math.floor(totalStudents / 1000) + "K+" : totalStudents;

  const stats = [
    { icon: <LuGraduationCap />, value: `${totalCourses}+`, label: t.statsCoursesCount },
    { icon: <LuBot />,          value: "AI",            label: t.aiTutorLabel },
    { icon: <LuUsers />,        value: formattedStudents,label: t.statsStudentsCount },
    { icon: <LuStar />,           value: avgRating,        label: t.statsRating },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 40 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ 
          background: darkMode ? "rgba(30,41,59,0.5)" : "#fff", 
          backdropFilter: "blur(10px)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "#e5e7eb"}`, 
          borderRadius: 20, 
          padding: "20px", 
          textAlign: "center",
          transition: "transform 0.3s ease",
          cursor: "default"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
          <div style={{ fontSize: 28, color: "#3b82f6", display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontWeight: 900, fontSize: 24, color: darkMode ? "#f1f5f9" : "#0f172a", margin: "4px 0 2px" }}>{s.value}</div>
          <div style={{ fontSize: 13, color: darkMode ? "#94a3b8" : "#64748b", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

const Courses = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const categories = [t.allCategories, ...categoriesBase];
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortBy, setSortBy]               = useState("default");
  const [favorites, setFavorites]         = useState([]);
  const [purchasedIds, setPurchasedIds]   = useState([]);
  const [showFavOnly, setShowFavOnly]     = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);
  const [detailId, setDetailId]           = useState(null);
  const [userPlan, setUserPlan]           = useState(null);
  const [courseStats, setCourseStats]     = useState({});

  const allCourses = useMemo(() => [
    { id: 1, category: "HTML", title: "HTML Asoslar", rating: 0, students: 0, price: 0, level: t.levelBeginner, color: "#e44d26", thumbnail: "https://placehold.co/400x220/e44d26/ffffff?text=HTML" },
    { id: 2, category: "CSS", title: "CSS & Flexbox To'liq", rating: 0, students: 0, price: 49000, level: t.levelIntermediate, color: "#264de4", thumbnail: "https://placehold.co/400x220/264de4/ffffff?text=CSS" },
    { id: 3, category: "JavaScript", title: "JavaScript To'liq Kurs", rating: 0, students: 0, price: 89000, level: t.levelAll, color: "#d4a017", thumbnail: "https://placehold.co/400x220/d4a017/ffffff?text=JavaScript" },
    { id: 4, category: "React", title: "React.js Zamonaviy", rating: 0, students: 0, price: 120000, level: t.levelUpperIntermediate, color: "#0ea5e9", thumbnail: "https://placehold.co/400x220/0ea5e9/ffffff?text=React" },
    { id: 5, category: "English", title: "Ingliz Tili A1→B2", rating: 0, students: 0, price: 75000, level: t.levelBeginner, color: "#003580", thumbnail: "https://placehold.co/400x220/003580/ffffff?text=English" },
    { id: 6, category: "Russian", title: "Rus Tili Asosiy Kurs", rating: 0, students: 0, price: 65000, level: t.levelBeginner, color: "#c0392b", thumbnail: "https://placehold.co/400x220/c0392b/ffffff?text=Русский" },
    { id: 7, category: "French", title: "Fransuz Tili Kursi", rating: 0, students: 0, price: 70000, level: t.levelBeginner, color: "#002395", thumbnail: "https://placehold.co/400x220/002395/ffffff?text=Français" },
    { id: 8, category: "HTML", title: "HTML5 & Semantik Teglar", rating: 0, students: 0, price: 35000, level: t.levelIntermediate, color: "#e44d26", thumbnail: "https://placehold.co/400x220/e44d26/ffffff?text=HTML5" },
  ], [t]);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      const stats = {};
      for (const course of allCourses) {
        try {
          let realRating = 0;
          let realStudents = 0;
          const reviewsSnap = await getDocs(collection(db, "courses", String(course.id), "reviews"));
          if (!reviewsSnap.empty) {
            let sum = 0;
            reviewsSnap.forEach(d => { sum += Number(d.data().rating || 0); });
            realRating = Number((sum / reviewsSnap.size).toFixed(1));
          }

          const courseSnap = await getDoc(doc(db, "courses", String(course.id)));
          if (courseSnap.exists()) {
            realStudents = courseSnap.data().students || 0;
            if (reviewsSnap.empty && courseSnap.data().rating) realRating = courseSnap.data().rating;
          }
          
          stats[course.id] = { rating: realRating, students: realStudents };
        } catch (err) {
          console.error(err);
        }
      }
      if (!cancelled) setCourseStats(stats);
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [allCourses]);

  const realCourses = allCourses.map(c => ({
    ...c,
    rating: courseStats[c.id]?.rating ?? 0,
    students: courseStats[c.id]?.students ?? 0,
  }));

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists() && !cancelled) {
        const data = snap.data();
        setFavorites(data.favoriteCourses || []);
        setUserPlan(data.plan || null);
      }
    });

    const loadProgress = async () => {
      try {
        const purchased = [];
        for (const course of allCourses) {
          if (course.price === 0) { purchased.push(course.id); continue; }
          const snap = await getDoc(doc(db, "users", user.uid, "progress", String(course.id)));
          if (snap.exists() && snap.data().purchased) purchased.push(course.id);
        }
        if (!cancelled) {
          setPurchasedIds(prev => [...new Set([...prev, ...purchased])]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProgress();

    return () => { 
      cancelled = true; 
      unsubUser(); 
    };
  }, [user, allCourses, t]);

  const effectivePurchasedIds = useMemo(() => {
    if (userPlan === "pro" || userPlan === "premium") {
      return allCourses.map(c => c.id);
    }
    return purchasedIds;
  }, [userPlan, allCourses, purchasedIds]);

  const toggleFav = async (id) => {
    const newFavs = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(newFavs);
    showToast?.(favorites.includes(id) ? t.removedFromFav : t.addedToFav, favorites.includes(id) ? "error" : "success");
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { favoriteCourses: newFavs }, { merge: true });
    } catch (err) { console.error(err); }
  };

  if (detailId) {
    return (
      <CourseDetail
        courseId={detailId}
        onBack={() => setDetailId(null)}
        darkMode={darkMode}
        showToast={showToast}
        userPlan={userPlan}
        onPurchased={(id) => setPurchasedIds((prev) => [...prev, id])}
      />
    );
  }

  const filtered = realCourses
    .filter((c) => {
      const q = search.toLowerCase();
      const localizedTitle = (t.courseData[c.id]?.title || c.title).toLowerCase();
      const matchSearch = localizedTitle.includes(q) || c.category.toLowerCase().includes(q);
      const matchCat    = activeCategory === 0 || c.category === categoriesBase[activeCategory - 1];
      const matchFav    = showFavOnly ? favorites.includes(c.id) : true;
      return matchSearch && matchCat && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating")     return b.rating - a.rating;
      if (sortBy === "students")   return b.students - a.students;
      return 0;
    });

  return (
    <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "60px 24px 100px" }}>
      <ScrollReveal direction="up">
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontSize: 13, fontWeight: 800, padding: "6px 16px", borderRadius: 30, marginBottom: 16, border: "1px solid rgba(59,130,246,0.2)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.onlinePlatform}</span>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", color: darkMode ? "#f1f5f9" : "#0f172a", margin: "0 0 16px", lineHeight: 1.1 }}>{t.catalogTitle}</h1>
          <p style={{ color: darkMode ? "#94a3b8" : "#64748b", fontSize: 17, maxWidth: 600, margin: "0 auto", fontWeight: 500, lineHeight: 1.6 }}>{t.catalogDesc}</p>
        </div>
      </ScrollReveal>
      <ScrollReveal direction="up" delay={100}><StatsBar darkMode={darkMode} courses={realCourses} t={t} /></ScrollReveal>
      <ScrollReveal direction="up" delay={150}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 300px" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", alignItems: "center" }}>
              <LuSearch size={20} />
            </span>
            <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 16, border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, background: darkMode ? "rgba(30,41,59,0.7)" : "#fff", color: darkMode ? "#f1f5f9" : "#111", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "all 0.3s", backdropFilter: "blur(10px)" }} />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                <LuX size={20} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "14px 20px", borderRadius: 16, border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, background: darkMode ? "rgba(30,41,59,0.7)" : "#fff", color: darkMode ? "#f1f5f9" : "#111", fontSize: 15, cursor: "pointer", outline: "none", backdropFilter: "blur(10px)", fontWeight: 600 }}>
              <option value="default">{t.sortDefault}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="rating">{t.sortRating}</option>
              <option value="students">{t.sortStudents}</option>
            </select>
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 20px", borderRadius: 16, border: `1px solid ${showFavOnly ? "#ef4444" : darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, background: showFavOnly ? "#ef4444" : darkMode ? "rgba(30,41,59,0.7)" : "#fff", color: showFavOnly ? "#fff" : darkMode ? "#f1f5f9" : "#475569", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.3s", backdropFilter: "blur(10px)" }}>
              <LuHeart size={20} className={showFavOnly && favorites.length > 0 ? "fill-current" : ""} />
              {favorites.length > 0 && (
                <span style={{ background: showFavOnly ? "rgba(255,255,255,0.3)" : "#ef4444", color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>{favorites.length}</span>
              )}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
          {categories.map((cat, idx) => {
            const isActive = activeCategory === idx;
            const color    = idx === 0 ? "#3b82f6" : catColors[categoriesBase[idx - 1]] || "#3b82f6";
            return (
              <button key={cat} onClick={() => setActiveCategory(idx)}
                style={{ 
                  padding: "10px 22px", 
                  borderRadius: 30, 
                  border: `2px solid ${isActive ? color : darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"}`, 
                  background: isActive ? color : darkMode ? "rgba(30,41,59,0.4)" : "#fff", 
                  color: isActive ? "#fff" : darkMode ? "#94a3b8" : "#475569", 
                  fontSize: 14, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  transition: "all 0.3s",
                  boxShadow: isActive ? `0 8px 20px ${color}44` : "none" 
                }}>
                {cat}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ height: 1, flex: 1, background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9" }} />
          <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{filtered.length} {t.foundCourses}</p>
          <div style={{ height: 1, flex: 1, background: darkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9" }} />
        </div>
      </ScrollReveal>
      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {filtered.map((course, i) => (
            <ScrollReveal key={course.id} direction="up" delay={i * 50}>
              <CourseCard
                course={course}
                isFav={favorites.includes(course.id)}
                onToggleFav={toggleFav}
                onPlay={setPlayingCourse}
                onDetail={setDetailId}
                darkMode={darkMode}
                purchased={effectivePurchasedIds.includes(course.id)}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0", gap: 20 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: darkMode ? "rgba(30,41,59,0.5)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#94a3b8" }}>{showFavOnly ? <LuHeart /> : <LuSearch />}</div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: darkMode ? "#f1f5f9" : "#0f172a", margin: "0 0 8px" }}>
              {showFavOnly ? t.noFavoriteCourses : t.noCoursesFound}
            </h3>
            <p style={{ color: "#6b7280", fontSize: 16, margin: 0 }}>{t.tryDifferentSearch}</p>
          </div>
          <button onClick={() => { setSearch(""); setActiveCategory(0); setSortBy("default"); setShowFavOnly(false); }}
            style={{ marginTop: 12, padding: "14px 32px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(59,130,246,0.3)", transition: "all 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            {t.clearFilters}
          </button>
        </div>
      )}
      {playingCourse && <AIPreviewModal course={playingCourse} onClose={() => setPlayingCourse(null)} darkMode={darkMode} onDetail={setDetailId} t={t} />}
    </div>
  );
};

export default Courses;