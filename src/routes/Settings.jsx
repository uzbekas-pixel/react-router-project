import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { FaInstagram, FaYoutube, FaTelegram, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { LuCheck, LuX, LuPencil, LuPalette, LuInfo, LuSettings, LuImage, LuTrash2, LuRocket, LuShield, LuClipboardList, LuCog, LuAtom, LuFlame, LuSmartphone, LuGlobe, LuHeart } from "react-icons/lu";


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

// Tahrirlash mumkin bo'lgan bitta maydon
const EditableField = ({ label, value, field, isAdmin, darkMode, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => {
    onSave(field, val);
    setEditing(false);
  };

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        <p className={`text-xs font-semibold mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        {editing ? (
          <div className="flex gap-2">
            <input value={val} onChange={(e) => setVal(e.target.value)}
              className={`flex-1 px-3 py-1.5 rounded-xl border text-sm outline-none ${
                darkMode ? "bg-slate-700 border-slate-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`} autoFocus />
            <button onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs rounded-xl transition"><LuCheck size={14} /></button>
            <button onClick={() => { setVal(value); setEditing(false); }}
              className={`px-3 py-1.5 text-xs rounded-xl transition ${darkMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}><LuX size={14} /></button>
          </div>
        ) : (
          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{value || "—"}</p>
        )}
      </div>
      {isAdmin && !editing && (
        <button onClick={() => setEditing(true)}
          className={`mt-5 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition shrink-0 ${
            darkMode ? "bg-slate-600 hover:bg-slate-500 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-500"
          }`}><LuPencil size={14} /></button>
      )}
    </div>
  );
};

// Social link tahrirlash
const SocialEditBtn = ({ id, value, darkMode, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  if (editing) return (
    <div className="flex gap-1 shrink-0">
      <input value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="https://..."
        className={`w-36 px-2 py-1 rounded-lg border text-xs outline-none ${
          darkMode ? "bg-slate-600 border-slate-500 text-white" : "bg-white border-gray-300 text-gray-900"
        }`} autoFocus />
      <button onClick={() => { onSave(id, val); setEditing(false); }}
        className="px-2 py-1 bg-blue-500 text-white text-xs rounded-lg"><LuCheck size={14} /></button>
      <button onClick={() => setEditing(false)}
        className={`px-2 py-1 text-xs rounded-lg ${darkMode ? "bg-slate-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}><LuX size={14} /></button>
    </div>
  );

  return (
    <button onClick={() => setEditing(true)}
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition shrink-0 ${
        darkMode ? "bg-slate-600 hover:bg-slate-500 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-500"
      }`}><LuPencil size={14} /></button>
  );
};

const Settings = ({ darkMode, showToast, onThemeChange, currentTheme, onBgChange, currentBg }) => {
  const { user } = useAuth();
  const { t } = useLang(); // Add useLang hook
  const [activeTab, setActiveTab] = useState("themes");
  const [isAdmin, setIsAdmin] = useState(false);
  const [customBg, setCustomBg] = useState(currentBg || null);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [socials, setSocials] = useState(DEFAULT_ABOUT.socials);
  const [loading, setLoading] = useState(true);


  // Admin tekshirish
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  // Firestore dan yuklash
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
        console.error("Error loading project about info:", err);
      }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Bitta maydonni saqlash
  const handleSave = async (field, value) => {
    try {
      const updated = { ...about, [field]: value };
      setAbout(updated);
      await setDoc(doc(db, "aboutProject", "main"), updated);
      showToast(t.saved, "success");
    } catch {
      showToast(t.error, "error");
    }
  };

  // Social saqlash
  const handleSocialSave = async (id, value) => {
    try {
      const updated = { ...about, socials: { ...about.socials, [id]: value } };
      setAbout(updated);
      await setDoc(doc(db, "aboutProject", "main"), updated);
      showToast(t.saved, "success");
    } catch {
      showToast(t.error, "error");
    }
  };

  // Fon rasm yuklash
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBg(reader.result);
      onBgChange(reader.result);
      localStorage.setItem("customBg", reader.result);
      showToast(t.bgImageSet, "success");
    };
    reader.readAsDataURL(file);
  };

  const removeBg = () => {
    setCustomBg(null);
    onBgChange(null);
    localStorage.removeItem("customBg");
    showToast(t.bgImageRemoved, "success");
  };

  const cardClass = `rounded-2xl p-5 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`;

  const tabs = [
    { id: "themes", label: t.themesTab },
    { id: "about",  label: t.aboutTab },
  ];

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 py-10 mt-10 min-h-[calc(100vh-64px)]`}>
      <h1 className={`text-2xl font-extrabold mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
        <LuSettings className="text-blue-500" /> {t.settings}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : darkMode ? "bg-slate-800 text-gray-400 hover:bg-slate-700" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>{t.loading}</p>
        </div>
      ) : (
        <>

      {/* в”Ђв”Ђ MAVZULAR TAB в”Ђв”Ђ */}
      {activeTab === "themes" && (
        <div className="flex flex-col gap-6">

          {/* Gradient themes */}
          <div className={cardClass}>
            <h2 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <LuPalette className="text-blue-500" /> {t.themeColors}
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    localStorage.setItem("theme", theme.id);
                    showToast(`${theme.name} ${t.themeSelected}`, "success");
                  }}
                  className={`relative h-16 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    currentTheme === theme.id ? "ring-4 ring-blue-400 scale-105" : ""
                  }`}
                  style={{ background: theme.preview }}>
                  {currentTheme === theme.id && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl"><LuCheck size={24} /></span>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-white text-xs font-semibold drop-shadow">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom background */}
          <div className={cardClass}>
            <h2 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <LuImage className="text-blue-500" /> {t.customBgImage}
            </h2>
            {customBg ? (
              <div className="relative">
                <img src={customBg} alt="bg" className="w-full h-40 object-cover rounded-2xl mb-3" />
                <button onClick={removeBg}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm rounded-xl transition flex items-center gap-2">
                  <LuTrash2 size={16} /> {t.remove}
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition ${
                darkMode ? "border-slate-600 hover:border-blue-400 text-gray-300" : "border-gray-300 hover:border-blue-400 text-gray-600"
              }`}>
                <LuImage size={32} className="mb-2 text-blue-500" />
                <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-black"}`}>{t.selectImage}</span>
                <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ LOYIHA HAQIDA TAB в”Ђв”Ђ */}
      {activeTab === "about" && (
        <div className="flex flex-col gap-5">

          {/* Header */}
          <div className="text-center py-4">
            <div className="text-5xl mb-3 flex justify-center"><LuRocket className="text-blue-500" size={48} /></div>
            <h2 className={`text-2xl font-extrabold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {about.name}
            </h2>
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full">
              {about.version}
            </span>
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                <LuShield size={12} /> {t.adminMode}
              </span>
            )}
          </div>

          {/* Asosiy ma'lumotlar */}
          <div className={cardClass}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}><LuClipboardList className="text-blue-500" /> {t.basicInfo}</h3>
            <div className="flex flex-col gap-4">
              <EditableField label={t.projectName}    value={about.name}    field="name"    isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.version}         value={about.version} field="version" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.goal}          value={about.goal}    field="goal"    isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.author}         value={about.author}  field="author"  isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.website}         value={about.website} field="website" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.email}           value={about.email}   field="email"   isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
              <EditableField label={t.founded} value={about.founded} field="founded" isAdmin={isAdmin} darkMode={darkMode} onSave={handleSave} />
            </div>
          </div>

          {/* Texnologiyalar */}
          <div className={cardClass}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}><LuCog className="text-blue-500" /> {t.technologies}</h3>
            <div className="flex flex-wrap gap-2">
              {about.technologies.map((tech, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-xl">
                  {tech}
                </span>
              ))}
            </div>
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className={`text-xs mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t.technologiesHint}
                </p>
                <input
                  defaultValue={about.technologies.join(", ")}
                  onBlur={(e) => handleSave("technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  className={`w-full px-3 py-1.5 rounded-xl border text-sm outline-none ${
                    darkMode ? "bg-slate-700 border-slate-500 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Statistika kartalar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: LuAtom, label: t.framework, value: "React 18"  },
              { icon: LuFlame, label: t.backend,   value: "Firebase"  },
              { icon: LuRocket, label: t.deploy,    value: "Vercel"    },
              { icon: LuSmartphone, label: t.platform,  value: "PWA"       },
            ].map((item, i) => (
              <div key={i} className={`${cardClass} text-center`}>
                <div className="text-3xl mb-2 flex justify-center"><item.icon className="text-blue-500" /></div>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                <p className={`text-sm font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Ijtimoiy tarmoqlar */}
          <div className={cardClass}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}><LuGlobe className="text-blue-500" /> {t.socials}</h3>
           <div className="flex flex-col gap-3">
  {SOCIAL_META.map((s) => {
    // Ma'lumotni olish (about.socials dan yoki socials state'idan)
    const val = socials[s.id] || ""; 

    return (
      <div 
        key={s.id} 
        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
          darkMode ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-100"
        } border`}
      >
        {/* Chap taraf: Ikonka */}
        <div className={`p-2 rounded-lg ${darkMode ? "bg-slate-700" : "bg-white"} shadow-sm flex items-center justify-center`}>
          <s.icon size={24} color={s.color} />
        </div>

        {/* Markaz: Ma'lumot yoki Input */}
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
            darkMode ? "text-slate-500" : "text-gray-400"
          }`}>
            {s.label}
          </p>

          {isAdmin ? (
            /* Admin uchun: To'g'ridan-to'g'ri tahrirlash inputi */
            <input
              type="url"
              placeholder={t.enterLink}
              value={val}
              onChange={(e) => setSocials({ ...socials, [s.id]: e.target.value })}
              onBlur={(e) => handleSocialSave(s.id, e.target.value)}
              className={`w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none ${
                darkMode ? "text-blue-300 placeholder-slate-600" : "text-blue-600 placeholder-gray-300"
              }`}
            />
          ) : (
            /* Foydalanuvchi uchun: Faqat o'zgarmas link */
            <div className="truncate">
              {val ? (
                <a 
                  href={val} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm font-medium hover:underline text-blue-400 block truncate"
                >
                  {val.replace('https://', '')}
                </a>
              ) : (
                <p className={`text-sm ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
                  {t.notConnected}
                </p>
              )}
            </div>
          )}
        </div>


        {/* O'ng taraf: Agar link bo'lsa "Open" tugmasi (faqat Admin uchun qulaylik) */}
        {isAdmin && val && (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs px-2 py-1 rounded-md border ${
              darkMode ? "border-slate-600 text-slate-400 hover:bg-slate-700" : "border-gray-200 text-gray-500 hover:bg-white"
            } transition-colors`}
          >
            {t.open}
          </a>
        )}
      </div>
    );
  })}
</div>
          </div>

          {/* Footer */}
          <div className={`${cardClass} text-center`}>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              В© {about.founded} {about.name} — {t.allRightsReserved}
            </p>
            <p className={`text-xs mt-1 flex items-center justify-center gap-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {about.version} • {t.madeWith} <LuHeart className="text-red-500" size={12} /> {t.inUzbekistan}
            </p>
          </div>

          </div>
        )}
      </>
    )}
  </div>
);
};

export default Settings;
