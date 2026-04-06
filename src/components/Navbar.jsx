import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { useSound } from "../context/SoundContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { usePWA } from "../hooks/usePWA";
import CodeSnippets from "../routes/Codesnippets";

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
  LuCloudRain, LuHeadphones, LuVolume2, LuVolumeX, LuRadio, LuLogOut, LuMenu, LuX, LuTerminal
} from "react-icons/lu";
import { MdOutlineLogout, MdOutlineLogin } from "react-icons/md";
import { RiUserSmileLine } from "react-icons/ri";
import { TbBrandSpeedtest } from "react-icons/tb";

// ─── Sound Panel ──────────────────────────────────────────────────────────────
function SoundPanel({ activeSounds, toggleSound, darkMode, t }) {
  const SOUND_OPTIONS = [
    { key: "rain",     label: t?.ambienceRain || "Yomg'ir",    icon: <LuCloudRain className="text-blue-400" /> },
    { key: "lofi",     label: t?.ambienceLofi || "Lofi",       icon: <LuHeadphones className="text-purple-400" /> },
    { key: "keyboard", label: t?.ambienceKeyboard || "Klaviatura", icon: <LuKeyboard className="text-green-400" /> },
  ];
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
        {t?.ambienceTitle || "Ambience"}
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
    { path: "/pricing",     label: t.pricingNav,    icon: <LuGem className="text-cyan-400" />,       end: false },
    { path: "/ai-tutor",    label: t.aiTutorTitle,  icon: <LuBot className="text-green-400" />,      end: false },
  ];


  const sidebarLinks = [
    { path: "/dashboard",     label: t.dashboardTitle,               icon: <LuLayoutDashboard className="text-indigo-400" /> },
    { path: "/quiz",          label: t.quizTitle,                    icon: <LuTarget className="text-red-400" />             },
    { path: "/battlemode",    label: t.battleModeNav,                icon: <LuSwords className="text-red-400" />             },
    { path: "/schedule",      label: t.schedule || "Jadval",         icon: <LuCalendar className="text-blue-400" />          },
    { path: "/promo",         label: t.notifFilterPromo,             icon: <LuGift className="text-pink-400" />              },
    { path: "/live",          label: t.liveClassNav,                 icon: <LuRadio className="text-red-400" />              },
    { path: "/chat",          label: t.chatTab,                      icon: <LuMessageSquare className="text-green-400" />    },
    { path: "/dm",            label: t.dm,                           icon: <LuMail className="text-blue-400" />              },
    { path: "/daily",         label: t.dailyTasksNav,                icon: <LuCalendarCheck className="text-orange-400" />   },
    { path: "/friends",       label: t.friendsNav,                   icon: <LuUsers className="text-blue-400" />             },
    { path: "/referral",      label: t.referralNav,                  icon: <LuGift className="text-pink-400" />              },
    { path: "/tournament",    label: t.tournamentNav,                icon: <LuSwords className="text-red-400" />             },
    { path: "/story",         label: t.story,                        icon: <LuInstagram className="text-pink-500" />         },
    { path: "/games",         label: t.gamesTab,                     icon: <LuGamepad2 className="text-yellow-400" />        },
    { path: "/code",          label: t.codeTab,                      icon: <LuCode className="text-cyan-400" />              },
    { path: "/supports",      label: "Ko'makchilar",               icon: <LuUsers className="text-green-400" />            },
    { path: "/projects",      label: "Loyiha",                       icon: <LuTerminal className="text-cyan-400" />              },
    { path: "/shop",          label: t.coinShopNav,                  icon: <LuCoins className="text-yellow-400" />           },
    { path: "/certificate",   label: t.certificateNav,               icon: <LuAward className="text-yellow-400" />           },
    { path: "/profile",       label: t.profileTab,                   icon: <RiUserSmileLine className="text-blue-400" />     },
    { path: "/settings",      label: t.settingsTitle || "Sozlamalar",icon: <LuSettings className="text-gray-400" />          },
    { path: "/qa",            label: t.qaNav,                        icon: <LuMessageCircle className="text-blue-400" />     },
    ...(isAdmin
      ? [{ path: "/admin",      label: t.adminBadge,        icon: <LuShieldCheck className="text-yellow-400" /> }]
      : []),
    ...(isInstructor
      ? [{ path: "/instructor", label: t.instructorPanelNav,icon: <LuBookOpen className="text-green-400" /> }]
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
      <nav 
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: darkMode ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: darkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          boxShadow: darkMode ? "0 4px 30px rgba(0, 0, 0, 0.3)" : "0 4px 30px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div className="flex items-center justify-between py-3 px-6">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link to="/" onClick={onNavClick} className="hover:opacity-90 transition-opacity">
            <span className="flex items-center gap-3">
              <svg className="logo-svg-group" width="44" height="44" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="34" fill={darkMode ? "#0d1224" : "#f8fafc"} stroke={darkMode ? "#1e2a50" : "#e2e8f0"} strokeWidth="1"/>
                <polygon points="36,14 44,28 52,14 52,50 44,36 36,50 28,36 20,50 20,14 28,28" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" opacity="0.25" />
                <circle cx="36" cy="36" r="10" fill={darkMode ? "#1a1f3a" : "#fff"} stroke="#4f46e5" strokeWidth="1.5"/>
                <circle cx="36" cy="36" r="5" fill="#4f46e5" opacity="0.8"/>
                <circle cx="36" cy="36" r="2.5" fill="#a5b4fc"/>
                <g className="orbit-dot-1"><circle cx="36" cy="36" r="4" fill="#60a5fa" opacity="0.95"/><circle cx="36" cy="36" r="2" fill="#bfdbfe"/></g>
                <g className="orbit-dot-2"><circle cx="36" cy="36" r="3" fill="#a78bfa" opacity="0.9"/><circle cx="36" cy="36" r="1.5" fill="#ddd6fe"/></g>
              </svg>
              <span className="flex flex-col gap-[2px]">
                <span className="flex items-center gap-2">
                  <span className={`font-black text-[20px] tracking-tight leading-none ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                    {t.uzbekasPixel?.split(" ")[0] || "Uzbekas"}
                  </span>
                  <span className="logo-badge text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-[5px] px-[7px] py-[2px] tracking-widest">
                    EDU
                  </span>
                </span>
                <span className="text-[11px] font-normal text-indigo-500 tracking-[4px]">PIXEL</span>
              </span>
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
                  `py-2 px-4 text-sm font-medium rounded-2xl transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                      : `${darkMode ? "text-slate-300" : "text-slate-600"} hover:text-blue-400 hover:bg-blue-500/5`
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}

            <div className="h-6 w-px bg-slate-700/50 mx-2" />

            <div className="flex items-center gap-3">
              {/* Leaderboard */}
              <NavLink to="/leaderboard" onClick={onNavClick} className={({ isActive }) => `p-2 rounded-xl transition-all ${isActive ? "text-yellow-400 bg-yellow-400/10" : "text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/5"}`}>
                <LuTrophy size={20} />
              </NavLink>

              {/* Notifications */}
              <NavLink to="/notifications" onClick={onNavClick} className={({ isActive }) => `p-2 rounded-xl relative transition-all ${isActive ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-blue-400 hover:bg-blue-400/5"}`}>
                <LuBell size={20} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800" />}
              </NavLink>

              {/* Dark mode */}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                {darkMode ? <LuSun size={20} /> : <LuMoon size={20} />}
              </button>

              {/* Language */}
              <button onClick={() => setLang(lang === "en" ? "uz" : "en")} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                {lang === "en" ? "UZ" : "EN"}
              </button>

              {/* Ambience */}
              <div className="relative" ref={desktopSoundRef}>
                <button onClick={() => setDesktopSoundOpen(!desktopSoundOpen)} className={`p-2 rounded-xl transition-all ${anySoundActive ? "text-indigo-400 bg-indigo-400/10" : "text-slate-400 hover:text-indigo-400"}`}>
                  <LuMusic2 size={20} />
                </button>
                {desktopSoundOpen && (
                  <div className="absolute right-0 mt-3 top-full">
                    <SoundPanel activeSounds={activeSounds} toggleSound={toggleSound} darkMode={darkMode} t={t} />
                  </div>
                )}
              </div>
              

              {/* Auth */}
              {user ? (
                <button onClick={logout} className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-colors border border-red-400/20">
                  <LuLogOut size={18} />
                  {t.logout}
                </button>
              ) : (
                <Link to="/login" onClick={onNavClick} className="ml-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25">
                  {t.login}
                </Link>
              )}

              {/* Menu */}
              <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-xl transition-all ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}>
                <LuMenu size={20} />
              </button>
            </div>
          </div>

          {/* ── Mobile Controls ───────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-3">
            
            {/* 1. TIL ALMASHTIRISH TUGMASI (Yangi qo'shildi) */}
            <button 
              onClick={() => setLang(lang === "en" ? "uz" : "en")} 
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${darkMode ? "border-slate-700 text-slate-300 bg-slate-800" : "border-slate-200 text-slate-600 bg-slate-50"}`}
            >
              {lang === "en" ? "UZ" : "EN"}
            </button>

            {/* 2. KUNDUZGI/TUNGI REJIM */}
            <button onClick={() => setDarkMode(!darkMode)} className="text-slate-400">
              {darkMode ? <LuSun size={20} /> : <LuMoon size={20} />}
            </button>
            
            {/* 3. MENYU OCHISH/YOPISH */}
            <button onClick={() => setMenuOpen(!menuOpen)} className={`text-2xl transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>
              {menuOpen ? <LuX /> : <LuMenu />}
            </button>
            
          </div>
        </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
        <div className={`md:hidden transition-all duration-500 ease-in-out ${menuOpen ? "max-h-[85vh] overflow-y-auto border-t border-slate-700/30" : "max-h-0 overflow-hidden"}`} style={{ background: darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)" }}>
          <div className="p-6 pb-32 flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.end} onClick={closeMenu} className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl text-lg font-medium transition-all ${isActive ? "bg-blue-500/10 text-blue-400" : darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
            
            <div className="h-px bg-slate-700/30 my-4" />
            
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.newPagesTitle}</p>
           <div className="grid grid-cols-3 gap-2">
  {/* O'ZGARISH: .filter() orqali faqat telefonda /live sahifasi yashirildi */}
  {sidebarLinks.filter(link => link.path !== "/live").map((link) => (
    <NavLink 
      key={link.path} 
      to={link.path} 
      onClick={closeMenu} 
      className={({ isActive }) => `flex flex-col items-center justify-center p-3 rounded-xl transition-all ${isActive ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
    >
      <span className="text-2xl mb-1 opacity-80">{link.icon}</span>
      <span className="text-[10px] font-medium text-center leading-tight truncate w-full">{link.label}</span>
    </NavLink>
  ))}
</div>

            <div className="mt-auto pt-6 border-t border-slate-700/30">
              {isInstallable && (
                <button onClick={handleInstallClick} className="w-full py-4 mb-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20">
                  <LuDownload size={20}/>
                  {t.installApp}
                </button>
              )}
            </div>

            {user ? (
              <div className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <LuUser size={40} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{user.displayName || t.userLabel}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="p-2 text-red-400"><LuLogOut size={20}/></button>
              </div>
            ) : (
              <Link to="/login" onClick={closeMenu} className="mt-8 w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-center shadow-lg shadow-blue-500/25">
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-60 transition-opacity duration-500 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-80 transition-transform duration-500 ease-out shadow-2xl overflow-y-auto ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`} style={{ background: darkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(40px)", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`font-black text-xl ${darkMode ? "text-white" : "text-slate-900"}`}>{t.menuTitle}</h2>
              <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded-xl ${darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}><LuX size={20}/></button>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              {/* Nav asosiy linklar */}
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} end={link.end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                  <span className="text-xl opacity-75">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              ))}

              <div className="h-px bg-slate-700/30 my-3" />
              <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.newPagesTitle}</p>

              {/* O'ZGARTIRILDI: Yangi sahifalar — barchasi (sidebarLinks ishlatildi) */}
              {sidebarLinks.map((link) => (
                <NavLink key={link.path} to={link.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : darkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                  <span className="text-xl opacity-75">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-700/30">
              {isInstallable && (
                <button onClick={handleInstallClick} className="w-full py-4 mb-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20">
                  <LuDownload size={20}/>
                  {t.installApp}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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