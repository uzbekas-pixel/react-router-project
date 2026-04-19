import { useEffect } from "react";
import { LuInfo, LuX, LuCheck, LuBan} from "react-icons/lu";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: <LuCheck />,
    error: <LuBan />,
    info: <LuInfo />,
  };

  return (
    <div className={`fixed bottom-24 right-6 z-9999 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-medium animate-[slideIn_0.3s_ease] ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="ml-2 opacity-70 hover:opacity-100 cursor-pointer"
      >
        <LuX className="text-lg" />
      </button>
    </div>
  );
};

export default Toast;
