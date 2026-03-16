import { useState } from "react";
import TypingGame from "./TypingGame";
import MultiTyping from "./MultiTyping";
import SnakeGame from "../components/games/SnakeGame";
import FlappyBird from "../components/games/FlappyBird";
import TicTacToe from "../components/games/TicTacToe";
import Tetris from "../components/games/Tetris";
import { useLang } from "../context/useLang";

const BackButton = ({ onClick, darkMode, t }) => (
  <button onClick={onClick}
    className={`fixed top-8 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition mt-2 ${
      darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-gray-700 hover:bg-gray-100 shadow"
    }`}>
    {t.back}
  </button>
);

const Games = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("typing");

  const GAMES = [
    { id: "snake", icon: "🐍", title: "Snake", desc: t.snakeDesc, color: "from-green-500 to-emerald-600" },
    { id: "flappy", icon: "🐦", title: "Flappy Bird", desc: t.flappyDesc, color: "from-yellow-500 to-orange-500" },
    { id: "tictactoe", icon: "❌", title: "Tic-Tac-Toe", desc: t.ticDesc, color: "from-purple-500 to-pink-500" },
    { id: "tetris", icon: "🧱", title: "Tetris", desc: t.tetrisDesc, color: "from-red-500 to-rose-500" },
  ];


  if (screen === "snake") return (
    <div className="page-transition">
      <BackButton onClick={() => setScreen("home")} darkMode={darkMode} t={t} />
      <div className="pt-12"><SnakeGame darkMode={darkMode} /></div>
    </div>
  );

  if (screen === "flappy") return (
    <div className="page-transition">
      <BackButton onClick={() => setScreen("home")} darkMode={darkMode} t={t} />
      <div className="pt-12"><FlappyBird darkMode={darkMode} /></div>
    </div>
  );

  if (screen === "tictactoe") return (
    <div className="page-transition">
      <BackButton onClick={() => setScreen("home")} darkMode={darkMode} t={t} />
      <div className="pt-12"><TicTacToe darkMode={darkMode} /></div>
    </div>
  );
  if (screen === "tetris") return (
  <div className="page-transition">
    <BackButton onClick={() => setScreen("home")} darkMode={darkMode} t={t} />
    <div className="pt-12"><Tetris darkMode={darkMode} /></div>
  </div>
);

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] px-4 py-6 mt-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {t.gamesTitle}
      </h1>

      {/* Typing + Multiplayer */}
      <div className={`rounded-2xl overflow-hidden shadow mb-6 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className={`flex border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          <button onClick={() => setTab("typing")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "typing" ? "text-blue-500 border-b-2 border-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
            ⌨️ {t.typingTitle}
          </button>
          <button onClick={() => setTab("multi")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "multi" ? "text-blue-500 border-b-2 border-blue-500" : darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
            {t.multiTitle}
          </button>
        </div>
        <div>
          {tab === "typing" && <TypingGame darkMode={darkMode} />}
          {tab === "multi" && <MultiTyping darkMode={darkMode} showToast={showToast} />}
        </div>
      </div>

      {/* Arcade o'yinlar */}
      <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {t.arcadeGames}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <button key={game.id} onClick={() => setScreen(game.id)}
            className="relative rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 text-left">
            <div className={`bg-linear-to-br ${game.color} p-6 flex flex-col gap-2`}>
              <span className="text-5xl">{game.icon}</span>
              <h3 className="text-white text-lg font-extrabold">{game.title}</h3>
              <p className="text-white/80 text-sm">{game.desc}</p>
              <span className="mt-2 inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit">
                {t.play}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Games;