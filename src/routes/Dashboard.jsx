import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";

// ─── Kurslar ro'yxati ──────────────────────────────────────────────────────────
const defaultCourses = [
  { id: "html",    title: "HTML Asoslar",       category: "HTML",       color: "#e44d26", total: 12 },
  { id: "css",     title: "CSS & Flexbox",       category: "CSS",        color: "#264de4", total: 9  },
  { id: "js",      title: "JavaScript To'liq",   category: "JavaScript", color: "#d4a017", total: 20 },
  { id: "english", title: "Ingliz Tili A1→B2",   category: "English",    color: "#003580", total: 30 },
];

// ─── Yutuqlar ──────────────────────────────────────────────────────────────────
const achievementsList = [
  { icon: "🔥", label: "7 kunlik streak",  key: "streak7"    },
  { icon: "🎓", label: "Birinchi kurs",    key: "firstCourse" },
  { icon: "⚡", label: "Tez o'rganuvchi",  key: "fastLearner" },
  { icon: "💎", label: "Pro a'zo",         key: "proMember"   },
  { icon: "🏆", label: "5 kurs tugatdi",   key: "five"        },
  { icon: "🌟", label: "Top 10 o'quvchi",  key: "top10"       },
];

const MiniBar = ({ value, max, color, darkMode }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ width: 28, height: 80, borderRadius: 6, background: darkMode ? "#334155" : "#f1f5f9", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
      <div style={{ width: "100%", height: `${pct}%`, background: color, borderRadius: 6, transition: "height 0.6s ease" }} />
    </div>
  );
};

