import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "../../context/useLang";
import { saveScore } from "./Gameutils";
import Leaderboard from "./Leaderboard";
import { useAuth } from "../../context/useAuth";

const W = 320;
const H = 480;
const BIRD_X = 60;
const BIRD_R = 12;
const PIPE_W = 50;
const GAP = 140;
const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_SPEED = 3;

const FlappyBird = ({ darkMode }) => {
  const { t } = useLang();
  const canvasRef = useRef(null);
  const state = useRef({
    bird: { y: H / 2, vy: 0 },
    pipes: [],
    score: 0,
    running: false,
    gameOver: false,
    frame: 0,
  });
  const rafRef = useRef(null);
  const [display, setDisplay] = useState({ score: 0, running: false, gameOver: false });
  const { user } = useAuth();

  const jump = useCallback(() => {
    const s = state.current;
    if (!s.running && !s.gameOver) {
      s.running = true;
      s.bird = { y: H / 2, vy: 0 };
      s.pipes = [];
      s.score = 0;
      s.frame = 0;
      setDisplay({ score: 0, running: true, gameOver: false });
    }
    if (s.running) s.bird.vy = JUMP;
  }, []);

  const reset = useCallback(() => {
    state.current = { bird: { y: H / 2, vy: 0 }, pipes: [], score: 0, running: false, gameOver: false, frame: 0 };
    setDisplay({ score: 0, running: false, gameOver: false });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const s = state.current;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = darkMode ? "#0f172a" : "#bfdbfe";
      ctx.fillRect(0, 0, W, H);

      if (s.running) {
        s.frame++;
        s.bird.vy += GRAVITY;
        s.bird.y += s.bird.vy;

        // Pipe yaratish
        if (s.frame % 90 === 0) {
          const top = Math.random() * (H - GAP - 100) + 50;
          s.pipes.push({ x: W, top, passed: false });
        }

        // Pipe harakat
        s.pipes.forEach((p) => {
          p.x -= PIPE_SPEED;
          if (!p.passed && p.x + PIPE_W < BIRD_X) {
            p.passed = true;
            s.score++;
            setDisplay((d) => ({ ...d, score: s.score }));
          }
        });
        s.pipes = s.pipes.filter((p) => p.x + PIPE_W > 0);

        // Collision
        const birdTop = s.bird.y - BIRD_R;
        const birdBot = s.bird.y + BIRD_R;
        if (birdBot > H || birdTop < 0) {
          s.running = false;
          s.gameOver = true;
          setDisplay({ score: s.score, running: false, gameOver: true });
        }
        s.pipes.forEach((p) => {
          if (BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W) {
            if (birdTop < p.top || birdBot > p.top + GAP) {
              s.running = false;
              s.gameOver = true;
              setDisplay({ score: s.score, running: false, gameOver: true });
              if (user) {
                saveScore(user, "flappy", s.score);
              }
            }
          }
        });
      }

      // Pipes draw
      s.pipes.forEach((p) => {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(p.x - 4, p.top - 20, PIPE_W + 8, 20);
        ctx.fillRect(p.x - 4, p.top + GAP, PIPE_W + 8, 20);
      });

      // Bird
      ctx.font = `${BIRD_R * 2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const angle = Math.min(Math.max(s.bird.vy * 0.05, -0.5), 1);
      ctx.save();
      ctx.translate(BIRD_X, s.bird.y);
      ctx.rotate(angle);
      ctx.fillText("🐦", 0, 0);
      ctx.restore();

      // Score
      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.score, W / 2, 40);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [darkMode, user]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
        🐦 Flappy Bird
      </h2>

      <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-blue-400"
        style={{ width: W, height: H }}
        onPointerDown={(e) => { e.preventDefault(); jump(); }}>
        <canvas ref={canvasRef} width={W} height={H} />

        {!display.running && !display.gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold">🐦 Flappy Bird</p>
            <p className="text-gray-300 text-sm">{t.clickOrSpace}</p>
            <button onClick={jump} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-xl">
              {t.start}
            </button>
          </div>
        )}

        {display.gameOver && (
          
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <p className="text-white text-2xl font-extrabold">{t.gameOver}</p>
            <p className="text-yellow-400 text-lg font-bold">{t.score}: {display.score}</p>
            {user && (

              <button
                onClick={() => saveScore(user, "flappy", display.score)}
                className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl"
              >
                {t.saveScore}
              </button>
            )}
            <button onClick={reset} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-xl">
              {t.again}
            </button>
          </div>
        )}
      </div>
      <Leaderboard darkMode={darkMode} game="flappy" />
      <p className={`mt-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
        {t.pcControls} | {t.mobileControls}
      </p>
    </div>
  );
};

export default FlappyBird;