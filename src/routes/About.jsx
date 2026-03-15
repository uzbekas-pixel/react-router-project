import React from "react";
import aboutImage from "./images/f.png";
import { useLang } from "../context/useLang";
import ScrollReveal from "../components/ScrollReveal";
import Counter from "../components/Counter";

const About = ({ darkMode, showToast }) => {
  const { t } = useLang();

  return (
    <div className={`page-transition w-full max-w-5xl mx-auto px-6 py-10 mt-20 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <div className="flex flex-col md:flex-row items-center gap-10">

        <ScrollReveal direction="right" delay={0}>
          <div className="w-full md:max-w-[480px]">
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.aboutTitle}</h2>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t.aboutText}
            </p>
            <button
              onClick={() => showToast("Ko'proq ma'lumot tez kunda!", "info")}
              className={`flex items-center gap-2 border text-sm px-4 py-2 rounded transition-colors ${darkMode ? "border-blue-400 text-blue-400 hover:bg-slate-700" : "border-blue-400 text-blue-500 hover:bg-blue-50"}`}
            >
              {t.readMore} <span>→</span>
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left" delay={200}>
          <div className="w-full md:w-[480px] h-[240px] md:h-[320px] rounded-2xl overflow-hidden shrink-0">
            <img src={aboutImage} alt="About Us" className="w-full h-full object-cover" />
          </div>
        </ScrollReveal>

      </div>

      <ScrollReveal direction="up" delay={300}>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 py-10 px-6 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg`}>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-extrabold text-blue-400"><Counter target={500} suffix="+" /></span>
            <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Kurslar</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-extrabold text-blue-400"><Counter target={50} suffix="+" /></span>
            <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>O'qituvchilar</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-extrabold text-blue-400"><Counter target={98} suffix="%" /></span>
            <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Muvaffaqiyat</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-4xl font-extrabold text-blue-400"><Counter target={1200} suffix="+" /></span>
            <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Talabalar</p>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};

export default About;