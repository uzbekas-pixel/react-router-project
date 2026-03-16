import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "../../context/useLang";

const COLS = 10;
const ROWS = 20;
const CELL = 28;

const PIECES = [
  { shape: [[1,1,1,1]], color: "#06b6d4" },           // I
  { shape: [[1,1],[1,1]], color: "#eab308" },           // O
  { shape: [[0,1,0],[1,1,1]], color: "#a855f7" },       // T
  { shape: [[1,0,0],[1,1,1]], color: "#3b82f6" },       // J
  { shape: [[0,0,1],[1,1,1]], color: "#f97316" },       // L
  { shape: [[0,1,1],[1,1,0]], color: "#22c55e" },       // S
  { shape: [[1,1,0],[0,1,1]], color: "#ef4444" },       // Z
];

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomPiece = () => {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    shape: p.shape,
    color: p.color,
    x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
    y: 0,
  };
};

const rotate = (shape) => {
  const rows = shape.length;
  const cols = shape[0].length;
  return Array.from({ length: cols }, (_, i) =>
    Array.from({ length: rows }, (_, j) => shape[rows - 1 - j][i])
  );
};

const isValid = (board, shape, x, y) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r;
      const nc = x + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (board[nr][nc]) return false;
    }
  }
  return true;
};

const placePiece = (board, piece) => {
  const newBoard = board.map((r) => [...r]);
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) newBoard[piece.y + r][piece.x + c] = piece.color;
    });
  });
  return newBoard;
};

const clearLines = (board) => {
  const cleared = board.filter((row) => row.some((cell) => !cell));
  const linesCleared = ROWS - cleared.length;
  const newRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(null));
  return { board: [...newRows, ...cleared], lines: linesCleared };
};

const SCORES = [0, 100, 300, 500, 800];

