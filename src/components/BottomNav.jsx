import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/translations";
import {
  LuGraduationCap,
  LuMessageSquare,
  LuGamepad2,
  LuInstagram
} from "react-icons/lu";

const BottomNav = ({ darkMode }) => {
  const { user } = useAuth();
  const { t } = useLang();

  const tabs = [
    { path: "/", icon: <LuGraduationCap size={26} />, label: t.coursesNav },
    { path: "/chat", icon: <LuMessageSquare size={26} />, label: t.chatTab },
    { path: "/games", icon: <LuGamepad2 size={26} />, label: t.gamesTab },
    { path: "/story", icon: <LuInstagram size={26} />, label: t.story },
    {
      path: "/profile",
      icon: (
        <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-xl font-bold border-2 border-blue-400">
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : user?.displayName?.[0]?.toUpperCase() || "?"}
        </div>
      ),
      label: t.profile
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 md:hidden border-t transition-all duration-300 ${
      darkMode 
        ? "bg-slate-900/80 border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]" 
        : "bg-white/80 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
    }`} style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <NavLink key={tab.path} to={tab.path} end={tab.path === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? "text-blue-500 bg-blue-500/10" 
                  : darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-300 ${isActive ? "scale-110 -translate-y-0.5" : "scale-100"}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${isActive ? "text-blue-500" : darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;