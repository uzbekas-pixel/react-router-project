import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { auth, db } from "../firebase/config";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { 
  LuUser, 
  LuShield, 
  LuSave, 
  LuLock, 
  LuPhone, 
  LuImage, 
  LuMail,
  LuType,
  LuCheck,
  LuBriefcase,
  LuSend,
  LuBadgeCheck,
  LuTrophy,
  LuGem,
  LuX
} from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";

// Do'kondagi ranglarni chaqirib olamiz
import { NAME_COLORS } from "../constants/shopConstants";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";

// Nishonlar dizayni uchun lug'at
const BADGES_DICT = {
  badge_champion: { label: "Champion", icon: <LuTrophy size={14} />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  badge_pro: { label: "Pro", icon: <LuGem size={14} />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" }
};

const Profile = ({ darkMode, showToast, showConfetti }) => {
  const { user } = useAuth();
  const { t }    = useLang();

  // Tablar: profil, xavfsizlik, mentorlik, va nishonlar
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    displayName:     user?.displayName || "",
    phone:           "",
    bio:             "",
    newPassword:     "",
    confirmPassword: "",
  });
  
  // ── Mentorlik arizasi uchun state ──
  const [mentorForm, setMentorForm] = useState({ phone: "", subject: "Front-End", reason: "" });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isSupport, setIsSupport] = useState(false);

  // ── Yutuqlar va Ranglar uchun state ──
  const [nameColor, setNameColor] = useState("default");
  const [ownedBadges, setOwnedBadges] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);

  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadProfileAndStatus = async () => {
      if (!user) return;
      
      // 1. Profil ma'lumotlari
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm((prev) => ({
          ...prev,
          displayName: data.displayName || user.displayName || "",
          phone:       data.phone || "",
          bio:         data.bio   || "",
        }));
        setAvatarPreview(data.avatarUrl || null);
        setIsSupport(data.isSupport || false);
        setNameColor(data.nameColor || "default");
        setActiveBadges(data.activeBadges || []);
        
        if(data.phone) setMentorForm(p => ({...p, phone: data.phone})); 
      }

      // 2. Do'kondan olingan nishonlarni tekshirish (Wallet)
      const walletSnap = await getDoc(doc(db, "users", user.uid, "data", "wallet"));
      if (walletSnap.exists()) {
        const walletData = walletSnap.data();
        const owned = walletData.owned || [];
        // Faqat "badge_" bilan boshlanadigan narsalarni ajratib olamiz
        setOwnedBadges(owned.filter(item => item.startsWith("badge_")));
      }

      // 3. Ariza holatini tekshirish
      const q = query(collection(db, "mentorApplications"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const latestApp = querySnapshot.docs.map(d => d.data()).sort((a,b) => b.createdAt - a.createdAt)[0];
        setApplicationStatus(latestApp.status);
      }
    };
    loadProfileAndStatus();
  }, [user]);

  // ── Nishonni Taqish / Yechish Funksiyasi ──
  const toggleBadge = async (badgeId) => {
    let newActive = [...activeBadges];
    if (newActive.includes(badgeId)) {
      // Agar taqilgan bo'lsa, olib tashlaymiz
      newActive = newActive.filter(id => id !== badgeId);
      showToast("Nishon olib tashlandi", "success");
    } else {
      // Maksimal 3 ta nishon taqish mumkin
      if (newActive.length >= 3) {
        showToast("Maksimal 3 ta nishon taqish mumkin", "warning");
        return;
      }
      newActive.push(badgeId);
      showToast("Nishon taqildi!", "success");
      showConfetti?.();
    }
    
    setActiveBadges(newActive);
    try {
      await setDoc(doc(db, "users", user.uid), { activeBadges: newActive }, { merge: true });
    } catch (err) {
      console.error(err);
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setAvatarPreview(data.data.url);
        showToast(t.avatarUploaded || "Rasm yuklandi", "success");
      } else {
        showToast(t.avatarUploadError || "Rasm yuklashda xatolik", "error");
      }
    } catch {
      showToast(t.avatarUploadError || "Rasm yuklashda xatolik", "error");
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: form.displayName,
        photoURL:    avatarPreview || auth.currentUser.photoURL || "",
      });
      await setDoc(doc(db, "users", user.uid), {
        displayName: form.displayName,
        phone:       form.phone,
        bio:         form.bio,
        avatarUrl:   avatarPreview || "",
        photoURL:    avatarPreview || "",
        email:       user.email,
        updatedAt:   new Date().toISOString(),
      }, { merge: true });
      showConfetti?.();
      showToast(t.profileUpdated || "Saqlandi", "success");
    } catch {
      showToast(t.updateError || "Xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      showToast(t.passwordMismatchMsg || "Parollar mos emas", "error"); return;
    }
    if (form.newPassword.length < 6) {
      showToast(t.passwordShort || "Parol qisqa", "error"); return;
    }
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, form.newPassword);
      showToast(t.passwordUpdated || "Parol yangilandi", "success");
      setForm({ ...form, newPassword: "", confirmPassword: "" });
    } catch {
      showToast(t.passwordUpdateError || "Xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMentor = async () => {
    if (!mentorForm.phone || !mentorForm.reason) {
      showToast("Iltimos, barcha maydonlarni to'ldiring!", "warning");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "mentorApplications"), {
        userId: user.uid,
        userName: form.displayName || user.displayName || user.email,
        userEmail: user.email,
        userAvatar: avatarPreview || user.photoURL || "",
        phone: mentorForm.phone,
        subject: mentorForm.subject,
        reason: mentorForm.reason,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setApplicationStatus("pending");
      showConfetti?.();
      showToast("Arizangiz muvaffaqiyatli yuborildi!", "success");
    } catch (err) {
      console.error(err);
      showToast("Ariza yuborishda xatolik yuz berdi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border text-sm outline-none transition-all duration-300 ${
    darkMode
      ? "bg-slate-800/50 border-white/10 text-white placeholder-slate-500 focus:border-blue-500"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
  }`;

  const tabs = [
    { id: "profile",  label: t.profileTab || "Profil",  icon: <LuUser size={16} />   },
    { id: "security", label: t.securityTab || "Xavfsizlik", icon: <LuShield size={16} /> },
    { id: "mentor", label: "Mentorlik", icon: <LuBriefcase size={16} /> },
    { id: "badges", label: "Nishonlar", icon: <LuBadgeCheck size={16} /> },
  ];

  // Do'kondan kelayotgan rang stili
  const activeNameStyle = NAME_COLORS?.[nameColor]?.style || {};

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12 mt-4 md:mt-8 ${darkMode ? "text-white" : "text-slate-900"}`}>

      {/* ── Avatar & Info Header ── */}
      <ScrollReveal direction="up">
        <div className={`rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-8 backdrop-blur-md border transition-colors duration-300 ${darkMode ? "bg-slate-900/60 border-white/10 shadow-black/50" : "bg-white border-slate-100 shadow-slate-200/50"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-4xl overflow-hidden border-4 border-blue-500/20 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500 bg-slate-100 dark:bg-slate-800">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black">
                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-110 active:scale-95">
                <MdOutlineEdit size={18} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              {/* SHU YERDA ISM RANGI QO'LLANILADI */}
              <h2 className="text-2xl md:text-4xl font-black tracking-tight truncate mb-2" style={activeNameStyle}>
                {form.displayName || user?.displayName || t.unknown || "Foydalanuvchi"}
              </h2>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mb-4">
                <p className={`flex items-center gap-1.5 text-xs md:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <LuMail className="text-blue-500 shrink-0" /> <span className="truncate">{user?.email}</span>
                </p>
                {form.phone && (
                  <p className={`flex items-center gap-1.5 text-xs md:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <LuPhone className="text-blue-500 shrink-0" /> {form.phone}
                  </p>
                )}
              </div>

              {/* Taqilgan Nishonlar (Active Badges) */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg border border-blue-500/20 uppercase tracking-widest">
                  <LuCheck size={14} /> {t.activeAccount || "Faol hisob"}
                </span>
                
                {applicationStatus === "approved" && (
                   <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                   <LuBriefcase size={14} /> Mentor
                 </span>
                )}

                {activeBadges.map(badgeId => {
                  const b = BADGES_DICT[badgeId];
                  if(!b) return null;
                  return (
                    <span key={badgeId} className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black ${b.bg} ${b.color} px-3 py-1.5 rounded-lg border ${b.border} uppercase tracking-widest shadow-sm`}>
                      {b.icon} {b.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Tabs (Responsive swipeable) ── */}
      <ScrollReveal direction="up" delay={100}>
        <div className={`flex gap-2 mb-8 p-1.5 rounded-2xl border backdrop-blur-md overflow-x-auto no-scrollbar transition-colors duration-300 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-50 border-slate-200"}`}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-4 md:px-6 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                  : darkMode
                  ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── TABS CONTENT ── */}
      <div className={`rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl backdrop-blur-md border transition-colors duration-300 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-slate-200/50"}`}>
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <ScrollReveal direction="up">
            <h3 className={`text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
              <LuUser className="text-blue-500" /> {t.profileTitle || "Shaxsiy ma'lumotlar"}
            </h3>
            <div className="space-y-5 md:space-y-6">
              <div>
                <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.fullName || "To'liq ism"}
                </label>
                <input type="text" placeholder="Ismingizni kiriting" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.phone || "Telefon"}
                </label>
                <input type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.bio || "O'zingiz haqingizda"}
                </label>
                <textarea rows={4} placeholder="Nimalarga qiziqasiz?" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputClass + " resize-none"} />
              </div>
              <button onClick={handleSaveProfile} disabled={loading} className="w-full py-4 md:py-4.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 mt-4 active:scale-95">
                {loading ? (t.saving || "Saqlanmoqda...") : <><LuSave size={20} /> {t.save || "Saqlash"}</>}
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
           <ScrollReveal direction="up">
              <h3 className={`text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                <LuShield className="text-blue-500" /> {t.securityTab || "Xavfsizlik"}
              </h3>
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {t.newPassword || "Yangi parol"}
                  </label>
                  <input type="password" placeholder="••••••••" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {t.confirmPasswordLabel || "Parolni tasdiqlang"}
                  </label>
                  <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={inputClass} />
                </div>
                <button onClick={handleChangePassword} disabled={loading} className="w-full py-4 md:py-4.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 mt-4 active:scale-95">
                  {loading ? (t.updating || "Yangilanmoqda...") : <><LuLock size={20} /> {t.updatePassword || "Parolni yangilash"}</>}
                </button>
              </div>
           </ScrollReveal>
        )}

        {/* Mentor Tab */}
        {activeTab === "mentor" && (
          <ScrollReveal direction="up">
            <h3 className={`text-xl md:text-2xl font-black mb-6 flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
              <LuBriefcase className="text-blue-500" /> Mentorlikka Ariza
            </h3>
            
            {applicationStatus === "pending" ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-5 md:p-6 rounded-2xl text-sm md:text-base font-bold leading-relaxed shadow-inner">
                ⏳ Arizangiz qabul qilingan va ko'rib chiqilmoqda. Tez orada siz bilan bog'lanamiz!
              </div>
            ) : applicationStatus === "approved" ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-5 md:p-6 rounded-2xl text-sm md:text-base font-bold leading-relaxed shadow-inner">
                🎉 Tabriklaymiz! Siz rasmiy Mentorsiz! Endi platformada o'z darslaringizni bera olasiz.
              </div>
            ) : applicationStatus === "rejected" ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-5 md:p-6 rounded-2xl text-sm md:text-base font-bold leading-relaxed shadow-inner mb-6">
                ❌ Afsuski arizangiz rad etildi. Tajribangizni oshirib, yana urinib ko'ring.
              </div>
            ) : !isSupport ? (
               <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-5 md:p-6 rounded-2xl text-sm md:text-base font-bold leading-relaxed shadow-inner">
                ℹ️ Ariza berish uchun avval darslarni tugatib, <b>"Support"</b> unvonini olishingiz kerak.
              </div>
            ) : null}

            {isSupport && (!applicationStatus || applicationStatus === "rejected") && (
              <div className="space-y-5 md:space-y-6 mt-6">
                <div>
                  <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Aloqa uchun telefon raqam *</label>
                  <input type="tel" placeholder="+998 90 123 45 67" value={mentorForm.phone} onChange={(e) => setMentorForm({ ...mentorForm, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Qaysi yo'nalishda mentorlik qilasiz? *</label>
                  <select value={mentorForm.subject} onChange={(e) => setMentorForm({ ...mentorForm, subject: e.target.value })} className={inputClass}>
                    <option value="Front-End">Front-End (HTML, CSS, JS, React)</option>
                    <option value="Back-End">Back-End (Node.js, Python, PHP)</option>
                    <option value="Boshqa">Boshqa...</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Tajribangiz (Nima uchun siz?) *</label>
                  <textarea rows={5} placeholder="O'zingiz haqingizda yozing..." value={mentorForm.reason} onChange={(e) => setMentorForm({ ...mentorForm, reason: e.target.value })} className={inputClass + " resize-none"} />
                </div>
                <button onClick={handleApplyMentor} disabled={loading} className="w-full py-4 md:py-4.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 mt-4 active:scale-95">
                  {loading ? "Yuborilmoqda..." : <><LuSend size={20} /> Arizani Yuborish</>}
                </button>
              </div>
            )}
          </ScrollReveal>
        )}

        {/* ── YANGI: Badges Tab (Nishonlar) ── */}
        {activeTab === "badges" && (
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h3 className={`text-xl md:text-2xl font-black flex items-center gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                <LuBadgeCheck className="text-blue-500" /> Kolleksiya
              </h3>
              <p className={`text-xs md:text-sm font-bold px-4 py-2 rounded-xl ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                Taqilgan: {activeBadges.length} / 3
              </p>
            </div>

            {ownedBadges.length === 0 ? (
              <div className={`py-16 text-center rounded-3xl border-2 border-dashed ${darkMode ? "border-slate-700/50" : "border-slate-200"}`}>
                 <LuTrophy size={48} className="mx-auto mb-4 opacity-20 text-slate-500"/>
                 <p className={`text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Sizda hozircha hech qanday nishon yo'q.</p>
                 <p className="text-xs text-slate-500 mt-2">Coin Shop'dan sotib olishingiz mumkin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {ownedBadges.map(badgeId => {
                  const b = BADGES_DICT[badgeId];
                  if (!b) return null;
                  
                  const isActive = activeBadges.includes(badgeId);

                  return (
                    <div key={badgeId} className={`p-5 md:p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                      isActive 
                        ? (darkMode ? "bg-blue-900/10 border-blue-500/30 shadow-lg shadow-blue-500/10" : "bg-blue-50 border-blue-200 shadow-lg shadow-blue-200/50") 
                        : (darkMode ? "bg-slate-800/30 border-white/5" : "bg-white border-slate-100")
                    }`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${b.bg} ${b.color}`}>
                        {b.icon}
                      </div>
                      <h4 className={`text-base md:text-lg font-black mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>{b.label} Nishoni</h4>
                      <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-6">Profil uchun maxsus yutuq</p>
                      
                      <button 
                        onClick={() => toggleBadge(badgeId)}
                        className={`w-full py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          isActive 
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" 
                            : "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
                        }`}
                      >
                        {isActive ? <><LuX size={16}/> Olib tashlash</> : <><LuCheck size={16}/> Taqish</>}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

export default Profile;