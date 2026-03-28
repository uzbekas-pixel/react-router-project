import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { auth, db } from "../firebase/config";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { LuUser, LuShield, LuSave, LuLock } from "react-icons/lu";
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

  // imgbb ga yuklash — xuddi oldingi versiya
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Avval preview ko'rsatish
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // imgbb ga yuklash
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setAvatarPreview(data.data.url);
        showToast("Rasm yuklandi! Saqlash tugmasini bosing ✅", "success");
      } else {
        showToast("Rasm yuklashda xatolik!", "error");
      }
    } catch {
      showToast("Rasm yuklashda xatolik!", "error");
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
      }, { merge: true }); // merge:true — maxSnippets, coins kabi maydonlarni o'chirmaydi
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
      ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
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
        <div className={`rounded-2xl p-8 shadow-lg mb-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-400 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow transition">
                <MdOutlineEdit size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {form.displayName || user?.displayName || t.unknown}
              </h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</p>
              {form.phone && (
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📞 {form.phone}</p>
              )}
              {form.bio && (
                <p className={`text-sm mt-1 italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>"{form.bio}"</p>
              )}
              <span className="mt-2 inline-block text-xs bg-blue-400/20 text-blue-400 px-3 py-1 rounded-full">
                {t.activeAccount}
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Tabs ── */}
      <ScrollReveal direction="up" delay={100}>
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={`rounded-2xl p-8 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t.profileTitle}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {t.fullName}
                </label>
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? t.saving : <><LuSave size={16} /> {t.save}</>}
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ── Security Tab ── */}
      {activeTab === "security" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={`rounded-2xl p-8 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t.securityTab}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
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
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? t.updating : <><LuLock size={16} /> {t.updatePassword}</>}
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default Profile;