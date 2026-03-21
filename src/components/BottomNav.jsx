import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import {
  LuGraduationCap,
  LuMessageSquare,
  LuGamepad2,
  LuCode,
  LuInstagram
} from "react-icons/lu";

const BottomNav = ({ darkMode }) => {
  const { user } = useAuth();
  const { t } = useLang();

  const tabs = [
    { path: "/", icon: <LuGraduationCap />, label: t.coursesNav },
    { path: "/chat", icon: <LuMessageSquare />, label: t.chatTab },
    { path: "/games", icon: <LuGamepad2 />, label: t.gamesTab },
    { path: "/code", icon: <LuCode />, label: t.codeTab },
    { path: "/story", icon: <LuInstagram />, label: t.story },
    {
      path: "/profile",
      icon: (
        <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-blue-400">
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : user?.displayName?.[0]?.toUpperCase() || "?"}
        </div>
      ),
      label: t.profile
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 md:hidden border-t ${
      darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => (
          <NavLink key={tab.path} to={tab.path} end={tab.path === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition ${
                isActive ? "text-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`text-2xl transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? "text-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"}`}>
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