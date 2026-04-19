import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/useLang";
import { getNameStyleByKey } from "../constants/shopConstants";
import { 
  LuTrophy, 
  LuMedal, 
  LuFlame, 
  LuGraduationCap, 
  LuStar, 
  LuTarget, 
  LuChevronRight, 
  LuTrendingUp, 
  LuCrown,
  LuSearch,

} from "react-icons/lu";

const Avatar = ({ user, size = 48, className = "" }) => {
  const initials = (user.displayName || user.email || "?")[0].toUpperCase();
  const colors   = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"];
  const color    = colors[initials.charCodeAt(0) % colors.length];
  const photo    = user.photoURL || user.avatarUrl || user.avatar;

  return (
    <div 
      className={`rounded-2xl flex items-center justify-center text-white font-black overflow-hidden border-2 border-white/10 shadow-lg shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: photo ? "transparent" : color,
        fontSize: size * 0.35 
      }}
    >
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

const Leaderboard = ({ darkMode }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("xp");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const TABS = useMemo(() => [
    { id: "xp",      label: t.lbTabXP,      icon: <LuStar size={16} /> },
    { id: "courses", label: t.lbTabCourses, icon: <LuGraduationCap size={16} /> },
    { id: "quiz",    label: t.lbTabQuiz,    icon: <LuTarget size={16} /> },
    { id: "streak",  label: t.lbTabStreak,  icon: <LuFlame size={16} /> },
  ], [t]);

  useEffect(() => {
    let cancelled = false;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      if (cancelled) return;
      const enriched = snap.docs.map((d) => ({
        id:      d.id,
        ...d.data(),
        xp:      d.data().xp      || 0,
        streak:  d.data().streak  || 0,
        courses: d.data().courses || 0,
        quizAvg: d.data().quizAvg || 0,
      }));
      setUsers(enriched);
      setLoading(false);
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  const sorted = useMemo(() => [...users]
    .sort((a, b) => (b[activeTab] || 0) - (a[activeTab] || 0))
    .filter((u) => (u[activeTab] || 0) > 0), [users, activeTab]);

  const myRank = sorted.findIndex((u) => u.id === user?.uid);
  const myData = myRank >= 0 ? sorted[myRank] : null;

  const valueLabel = (u) => {
    if (activeTab === "xp")      return `${(u.xp || 0).toLocaleString()} ${t.lbValueXP}`;
    if (activeTab === "courses") return `${u.courses || 0} ${t.lbValueCourses}`;
    if (activeTab === "quiz")    return `${u.quizAvg || 0}%`;
    if (activeTab === "streak")  return `${u.streak || 0} ${t.lbValueStreak}`;
    return "";
  };

  const handleUserClick = (u) => {
    if (u.id === user?.uid) return;
    navigate(`/profile/${u.id}`);
  };

  const getMedalIcon = (rank) => {
    if (rank === 0) return <LuCrown size={24} className="text-amber-500" />;
    if (rank === 1) return <LuMedal size={20} className="text-slate-400" />;
    if (rank === 2) return <LuMedal size={18} className="text-amber-700" />;
    return <span className="text-xs font-black text-slate-500 tabular-nums">#{rank + 1}</span>;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-black tracking-widest animate-pulse uppercase">{t.loadingData}</p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 lg:py-28">
      {/* Header Section */}
      <div direction="up">
        <div className="flex flex-wrap items-center justify-between gap-8 mb-16">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <LuTrophy className="inline mr-2" /> {t.lbSubtitle}
            </span>
            <h1 className={`text-4xl md:text-6xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              {t.lbTitle}
            </h1>
          </div>

          <div className={`flex p-1.5 rounded-2xl border backdrop-blur-xl ${
            darkMode ? "bg-slate-900/40 border-white/5" : "bg-white/80 border-slate-200 shadow-xl"
          }`}>
            {[
              { id: "all", label: t.lbPeriodAll },
              { id: "month", label: t.lbPeriodMonth },
              { id: "week", label: t.lbPeriodWeek }
            ].map((p) => (
              <button 
                key={p.id} 
                onClick={() => setPeriod(p.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${
                  period === p.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" 
                    : "text-slate-500 hover:text-blue-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && sorted.length >= 3 && (
          <div className="flex items-end justify-center gap-4 md:gap-10 mb-20 px-4">
            {/* 2nd Place */}
            <div 
              onClick={() => handleUserClick(sorted[1])} 
              className="flex-1 text-center cursor-pointer group"
            >
              <div className="relative inline-block mb-6 transition-transform duration-500 group-hover:scale-110">
                <div className="p-1.5 rounded-4xl bg-linear-to-br from-slate-400 to-slate-600 shadow-2xl shadow-slate-500/20">
                  <Avatar user={sorted[1]} size={80} className="rounded-3xl" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-400 text-slate-400">
                  <LuMedal size={24} />
                </div>
              </div>
              <p 
                className={`text-sm font-black mb-1 truncate max-w-[120px] mx-auto ${darkMode ? "text-white" : "text-slate-900"}`}
                style={getNameStyleByKey(sorted[1].nameColor)}
              >
                {sorted[1].displayName}
              </p>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6">
                {valueLabel(sorted[1])}
              </p>
              <div className={`h-24 md:h-32 rounded-t-[2.5rem] border-x border-t flex items-center justify-center backdrop-blur-xl ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white/80 border-slate-200"
              }`}>
                <span className="text-4xl font-black text-slate-500/20 tabular-nums">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div 
              onClick={() => handleUserClick(sorted[0])} 
              className="flex-[1.2] text-center cursor-pointer group transform -translate-y-8"
            >
              <div className="relative inline-block mb-8 transition-transform duration-500 group-hover:scale-110">
                <div className="p-2 rounded-[2.5rem] bg-linear-to-br from-amber-400 to-orange-600 shadow-2xl shadow-amber-500/30 animate-pulse">
                  <Avatar user={sorted[0]} size={110} className="rounded-[2.2rem]" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border-2 border-amber-500 text-amber-500">
                  <LuCrown size={28} />
                </div>
              </div>
              <p 
                className={`text-lg font-black mb-1 truncate max-w-[150px] mx-auto ${darkMode ? "text-white" : "text-slate-900"}`}
                style={getNameStyleByKey(sorted[0].nameColor)}
              >
                {sorted[0].displayName}
              </p>
              <p className="text-sm font-black text-amber-500 uppercase tracking-widest mb-8">
                {valueLabel(sorted[0])}
              </p>
              <div className={`h-40 md:h-48 rounded-t-[3rem] border-x border-t flex items-center justify-center backdrop-blur-xl relative overflow-hidden ${
                darkMode ? "bg-slate-900/60 border-amber-500/20" : "bg-white border-amber-200 shadow-2xl shadow-amber-500/10"
              }`}>
                <div className="absolute inset-0 bg-linear-to-t from-amber-500/10 to-transparent" />
                <span className="text-7xl font-black text-amber-500/30 tabular-nums relative z-10">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div 
              onClick={() => handleUserClick(sorted[2])} 
              className="flex-1 text-center cursor-pointer group"
            >
              <div className="relative inline-block mb-6 transition-transform duration-500 group-hover:scale-110">
                <div className="p-1.5 rounded-4xl bg-linear-to-br from-amber-700 to-amber-900 shadow-2xl shadow-amber-900/20">
                  <Avatar user={sorted[2]} size={75} className="rounded-3xl" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-9 h-9 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl border-2 border-amber-700 text-amber-700">
                  <LuMedal size={20} />
                </div>
              </div>
              <p 
                className={`text-sm font-black mb-1 truncate max-w-[110px] mx-auto ${darkMode ? "text-white" : "text-slate-900"}`}
                style={getNameStyleByKey(sorted[2].nameColor)}
              >
                {sorted[2].displayName}
              </p>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6">
                {valueLabel(sorted[2])}
              </p>
              <div className={`h-20 md:h-24 rounded-t-4xl border-x border-t flex items-center justify-center backdrop-blur-xl ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white/80 border-slate-200"
              }`}>
                <span className="text-3xl font-black text-amber-800/20 tabular-nums">3</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div direction="up" delay={100}>
        {/* Category Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900/10 dark:bg-slate-900/40 border dark:border-white/5 backdrop-blur-md mb-12">
          {TABS.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-black transition-all duration-500 ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-95" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {/* User's own rank if available */}
          {myData && (
            <div className={`p-6 rounded-4xl border-2 border-blue-500 bg-blue-500/10 backdrop-blur-xl flex items-center gap-6 mb-12 transition-transform hover:scale-[1.01] ${
              darkMode ? "shadow-2xl shadow-blue-500/10" : "shadow-xl shadow-blue-100"
            }`}>
              <div className="w-12 text-center text-2xl font-black text-blue-500 tabular-nums">#{myRank + 1}</div>
              <Avatar user={myData} size={56} className="rounded-2xl ring-4 ring-blue-500/20" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className={`text-lg font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{t.lbYou}</p>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest">{t.lbSubtitle}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-blue-500/60 font-bold text-xs">
                  <LuTrendingUp size={14} /> <span>{t.overviewTab}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-500 tabular-nums">{valueLabel(myData)}</div>
              </div>
            </div>
          )}

          {/* List entries */}
          {!loading && sorted.length === 0 ? (
            <div className={`text-center py-32 rounded-[3rem] border border-dashed ${
              darkMode ? "bg-slate-900/20 border-white/10" : "bg-slate-50 border-slate-200"
            }`}>
              <LuTrophy size={64} className="mx-auto mb-6 text-slate-300 dark:text-slate-700 opacity-50" />
              <p className="text-slate-400 text-lg font-black uppercase tracking-widest">{t.lbNoResults}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sorted.map((u, i) => {
                const isMe = u.id === user?.uid;
                const progress = Math.round(((u[activeTab] || 0) / (sorted[0][activeTab] || 1)) * 100);
                
                return (
                  <div 
                    key={u.id} 
                    onClick={() => handleUserClick(u)}
                    className={`group p-5 rounded-4xl border transition-all duration-500 flex items-center gap-6 relative overflow-hidden ${
                      isMe 
                        ? "bg-blue-500/5 border-blue-500/30" 
                        : darkMode ? "bg-slate-900/40 border-white/5 hover:bg-slate-800/60" : "bg-white border-slate-100 hover:shadow-xl hover:shadow-slate-200/50"
                    } hover:scale-[1.01] cursor-pointer`}
                  >
                    {/* Rank Indicator */}
                    <div className="w-10 flex items-center justify-center shrink-0">
                      {getMedalIcon(i)}
                    </div>

                    <Avatar user={u} size={48} className="rounded-2xl" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p 
                          className={`text-sm font-black truncate ${darkMode ? "text-white" : "text-slate-900"}`}
                          style={getNameStyleByKey(u.nameColor)}
                        >
                          {u.displayName || u.email?.split("@")[0]}
                        </p>
                        {isMe && <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest leading-none">{t.lbYou}</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{u.email}</p>
                    </div>

                    {/* Stats & Progress */}
                    <div className="w-32 md:w-48 text-right shrink-0">
                      <div className={`text-lg font-black tabular-nums transition-colors ${
                        i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-blue-500"
                      }`}>
                        {valueLabel(u)}
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-800/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            i === 0 ? "bg-linear-to-r from-amber-400 to-orange-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {!isMe && (
                      <LuChevronRight size={20} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
