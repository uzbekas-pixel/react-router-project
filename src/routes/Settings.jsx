import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { FaInstagram, FaYoutube, FaTelegram, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { LuCheck, LuX, LuPencil, LuPalette, LuInfo, LuSettings, LuImage, LuTrash2, LuRocket, LuShield, LuClipboardList, LuCog, LuAtom, LuFlame, LuSmartphone, LuGlobe, LuHeart, LuSun, LuMoon, LuChevronDown, LuMessageCircle, LuDatabase, LuHardDrive } from "react-icons/lu";
import 'flag-icons/css/flag-icons.min.css';

const THEMES = [
  { id: "default",  name: "Default",  preview: "linear-gradient(135deg, #0f172a, #1e293b)" },
  { id: "sunset",   name: "Sunset",   preview: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "ocean",    name: "Ocean",    preview: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "forest",   name: "Forest",   preview: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { id: "purple",   name: "Purple",   preview: "linear-gradient(135deg, #a855f7, #6366f1)" },
  { id: "rose",     name: "Rose",     preview: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { id: "gold",     name: "Gold",     preview: "linear-gradient(135deg, #eab308, #f97316)" },
  { id: "midnight", name: "Midnight", preview: "linear-gradient(135deg, #1e1b4b, #312e81)" },
];

const SOCIAL_META = [
  { id: "instagram", icon: FaInstagram, color: "#E1306C", label: "Instagram" },
  { id: "youtube",   icon: FaYoutube,   color: "#FF0000", label: "YouTube"   },
  { id: "telegram",  icon: FaTelegram,  color: "#0088cc", label: "Telegram"  },
  { id: "github",    icon: FaGithub,    color: "#000000", label: "GitHub"    },
];

const DEFAULT_ABOUT = {
  name: "Uzbekas Pixel",
  version: "v1.0.4",
  goal: "Zamonaviy va oson onlayn ta'lim platformasi",
  technologies: ["React", "Firebase", "Vercel", "PWA", "Tailwind CSS"],
  author: "Uzbekas Pixel Team",
  website: "https://uzbekas.vercel.app",
  email: "admin@uzbekas.uz",
  founded: "2026",
  socials: {
    instagram: "",
    youtube: "",
    telegram: "",
    github: "",
    twitter: "",
    linkedin: "",
  },
};

const EditableField = ({ label, value, field, isAdmin, darkMode, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => {
    onSave(field, val);
    setEditing(false);
  };

  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <div className="flex-1">
        <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        {editing ? (
          <div className="flex gap-2 mt-2">
            <input 
              value={val} 
              onChange={(e) => setVal(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${
                darkMode ? "bg-slate-800 border-slate-600 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-300 focus:border-blue-500 text-gray-900"
              }`} 
              autoFocus 
            />
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-xl transition-colors flex items-center justify-center shadow-sm"
            >
              <LuCheck size={16} />
            </button>
            <button 
              onClick={() => { setVal(value); setEditing(false); }}
              className={`px-4 py-2 text-sm rounded-xl transition-colors flex items-center justify-center ${
                darkMode ? "bg-slate-700 hover:bg-slate-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
            >
              <LuX size={16} />
            </button>
          </div>
        ) : (
          <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{value || "—"}</p>
        )}
      </div>
      {isAdmin && !editing && (
        <button 
          onClick={() => setEditing(true)}
          className={`mt-4 p-2 rounded-lg transition-colors shrink-0 ${
            darkMode ? "hover:bg-slate-700 text-blue-400" : "hover:bg-blue-50 text-blue-500"
          }`}
        >
          <LuPencil size={16} />
        </button>
      )}
    </div>
  );
};

const Settings = ({ darkMode, setDarkMode, showToast, onThemeChange, currentTheme, onBgChange, currentBg }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  
  // Sukut bo'yicha 'preferences' bo'limi ochiq turadi
  const [expandedSection, setExpandedSection] = useState('preferences');
  const [isAdmin, setIsAdmin] = useState(false);
  const [customBg, setCustomBg] = useState(currentBg || null);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [socials, setSocials] = useState(DEFAULT_ABOUT.socials);
  const [loading, setLoading] = useState(true);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "admins", user.uid));
        setIsAdmin(snap.exists() && snap.data().isAdmin === true);
      } catch (error) {
        console.error("Admin check failed:", error);
      }
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "aboutProject", "main"));
        if (snap.exists()) {
          const data = snap.data();
          setAbout({ ...DEFAULT_ABOUT, ...data });
          if (data.socials) setSocials(data.socials);
        }
      } catch (err) {
        console.error("Error loading project info:", err);
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, []);

  const handleSave = async (field, value) => {
    try {
      const updated = { ...about, [field]: value };
      setAbout(updated);
      await setDoc(doc(db, "aboutProject", "main"), updated);
      showToast(t.saved || "Saqlandi", "success");
    } catch {
      showToast(t.error || "Xatolik yuz berdi", "error");
    }
  };

  const handleSocialSave = async (id, value) => {
    try {
      const updated = { ...about, socials: { ...about.socials, [id]: value } };
      setAbout(updated);
      await setDoc(doc(db, "aboutProject", "main"), updated);
      showToast(t.saved || "Saqlandi", "success");
    } catch {
      showToast(t.error || "Xatolik yuz berdi", "error");
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBg(reader.result);
      onBgChange(reader.result);
      localStorage.setItem("customBg", reader.result);
      showToast(t.bgImageSet || "Fon rasmi o'rnatildi", "success");
    };
    reader.readAsDataURL(file);
  };

  const removeBg = () => {
    setCustomBg(null);
    onBgChange(null);
    localStorage.removeItem("customBg");
    showToast(t.bgImageRemoved || "Fon rasmi olib tashlandi", "success");
  };

  // Yangi funksiya: PWA va Brauzer keshini tozalash (Ilovani tezlashtirish uchun)
  const clearAppCache = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
      showToast(t.cacheCleared || "Tizim keshi tozalandi", "success");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const sectionContainerClass = `rounded-2xl border transition-colors duration-300 overflow-hidden ${
    darkMode ? "bg-slate-800 border-slate-700/50" : "bg-white border-gray-100 shadow-sm"
  }`;

  const sectionHeaderClass = (isActive) => `
    w-full flex items-center justify-between p-5 text-left transition-colors duration-300
    ${isActive && darkMode ? "bg-slate-700/30" : ""}
    ${isActive && !darkMode ? "bg-gray-50/50" : ""}
  `;

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 py-8 mt-6 min-h-[calc(100vh-64px)]`}>
      <h1 className={`text-3xl font-extrabold mb-8 flex items-center gap-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
        <div className="p-2.5 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <LuSettings size={26} />
        </div>
        {t.settings || "Sozlamalar"}
      </h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.loading || "Yuklanmoqda..."}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* ━━━ SECTION 1: PREFERENCES (Ko'rinish va Til) ━━━ */}
          <div className={sectionContainerClass}>
            <button onClick={() => toggleSection('preferences')} className={sectionHeaderClass(expandedSection === 'preferences')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-500"}`}>
                  <LuPalette size={22} />
                </div>
                <span className={`font-bold text-lg tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {t.appearanceAndLanguage || "Ko'rinish va Til"}
                </span>
              </div>
              <LuChevronDown size={24} className={`text-gray-400 transition-transform duration-300 ${expandedSection === 'preferences' ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedSection === 'preferences' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="p-5 pt-2 border-t border-gray-100 dark:border-slate-700/50 space-y-8">
                  
                  {/* Tungi Rejim Switch */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-white text-blue-500 shadow-sm"}`}>
                        {darkMode ? <LuMoon size={20} /> : <LuSun size={20} />}
                      </div>
                      <div>
                        <p className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                          {darkMode ? (t.lightMode || "Yorug' rejim") : (t.darkMode || "Qorong' rejim")}
                        </p>
                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tizim interfeysi rangini o'zgartirish</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Til Tanlash */}
                  <div>
                    <h3 className={`font-bold mb-3 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {t.selectLanguage || "Tizim tili"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLang('uz')}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          lang === 'uz' 
                            ? "border-blue-500 bg-blue-500/10 shadow-sm" 
                            : darkMode ? "border-slate-700 hover:border-slate-600 bg-slate-800" : "border-gray-100 hover:border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className="fi fi-uz text-2xl rounded-sm shadow-sm"></span>
                        <span className={`font-bold ${lang === 'uz' ? "text-blue-500" : darkMode ? "text-gray-300" : "text-gray-700"}`}>O'zbek</span>
                      </button>

                      <button
                        onClick={() => setLang('en')}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                          lang === 'en' 
                            ? "border-blue-500 bg-blue-500/10 shadow-sm" 
                            : darkMode ? "border-slate-700 hover:border-slate-600 bg-slate-800" : "border-gray-100 hover:border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className="fi fi-gb text-2xl rounded-sm shadow-sm"></span>
                        <span className={`font-bold ${lang === 'en' ? "text-blue-500" : darkMode ? "text-gray-300" : "text-gray-700"}`}>English</span>
                      </button>
                    </div>
                  </div>

                  {/* Gradient themes */}
                  <div>
                    <h3 className={`font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {t.themeColors || "Asosiy ranglar"}
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {THEMES.map((theme) => (
                        <button key={theme.id}
                          onClick={() => {
                            onThemeChange(theme.id);
                            localStorage.setItem("theme", theme.id);
                            showToast(`${theme.name} ${t.themeSelected || "tanlandi"}`, "success");
                          }}
                          className={`relative aspect-square w-full rounded-2xl transition-all duration-300 ${
                            currentTheme === theme.id ? "ring-4 ring-blue-500 ring-offset-2 scale-95 dark:ring-offset-slate-900" : "hover:scale-105"
                          }`}
                          style={{ background: theme.preview }}>
                          {currentTheme === theme.id && (
                            <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                              <LuCheck size={20} className="stroke-[3]" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom background */}
                  <div>
                    <h3 className={`font-bold mb-3 text-sm uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {t.customBgImage || "Maxsus orqa fon"}
                    </h3>
                    {customBg ? (
                      <div className="relative group rounded-2xl overflow-hidden">
                        <img src={customBg} alt="bg" className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                          <button onClick={removeBg}
                            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg">
                            <LuTrash2 size={18} /> {t.remove || "O'chirish"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                        darkMode ? "border-slate-600 hover:border-blue-400 bg-slate-900/30" : "border-gray-300 hover:border-blue-400 bg-gray-50"
                      }`}>
                        <div className={`p-3 rounded-full mb-2 ${darkMode ? "bg-slate-800 text-blue-400" : "bg-white text-blue-500 shadow-sm"}`}>
                          <LuImage size={24} />
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {t.selectImage || "Rasm yuklash uchun bosing"}
                        </span>
                        <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ━━━ SECTION 2: SYSTEM / TIZIM (Yangi qo'shilgan qism) ━━━ */}
          <div className={sectionContainerClass}>
            <button onClick={() => toggleSection('system')} className={sectionHeaderClass(expandedSection === 'system')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? "bg-slate-700 text-green-400" : "bg-green-50 text-green-500"}`}>
                  <LuHardDrive size={22} />
                </div>
                <span className={`font-bold text-lg tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {t.systemSettings || "Tizim va Xotira"}
                </span>
              </div>
              <LuChevronDown size={24} className={`text-gray-400 transition-transform duration-300 ${expandedSection === 'system' ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedSection === 'system' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="p-5 pt-2 border-t border-gray-100 dark:border-slate-700/50 space-y-4">
                  <div className={`p-4 rounded-xl flex items-center justify-between ${darkMode ? "bg-slate-900/50" : "bg-gray-50"}`}>
                    <div>
                      <p className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Keshni tozalash</p>
                      <p className={`text-xs mt-1 max-w-[250px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Agar ilova sekin ishlayotgan bo'lsa yoki yangilanishlar ko'rinmayotgan bo'lsa, keshni tozalang.
                      </p>
                    </div>
                    <button 
                      onClick={clearAppCache}
                      className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium text-sm rounded-xl transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <LuDatabase size={16} /> Tozalash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ━━━ SECTION 3: HELP & QA ━━━ */}
          <div className={sectionContainerClass}>
            <button onClick={() => navigate('/qa')} className={`${sectionHeaderClass(false)} hover:bg-gray-50 dark:hover:bg-slate-700/30`}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? "bg-slate-700 text-purple-400" : "bg-purple-50 text-purple-500"}`}>
                  <LuMessageCircle size={22} />
                </div>
                <span className={`font-bold text-lg tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {t.helpCenter || "Yordam markazi"}
                </span>
              </div>
              <LuChevronDown size={24} className="text-gray-400 transition-transform duration-300 -rotate-90" />
            </button>
          </div>

          {/* ━━━ SECTION 4: ABOUT PROJECT ━━━ */}
          <div className={sectionContainerClass}>
            <button onClick={() => toggleSection('about')} className={sectionHeaderClass(expandedSection === 'about')}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? "bg-slate-700 text-orange-400" : "bg-orange-50 text-orange-500"}`}>
                  <LuInfo size={22} />
                </div>
                <span className={`font-bold text-lg tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {t.aboutTab || "Loyiha haqida"}
                </span>
              </div>
              <LuChevronDown size={24} className={`text-gray-400 transition-transform duration-300 ${expandedSection === 'about' ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expandedSection === 'about' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-700/50">
                  
                  {/* Header */}
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transform -rotate-3">
                      <LuRocket className="text-white" size={40} />
                    </div>
                    <h2 className={`text-2xl font-extrabold tracking-tight mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {about.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                        {about.version}
                      </span>
                      {isAdmin && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider rounded-full">
                          <LuShield size={12} /> {t.adminMode || "Admin"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Asosiy ma'lumotlar */}
                  <div className="mb-6">
                    <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <LuClipboardList className="text-blue-500" /> {t.basicInfo || "Asosiy ma'lumotlar"}
                    </h3>
                    <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-900/50" : "bg-gray-50"}`}>
                      <EditableField label={t.projectName || "Loyiha nomi"} value={about.name} field="name" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.version || "Versiya"} value={about.version} field="version" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.goal || "Maqsad"} value={about.goal} field="goal" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.author || "Muallif"} value={about.author} field="author" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.website || "Veb-sayt"} value={about.website} field="website" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.email || "Email"} value={about.email} field="email" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                      <EditableField label={t.founded || "Asos solingan yil"} value={about.founded} field="founded" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
                    </div>
                  </div>

                  {/* Texnologiyalar */}
                  <div className="mb-6">
                    <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <LuCog className="text-blue-500" /> {t.technologies || "Texnologiyalar"}
                    </h3>
                    <div className={`p-5 rounded-2xl ${darkMode ? "bg-slate-900/50" : "bg-gray-50"}`}>
                      <div className="flex flex-wrap gap-2">
                        {about.technologies.map((tech, i) => (
                          <span key={i} className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
                            darkMode ? "bg-slate-800 text-blue-400 border border-slate-700" : "bg-white text-blue-600 border border-gray-200 shadow-sm"
                          }`}>
                            {tech}
                          </span>
                        ))}
                      </div>
                      {isAdmin && (
                        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-slate-700/50">
                          <p className={`text-xs mb-2 font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {t.technologiesHint || "Texnologiyalarni vergul bilan ajratib yozing:"}
                          </p>
                          <input
                            defaultValue={about.technologies.join(", ")}
                            onBlur={(e) => handleSave("technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                              darkMode ? "bg-slate-800 border-slate-600 focus:border-blue-500 text-white" : "bg-white border-gray-300 focus:border-blue-500 text-gray-900"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistika kartalar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { icon: LuAtom, label: t.framework || "Framework", value: "React 18"  },
                      { icon: LuFlame, label: t.backend || "Backend",   value: "Firebase"  },
                      { icon: LuRocket, label: t.deploy || "Deploy",    value: "Vercel"    },
                      { icon: LuSmartphone, label: t.platform || "Platforma",  value: "PWA"       },
                    ].map((item, i) => (
                      <div key={i} className={`p-4 text-center rounded-2xl ${darkMode ? "bg-slate-900/50" : "bg-gray-50"}`}>
                        <div className="mb-3 flex justify-center"><item.icon className="text-blue-500" size={28} /></div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.label}</p>
                        <p className={`text-sm font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ijtimoiy tarmoqlar */}
                  <div className="mb-6">
                    <h3 className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <LuGlobe className="text-blue-500" /> {t.socials || "Ijtimoiy tarmoqlar"}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {SOCIAL_META.map((s) => {
                        const val = socials[s.id] || ""; 
                        return (
                          <div 
                            key={s.id} 
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              darkMode ? "bg-slate-900/50 hover:bg-slate-800" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className={`p-2.5 rounded-lg flex items-center justify-center ${darkMode ? "bg-slate-800" : "bg-white shadow-sm"}`}>
                              <s.icon size={20} color={s.color} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${
                                darkMode ? "text-slate-500" : "text-gray-400"
                              }`}>
                                {s.label}
                              </p>

                              {isAdmin ? (
                                <input
                                  type="url"
                                  placeholder={t.enterLink || "Havolani kiriting..."}
                                  value={val}
                                  onChange={(e) => setSocials({ ...socials, [s.id]: e.target.value })}
                                  onBlur={(e) => handleSocialSave(s.id, e.target.value)}
                                  className={`w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 outline-none ${
                                    darkMode ? "text-blue-400 placeholder-slate-600" : "text-blue-600 placeholder-gray-300"
                                  }`}
                                />
                              ) : (
                                <div className="truncate">
                                  {val ? (
                                    <a 
                                      href={val} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-sm font-medium hover:underline text-blue-500 block truncate"
                                    >
                                      {val.replace('https://', '').replace('www.', '')}
                                    </a>
                                  ) : (
                                    <p className={`text-sm ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                                      {t.notConnected || "Ulanmagan"}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-6 pb-2">
                    <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      © {about.founded} {about.name}
                    </p>
                    <p className={`text-xs flex items-center justify-center gap-1.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {t.madeWith || "Yaratilgan"} <LuHeart className="text-red-500" size={12} fill="currentColor" /> {t.inUzbekistan || "O'zbekistonda"}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Settings;