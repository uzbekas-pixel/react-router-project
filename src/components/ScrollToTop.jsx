import { useState, useEffect } from "react";
import { LuArrowUp } from "react-icons/lu";

const ScrollToTop = ({ darkMode }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollUp}
      className={`fixed bottom-24 right-8 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      } ${darkMode ? "bg-blue-500 hover:bg-blue-400" : "bg-slate-700 hover:bg-slate-600"}`}
    >
      <LuArrowUp className="text-xl text-white" />
    </button>
  );
};

export default ScrollToTop;
