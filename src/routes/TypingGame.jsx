import { useState, useEffect, useRef, useCallback } from "react";

const WORDS_UZ = [
  "salom", "dunyo", "kitob", "maktab", "uy", "shahar", "qishloq", "daryo",
  "tog", "osmon", "quyosh", "oy", "yulduz", "suv", "olov", "havo", "yer",
  "odam", "bola", "ona", "ota", "aka", "uka", "opa", "singil", "do'st",
  "ishq", "sevgi", "baxt", "hayot", "vaqt", "kun", "kecha", "tun", "soat",
  "daqiqa", "soniya", "yil", "oy", "hafta", "bugun", "ertaga", "kecha",
  "non", "suv", "go'sht", "sabzavot", "meva", "olma", "uzum", "shaftoli",
  "kompyuter", "telefon", "internet", "dastur", "kod", "sayt", "fayl",
  "react", "javascript", "python", "html", "css", "database", "server",
];

const WORDS_EN = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "react", "javascript", "code", "type", "fast", "speed", "word", "key",
];

const generateWords = (lang, count = 30) => {
  const list = lang === "uz" ? WORDS_UZ : WORDS_EN;
  return Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)]);
};

const TypingGame = ({ darkMode }) => {
  const [lang, setLang] = useState("en");
  const [time, setTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [words, setWords] = useState(() => generateWords("en"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [typedWords, setTypedWords] = useState([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  const reset = useCallback((newLang, newTime) => {
    clearInterval(timerRef.current);
    const targetLang = newLang || lang;
    const targetTime = newTime !== undefined ? newTime : time;
    
    const newWords = generateWords(targetLang);
    setWords(newWords);
    setCurrentIndex(0);
    setInput("");
    setTypedWords([]);
    setStarted(false);
    setFinished(false);
    setTimeLeft(targetTime);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [lang, time]);

  // Active word scroll
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const word = activeWordRef.current;
      const wordTop = word.offsetTop;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      if (wordTop > containerScrollTop + containerHeight - 60) {
        container.scrollTo({ top: wordTop - 60, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInput = (e) => {
    const val = e.target.value;

    if (!started && val.length > 0) {
      setStarted(true);
      startTimer();
    }

    if (finished) return;

    // Space — keyingi so'z
    if (val.endsWith(" ")) {
      const typed = val.trim();
      const correct = typed === words[currentIndex];
      setTypedWords((prev) => [...prev, { word: typed, correct }]);
      if (correct) {
        setCorrectCount((p) => p + 1);
      } else {
        setWrongCount((p) => p + 1);
      }
      setCurrentIndex((p) => p + 1);
      setInput("");

      // Yangi so'zlar qo'shish
      if (currentIndex >= words.length - 5) {
        setWords((prev) => [...prev, ...generateWords(lang, 10)]);
      }
    } else {
      setInput(val);
    }
  };

  const wpm = finished ? Math.round((correctCount / time) * 60) : Math.round((correctCount / Math.max(time - timeLeft, 1)) * 60);
  const accuracy = typedWords.length > 0 ? Math.round((correctCount / typedWords.length) * 100) : 100;

  const getLetterClass = (wordIndex, letterIndex) => {
    if (wordIndex < currentIndex) {
      const typed = typedWords[wordIndex];
      if (!typed) return darkMode ? "text-gray-600" : "text-gray-300";
      if (!typed.correct) {
        const typedLetter = typed.word[letterIndex];
        const originalLetter = words[wordIndex][letterIndex];
        if (typedLetter === undefined) return "text-red-400 underline";
        return typedLetter === originalLetter ? (darkMode ? "text-gray-300" : "text-gray-500") : "text-red-400";
      }
      return darkMode ? "text-gray-300" : "text-gray-500";
    }
    if (wordIndex === currentIndex) {
      const letter = words[wordIndex][letterIndex];
      const typedLetter = input[letterIndex];
      if (typedLetter === undefined) return darkMode ? "text-white" : "text-gray-900";
      return typedLetter === letter ? "text-green-400" : "text-red-400";
    }
    return darkMode ? "text-gray-500" : "text-gray-400";
  };

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
            ⌨️ Typing Test
          </h1>

          {/* Settings */}
          <div className="flex items-center gap-3">
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              {["en", "uz"].map((l) => (
                <button key={l} onClick={() => { setLang(l); reset(l); }}
                  className={`px-3 py-1.5 text-sm font-semibold transition ${
                    lang === l
                      ? "bg-blue-500 text-white"
                      : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {l === "en" ? "🇬🇧 EN" : "🇺🇿 UZ"}
                </button>
              ))}
            </div>

            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              {[15, 30, 60].map((t) => (
                <button key={t} onClick={() => { setTime(t); reset(undefined, t); }}
                  className={`px-3 py-1.5 text-sm font-semibold transition ${
                    time === t
                      ? "bg-blue-500 text-white"
                      : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {!finished ? (
          <>
            {/* Timer */}
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl font-extrabold ${
                timeLeft <= 10 ? "text-red-400" : "text-blue-400"
              }`}>
                {timeLeft}
              </div>
              {started && (
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  WPM: <span className="text-blue-400 font-bold">{wpm}</span>
                </div>
              )}
            </div>

            {/* So'zlar */}
            <div
              ref={wordsContainerRef}
              onClick={() => inputRef.current?.focus()}
              className={`relative h-36 overflow-hidden rounded-2xl p-4 mb-4 cursor-text select-none ${
                darkMode ? "bg-slate-800" : "bg-white"
              } shadow`}
            >
              <div className="flex flex-wrap gap-2">
                {words.map((word, wi) => (
                  <span
                    key={wi}
                    ref={wi === currentIndex ? activeWordRef : null}
                    className={`relative text-lg font-mono px-0.5 rounded ${
                      wi === currentIndex
                        ? darkMode ? "bg-slate-700" :  "bg-blue-50 ring-2 ring-blue-400"
                        : ""
                    }`}
                  >
                    {word.split("").map((letter, li) => (
                      <span key={li} className={`transition-colors ${getLetterClass(wi, li)}`}>
                        {/* Cursor */}
                        {wi === currentIndex && li === input.length && (
                          <span className="absolute inline-block w-0.5 h-5 bg-blue-400 animate-pulse -ml-0.5" />
                        )}
                        {letter}
                      </span>
                    ))}
                    {/* Extra harflar */}
                    {wi === currentIndex && input.length > word.length && (
                      <span className="text-red-400">
                        {input.slice(word.length)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Input (yashirin) */}
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              autoFocus
              className="opacity-0 absolute pointer-events-none"
            />

            {/* Restart */}
            <div className="flex justify-center">
              <button onClick={reset}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition ${
                  darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                🔄 Qayta boshlash
              </button>
            </div>
          </>
        ) : (
          /* Natijalar */
          <div className={`rounded-2xl p-8 shadow-xl text-center ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className={`text-2xl font-extrabold mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Natijalar
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                <div className="text-3xl font-extrabold text-blue-400">{wpm}</div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>WPM</div>
              </div>
              <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                <div className="text-3xl font-extrabold text-green-400">{accuracy}%</div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Aniqlik</div>
              </div>
              <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                <div className="text-3xl font-extrabold text-yellow-400">{correctCount}</div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>To'g'ri so'z</div>
              </div>
              <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                <div className="text-3xl font-extrabold text-red-400">{wrongCount}</div>
                <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Xato so'z</div>
              </div>
            </div>

            {/* WPM baholash */}
            <div className={`mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {wpm < 20 ? "🐢 Boshlang'ich daraja — mashq qiling!" :
               wpm < 40 ? "🚶 O'rtacha tezlik — yaxshi boshlanish!" :
               wpm < 60 ? "🏃 Yaxshi tezlik — davom eting!" :
               wpm < 80 ? "🚀 Ajoyib! Professional darajaga yaqin!" :
               "⚡ Ustaxona! Siz professional teruvchisiz!"}
            </div>

            <button onClick={reset}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
              🔄 Qayta o'ynash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingGame;