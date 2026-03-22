import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import {
  LuFlame, LuStar, LuZap, LuTrophy, LuCheck,
  LuLock, LuTarget, LuBookOpen, LuKeyboard,
  LuGamepad2, LuMessageSquare, LuRefreshCw,
} from "react-icons/lu";

// ─── Darajalar ────────────────────────────────────────────────────────────────
const LEVELS = [
  { level: 1, name: "Yangi boshlovchi", minXP: 0,     maxXP: 100,  color: "#6b7280", badge: "🌱" },
  { level: 2, name: "O'quvchi",         minXP: 100,   maxXP: 300,  color: "#10b981", badge: "📚" },
  { level: 3, name: "Izlanuvchi",       minXP: 300,   maxXP: 600,  color: "#3b82f6", badge: "🔍" },
  { level: 4, name: "Bilimdon",         minXP: 600,   maxXP: 1000, color: "#8b5cf6", badge: "🧠" },
  { level: 5, name: "Mahir",            minXP: 1000,  maxXP: 1500, color: "#f59e0b", badge: "⚡" },
  { level: 6, name: "Ekspert",          minXP: 1500,  maxXP: 2500, color: "#ef4444", badge: "🎯" },
  { level: 7, name: "Usta",             minXP: 2500,  maxXP: 4000, color: "#06b6d4", badge: "🏆" },
  { level: 8, name: "Professional",     minXP: 4000,  maxXP: 6000, color: "#f97316", badge: "💎" },
  { level: 9, name: "Champion",         minXP: 6000,  maxXP: 10000,color: "#ec4899", badge: "👑" },
  { level: 10,name: "Legenda",          minXP: 10000, maxXP: 99999,color: "#d97706", badge: "🌟" },
];

// ─── Kunlik vazifalar ─────────────────────────────────────────────────────────
const DAILY_TASKS = [
  { id: "watch_lesson",  icon: <LuBookOpen />,     color: "#3b82f6", title: "Dars ko'rish",        desc: "1 ta dars ko'ring",              xp: 20,  max: 1 },
  { id: "quiz",          icon: <LuTarget />,        color: "#10b981", title: "Quiz ishlash",        desc: "1 ta quiz yechib ko'ring",       xp: 30,  max: 1 },
  { id: "typing",        icon: <LuKeyboard />,      color: "#8b5cf6", title: "Typing test",         desc: "Typing testini bajaring",        xp: 15,  max: 1 },
  { id: "game",          icon: <LuGamepad2 />,      color: "#f59e0b", title: "O'yin o'ynash",       desc: "Istalgan o'yinni o'ynang",       xp: 10,  max: 1 },
  { id: "chat",          icon: <LuMessageSquare />, color: "#06b6d4", title: "Chat yozish",         desc: "Chatda xabar yuboring",          xp: 5,   max: 1 },
  { id: "login",         icon: <LuFlame />,         color: "#ef4444", title: "Kunlik kirish",       desc: "Har kuni kiring — streak!",      xp: 10,  max: 1 },
  { id: "watch_3lessons",icon: <LuBookOpen />,      color: "#0ea5e9", title: "3 ta dars ko'rish",   desc: "Bugun 3 ta dars ko'ring",        xp: 50,  max: 3 },
];

const getLevel = (xp) => LEVELS.slice().reverse().find((l) => xp >= l.minXP) || LEVELS[0];

const getTodayKey = () => new Date().toISOString().split("T")[0]; // "2026-03-22"

