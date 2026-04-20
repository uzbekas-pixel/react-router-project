import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { 
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { getNameStyleByKey } from "../constants/shopConstants";
import { 
  LuBook, 
  LuCheck,
  LuClock, 
  LuTarget, 
  LuTrophy, 
  LuFlame, 
  LuZap, 
  LuCrown, 
  LuStar, 
  LuActivity, 
  LuAward, 
  LuChevronRight,
  LuTimer,
  LuPartyPopper,
  LuInfo
} from "react-icons/lu";

const MiniBar = ({ value, max, color, darkMode }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`w-3 md:w-4 lg:w-6 h-32 rounded-full flex items-end overflow-hidden transition-all duration-500 ${
      darkMode ? "bg-slate-800/50" : "bg-slate-100"
    }`}>
      <div 
        className="w-full rounded-full transition-all duration-1000 ease-out shadow-lg"
        style={{ 
          height: `${pct}%`, 
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}44`
        }} 
      />
    </div>
  );
};

const Dashboard = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]   = useState("overview");
  const [loading, setLoading]       = useState(true);
  const [marking, setMarking]       = useState(null);
  const [courses, setCourses]       = useState([]);
  const [activity, setActivity]     = useState([]);
  const [stats, setStats]           = useState({ totalMinutes: 0, quizAvg: 0, streak: 0 });
  const [weekly, setWeekly]         = useState({ Du: 0, Se: 0, Ch: 0, Pa: 0, Ju: 0, Sh: 0, Ya: 0 });
  const [achievements, setAchievements] = useState({});

  const defaultCourses = [
    { id: "html",    title: t.courseData[1].title, category: "HTML",       color: "#f97316", total: 12 },
    { id: "css",     title: t.courseData[2].title, category: "CSS",        color: "#8b5cf6", total: 9  },
    { id: "js",      title: t.courseData[3].title, category: "JavaScript", color: "#eab308", total: 20 },
    { id: "english", title: t.courseData[5].title, category: "English",    color: "#3b82f6", total: 30 },
  ];

  const achievementsList = [
    { icon: <LuFlame className="text-orange-500" />, label: t.ach7Streak,  key: "streak7"    },
    { icon: <LuTrophy className="text-yellow-500" />, label: t.achFirst,    key: "firstCourse" },
    { icon: <LuZap className="text-amber-500" />, label: t.achFast,    key: "fastLearner" },
    { icon: <LuCrown className="text-indigo-500" />, label: t.achPro,         key: "proMember"   },
    { icon: <LuAward className="text-emerald-500" />, label: t.achFive,   key: "five"        },
    { icon: <LuStar className="text-blue-500" />, label: t.achTop10,  key: "top10"       },
  ];

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const init = async () => {
      setLoading(true);
      try {
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

        const statsRef  = doc(db, "users", uid, "data", "stats");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) setStats(statsSnap.data());

        const weeklyRef  = doc(db, "users", uid, "data", "weekly");
        const weeklySnap = await getDoc(weeklyRef);
        if (weeklySnap.exists()) setWeekly(weeklySnap.data());

        const actRef  = doc(db, "users", uid, "data", "activity");
        const actSnap = await getDoc(actRef);
        if (actSnap.exists()) setActivity(actSnap.data().list || []);

        const achRef  = doc(db, "users", uid, "data", "achievements");
        const achSnap = await getDoc(achRef);
        if (achSnap.exists()) setAchievements(achSnap.data());

      } catch (err) {
        console.error(err);
        showToast?.(t.dataError, "error");
      }
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showToast]);

  const markLesson = async (courseId) => {
    if (!user || marking) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course || course.completed >= course.total) return;
    setMarking(courseId);

    try {
      const newCompleted = course.completed + 1;
      const newProgress  = Math.round((newCompleted / course.total) * 100);

      await updateDoc(doc(db, "users", user.uid, "progress", courseId), {
        completed: newCompleted, updatedAt: serverTimestamp(),
      });

      setCourses((prev) => prev.map((c) =>
        c.id === courseId ? { ...c, completed: newCompleted, progress: newProgress } : c
      ));

      const newItem = newProgress === 100
        ? { icon: <LuTrophy />, text: `${course.title} ${t.courseCompleted}`, time: t.justNow, color: "#10b981" }
        : { icon: <LuBook />, text: `${course.title} — ${t.lessonsLabel} ${newCompleted} ${t.lessonMarked}`, time: t.justNow, color: course.color };

      const actRef  = doc(db, "users", user.uid, "data", "activity");
      const actSnap = await getDoc(actRef);
      const oldList = actSnap.exists() ? (actSnap.data().list || []) : [];
      const newList = [newItem, ...oldList].slice(0, 10);
      await setDoc(actRef, { list: newList });
      setActivity(newList);

      if (newProgress === 100) {
        await unlockAchievement("firstCourse");
        showToast?.(`${course.title} ${t.courseCompleted}`, "success");
      } else {
        showToast?.(t.lessonMarked, "success");
      }

      const days = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
      const today = days[new Date().getDay()];
      const weeklyRef = doc(db, "users", user.uid, "data", "weekly");
      
      setWeekly(prev => {
        const next = { ...prev, [today]: (prev[today] || 0) + 30 };
        setDoc(weeklyRef, next).catch(console.error);
        return next;
      });
    } catch (err) { console.error(err); }
    setMarking(null);
  };

  const unlockAchievement = async (key) => {
    if (!user || achievements[key]) return;
    setAchievements(prev => {
      const next = { ...prev, [key]: true };
      setDoc(doc(db, "users", user.uid, "data", "achievements"), next).catch(console.error);
      return next;
    });
    showToast?.(t.newAchievement, "success");
  };

  const dayCodeToName = (code) => {
    const dayMap = { Du: 0, Se: 1, Ch: 2, Pa: 3, Ju: 4, Sh: 5, Ya: 6 };
    const index = dayMap[code];
    return index !== undefined ? t.daysShort?.[index] || code : code;
  };

  const dayOrder = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const weeklyArr  = dayOrder.map(day => ({ day, minutes: weekly[day] || 0 }));
  const maxMin     = Math.max(...weeklyArr.map((d) => d.minutes), 1);
  const totalMin   = weeklyArr.reduce((a, d) => a + d.minutes, 0);
  const completedCount = courses.filter((c) => c.progress === 100).length;

  const displayName = user?.displayName || user?.email?.split("@")[0] || t.userPrefix;
  const photoURL    = user?.photoURL || null;
  const initials    = displayName.slice(0, 2).toUpperCase();

  const statCards = [
    { icon: <LuBook size={24} />, label: t.enrolledCourses,  value: courses.length,                        color: "#3b82f6" },
    { icon: <LuCheck size={24} />, label: t.completedCourses,  value: completedCount,                             color: "#10b981" },
    { icon: <LuClock size={24} />, label: t.thisWeek,          value: `${Math.round(totalMin / 60)}${t.hoursLabel.slice(0,1)}`,       color: "#f59e0b" },
    { icon: <LuTarget size={24} />, label: t.quizAvg,           value: stats.quizAvg > 0 ? `${stats.quizAvg}%` : "—”", color: "#8b5cf6" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-medium tracking-wide animate-pulse">{t.loadingData}</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      {/* Header with glass effect */}
      <div direction="up">
        <div className="flex flex-wrap items-center justify-between gap-8 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t.dashboardBadge}
            </span>
            <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              {t.dashboardTitle}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 flex-row-reverse md:flex-row">
            <button
              onClick={() => navigate('/leaderboard')}
              className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-white/10' : 'bg-white hover:bg-slate-100 text-amber-500 border border-slate-200 shadow-lg'
              }`}
              title="Leaderboard"
            >
              <LuTrophy size={28} />
            </button>
            <div className={`flex items-center gap-6 p-4 rounded-4xl border transition-all duration-500 ${
              darkMode ? "bg-slate-900/40 border-white/5 shadow-2xl shadow-blue-500/5" : "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
            }`} style={{ backdropFilter: "blur(20px)" }}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-500/10 overflow-hidden shrink-0 ${
                photoURL ? "" : "bg-blue-600"
              }`}>
                {photoURL ? (
                  <img src={photoURL} alt="av" className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <div>
                <p className={`text-lg font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`} style={getNameStyleByKey(user?.nameColor)}>
                  {displayName}
                </p>
                <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((s, i) => (
          <div key={i} direction="up" delay={i * 100}>
            <div className={`p-8 rounded-5xl border transition-all duration-500 hover:scale-[1.02] group ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-lg shadow-slate-100"
            }`}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-lg"
                style={{ backgroundColor: `${s.color}15`, color: s.color }}
              >
                {s.icon}
              </div>
              <h3 className={`text-3xl font-black mb-1 tabular-nums ${darkMode ? "text-white" : "text-slate-900"}`}>
                {s.value}
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs System */}
      <div className="mb-6 md:mb-10 flex gap-1 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/10 dark:bg-slate-900/40 border dark:border-white/5 backdrop-blur-md">
        {[ 
          { id: "overview", label: t.overviewTab, icon: <LuActivity size={20} className="sm:w-4 sm:h-4" /> }, 
          { id: "courses", label: t.coursesTab, icon: <LuBook size={20} className="sm:w-4 sm:h-4" /> }, 
          { id: "achievements", label: t.achievementsTab, icon: <LuAward size={20} className="sm:w-4 sm:h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-6 rounded-xl text-sm font-black transition-all duration-500 ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-95" 
                : "text-slate-500 hover:text-slate-400 hover:bg-slate-800/30"
            }`}
          >
            {tab.icon}
            {/* O'ZGARISH: Yozuv faqat sm (640px) dan katta ekranlarda ko'rinadi */}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Container */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Chart Card */}
          <div direction="up">
            <div className={`p-10 rounded-5xl border h-full ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl"
            }`}>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className={`text-xl font-black mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>{t.weeklyActivity}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t.totalMinutes}: {totalMin} {t.minutesShort}</p>
                </div>
                <LuActivity className="text-blue-500" size={24} />
              </div>
              
              {totalMin === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 opacity-50 grayscale">
                  <LuActivity size={40} className="mb-4 text-slate-400" />
                  <p className="text-slate-400 font-bold">{t.noActivity}</p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-4 h-48 mt-12 pb-2">
                  {weeklyArr.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 flex-1">
                      <span className="text-[10px] font-black text-blue-500/60 tabular-nums">
                        {d.minutes > 0 ? `${d.minutes}m` : ""}
                      </span>
                      <MiniBar value={d.minutes} max={maxMin} color="#3b82f6" darkMode={darkMode} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dayCodeToName(d.day)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity List */}
          <div direction="up" delay={200}>
            <div className={`p-10 rounded-5xl border h-full ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl"
            }`}>
              <h3 className={`text-xl font-black mb-10 ${darkMode ? "text-white" : "text-slate-900"}`}>{t.recentActivity}</h3>
              <div className="space-y-6">
                {activity.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 font-bold">{t.startCourses}</p>
                  </div>
                ) : (
                  activity.slice(0, 5).map((a, i) => {
                    // Map emoji icons to Lucide icons
                    const getIcon = () => {
                      if (a.color === "#10b981") return <LuTrophy size={20} />;
                      return <LuBook size={20} />;
                    };
                    // Translate course names from stored text
                    const translateActivityText = (text) => {
                      if (!text) return text;
                      // Replace Uzbek course names with current language
                      const courseMappings = {
                        "Ingliz Tili": t.courseData?.[5]?.title || "English",
                        "HTML": "HTML",
                        "CSS": "CSS",
                        "JavaScript": "JavaScript",
                        "React": "React",
                        "kursi tugatildi": t.courseCompleted || "course completed",
                        "tugatildi": t.lessonMarked || "completed",
                        "dars": t.lessonsLabel || "lesson",
                      };
                      let translated = text;
                      Object.entries(courseMappings).forEach(([uz, en]) => {
                        translated = translated.replace(new RegExp(uz, 'g'), en);
                      });
                      return translated;
                    };
                    return (
                      <div key={i} className="flex items-center gap-6 group">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                          style={{ backgroundColor: `${a.color || "#3b82f6"}15`, color: a.color || "#3b82f6" }}
                        >
                          {getIcon()}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold tracking-tight mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                            {translateActivityText(a.text)}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                            {a.time?.toLowerCase() === "hozirgina" || a.time?.toLowerCase() === "just now" ? t.justNow : a.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Container */}
      {activeTab === "courses" && (
        <div className="space-y-6">
          {courses.map((c, i) => (
            <div key={c.id} direction="up" delay={i * 100}>
              <div className={`p-8 rounded-4xl border flex flex-wrap items-center gap-10 transition-all duration-500 hover:scale-[1.01] ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl"
              }`}>
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.category}
                </div>
                <div className="flex-1 min-w-[240px]">
                  <h4 className={`text-lg font-black mb-4 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {c.title}
                  </h4>
                  <div className="relative h-2 w-full rounded-full bg-slate-800/10 overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 shadow-lg shadow-current" 
                      style={{ width: `${c.progress}%`, backgroundColor: c.progress === 100 ? "#10b981" : c.color, color: c.color }} 
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-black tabular-nums transition-colors ${c.progress === 100 ? "text-emerald-500" : ""}`} style={{ color: c.progress === 100 ? "" : c.color }}>
                    {c.progress}%
                  </p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {c.completed}/{c.total} {t.lessonsLabel}
                  </p>
                </div>
                <div className="shrink-0 ml-auto">
                  {c.progress < 100 ? (
                    <button 
                      onClick={() => markLesson(c.id)} 
                      disabled={marking === c.id} 
                      className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black transition-all shadow-xl shadow-blue-600/25 active:scale-95 disabled:opacity-50"
                    >
                      {marking === c.id ? "..." : t.markLesson}
                    </button>
                  ) : (
                    <div className="px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                      <LuCheck className="inline mr-2" /> {t.completedCourses}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements Container */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {achievementsList.map((ach, i) => {
            const earned = !!achievements[ach.key];
            return (
              <div key={i} direction="up" delay={i * 100}>
                <div className={`p-8 rounded-4xl border text-center transition-all duration-500 ${
                  earned 
                    ? darkMode ? "bg-slate-900/60 border-amber-500/30 shadow-2xl shadow-amber-500/5 scale-105" : "bg-white border-amber-200 shadow-xl shadow-amber-100" 
                    : darkMode ? "bg-slate-900/20 border-white/5 opacity-40" : "bg-slate-50 border-slate-100 opacity-40 grayscale"
                }`}>
                  <div className={`text-5xl mb-6 flex justify-center transition-transform duration-500 ${earned ? "scale-110" : ""}`}>
                    {ach.icon}
                  </div>
                  <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {ach.label}
                  </h4>
                  <div className={`text-[10px] font-black uppercase tracking-[0.15em] ${earned ? "text-amber-500" : "text-slate-500"}`}>
                    {earned ? t.achievementEarned : t.achievementLocked}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
