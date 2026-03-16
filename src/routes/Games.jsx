import { useState } from "react";
import TypingGame from "./TypingGame";
import MultiTyping from "./MultiTyping";
import SnakeGame from "../components/games/SnakeGame";
import FlappyBird from "../components/games/FlappyBird";
import TicTacToe from "../components/games/TicTacToe";

const Games = ({ darkMode, showToast }) => {
  const [tab, setTab] = useState("typing");

  const tabs = [
    { id: "typing", label: "⌨️", title: "Typing" },
    { id: "multi", label: "👥", title: "Multi" },
    { id: "snake", label: "🐍", title: "Snake" },
    { id: "flappy", label: "🐦", title: "Flappy" },
    { id: "tictactoe", label: "❌", title: "XO" },
  ];

  return (
    <div className="page-transition">
      {/* Tab bar */}
      <div className={`fixed top-16 left-0 w-full z-40 flex border-b overflow-x-auto ${
        darkMode ? "bg-gray-900 border-slate-700" : "bg-gray-50 border-gray-200"
      }`}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[60px] py-2.5 text-xs font-semibold transition whitespace-nowrap ${
              tab === t.id
                ? "text-blue-500 border-b-2 border-blue-500"
                : darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
            {t.label} {t.title}
          </button>
        ))}
      </div>

      <div className="pt-10">
        {tab === "typing" && <TypingGame darkMode={darkMode} />}
        {tab === "multi" && <MultiTyping darkMode={darkMode} showToast={showToast} />}
        {tab === "snake" && <SnakeGame darkMode={darkMode} />}
        {tab === "flappy" && <FlappyBird darkMode={darkMode} />}
        {tab === "tictactoe" && <TicTacToe darkMode={darkMode} />}
      </div>
    </div>
  );
};

export default Games;