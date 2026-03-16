import React from "react";
import aImage from "./images/a.png";
import aImage1 from "./images/d.png";
import aImage2 from "./images/e.png";
import aImage3 from "./images/g.png";
import { useLang } from "../context/useLang";
import ScrollReveal from "../components/ScrollReveal";

const Home = ({ darkMode, showToast, showConfetti }) => {
  const { t } = useLang();

  return (
    <div className={`page-transition w-full min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-16 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 max-w-5xl w-full mx-auto">
        <ScrollReveal direction="right">
          <div className="relative w-[280px] h-[380px] shrink-0 mx-auto">
            <div className={`absolute bottom-8 left-4 w-[240px] h-[300px] rounded-3xl z-0 ${darkMode ? "bg-slate-700" : "bg-sky-100"}`} />
            <img src={aImage} alt="Hero" className="absolute bottom-19 left-4 h-[190px] z-10 -rotate-90" />
            <img src={aImage3} alt="Singles" className="absolute top-18 -left-8 w-[140px] z-20 drop-shadow-lg" />
            <img src={aImage1} alt="Global" className="absolute top-20 -right-6 w-[100px] z-20 drop-shadow-lg" />
            <img src={aImage2} alt="Scores" className="absolute bottom-0 -left-6 w-[160px] z-20 drop-shadow-lg" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left" delay={200}>
          <div className="max-w-[340px] text-center md:text-left">
            <div className="w-10 h-1 bg-red-500 rounded mb-5 mx-auto md:mx-0" />
            <h2 className={`text-4xl font-extrabold leading-tight mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t.heroTitle}
            </h2>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t.heroText}
            </p>
            <button onClick={() => { showConfetti(); showToast("Xush kelibsiz! 🎉", "success"); }}
              className="flex items-center gap-1 text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors mx-auto md:mx-0">
              {t.learnMore}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Home;