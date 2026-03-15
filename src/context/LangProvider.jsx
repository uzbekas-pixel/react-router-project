import { useState } from "react";
import { LangContext } from "./LangContext";
import { translations } from "./translations";

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};