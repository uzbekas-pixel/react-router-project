  import { useState, useEffect, useCallback } from "react";
import {
  collection, getDocs, deleteDoc, doc,
  setDoc, updateDoc, serverTimestamp, addDoc, writeBatch, getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import {
  LuInfo, LuCircleCheck, LuTriangleAlert, LuGift, LuGraduationCap,
  LuLayoutDashboard, LuUsers, LuTicket, LuBell, LuShield,
  LuChartBar, LuPlus, LuX, LuTrash2, LuCheck, LuMegaphone, LuSend,
  LuBookOpen, LuUser, LuCoins,  LuClipboardList, LuMonitorPlay,
  LuBriefcase, LuPhoneCall, LuAward, LuClock
} from "react-icons/lu";

const NOTIF_TYPES = (t) => [
  { value: "info",    label: t.info || "Info",       icon: <LuInfo />,          color: "#3b82f6" },
  { value: "success", label: t.success || "Success",    icon: <LuCircleCheck />,   color: "#10b981" },
  { value: "warning", label: t.warning || "Warning",   icon: <LuTriangleAlert />, color: "#f59e0b" },
  { value: "promo",   label: t.promo || "Promo",           icon: <LuGift />,          color: "#8b5cf6" },
  { value: "course",  label: t.course || "Course",            icon: <LuGraduationCap />, color: "#06b6d4" },
];

// ─── InstructorRow komponenti ─────────────────────────────────────────────────
const InstructorRow = ({ u, darkMode, showToast }) => {
  const { t } = useLang();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    getDoc(doc(db, "instructors", u.id))
      .then((snap) => setIsInstructor(snap.exists() && snap.data().isInstructor === true))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [u.id]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (isInstructor) {
        await deleteDoc(doc(db, "instructors", u.id));
        setIsInstructor(false);
        showToast(`${u.displayName || u.email} — ${t.instructorAccessRemoved}`, "error");
      } else {
        await setDoc(doc(db, "instructors", u.id), {
          isInstructor: true,
          uid:       u.id,
          name:      u.displayName || u.email,
          email:     u.email || "",
          grantedAt: serverTimestamp(),
        });
        setIsInstructor(true);
        showToast(`${u.displayName || u.email} — ${t.instructorCreated}`, "success");
        // Bildirishnoma yuborish
        await setDoc(
          doc(db, "users", u.id, "notifications", `instructor_${Date.now()}`),
          {
            title:     t.instructorRightsTitle,
            message:   t.instructorRightsMsg,
            type:      "success",
            read:      false,
            createdAt: serverTimestamp(),
          }
        );
      }
    } catch (err) {
      console.error(err);
      showToast(t.error || "Xatolik!", "error");
    }
    setLoading(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl mb-3 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {u.avatarUrl
            ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
            : u.displayName?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {u.displayName || t.unknown}
            {isInstructor && (
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                {t.instructorBadge}
              </span>
            )}
          </p>
          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
          isInstructor
            ? "bg-green-500 text-white hover:bg-red-500"
            : "border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
        }`}>
        {loading ? "..." : isInstructor ? t.instructorGranted : t.makeInstructor}
      </button>
    </div>
  );
};

// ─── Main Admin ───────────────────────────────────────────────────────────────
const Admin = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  // Promo
  const [promoCodes, setPromoCodes]       = useState([]);
  const [promoLoading, setPromoLoading]   = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm]         = useState({ code: "", discount: "", type: "percent", course: "all", maxUses: "100" });
  const [promoSaving, setPromoSaving]     = useState(false);

  // Bildirishnoma
  const [notifForm, setNotifForm]   = useState({ title: "", message: "", type: "info", target: "all", userId: "", link: "" });
  const [notifSending, setNotifSending] = useState(false);
  const [sentHistory, setSentHistory]   = useState([]);
  const [histLoading, setHistLoading]   = useState(false);
  
  // Kurslar
  const [pendingCourses, setPendingCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Mentorlar 
  const [mentorApps, setMentorApps] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);

  // Xakatonlar (PIXEL CHALLENGE)
  const [challenges, setChallenges] = useState([]);
  const [chalLoading, setChalLoading] = useState(false);
  const [showChalForm, setShowChalForm] = useState(false);
  const [chalForm, setChalForm] = useState({ title: "", desc: "", prize: 500, duration: 24 });
  const [chalSaving, setChalSaving] = useState(false);

  // ── Foydalanuvchilar ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch { showToast(t.loadError, "error"); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [showToast, t.loadError]);

  // ── Fetch Functions ─────────────────────────────────────────────────────────
  const fetchPromoCodes = useCallback(async () => {
    setPromoLoading(true);
    try {
      const snap = await getDocs(collection(db, "promoCodes"));
      setPromoCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { showToast("Promo kodlarni yuklashda xatolik!", "error"); }
    setPromoLoading(false);
  }, [showToast]);

  const fetchNotifHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const snap = await getDocs(collection(db, "adminNotifications"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSentHistory(list);
    } catch (err) { console.error(err); }
    setHistLoading(false);
  }, []);

  const fetchPendingCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const snap = await getDocs(collection(db, "instructorCourses"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(c => c.status === "pending" || c.status === "rejected");
      setPendingCourses(list);
    } catch (err) { console.error(err); }
    setCoursesLoading(false);
  }, []);

  const fetchMentorApps = useCallback(async () => {
    setMentorsLoading(true);
    try {
      const snap = await getDocs(collection(db, "mentorApplications"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(app => app.status === "pending");
      setMentorApps(list);
    } catch (err) { console.error(err); }
    setMentorsLoading(false);
  }, []);

  const fetchChallenges = useCallback(async () => {
    setChalLoading(true);
    try {
      const snap = await getDocs(collection(db, "challenges"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setChallenges(list);
    } catch (err) { console.error(err); }
    setChalLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "promo") fetchPromoCodes();
    if (activeTab === "notif") fetchNotifHistory();
    if (activeTab === "courses") fetchPendingCourses();
    if (activeTab === "mentors") fetchMentorApps(); 
    if (activeTab === "challenges") fetchChallenges(); // Xakatonlarni yuklash
  }, [activeTab, fetchPromoCodes, fetchNotifHistory, fetchPendingCourses, fetchMentorApps, fetchChallenges]);

  // ── Handlers (Foydalanuvchilar) ──────────────────────────────────────────
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} ${t.confirmDelete}`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      showToast(`${userName} ${t.deleteSuccess}`, "success");
    } catch { showToast(t.deleteError, "error"); }
  };

  // ── Handlers (Xakatonlar / Challenges) ──────────────────────────────────
  const handleAddChallenge = async () => {
    if (!chalForm.title.trim() || !chalForm.desc.trim() || !chalForm.duration || !chalForm.prize) {
      showToast("Barcha maydonlarni to'ldiring!", "error"); return;
    }
    setChalSaving(true);
    try {
      // Yangisi ochilganda oldingi barcha "active" musobaqalarni avtomatik yopish (Tavsiya qilinadi)
      const activeChals = challenges.filter(c => c.status === "active");
      for (let c of activeChals) {
        await updateDoc(doc(db, "challenges", c.id), { status: "ended" });
      }

      const endDate = new Date(Date.now() + (Number(chalForm.duration) * 60 * 60 * 1000));

      await addDoc(collection(db, "challenges"), {
        title: chalForm.title.trim(),
        desc: chalForm.desc.trim(),
        prize: Number(chalForm.prize),
        status: "active",
        createdAt: serverTimestamp(),
        endDate: endDate
      });

      showToast("Yangi musobaqa e'lon qilindi! Taymer ishga tushdi.", "success");
      setShowChalForm(false);
      setChalForm({ title: "", desc: "", prize: 500, duration: 24 });
      fetchChallenges();
    } catch (err) {
      console.error(err);
      showToast("Xatolik yuz berdi", "error");
    }
    setChalSaving(false);
  };

  const handleToggleChallengeStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "challenges", id), { status: currentStatus === "active" ? "ended" : "active" });
      fetchChallenges();
      showToast("Holat o'zgardi", "success");
    } catch (err) { 
      console.error(err);
      showToast("Xatolik", "error"); }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Musobaqani va uning ishlarini butunlay o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, "challenges", id));
      setChallenges(prev => prev.filter(c => c.id !== id));
      showToast("Musobaqa o'chirildi", "success");
    } catch (err) {
      console.error(err);
      showToast("Xatolik", "error"); }
  };

  // ── Handlers (Kurslar) ───────────────────────────────────────────────────
  const handleApproveCourse = async (courseId, instructorId, title) => {
    try {
      await updateDoc(doc(db, "instructorCourses", courseId), { status: "approved" });
      setPendingCourses(prev => prev.filter(c => c.id !== courseId));
      showToast(t.courseApproved || "Kurs tasdiqlandi!", "success");

      if (instructorId) {
        await setDoc(doc(db, "users", instructorId, "notifications", `course_appr_${Date.now()}`), {
          title: "Kurs tasdiqlandi!",
          message: `Siz yaratgan "${title}" darsi tasdiqlandi.`,
          type: "success", read: false, createdAt: serverTimestamp(),
        });
      }
    } catch (err) { showToast("Xatolik: " + err.message, "error"); }
  };

  const handleRejectCourse = async (courseId, instructorId, title) => {
    const reason = window.prompt(t.rejectReasonPrompt || "Rad etish sababini yozing:");
    if (reason === null) return; 

    try {
      await updateDoc(doc(db, "instructorCourses", courseId), { status: "rejected", rejectReason: reason });
      setPendingCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: "rejected" } : c));
      showToast(t.courseRejected || "Kurs rad etildi", "success");

      if (instructorId) {
        await setDoc(doc(db, "users", instructorId, "notifications", `course_rej_${Date.now()}`), {
          title: "Kurs rad etildi",
          message: `"${title}" darsi rad etildi. Sababi: ${reason}`,
          type: "warning", read: false, createdAt: serverTimestamp(),
        });
      }
    } catch (err) { showToast("Xatolik: " + err.message, "error"); }
  };

  // ── Handlers (Mentor arizalari) ──────────────────────────────────
  const handleApproveMentor = async (appId, userId, userName) => {
    if (!window.confirm(`${userName} ni rasmiy Mentor sifatida tasdiqlaysizmi?`)) return;
    try {
      await updateDoc(doc(db, "mentorApplications", appId), { status: "approved" });
      await setDoc(doc(db, "users", userId), { isMentor: true }, { merge: true });
      await setDoc(doc(db, "users", userId, "notifications", `mentor_appr_${Date.now()}`), {
        title: "Mentorlik tasdiqlandi!",
        message: "Tabriklaymiz! Sizning mentorlik arizangiz qabul qilindi.",
        type: "success", read: false, createdAt: serverTimestamp(),
      });
      setMentorApps(prev => prev.filter(a => a.id !== appId));
      showToast(`${userName} Mentor etib tayinlandi!`, "success");
    } catch (err) { 
      showToast("Xatolik: " + err.message, "error"); 
    }
  };

  const handleRejectMentor = async (appId, userId, userName) => {
    const reason = window.prompt(`${userName} arizasini rad etish sababini yozing:`);
    if (reason === null) return;
    try {
      await updateDoc(doc(db, "mentorApplications", appId), { status: "rejected", rejectReason: reason });
      await setDoc(doc(db, "users", userId, "notifications", `mentor_rej_${Date.now()}`), {
        title: "Mentorlik arizasi rad etildi",
        message: `Afsuski arizangiz rad etildi. Sababi: ${reason}`,
        type: "warning", read: false, createdAt: serverTimestamp(),
      });
      setMentorApps(prev => prev.filter(a => a.id !== appId));
      showToast("Ariza rad etildi.", "success");
    } catch (err) { 
      showToast("Xatolik: " + err.message, "error"); 
    }
  };

  // ── Handlers (Promo kodlar) ──────────────────────────────────────────────
  const handleAddPromo = async () => {
    const code = promoForm.code.trim().toUpperCase();
    if (!code || !promoForm.discount) { showToast("Kod va chegirma kiritilmadi!", "error"); return; }
    setPromoSaving(true);
    try {
      await setDoc(doc(db, "promoCodes", code), {
        discount: Number(promoForm.discount), type: promoForm.type,
        course: promoForm.course, maxUses: Number(promoForm.maxUses),
        uses: 0, valid: true, createdAt: serverTimestamp(),
      });
      showToast(`"${code}" promo kodi qo'shildi!`, "success");
      setShowPromoForm(false);
      setPromoForm({ code: "", discount: "", type: "percent", course: "all", maxUses: "100" });
      fetchPromoCodes();
    } catch { showToast("Xatolik!", "error"); }
    setPromoSaving(false);
  };

  const handleTogglePromo = async (promoId, currentValid) => {
    try {
      await updateDoc(doc(db, "promoCodes", promoId), { valid: !currentValid });
      setPromoCodes((prev) => prev.map((p) => p.id === promoId ? { ...p, valid: !currentValid } : p));
      showToast(currentValid ? t.promoDisabled : t.promoEnabled, "success");
    } catch { showToast("Xatolik!", "error"); }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm(`"${promoId}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, "promoCodes", promoId));
      setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
      showToast("O'chirildi!", "success");
    } catch { showToast("Xatolik!", "error"); }
  };

  // ── Handlers (Bildirishnomalar) ──────────────────────────────────────────
  const handleSendNotif = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast("Sarlavha va xabar kiritilmadi!", "error"); return;
    }
    if (notifForm.target === "user" && !notifForm.userId) {
      showToast("Foydalanuvchi tanlanmadi!", "error"); return;
    }
    setNotifSending(true);
    try {
      const base = {
        title:     notifForm.title.trim(),
        message:   notifForm.message.trim(),
        type:      notifForm.type,
        link:      notifForm.link.trim() || null,
        read:      false,
        createdAt: serverTimestamp(),
      };
      if (notifForm.target === "all") {
        const batch     = writeBatch(db);
        const timestamp = Date.now();
        users.forEach((u) => {
          const ref = doc(db, "users", u.id, "notifications", `notif_${timestamp}_${u.id}`);
          batch.set(ref, { ...base, userId: u.id });
        });
        await batch.commit();
        await addDoc(collection(db, "adminNotifications"), { ...base, target: "all", targetCount: users.length });
        showToast(`✅ ${users.length} ${t.notificationSentCount}`, "success");
      } else {
        const targetUser = users.find((u) => u.id === notifForm.userId);
        const timestamp  = Date.now();
        const ref = doc(db, "users", notifForm.userId, "notifications", `notif_${timestamp}_${notifForm.userId}`);
        await setDoc(ref, { ...base, userId: notifForm.userId });
        await addDoc(collection(db, "adminNotifications"), {
          ...base, target: "user",
          targetId:   notifForm.userId,
          targetName: targetUser?.displayName || targetUser?.email || "—",
        });
        showToast(`${targetUser?.displayName || "Foydalanuvchi"}${t.sentPrefix || ""} ${t.notificationSentCount}`, "success");
      }
      setNotifForm({ title: "", message: "", type: "info", target: "all", userId: "", link: "" });
      fetchNotifHistory();
    } catch (err) {
      console.error(err);
      showToast("Yuborishda xatolik!", "error");
    }
    setNotifSending(false);
  };

  const handleDeleteNotif = async (notifId) => {
    if (!window.confirm(t.confirmDeleteNotif || "Bu bildirishnomani o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, "adminNotifications", notifId));
      setSentHistory((prev) => prev.filter((n) => n.id !== notifId));
      showToast(t.deleteSuccess || "Bildirishnoma o'chirildi!", "success");
    } catch { showToast("Xatolik!", "error"); }
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const cardClass  = `rounded-2xl p-6 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`;
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
    background: darkMode ? "#0f172a" : "#f8fafc",
    color: darkMode ? "#f1f5f9" : "#111",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  // ── TABS ─────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "stats",       label: t.adminTabStats,        icon: <LuChartBar />      },
    { id: "users",       label: t.adminTabUsers,         icon: <LuUsers />         },
    { id: "instructors", label: t.adminTabInstructors,    icon: <LuGraduationCap /> },
    { id: "mentors",     label: "Arizalar",            icon: <LuBriefcase /> },
    { id: "courses",     label: t.adminTabCourses, icon: <LuBookOpen />  },
    { id: "challenges",  label: "Xakaton",             icon: <LuAward /> }, // Xakaton tabi qo'shildi
    { id: "promo",       label: t.adminTabPromo,     icon: <LuTicket />        },
    { id: "notif",       label: t.adminTabNotif,    icon: <LuBell />          },
  ];

  return (
    <div className={`page-transition w-full max-w-6xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-extrabold flex items-center gap-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <LuShield className="text-blue-500" /> {t.adminTitle}
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.adminSub}</p>
          </div>
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl">{t.adminBadge}</span>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={100}>
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id ? "bg-blue-500 text-white"
                : darkMode ? "bg-slate-800 text-gray-400 hover:bg-slate-700"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}>
              {tab.icon} {tab.label}
              {tab.id === "mentors" && mentorApps.length > 0 && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Stats ── */}
      {activeTab === "stats" && (
        <ScrollReveal direction="up" delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className={cardClass}>
              <div className="text-3xl font-extrabold text-blue-400">{users.length}</div>
              <div className="text-2xl mt-1 text-blue-300"><LuUsers /></div>
              <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.totalUsers || "Total Users"}</p>
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.recentUsers}</h3>
            {loading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
              : users.slice(0, 5).map((u) => (
                <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{u.displayName || t.unknown}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── Users ── */}
      {activeTab === "users" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t.allUsers || "All Users"} ({users.length})
            </h3>
            {loading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
              : users.map((u) => (
                <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl mb-3 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.displayName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{u.displayName || t.unknown}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUser(u.id, u.displayName || u.email)}
                    className="px-3 py-1.5 text-xs text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition">
                    {t.delete}
                  </button>
                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── O'qituvchilar ── */}
      {activeTab === "instructors" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuGraduationCap className="text-green-400" /> {t.adminTabInstructors}
              </h3>
              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {users.length} {t.usersCountLabel || "ta foydalanuvchi"}
              </span>
            </div>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t.instructorAccessDesc || "Qaysi foydalanuvchiga O'qituvchi panelini ishlatishga ruxsat berasiz?"}
            </p>
            {loading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
              : users.map((u) => (
                <InstructorRow key={u.id} u={u} darkMode={darkMode} showToast={showToast} />
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── MENTORLIK ARIZALARI ── */}
      {activeTab === "mentors" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuBriefcase className="text-purple-500" /> Mentorlikka Arizalar ({mentorApps.length})
              </h3>
            </div>
            
            {mentorsLoading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" /></div>
            ) : mentorApps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 42, marginBottom: 12, display: "flex", justifyContent: "center", color: "#94a3b8" }}><LuBriefcase /></div>
                <p style={{ color: "#6b7280" }}>Yangi arizalar yo'q.</p>
              </div>
            ) : mentorApps.map((app) => (
                <div key={app.id} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px", borderRadius: 16, marginBottom: 16, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                  
                  <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                      {app.userAvatar ? <img src={app.userAvatar} alt="" className="w-full h-full object-cover" /> : app.userName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h4 className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{app.userName}</h4>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{app.userEmail}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      <LuPhoneCall size={16} /> <a href={`tel:${app.phone}`}>{app.phone}</a>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                        Yo'nalish: {app.subject}
                      </span>
                      <span className="text-xs text-gray-400">{app.createdAt?.toDate?.()?.toLocaleString("uz")}</span>
                    </div>
                    <p className={`text-sm leading-relaxed p-3 rounded-xl ${darkMode ? "bg-slate-800 text-gray-300" : "bg-white text-gray-700"} border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                      <span className="font-semibold block mb-1">Tajribasi va maqsadi:</span>
                      "{app.reason}"
                    </p>
                  </div>
                  
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => handleApproveMentor(app.id, app.userId, app.userName)}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-sm shadow-green-500/20">
                      <LuCheck /> Mentor qilib tasdiqlash
                    </button>
                    <button onClick={() => handleRejectMentor(app.id, app.userId, app.userName)}
                      className="py-2.5 px-6 border border-red-500 text-red-500 hover:bg-red-50 hover:dark:bg-red-500/10 rounded-xl font-semibold transition flex justify-center items-center gap-2">
                      <LuX /> Rad etish
                    </button>
                  </div>

                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── Kutilayotgan kurslar (Pending) ── */}
      {activeTab === "courses" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuBookOpen className="text-orange-400" /> {t.pendingCoursesTitle} ({pendingCourses.length})
              </h3>
            </div>
            
            {coursesLoading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
              : pendingCourses.length === 0
              ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 42, marginBottom: 12, display: "flex", justifyContent: "center", color: "#94a3b8" }}><LuBookOpen /></div>
                  <p style={{ color: "#6b7280" }}>{t.noPendingCourses}</p>
                </div>
              )
              : pendingCourses.map((course) => (
                <div key={course.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px", borderRadius: 12, marginBottom: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: course.status === "rejected" ? "#fee2e2" : "#fef3c7", color: course.status === "rejected" ? "#991b1b" : "#92400e" }}>
                          {course.status === "rejected" ? t.courseStatusRejected : t.courseStatusPending}
                        </span>
                        <span style={{ fontSize: 11, background: "#eff6ff", color: "#3b82f6", padding: "2px 8px", borderRadius: 6 }}>{course.category}</span>
                      </div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>{course.title}</h4>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280" }}>{course.description}</p>
                      
                      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
                        <span className="flex items-center gap-1"><LuUser /> {t.instructorBadge}: <b style={{ color: darkMode ? "#e2e8f0" : "#374151" }}>{course.instructorName}</b></span>
                        <span className="flex items-center gap-1"><LuCoins /> {course.price === 0 ? t.free || "Bepul" : `${Number(course.price).toLocaleString()} so'm`}</span>
                        <span className="flex items-center gap-1"><LuMonitorPlay /> {course.lessons?.length || 0} {t.lessonsCount || "ta dars"}</span>
                      </div>
                    </div>
                    
                   <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleApproveCourse(course.id, course.instructorId, course.title)}
                      style={{ padding: "8px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <LuCheck /> Tasdiqlash
                    </button>
                    
                    {course.status !== "rejected" && (
                      <button onClick={() => handleRejectCourse(course.id, course.instructorId, course.title)}
                        style={{ padding: "8px 14px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <LuX /> Rad etish
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── XAKATONLAR (Pixel Challenge) ── */}
      {activeTab === "challenges" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuAward className="text-purple-500" /> Pixel Challenges ({challenges.length})
              </h3>
              <button onClick={() => setShowChalForm(!showChalForm)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
                {showChalForm ? <><LuX /> Bekor qilish</> : <><LuPlus /> Yangi e'lon qilish</>}
              </button>
            </div>

            {showChalForm && (
              <div style={{ background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                <h4 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>Yangi Xakaton yaratish</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Sarlavha *</label>
                    <input value={chalForm.title} placeholder="Masalan: Minimal Music Player"
                      onChange={(e) => setChalForm({ ...chalForm, title: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Qisqacha ta'rif va qoidalar *</label>
                    <textarea value={chalForm.desc} placeholder="Talablar va shartlarni yozing..." rows={3}
                      onChange={(e) => setChalForm({ ...chalForm, desc: e.target.value })} style={{...inputStyle, resize: "none"}} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Mukofot (Tanga) *</label>
                      <input 
  type="number" 
  value={chalForm.prize} 
  placeholder="500"
  onChange={(e) => setChalForm({ ...chalForm, prize: e.target.value })} 
  style={inputStyle}
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
/>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Davomiyligi (Soat) *</label>
                      <input 
  type="number" 
  value={chalForm.duration} 
  placeholder="24"
  onChange={(e) => setChalForm({ ...chalForm, duration: e.target.value })} 
  style={inputStyle}
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
/>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button onClick={handleAddChallenge} disabled={chalSaving}
                    style={{ padding: "10px 24px", background: chalSaving ? "#d8b4fe" : "#9333ea", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: chalSaving ? "default" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    {chalSaving ? "Saqlanmoqda..." : <><LuCheck /> E'lon qilish</>}
                  </button>
                  <button onClick={() => setShowChalForm(false)}
                    style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13, color: darkMode ? "#94a3b8" : "#374151", cursor: "pointer" }}>
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {chalLoading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" /></div>
              : challenges.length === 0
              ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 42, marginBottom: 12, display: "flex", justifyContent: "center", color: "#94a3b8" }}><LuAward /></div>
                  <p style={{ color: "#6b7280" }}>Hali musobaqalar yo'q. Yangi e'lon qiling!</p>
                </div>
              )
              : challenges.map((chal) => (
                <div key={chal.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px", borderRadius: 12, marginBottom: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${chal.status === "active" ? (darkMode ? "#3b82f655" : "#3b82f6") : (darkMode ? "#334155" : "#e5e7eb")}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: chal.status === "active" ? "#dcfce7" : "#f1f5f9", color: chal.status === "active" ? "#166534" : "#475569" }}>
                          {chal.status === "active" ? "Aktiv" : "Tugagan"}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-bold"><LuCoins /> {chal.prize} Tanga</span>
                      </div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>{chal.title}</h4>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280" }}>{chal.desc}</p>
                      
                      <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", gap: 16 }}>
                         <span className="flex items-center gap-1"><LuClock size={12}/> Boshlandi: {chal.createdAt?.toDate?.()?.toLocaleString("uz") || "—"}</span>
                         <span className="flex items-center gap-1"><LuClock size={12}/> Tugaydi: {chal.endDate?.toDate?.()?.toLocaleString("uz") || "—"}</span>
                      </div>
                    </div>
                    
                   <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => handleToggleChallengeStatus(chal.id, chal.status)}
                      style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${chal.status === "active" ? "#f59e0b" : "#10b981"}`, color: chal.status === "active" ? "#f59e0b" : "#10b981", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      {chal.status === "active" ? "To'xtatish" : "Qayta aktivlash"}
                    </button>
                    <button onClick={() => handleDeleteChallenge(chal.id)}
                      style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                  </div>
                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}

      {/* ── Promo ── */}
      {activeTab === "promo" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuTicket className="text-purple-400" /> {t.adminTabPromo} ({promoCodes.length})
              </h3>
              <button onClick={() => setShowPromoForm(!showPromoForm)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
                {showPromoForm ? <><LuX /> {t.cancel}</> : <><LuPlus /> {t.newPromo || "Yangi kod"}</>}
              </button>
            </div>

            {showPromoForm && (
              <div style={{ background: darkMode ? "#0f172a" : "#f8fafc", borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                <h4 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{t.newPromoTitle || "Yangi promo kod"}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.promoCodeName} *</label>
                    <input value={promoForm.code} placeholder="PIXEL50"
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.discount} *</label>
                    <input 
  type="number" 
  value={promoForm.discount} 
  placeholder="50"
  onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })} 
  style={inputStyle}
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
/>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.promoType}</label>
                    <select value={promoForm.type} onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })} style={inputStyle}>
                      <option value="percent">{t.promoPercent}</option>
                      <option value="sum">{t.promoSum}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Kurs</label>
                    <select value={promoForm.course} onChange={(e) => setPromoForm({ ...promoForm, course: e.target.value })} style={inputStyle}>
                      {["all", "HTML", "CSS", "JavaScript", "React", "English", "Russian", "French"].map((c) => (
                        <option key={c} value={c}>{c === "all" ? "Barcha kurslar" : c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.promoMaxUses}</label>
                   <input 
  type="number" 
  value={promoForm.maxUses} 
  placeholder="100"
  onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })} 
  style={inputStyle}
  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
/>
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button onClick={handleAddPromo} disabled={promoSaving}
                    style={{ padding: "10px 24px", background: promoSaving ? "#93c5fd" : "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: promoSaving ? "default" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    {promoSaving ? (t.saving || "Saqlanmoqda...") : <><LuCheck /> {t.save || "Saqlash"}</>}
                  </button>
                  <button onClick={() => setShowPromoForm(false)}
                    style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 10, fontSize: 13, color: darkMode ? "#94a3b8" : "#374151", cursor: "pointer" }}>
                    {t.cancel || "Bekor qilish"}
                  </button>
                </div>
              </div>
            )}

            {promoLoading
              ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
              : promoCodes.length === 0
              ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 42, marginBottom: 12, display: "flex", justifyContent: "center", color: "#94a3b8" }}><LuTicket /></div>
                  <p style={{ color: "#6b7280" }}>{t.noPromosFound || "Hali promo kod yo'q. 'Yangi kod' bosing!"}</p>
                </div>
              )
              : promoCodes.map((promo) => (
                <div key={promo.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, marginBottom: 8, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${promo.valid ? (darkMode ? "#334155" : "#e5e7eb") : "#ef444433"}`, opacity: promo.valid ? 1 : 0.6 }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: promo.valid ? "#3b82f6" : "#9ca3af", minWidth: 100 }}>{promo.id}</span>
                  <div style={{ flex: 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 700 }}>
                      {promo.type === "percent" ? `${promo.discount}%` : `${Number(promo.discount).toLocaleString()} so'm`}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{promo.course === "all" ? "Barcha kurslar" : promo.course}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{promo.uses || 0}/{promo.maxUses} marta</span>
                   <span style={{ 
  display: "inline-flex", 
  alignItems: "center", 
  gap: "4px", 
  padding: "2px 8px", 
  borderRadius: 20, 
  background: promo.valid ? "#d1fae5" : "#fee2e2", 
  color: promo.valid ? "#065f46" : "#991b1b", 
  fontSize: 11, 
  fontWeight: 600 
}}>
  {promo.valid  ? <><LuCheck size={12} /> {t.promoActive || "Aktiv"}</> : <><LuX size={12} /> {t.promoInactive || "O'chirilgan"}</>}
</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleTogglePromo(promo.id, promo.valid)}
                      style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${promo.valid ? "#ef4444" : "#10b981"}`, background: "transparent", color: promo.valid ? "#ef4444" : "#10b981", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      {promo.valid ? t.disable : t.enable}
                    </button>
                    <button onClick={() => handleDeletePromo(promo.id)}
                      style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <LuTrash2 />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </ScrollReveal>
      )}
      
      {/* ── Bildirishnoma ── */}
      {activeTab === "notif" && (
        <ScrollReveal direction="up" delay={200}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div className={cardClass}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuBell className="text-blue-400" /> {t.adminTabNotif}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 16 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Sarlavha *</label>
                  <input value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="Yangi kurs qo'shildi!" style={inputStyle} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Xabar matni *</label>
                  <textarea value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    placeholder="Xabar matnini yozing..." rows={3}
                    style={{ ...inputStyle, resize: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.promoType}</label>
                  <select value={notifForm.type} onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })} style={inputStyle}>
                    {NOTIF_TYPES(t).map((nt) => (
                      <option key={nt.value} value={nt.value}>{nt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>{t.notificationTarget}</label>
                  <select value={notifForm.target} onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value, userId: "" })} style={inputStyle}>
                    <option value="all"> {t.notificationAll} ({users.length})</option>
                    <option value="user"> {t.notificationUser}</option>
                  </select>
                </div>
                {notifForm.target === "user" && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Foydalanuvchi *</label>
                    <select value={notifForm.userId} onChange={(e) => setNotifForm({ ...notifForm, userId: e.target.value })} style={inputStyle}>
                      <option value="">— {t.selectUser || "Tanlang"} —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Havola (ixtiyoriy)</label>
                  <input value={notifForm.link} onChange={(e) => setNotifForm({ ...notifForm, link: e.target.value })}
                    placeholder="/courses yoki /quiz" style={inputStyle} />
                </div>
              </div>

              {(notifForm.title || notifForm.message) && (
                <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${NOTIF_TYPES(t).find((n) => n.value === notifForm.type)?.color || "#3b82f6"}55` }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{t.notificationPreview}</p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{NOTIF_TYPES(t).find((n) => n.value === notifForm.type)?.icon || <LuBell />}</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{notifForm.title || t.notificationTitle}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{notifForm.message || t.notificationMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleSendNotif} disabled={notifSending}
                style={{ padding: "12px 28px", background: notifSending ? "#93c5fd" : "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: notifSending ? "default" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {notifSending ? (t.sending || "Yuborilmoqda...")
                  : notifForm.target === "all"
                  ? <><LuMegaphone /> {t.notificationAll} {t.notificationSentCount}</>
                  : <><LuSend /> {t.send || "Yuborish"}</>
                }
              </button>
            </div>

            <div className={cardClass}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <LuClipboardList className="text-gray-400" /> {t.sentNotifications}
              </h3>
              {histLoading
                ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
                : sentHistory.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280" }}>
                    <div style={{ fontSize: 32, marginBottom: 8, display: "flex", justifyContent: "center"}}><LuBell /></div>
                    <p>{t.noNotificationsSent}</p>
                  </div>
                )
                : sentHistory.map((n) => {
                  const typeInfo = NOTIF_TYPES(t).find((nt) => nt.value === n.type) || NOTIF_TYPES(t)[0];
                  return (
                    <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, marginBottom: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderLeft: `4px solid ${typeInfo.color}` }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{typeInfo.label.split(" ")[0]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{n.title}</p>
                        <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280" }}>{n.message}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: darkMode ? "#334155" : "#e5e7eb", color: "#6b7280" }}>
                            {n.target === "all" ? `👥 ${n.targetCount || "?"} ta foydalanuvchi` : `👤 ${n.targetName || "?"}`}
                          </span>
                          {n.link && <span style={{ fontSize: 11, color: "#3b82f6" }}>🔗 {n.link}</span>}
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>
                            {n.createdAt?.toDate?.()?.toLocaleString("uz") || "—"}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteNotif(n.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", flexShrink: 0, padding: "2px 6px", borderRadius: 6 }}>
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default Admin;