import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LuPlay, LuCheck, LuStar, LuBot, LuMessageSquare, LuX, LuChevronRight, LuSend, LuTrash2, LuSmile,
  LuPartyPopper, LuUsers, LuArrowRight, LuArrowLeft, LuLock, LuSmartphone, LuInfinity, LuAward, LuRotateCcw,
  LuCreditCard, LuBookOpen, LuZap
} from "react-icons/lu";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, addDoc, onSnapshot, orderBy, query,
  increment, getDocs, where, arrayUnion
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import CourseDetailContent from "./CourseDetailContent";
import { db } from "../firebase/config";
import { completeRealTask } from "../utils/taskManager"; 

// MODERN CSS
const MODERN_CSS = `
  @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes scale-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes spin { to { transform: rotate(360deg) } }
  .animate-slide-up { animation: slide-up 0.4s ease-out both; }
  .animate-scale-in { animation: scale-in 0.3s ease-out both; }
`;

const catGradients = {
  HTML: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  CSS: "linear-gradient(135deg, #4ecdc4 0%, #44a3aa 100%)",
  JavaScript: "linear-gradient(135deg, #ffe66d 0%, #f7b731 100%)",
  React: "linear-gradient(135deg, #45b7d1 0%, #2d98da 100%)",
  English: "linear-gradient(135deg, #96ceb4 0%, #5f9ea0 100%)",
  Russian: "linear-gradient(135deg, #feca57 0%, #e1b12c 100%)",
  French: "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)"
};

// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
// COURSES DATA
// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
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
      { title: "Grammatika", lessons: [{ id: 4, title: "Ot va sifat", free: false }, { id: 5, title: "Padejlar (Падежlar)", free: false }, { id: 6, title: "Fe'llar", free: false }, { id: 7, title: "Sonlar", free: false }] },
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

// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
// STARS
// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
const Stars = ({ rating, interactive = false, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} onClick={() => interactive && onChange?.(s)}
        style={{ fontSize: interactive ? 24 : 14, color: s <= rating ? "#f59e0b" : "#d1d5db", cursor: interactive ? "pointer" : "default" }}><LuStar /></span>
    ))}
  </div>
);

// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
// REVIEWS
// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
const Reviews = ({ darkMode, courseId, isModal = false, onFinish, showToast }) => {
  const { t } = useLang();
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
    const timer = setTimeout(async () => {
      try {
        const existingQ = query(
          collection(db, "courses", String(courseId), "reviews"),
          where("uid", "==", user.uid)
        );
        const existingSnap = await getDocs(existingQ);
        if (!existingSnap.empty) {
          showToast?.(t.alreadyReviewed, "error");
          setLoading(false);
          return;
        }
        await addDoc(collection(db, "courses", String(courseId), "reviews"), {
          uid: user.uid, name: user.displayName || user.email,
          avatar: user.photoURL || null, rating: newReview.rating,
          text: newReview.text, createdAt: serverTimestamp(),
        });
        await giveReward(user.uid, 5, "xp", t.reviewReward);
        setSubmitted(true);
        setNewReview({ rating: 5, text: "" });
        if (isModal && onFinish) setTimeout(() => onFinish(), 1500);
        else setTimeout(() => setSubmitted(false), 3000);
      } catch (err) { console.error("Review error:", err); }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{allReviews.length} {t.courseReviewsCount}</div>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const cnt = allReviews.filter((r) => r.rating === star).length;
              const pct = allReviews.length ? Math.round((cnt / allReviews.length) * 100) : 0;
              return (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", width: 16 }}>{star}</span>
                  <span style={{ fontSize: 12, color: "#f59e0b" }}><LuStar /></span>
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
          {t.courseLoginToReview} <a href="/login" style={{ color: "#3b82f6", fontWeight: 600 }}>{t.login}</a>
        </div>
      ) : (
        <div style={{ marginBottom: isModal ? 0 : 20, padding: "20px", background: darkMode ? "#1e293b" : "#fff", borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" }}>
                <LuCheck size={32} />
              </div>
              <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111" }}>{t.courseReviewSuccess}</p>
              <button onClick={() => { setSubmitted(false); setNewReview({ rating: 5, text: "" }); }} style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {t.writeAnotherReview}
              </button>
            </div>
          ) : (
            <>
              <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111", textAlign: "center" }}>
                {isModal ? t.courseRateLesson : t.courseWriteReview}
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <Stars rating={newReview.rating} interactive onChange={(r) => setNewReview({ ...newReview, rating: r })} />
              </div>
              <textarea rows={3} placeholder={t.courseReviewPlaceholder} value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `2px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 16 }}
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={handleSubmit} disabled={loading || !newReview.text.trim()}
                  style={{ padding: "12px 32px", background: loading ? "#93c5fd" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading || !newReview.text.trim() ? "default" : "pointer", opacity: !newReview.text.trim() ? 0.6 : 1, display: "flex", alignItems: "center", gap: 10 }}>
                  {loading ? t.sending : <><LuSend size={18} /> {t.courseSend}</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!isModal && (
        allReviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, padding: "20px 0" }}>{t.courseNoReviews} <LuStar className="inline" /></p>
        ) : (
          allReviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 14, padding: "14px 16px", background: darkMode ? "#1e293b" : "#fff", borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, overflow: "hidden", flexShrink: 0 }}>
                  {r.avatar ? <img src={r.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>{r.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{r.createdAt?.toDate?.()?.toLocaleDateString("uz") || t.courseJustNow}</p>
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

// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
// RATING MODAL
// ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ”Ђ
const RatingModal = ({ courseId, onClose, darkMode }) => {
  const { t } = useLang();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ width: "100%", maxWidth: 420, background: darkMode ? "#1e293b" : "#fff", borderRadius: 24, padding: 30, textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}><LuStar className="text-amber-500" /></div>
        <h2 style={{ color: darkMode ? "#fff" : "#111", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>{t.courseHowWasLesson}</h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>{t.courseRateAndWin}</p>
        <Reviews courseId={courseId} darkMode={darkMode} isModal={true} onFinish={onClose} showToast={undefined} />
        <button onClick={onClose} style={{ marginTop: 16, background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{t.courseLater}</button>
      </div>
    </div>
  );
};

// •ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ
// AI LESSON MODAL —” Comprehensive AI-Tutor Engine (v2)
// •ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ•ђ

/* ”Ђ”Ђ”Ђ CSS injected once ”Ђ”Ђ”Ђ */
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

/* ”Ђ”Ђ”Ђ Typewriter hook ”Ђ”Ђ”Ђ */
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

/* ”Ђ”Ђ”Ђ Syntax-highlight tokens (no external lib) ”Ђ”Ђ”Ђ */
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
  return h;
};
const CodeBlock = ({ code, lang = "js", accent }) => {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const ext = { js: "script.js", jsx: "App.jsx", html: "index.html", css: "styles.css", ts: "main.ts" }[lang] || "code.txt";
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${accent}44`, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#161b22" }}>
        {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 8, fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{ext}</span>
        <button onClick={copy} style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 6, border: `1px solid ${accent}55`, background: "transparent", color: copied ? "#4ade80" : accent, fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all .2s" }}>
          {copied ? `њ“ ${t.courseCopied}` : t.courseCopy}
        </button>
      </div>
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

/* ”Ђ”Ђ”Ђ Mini Quiz ”Ђ”Ђ”Ђ */
const MiniQuiz = ({ quiz, accent, darkMode }) => {
  const { t } = useLang();
  const [sel, setSel]   = useState(null);
  const [show, setShow] = useState(false);
  const text  = darkMode ? "#f1f5f9" : "#111827";
  const cardBg = darkMode ? "rgba(30,41,59,.6)" : "rgba(248,250,252,.9)";

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: `${accent}22`, color: accent, fontSize: 11 }}>{t.courseQuestion}</span>
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
                {show && isCorrect ? <LuCheck size={12} /> : show && isSelected && !isCorrect ? <LuX size={12} /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {sel !== null && !show && (
        <button onClick={() => setShow(true)} style={{ marginTop: 12, padding: "9px 22px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {t.showAnswerBtn}
        </button>
      )}
      {show && (
        <div className="ai-fade-up" style={{ marginTop: 12, padding: "12px 16px", borderRadius: 11, background: darkMode ? "rgba(16,185,129,.12)" : "#f0fdf4", border: "1px solid #4ade8055", fontSize: 13, color: darkMode ? "#86efac" : "#166534", lineHeight: 1.7 }}>
          💡 <strong>{t.explanationLabel}:</strong> {quiz.explanation}
        </div>
      )}
    </div>
  );
};

/* ”Ђ”Ђ”Ђ AI Chat Panel ”Ђ”Ђ”Ђ */
const AIChatPanel = ({ lessonTitle, slideTitle, accent, darkMode, onClose }) => {
  const { t } = useLang();
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
        t.aiError;
      setMsgs([...newMsgs, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([...newMsgs, { role: "assistant", content: t.networkError }]);
    }
    setLoading(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  return (
    <div className="ai-pop-in" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: panelBg, borderTop: `1.5px solid ${accent}55`, borderRadius: "18px 18px 0 0", display: "flex", flexDirection: "column", height: 340, zIndex: 20, backdropFilter: "blur(20px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${accent},${accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, animation: "ai-breathe 2.5s ease-in-out infinite" }}><LuBot /></div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{t.aiTutorName}</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>{t.aiTopic}: {slideTitle}</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, color: "#94a3b8", cursor: "pointer" }}><LuX /></button>
      </div>
      <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13, paddingTop: 20 }}>
            <LuMessageSquare style={{ display: 'inline', marginRight: 6 }} /> {t.courseChatEmpty}
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
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && ask()}
          placeholder={t.courseAskQuestion}
          style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${darkMode ? "#334155" : "#e2e8f0"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: text, fontSize: 13, outline: "none" }} />
        <button onClick={ask} disabled={!q.trim() || loading}
          style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: q.trim() && !loading ? accent : "#94a3b8", color: "#fff", fontSize: 13, fontWeight: 700, cursor: q.trim() && !loading ? "pointer" : "default", transition: "background .2s" }}>
          {loading ? <><LuRotateCcw className="inline animate-spin" /> {t.checking}...</> : <><LuSend className="inline" /> {t.send}</>}
        </button>
      </div>
    </div>
  );
};

/* ”Ђ—Ђ—Ђ Slide Content Renderer ”Ђ—Ђ—Ђ */
const SlideContent = ({ content, accent, darkMode }) => {
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const sub  = darkMode ? "#94a3b8"  : "#64748b";
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
                <span style={{ color: "#10b981", fontSize: 16, flexShrink: 0 }}><LuCheck /></span>
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

/* ”Ђ—Ђ—Ђ Top Progress Bar ”Ђ—Ђ—Ђ */
const TopProgressBar = ({ pct, accent }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,.06)", zIndex: 5 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${accent},${accent}cc)`, transition: "width 0.5s cubic-bezier(.22,.68,0,1.2)", boxShadow: `0 0 10px ${accent}99` }} />
  </div>
);

/* ”Ђ—Ђ—Ђ AI Avatar (speaks slide intro via typewriter) ”Ђ—Ђ—Ђ */
const AIAvatar = ({ text, accent, darkMode, done }) => {
  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const { out } = useTypewriter(text, 22);
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${darkMode ? "#1e293b" : "#e2e8f0"}`, flexShrink: 0, background: darkMode ? `${accent}0a` : `${accent}07` }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${accent}ee,${accent}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: "ai-breathe 3s ease-in-out infinite", boxShadow: `0 0 0 3px ${accent}33` }}><LuBot /></div>
        <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%", background: "#4ade80", border: "2px solid " + (darkMode ? "#0d1117" : "#fff"), animation: "ai-pulse 2s infinite" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>{t.aiTutorName}</span>
          <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: `${accent}22`, color: accent }}>{t.liveLabel}</span>
        </div>
        <div style={{ fontSize: 13.5, color: textColor, lineHeight: 1.65, minHeight: 22 }}>
          {out}{!done && <span className="ai-tw-cursor" style={{ color: accent }}>|</span>}
        </div>
      </div>
    </div>
  );
};

/* ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
   AILessonModal  †ђ  MAIN EXPORT
”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ */
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

  const { t } = useLang();
  
  const avatarLines = {
    intro:     t.avatarIntro?.replace('{title}', lesson.title) || `Salom! Men Uzbekas AI —” sizning shaxsiy o'qituvchingizman. Bugun "${lesson.title}" mavzusidan boshlaymiz. Tayyor bo'lsangiz, keling!`,
    theory:    t.avatarTheory || `Ajoyib! Endi nazariyani o'rganamiz. Bu qism muhim —” diqqat bilan o'qing. Har bir tushunchani tushunish keyingi bosqich uchun poydevor.`,
    code:      t.avatarCode || `Kodni ko'rishga tayyor bo'ling! Har bir satrni o'qing, kommentariyalarga e'tibor bering. Keyin o'zingiz ham yozib ko'ring —” bu eng yaxshi usul.`,
    challenge: t.avatarChallenge || `Bilimingizni sinash vaqti! Bu savol o'rganganlaringizni mustahkamlaydi. Xavotir olmang —” xato ham o'rganish. Javobni tanlang.`,
    practices: t.avatarPractices || `Ajoyib ish! Endi professional standartlarni o'rganamiz. Bular katta kompaniyalarda qo'llaniladigan qoidalar. Yodda saqlang.`,
    summary:   t.avatarSummary || `Darsni muvaffaqiyatli yakunladingiz! Siz bugun juda ko'p narsa o'rgandingiz. "Tugatdim" tugmasini bosib, XP yutib oling!`,
  };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);


  const goTo = (idx) => {
    if (idx < 0 || idx >= slides.length) return;
    setViewed(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    setAvatarDone(false);
    setDir(idx > cur ? 1 : -1);
    setAnimKey(k => k + 1);
    setCur(idx);
    setShowChat(false);
  };

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
        <TopProgressBar pct={pct} accent={accent} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: headerBg, borderBottom: `1px solid ${borderC}`, flexShrink: 0, paddingTop: 18 }}>
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
          <div style={{ textAlign: "center", flex: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lesson.title}</div>
            <div style={{ fontSize: 10.5, color: textSub, marginTop: 2 }}>{viewed.size}/{slides.length} {t.slidesViewed} • {pct}% {t.completedLabel}</div>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            <button onClick={() => setShowChat(v => !v)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${accent}`, background: showChat ? accent : "transparent", color: showChat ? "#fff" : accent, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all .2s" }}>
              <LuBot /> {t.aiChat}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280" }}><LuX /></button>
          </div>
        </div>
        <AIAvatar
          key={`av-${cur}`}
          text={avatarLines[slide.type] || avatarLines.intro}
          accent={accent}
          darkMode={darkMode}
          done={avatarDone}
        />
        <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px", position: "relative" }}>
          <div key={`slide-${animKey}`} className={slideClass}>
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, position: "relative" }}>
              <img src={lesson.thumbnail || "https://placehold.co/800x400/3b82f6/ffffff?text=Lesson"} alt={lesson.title} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 24px 20px" }}>
                <span style={{ background: accent, color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>{lesson.category || t.aiLesson}</span>
                <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 24, margin: "12px 0 8px" }}>{lesson.title}</h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}><LuStar className="inline text-amber-400" /> {courseRating || 0} · <LuUsers className="inline text-indigo-400" /> {(courseStudents || 0).toLocaleString()} {t.students}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg,${typeBg}44,${typeBg}18)`, border: `1.5px solid ${typeBg}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {slide.icon}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: `${typeBg}22`, color: typeBg, letterSpacing: "0.1em" }}>{slide.label}</span>
                  <span style={{ fontSize: 10, color: textSub }}>{cur + 1} / {slides.length}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: textMain, lineHeight: 1.3 }}>{slide.title}</div>
              </div>
            </div>
            <SlideContent content={slide.content} accent={accent} darkMode={darkMode} />
          </div>
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
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${borderC}`, background: headerBg, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="ai-nav-btn"
              disabled={cur === 0}
              onClick={() => goTo(cur - 1)}
              style={{ padding: "12px 22px", borderRadius: 13, border: `1.5px solid ${borderC}`, background: "transparent", color: cur === 0 ? "#475569" : textMain, fontSize: 13, fontWeight: 600, cursor: cur === 0 ? "not-allowed" : "pointer", opacity: cur === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: 6 }}>
              †ђ {t.prev}
            </button>
            {!isLast ? (
              <button
                className="ai-nav-btn"
                onClick={() => goTo(cur + 1)}
                style={{ flex: 1, padding: "12px 22px", borderRadius: 13, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `0 4px 18px ${accent}60` }}>
                {t.nextSlide} <LuArrowRight />
              </button>
            ) : (
              <button
                className="ai-nav-btn"
                disabled={!allDone}
                onClick={() => { onComplete(lesson.id); onClose(true); }}
                style={{ flex: 1, padding: "12px 22px", borderRadius: 13, border: "none", background: allDone ? "#10b981" : "#334155", color: "#fff", fontSize: 13, fontWeight: 700, cursor: allDone ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: allDone ? "0 4px 18px rgba(16,185,129,.45)" : "none", transition: "all .3s" }}>
                {allDone ? <><LuPartyPopper /> {t.finishAndEarn}</> : `${t.viewAllSlides} (${viewed.size}/${slides.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
// FAQ ITEM
// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
const FaqItem = ({ faq, darkMode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: open ? "10px 10px 0 0" : 10, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>{faq.q}</span>
        <span style={{ color: "#6b7280", fontSize: 16 }}>{open ? "€’" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "12px 16px", background: darkMode ? "#0f172a" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderTop: "none", borderRadius: "0 0 10px 10px", fontSize: 13, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.7 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
};

// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
// PAYMENT MODAL
// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
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
            {step === 3 ? <><LuCheck className="inline text-emerald-500" /> {t.paymentSuccess}</> : <><LuCreditCard className="inline" /> {t.paymentTitle}</>}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280" }}><LuX /></button>
        </div>
        <div style={{ padding: 20 }}>
          {step === 1 && (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 18, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{course.title}</p>
                <p style={{ margin: "8px 0 0", fontWeight: 800, fontSize: 20, color: "#3b82f6" }}>{course.price.toLocaleString()} {t.currency}</p>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[{ id: "card", label: t.payCard }, { id: "payme", label: t.payPayme }, { id: "click", label: t.payClick }].map((m) => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `2px solid ${method === m.id ? "#3b82f6" : darkMode ? "#334155" : "#e5e7eb"}`, background: method === m.id ? (darkMode ? "#1e3a5f" : "#eff6ff") : "transparent", color: method === m.id ? "#3b82f6" : darkMode ? "#94a3b8" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{ width: "100%", padding: "12px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t.continue} <LuArrowRight /></button>
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
                <span style={{ fontSize: 13, color: "#6b7280" }}>{t.total}:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#3b82f6" }}>{course.price.toLocaleString()} {t.currency}</span>
              </div>
              <button onClick={handlePay} disabled={loading}
                style={{ width: "100%", padding: "12px 0", background: loading ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
                {loading ? <><LuRotateCcw className="inline animate-spin" /> {t.checking}...</> : <><LuCreditCard className="inline" /> {t.pay} {course.price.toLocaleString()} {t.currency}</>}
              </button>
            </>
          )}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}><LuPartyPopper className="text-emerald-500" /></div>
              <p style={{ fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111", margin: "0 0 6px" }}>{t.congratulations}!</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>"{course.title}" {t.enrolledSuccess}</p>
              <button onClick={() => { onSuccess(); onClose(); }}
                style={{ padding: "11px 28px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {t.startLearning} <LuArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
// MAIN COURSEDETAIL
// ”Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ—Ђ
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
  const navigate = useNavigate();

  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0);
  const progress     = Math.round((completedLessons.length / totalLessons) * 100);

  const faqs = [
    { q: t.faqAccess, a: t.faqAccessAnswer },
    { q: t.faqCertificate, a: t.faqCertificateAnswer },
    { q: t.faqRefund, a: t.faqRefundAnswer },
    { q: t.faqMobile, a: t.faqMobileAnswer },
    { q: t.faqContact, a: t.faqContactAnswer },
  ];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const isFreeOrPro = course.price === 0 || userPlan === "pro" || userPlan === "premium";
      if (isFreeOrPro) setPurchased(true);
      if (!user) { setLoadingData(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "progress", String(courseId)));
        if (!cancelled && snap.exists()) {
          const data = snap.data();
          setCompletedLessons(data.completedLessons || []);
          if (!isFreeOrPro) setPurchased(data.purchased || false);
        }
      } catch (err) { console.error("Progress load error:", err); }
      finally { if (!cancelled) setLoadingData(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [user, courseId, course.price, userPlan]);

  const markComplete = async (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    const newCompleted = [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);
    const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "progress", String(courseId)),
        { courseId, courseTitle: course.title, completedLessons: newCompleted, purchased: true, progress: newProgress, lastStudied: serverTimestamp() },
        { merge: true }
      );
      await giveReward(user.uid, 10, "xp", t.lessonCompletedReward);
      showToast?.(`+10 ${t.xpAdded}`, "success");
      await completeRealTask(user.uid, "watch_lesson", showToast);
      await completeRealTask(user.uid, "watch_3lessons", showToast);
      
      if (newProgress === 100) {
        await setDoc(doc(db, "users", user.uid, "notifications", `course_${courseId}`),
          { title: t.courseCompletedTitle, message: t.courseCompletedMessage.replace('{title}', course.title), type: "success", read: false, createdAt: serverTimestamp() }
        );
        await setDoc(doc(db, "users", user.uid), { 
          courses: increment(1),
          isSupport: true,
          supportSubjects: arrayUnion(course.category)
        }, { merge: true });
        await setDoc(doc(db, "courses", String(courseId)), { students: increment(1) }, { merge: true });
        setRealStudents(prev => prev + 1);
        showToast?.(t.courseCompletedSupport.replace('{title}', course.title).replace('{category}', course.category), "success");
      }
    } catch (err) {
      console.error("markComplete error:", err);
      setCompletedLessons(completedLessons);
      showToast?.(t.saveError, "error");
    }
  };

  const handlePurchaseSuccess = async () => {
    setPurchased(true);
    onPurchased?.(courseId);
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "progress", String(courseId)),
        { courseId, courseTitle: course.title, purchased: true, progress: 0, completedLessons: [], purchasedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) { console.error("Purchase error:", err); }
  };

  if (loadingData) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <style>{MODERN_CSS}</style>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const bgColor = darkMode ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.9)";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const textMain = darkMode ? "#f1f5f9" : "#0f172a";
  const textSub = darkMode ? "#94a3b8" : "#64748b";
  const gradient = catGradients[course.category] || "linear-gradient(135deg, #3b82f6, #8b5cf6)";

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "24px 20px 80px" }}>
      <style>{MODERN_CSS}</style>
      
      {/* Back Button */}
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
        <LuArrowLeft /> {t.backToCatalog}
      </button>

      {/* Hero Banner */}
      <div className="animate-slide-up" style={{ borderRadius: 24, overflow: "hidden", marginBottom: 24, position: "relative" }}>
        <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: 280, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 28px 28px" }}>
          <span style={{ background: gradient, color: "#fff", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 20 }}>{course.category}</span>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 32, margin: "12px 0 8px" }}>{course.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, fontWeight: 700 }}>
            {realRating > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fbbf24" }}><LuStar fill="currentColor" /> {realRating}</span>
            )}
            {realStudents > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}><LuUsers /> {realStudents.toLocaleString()} {t.students}</span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}><LuBookOpen /> {totalLessons} {t.lessons}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <div style={{ flex: "1 1 520px" }}>
          {purchased && (
            <div className="animate-slide-up" style={{ marginBottom: 24, padding: "24px", background: bgColor, backdropFilter: "blur(20px)", borderRadius: 20, border: `1px solid ${borderColor}`, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: textMain }}>{t.progressLabel}</span>
                <span style={{ fontSize: 15, fontWeight: 900, background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{progress}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, background: gradient, width: `${progress}%`, transition: "width 0.5s ease" }} />
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13, color: textSub }}>
                {completedLessons.length} / {totalLessons} {t.lessonsCompleted}
                {progress === 100 && <span style={{ marginLeft: 8, color: "#10b981", fontWeight: 700 }}>- {t.courseCompleted}</span>}
              </p>
              {progress === 100 && (
                <button onClick={() => navigate("/certificate")} style={{ marginTop: 12, padding: "12px 20px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <LuAward size={18} /> {t.certificateBtn}
                </button>
              )}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: `2px solid ${borderColor}` }}>
            {["lessons", "reviews", "faq"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 24px", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, color: activeTab === tab ? "#3b82f6" : textSub, borderBottom: `3px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`, marginBottom: -2, transition: "all 0.3s" }}>
                {tab === "lessons" ? t.lessonsTab : tab === "reviews" ? t.reviewsTab : t.faqTab}
              </button>
            ))}
          </div>

          {activeTab === "lessons" && (
            <div className="animate-slide-up">
              {course.sections.map((section, si) => (
                <div key={si} style={{ marginBottom: 16 }}>
                  <button onClick={() => setOpenSections((prev) => prev.includes(si) ? prev.filter((x) => x !== si) : [...prev, si])}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderRadius: 16, background: bgColor, backdropFilter: "blur(20px)", border: `1px solid ${borderColor}`, cursor: "pointer", textAlign: "left", transition: "all 0.3s" }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: textMain }}>{section.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, color: textSub, fontWeight: 600 }}>{section.lessons.length} {t.lessons}</span>
                      <span style={{ color: "#3b82f6", fontSize: 20, transform: openSections.includes(si) ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                        <LuChevronRight style={{ transform: "rotate(90deg)" }} />
                      </span>
                    </div>
                  </button>
                  {openSections.includes(si) && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                      {section.lessons.map((lesson) => {
                        const done = completedLessons.includes(lesson.id);
                        const locked = !purchased && !lesson.free;
                        return (
                          <div key={lesson.id}
                            onClick={() => locked ? setShowPayment(true) : setPlayingLesson(lesson)}
                            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, background: done ? (darkMode ? "rgba(16,185,129,0.2)" : "#f0fdf4") : bgColor, border: `1px solid ${borderColor}`, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.5 : 1, transition: "all 0.2s" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? "#10b981" : locked ? "#64748b" : "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                              {done ? <LuCheck size={18} /> : locked ? <LuLock size={18} /> : <LuPlay size={18} />}
                            </div>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: textMain }}>{lesson.title}</span>
                            {lesson.free && !purchased && <span style={{ fontSize: 11, fontWeight: 800, background: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: 8 }}>{t.free}</span>}
                            {done && <span style={{ fontSize: 11, fontWeight: 800, background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: 8 }}>{t.completedLabel}</span>}
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
          {activeTab === "faq" && (
            <div className="animate-slide-up">
              {faqs.map((faq, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <details style={{ background: bgColor, borderRadius: 16, border: `1px solid ${borderColor}` }}>
                    <summary style={{ padding: "20px 24px", fontWeight: 700, fontSize: 15, color: textMain, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {faq.q}
                      <LuChevronRight style={{ color: "#3b82f6", transform: "rotate(90deg)" }} />
                    </summary>
                    <div style={{ padding: "0 24px 20px", fontSize: 14, color: textSub, lineHeight: 1.7 }}>{faq.a}</div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="animate-slide-up" style={{ position: "sticky", top: 20, background: bgColor, backdropFilter: "blur(20px)", borderRadius: 24, border: `1px solid ${borderColor}`, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            {!purchased && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 36, background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {course.price === 0 ? t.free : `${course.price.toLocaleString()} ${t.sum}`}
                </p>
                {course.price > 0 && <p style={{ margin: "8px 0 0", fontSize: 13, color: textSub }}>{t.oneTimePayment}</p>}
              </div>
            )}
            
            {purchased ? (
              <div style={{ padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", gap: 16, color: "#fff" }}>
                <LuCheck size={32} />
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{t.purchased}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>{t.progressLabel}: {progress}%</p>
                </div>
              </div>
            ) : (
              <button onClick={() => course.price === 0 ? handlePurchaseSuccess() : setShowPayment(true)} style={{ width: "100%", padding: "16px", background: gradient, color: "#fff", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 30px rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {course.price === 0 ? t.startFree : t.buyBtn} <LuArrowRight />
              </button>
            )}
            
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ icon: LuInfinity, text: t.lifeTimeAccess }, { icon: LuAward, text: t.certificate }, { icon: LuSmartphone, text: t.mobileAccess }, { icon: LuZap, text: t.moneyBack }].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <IconComponent size={20} color="#3b82f6" />
                    </div>
                    <span style={{ fontSize: 15, color: textMain, fontWeight: 600 }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {playingLesson && (
  <CourseDetailContent
    lesson={playingLesson}
    courseId={courseId}
    courseColor={course.color}
    darkMode={darkMode}
    onClose={(wasCompleted) => {
      setPlayingLesson(null);
      if (wasCompleted === true) {
        const newCompleted = completedLessons.includes(playingLesson?.id)
          ? completedLessons
          : [...completedLessons, playingLesson?.id];
        const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
        if (newProgress === 100) {
          setTimeout(() => setShowRatingModal(true), 600);
        }
      }
    }}
    onComplete={markComplete}
  />
)}
      {showPayment && <PaymentModal course={course} onClose={() => setShowPayment(false)} onSuccess={handlePurchaseSuccess} darkMode={darkMode} />}
      {showRatingModal && <RatingModal courseId={courseId} darkMode={darkMode} onClose={() => setShowRatingModal(false)} />}
    </div>
  );
};

export default CourseDetail;

