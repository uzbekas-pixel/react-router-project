import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "../../context/useLang";

const GRID = 20;
const CELL = 20;

const SnakeGame = ({ darkMode }) => {
  const { t } = useLang();
  const canvasRef = useRef(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    dir: { x: 1, y: 0 },
    running: false,
    gameOver: false,
    score: 0,
    speed: 150,
  });
  const intervalRef = useRef(null);
  const touchStart = useRef(null);
  const [display, setDisplay] = useState({ score: 0, running: false, gameOver: false, speed: 150 });

  const randomFood = (snakeBody) => {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (snakeBody.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    // Background
    ctx.fillStyle = darkMode ? "#0f172a" : "#f1f5f9";
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Grid lines
    ctx.strokeStyle = darkMode ? "#1e293b" : "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    // Food
    ctx.font = `${CELL - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2);

    // Snake
    s.snake.forEach((seg, i) => {
      if (i === 0) {
        ctx.fillStyle = "#4ade80";
      } else {
        const ratio = 1 - (i / s.snake.length) * 0.5;
        ctx.fillStyle = `rgba(22, 163, 74, ${ratio})`;
      }
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();

      // Ko'z
      if (i === 0) {
        ctx.fillStyle = "black";
        const ex = s.dir.x === 1 ? 4 : s.dir.x === -1 ? -4 : 0;
        const ey = s.dir.y === 1 ? 4 : s.dir.y === -1 ? -4 : 0;
        ctx.beginPath();
        ctx.arc(seg.x * CELL + CELL / 2 + ex + (s.dir.y !== 0 ? 3 : 0),
          seg.y * CELL + CELL / 2 + ey + (s.dir.x !== 0 ? -3 : 0), 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(seg.x * CELL + CELL / 2 + ex - (s.dir.y !== 0 ? 3 : 0),
          seg.y * CELL + CELL / 2 + ey - (s.dir.x !== 0 ? -3 : 0), 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [darkMode]);

  const move = useCallback(function moveInternal() {
    const s = stateRef.current;
    if (!s.running) return;

    const head = {
      x: s.snake[0].x + s.dir.x,
      y: s.snake[0].y + s.dir.y,
    };

    // Devor
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      s.running = false;
      s.gameOver = true;
      setDisplay({ score: s.score, running: false, gameOver: true, speed: s.speed });
      clearInterval(intervalRef.current);
      drawCanvas();
      return;
    }

    // O'z-o'ziga
    if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      s.running = false;
      s.gameOver = true;
      setDisplay({ score: s.score, running: false, gameOver: true, speed: s.speed });
      clearInterval(intervalRef.current);
      drawCanvas();
      return;
    }

    const newSnake = [head, ...s.snake];

    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 1;
      s.food = randomFood(newSnake);
      if (s.score % 5 === 0) {
        s.speed = Math.max(60, s.speed - 15);
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(moveInternal, s.speed);
      }
      setDisplay({ score: s.score, running: true, gameOver: false, speed: s.speed });
    } else {
      newSnake.pop();
    }

    s.snake = newSnake;
    drawCanvas();
  }, [drawCanvas]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    const initSnake = [{ x: 10, y: 10 }];
    stateRef.current = {
      snake: initSnake,
      food: randomFood(initSnake),
      dir: { x: 1, y: 0 },
      running: true,
      gameOver: false,
      score: 0,
      speed: 150,
    };
    setDisplay({ score: 0, running: true, gameOver: false, speed: 150 });
    intervalRef.current = setInterval(move, 150);
    drawCanvas();
  }, [move, drawCanvas]);

  // Canvas chizish
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Klaviatura
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
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      const cur = stateRef.current.dir;
      if (newDir.x === -cur.x && newDir.y === -cur.y) return;
      stateRef.current.dir = newDir;
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearInterval(intervalRef.current);
    };
  }, []);

  const swipe = (dx, dy) => {
    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    const cur = stateRef.current.dir;
    if (newDir.x === -cur.x && newDir.y === -cur.y) return;
    stateRef.current.dir = newDir;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Score */}
      <div className="flex items-center justify-between w-full max-w-xs mb-4">
        <h2 className={`text-xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>🐍 Snake</h2>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {t.score}: {display.score}
          </span>
          <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {Math.round(1000 / display.speed)}x
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative border-2 border-blue-500 rounded-xl overflow-hidden shadow-xl"
        style={{ width: GRID * CELL, height: GRID * CELL }}
        onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          if (!touchStart.current) return;
          swipe(
            e.changedTouches[0].clientX - touchStart.current.x,
            e.changedTouches[0].clientY - touchStart.current.y
          );
          touchStart.current = null;
        }}
      >
        <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} />

        {/* Start overlay */}
        {!display.running && !display.gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-xl font-extrabold">🐍 Snake</p>
<p className="text-gray-400 text-xs">{t.pcControls}</p>
<p className="text-gray-400 text-xs">{t.mobileControls}</p>
            <button onClick={reset}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition">
             {t.start}
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {display.gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold">{t.gameOver}</p>
<p className="text-yellow-400 text-lg font-bold">{t.score}: {display.score}</p>
            <button onClick={reset}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition">
              {t.again}
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 md:hidden">
        {[
          [null, { label: "⬆️", d: { x: 0, y: -1 } }, null],
          [{ label: "⬅️", d: { x: -1, y: 0 } }, null, { label: "➡️", d: { x: 1, y: 0 } }],
          [null, { label: "⬇️", d: { x: 0, y: 1 } }, null],
        ].map((row, ri) => row.map((btn, ci) => (
          <div key={`${ri}-${ci}`} className="flex items-center justify-center">
            {btn ? (
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  const cur = stateRef.current.dir;
                  if (btn.d.x === -cur.x && btn.d.y === -cur.y) return;
                  stateRef.current.dir = btn.d;
                }}
                className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center active:scale-95 transition ${
                  darkMode ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-700"
                }`}>
                {btn.label}
              </button>
            ) : <div className="w-14 h-14" />}
          </div>
        )))}
      </div>
    </div>
  );
};

export default SnakeGame;