const Tetris = ({ darkMode }) => {
  const { t } = useLang();
  const [board, setBoard] = useState(emptyBoard());
  const [piece, setPiece] = useState(null);
  const [next, setNext] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);

  boardRef.current = board;
  pieceRef.current = piece;
  runningRef.current = running;
  pausedRef.current = paused;


  // Canvas chizish
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = darkMode ? "#0f172a" : "#f1f5f9";
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    // Grid
    ctx.strokeStyle = darkMode ? "#1e293b" : "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
    }

    // Board
    boardRef.current.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillStyle = cell;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 4);
        }
      });
    });

    // Ghost piece
    const p = pieceRef.current;
    if (p) {
      let ghostY = p.y;
      while (isValid(boardRef.current, p.shape, p.x, ghostY + 1)) ghostY++;
      p.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect((p.x + c) * CELL + 1, (ghostY + r) * CELL + 1, CELL - 2, CELL - 2);
          }
        });
      });

      // Current piece
      p.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            ctx.fillStyle = p.color;
            ctx.fillRect((p.x + c) * CELL + 1, (p.y + r) * CELL + 1, CELL - 2, CELL - 2);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect((p.x + c) * CELL + 1, (p.y + r) * CELL + 1, CELL - 2, 4);
          }
        });
      });
    }
  }, [darkMode]);

  // Next piece canvas
  const drawNext = useCallback(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas || !next) return;
    const ctx = canvas.getContext("2d");
    const size = 24;
    ctx.fillStyle = darkMode ? "#1e293b" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const offX = Math.floor((4 - next.shape[0].length) / 2);
    const offY = Math.floor((4 - next.shape.length) / 2);
    next.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillStyle = next.color;
          ctx.fillRect((offX + c) * size + 1, (offY + r) * size + 1, size - 2, size - 2);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fillRect((offX + c) * size + 1, (offY + r) * size + 1, size - 2, 4);
        }
      });
    });
  }, [next, darkMode]);

  useEffect(() => { draw(); }, [board, piece, draw]);
  useEffect(() => { drawNext(); }, [next, drawNext]);

  const spawnPiece = useCallback((currentBoard, nextPiece) => {
    const newPiece = nextPiece || randomPiece();
    const newNext = randomPiece();
    if (!isValid(currentBoard, newPiece.shape, newPiece.x, newPiece.y)) {
      setRunning(false);
      setGameOver(true);
      return;
    }
    setPiece(newPiece);
    setNext(newNext);
  }, []);

  const lockPiece = useCallback(() => {
    const p = pieceRef.current;
    const b = boardRef.current;
    if (!p) return;
    const newBoard = placePiece(b, p);
    const { board: clearedBoard, lines: clearedLines } = clearLines(newBoard);
    setBoard(clearedBoard);
    setScore((s) => s + SCORES[clearedLines] * level);
    setLines((l) => {
      const newLines = l + clearedLines;
      setLevel(Math.floor(newLines / 10) + 1);
      return newLines;
    });
    spawnPiece(clearedBoard, null);
  }, [level, spawnPiece]);

  const tick = useCallback(() => {
    if (!runningRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (!p) return;
    if (isValid(boardRef.current, p.shape, p.x, p.y + 1)) {
      setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  useEffect(() => {
    if (running && !paused) {
      const speed = Math.max(100, 600 - (level - 1) * 50);
      intervalRef.current = setInterval(tick, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, paused, level, tick]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    const newBoard = emptyBoard();
    const firstPiece = randomPiece();
    const firstNext = randomPiece();
    setBoard(newBoard);
    setPiece(firstPiece);
    setNext(firstNext);
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setPaused(false);
    setRunning(true);
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (!runningRef.current || pausedRef.current) return;
      const p = pieceRef.current;
      if (!p) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isValid(boardRef.current, p.shape, p.x - 1, p.y)) setPiece((prev) => ({ ...prev, x: prev.x - 1 }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isValid(boardRef.current, p.shape, p.x + 1, p.y)) setPiece((prev) => ({ ...prev, x: prev.x + 1 }));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (isValid(boardRef.current, p.shape, p.x, p.y + 1)) setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
        else lockPiece();
      } else if (e.key === "ArrowUp" || e.key === "x") {
        e.preventDefault();
        const rotated = rotate(p.shape);
        if (isValid(boardRef.current, rotated, p.x, p.y)) setPiece((prev) => ({ ...prev, shape: rotated }));
      } else if (e.key === " ") {
        e.preventDefault();
        // Hard drop
        let newY = p.y;
        while (isValid(boardRef.current, p.shape, p.x, newY + 1)) newY++;
        setPiece((prev) => ({ ...prev, y: newY }));
        setTimeout(lockPiece, 0);
      } else if (e.key === "p" || e.key === "Escape") {
        setPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lockPiece]);

  // Touch controls
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !runningRef.current || pausedRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const p = pieceRef.current;
    if (!p) return;

    if (dt < 200 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      // Tap — rotate
      const rotated = rotate(p.shape);
      if (isValid(boardRef.current, rotated, p.x, p.y)) setPiece((prev) => ({ ...prev, shape: rotated }));
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      const steps = Math.round(dx / CELL);
      let newX = p.x;
      for (let i = 0; i < Math.abs(steps); i++) {
        const nx = newX + (steps > 0 ? 1 : -1);
        if (isValid(boardRef.current, p.shape, nx, p.y)) newX = nx;
      }
      if (newX !== p.x) setPiece((prev) => ({ ...prev, x: newX }));
    } else if (dy > 50) {
      // Swipe down — hard drop
      let newY = p.y;
      while (isValid(boardRef.current, p.shape, p.x, newY + 1)) newY++;
      setPiece((prev) => ({ ...prev, y: newY }));
      setTimeout(lockPiece, 0);
    }
    touchStartRef.current = null;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-2 py-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>🎮 Tetris</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
        {/* Canvas */}
        <div className="relative border-2 border-blue-500 rounded-xl overflow-hidden shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}>
          <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />

          {!running && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-xl font-extrabold">🎮 Tetris</p>
              <p className="text-gray-400 text-xs">{t.pcTetris}</p>
              <p className="text-gray-400 text-xs">{t.mobileTetris}</p>
              <button onClick={reset} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
                {t.start}
              </button>
            </div>
          )}

          {paused && running && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-2xl font-extrabold">⏸ {t.gamePaused}</p>
              <button onClick={() => setPaused(false)} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
                ▶ {t.resume}
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-2xl font-extrabold">{t.gameOver}</p>
              <p className="text-yellow-400 text-lg font-bold">{t.score}: {score}</p>
              <button onClick={reset} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
                {t.again}
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full md:w-40 justify-center md:justify-start flex-wrap md:flex-nowrap">
          {/* Next piece */}
          <div className={`rounded-xl p-2 md:p-4 ${darkMode ? "bg-slate-800" : "bg-white"} shadow flex flex-col items-center w-auto md:w-full`}>
            <p className={`text-[10px] md:text-xs font-semibold mb-1 md:mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.next}</p>
            <canvas ref={nextCanvasRef} width={72} height={72} className="rounded-lg md:w-28 md:h-28" />
          </div>

          {/* Stats group */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-4 w-auto md:w-full">
            <div className={`rounded-xl p-2 md:p-3 ${darkMode ? "bg-slate-800" : "bg-white"} shadow min-w-[70px] md:min-w-0 md:w-full`}>
              <p className={`text-[10px] md:text-xs font-semibold mb-0 md:mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.score}</p>
              <p className="text-blue-400 font-extrabold text-sm md:text-lg">{score}</p>
            </div>
            <div className={`rounded-xl p-2 md:p-3 ${darkMode ? "bg-slate-800" : "bg-white"} shadow min-w-[70px] md:min-w-0 md:w-full`}>
              <p className={`text-[10px] md:text-xs font-semibold mb-0 md:mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.lines}</p>
              <p className="text-green-400 font-extrabold text-sm md:text-lg">{lines}</p>
            </div>
            <div className={`rounded-xl p-2 md:p-3 ${darkMode ? "bg-slate-800" : "bg-white"} shadow min-w-[70px] md:min-w-0 md:w-full`}>
              <p className={`text-[10px] md:text-xs font-semibold mb-0 md:mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.level}</p>
              <p className="text-yellow-400 font-extrabold text-sm md:text-lg">{level}</p>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-full">
            {running && (
              <button onClick={() => setPaused((p) => !p)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {paused ? "▶" : "⏸"}
              </button>
            )}
            <button onClick={reset}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t.again}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="mt-4 md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {[
            [null, { label: "↑", action: () => {
              const p = pieceRef.current;
              if (!p || !runningRef.current || pausedRef.current) return;
              const rotated = rotate(p.shape);
              if (isValid(boardRef.current, rotated, p.x, p.y)) setPiece((prev) => ({ ...prev, shape: rotated }));
            }}, null],
            [{ label: "←", action: () => {
              const p = pieceRef.current;
              if (!p || !runningRef.current || pausedRef.current) return;
              if (isValid(boardRef.current, p.shape, p.x - 1, p.y)) setPiece((prev) => ({ ...prev, x: prev.x - 1 }));
            }}, { label: "⬇", action: () => {
              const p = pieceRef.current;
              if (!p || !runningRef.current || pausedRef.current) return;
              let newY = p.y;
              while (isValid(boardRef.current, p.shape, p.x, newY + 1)) newY++;
              setPiece((prev) => ({ ...prev, y: newY }));
              setTimeout(lockPiece, 0);
            }}, { label: "→", action: () => {
              const p = pieceRef.current;
              if (!p || !runningRef.current || pausedRef.current) return;
              if (isValid(boardRef.current, p.shape, p.x + 1, p.y)) setPiece((prev) => ({ ...prev, x: prev.x + 1 }));
            }}],
          ].map((row, ri) => row.map((btn, ci) => (
            <div key={`${ri}-${ci}`} className="flex items-center justify-center">
              {btn ? (
                <button onTouchStart={(e) => { e.preventDefault(); btn.action(); }}
                  className={`w-16 h-16 rounded-2xl text-2xl flex items-center justify-center active:scale-90 active:bg-blue-500/20 shadow-lg transition ${darkMode ? "bg-slate-700 text-white" : "bg-white text-gray-700"}`}>
                  {btn.label}
                </button>
              ) : <div className="w-16 h-16" />}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export default Tetris;