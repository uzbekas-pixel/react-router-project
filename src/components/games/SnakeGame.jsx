import { useState, useEffect, useRef, useCallback } from "react";

const GRID = 20;
const CELL = 20;

const SnakeGame = ({ darkMode }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(150);
  const dirRef = useRef({ x: 1, y: 0 });
  const intervalRef = useRef(null);

  const randomFood = useCallback((snakeBody) => {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (snakeBody.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const reset = () => {
    const initSnake = [{ x: 10, y: 10 }];
    setSnake(initSnake);
    setFood(randomFood(initSnake));
    dirRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    setSpeed(150);
    setRunning(true);
  };

  const move = useCallback(() => {
    setSnake((prev) => {
      const head = {
        x: prev[0].x + dirRef.current.x,
        y: prev[0].y + dirRef.current.y,
      };

      // Devor
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        setRunning(false);
        setGameOver(true);
        return prev;
      }

      // O'z-o'ziga
      if (prev.some((s) => s.x === head.x && s.y === head.y)) {
        setRunning(false);
        setGameOver(true);
        return prev;
      }

      const newSnake = [head, ...prev];

      setFood((f) => {
        if (head.x === f.x && head.y === f.y) {
          setScore((s) => {
            const newScore = s + 1;
            if (newScore % 5 === 0) setSpeed((sp) => Math.max(60, sp - 15));
            return newScore;
          });
          return randomFood(newSnake);
        }
        newSnake.pop();
        return f;
      });

      return newSnake;
    });
  }, [randomFood]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(move, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed, move]);

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const newDir = map[e.key];
      if (!newDir) return;
      if (newDir.x === -dirRef.current.x && newDir.y === -dirRef.current.y) return;
      dirRef.current = newDir;
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const swipe = (dx, dy) => {
    const map = [
      [{ x: 1, y: 0 }, { x: -1, y: 0 }],
      [{ x: 0, y: 1 }, { x: 0, y: -1 }],
    ];
    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? map[0][0] : map[0][1];
    } else {
      newDir = dy > 0 ? map[1][0] : map[1][1];
    }
    if (newDir.x === -dirRef.current.x && newDir.y === -dirRef.current.y) return;
    dirRef.current = newDir;
  };

  const touchStart = useRef(null);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <h2 className={`text-xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>🐍 Snake</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Score: {score}</span>
          <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Tezlik: {Math.round(1000/speed)}x</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative border-2 border-blue-500 rounded-xl overflow-hidden"
        style={{ width: GRID * CELL, height: GRID * CELL }}
        onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          if (!touchStart.current) return;
          swipe(e.changedTouches[0].clientX - touchStart.current.x, e.changedTouches[0].clientY - touchStart.current.y);
        }}
      >
        <div className={`absolute inset-0 ${darkMode ? "bg-slate-900" : "bg-gray-100"}`} />

        {/* Snake */}
        {snake.map((s, i) => (
          <div key={i} className={`absolute rounded-sm transition-none ${i === 0 ? "bg-green-400" : "bg-green-600"}`}
            style={{ left: s.x * CELL, top: s.y * CELL, width: CELL - 1, height: CELL - 1 }} />
        ))}

        {/* Food */}
        <div className="absolute text-center" style={{ left: food.x * CELL, top: food.y * CELL, width: CELL, height: CELL, fontSize: CELL - 2 }}>
          🍎
        </div>

        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold">💀 Game Over</p>
            <p className="text-gray-300 text-sm">Score: {score}</p>
            <button onClick={reset} className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl">
              🔄 Qayta
            </button>
          </div>
        )}

        {/* Start overlay */}
        {!running && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-xl font-extrabold">🐍 Snake</p>
            <p className="text-gray-400 text-xs">PC: WASD yoki arrow keys</p>
            <p className="text-gray-400 text-xs">Telefon: swipe</p>
            <button onClick={reset} className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl">
              ▶ Boshlash
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
        {[
          [null, { label: "⬆", d: { x: 0, y: -1 } }, null],
          [{ label: "⬅", d: { x: -1, y: 0 } }, null, { label: "➡", d: { x: 1, y: 0 } }],
          [null, { label: "⬇", d: { x: 0, y: 1 } }, null],
        ].map((row, ri) => row.map((btn, ci) => (
          <div key={`${ri}-${ci}`}>
            {btn ? (
              <button
                onTouchStart={(e) => { e.preventDefault(); if (btn.d.x === -dirRef.current.x && btn.d.y === -dirRef.current.y) return; dirRef.current = btn.d; }}
                className={`w-12 h-12 rounded-xl text-xl font-bold flex items-center justify-center ${darkMode ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-700"}`}>
                {btn.label}
              </button>
            ) : <div className="w-12 h-12" />}
          </div>
        )))}
      </div>
    </div>
  );
};

export default SnakeGame;