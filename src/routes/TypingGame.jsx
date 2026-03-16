import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import ScrollReveal from "../components/ScrollReveal";

const WORDS_UZ = [
 "salom", "uka", "opa", "aka", "ota", "ona", "bobo", "buvi", "dost", "yigit",
"qiz", "bola", "odam", "inson", "xalq", "shahar", "qishloq", "kocha", "yo‘l", "uy",
"hovli", "deraza", "eshik", "stol", "stul", "divan", "kitob", "daftar", "qalam", "ruchka",
"sumka", "telefon", "kompyuter", "ekran", "klaviatura", "sichqoncha", "internet", "dastur", "oyna", "soat",
"vaqt", "tong", "ertalab", "tush", "kech", "kecha", "bugun", "ertaga", "hafta", "oy",
"yil", "bahor", "yoz", "kuz", "qish", "quyosh", "oy", "yulduz", "osmon", "bulut",
"yomgir", "qor", "shamol", "issiq", "sovuq", "iliq", "salqin", "non", "ovqat", "suv",
"choy", "sho'rva", "osh", "palov", "meva", "sabzi", "kartoshka", "piyoz", "guruch", "go'sht",
"tovuq", "baliq", "shakar", "tuz", "asal", "bog'", "daraxt", "gul", "barg", "mehnat",
"ish", "dam", "uyqu", "kulgi", "baxt", "quvonch", "sevgi", "do'stlik", "yordam", "rahmat",
"iltimos", "uzr", "haqiqat", "orzu", "maqsad", "yo'l", "tez", "sekin", "katta", "kichik",
"uzun", "qisqa", "yangi", "eski", "toza", "iflos", "och", "yopiq", "yaxshi", "yomon",
"oq", "qora", "qizil", "ko'k", "yashil", "sariq", "jigarrang", "kulrang", "oddiy", "qiziq",
];

const WORDS_EN = [
"hi", "hello", "good", "bad", "day", "night", "sun", "moon", "star", "sky",
"water", "food", "bread", "tea", "book", "pen", "table", "chair", "house", "school",
"friend", "boy", "girl", "city", "road", "tree", "flower", "green", "blue", "red",
"happy", "sad", "fast", "slow", "big", "small", "new", "old", "clean", "open",
"close", "start", "finish", "learn", "write", "read", "think", "dream", "walk", "run",
"play", "work", "rest", "laugh", "smile", "light", "dark", "sweet", "fresh", "warm",
"cool", "river", "mountain", "valley", "field", "forest", "cloud", "rain", "snow", "wind",
"storm", "summer", "winter", "spring", "autumn", "morning", "evening", "minute", "second", "future",
"past", "present", "energy", "power", "voice", "sound", "music", "story", "idea", "magic",
];

const generateWords = (lang, count = 30) => {
  const list = lang === "uz" ? WORDS_UZ : WORDS_EN;
  return Array.from({ length: count }, () => list[Math.floor(Math.random() * list.length)]);
};

const medals = ["🥇", "🥈", "🥉"];

