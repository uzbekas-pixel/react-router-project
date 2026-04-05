import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { auth, db } from "../firebase/config";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  LuCheck
} from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";

const Profile = ({ darkMode, showToast, showConfetti }) => {
  const { user } = useAuth();
  const { t }    = useLang();

  const [activeTab,     setActiveTab]     = useState("profile");
  const [form,          setForm]          = useState({
    displayName:     user?.displayName || "",
    phone:           "",
    bio:             "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [loading,       setLoading]       = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
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
      }
    };
    loadProfile();
  }, [user]);

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
        showToast(t.avatarUploaded, "success");
      } else {
        showToast(t.avatarUploadError, "error");
      }
    } catch {
      showToast(t.avatarUploadError, "error");
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
      showToast(t.profileUpdated, "success");
    } catch {
      showToast(t.updateError, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      showToast(t.passwordMismatchMsg, "error"); return;
    }
    if (form.newPassword.length < 6) {
      showToast(t.passwordShort, "error"); return;
    }
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, form.newPassword);
      showToast(t.passwordUpdated, "success");
      setForm({ ...form, newPassword: "", confirmPassword: "" });
    } catch {
      showToast(t.passwordUpdateError, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
    darkMode
      ? "bg-slate-700/50 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
  }`;

  const tabs = [
    { id: "profile",  label: t.profileTab,  icon: <LuUser size={16} />   },
    { id: "security", label: t.securityTab, icon: <LuShield size={16} /> },
  ];

  return (
    <div className={`page-transition w-full max-w-2xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>

      {/* ── Avatar & Info ── */}
      <ScrollReveal direction="up">
        <div className={`rounded-3xl p-8 shadow-xl mb-8 backdrop-blur-md border ${darkMode ? "bg-slate-800/80 border-white/10" : "bg-white/90 border-gray-100"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-blue-500/30 shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl w-9 h-9 flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110">
                <MdOutlineEdit size={16} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <h2 className={`text-3xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                {form.displayName || user?.displayName || t.unknown}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                <p className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <LuMail className="text-blue-500" /> {user?.email}
                </p>
                {form.phone && (
                  <p className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <LuPhone className="text-blue-500" /> {form.phone}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-full border border-blue-500/20">
                  <LuCheck size={12} /> {t.activeAccount}
                </span>
                {form.bio && (
                  <span className={`text-sm italic font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    "{form.bio}"
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Tabs ── */}
      <ScrollReveal direction="up" delay={100}>
        <div className="flex gap-3 mb-8 p-1.5 bg-slate-900/5 dark:bg-white/5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : darkMode
                  ? "text-slate-400 hover:text-white hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={`rounded-3xl p-8 shadow-xl backdrop-blur-md border ${darkMode ? "bg-slate-800/80 border-white/10" : "bg-white/90 border-gray-100"}`}>
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <LuUser className="text-blue-500" /> {t.profileTitle}
            </h3>
            <div className="flex flex-col gap-6">
              <div>
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.fullName}
                </label>
                <input
                  type="text"
                  placeholder={t.profileNamePlaceholder}
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.phone}
                </label>
                <input
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.bio}
                </label>
                <textarea
                  rows={3}
                  placeholder={t.bioPlaceholder}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className={inputClass + " resize-none"}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? t.saving : <><LuSave size={18} /> {t.save}</>}
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ── Security Tab ── */}
      {activeTab === "security" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={`rounded-3xl p-8 shadow-xl backdrop-blur-md border ${darkMode ? "bg-slate-800/80 border-white/10" : "bg-white/90 border-gray-100"}`}>
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <LuShield className="text-blue-500" /> {t.securityTab}
            </h3>
            <div className="flex flex-col gap-6">
              <div>
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.newPassword}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? t.updating : <><LuLock size={18} /> {t.updatePassword}</>}
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default Profile;