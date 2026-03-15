import React from "react";
import { Link } from "react-router-dom";
import { BiLogoReact } from "react-icons/bi";
import { useLang } from "../context/useLang";

const Footer = ({ darkMode }) => {
  const { t } = useLang();

  return (
    <footer className={`mt-auto py-10 px-6 md:px-32 border-t transition-colors duration-300 ${
      darkMode ? "bg-gray-900 border-slate-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
    }`}>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Logo va tavsif */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BiLogoReact className="text-4xl text-blue-400" />
            <span className="text-blue-400 font-bold text-xl">React Router</span>
          </div>
          <p className="text-sm leading-relaxed">{t.footerDesc}</p>
        </div>

        {/* Sahifalar */}
        <div>
          <h4 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.footerPages}</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/" className="hover:text-blue-400 transition-colors">{t.home}</Link></li>
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">{t.about}</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">{t.contact}</Link></li>
            <li><Link to="/products" className="hover:text-blue-400 transition-colors">{t.products}</Link></li>
          </ul>
        </div>

        {/* Kontakt */}
        <div>
          <h4 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.footerContact}</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li>📧 uzbekas@email.com</li>
            <li>📍 Toshkent, Uzbekistan</li>
            <li>📞 +998 90 123 45 67</li>
          </ul>
        </div>

      </div>

      {/* Pastki qism */}
      <div className={`max-w-5xl mx-auto mt-10 pt-6 border-t text-sm text-center ${
        darkMode ? "border-slate-700" : "border-gray-200"
      }`}>
        {t.copyright}
      </div>

    </footer>
  );
};

export default Footer;