const DailyTasks = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [xp, setXp]               = useState(0);
  const [streak, setStreak]        = useState(0);
  const [tasks, setTasks]          = useState({});
  const [loading, setLoading]      = useState(true);
  const [claiming, setClaiming]    = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(false);

  const level    = getLevel(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  const progress  = nextLevel
    ? Math.round(((xp - level.minXP) / (nextLevel.minXP - level.minXP)) * 100)
    : 100;

  // ── Ma'lumotlarni yuklash ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const today = getTodayKey();

        // XP va streak
        const statsRef  = doc(db, "users", user.uid, "data", "stats");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          setXp(statsSnap.data().xp || 0);
          setStreak(statsSnap.data().streak || 0);
        }

        // Kunlik vazifalar
        const taskRef  = doc(db, "users", user.uid, "dailyTasks", today);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          setTasks(taskSnap.data().completed || {});
        } else {
          // Yangi kun — login vazifasini avtomatik bajarish
          const newTasks = { login: 1 };
          await setDoc(taskRef, { completed: newTasks, date: today, createdAt: serverTimestamp() });
          setTasks(newTasks);
          // XP qo'shish
          await (10, statsSnap.data()?.xp || 0, statsSnap.data()?.streak || 0);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [user,xp,streak,tasks,claiming,levelUpAnim]);

  // ── XP qo'shish ───────────────────────────────────────────────────────────
  const addXP = async (amount, currentXP, currentStreak) => {
    if (!user) return;
    const newXP     = (currentXP || xp) + amount;
    const oldLevel  = getLevel(currentXP || xp);
    const newLevel  = getLevel(newXP);

    await updateDoc(doc(db, "users", user.uid, "data", "stats"), {
      xp:     newXP,
      streak: currentStreak !== undefined ? currentStreak : streak,
    }).catch(async () => {
      await setDoc(doc(db, "users", user.uid, "data", "stats"), {
        xp: newXP, streak: currentStreak !== undefined ? currentStreak : streak,
      });
    });

    setXp(newXP);

    // Level up animatsiya
    if (newLevel.level > oldLevel.level) {
      setLevelUpAnim(true);
      showToast && showToast(`🎉 Tabriklaymiz! ${newLevel.badge} ${newLevel.name} darajasiga ko'tarildingiz!`, "success");
      setTimeout(() => setLevelUpAnim(false), 3000);
    }
  };

  // ── Vazifsni bajarish ─────────────────────────────────────────────────────
  const completeTask = async (taskId) => {
    if (!user || claiming) return;
    const task    = DAILY_TASKS.find((t) => t.id === taskId);
    const current = tasks[taskId] || 0;
    if (current >= task.max) return;

    setClaiming(taskId);
    try {
      const today      = getTodayKey();
      const newCount   = current + 1;
      const newTasks   = { ...tasks, [taskId]: newCount };

      await updateDoc(doc(db, "users", user.uid, "dailyTasks", today), {
        [`completed.${taskId}`]: newCount,
      }).catch(async () => {
        await setDoc(doc(db, "users", user.uid, "dailyTasks", today), {
          completed: newTasks, date: today,
        });
      });

      setTasks(newTasks);
      await addXP(task.xp, xp, streak);
      showToast && showToast(`+${task.xp} XP qo'shildi! ✅`, "success");
    } catch (err) {
      console.error(err);
    }
    setClaiming(null);
  };

  const completedCount = DAILY_TASKS.filter((t) => (tasks[t.id] || 0) >= t.max).length;
  const totalXPToday   = DAILY_TASKS.reduce((a, t) => (tasks[t.id] || 0) >= t.max ? a + t.xp : a, 0);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto", padding: "40px 16px 80px" }}>

      {/* Level Up animatsiya */}
      {levelUpAnim && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", animation: "bounceIn 0.5s ease" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>{level.badge}</div>
            <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>LEVEL UP! 🎉</h2>
            <p style={{ color: level.color, fontSize: 20, fontWeight: 700 }}>{level.name}</p>
          </div>
          <style>{`@keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
        </div>
      )}

      <ScrollReveal direction="up">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            ⚡ Kunlik Vazifalar
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>
            Bugungi Vazifalar
          </h2>
        </div>

        {/* Daraja kartasi */}
        <div style={{ marginBottom: 20, padding: "20px 24px", borderRadius: 18, background: `linear-gradient(135deg, ${level.color}22, ${level.color}11)`, border: `2px solid ${level.color}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 48 }}>{level.badge}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: level.color, background: level.color + "22", padding: "2px 8px", borderRadius: 10 }}>
                  {level.level}-daraja
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>{level.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LuStar style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span style={{ fontSize: 20, fontWeight: 800, color: level.color }}>{xp.toLocaleString()} XP</span>
                {nextLevel && <span style={{ fontSize: 12, color: "#6b7280" }}>/ {nextLevel.minXP.toLocaleString()} XP</span>}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <LuFlame style={{ color: "#ef4444", fontSize: 20 }} />
                <span style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>{streak}</span>
              </div>
              <span style={{ fontSize: 10, color: "#6b7280" }}>kun streak</span>
            </div>
          </div>

          {/* Progress bar */}
          {nextLevel && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "#6b7280" }}>
                <span>Keyingi daraja: {nextLevel.badge} {nextLevel.name}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: darkMode ? "#334155" : "#e5e7eb" }}>
                <div style={{ height: "100%", borderRadius: 4, background: level.color, width: `${progress}%`, transition: "width 0.5s ease" }} />
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#6b7280" }}>
                {(nextLevel.minXP - xp).toLocaleString()} XP qoldi
              </p>
            </div>
          )}
        </div>

        {/* Bugungi progress */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <LuCheck />,  color: "#10b981", value: `${completedCount}/${DAILY_TASKS.length}`, label: "Bajarildi" },
            { icon: <LuZap />,    color: "#f59e0b", value: `+${totalXPToday}`,                        label: "Bugungi XP" },
            { icon: <LuTrophy />, color: "#8b5cf6", value: `${level.level}`,                          label: "Daraja" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, color: s.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Vazifalar */}
      <ScrollReveal direction="up" delay={100}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DAILY_TASKS.map((task) => {
            const done     = (tasks[task.id] || 0) >= task.max;
            const current  = tasks[task.id] || 0;
            const isClaiming = claiming === task.id;

            return (
              <div key={task.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px", borderRadius: 14,
                background: done
                  ? (darkMode ? "#0f2818" : "#f0fdf4")
                  : (darkMode ? "#1e293b" : "#fff"),
                border: `1px solid ${done ? "#10b981" : (darkMode ? "#334155" : "#e5e7eb")}`,
                opacity: done ? 0.85 : 1,
                transition: "all 0.2s",
              }}>
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: task.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: task.color, flexShrink: 0 }}>
                  {task.icon}
                </div>

                {/* Matn */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>
                    {task.title}
                    {task.max > 1 && <span style={{ marginLeft: 6, fontSize: 12, color: "#6b7280" }}>({current}/{task.max})</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{task.desc}</p>
                </div>

                {/* XP + Tugma */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: task.color }}>+{task.xp} XP</span>
                  {done ? (
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                      <LuCheck size={18} />
                    </div>
                  ) : (
                    <button onClick={() => completeTask(task.id)} disabled={!!claiming}
                      style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: isClaiming ? "#94a3b8" : task.color, color: "#fff", cursor: claiming ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {isClaiming
                        ? <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                        : <LuCheck size={18} />
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Barcha darajalar */}
      <ScrollReveal direction="up" delay={200}>
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: darkMode ? "#f1f5f9" : "#111" }}>
            🏆 Barcha Darajalar
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {LEVELS.map((l) => {
              const isActive  = l.level === level.level;
              const isReached = xp >= l.minXP;
              return (
                <div key={l.level} style={{
                  padding: "14px 12px", borderRadius: 12, textAlign: "center",
                  background: isActive ? l.color + "22" : (darkMode ? "#1e293b" : "#fff"),
                  border: `${isActive ? 2 : 1}px solid ${isActive ? l.color : (darkMode ? "#334155" : "#e5e7eb")}`,
                  opacity: isReached ? 1 : 0.5,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{isReached ? l.badge : "🔒"}</div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: isActive ? l.color : (darkMode ? "#94a3b8" : "#6b7280") }}>
                    {l.level}-daraja
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: darkMode ? "#f1f5f9" : "#111" }}>{l.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{l.minXP.toLocaleString()} XP</p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DailyTasks;