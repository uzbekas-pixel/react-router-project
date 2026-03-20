import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { FaInstagram, FaYoutube, FaTelegram, FaGithub } from "react-icons/fa";


const THEMES = [
  { id: "default", name: "Default", preview: "linear-gradient(135deg, #0f172a, #1e293b)" },
  { id: "sunset", name: "Sunset", preview: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "ocean", name: "Ocean", preview: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "forest", name: "Forest", preview: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { id: "purple", name: "Purple", preview: "linear-gradient(135deg, #a855f7, #6366f1)" },
  { id: "rose", name: "Rose", preview: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { id: "gold", name: "Gold", preview: "linear-gradient(135deg, #eab308, #f97316)" },
  { id: "midnight", name: "Midnight", preview: "linear-gradient(135deg, #1e1b4b, #312e81)" },
];

const SOCIAL_LINKS = [
  {
    id: "instagram",
    icon: <FaInstagram size={24} color="#E1306C" />,
    label: "Instagram",
    url: "https://www.instagram.com/naksosnw/", // o'zingiz silka qo'yasiz
  },
  {
    id: "youtube",
    icon: <FaYoutube size={24} color="#FF0000" />,
    label: "YouTube",
    url: "https://youtube.com/@uzbekas.022",
  },
  {
    id: "telegram",
    icon: <FaTelegram size={24} color="#0088cc" />,
    label: "Telegram",
    url: "https://t.me/uzbekas_01",
  },
  {
    id: "github",
    icon: <FaGithub size={24} color="#000000" />,
    label: "GitHub",
    url: "https://github.com/uzbekas-pixel",
  },
];

const Settings = ({ darkMode, showToast, onThemeChange, currentTheme, onBgChange, currentBg }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("themes");
  const [customBg, setCustomBg] = useState(currentBg || null);
  const [about, setAbout] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
  });
  const [socials, setSocials] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "settings", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setAbout(data.about || {});
        setSocials(data.socials || {});
      }
    };
    load();
  }, [user]);

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBg(reader.result);
      onBgChange(reader.result);
      localStorage.setItem("customBg", reader.result);
      showToast("Fon rasmi o'rnatildi! 🎨", "success");
    };
    reader.readAsDataURL(file);
  };

  const removeBg = () => {
    setCustomBg(null);
    onBgChange(null);
    localStorage.removeItem("customBg");
    showToast("Fon rasmi olib tashlandi", "success");
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", user.uid), {
        about,
        socials,
        updatedAt: new Date().toISOString(),
      });
      showToast("Saqlandi! ✅", "success");
    } catch {
      showToast("Xatolik yuz berdi!", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "themes", label: "🎨 Mavzular" },
    { id: "about", label: "👤 Biz haqimizda" },
  ];

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
    darkMode
      ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
  }`;

  return (
    <div className={`page-transition w-full max-w-3xl mx-auto px-4 py-10 mt-10 min-h-[calc(100vh-64px)] ${darkMode ? "text-white" : "text-gray-900"}`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        ⚙️ Sozlamalar
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

      {/* THEMES TAB */}
      {activeTab === "themes" && (
        <div className="flex flex-col gap-6">

          {/* Gradient themes */}
          <div className={`rounded-2xl p-6 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              🎨 Fon mavzulari
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button key={theme.id} onClick={() => {
                  onThemeChange(theme.id);
                  localStorage.setItem("theme", theme.id);
                  showToast(`${theme.name} mavzusi tanlandi! 🎨`, "success");
                }}
                  className={`relative h-16 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    currentTheme === theme.id ? "ring-4 ring-blue-400 scale-105" : ""
                  }`}
                  style={{ background: theme.preview }}>
                  {currentTheme === theme.id && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl">✓</span>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-white text-xs font-semibold drop-shadow">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom background */}
          <div className={`rounded-2xl p-6 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              🖼️ Shaxsiy fon rasmi
            </h2>

            {customBg ? (
              <div className="relative">
                <img src={customBg} alt="bg" className="w-full h-40 object-cover rounded-2xl mb-3" />
                <button onClick={removeBg}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm rounded-xl transition">
                  🗑️ Olib tashlash
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition ${
                darkMode ? "border-slate-600 hover:border-blue-400 text-gray-400" : "border-gray-300 hover:border-blue-400 text-gray-400"
              }`}>
                <span className="text-3xl mb-2">🖼️</span>
                <span className="text-sm">Rasm tanlash</span>
                <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      )}

      {/* ABOUT TAB */}
      {activeTab === "about" && (
        <div className="flex flex-col gap-6">

          {/* About info */}
          <div className={`rounded-2xl p-6 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              👤 Biz haqimizda
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Ism / Loyiha nomi</label>
                <input type="text" placeholder="Uzbekas Pixel" value={about.name || ""}
                  onChange={(e) => setAbout({ ...about, name: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Bio</label>
                <textarea rows={3} placeholder="O'zingiz haqingizda..." value={about.bio || ""}
                  onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                  className={inputClass + " resize-none"} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Joylashuv</label>
                <input type="text" placeholder="Toshkent, O'zbekiston" value={about.location || ""}
                  onChange={(e) => setAbout({ ...about, location: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Vebsayt</label>
                <input type="text" placeholder="https://uzbekas.vercel.app" value={about.website || ""}
                  onChange={(e) => setAbout({ ...about, website: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className={`rounded-2xl p-6 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              🌐 Ijtimoiy tarmoqlar
            </h2>
         <div className="flex flex-col gap-3">
  {SOCIAL_LINKS.map((s) => (
    <div key={s.id} className="flex items-center gap-3">
      {/* Iconni react-icons bilan */}
      <span className="text-2xl w-8 text-center">{s.icon}</span>
      
      {/* URL input */}
      <input
        type="url"
        placeholder={s.placeholder}
        value={socials[s.id] || ""}
        onChange={(e) =>
          setSocials({ ...socials, [s.id]: e.target.value })
        }
        className={inputClass}
      />

      {/* Agar siz hohlasangiz, linkni ochish tugmasi qo‘shish mumkin */}
      {socials[s.id] && (
        <a
          href={socials[s.id]}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-500 hover:underline"
        >
          Open
        </a>
      )}
    </div>
  ))}
</div>
          </div>

          <button onClick={handleSave} disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-2xl transition">
            {loading ? "Saqlanmoqda..." : "Saqlash ✅"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;