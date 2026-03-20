import { useState, useEffect, useCallback } from "react";
import { useLang } from "../../context/useLang";

const WORDS_EN = [
  "apple", "brave", "chord", "drain", "eagle", "flame", "grace", "heart", "ideal", "juice",
  "kneel", "lemon", "magic", "noble", "ocean", "piano", "queen", "river", "smile", "table",
  "ultra", "viola", "water", "xerox", "yacht", "zebra", "abode", "blaze", "crisp", "delta",
  "elbow", "frost", "globe", "haven", "ivory", "jewel", "knife", "light", "manor", "night",
  "olive", "pearl", "quiet", "radio", "stone", "tiger", "unity", "vapor", "wheat", "young",
  "angel", "beach", "civil", "dough", "enjoy", "faith", "giant", "haste", "input", "joint",
  "karma", "layer", "month", "nurse", "opera", "plane", "quest", "realm", "shelf", "touch",
  "under", "venus", "weird", "xenon", "yield", "zonal", "alarm", "blind", "creek", "drift",
  "earth", "fiber", "gloom", "horse", "irony", "joker", "latch", "metal", "nerve", "orbit",
  "paint", "rapid", "scale", "thick", "upper", "value", "waste", "extra", "yummy", "zilch",
];

const WORDS_UZ = [
  "kitob", "qalam", "stoli", "deraza", "eshik", "hovli", "daraxt", "gullar", "suvlar", "nonlar",
  "oyday", "toshda", "yerda", "havoda", "olovda", "suvdan", "togdan", "dengiz", "sahara", "vodiy",
  "bahor", "yozda", "kuzda", "qishda", "tunda", "kunda", "ertak", "qissa", "shoir", "artist",
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const pickWord = (lang) => {
  const list = lang === "uz" ? WORDS_UZ : WORDS_EN;
  return list[Math.floor(Math.random() * list.length)].toUpperCase();
};

const KEYBOARD_EN = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

const KEYBOARD_UZ = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

const Wordle = ({ darkMode }) => {
  const { t } = useLang();
  const [lang, setLang] = useState("en");
  const [answer, setAnswer] = useState(() => pickWord("en"));
  const [guesses, setGuesses] = useState([]); // array of strings
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");

  const showMsg = (msg, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  const reset = (newLang) => {
    const l = newLang ?? lang;
    setAnswer(pickWord(l));
    setGuesses([]);
    setCurrent("");
    setGameOver(false);
    setMessage("");
  };

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showMsg(lang === "uz" ? "5 ta harf kiriting!" : "Enter 5 letters!");
      return;
    }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent("");

    if (current === answer) {
      setGameOver(true);
      showMsg(lang === "uz" ? "Ajoyib! 🎉" : "Brilliant! 🎉", 3000);
      return;
    }
    if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      showMsg(answer, 5000);
    }
  }, [current, guesses, answer, lang]);

  const pressKey = useCallback((key) => {
    if (gameOver) return;
    if (key === "ENTER") { submitGuess(); return; }
    if (key === "⌫" || key === "BACKSPACE") {
      setCurrent(p => p.slice(0, -1));
      return;
    }
    if (current.length < WORD_LENGTH && /^[A-ZA-Z]$/i.test(key)) {
      setCurrent(p => p + key.toUpperCase());
    }
  }, [gameOver, current, submitGuess]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") pressKey("ENTER");
      else if (e.key === "Backspace") pressKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) pressKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pressKey]);

  // Harf natijasini hisoblash
  const getTileState = (guess, index) => {
    const letter = guess[index];
    if (!letter) return "empty";
    if (letter === answer[index]) return "correct";
    if (answer.includes(letter)) return "present";
    return "absent";
  };

  // Keyboard rang
  const getKeyState = (key) => {
    let best = "unused";
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          const state = getTileState(guess, i);
          if (state === "correct") return "correct";
          if (state === "present") best = "present";
          else if (best === "unused") best = "absent";
        }
      }
    }
    return best;
  };

  const tileClass = (state, revealed) => {
    const base = "w-14 h-14 border-2 flex items-center justify-center text-xl font-extrabold rounded-xl transition-all duration-300";
    if (!revealed) {
      return `${base} ${darkMode ? "border-slate-600 text-white" : "border-gray-300 text-gray-900"}`;
    }
    switch (state) {
      case "correct": return `${base} bg-green-500 border-green-500 text-white`;
      case "present": return `${base} bg-yellow-500 border-yellow-500 text-white`;
      case "absent":  return `${base} ${darkMode ? "bg-slate-600 border-slate-600" : "bg-gray-400 border-gray-400"} text-white`;
      default:        return `${base} ${darkMode ? "border-slate-600 text-white" : "border-gray-300 text-gray-900"}`;
    }
  };

  const keyClass = (key) => {
    const state = getKeyState(key);
    const base = "flex items-center justify-center rounded-lg font-bold text-sm transition select-none cursor-pointer active:scale-95";
    const size = (key === "ENTER" || key === "⌫") ? "px-2 h-14 text-xs min-w-[52px]" : "w-10 h-14";
    switch (state) {
      case "correct": return `${base} ${size} bg-green-500 text-white`;
      case "present": return `${base} ${size} bg-yellow-500 text-white`;
      case "absent":  return `${base} ${size} ${darkMode ? "bg-slate-600 text-white" : "bg-gray-400 text-white"}`;
      default:        return `${base} ${size} ${darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-gray-200 text-gray-900 hover:bg-gray-300"}`;
    }
  };

  const keyboard = lang === "uz" ? KEYBOARD_UZ : KEYBOARD_EN;

  return (
    <div className={`flex flex-col items-center justify-start min-h-[calc(100vh-130px)] px-4 py-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm mb-4 mt-10">
        <h2 className={`text-2xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
          🔤 Wordle
        </h2>
        <div className="flex items-center gap-2">
          {/* Til */}
          <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
            {["en", "uz"].map((l) => (
              <button key={l} onClick={() => { setLang(l); reset(l); }}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  lang === l ? "bg-blue-500 text-white"
                  : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                }`}>
                {l === "en" ? "🇬🇧 EN" : "🇺🇿 UZ"}
              </button>
            ))}
          </div>
          <button onClick={() => reset()}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
            {t.again}
          </button>
        </div>
      </div>

      {/* Xabar */}
      <div className={`mb-3 h-8 flex items-center justify-center transition-all duration-300`}>
        {message && (
          <div className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${darkMode ? "bg-slate-700 text-white" : "bg-gray-800 text-white"}`}>
            {message}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-2 mb-6">
        {Array(MAX_GUESSES).fill(null).map((_, rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length;
          const guess = rowIdx < guesses.length ? guesses[rowIdx] : isCurrentRow ? current : "";
          const isRevealed = rowIdx < guesses.length;

          return (
            <div key={rowIdx}
              className={`flex gap-2 ${isCurrentRow && shake ? "animate-[shake_0.5s_ease]" : ""}`}>
              {Array(WORD_LENGTH).fill(null).map((_, colIdx) => {
                const letter = guess[colIdx] || "";
                const state = isRevealed ? getTileState(guesses[rowIdx], colIdx) : "empty";
                return (
                  <div key={colIdx}
                    className={tileClass(state, isRevealed)}
                    style={isRevealed ? { animationDelay: `${colIdx * 100}ms` } : {}}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {keyboard.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5">
            {row.map((key) => (
              <button key={key} onClick={() => pressKey(key)} className={keyClass(key)}>
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Wordle;