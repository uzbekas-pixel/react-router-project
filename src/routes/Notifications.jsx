import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  collection, onSnapshot, doc, updateDoc,
  deleteDoc, writeBatch, query, orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import {
  LuGraduationCap, LuTarget, LuFlame, LuBell,
  LuBook, LuTrophy, LuLightbulb, LuBellOff,
  LuCheck, LuX, LuInfo, LuTriangleAlert, LuGift,
} from "react-icons/lu";

// Type ga qarab icon va rang
const TYPE_META = {
  course:      { icon: <LuGraduationCap />, color: "#3b82f6" },
  quiz:        { icon: <LuTarget />,        color: "#10b981" },
  promo:       { icon: <LuGift />,          color: "#ef4444" },
  achievement: { icon: <LuTrophy />,        color: "#f59e0b" },
  system:      { icon: <LuBell />,          color: "#8b5cf6" },
  info:        { icon: <LuInfo />,          color: "#3b82f6" },
  success:     { icon: <LuCheck />,         color: "#10b981" },
  warning:     { icon: <LuTriangleAlert />, color: "#f59e0b" },
};

const types = ["Barchasi", "course", "quiz", "promo", "achievement", "system", "info", "success", "warning"];

const Notifications = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("Barchasi");

  const typeLabels = {
    Barchasi:    t.notifFilterAll,
    course:      t.notifFilterCourse,
    quiz:        t.notifFilterQuiz,
    promo:       t.notifFilterPromo,
    achievement: t.notifFilterAchievement,
    system:      t.notifFilterSystem,
    info:        "Ma'lumot",
    success:     "Muvaffaqiyat",
    warning:     "Ogohlantirish",
  };

  // ── Real-time Firestore dan o'qish ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        const meta = TYPE_META[data.type] || TYPE_META.info;
        return {
          id:    d.id,
          ...data,
          icon:  meta.icon,
          color: meta.color,
          // Vaqtni formatlash
          time:  data.createdAt?.toDate?.()?.toLocaleString("uz", {
            day: "2-digit", month: "2-digit",
            hour: "2-digit", minute: "2-digit",
          }) || "Hozirgina",
        };
      });
      setNotifs(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // ── Hammasini o'qilgan deb belgilash ───────────────────────────────────────
  const markAllRead = async () => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      notifs.filter((n) => !n.read).forEach((n) => {
        const ref = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
      showToast && showToast(t.allMarkedRead, "success");
    } catch (err) {
      console.error(err);
    }
  };

  // ── Bitta o'qilgan deb belgilash ──────────────────────────────────────────
  const markRead = async (id) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  // ── O'chirish ─────────────────────────────────────────────────────────────
  const deleteNotif = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "notifications", id));
    } catch (err) {
      console.error(err);
    }
  };

  const unread   = notifs.filter((n) => !n.read).length;
  const filtered = notifs.filter((n) => filter === "Barchasi" || n.type === filter);

  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", padding: "40px 20px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <div>
            <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
              {t.notifBadge}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>
                {t.notifTitle}
              </h2>
              {unread > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                  {unread}
                </span>
              )}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{
              padding: "8px 16px", background: "transparent",
              border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: "#3b82f6", cursor: "pointer",
            }}>
              {t.markAllRead}
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {types.map((type) => (
            <button key={type} onClick={() => setFilter(type)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filter === type ? "#3b82f6" : darkMode ? "#1e293b" : "#f1f5f9",
              color: filter === type ? "#fff" : darkMode ? "#94a3b8" : "#374151",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
            }}>
              {typeLabels[type] || type}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Loading */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, display: "flex", justifyContent: "center", color: darkMode ? "#475569" : "#cbd5e1", marginBottom: 12 }}>
            <LuBellOff />
          </div>
          <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>
            {notifs.length === 0 ? "Hali bildirishnoma yo'q" : t.noNotifications}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((n, i) => (
            <ScrollReveal key={n.id} direction="up" delay={i * 40}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px", borderRadius: 14,
                background: n.read
                  ? (darkMode ? "#1e293b" : "#fff")
                  : (darkMode ? "#1e3a5f" : "#eff6ff"),
                border: `1px solid ${n.read
                  ? (darkMode ? "#334155" : "#e5e7eb")
                  : "#bfdbfe"}`,
                transition: "all 0.2s",
                position: "relative",
              }}>
                {/* O'qilmagan dot */}
                {!n.read && (
                  <div style={{
                    position: "absolute", top: 14, right: 14,
                    width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: (n.color || "#3b82f6") + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: n.color || "#3b82f6",
                }}>
                  {n.icon}
                </div>

                {/* Matn */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>
                    {n.title}
                  </p>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.5 }}>
                    {n.message || n.body}
                  </p>
                  {n.link && (
                    <a href={n.link} style={{ fontSize: 11, color: "#3b82f6", textDecoration: "none" }}>
                      🔗 {n.link}
                    </a>
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>{n.time}</p>
                </div>

                {/* Tugmalar */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="O'qilgan" style={{
                      width: 28, height: 28, borderRadius: 6, border: "none",
                      background: darkMode ? "#334155" : "#f3f4f6",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 14, color: "#10b981",
                    }}>
                      <LuCheck />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} title="O'chirish" style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    background: darkMode ? "#334155" : "#f3f4f6",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 14, color: "#ef4444",
                  }}>
                    <LuX />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;