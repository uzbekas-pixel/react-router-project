import React, { useState, useEffect } from "react";
import { BiLogoReact } from "react-icons/bi";
import { Link, NavLink } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const Navbar = ({ darkMode, setDarkMode, onNavClick }) => {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const snap = await getDoc(doc(db, "admins", user.uid));
      setIsAdmin(snap.exists() && snap.data().isAdmin === true);
    };
    checkAdmin();
  }, [user]);

  return (
    <nav className="bg-slate-800 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between py-3 px-6 md:px-32">

        {/* Logo */}
        <Link to="/" onClick={onNavClick}>
          <span className="font-semibold text-lg flex items-center gap-3 text-blue-400">
            <BiLogoReact className="text-4xl md:text-6xl" />
            <span className="font-semibold text-xl md:text-2xl">React Router</span>
          </span>
        </Link>

        {/* Desktop links */}
        {user && (
  <NavLink to="/chat" onClick={onNavClick}
    className={({ isActive }) =>
      `py-1 px-3 text-lg font-light rounded-2xl transition duration-300 ${
        isActive ? "text-sky-300 bg-slate-700" : "text-white hover:text-sky-300 hover:bg-slate-700"
      }`
    }>
    💬 Chat
  </NavLink>
)}
        <div className="hidden md:flex items-center gap-5">
          {["/", "/about", "/contact", "/products","/typing","/multiplayer"].map((path, i) => {
            const labels = ["Home", "About", "Contact", "Products","⌨️","👥"];
            return (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `py-1 px-3 text-lg font-light rounded-2xl transition duration-300 ${
                    isActive
                      ? "text-sky-300 bg-slate-700"
                      : "text-white hover:text-sky-300 hover:bg-slate-700"
                  }`
                }
              >
                {labels[i]}
              </NavLink>
            );
          })}

          {/* Admin link */}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onNavClick}
              className={({ isActive }) =>
                `py-1 px-3 text-lg font-light rounded-2xl transition duration-300 ${
                  isActive
                    ? "text-yellow-300 bg-slate-700"
                    : "text-yellow-400 hover:text-yellow-300 hover:bg-slate-700"
                }`
              }
            >
              🛡️ Admin
            </NavLink>
          )}

          {/* Til tugmasi */}
          <button
            onClick={() => setLang(lang === "en" ? "uz" : "en")}
            className="py-1 px-3 text-sm font-semibold text-white border border-slate-500 rounded-xl hover:bg-slate-700 transition duration-300"
          >
            {lang === "en" ? "🇺🇿 UZ" : "🇬🇧 EN"}
          </button>

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                onClick={onNavClick}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden border-2 border-blue-400">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="text-white text-sm">
                  {user.displayName || user.email}
                </span>
              </Link>
              <button
                onClick={logout}
                className="py-1 px-3 text-sm text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition duration-300"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onNavClick}
              className="py-1 px-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition duration-300"
            >
              Kirish
            </Link>
          )}

          {/* Dark mode icon */}
          <div onClick={() => setDarkMode(!darkMode)} className="relative w-8 h-8 overflow-hidden cursor-pointer">
            <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
              style={{ transform: darkMode ? "translateY(100%)" : "translateY(0%)", opacity: darkMode ? 0 : 1 }}>☀️</span>
            <span className="absolute inset-0 flex items-center justify-center text-2xl transition-all duration-500"
              style={{ transform: darkMode ? "translateY(0%)" : "translateY(-100%)", opacity: darkMode ? 1 : 0 }}>🌙</span>
          </div>
        </div>

        {/* Mobile: til + dark mode + burger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "uz" : "en")}
            className="text-xs font-semibold text-white border border-slate-500 px-2 py-1 rounded-lg"
          >
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
        {["/", "/about", "/contact", "/products", "/typing", "/multiplayer"].map((path, i) => {
          const labels = ["Home", "About", "Contact", "Products", "Typing Game", "Multiplayer"];
          return (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => { onNavClick(); setMenuOpen(false); }}
              className={({ isActive }) =>
                `block py-2 px-8 text-lg font-light transition duration-300 ${
                  isActive ? "text-sky-300 bg-slate-700 font-semibold" : "text-white hover:text-sky-300 hover:bg-slate-700"
                }`
              }
            >
              {labels[i]}
            </NavLink>
          );
        })}

        {/* Mobile Admin link */}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => { onNavClick(); setMenuOpen(false); }}
            className={({ isActive }) =>
              `block py-2 px-8 text-lg font-light transition duration-300 ${
                isActive ? "text-yellow-300 bg-slate-700" : "text-yellow-400 hover:bg-slate-700"
              }`
            }
          >
            🛡️ Admin
          </NavLink>
        )}

        {/* Mobile Login/Logout */}
        {user ? (
          <div className="px-8 py-3 border-t border-slate-700 mt-2">
            <Link
              to="/profile"
              onClick={() => { onNavClick(); setMenuOpen(false); }}
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
                <p className="text-white text-sm font-semibold">{user.displayName || "Foydalanuvchi"}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="text-sm text-red-400 border border-red-400 px-3 py-1 rounded-xl hover:bg-red-400 hover:text-white transition"
            >
              Chiqish
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => { onNavClick(); setMenuOpen(false); }}
            className="block py-2 px-8 text-lg font-light text-blue-400 hover:bg-slate-700 transition duration-300"
          >
            Kirish
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;