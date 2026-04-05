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
    info:        t.typeInfo,
    success:     t.typeSuccess,
    warning:     t.typeWarning,
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
          time:  data.createdAt?.toDate?.()?.toLocaleString(t.lang === "uz" ? "uz" : "en", {
            day: "2-digit", month: "2-digit",
            hour: "2-digit", minute: "2-digit",
          }) || "Hozirgina",
        };
      });
      setNotifs(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user, t.lang]);

  // ── Hammasini o'qilgan deb belgilash ───────────────────────────────────────
  const markAllRead = async () => {
    if (!user) return;
    const unreadList = notifs.filter((n) => !n.read);
    if (unreadList.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      unreadList.forEach((n) => {
        const ref = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(ref, { read: true });
      });
      await batch.commit();
      showToast?.(t.allMarkedRead, "success");
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-black tracking-widest animate-pulse uppercase">{t.loadingData}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 lg:py-28">
      {/* Header Section */}
      <ScrollReveal direction="up">
        <div className="flex flex-wrap items-center justify-between gap-8 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t.notifBadge}
            </span>
            <div className="flex items-center gap-6">
              <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                {t.notifTitle}
              </h2>
              {unread > 0 && (
                <span className="px-4 py-1.5 rounded-2xl bg-red-500 text-white text-xs font-black shadow-lg shadow-red-500/30 animate-pulse">
                  {unread}
                </span>
              )}
            </div>
          </div>
          
          {unread > 0 && (
            <button 
              onClick={markAllRead} 
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all border flex items-center gap-3 ${
                darkMode ? "bg-slate-900/40 border-white/5 text-blue-400 hover:bg-slate-900/60" : "bg-white border-slate-200 text-blue-600 hover:shadow-xl shadow-slate-100"
              }`}
            >
              <LuCheck size={16} /> {t.markAllRead}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {types.map((type) => (
            <button 
              key={type} 
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border uppercase tracking-wider ${
                filter === type 
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30" 
                  : darkMode ? "bg-slate-900/40 border-white/5 text-slate-500 hover:text-blue-400" : "bg-white border-slate-100 text-slate-500 hover:border-blue-500"
              }`}
            >
              {typeLabels[type] || type}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Notifications List */}
      <ScrollReveal direction="up" delay={200}>
        {filtered.length === 0 ? (
          <div className={`py-40 text-center rounded-[3rem] border border-dashed transition-all ${
            darkMode ? "bg-slate-900/20 border-white/10" : "bg-slate-50 border-slate-200 shadow-inner"
          }`}>
            <LuBellOff size={64} className="mx-auto mb-8 opacity-20 text-slate-500" />
            <p className="text-slate-400 text-lg font-black uppercase tracking-widest">
              {notifs.length === 0 ? t.noNotifications : t.noResults}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((n) => (
              <div 
                key={n.id}
                className={`group p-6 rounded-4xl border transition-all duration-500 flex items-start gap-6 relative overflow-hidden ${
                  !n.read 
                    ? (darkMode ? "bg-blue-600/10 border-blue-500/30" : "bg-blue-50/50 border-blue-200")
                    : (darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-sm")
                } hover:scale-[1.01]`}
              >
                {/* Unread Indicator Dot */}
                {!n.read && (
                  <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
                )}

                {/* Icon Container */}
                <div 
                  className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-2xl shadow-lg transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${n.color || "#3b82f6"}15`, color: n.color || "#3b82f6" }}
                >
                  {n.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`text-base font-black truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {n.title}
                    </h4>
                    {!n.read && <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest grow-0 shrink-0">{t.notifNewBadge}</span>}
                  </div>
                  <p className={`text-sm font-medium leading-relaxed mb-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {n.message || n.body}
                  </p>
                  
                  {n.link && (
                    <a 
                      href={n.link} 
                      className="inline-flex items-center gap-2 text-xs font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest mb-4"
                    >
                      <LuBook size={14} /> {t.viewDetails}
                    </a>
                  )}
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/60">{n.time}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  {!n.read && (
                    <button 
                      onClick={() => markRead(n.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500 shadow-lg transition-all active:scale-90 ${
                        darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-50 border border-slate-100"
                      }`}
                      title={t.markRead}
                    >
                      <LuCheck size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotif(n.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-red-500 shadow-lg transition-all active:scale-90 ${
                      darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-50 border border-slate-100"
                    }`}
                    title={t.deleteNotif}
                  >
                    <LuX size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
};

export default Notifications;