const TypingGame = ({ darkMode }) => {
  const { user } = useAuth();
  const [lang, setLang] = useState("en");
  const [time, setTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [typedWords, setTypedWords] = useState([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isMobile] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState([]);
  const [filterTime, setFilterTime] = useState("all");

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);
  const prevLengthRef = useRef(0);

  // Leaderboard yuklash
  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("wpm", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (filterTime !== "all") data = data.filter((d) => d.time === parseInt(filterTime));
      const best = {};
      data.forEach((d) => {
        if (!best[d.uid] || d.wpm > best[d.uid].wpm) best[d.uid] = d;
      });
      setScores(Object.values(best).sort((a, b) => b.wpm - a.wpm).slice(0, 10));
    });
    return () => unsub();
  }, [filterTime]);

  const reset = useCallback((newLang = lang, newTime = time) => {
    clearInterval(timerRef.current);
    setWords(generateWords(newLang));
    setCurrentIndex(0);
    setInput("");
    setTypedWords([]);
    setStarted(false);
    setFinished(false);
    setTimeLeft(newTime);
    setCorrectCount(0);
    setWrongCount(0);
    prevLengthRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [lang, time]);

  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const word = activeWordRef.current;
      if (word.offsetTop > container.scrollTop + container.clientHeight - 60) {
        container.scrollTo({ top: word.offsetTop - 60, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  const wpm = finished
    ? Math.round((correctCount / time) * 60)
    : Math.round((correctCount / Math.max(time - timeLeft, 1)) * 60);
  const accuracy = typedWords.length > 0
    ? Math.round((correctCount / typedWords.length) * 100)
    : 100;

  // Natija saqlash
  useEffect(() => {
    if (finished && user && wpm > 0) {
      addDoc(collection(db, "leaderboard"), {
        uid: user.uid,
        name: user.displayName || user.email,
        avatar: user.photoURL || null,
        wpm, accuracy, lang, time,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }
  }, [finished, accuracy, lang, time, user, wpm]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    if (!started && val.length > 0) { setStarted(true); startTimer(); }
    if (finished) return;
    if (val.endsWith(" ")) {
      const typed = val.trim();
      const correct = typed === words[currentIndex];
      setTypedWords((prev) => [...prev, { word: typed, correct }]);
      if (correct) setCorrectCount((p) => p + 1);
      else setWrongCount((p) => p + 1);
      setCurrentIndex((p) => p + 1);
      setInput("");
      if (currentIndex >= words.length - 5) setWords((prev) => [...prev, ...generateWords(lang, 10)]);
    } else {
      setInput(val);
    }
  };

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
      const typedLetter = input[letterIndex];
      if (typedLetter === undefined) return darkMode ? "text-white" : "text-gray-900";
      return typedLetter === words[wordIndex][letterIndex] ? "text-green-400" : "text-red-400";
    }
    return darkMode ? "text-gray-500" : "text-gray-400";
  };

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className={`text-2xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
            ⌨️ Typing Test
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Leaderboard tugmasi */}
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition ${
                showLeaderboard
                  ? "bg-yellow-500 text-white"
                  : darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              🏆 Top 10
            </button>
            {/* Til */}
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              {["en", "uz"].map((l) => (
                <button key={l} onClick={() => { setLang(l); reset(l, time); }}
                  className={`px-3 py-1.5 text-sm font-semibold transition ${
                    lang === l ? "bg-blue-500 text-white"
                    : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {l === "en" ? "🇬🇧 EN" : "🇺🇿 UZ"}
                </button>
              ))}
            </div>
            {/* Vaqt */}
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
              {[15, 30, 60].map((t) => (
                <button key={t} onClick={() => { setTime(t); reset(lang, t); }}
                  className={`px-3 py-1.5 text-sm font-semibold transition ${
                    time === t ? "bg-blue-500 text-white"
                    : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {t}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard panel */}
        {showLeaderboard && (
          <ScrollReveal direction="up">
            <div className={`rounded-2xl p-4 mb-6 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>🏆 Top 10</h2>
                <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
                  {[["all", "Barchasi"], ["15", "15s"], ["30", "30s"], ["60", "60s"]].map(([val, label]) => (
                    <button key={val} onClick={() => setFilterTime(val)}
                      className={`px-2 py-1 text-xs font-semibold transition ${
                        filterTime === val ? "bg-blue-500 text-white"
                        : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {scores.length === 0 ? (
                <p className={`text-center text-sm py-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Hali natijalar yo'q!
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {scores.map((score, index) => (
                    <div key={score.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                      score.uid === user?.uid
                        ? "ring-2 ring-blue-400 " + (darkMode ? "bg-slate-700" : "bg-blue-50")
                        : darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}>
                      <div className="w-8 text-center">
                        {index < 3 ? (
                          <span className="text-lg">{medals[index]}</span>
                        ) : (
                          <span className={`text-sm font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>#{index + 1}</span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {score.avatar
                          ? <img src={score.avatar} alt="" className="w-full h-full object-cover" />
                          : score.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {score.name}
                          {score.uid === user?.uid && (
                            <span className="ml-1 text-xs text-blue-400">(Siz)</span>
                          )}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {score.lang === "uz" ? "🇺🇿" : "🇬🇧"} {score.time}s • {score.accuracy}%
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-blue-400">{score.wpm}</div>
                        <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>WPM</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {!finished ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-4xl font-extrabold ${timeLeft <= 10 ? "text-red-400" : "text-blue-400"}`}>
                {timeLeft}
              </div>
              {started && (
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  WPM: <span className="text-blue-400 font-bold">{wpm}</span>
                </div>
              )}
            </div>

            <div ref={wordsContainerRef} onClick={() => inputRef.current?.focus()}
              className={`relative h-36 overflow-hidden rounded-2xl p-4 mb-4 cursor-text select-none shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className="flex flex-wrap gap-2">
                {words.map((word, wi) => (
                  <span key={wi} ref={wi === currentIndex ? activeWordRef : null}
                    className={`relative text-lg font-mono px-0.5 rounded ${
                      wi === currentIndex ? darkMode ? "bg-slate-700" : "bg-blue-50 ring-2 ring-blue-400" : ""
                    }`}>
                    {word.split("").map((letter, li) => (
                      <span key={li} className={`transition-colors ${getLetterClass(wi, li)}`}>
                        {wi === currentIndex && li === input.length && (
                          <span className="absolute inline-block w-0.5 h-5 bg-blue-400 animate-pulse -ml-0.5" />
                        )}
                        {letter}
                      </span>
                    ))}
                    {wi === currentIndex && input.length > word.length && (
                      <span className="text-red-400">{input.slice(word.length)}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {isMobile ? (
              <input ref={inputRef} value={input} onChange={handleInput}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                placeholder="Shu yerga yozing..."
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition mb-4 ${
                  darkMode ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
                }`} />
            ) : (
              <input ref={inputRef} value={input} onChange={handleInput}
                autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                className="opacity-0 absolute pointer-events-none" />
            )}

            <div className="flex justify-center">
              <button onClick={() => reset()}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold transition ${
                  darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                🔄 Qayta boshlash
              </button>
            </div>
          </>
        ) : (
          <div className={`rounded-2xl p-8 shadow-xl text-center ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className={`text-2xl font-extrabold mb-8 ${darkMode ? "text-white" : "text-gray-900"}`}>Natijalar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { value: wpm, label: "WPM", color: "text-blue-400" },
                { value: `${accuracy}%`, label: "Aniqlik", color: "text-green-400" },
                { value: correctCount, label: "To'g'ri so'z", color: "text-yellow-400" },
                { value: wrongCount, label: "Xato so'z", color: "text-red-400" },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className={`mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {wpm < 20 ? "🐢 Boshlang'ich daraja — mashq qiling!" :
               wpm < 40 ? "🚶 O'rtacha tezlik — yaxshi boshlanish!" :
               wpm < 60 ? "🏃 Yaxshi tezlik — davom eting!" :
               wpm < 80 ? "🚀 Ajoyib! Professional darajaga yaqin!" :
               "⚡ Ustaxona! Siz professional teruvchisiz!"}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => reset()}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
                🔄 Qayta o'ynash
              </button>
              <button onClick={() => setShowLeaderboard(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                🏆 Top 10
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingGame;