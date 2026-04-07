import { useState, useEffect, useRef } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, addDoc, onSnapshot, orderBy, query,
  increment, getDocs, where, arrayUnion
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import { db } from "../firebase/config";
import { generateLessonContent } from "./CourseDetailContent";

// ─────────────────────────────────────────────────────────────────────────────
// COURSES DATA
// ─────────────────────────────────────────────────────────────────────────────
const coursesData = {
  1: {
    id: 1, category: "HTML", title: "HTML Asoslar", color: "#e44d26", thumbnail: "https://placehold.co/800x400/e44d26/ffffff?text=HTML",
    description: "Bu kursda HTML ning barcha asoslarini o'rganasiz. Teglar, atributlar, formalar va HTML5 ning zamonaviy imkoniyatlarini o'rganasiz.",
    rating: 4.8, students: 3240, price: 0,
    sections: [
      { title: "Kirish", lessons: [{ id: 1, title: "HTML nima?", free: true }, { id: 2, title: "Birinchi HTML sahifa", free: true }, { id: 3, title: "Asosiy teglar", free: false }] },
      { title: "Teglar va Atributlar", lessons: [{ id: 4, title: "Matn teglari", free: false }, { id: 5, title: "Havola va rasmlar", free: false }, { id: 6, title: "Jadvallar", free: false }] },
      { title: "Formalar", lessons: [{ id: 7, title: "Form elementlari", free: false }, { id: 8, title: "Validatsiya", free: false }] },
      { title: "HTML5", lessons: [{ id: 9, title: "Semantik teglar", free: false }, { id: 10, title: "Audio va Video", free: false }, { id: 11, title: "Canvas", free: false }, { id: 12, title: "Loyiha", free: false }] },
    ],
  },
  2: {
    id: 2, category: "CSS", title: "CSS & Flexbox To'liq", color: "#264de4", thumbnail: "https://placehold.co/800x400/264de4/ffffff?text=CSS",
    description: "CSS ning chuqur qatlamlarini o'rganing. Flexbox, Grid, animatsiyalar va zamonaviy layout usullarini o'zlashtiring.",
    rating: 4.7, students: 2890, price: 49000,
    sections: [
      { title: "CSS Asoslari", lessons: [{ id: 1, title: "CSS nima?", free: true }, { id: 2, title: "Selektorlar", free: true }, { id: 3, title: "Box Model", free: false }] },
      { title: "Flexbox", lessons: [{ id: 4, title: "Flex container", free: false }, { id: 5, title: "Flex items", free: false }, { id: 6, title: "Amaliy misol", free: false }] },
      { title: "Grid", lessons: [{ id: 7, title: "Grid asoslari", free: false }, { id: 8, title: "Grid areas", free: false }, { id: 9, title: "Responsive", free: false }] },
      { title: "Animatsiyalar", lessons: [{ id: 10, title: "Transition", free: false }, { id: 11, title: "@keyframes", free: false }, { id: 12, title: "Transform", free: false }, { id: 13, title: "Loyiha", free: false }] },
    ],
  },
  3: {
    id: 3, category: "JavaScript", title: "JavaScript To'liq Kurs", color: "#d4a017", thumbnail: "https://placehold.co/800x400/d4a017/ffffff?text=JavaScript",
    description: "JavaScript ni noldan boshlab o'rganing. O'zgaruvchilar, funksiyalar, DOM, ES6+ va asinxron dasturlashni o'zlashtiring.",
    rating: 4.9, students: 5100, price: 89000,
    sections: [
      { title: "Asoslar", lessons: [{ id: 1, title: "JavaScript nima?", free: true }, { id: 2, title: "O'zgaruvchilar", free: true }, { id: 3, title: "Ma'lumot turlari", free: false }, { id: 4, title: "Operatorlar", free: false }] },
      { title: "Funksiyalar", lessons: [{ id: 5, title: "Funksiyalar", free: false }, { id: 6, title: "Arrow functions", free: false }, { id: 7, title: "Callback", free: false }] },
      { title: "DOM", lessons: [{ id: 8, title: "DOM nima?", free: false }, { id: 9, title: "Element tanlash", free: false }, { id: 10, title: "Events", free: false }, { id: 11, title: "DOM o'zgartirish", free: false }] },
      { title: "ES6+", lessons: [{ id: 12, title: "Destructuring", free: false }, { id: 13, title: "Spread & Rest", free: false }, { id: 14, title: "Promise/async", free: false }, { id: 15, title: "Fetch API", free: false }] },
      { title: "Loyihalar", lessons: [{ id: 16, title: "Todo App", free: false }, { id: 17, title: "Weather App", free: false }, { id: 18, title: "Quiz App", free: false }] },
    ],
  },
  4: {
    id: 4, category: "React", title: "React.js Zamonaviy", color: "#0ea5e9", thumbnail: "https://placehold.co/800x400/0ea5e9/ffffff?text=React",
    description: "React.js ni chuqur o'rganing. Komponentlar, Hooks, Router, State management va zamonaviy React patterns.",
    rating: 4.9, students: 4200, price: 120000,
    sections: [
      { title: "React Asoslari", lessons: [{ id: 1, title: "React nima?", free: true }, { id: 2, title: "Vite setup", free: true }, { id: 3, title: "JSX", free: false }, { id: 4, title: "Komponentlar", free: false }] },
      { title: "Props va State", lessons: [{ id: 5, title: "Props", free: false }, { id: 6, title: "useState", free: false }, { id: 7, title: "State o'zgartirish", free: false }] },
      { title: "Hooks", lessons: [{ id: 8, title: "useEffect", free: false }, { id: 9, title: "useRef/useMemo", free: false }, { id: 10, title: "Custom hooks", free: false }] },
      { title: "Router", lessons: [{ id: 11, title: "Routing", free: false }, { id: 12, title: "Dynamic routes", free: false }, { id: 13, title: "Protected routes", free: false }] },
      { title: "Loyihalar", lessons: [{ id: 14, title: "Todo App", free: false }, { id: 15, title: "E-commerce", free: false }, { id: 16, title: "Dashboard", free: false }] },
    ],
  },
  5: {
    id: 5, category: "English", title: "Ingliz Tili A1→B2", color: "#003580", thumbnail: "https://placehold.co/800x400/003580/ffffff?text=English",
    description: "Ingliz tilini noldan boshlang. A1 dan B2 gacha barcha darajalarni o'zlashtiring.",
    rating: 4.6, students: 8900, price: 75000,
    sections: [
      { title: "A1", lessons: [{ id: 1, title: "Salomlashish", free: true }, { id: 2, title: "Sonlar", free: true }, { id: 3, title: "To be", free: false }, { id: 4, title: "Oila", free: false }] },
      { title: "A2", lessons: [{ id: 5, title: "Simple Present", free: false }, { id: 6, title: "Simple Past", free: false }, { id: 7, title: "Suhbat", free: false }, { id: 8, title: "Xarid", free: false }] },
      { title: "B1", lessons: [{ id: 9, title: "Present Perfect", free: false }, { id: 10, title: "Modal verbs", free: false }, { id: 11, title: "Conditional", free: false }, { id: 12, title: "Ish suhbati", free: false }] },
      { title: "B2", lessons: [{ id: 13, title: "Passive voice", free: false }, { id: 14, title: "Advanced vocab", free: false }, { id: 15, title: "IELTS Writing", free: false }, { id: 16, title: "IELTS Speaking", free: false }] },
    ],
  },
  6: {
    id: 6, category: "Russian", title: "Rus Tili Asosiy Kurs", color: "#c0392b", thumbnail: "https://placehold.co/800x400/c0392b/ffffff?text=Русский",
    description: "Rus tilini noldan o'rganing. Alifbo, grammatika, suhbat va biznes ruscha.",
    rating: 4.5, students: 4500, price: 65000,
    sections: [
      { title: "Kirish", lessons: [{ id: 1, title: "Rus alifbosi", free: true }, { id: 2, title: "Talaffuz", free: true }, { id: 3, title: "Salomlashish", free: false }] },
      { title: "Grammatika", lessons: [{ id: 4, title: "Ot va sifat", free: false }, { id: 5, title: "Падежlar", free: false }, { id: 6, title: "Fe'llar", free: false }, { id: 7, title: "Sonlar", free: false }] },
      { title: "Suhbat", lessons: [{ id: 8, title: "Tanishish", free: false }, { id: 9, title: "Yo'l so'rash", free: false }, { id: 10, title: "Do'konda", free: false }, { id: 11, title: "Mehmonxona", free: false }] },
      { title: "Biznes", lessons: [{ id: 12, title: "Ish muloqoti", free: false }, { id: 13, title: "Hujjatlar", free: false }, { id: 14, title: "TORFL", free: false }] },
    ],
  },
  7: {
    id: 7, category: "French", title: "Fransuz Tili Kursi", color: "#002395", thumbnail: "https://placehold.co/800x400/002395/ffffff?text=Français",
    description: "Fransuz tilini asosdan o'rganing. Alifbo, grammatika, suhbat va madaniyat.",
    rating: 4.4, students: 2100, price: 70000,
    sections: [
      { title: "Asoslar", lessons: [{ id: 1, title: "Alifbo", free: true }, { id: 2, title: "Bonjour!", free: true }, { id: 3, title: "Sonlar", free: false }, { id: 4, title: "Ranglar", free: false }] },
      { title: "Grammatika", lessons: [{ id: 5, title: "Artikl", free: false }, { id: 6, title: "Être/Avoir", free: false }, { id: 7, title: "Présent", free: false }, { id: 8, title: "Sifatlar", free: false }] },
      { title: "Suhbat", lessons: [{ id: 9, title: "Tanishish", free: false }, { id: 10, title: "Yo'l so'rash", free: false }, { id: 11, title: "Restoran", free: false }] },
      { title: "Madaniyat", lessons: [{ id: 12, title: "Fransiya tarixi", free: false }, { id: 13, title: "Oshxona", free: false }, { id: 14, title: "Imtihon", free: false }] },
    ],
  },
  8: {
    id: 8, category: "HTML", title: "HTML5 & Semantik Teglar", color: "#e44d26", thumbnail: "https://placehold.co/800x400/e44d26/ffffff?text=HTML5",
    description: "HTML5 ning yangi imkoniyatlari. Semantik teglar, multimedia va Canvas.",
    rating: 4.3, students: 1800, price: 35000,
    sections: [
      { title: "HTML5", lessons: [{ id: 1, title: "HTML5 yangiliklari", free: true }, { id: 2, title: "Doctype/meta", free: true }, { id: 3, title: "Semantik teglar", free: false }] },
      { title: "Semantika", lessons: [{ id: 4, title: "nav/article/section", free: false }, { id: 5, title: "figure/figcaption", free: false }, { id: 6, title: "SEO semantika", free: false }] },
      { title: "Multimedia", lessons: [{ id: 7, title: "Video tegi", free: false }, { id: 8, title: "Audio tegi", free: false }, { id: 9, title: "Canvas", free: false }, { id: 10, title: "SVG", free: false }] },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STARS
// ─────────────────────────────────────────────────────────────────────────────
const Stars = ({ rating, interactive = false, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} onClick={() => interactive && onChange?.(s)}
        style={{ fontSize: interactive ? 24 : 14, color: s <= rating ? "#f59e0b" : "#d1d5db", cursor: interactive ? "pointer" : "default" }}>★</span>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
const Reviews = ({ darkMode, courseId, isModal = false, onFinish, showToast }) => {
  const { user } = useAuth();
  const [allReviews, setAllReviews] = useState([]);
  const [newReview,  setNewReview]  = useState({ rating: 5, text: "" });
  const [submitted,  setSubmitted]  = useState(false);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const unsub = onSnapshot(
      query(collection(db, "courses", String(courseId), "reviews"), orderBy("createdAt", "desc")),
      (snap) => setAllReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!newReview.text.trim() || !user) return;
    setLoading(true);
    try {
      // BUG #16 FIX — prevent duplicate reviews from the same user
      const existingQ = query(
        collection(db, "courses", String(courseId), "reviews"),
        where("uid", "==", user.uid)
      );
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        showToast?.("Siz allaqachon sharh yozdingiz!", "error");
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "courses", String(courseId), "reviews"), {
        uid: user.uid, name: user.displayName || user.email,
        avatar: user.photoURL || null, rating: newReview.rating,
        text: newReview.text, createdAt: serverTimestamp(),
      });
      await giveReward(user.uid, 5, "xp", "Kursga sharh qoldirildi");
      setSubmitted(true);
      setNewReview({ rating: 5, text: "" });
      if (isModal && onFinish) setTimeout(() => onFinish(), 1500);
      else setTimeout(() => setSubmitted(false), 3000);
    } catch (err) { console.error("Review error:", err); }
    setLoading(false);
  };

  const avg = allReviews.length
    ? (allReviews.reduce((a, r) => a + r.rating, 0) / allReviews.length).toFixed(1)
    : "0.0";

  return (
    <div>
      {!isModal && (
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: "16px 20px", background: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#f59e0b" }}>{avg}</div>
            <Stars rating={Math.round(Number(avg))} />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{allReviews.length} ta sharh</div>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const cnt = allReviews.filter((r) => r.rating === star).length;
              const pct = allReviews.length ? Math.round((cnt / allReviews.length) * 100) : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", width: 16 }}>{star}</span>
                  <span style={{ fontSize: 12, color: "#f59e0b" }}>★</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: darkMode ? "#334155" : "#e5e7eb" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: "#f59e0b" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#6b7280", width: 28 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!user ? (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: darkMode ? "#1e293b" : "#f8fafc", borderRadius: 10, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
          Sharh yozish uchun <a href="/login" style={{ color: "#3b82f6", fontWeight: 600 }}>tizimga kiring</a>
        </div>
      ) : submitted ? (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "#d1fae5", borderRadius: 10, fontSize: 13, color: "#065f46", fontWeight: 600 }}>
          ✅ Sharhingiz qabul qilindi! +5 XP qo'shildi 🎉
        </div>
      ) : (
        <div style={{ marginBottom: isModal ? 0 : 20, padding: "16px 20px", background: darkMode ? "#1e293b" : "#fff", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
          <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>
            {isModal ? "Darsga baho bering" : "Sharh yozing"}
          </p>
          <Stars rating={newReview.rating} interactive onChange={(r) => setNewReview({ ...newReview, rating: r })} />
          <textarea rows={3} placeholder="Kurs haqida fikringiz..." value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            style={{ width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 8, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={handleSubmit} disabled={loading || !newReview.text.trim()}
            style={{ marginTop: 8, padding: "8px 20px", background: loading ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading || !newReview.text.trim() ? "default" : "pointer", opacity: !newReview.text.trim() ? 0.6 : 1 }}>
            {loading ? "⏳..." : "Yuborish"}
          </button>
        </div>
      )}

      {!isModal && (
        allReviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, padding: "20px 0" }}>Hali sharhlar yo'q. Birinchi bo'ling! ⭐</p>
        ) : (
          allReviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 14, padding: "14px 16px", background: darkMode ? "#1e293b" : "#fff", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, overflow: "hidden", flexShrink: 0 }}>
                  {r.avatar ? <img src={r.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>{r.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{r.createdAt?.toDate?.()?.toLocaleDateString("uz") || "Hozirgina"}</p>
                </div>
                <div style={{ marginLeft: "auto" }}><Stars rating={r.rating} /></div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))
        )
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RATING MODAL
// ─────────────────────────────────────────────────────────────────────────────
const RatingModal = ({ courseId, onClose, darkMode }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
    <div style={{ width: "100%", maxWidth: 420, background: darkMode ? "#1e293b" : "#fff", borderRadius: 24, padding: 30, textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
      <div style={{ fontSize: 60, marginBottom: 10 }}>⭐</div>
      <h2 style={{ color: darkMode ? "#fff" : "#111", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Dars qanday bo'ldi?</h2>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>Fikringiz biz uchun muhim! Kursni baholang va XP yutib oling.</p>
      <Reviews courseId={courseId} darkMode={darkMode} isModal={true} onFinish={onClose} showToast={undefined} />
      <button onClick={onClose} style={{ marginTop: 16, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Keyinroq qoldirish</button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// AI LESSON MODAL — Comprehensive AI-Tutor Engine (v2)
// • NO iframe / videoId references
// • Firebase onComplete / onClose contract is FULLY PRESERVED
// • z-index: 10000 — above sidebar, below nothing
// ═══════════════════════════════════════════════════════════════════════════════

/* ─── CSS injected once ─── */
const AI_MODAL_CSS = `
  @keyframes ai-breathe   { 0%,100%{transform:scale(1)}    50%{transform:scale(1.06)} }
  @keyframes ai-pulse     { 0%,100%{opacity:1}              50%{opacity:.45} }
  @keyframes ai-glow-ring { 0%,100%{box-shadow:0 0 0 0 var(--ac)33} 60%{box-shadow:0 0 0 9px transparent} }
  @keyframes ai-slide-fwd { from{opacity:0;transform:translateX(52px)} to{opacity:1;transform:none} }
  @keyframes ai-slide-bwd { from{opacity:0;transform:translateX(-52px)} to{opacity:1;transform:none} }
  @keyframes ai-fade-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes ai-shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes ai-cursor    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes ai-pop-in    { 0%{opacity:0;transform:scale(.88)} 100%{opacity:1;transform:scale(1)} }

  .ai-tw-cursor { display:inline-block; animation:ai-cursor 0.75s step-end infinite; }
  .ai-slide-fwd { animation:ai-slide-fwd 0.38s cubic-bezier(.22,.68,0,1.2) both; }
  .ai-slide-bwd { animation:ai-slide-bwd 0.38s cubic-bezier(.22,.68,0,1.2) both; }
  .ai-fade-up   { animation:ai-fade-up 0.32s ease both; }
  .ai-pop-in    { animation:ai-pop-in  0.28s cubic-bezier(.22,.68,0,1.3) both; }

  .ai-code-block { font-family:'Fira Code','Cascadia Code','JetBrains Mono',monospace; }
  .ai-scroll::-webkit-scrollbar { width:4px; }
  .ai-scroll::-webkit-scrollbar-track { background:transparent; }
  .ai-scroll::-webkit-scrollbar-thumb { background:var(--ac)55; border-radius:4px; }

  .ai-quiz-opt:hover { border-color:var(--ac) !important; background:var(--ac)18 !important; }
  .ai-nav-btn:hover:not(:disabled) { filter:brightness(1.12); transform:translateY(-1px); }
  .ai-nav-btn { transition:all .18s ease; }
`;

/* ─── Typewriter hook ─── */
const useTypewriter = (text, speed = 30) => {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false);
    let i = 0;
    const tid = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(tid); setDone(true); }
    }, speed);
    return () => clearInterval(tid);
  }, [text, speed]);
  return { out, done };
};

/* ─── Syntax-highlight tokens (no external lib) ─── */
const syntaxColor = (line) => {
  const keywords = /\b(const|let|var|function|return|import|export|default|from|if|else|for|while|class|extends|new|this|async|await|try|catch|null|undefined|true|false|typeof|of|in)\b/g;
  const strings  = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  const numbers  = /\b(\d+)\b/g;
  const tags     = /(&lt;\/?[\w-]+(?:\s[^&]*)?\/?&gt;)/g;
  const attrs    = /\b(class|id|href|src|alt|type|placeholder|style|onClick|onChange|key)=/g;

  let h = line
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(comments, m => `<span style="color:#6a9955">${m}</span>`);
  h = h.replace(strings,  m => `<span style="color:#ce9178">${m}</span>`);
  h = h.replace(keywords, m => `<span style="color:#569cd6;font-weight:600">${m}</span>`);
  h = h.replace(numbers,  m => `<span style="color:#b5cea8">${m}</span>`);
  h = h.replace(tags,     m => `<span style="color:#4ec9b0">${m}</span>`);
  h = h.replace(attrs,    m => `<span style="color:#9cdcfe">${m}</span>`);
  return h;
};

/* ─── Code Block ─── */
const CodeBlock = ({ code, lang = "js", accent }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const ext = { js: "script.js", jsx: "App.jsx", html: "index.html", css: "styles.css", ts: "main.ts" }[lang] || "code.txt";
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${accent}44`, marginTop: 4 }}>
      {/* titlebar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#161b22" }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{ext}</span>
        <button onClick={copy} style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 6, border: `1px solid ${accent}55`, background: "transparent", color: copied ? "#4ade80" : accent, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
          {copied ? "✓ Nusxalandi" : "Nusxalash"}
        </button>
      </div>
      {/* lines */}
      <pre className="ai-code-block ai-scroll" style={{ margin: 0, padding: "18px 20px", background: "#0d1117", color: "#d4d4d4", fontSize: 12.5, lineHeight: 1.8, overflowX: "auto", maxHeight: 280 }}>
        {code.split("\n").map((ln, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "#3d4148", userSelect: "none", minWidth: 20, textAlign: "right", fontSize: 11 }}>{i + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: syntaxColor(ln) }} />
          </div>
        ))}
      </pre>
    </div>
  );
};

/* ─── Mini Quiz ─── */
const MiniQuiz = ({ quiz, accent, darkMode }) => {
  const [sel, setSel]   = useState(null);
  const [show, setShow] = useState(false);
  const text  = darkMode ? "#f1f5f9" : "#111827";
  const cardBg = darkMode ? "rgba(30,41,59,.6)" : "rgba(248,250,252,.9)";

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: `${accent}22`, color: accent, fontSize: 11 }}>SAVOL</span>
        {quiz.q}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {quiz.opts.map((opt, i) => {
          const isCorrect = i === quiz.correct;
          const isSelected = sel === i;
          let bg = cardBg, border = darkMode ? "#334155" : "#e2e8f0", color = text;
          if (show) {
            if (isCorrect)  { bg = "#052e16"; border = "#4ade80"; color = "#4ade80"; }
            if (isSelected && !isCorrect) { bg = "#450a0a"; border = "#f87171"; color = "#f87171"; }
          } else if (isSelected) { bg = `${accent}22`; border = accent; color = accent; }
          return (
            <button key={i} className="ai-quiz-opt" disabled={show} onClick={() => setSel(i)}
              style={{ "--ac": accent, padding: "11px 16px", borderRadius: 11, border: `1.5px solid ${border}`, background: bg, color, fontSize: 13, fontWeight: 500, cursor: show ? "default" : "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all .2s" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${border}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {show && isCorrect ? "✓" : show && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {sel !== null && !show && (
        <button onClick={() => setShow(true)} style={{ marginTop: 12, padding: "9px 22px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Javobni ko'rish
        </button>
      )}
      {show && (
        <div className="ai-fade-up" style={{ marginTop: 12, padding: "12px 16px", borderRadius: 11, background: darkMode ? "rgba(16,185,129,.12)" : "#f0fdf4", border: "1px solid #4ade8055", fontSize: 13, color: darkMode ? "#86efac" : "#166534", lineHeight: 1.7 }}>
          💡 <strong>Izoh:</strong> {quiz.explanation}
        </div>
      )}
    </div>
  );
};

/* ─── AI Chat Panel ─── */
const AIChatPanel = ({ lessonTitle, slideTitle, accent, darkMode, onClose }) => {
  const [q, setQ]         = useState("");
  const [msgs, setMsgs]   = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const text  = darkMode ? "#f1f5f9" : "#111827";
  const panelBg = darkMode ? "rgba(9,13,22,.97)" : "rgba(248,250,252,.97)";

  const ask = async () => {
    const question = q.trim();
    if (!question || loading) return;
    setQ("");
    const newMsgs = [...msgs, { role: "user", content: question }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const systemPrompt = `Sen "Uzbekas AI" nomli mutaxassis o'qituvchisan. Hozir "${lessonTitle}" kursining "${slideTitle}" slaydini o'rgatmoqdasan. Barcha javoblarni O'zbek tilida ber. Qisqa (3-5 gap), aniq va amaliy javob ber. Kerak bo'lsa kod misoli keltir.`;

      // Gemini history formatiga o'tkazish (system promptni birinchi user xabar sifatida qo'shamiz)
      const geminiHistory = newMsgs.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...geminiHistory,
              { role: "user", parts: [{ text: question }] },
            ],
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.7,
            },
          }),
        }
      );
      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") ||
        "Kechirasiz, javob ololmadim.";
      setMsgs([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([...newMsgs, { role: "assistant", content: "❌ Tarmoq xatosi. Iltimos qayta urinib ko'ring." }]);
    }
    setLoading(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  return (
    <div className="ai-pop-in" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: panelBg, borderTop: `1.5px solid ${accent}55`, borderRadius: "18px 18px 0 0", display: "flex", flexDirection: "column", height: 340, zIndex: 20, backdropFilter: "blur(20px)" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, animation: "ai-breathe 2.5s ease-in-out infinite" }}>🤖</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>Uzbekas AI</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>Mavzu: {slideTitle}</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, color: "#94a3b8", cursor: "pointer" }}>✕</button>
      </div>
      {/* messages */}
      <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13, paddingTop: 20 }}>
            💬 Bu slayd haqida savol bering...
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? accent : (darkMode ? "#1e293b" : "#fff"), color: m.role === "user" ? "#fff" : text, fontSize: 13, lineHeight: 1.65, border: m.role === "assistant" ? `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` : "none", whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "10px 14px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: accent, animation: `ai-pulse 1s ${i*0.22}s ease-in-out infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* input */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && ask()}
          placeholder="Savolingizni yozing... (Enter = yuborish)"
          style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: text, fontSize: 13, outline: "none" }} />
        <button onClick={ask} disabled={!q.trim() || loading}
          style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: q.trim() && !loading ? accent : "#94a3b8", color: "#fff", fontSize: 13, fontWeight: 700, cursor: q.trim() && !loading ? "pointer" : "default", transition: "background .2s" }}>
          →
        </button>
      </div>
    </div>
  );
};

/* ─── Slide Content Renderer ─── */
const SlideContent = ({ content, accent, darkMode }) => {
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const sub  = darkMode ? "#94a3b8" : "#64748b";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {content.map((block, i) => {
        if (block.kind === "paragraph") return (
          <div key={i} style={{ fontSize: 14.5, color: sub, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: block.html }} />
        );
        if (block.kind === "highlight") return (
          <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", borderRadius: 14, background: darkMode ? `${accent}14` : `${accent}0e`, border: `1px solid ${accent}33` }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{block.icon}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{block.label}</div>
              <div style={{ fontSize: 13.5, color: text, lineHeight: 1.75 }}>{block.text}</div>
            </div>
          </div>
        );
        if (block.kind === "points") return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {block.items.map((pt, j) => (
              <div key={j} style={{ display: "flex", gap: 12, padding: "11px 16px", borderRadius: 12, background: darkMode ? "rgba(30,41,59,.6)" : "rgba(248,250,252,.9)", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                <div style={{ width: 22, height: 22, borderRadius: 8, background: `linear-gradient(135deg,${accent},${accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 1 }}>{j + 1}</div>
                <span style={{ fontSize: 13.5, color: text, lineHeight: 1.6 }}>{pt}</span>
              </div>
            ))}
          </div>
        );
        if (block.kind === "practices") return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {block.items.map((pt, j) => (
              <div key={j} style={{ display: "flex", gap: 12, padding: "11px 16px", borderRadius: 12, background: darkMode ? "rgba(16,185,129,.07)" : "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.25)" }}>
                <span style={{ color: "#10b981", fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13.5, color: text, lineHeight: 1.6 }}>{pt}</span>
              </div>
            ))}
          </div>
        );
        if (block.kind === "code") return <CodeBlock key={i} code={block.code} lang={block.lang} accent={accent} />;
        if (block.kind === "quiz")  return <MiniQuiz  key={i} quiz={block} accent={accent} darkMode={darkMode} />;
        if (block.kind === "tip") return (
          <div key={i} style={{ padding: "10px 16px", borderRadius: 10, background: darkMode ? "rgba(245,158,11,.1)" : "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", fontSize: 13, color: darkMode ? "#fcd34d" : "#92400e", lineHeight: 1.7 }}>
            {block.text}
          </div>
        );
        return null;
      })}
    </div>
  );
};

/* ─── Top Progress Bar ─── */
const TopProgressBar = ({ pct, accent }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,.06)", zIndex: 5 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${accent},${accent}cc)`, transition: "width 0.5s cubic-bezier(.22,.68,0,1.2)", boxShadow: `0 0 10px ${accent}99` }} />
  </div>
);

/* ─── AI Avatar (speaks slide intro via typewriter) ─── */
const AIAvatar = ({ text, accent, darkMode, done }) => {
  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const { out } = useTypewriter(text, 22);
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, flexShrink: 0, background: darkMode ? `${accent}0a` : `${accent}07` }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${accent}ee,${accent}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: "ai-breathe 3s ease-in-out infinite", boxShadow: `0 0 0 3px ${accent}33` }}>🤖</div>
        <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: "#4ade80", border: "2px solid " + (darkMode ? "#0d1117" : "#fff"), animation: "ai-pulse 2s infinite" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>Uzbekas AI</span>
          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: `${accent}22`, color: accent }}>JONLI</span>
        </div>
        <div style={{ fontSize: 13.5, color: textColor, lineHeight: 1.65, minHeight: 22 }}>
          {out}{!done && <span className="ai-tw-cursor" style={{ color: accent }}>|</span>}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   AILessonModal  ←  MAIN EXPORT (replaces VideoLessonModal)
   Props interface is IDENTICAL — no changes needed in CourseDetail's JSX.
───────────────────────────────────────────────────────────────────────────── */
const VideoLessonModal = ({ lesson, courseColor, courseRating, courseStudents, onClose, onComplete, darkMode, courseId, courseCategory }) => {
  const slides   = generateLessonContent(lesson, courseId, courseCategory);
  const accent   = courseColor || "#3b82f6";

  const [cur,         setCur]         = useState(0);
  const [dir,         setDir]         = useState(1);
  const [animKey,     setAnimKey]     = useState(0);
  const [viewed,      setViewed]      = useState(new Set([0]));
  const [showChat,    setShowChat]    = useState(false);
  const [avatarDone,  setAvatarDone]  = useState(false);

  const pct      = Math.round((viewed.size / slides.length) * 100);
  const isLast   = cur === slides.length - 1;
  const allDone  = viewed.size === slides.length;
  const slide    = slides[cur];

  const textMain = darkMode ? "#f1f5f9" : "#0f172a";
  const textSub  = darkMode ? "#94a3b8"  : "#64748b";
  const modalBg  = darkMode ? "#0a0f1e"  : "#f8fafc";
  const headerBg = darkMode ? "#060b18"  : "#ffffff";
  const borderC  = darkMode ? "#1e2d45"  : "#e2e8f0";

  /* avatar text per slide type */
  const avatarLines = {
    intro:     `Salom! Men Uzbekas AI — sizning shaxsiy o'qituvchingizman. Bugun "${lesson.title}" mavzusidan boshlaymiz. Tayyor bo'lsangiz, keling!`,
    theory:    `Ajoyib! Endi nazariyani o'rganamiz. Bu qism muhim — diqqat bilan o'qing. Har bir tushunchani tushunish keyingi bosqich uchun poydevor.`,
    code:      `Kodni ko'rishga tayyor bo'ling! Har bir satrni o'qing, kommentariyalarga e'tibor bering. Keyin o'zingiz ham yozib ko'ring — bu eng yaxshi usul.`,
    challenge: `Bilimingizni sinash vaqti! Bu savol o'rganganlaringizni mustahkamlaydi. Xavotir olmang — xato ham o'rganish. Javobni tanlang.`,
    practices: `Ajoyib ish! Endi professional standartlarni o'rganamiz. Bular katta kompaniyalarda qo'llaniladigan qoidalar. Yodda saqlang.`,
    summary:   `Darsni muvaffaqiyatli yakunladingiz! 🎉 Siz bugun juda ko'p narsa o'rgandingiz. "Tugatdim" tugmasini bosib, XP yutib oling!`,
  };

  /* ESC key handler */
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  /* mark viewed */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setViewed(prev => new Set([...prev, cur])); setAvatarDone(false); }, [cur]);

  const goTo = (idx) => {
    if (idx < 0 || idx >= slides.length) return;
    setDir(idx > cur ? 1 : -1);
    setAnimKey(k => k + 1);
    setCur(idx);
    setShowChat(false);
  };

  /* inject CSS once */
  useEffect(() => {
    const id = "__uzbekas-ai-css__";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = AI_MODAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const slideClass = dir > 0 ? "ai-slide-fwd" : "ai-slide-bwd";

  /* ── Slide type label badge ── */
  const typeColors = { intro:"#7c3aed", theory:"#1d4ed8", code:"#0f766e", challenge:"#b45309", practices:"#166534", summary:"#10b981" };
  const typeBg = typeColors[slide.type] || accent;

  return (
    <div
      onClick={() => onClose(false)}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", backdropFilter: "blur(8px)", cursor: "default !important" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 900, maxHeight: "94vh", borderRadius: 24, overflow: "hidden", background: modalBg, display: "flex", flexDirection: "column", boxShadow: `0 0 0 1px ${accent}55, 0 40px 100px rgba(0,0,0,.7)`, position: "relative", cursor: "default !important" }}
      >
        {/* ── Top reading progress bar ── */}
        <TopProgressBar pct={pct} accent={accent} />

        {/* ── Modal Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: headerBg, borderBottom: `1px solid ${borderC}`, flexShrink: 0, paddingTop: 18 }}>
          {/* dot nav */}
          <div style={{ display: "flex", gap: 5, alignItems: "center", flex: 1 }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={s.label}
                style={{ height: 6, width: i === cur ? 28 : viewed.has(i) ? 16 : 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0, background: i === cur ? accent : viewed.has(i) ? `${accent}70` : (darkMode ? "#253352" : "#cbd5e1"), transition: "width 0.5s cubic-bezier(.22,.68,0,1.2)", boxShadow: `0 0 10px ${accent}99` }}
              />
            ))}
          </div>

          {/* lesson title */}
          <div style={{ textAlign: "center", flex: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lesson.title}</div>
            <div style={{ fontSize: 10.5, color: textSub, marginTop: 2 }}>{viewed.size}/{slides.length} slayd ko'rildi • {pct}% bajarildi</div>
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowChat(v => !v)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${accent}`, background: showChat ? accent : "transparent", color: showChat ? "#fff" : accent, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .2s" }}>
              🤖 AI Chat
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280", padding: "0 2px", lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* ── AI Avatar ── */}
        <AIAvatar
          key={`av-${cur}`}
          text={avatarLines[slide.type] || avatarLines.intro}
          accent={accent}
          darkMode={darkMode}
          done={avatarDone}
        />

        {/* ── Scrollable Slide Area ── */}
        <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px", position: "relative" }}>
          <div key={`slide-${animKey}`} className={slideClass}>

            {/* Slide card (glassmorphism) */}
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, position: "relative" }}>
              <img src={lesson.thumbnail || "https://placehold.co/800x400/3b82f6/ffffff?text=Lesson"} alt={lesson.title} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "32px 24px 20px" }}>
                <span style={{ background: accent, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{lesson.category || "AI Dars"}</span>
                <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: "8px 0 4px" }}>{lesson.title}</h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>⭐ {courseRating || 0} · 👥 {(courseStudents || 0).toLocaleString()} talaba</p>
              </div>
            </div>

            {/* Slide header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg,${typeBg}44,${typeBg}18)`, border: `1.5px solid ${typeBg}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {slide.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: `${typeBg}22`, color: typeBg, letterSpacing: "0.1em" }}>{slide.label}</span>
                  <span style={{ fontSize: 10, color: textSub }}>{cur + 1} / {slides.length}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: textMain, lineHeight: 1.3 }}>{slide.title}</div>
              </div>
            </div>

            {/* Slide content */}
            <SlideContent content={slide.content} accent={accent} darkMode={darkMode} />
          </div>

          {/* AI Chat panel — sticky bottom */}
          {showChat && (
            <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 20 }}>
              <AIChatPanel
                lessonTitle={lesson.title}
                slideTitle={slide.title}
                accent={accent}
                darkMode={darkMode}
                onClose={() => setShowChat(false)}
              />
            </div>
          )}
        </div>

        {/* ── Footer Navigation ── */}
        <div style={{ padding: "14px 24px 18px", borderTop: `1px solid ${borderC}`, background: headerBg, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="ai-nav-btn"
              disabled={cur === 0}
              onClick={() => goTo(cur - 1)}
              style={{ padding: "12px 22px", borderRadius: 13, border: `1.5px solid ${borderC}`, background: "transparent", color: cur === 0 ? "#475569" : textMain, fontSize: 13, fontWeight: 600, cursor: cur === 0 ? "not-allowed" : "pointer", opacity: cur === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6 }}>
              ← Oldingi
            </button>

            {!isLast ? (
              <button
                className="ai-nav-btn"
                onClick={() => goTo(cur + 1)}
                style={{ flex: 1, padding: "12px 22px", borderRadius: 13, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `0 4px 18px ${accent}60` }}>
                Keyingi slayd →
              </button>
            ) : (
              <button
                className="ai-nav-btn"
                disabled={!allDone}
                onClick={() => { onComplete(lesson.id); onClose(true); }}
                style={{ flex: 1, padding: "12px 22px", borderRadius: 13, border: "none", background: allDone ? "#10b981" : "#334155", color: "#fff", fontSize: 13, fontWeight: 700, cursor: allDone ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: allDone ? "0 4px 18px rgba(16,185,129,.45)" : "none", transition: "all .3s" }}>
                {allDone ? "🎉 Tugatdim va XP yutib olaman!" : `Barcha slaydlarni ko'ring (${viewed.size}/${slides.length})`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────────────────────
const FaqItem = ({ faq, darkMode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: open ? "10px 10px 0 0" : 10, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>{faq.q}</span>
        <span style={{ color: "#6b7280", fontSize: 16 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "12px 16px", background: darkMode ? "#0f172a" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderTop: "none", borderRadius: "0 0 10px 10px", fontSize: 13, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.7 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
const PaymentModal = ({ course, onClose, onSuccess, darkMode }) => {
  const { t } = useLang();
  const [step,    setStep]    = useState(1);
  const [method,  setMethod]  = useState("card");
  const [cardNum, setCardNum] = useState("");
  const [loading, setLoading] = useState(false);

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const handlePay = () => {
    if (cardNum.replace(/\s/g, "").length < 16) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 2000);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, borderRadius: 18, overflow: "hidden", background: darkMode ? "#1e293b" : "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>
            {step === 3 ? `✅ ${t.paymentSuccess}` : `💳 ${t.paymentTitle}`}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          {step === 1 && (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 18, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{course.title}</p>
                <p style={{ margin: "8px 0 0", fontWeight: 800, fontSize: 20, color: "#3b82f6" }}>{course.price.toLocaleString()} so'm</p>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[{ id: "card", label: "💳 Karta" }, { id: "payme", label: "🟢 Payme" }, { id: "click", label: "🔵 Click" }].map((m) => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `2px solid ${method === m.id ? "#3b82f6" : darkMode ? "#334155" : "#e5e7eb"}`, background: method === m.id ? (darkMode ? "#1e3a5f" : "#eff6ff") : "transparent", color: method === m.id ? "#3b82f6" : darkMode ? "#94a3b8" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{ width: "100%", padding: "12px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Davom etish →</button>
            </>
          )}
          {step === 2 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <input placeholder="0000 0000 0000 0000" value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))}
                  style={{ padding: "11px 14px", borderRadius: 8, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 16, letterSpacing: "0.1em", outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="MM/YY" style={{ flex: 1, padding: "11px 14px", borderRadius: 8, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none" }} />
                  <input placeholder="CVV" maxLength={3} style={{ width: 80, padding: "11px 14px", borderRadius: 8, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: darkMode ? "#0f172a" : "#f8fafc" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Jami:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6" }}>{course.price.toLocaleString()} so'm</span>
              </div>
              <button onClick={handlePay} disabled={loading}
                style={{ width: "100%", padding: "12px 0", background: loading ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
                {loading ? "⏳ Tekshirilmoqda..." : `💳 ${course.price.toLocaleString()} so'm To'lash`}
              </button>
            </>
          )}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111", margin: "0 0 6px" }}>Tabriklaymiz!</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>"{course.title}" kursiga muvaffaqiyatli yozildingiz!</p>
              <button onClick={() => { onSuccess(); onClose(); }}
                style={{ padding: "11px 28px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                O'qishni boshlash →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COURSEDETAIL
// ─────────────────────────────────────────────────────────────────────────────
const CourseDetail = ({ courseId, onBack, darkMode, showToast, userPlan, onPurchased }) => {
  const { t }    = useLang();
  const { user } = useAuth();
  const course   = coursesData[courseId] || coursesData[1];

  const [realRating,       setRealRating]       = useState(0);
  const [realStudents,     setRealStudents]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadRealStats = async () => {
      try {
        let rRating = 0;
        let rStudents = 0;
        const reviewsSnap = await getDocs(collection(db, "courses", String(courseId), "reviews"));
        if (!reviewsSnap.empty) {
          let sum = 0;
          reviewsSnap.forEach(d => { sum += Number(d.data().rating || 0); });
          rRating = Number((sum / reviewsSnap.size).toFixed(1));
        }
        const courseSnap = await getDoc(doc(db, "courses", String(courseId)));
        if (courseSnap.exists()) {
          rStudents = courseSnap.data().students || 0;
          if (reviewsSnap.empty && courseSnap.data().rating) {
            rRating = courseSnap.data().rating;
          }
        }
        if (!cancelled) {
          setRealRating(rRating);
          setRealStudents(rStudents);
        }
      } catch(e) { console.error(e); }
    };
    loadRealStats();
    return () => { cancelled = true; };
  }, [courseId]);

  const [activeTab,        setActiveTab]        = useState("lessons");
  const [openSections,     setOpenSections]     = useState([0]);
  const [purchased,        setPurchased]        = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showPayment,      setShowPayment]      = useState(false);
  const [playingLesson,    setPlayingLesson]    = useState(null);
  const [loadingData,      setLoadingData]      = useState(true);
  const [showRatingModal,  setShowRatingModal]  = useState(false);

  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0);
  const progress     = Math.round((completedLessons.length / totalLessons) * 100);

  const faqs = [
    { q: "Kursga qancha vaqt kirish mumkin?",    a: "Sotib olgandan so'ng umrbod kirish imkoniyatiga ega bo'lasiz." },
    { q: "Sertifikat beriladimi?",                a: "Ha, kursni 100% tugatgandan so'ng sertifikat yuklab olishingiz mumkin." },
    { q: "Qaytarish mumkinmi?",                   a: "30 kun ichida so'rasangiz, to'lovni qaytarib beramiz." },
    { q: "Mobil qurilmada o'qish mumkinmi?",      a: "Ha, barcha qurilmalarda ishlaydi." },
    { q: "O'qituvchi bilan bog'lanish mumkinmi?", a: "Ha, har bir dars ostidagi izoh bo'limida savol berishingiz mumkin." },
  ];

  // ── Firebase progress yuklash ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Bepul kurs yoki pro plan bo'lsa purchased=true, lekin progress ham yuklansin
      const isFreeOrPro =
        course.price === 0 ||
        userPlan === "pro" ||
        userPlan === "premium";

      if (isFreeOrPro) setPurchased(true);

      if (!user) { setLoadingData(false); return; }

      try {
        const snap = await getDoc(doc(db, "users", user.uid, "progress", String(courseId)));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          setCompletedLessons(data.completedLessons || []);
          // Pullik kurs uchun purchased flagini ham tekshir
          if (!isFreeOrPro) setPurchased(data.purchased || false);
        }
      } catch (err) { console.error("Progress load error:", err); }
      finally { if (!cancelled) setLoadingData(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [user, courseId, course.price, userPlan]);

  // ── Darsni tugatish ────────────────────────────────────────────────────
 const markComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    const newCompleted = [...completedLessons, lessonId];
    setCompletedLessons(newCompleted); // Optimistic update
    const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "progress", String(courseId)),
        { courseId, courseTitle: course.title, completedLessons: newCompleted, purchased: true, progress: newProgress, lastStudied: serverTimestamp() },
        { merge: true }
      );
      await giveReward(user.uid, 10, "xp", "Darsni muvaffaqiyatli yakunladi");
      showToast?.(`+10 XP qo'shildi! ✅`, "success");
      
      if (newProgress === 100) {
        await setDoc(doc(db, "users", user.uid, "notifications", `course_${courseId}`),
          { title: "Kurs tugatildi! 🎉", message: `"${course.title}" muvaffaqiyatli tugatildi!`, type: "success", read: false, createdAt: serverTimestamp() }
        );
        
        // ------------------------------------------------------------------
        // YANGILANGAN QISM: courses sonini oshirish va Support unvonini berish
        // ------------------------------------------------------------------
        await setDoc(doc(db, "users", user.uid), { 
          courses: increment(1),
          isSupport: true, // Support qilib belgilaymiz
          supportSubjects: arrayUnion(course.category) // Qaysi fandan ekanligini massivga saqlaymiz
        }, { merge: true });
        
        // ✅ Kurs tugatilganda talabalar sonini oshir (bir marta)
        await setDoc(doc(db, "courses", String(courseId)), { students: increment(1) }, { merge: true });
        setRealStudents(prev => prev + 1);
        
        // Toast xabarini ham yangiladik
        showToast?.(`🎉 "${course.title}" tugatildi! Siz endi ${course.category} bo'yicha Support bo'ldingiz!`, "success");
      }
    } catch (err) {
      console.error("markComplete error:", err);
      // BUG #8 FIX — rollback optimistic update on network/Firestore failure
      setCompletedLessons(completedLessons);
      showToast?.("Saqlashda xatolik. Internetni tekshiring.", "error");
    }
  };

  // ── Kurs sotib olish ───────────────────────────────────────────────────
  const handlePurchaseSuccess = async () => {
    setPurchased(true);
    onPurchased?.(courseId);
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "progress", String(courseId)),
        { courseId, courseTitle: course.title, purchased: true, progress: 0, completedLessons: [], purchasedAt: serverTimestamp() },
        { merge: true }
      );
      // talabalar soni kurs tugatilganda oshadi (markComplete da)
    } catch (err) { console.error("Purchase error:", err); }
  };

  if (loadingData) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    // position:relative — AiPopup absolute pozitsiyasi uchun zarur
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px", position: "relative" }}>



      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        {t.backToCatalog}
      </button>

      {/* Kurs banner */}
      <ScrollReveal direction="up">
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 16, position: "relative" }}>
          <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "32px 24px 20px" }}>
            <span style={{ background: course.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{course.category}</span>
            <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 24, margin: "8px 0 4px" }}>{course.title}</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>⭐ {realRating || 0} · 👥 {(realStudents || 0).toLocaleString()} talaba</p>
          </div>
        </div>
      </ScrollReveal>



      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>

        {/* Chap qism */}
        <div style={{ flex: "1 1 520px" }}>

          {/* Progress */}
          {purchased && (
            <ScrollReveal direction="up">
              <div style={{ marginBottom: 20, padding: "16px 20px", background: darkMode ? "#1e293b" : "#fff", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: darkMode ? "#f1f5f9" : "#111" }}>{t.progressLabel}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>{progress}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: darkMode ? "#334155" : "#e5e7eb" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: progress === 100 ? "#10b981" : "#3b82f6", width: `${progress}%`, transition: "width 0.4s ease" }} />
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6b7280" }}>
                  {completedLessons.length} / {totalLessons} {t.lessonsCount} {t.completedLabel}
                  {progress === 100 ? " 🎉 — Kurs tugatildi!" : ""}
                </p>
                {progress === 100 && (
                  <button style={{ marginTop: 10, padding: "8px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.certificateBtn}</button>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            {[{ id: "lessons", label: t.lessonsTab }, { id: "reviews", label: t.reviewsTab }, { id: "faq", label: t.faqTab }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? "#3b82f6" : "#6b7280", borderBottom: `2px solid ${activeTab === tab.id ? "#3b82f6" : "transparent"}`, marginBottom: -1 }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Darslar */}
          {activeTab === "lessons" && (
            <div>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6b7280" }}>{course.sections.length} {t.sectionsCount} · {totalLessons} {t.lessonsCount}</p>
              {course.sections.map((section, si) => (
                <div key={si} style={{ marginBottom: 8 }}>
                  <button onClick={() => setOpenSections((prev) => prev.includes(si) ? prev.filter((x) => x !== si) : [...prev, si])}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{openSections.includes(si) ? "▾" : "▸"} {section.title}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{section.lessons.length} {t.lessonsCount}</span>
                  </button>
                  {openSections.includes(si) && (
                    <div style={{ borderRadius: "0 0 10px 10px", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderTop: "none", overflow: "hidden" }}>
                      {section.lessons.map((lesson) => {
                        const done   = completedLessons.includes(lesson.id);
                        const locked = !purchased && !lesson.free;
                        return (
                          <div key={lesson.id}
                            onClick={() => locked ? setShowPayment(true) : setPlayingLesson(lesson)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: done ? (darkMode ? "#0f2818" : "#f0fdf4") : (darkMode ? "#0f172a" : "#fff"), borderBottom: `1px solid ${darkMode ? "#1e293b" : "#f3f4f6"}`, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.6 : 1, transition: "background 0.15s" }}
                            onMouseEnter={(e) => { if (!locked) e.currentTarget.style.background = darkMode ? "#1e293b" : "#f8fafc"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = done ? (darkMode ? "#0f2818" : "#f0fdf4") : (darkMode ? "#0f172a" : "#fff"); }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${done ? "#10b981" : locked ? "#9ca3af" : "#3b82f6"}`, background: done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: done ? "#fff" : locked ? "#9ca3af" : "#3b82f6", flexShrink: 0 }}>
                              {done ? "✓" : locked ? "🔒" : "▶"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, color: darkMode ? "#e2e8f0" : "#374151" }}>{lesson.title}</span>
                              {lesson.free && !purchased && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", padding: "1px 6px", borderRadius: 4 }}>{t.freeLesson}</span>}
                              {done && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", padding: "1px 6px", borderRadius: 4 }}>✓ {t.completedLabel}</span>}
                            </div>
                            <span style={{ fontSize: 12, color: "#9ca3af" }}></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && <Reviews darkMode={darkMode} courseId={courseId} showToast={showToast} />}
          {activeTab === "faq" && <div>{faqs.map((faq, i) => <FaqItem key={i} faq={faq} darkMode={darkMode} />)}</div>}
        </div>

        {/* O'ng CTA */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 84, background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: purchased ? "#10b981" : "#3b82f6" }}>
              {course.price === 0 ? t.freeLabel : `${course.price.toLocaleString()} ${t.priceLabel}`}
            </p>
            {!purchased && course.price > 0 && <p style={{ margin: "0 0 14px", fontSize: 11, color: "#6b7280" }}>{t.oneTimePayment}</p>}
            {purchased ? (
              <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, background: "#d1fae5", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#065f46" }}>{t.enrolledLabel}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#065f46" }}>Progress: {progress}%</p>
              </div>
            ) : (
              <button onClick={() => course.price === 0 ? handlePurchaseSuccess() : setShowPayment(true)}
                style={{ width: "100%", padding: "13px 0", marginBottom: 10, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {course.price === 0 ? t.startFreeBtn : t.buyBtn}
              </button>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "📱", text: t.mobileAccess },
                { icon: "♾️", text: t.lifeTimeAccess },
                { icon: "🏆", text: t.certificate },
                { icon: "🔄", text: t.moneyBack },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#6b7280" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {playingLesson && (
        <VideoLessonModal lesson={playingLesson} courseColor={course.color}
          courseRating={realRating} courseStudents={realStudents}
          courseId={courseId} courseCategory={course.category}
          onClose={(wasCompleted) => {
            setPlayingLesson(null);
            if (wasCompleted === true) {
              // Faqat kurs 100% tugatilganda baholash oynasi chiqsin
              const newCompleted = completedLessons.includes(playingLesson?.id)
                ? completedLessons
                : [...completedLessons, playingLesson?.id];
              const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
              if (newProgress === 100) {
                setTimeout(() => setShowRatingModal(true), 600);
              }
            }
          }}
          onComplete={markComplete} darkMode={darkMode} />
      )}
      {showPayment && <PaymentModal course={course} onClose={() => setShowPayment(false)} onSuccess={handlePurchaseSuccess} darkMode={darkMode} />}
      {showRatingModal && <RatingModal courseId={courseId} darkMode={darkMode} onClose={() => setShowRatingModal(false)} />}
    </div>
  );
};

export default CourseDetail;