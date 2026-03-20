import React from "react";
import { BiLogoReact } from "react-icons/bi";
import { useLang } from "../context/useLang";

const Footer = ({ darkMode }) => {
  const { t } = useLang();

  return (
    <footer className={`mt-auto py-6 px-6 border-t transition-colors duration-300 md:hidden pb-24 ${
      darkMode ? "bg-gray-900 border-slate-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
    }`}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <BiLogoReact className="text-3xl text-blue-400" />
          <span className="text-blue-400 font-bold text-lg">Uzbekas Pixel</span>
        </div>
        <p className="text-xs text-center leading-relaxed">{t.footerDesc}</p>
        <div className="flex flex-col items-center gap-1 text-xs">
          <span>📧 uzbekas@email.com</span>
          <span>📍 Toshkent, Uzbekistan</span>
        </div>
        <p className={`text-xs text-center border-t w-full pt-3 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          {t.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;