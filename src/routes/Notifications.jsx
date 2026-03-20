import React, { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";

const initialNotifs = [
  { id: 1, type: "course", icon: "🎓", title: "Yangi dars qo'shildi", body: "JavaScript kursi — 'Async/Await' darsi qo'shildi", time: "5 daqiqa oldin", read: false, color: "#3b82f6" },
  { id: 2, type: "quiz", icon: "🎯", title: "Quiz natijasi", body: "HTML Quiz — siz 100% ball to'pladingiz! Ajoyib!", time: "1 soat oldin", read: false, color: "#10b981" },
  { id: 3, type: "promo", icon: "🔥", title: "Chegirma!", body: "React kursi uchun 30% chegirma — faqat bugun!", time: "3 soat oldin", read: false, color: "#ef4444" },
  { id: 4, type: "system", icon: "🔔", title: "Haftalik hisobot", body: "Bu hafta 435 daqiqa o'qidingiz. Zo'r natija!", time: "1 kun oldin", read: true, color: "#8b5cf6" },
  { id: 5, type: "course", icon: "📚", title: "Kurs yangilandi", body: "CSS & Flexbox — 2 ta yangi dars qo'shildi", time: "2 kun oldin", read: true, color: "#264de4" },
  { id: 6, type: "achievement", icon: "🏆", title: "Yutuq qo'lga kiritildi!", body: "'7 kunlik streak' medallini oldingiz!", time: "3 kun oldin", read: true, color: "#f59e0b" },
  { id: 7, type: "system", icon: "💡", title: "Maslahat", body: "Har kuni 30 daqiqa o'qish — bir oyda 15 soat!", time: "4 kun oldin", read: true, color: "#6b7280" },
];

const types = ["Barchasi", "course", "quiz", "promo", "achievement", "system"];

const Notifications = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const typeLabels = { Barchasi: t.notifFilterAll, course: t.notifFilterCourse, quiz: t.notifFilterQuiz, promo: t.notifFilterPromo, achievement: t.notifFilterAchievement, system: t.notifFilterSystem };
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState("Barchasi");

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast && showToast(t.allMarkedRead, "success");
  };

  const markRead = (id) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));

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
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>{t.notifTitle}</h2>
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
          {types.map((t) => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filter === t ? "#3b82f6" : darkMode ? "#1e293b" : "#f1f5f9",
              color: filter === t ? "#fff" : darkMode ? "#94a3b8" : "#374151",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
            }}>{typeLabels[t]}</button>
          ))}
        </div>
      </ScrollReveal>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <span style={{ fontSize: 48 }}>🔕</span>
          <p style={{ color: darkMode ? "#94a3b8" : "#6b7280", marginTop: 12 }}>{t.noNotifications}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((n, i) => (
            <ScrollReveal key={n.id} direction="up" delay={i * 50}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 16px", borderRadius: 14,
                background: n.read ? (darkMode ? "#1e293b" : "#fff") : (darkMode ? "#1e293b" : "#eff6ff"),
                border: `1px solid ${n.read ? (darkMode ? "#334155" : "#e5e7eb") : "#bfdbfe"}`,
                transition: "all 0.2s",
                position: "relative",
              }}>
                {!n.read && (
                  <div style={{
                    position: "absolute", top: 14, right: 14,
                    width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
                  }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: n.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: darkMode ? "#f1f5f9" : "#111" }}>{n.title}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.5 }}>{n.body}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{n.time}</p>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} title="O'qilgan" style={{
                      width: 28, height: 28, borderRadius: 6, border: "none",
                      background: darkMode ? "#334155" : "#f3f4f6",
                      cursor: "pointer", fontSize: 12, color: "#10b981",
                    }}>✓</button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} title="O'chirish" style={{
                    width: 28, height: 28, borderRadius: 6, border: "none",
                    background: darkMode ? "#334155" : "#f3f4f6",
                    cursor: "pointer", fontSize: 12, color: "#ef4444",
                  }}>✕</button>
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