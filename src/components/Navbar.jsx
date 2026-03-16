import React, { useState, useEffect } from "react";
import { BiLogoReact } from "react-icons/bi";
import { Link, NavLink } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const Navbar = ({ darkMode, setDarkMode, onNavClick }) => {
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  const sidebarLinks = [
    { path: "/chat", label: "💬 Chat" },
    { path: "/dm", label: "✉️ DM" },
    { path: "/story", label: "📸 Story" },
    { path: "/games", label: "🎮 Games" },
    { path: "/code", label: "💻 Code" },
    { path: "/typing", label: "⌨️ Typing" },
    { path: "/multiplayer", label: "👥 Multi" },
    { path: "/profile", label: "👤 Profil" },
    ...(isAdmin ? [{ path: "/admin", label: "🛡️ Admin" }] : []),
  ];

  return (
    <>
      <nav className="bg-slate-800 shadow-lg fixed top-0 left-0 w-full z-50">
        <div className="flex items-center justify-between py-3 px-6">

          {/* Logo */}
          <Link to="/" onClick={onNavClick}>
            <span className="font-semibold text-lg flex items-center gap-3 text-blue-400">
              <BiLogoReact className="text-4xl md:text-5xl" />
              <span className="font-semibold text-lg md:text-xl">Uzbekas Pixel</span>
            </span>
          </Link>

          {/* Desktop links — faqat asosiylar */}
          <div className="hidden md:flex items-center gap-3">
            {["/", "/about", "/contact", "/products"].map((path, i) => {
              const labels = [t.home, t.about, t.contact, t.products];
              return (
                <NavLink key={path} to={path} end={path === "/"}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `py-1 px-3 text-base font-light rounded-2xl transition duration-300 ${
                      isActive ? "text-sky-300 bg-slate-700" : "text-white hover:text-sky-300 hover:bg-slate-700"
                    }`
                  }>
                  {labels[i]}
                </NavLink>
              );
            })}

            {/* Til */}
            <button onClick={() => setLang(lang === "en" ? "uz" : "en")}
              className="py-1 px-3 text-sm font-semibold text-white border border-slate-500 rounded-xl hover:bg-slate-700 transition duration-300">
              {lang === "en" ? "🇺🇿 UZ" : "🇬🇧 EN"}
            </button>

            {/* Dark mode */}
            <div onClick={() => setDarkMode(!darkMode)} className="relative w-8 h-8 overflow-hidden cursor-pointer">
              <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
                style={{ transform: darkMode ? "translateY(100%)" : "translateY(0%)", opacity: darkMode ? 0 : 1 }}>☀️</span>
              <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
                style={{ transform: darkMode ? "translateY(0%)" : "translateY(-100%)", opacity: darkMode ? 1 : 0 }}>🌙</span>
            </div>

            {/* User */}
            {user ? (
             
                <button onClick={logout}
                  className="py-1 px-3 text-sm text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition duration-300">
                  Chiqish
                </button>
              
            ) : (
              <Link to="/login" onClick={onNavClick}
                className="py-1 px-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition duration-300">
                Kirish
              </Link>
            )}

            {/* Sidebar ochish tugmasi */}
            <button onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center justify-center text-lg transition">
              ›
            </button>
          </div>

          {/* Mobile: til + dark mode + burger */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={() => setLang(lang === "en" ? "uz" : "en")}
              className="text-xs font-semibold text-white border border-slate-500 px-2 py-1 rounded-lg">
              {lang === "en" ? "🇺🇿" : "🇬🇧"}
            </button>
            <div onClick={() => setDarkMode(!darkMode)} className="relative w-8 h-8 overflow-hidden cursor-pointer">
              <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
                style={{ transform: darkMode ? "translateY(100%)" : "translateY(0%)", opacity: darkMode ? 0 : 1 }}>☀️</span>
              <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
                style={{ transform: darkMode ? "translateY(0%)" : "translateY(-100%)", opacity: darkMode ? 1 : 0 }}>🌙</span>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white text-3xl">
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden bg-slate-800 overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 py-3" : "max-h-0"}`}>
          {["/", "/about", "/contact", "/products"].map((path, i) => {
            const labels = [t.home, t.about, t.contact, t.products];
            return (
              <NavLink key={path} to={path}
                onClick={() => { onNavClick(); setMenuOpen(false); }}
                className={({ isActive }) =>
                  `block py-2 px-8 text-lg font-light transition duration-300 ${
                    isActive ? "text-sky-300 bg-slate-700 font-semibold" : "text-white hover:text-sky-300 hover:bg-slate-700"
                  }`
                }>
                {labels[i]}
              </NavLink>
            );
          })}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => { onNavClick(); setMenuOpen(false); }}
              className={({ isActive }) =>
                `block py-2 px-8 text-lg font-light transition duration-300 ${
                  isActive ? "text-yellow-300 bg-slate-700" : "text-yellow-400 hover:bg-slate-700"
                }`
              }>
              🛡️ Admin
            </NavLink>
          )}
          <div className="px-8 py-3 border-t border-slate-700 mt-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => { onNavClick(); setMenuOpen(false); }}
                  className="flex items-center gap-3 mb-3 hover:opacity-80 transition">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-blue-400">
                    {user.photoURL
                      ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                      : user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user.displayName || "Foydalanuvchi"}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="text-sm text-red-400 border border-red-400 px-3 py-1 rounded-xl hover:bg-red-400 hover:text-white transition">
                  Chiqish
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => { onNavClick(); setMenuOpen(false); }}
                className="block text-lg font-light text-blue-400 hover:text-blue-300 transition">
                Kirish
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <>
        {/* Overlay */}
        {sidebarOpen && (
          <div className="hidden md:block fixed inset-0 z-998 bg-black/40"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar panel */}
        <div className={`hidden md:flex fixed top-0 right-0 h-full z-999 flex-col w-64 transition-transform duration-300 shadow-2xl ${
          darkMode ? "bg-slate-900" : "bg-white"
        } ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>Menyu</span>
            <button onClick={() => setSidebarOpen(false)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              ✕
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-3">
            {sidebarLinks.map((link) => (
              <NavLink key={link.path} to={link.path}
                onClick={() => { onNavClick(); setSidebarOpen(false); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3 text-sm font-medium transition ${
                    isActive
                      ? darkMode ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-500"
                      : darkMode ? "text-gray-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Footer */}
          {user && (
            <div className={`px-5 py-4 border-t ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-blue-400 shrink-0">
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    : user.displayName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {user.displayName || "Foydalanuvchi"}
                  </p>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </>
  );
};

export default Navbar;