import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "../../context/useLang";
import { useAuth } from "../../context/useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FaRedo, FaTrophy, FaBullseye } from "react-icons/fa";

const SIZE = 4;

const initBoard = () => {
  const board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
  return addRandom(addRandom(board));
};

const addRandom = (board) => {
  const empty = [];
  board.forEach((row, r) => row.forEach((cell, c) => { if (!cell) empty.push([r, c]); }));
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const slideRow = (row) => {
  const nums = row.filter(x => x);
  const merged = [];
  let score = 0, i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      merged.push(nums[i] * 2);
      score += nums[i] * 2;
      i += 2;
    } else {
      merged.push(nums[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
};

const moveBoard = (board, dir) => {
  let newBoard = board.map(r => [...r]);
  let totalScore = 0, moved = false;
  const process = (rows) => rows.map(row => {
    const { row: newRow, score } = slideRow(row);
    totalScore += score;
    if (newRow.some((v, i) => v !== row[i])) moved = true;
    return newRow;
  });
  if (dir === "left") newBoard = process(newBoard);
  else if (dir === "right") newBoard = process(newBoard.map(r => [...r].reverse())).map(r => r.reverse());
  else if (dir === "up") { let t = newBoard[0].map((_, c) => newBoard.map(r => r[c])); t = process(t); newBoard = t[0].map((_, c) => t.map(r => r[c])); }
  else if (dir === "down") { let t = newBoard[0].map((_, c) => newBoard.map(r => r[c])).map(r => [...r].reverse()); t = process(t); t = t.map(r => [...r].reverse()); newBoard = t[0].map((_, c) => t.map(r => r[c])); }
  return { board: newBoard, score: totalScore, moved };
};

const isGameOver = (board) => {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return false;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return false;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return false;
    }
  return true;
};

const TILE_COLORS = {
  0: { bg: "bg-slate-700/50", text: "" }, 2: { bg: "bg-slate-500", text: "text-white" },
  4: { bg: "bg-slate-400", text: "text-white" }, 8: { bg: "bg-orange-400", text: "text-white" },
  16: { bg: "bg-orange-500", text: "text-white" }, 32: { bg: "bg-orange-600", text: "text-white" },
  64: { bg: "bg-red-500", text: "text-white" }, 128: { bg: "bg-yellow-400", text: "text-white" },
  256: { bg: "bg-yellow-500", text: "text-white" }, 512: { bg: "bg-yellow-600", text: "text-white" },
  1024: { bg: "bg-green-500", text: "text-white" }, 2048: { bg: "bg-blue-500", text: "text-white" },
};

const getColor = (val) => TILE_COLORS[val] || { bg: "bg-blue-700", text: "text-white" };
const getFontSize = (val) => val >= 1024 ? "text-lg" : val >= 128 ? "text-xl" : "text-2xl";

const Game2048 = ({ darkMode }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [board, setBoard]       = useState(initBoard);
  const [score, setScore]       = useState(0);
  const [best, setBest]         = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon]           = useState(false);
  const [wonDismissed, setWonDismissed] = useState(false);
  const touchStart = useRef(null);

  // Firebase dan best score yuklash
useEffect(() => {
  if (!user) {
    setTimeout(() => {
      setBest(parseInt(localStorage.getItem("2048_best") || "0"));
    }, 0);
    return;
  }
  getDoc(doc(db, "users", user.uid, "data", "gamesBest"))
    .then((snap) => {
      if (snap.exists()) setBest(snap.data().game2048 || 0);
    })
    .catch(() => {});
}, [user]);

// Best score saqlash — useCallback bilan
const saveBest = useCallback(async (newBest) => {
  if (!user) {
    localStorage.setItem("2048_best", String(newBest));
    return;
  }
  try {
    await setDoc(
      doc(db, "users", user.uid, "data", "gamesBest"),
      { game2048: newBest },
      { merge: true }
    );
  } catch (err) { console.error(err); }
}, [user]);

const move = useCallback((dir) => {
  if (gameOver) return;
  const { board: newBoard, score: gained, moved } = moveBoard(board, dir);
  if (!moved) return;
  const withNew = addRandom(newBoard);
  setBoard(withNew);
  setScore(prev => {
    const next = prev + gained;
    if (next > best) {
      setBest(next);
      saveBest(next); // ← endi ishlaydi
    }
    return next;
  });
  if (withNew.some(row => row.includes(2048)) && !wonDismissed) setWon(true);
  if (isGameOver(withNew)) setGameOver(true);
}, [board, gameOver, best, wonDismissed, saveBest]); // ← saveBest qo'shildi

  useEffect(() => {
    const handleKey = (e) => {
      const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  const reset = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setWonDismissed(false);
  };

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-2xl font-extrabold mb-4 flex items-center justify-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
        <FaBullseye className="text-red-500" /> 2048
      </h2>

      <div className="flex gap-3 mb-4">
        {[{ label: t.score, value: score }, { label: t.bestScore, value: best }].map((s) => (
          <div key={s.label} className={`px-6 py-2 rounded-xl text-center min-w-[90px] ${darkMode ? "bg-slate-800" : "bg-white shadow"}`}>
            <p className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            <p className={`text-xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>{s.value}</p>
          </div>
        ))}
        <button onClick={reset} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${darkMode ? "bg-slate-800 text-gray-300 hover:bg-slate-700" : "bg-white text-gray-600 hover:bg-gray-100 shadow"}`}>
          <FaRedo /> {t.again}
        </button>
      </div>

      <div className={`relative p-3 rounded-2xl select-none ${darkMode ? "bg-slate-800" : "bg-gray-200"}`}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {board.map((row, r) => row.map((val, c) => {
            const { bg, text } = getColor(val);
            return (
              <div key={`${r}-${c}`} className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center font-extrabold transition-all duration-100 ${bg} ${text} ${getFontSize(val)}`}>
                {val !== 0 ? val : ""}
              </div>
            );
          }))}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold">{t.gameOver}</p>
            <p className="text-yellow-400 text-lg font-bold">{t.score}: {score}</p>
            <button onClick={reset} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-xl flex items-center gap-2">
              <FaRedo /> {t.again}
            </button>
          </div>
        )}

        {won && !wonDismissed && (
          <div className="absolute inset-0 bg-yellow-500/80 rounded-2xl flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold flex items-center gap-2" style={{ textShadow:"1px 1px 2px rgba(0,0,0,0.3)"}}>
              <FaTrophy /> 2048!
            </p>
            <p className="text-white text-sm" style={{ textShadow:"1px 1px 2px rgba(0,0,0,0.3)"}}>{t.continueGame}</p>
            <div className="flex gap-2">
              <button onClick={() => { setWonDismissed(true); setWon(false); }} className="px-4 py-2 bg-white text-yellow-600 font-semibold rounded-xl text-sm flex items-center gap-1">
                <FaTrophy /> {t.continueBtn}
              </button>
              <button onClick={reset} className="px-4 py-2 bg-yellow-700 text-white font-semibold rounded-xl text-sm flex items-center gap-1">
                <FaRedo /> {t.again}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className={`mt-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
        {t.pcControls} | {t.mobileControls}
      </p>
    </div>
  );
};

export default Game2048;