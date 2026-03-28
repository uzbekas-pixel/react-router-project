import { useState } from "react";
import { LangContext } from "./LangContext";
import { translations } from "./translations";

export const LangProvider = ({ children }) => {
  // BUG #5 FIX — persist language to localStorage so page refresh keeps selection
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    return saved && translations[saved] ? saved : "en";
  });

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      localStorage.setItem("lang", newLang);
      setLang(newLang);
    }
  };

  const t = translations[lang];
  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
};