import { useState, useEffect, useCallback } from "react";
import { useLang } from "../../context/useLang";
import { useAuth } from "../../context/useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FaRedo, FaTrophy } from "react-icons/fa";

const EMOJI_SETS = {
  animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮"],
  food:    ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥝","🍕","🍔","🌮","🍜"],
  sports:  ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🎿"],
};

const LEVELS = [
  { id: "easy",   label: "Oson",  pairs: 6,  cols: 3 },
  { id: "medium", label: "O'rta", pairs: 8,  cols: 4 },
  { id: "hard",   label: "Qiyin", pairs: 12, cols: 4 },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const createCards = (pairs, theme) => {
  const emojis = shuffle(EMOJI_SETS[theme]).slice(0, pairs);
  return shuffle([...emojis, ...emojis].map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false,
  })));
};

const MemoryCard = ({ darkMode }) => {
  const { t }    = useLang();
  const { user } = useAuth();

  const [level,     setLevel]     = useState(LEVELS[0]);
  const [theme,     setTheme]     = useState("animals");
  const [cards,     setCards]     = useState(() => createCards(LEVELS[0].pairs, "animals"));
  const [selected,  setSelected]  = useState([]);
  const [moves,     setMoves]     = useState(0);
  const [time,      setTime]      = useState(0);
  const [running,   setRunning]   = useState(false);
  const [won,       setWon]       = useState(false);
  const [bestMoves, setBestMoves] = useState({});

  // Firebase dan best yuklash
useEffect(() => {
  if (!user) {
    setTimeout(() => {
      try {
        setBestMoves(JSON.parse(localStorage.getItem("memory_best") || "{}"));
      } catch {
        setBestMoves({});
      }
    }, 0);
    return;
  }
  getDoc(doc(db, "users", user.uid, "data", "gamesBest"))
    .then((snap) => {
      if (snap.exists()) setBestMoves(snap.data().memory || {});
    })
    .catch(() => {});
}, [user]);
  // Best saqlash — useCallback bilan
  const saveBest = useCallback(async (key, value) => {
    const updated = { ...bestMoves, [key]: value };
    setBestMoves(updated);
    if (!user) {
      localStorage.setItem("memory_best", JSON.stringify(updated));
      return;
    }
    try {
      await setDoc(
        doc(db, "users", user.uid, "data", "gamesBest"),
        { memory: updated },
        { merge: true }
      );
    } catch (err) { console.error(err); }
  }, [user, bestMoves]);

  // Timer
  useEffect(() => {
    if (!running || won) return;
    const id = setInterval(() => setTime(p => p + 1), 1000);
    return () => clearInterval(id);
  }, [running, won]);

  // 2 ta karta tanlanganda tekshirish
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    if (cards[a].emoji === cards[b].emoji) {
      const timer = setTimeout(() => {
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, matched: true, flipped: true } : c
        ));
        setSelected([]);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, flipped: false } : c
        ));
        setSelected([]);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [selected, cards]);

  // G'alaba tekshirish
  useEffect(() => {
    if (!cards.length || !cards.every(c => c.matched)) return;
    const timer = setTimeout(async () => {
      setWon(true);
      setRunning(false);
      const key      = `${level.id}_${theme}`;
      const prevBest = bestMoves[key];
      if (!prevBest || moves < prevBest) {
        await saveBest(key, moves);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [cards, bestMoves, moves, level, theme, saveBest]);

  const handleClick = (idx) => {
    if (won || selected.length === 2) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (!running) setRunning(true);
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c));
    setSelected(prev => {
      if (prev.length === 1) setMoves(m => m + 1);
      return [...prev, idx];
    });
  };

  const reset = useCallback((newLevel = level, newTheme = theme) => {
    setCards(createCards(newLevel.pairs, newTheme));
    setSelected([]);
    setMoves(0);
    setTime(0);
    setRunning(false);
    setWon(false);
  }, [level, theme]);

  const changeLevel = (l) => { setLevel(l); reset(l, theme); };
  const changeTheme = (th) => { setTheme(th); reset(level, th); };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const matched = cards.filter(c => c.matched).length / 2;
  const bestKey = `${level.id}_${theme}`;

  return (
    <div className={`flex flex-col items-center min-h-[calc(100vh-130px)] px-4 py-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-2xl font-extrabold mb-3 mx-auto mt-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
        🧠 Memory Card
      </h2>

      <div className="flex gap-2 mb-3">
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => changeLevel(l)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              level.id === l.id
                ? "bg-blue-500 text-white"
                : darkMode ? "bg-slate-700 text-gray-400 hover:bg-slate-600" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {Object.keys(EMOJI_SETS).map(th => (
          <button key={th} onClick={() => changeTheme(th)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              theme === th
                ? "bg-purple-500 text-white"
                : darkMode ? "bg-slate-700 text-gray-400 hover:bg-slate-600" : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}>
            {th === "animals" ? "🐾 Hayvonlar" : th === "food" ? "🍎 Ovqat" : "⚽ Sport"}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        {[
          { label: "Harakat", value: moves },
          { label: "Vaqt",    value: formatTime(time) },
          { label: "Juft",    value: `${matched}/${level.pairs}` },
          { label: "Rekord",  value: bestMoves[bestKey] ? `${bestMoves[bestKey]}h` : "—" },
        ].map(s => (
          <div key={s.label} className={`px-3 py-2 rounded-xl text-center min-w-[60px] ${darkMode ? "bg-slate-800" : "bg-white shadow"}`}>
            <p className={`text-[10px] font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            <p className={`text-sm font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>{s.value}</p>
          </div>
        ))}
        <button onClick={() => reset()}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
            darkMode ? "bg-slate-800 text-gray-300 hover:bg-slate-700" : "bg-white text-gray-600 hover:bg-gray-100 shadow"
          }`}>
          <FaRedo /> {t.again}
        </button>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)` }}>
        {cards.map((card, idx) => (
          <button key={card.id} onClick={() => handleClick(idx)}
            className={`relative rounded-2xl transition-all duration-300 select-none ${
              card.matched ? "opacity-40 cursor-default" : "cursor-pointer hover:scale-105 active:scale-95"
            }`}
            style={{ width: level.id === "hard" ? 64 : 72, height: level.id === "hard" ? 64 : 72 }}>
            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
              card.flipped || card.matched ? "opacity-0 scale-90" : "opacity-100 scale-100"
            } ${darkMode ? "bg-slate-700 border-2 border-slate-600" : "bg-blue-100 border-2 border-blue-200"}`}>
              ❓
            </div>
            <div className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${
              card.flipped || card.matched ? "opacity-100 scale-100" : "opacity-0 scale-90"
            } ${
              card.matched
                ? darkMode ? "bg-green-900/50 border-2 border-green-600" : "bg-green-100 border-2 border-green-400"
                : darkMode ? "bg-slate-600 border-2 border-slate-500" : "bg-white border-2 border-gray-200 shadow"
            }`}>
              {card.emoji}
            </div>
          </button>
        ))}
      </div>

      {won && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className={`text-2xl font-extrabold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Barakalla!
            </h3>
            <div className="flex justify-center gap-4 mb-6">
              <div className={`px-4 py-2 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Harakat</p>
                <p className="text-xl font-extrabold text-blue-400">{moves}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Vaqt</p>
                <p className="text-xl font-extrabold text-green-400">{formatTime(time)}</p>
              </div>
            </div>
            <button onClick={() => reset()}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 mx-auto">
              <FaRedo /> {t.again}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryCard;