import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { useSound } from "../context/SoundContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { usePWA } from "../hooks/usePWA";
import CodeSnippets from "../routes/Codesnippets"; // ← yangi import

import { LuCalendarCheck } from "react-icons/lu";
import { LuAward } from "react-icons/lu";
import { LuSwords } from "react-icons/lu";
import { LuCoins } from "react-icons/lu";
import { BiLogoReact } from "react-icons/bi";
import { HiMenu, HiX } from "react-icons/hi";
import {
  LuBookOpen, LuUsers, LuGem, LuBot,
  LuTrophy, LuCalendar, LuGift, LuFilePen,
  LuTarget, LuLayoutDashboard, LuSettings,
  LuFilePlus, LuMessageSquare, LuMail, LuInstagram,
  LuGamepad2, LuCode, LuKeyboard, LuLanguages,
  LuUser, LuShieldCheck, LuBell, LuSun, LuMoon,
  LuDownload, LuInfo, LuMessageCircle, LuMusic2,
  LuCloudRain, LuHeadphones, LuVolume2, LuVolumeX,
} from "react-icons/lu";
import { MdOutlineLogout, MdOutlineLogin } from "react-icons/md";
import { RiUserSmileLine } from "react-icons/ri";
import { TbBrandSpeedtest } from "react-icons/tb";

// ─── Sound Panel ──────────────────────────────────────────────────────────────
const SOUND_OPTIONS = [
  { key: "rain",     label: "Yomg'ir",    icon: <LuCloudRain className="text-blue-400" /> },
  { key: "lofi",     label: "Lofi",       icon: <LuHeadphones className="text-purple-400" /> },
  { key: "keyboard", label: "Klaviatura", icon: <LuKeyboard className="text-green-400" /> },
];

function SoundPanel({ activeSounds, toggleSound, darkMode }) {
  return (
    <div
      className="flex flex-col gap-2 p-3"
      style={{
        background: darkMode ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "1rem",
        border: darkMode ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(148,163,184,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        minWidth: 180,
      }}
    >
      <p className="text-xs font-bold tracking-widest uppercase mb-1"
        style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
        Ambience
      </p>
      {SOUND_OPTIONS.map((s) => {
        const active = activeSounds && activeSounds[s.key];
        return (
          <button
            key={s.key}
            onClick={() => toggleSound(s.key)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: active ? "rgba(99,102,241,0.4)" : darkMode ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.8)",
              color: active ? "#6366f1" : darkMode ? "#cbd5e1" : "#475569",
              border: active ? "1px solid #6366f1" : "1px solid transparent",
              boxShadow: active ? "0 0 12px rgba(99,102,241,0.4)" : "none",
            }}
          >
            <span className="text-base">{s.icon}</span>
            <span className="flex-1 text-left">{s.label}</span>
            {active ? (
              <LuVolume2 className="text-indigo-400 text-sm" />
            ) : (
              <LuVolumeX className="text-slate-500 text-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ darkMode, setDarkMode, onNavClick }) => {
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();
  const { activeSounds, toggleSound } = useSound();

  const [menuOpen, setMenuOpen]           = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [isAdmin, setIsAdmin]             = useState(false);
  const [unreadCount]                     = useState(0);
  const { isInstallable, installApp }     = usePWA();
  const [isInstructor, setIsInstructor]   = useState(false);

  // Sound panel states
  const [desktopSoundOpen, setDesktopSoundOpen] = useState(false);
  const [mobileSoundOpen, setMobileSoundOpen]   = useState(false);
  const desktopSoundRef = useRef(null);

  // ── CodeSnippets panel state ──────────────────────────────────────────────
  const [snippetsOpen, setSnippetsOpen] = useState(false);

  // Close desktop sound panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (desktopSoundRef.current && !desktopSoundRef.current.contains(e.target)) {
        setDesktopSoundOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Nav link data ─────────────────────────────────────────────────────────
  const navLinks = [
    { path: "/",            label: t.coursesNav,    icon: <LuBookOpen className="text-blue-400" />,  end: true  },
    { path: "/instructors", label: t.instructorsNav, icon: <LuUsers className="text-purple-400" />,  end: false },
    { path: "/pricing",     label: t.pricingNav,    icon: <LuGem className="text-cyan-400" />,       end: false },
    { path: "/ai-tutor",    label: t.aiTutorTitle,  icon: <LuBot className="text-green-400" />,      end: false },
  ];

  const newPages = [
    { path: "/leaderboard",   label: t.top10,                        icon: <LuTrophy className="text-yellow-400" />          },
    { path: "/schedule",      label: t.schedule || "Jadval",         icon: <LuCalendar className="text-blue-400" />          },
    { path: "/promo",         label: t.notifFilterPromo,             icon: <LuGift className="text-pink-400" />              },
    { path: "/create-course", label: t.createCourse || "Kurs Yarat", icon: <LuFilePen className="text-orange-400" />         },
    { path: "/quiz",          label: t.quizTitle,                    icon: <LuTarget className="text-red-400" />             },
    { path: "/dashboard",     label: t.dashboardTitle,               icon: <LuLayoutDashboard className="text-indigo-400" /> },
    { path: "/daily",         label: "Kunlik Vazifalar",             icon: <LuCalendarCheck className="text-orange-400" />   },
    { path: "/friends",       label: "Do'stlar",                     icon: <LuUsers className="text-blue-400" />             },
    { path: "/referral",      label: "Do'st Taklif",                 icon: <LuGift className="text-pink-400" />              },
    { path: "/tournament",    label: "Turnir",                       icon: <LuSwords className="text-red-400" />             },
    { path: "/certificate",   label: "Sertifikat",                   icon: <LuAward className="text-yellow-400" />           },
    { path: "/shop",          label: "Coin Do'kon",                  icon: <LuCoins className="text-yellow-400" />           },
    { path: "/settings",      label: t.settingsTitle || "Sozlamalar",icon: <LuSettings className="text-gray-400" />          },
    { path: "/qa",            label: "Savollar & Javoblar",          icon: <LuMessageCircle className="text-blue-400" />     },
  ];

  const sidebarLinks = [
    { path: "/dashboard",     label: t.dashboardTitle,               icon: <LuLayoutDashboard className="text-indigo-400" /> },
    { path: "/quiz",          label: t.quizTitle,                    icon: <LuTarget className="text-red-400" />             },
    { path: "/schedule",      label: t.schedule || "Jadval",         icon: <LuCalendar className="text-blue-400" />          },
    { path: "/promo",         label: t.notifFilterPromo,             icon: <LuGift className="text-pink-400" />              },
    { path: "/create-course", label: t.createCourse || "Kurs Yarat", icon: <LuFilePlus className="text-orange-400" />        },
    { path: "/chat",          label: t.chatTab,                      icon: <LuMessageSquare className="text-green-400" />    },
    { path: "/dm",            label: t.dm,                           icon: <LuMail className="text-blue-400" />              },
    { path: "/daily",         label: "Kunlik Vazifalar",             icon: <LuCalendarCheck className="text-orange-400" />   },
    { path: "/friends",       label: "Do'stlar",                     icon: <LuUsers className="text-blue-400" />             },
    { path: "/referral",      label: "Do'st Taklif",                 icon: <LuGift className="text-pink-400" />              },
    { path: "/tournament",    label: "Turnir",                       icon: <LuSwords className="text-red-400" />             },
    { path: "/story",         label: t.story,                        icon: <LuInstagram className="text-pink-500" />         },
    { path: "/games",         label: t.gamesTab,                     icon: <LuGamepad2 className="text-yellow-400" />        },
    { path: "/code",          label: t.codeTab,                      icon: <LuCode className="text-cyan-400" />              },
    { path: "/typing",        label: t.typingTab,                    icon: <LuKeyboard className="text-purple-400" />        },
    { path: "/multiplayer",   label: t.multiTab,                     icon: <TbBrandSpeedtest className="text-emerald-400" /> },
    { path: "/shop",          label: "Coin Do'kon",                  icon: <LuCoins className="text-yellow-400" />           },
    { path: "/certificate",   label: "Sertifikat",                   icon: <LuAward className="text-yellow-400" />           },
    { path: "/profile",       label: t.profileTab,                   icon: <RiUserSmileLine className="text-blue-400" />     },
    { path: "/settings",      label: t.settingsTitle || "Sozlamalar",icon: <LuSettings className="text-gray-400" />          },
    { path: "/qa",            label: "Savollar & Javoblar",          icon: <LuMessageCircle className="text-blue-400" />     },
    ...(isAdmin
      ? [{ path: "/admin",      label: t.adminBadge,        icon: <LuShieldCheck className="text-yellow-400" /> }]
      : []),
    ...(isInstructor
      ? [{ path: "/instructor", label: "O'qituvchi Panel",  icon: <LuBookOpen className="text-green-400" /> }]
      : []),
  ];

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "instructors", user.uid)).then((snap) =>
      setIsInstructor(snap.exists() && snap.data().isInstructor)
    );
  }, [user]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeMenu          = () => { onNavClick(); setMenuOpen(false); };
  const handleInstallClick = () => { installApp(); setMenuOpen(false); setSidebarOpen(false); };

  const anySoundActive = activeSounds && activeSounds.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <nav className="bg-slate-800 shadow-lg fixed top-0 left-0 w-full z-50">
        <div className="flex items-center justify-between py-3 px-6">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link to="/" onClick={onNavClick}>
            <span className="font-semibold text-lg flex items-center gap-3 text-blue-400">
              <BiLogoReact className="text-4xl md:text-5xl animate-spin-slow" />
              <span className="font-semibold text-lg md:text-xl">Uzbekas Pixel</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `py-1 px-3 text-sm font-light rounded-2xl transition duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? "text-sky-300 bg-slate-700"
                      : "text-white hover:text-sky-300 hover:bg-slate-700"
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            {/* Notifications */}
            <NavLink
              to="/notifications"
              onClick={onNavClick}
              style={{ position: "relative" }}
              className={({ isActive }) =>
                `py-1 px-2 rounded-xl transition duration-300 flex items-center ${
                  isActive ? "text-sky-300 bg-slate-700" : "text-white hover:text-sky-300 hover:bg-slate-700"
                }`
              }
            >
              <LuBell className="text-lg text-yellow-300" />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -2, right: -2, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10, lineHeight: 1.4 }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {/* Leaderboard */}
            <NavLink
              to="/leaderboard"
              onClick={onNavClick}
              className={({ isActive }) =>
                `py-1 px-2 rounded-xl transition duration-300 flex items-center ${
                  isActive ? "text-sky-300 bg-slate-700" : "text-white hover:text-sky-300 hover:bg-slate-700"
                }`
              }
            >
              <LuTrophy className="text-lg text-yellow-400" />
            </NavLink>

            {/* Dark mode */}
            <div onClick={() => setDarkMode(!darkMode)} className="relative w-8 h-8 overflow-hidden cursor-pointer">
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{ transform: darkMode ? "translateY(100%)" : "translateY(0%)", opacity: darkMode ? 0 : 1 }}>
                <LuSun className="text-yellow-400 text-xl" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{ transform: darkMode ? "translateY(0%)" : "translateY(-100%)", opacity: darkMode ? 1 : 0 }}>
                <LuMoon className="text-blue-300 text-xl" />
              </span>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "uz" : "en")}
              className="flex items-center gap-1.5 text-xs font-semibold text-white border border-slate-500 px-3 py-1.5 rounded-xl hover:bg-slate-700 transition"
            >
              <LuLanguages className="text-blue-400" />
              {lang === "en" ? "🇺🇿 UZ" : "🇬🇧 EN"}
            </button>

            {/* ── Desktop Sound Button + Panel ──────────────────────────── */}
            <div className="relative" ref={desktopSoundRef}>
              <button
                onClick={() => setDesktopSoundOpen((o) => !o)}
                title="Ambience Tovuqlari"
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={{
                  background: anySoundActive
                    ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25))"
                    : "rgba(51,65,85,1)",
                  border: anySoundActive
                    ? "1px solid rgba(99,102,241,0.6)"
                    : "1px solid rgba(71,85,105,0.5)",
                  boxShadow: anySoundActive ? "0 0 14px rgba(99,102,241,0.35)" : "none",
                  color: anySoundActive ? "#a5b4fc" : "#fff",
                }}
              >
                <LuMusic2 className="text-base" />
              </button>

              {desktopSoundOpen && (
                <div className="absolute right-0 mt-2 z-50" style={{ top: "100%" }}>
                  <SoundPanel activeSounds={activeSounds} toggleSound={toggleSound} darkMode={darkMode} />
                </div>
              )}
            </div>

            {/* ── Code Snippets Button ───────────────────────────────────── */}
            <button
              onClick={() => setSnippetsOpen((o) => !o)}
              title="Kod Parchalarim"
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
              style={{
                background: snippetsOpen
                  ? "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(99,102,241,0.25))"
                  : "rgba(51,65,85,1)",
                border: snippetsOpen
                  ? "1px solid rgba(6,182,212,0.6)"
                  : "1px solid rgba(71,85,105,0.5)",
                boxShadow: snippetsOpen ? "0 0 14px rgba(6,182,212,0.35)" : "none",
                color: snippetsOpen ? "#67e8f9" : "#fff",
              }}
            >
              <LuCode className="text-base" />
            </button>

            {/* Auth */}
            {user ? (
              <button
                onClick={logout}
                className="py-1 px-3 text-sm text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition duration-300 flex items-center gap-1.5"
              >
                <MdOutlineLogout className="text-base" />
                {t.logout}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={onNavClick}
                className="py-1 px-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition duration-300 flex items-center gap-1.5"
              >
                <MdOutlineLogin className="text-base" />
                {t.login}
              </Link>
            )}

            {/* Sidebar trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-center text-lg transition font-bold"
            >
              ›
            </button>
          </div>

          {/* ── Mobile Controls ───────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-3">
            <NavLink to="/notifications" style={{ position: "relative", color: "#fff" }}>
              <LuBell className="text-xl text-yellow-300" />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 8 }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {/* Dark mode */}
            <div onClick={() => setDarkMode(!darkMode)} className="relative w-8 h-8 overflow-hidden cursor-pointer">
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{ transform: darkMode ? "translateY(100%)" : "translateY(0%)", opacity: darkMode ? 0 : 1 }}>
                <LuSun className="text-yellow-400 text-xl" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                style={{ transform: darkMode ? "translateY(0%)" : "translateY(-100%)", opacity: darkMode ? 1 : 0 }}>
                <LuMoon className="text-blue-300 text-xl" />
              </span>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white text-3xl">
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
        <div
          className={`md:hidden bg-slate-800 overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-[800px] py-3" : "max-h-0"
          }`}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-8 text-base font-light transition duration-300 ${
                  isActive
                    ? "text-sky-300 bg-slate-700 font-semibold"
                    : "text-white hover:text-sky-300 hover:bg-slate-700"
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {/* New pages chips */}
          <div className="px-4 pt-3 pb-2 border-t border-slate-700 mt-1">
            <p className="text-xs text-gray-500 font-semibold mb-2 px-4">
              {t.newPages || "Yangi sahifalar"}
            </p>
            <div className="flex flex-wrap gap-2 px-4">
              {newPages.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`
                  }
                >
                  <span>{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* PWA Install */}
          {isInstallable && (
            <div className="px-8 py-2 border-t border-slate-700 mt-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg active:scale-95"
              >
                <LuDownload className="text-lg" />
                {t.installApp || "Ilovani o'rnatish"}
              </button>
            </div>
          )}

          {/* Language + Sound + Snippets row (mobile) */}
          <div className="flex items-center gap-3 px-8 mt-3 flex-wrap">
            <button
              onClick={() => setLang(lang === "en" ? "uz" : "en")}
              className="flex items-center gap-2 text-xs font-semibold text-white border border-slate-500 px-3 py-2 rounded-xl hover:bg-slate-700 transition"
            >
              <LuLanguages className="text-blue-400" />
              {lang === "en" ? "🇺🇿 UZ" : "🇬🇧 EN"}
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => setMobileSoundOpen((o) => !o)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition"
              style={{
                background: anySoundActive
                  ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25))"
                  : "rgba(51,65,85,1)",
                border: anySoundActive
                  ? "1px solid rgba(99,102,241,0.6)"
                  : "1px solid rgba(71,85,105,0.6)",
                color: anySoundActive ? "#a5b4fc" : "#fff",
                boxShadow: anySoundActive ? "0 0 14px rgba(99,102,241,0.3)" : "none",
              }}
            >
              <LuMusic2 className="text-base" />
              🎵 Ovoz
            </button>

            {/* Code Snippets toggle (mobile) */}
            <button
              onClick={() => setSnippetsOpen((o) => !o)}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition"
              style={{
                background: snippetsOpen
                  ? "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(99,102,241,0.25))"
                  : "rgba(51,65,85,1)",
                border: snippetsOpen
                  ? "1px solid rgba(6,182,212,0.6)"
                  : "1px solid rgba(71,85,105,0.6)",
                color: snippetsOpen ? "#67e8f9" : "#fff",
                boxShadow: snippetsOpen ? "0 0 14px rgba(6,182,212,0.3)" : "none",
              }}
            >
              <LuCode className="text-base" />
              Snippets
            </button>
          </div>

          {/* Mobile sound dropdown */}
          {mobileSoundOpen && (
            <div className="mx-8 mt-2">
              <SoundPanel activeSounds={activeSounds} toggleSound={toggleSound} darkMode={true} />
            </div>
          )}

          {/* Admin */}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-8 text-base font-light transition duration-300 ${
                  isActive ? "text-yellow-300 bg-slate-700" : "text-yellow-400 hover:bg-slate-700"
                }`
              }
            >
              <LuShieldCheck className="text-xl text-yellow-400" />
              {t.admin}
            </NavLink>
          )}

          {/* User info */}
          <div className="px-8 py-3 border-t border-slate-700 mt-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 mb-3 hover:opacity-80 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-blue-400">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user.displayName || t.user}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-red-400 border border-red-400 px-3 py-1 rounded-xl hover:bg-red-400 hover:text-white transition"
                >
                  <MdOutlineLogout />
                  {t.logout}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-2 text-base font-light text-blue-400 hover:text-blue-300 transition"
              >
                <MdOutlineLogin className="text-xl" />
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Desktop Sidebar ───────────────────────────────────────────────────── */}
      <>
        {sidebarOpen && (
          <div
            className="hidden md:block fixed inset-0 z-998 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`hidden md:flex fixed top-0 right-0 h-full z-999 flex-col w-64 transition-transform duration-300 shadow-2xl ${
            darkMode
              ? "bg-slate-900 border-l border-slate-800"
              : "bg-white border-l border-gray-100"
          } ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t.menuTitle || "Menyu"}
            </span>
            {isInstallable && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">
                PWA Ready
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                darkMode
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <HiX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 mt-2 sidebar">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => { onNavClick(); setSidebarOpen(false); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-sm font-medium transition ${
                    isActive
                      ? darkMode ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-500"
                      : darkMode ? "text-gray-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <span className="text-lg shrink-0">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            {isInstallable && (
              <div className="mt-4 px-4">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                >
                  <LuDownload className="text-lg" />
                  {t.installApp || "Ilovani o'rnatish"}
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className={`px-5 py-4 border-t ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-blue-400 shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {user.displayName || t.user}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition border border-red-400 shrink-0"
                >
                  <MdOutlineLogout className="text-base" />
                </button>
              </div>
            </div>
          )}
        </div>
      </>

      {/* ── CodeSnippets floating panel ───────────────────────────────────────── */}
      <CodeSnippets
        isOpen={snippetsOpen}
        onClose={() => setSnippetsOpen(false)}
        darkMode={darkMode}
        user={user}
      />
    </>
  );
};

export default Navbar;