const Dashboard = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]   = useState("overview");
  const [loading, setLoading]       = useState(true);
  const [courses, setCourses]       = useState([]);
  const [activity, setActivity]     = useState([]);
  const [stats, setStats]           = useState({ totalMinutes: 0, quizAvg: 0, streak: 0 });
  const [weekly, setWeekly]         = useState({ Du: 0, Se: 0, Ch: 0, Pa: 0, Ju: 0, Sh: 0, Ya: 0 });
  const [achievements, setAchievements] = useState({});

  // ─── Firestore dan olish ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const init = async () => {
      setLoading(true);
      try {
        // 1. Har bir kurs uchun progress
        const progressData = [];
        for (const course of defaultCourses) {
          const ref  = doc(db, "users", uid, "progress", course.id);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            const completed = d.completed || 0;
            progressData.push({
              ...course,
              completed,
              progress: Math.round((completed / course.total) * 100),
            });
          } else {
            await setDoc(ref, { completed: 0, total: course.total, updatedAt: serverTimestamp() });
            progressData.push({ ...course, completed: 0, progress: 0 });
          }
        }
        setCourses(progressData);

        // 2. Stats
        const statsRef  = doc(db, "users", uid, "data", "stats");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          setStats(statsSnap.data());
        } else {
          const def = { totalMinutes: 0, quizAvg: 0, streak: 0 };
          await setDoc(statsRef, def);
          setStats(def);
        }

        // 3. Haftalik daqiqalar
        const weeklyRef  = doc(db, "users", uid, "data", "weekly");
        const weeklySnap = await getDoc(weeklyRef);
        if (weeklySnap.exists()) {
          setWeekly(weeklySnap.data());
        } else {
          const def = { Du: 0, Se: 0, Ch: 0, Pa: 0, Ju: 0, Sh: 0, Ya: 0 };
          await setDoc(weeklyRef, def);
          setWeekly(def);
        }

        // 4. Faollik
        const actRef  = doc(db, "users", uid, "data", "activity");
        const actSnap = await getDoc(actRef);
        if (actSnap.exists()) setActivity(actSnap.data().list || []);

        // 5. Yutuqlar
        const achRef  = doc(db, "users", uid, "data", "achievements");
        const achSnap = await getDoc(achRef);
        if (achSnap.exists()) setAchievements(achSnap.data());

      } catch (err) {
        console.error(err);
        showToast && showToast("Ma'lumot olishda xato", "error");
      }
      setLoading(false);
    };

    init();
  }, [user]);

  // ─── Dars belgilash ───────────────────────────────────────────────────────
  const markLesson = async (courseId) => {
    if (!user) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.completed >= course.total) return;

    const newCompleted = course.completed + 1;
    const newProgress  = Math.round((newCompleted / course.total) * 100);

    // Firestore update
    await updateDoc(doc(db, "users", user.uid, "progress", courseId), {
      completed: newCompleted, updatedAt: serverTimestamp(),
    });

    // Local state update
    setCourses((prev) => prev.map((c) =>
      c.id === courseId ? { ...c, completed: newCompleted, progress: newProgress } : c
    ));

    // Faollikka yozish
    const newItem = newProgress === 100
      ? { icon: "🏆", text: `${course.title} kursi tugatildi!`, time: "Hozirgina", color: "#10b981" }
      : { icon: "📚", text: `${course.title} — dars ${newCompleted} tugatildi`, time: "Hozirgina", color: course.color };

    const actRef  = doc(db, "users", user.uid, "data", "activity");
    const actSnap = await getDoc(actRef);
    const oldList = actSnap.exists() ? (actSnap.data().list || []) : [];
    const newList = [newItem, ...oldList].slice(0, 10);
    await setDoc(actRef, { list: newList });
    setActivity(newList);

    // Yutuq
    if (newProgress === 100) {
      await unlockAchievement("firstCourse");
      showToast && showToast(`🎉 ${course.title} tugatildi!`, "success");
    } else {
      showToast && showToast(`✅ Dars ${newCompleted} belgilandi`, "success");
    }

    // Haftalik +30 daqiqa qo'shish (demo)
    const days = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
    const today = days[new Date().getDay()];
    const weeklyRef = doc(db, "users", user.uid, "data", "weekly");
    const newWeekly = { ...weekly, [today]: (weekly[today] || 0) + 30 };
    await setDoc(weeklyRef, newWeekly);
    setWeekly(newWeekly);
  };

  const unlockAchievement = async (key) => {
    if (!user || achievements[key]) return;
    const newAch = { ...achievements, [key]: true };
    await setDoc(doc(db, "users", user.uid, "data", "achievements"), newAch);
    setAchievements(newAch);
    showToast && showToast("🏆 Yangi yutuq qo'lga kiritildi!", "success");
  };

  // ─── Computed ─────────────────────────────────────────────────────────────
  const weeklyArr  = Object.entries(weekly).map(([day, minutes]) => ({ day, minutes }));
  const maxMin     = Math.max(...weeklyArr.map((d) => d.minutes), 1);
  const totalMin   = weeklyArr.reduce((a, d) => a + d.minutes, 0);
  const completed  = courses.filter((c) => c.progress === 100).length;

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";
  const photoURL    = user?.photoURL || null;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const statCards = [
    { icon: "📚", label: "Yozilgan kurslar",  value: courses.length,                        color: "#3b82f6" },
    { icon: "✅", label: "Tugatilgan",         value: completed,                             color: "#10b981" },
    { icon: "⏱", label: "Bu hafta",           value: `${Math.round(totalMin / 60)}h`,       color: "#f59e0b" },
    { icon: "🎯", label: "Quiz ball (o'rt.)",  value: stats.quizAvg > 0 ? `${stats.quizAvg}%` : "—", color: "#8b5cf6" },
  ];

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6b7280", fontSize: 14 }}>Yuklanmoqda...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const card = (children) => (
    <div style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 16, padding: "20px" }}>
      {children}
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>

      {/* Header */}
      <ScrollReveal direction="up">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
              📊 Shaxsiy kabinet
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>Dashboard</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, overflow: "hidden", flexShrink: 0 }}>
              {photoURL ? <img src={photoURL} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{displayName}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stat cards */}
      <ScrollReveal direction="up" delay={80}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 14, padding: "18px 16px", borderLeft: `4px solid ${s.color}` }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <p style={{ margin: "8px 0 2px", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
        {[{ id: "overview", label: "📈 Umumiy" }, { id: "courses", label: "📚 Kurslar" }, { id: "achievements", label: "🏆 Yutuqlar" }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "10px 16px", background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
            borderBottom: `2px solid ${activeTab === tab.id ? "#3b82f6" : "transparent"}`,
            marginBottom: -1,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <ScrollReveal direction="up">
            {card(<>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>Haftalik faollik</p>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>Jami: {totalMin} daqiqa</p>
              {totalMin === 0
                ? <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>Hali faollik yo'q</p>
                : <div style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: "space-between" }}>
                    {weeklyArr.map((d, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                        <span style={{ fontSize: 10, color: "#6b7280" }}>{d.minutes > 0 ? `${d.minutes}m` : ""}</span>
                        <MiniBar value={d.minutes} max={maxMin} color="#3b82f6" darkMode={darkMode} />
                        <span style={{ fontSize: 11, color: "#6b7280" }}>{d.day}</span>
                      </div>
                    ))}
                  </div>
              }
            </>)}
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            {card(<>
              <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>So'nggi faollik</p>
              {activity.length === 0
                ? <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "20px 0" }}>Hali faollik yo'q. Kurslarni boshlang! 🚀</p>
                : activity.slice(0, 5).map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: i < 4 ? 12 : 0, borderBottom: i < 4 ? `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` : "none", marginBottom: i < 4 ? 12 : 0 }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: (a.color || "#3b82f6") + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.icon}</span>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 13, color: darkMode ? "#e2e8f0" : "#374151" }}>{a.text}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{a.time}</p>
                      </div>
                    </div>
                  ))
              }
            </>)}
          </ScrollReveal>
        </div>
      )}

      {/* Courses tab */}
      {activeTab === "courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {courses.map((c, i) => (
            <ScrollReveal key={c.id} direction="up" delay={i * 60}>
              <div style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0, textAlign: "center" }}>{c.category}</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{c.title}</p>
                  <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#334155" : "#e5e7eb" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: c.progress === 100 ? "#10b981" : c.color, width: `${c.progress}%`, transition: "width 0.5s" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: c.progress === 100 ? "#10b981" : c.color }}>{c.progress}%</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{c.completed}/{c.total} dars</p>
                </div>
                {c.progress < 100
                  ? <button onClick={() => markLesson(c.id)} style={{ padding: "7px 14px", borderRadius: 8, background: c.color, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>+1 dars ✓</button>
                  : <span style={{ padding: "6px 12px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✅ Tugatildi</span>
                }
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Achievements tab */}
      {activeTab === "achievements" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
          {achievementsList.map((ach, i) => {
            const earned = !!achievements[ach.key];
            return (
              <ScrollReveal key={i} direction="up" delay={i * 60}>
                <div style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${earned ? "#f59e0b44" : darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 14, padding: "20px 16px", textAlign: "center", opacity: earned ? 1 : 0.5 }}>
                  <div style={{ fontSize: 36, marginBottom: 8, filter: earned ? "none" : "grayscale(100%)" }}>{ach.icon}</div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: darkMode ? "#f1f5f9" : "#111" }}>{ach.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: earned ? "#f59e0b" : "#9ca3af" }}>{earned ? "✓ Qo'lga kiritildi" : "Qulfli"}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;