import { useState } from "react";

const TicTacToe = ({ darkMode }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState(null);

  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  const checkWinner = (b) => {
    for (const [a, bi, c] of lines) {
      if (b[a] && b[a] === b[bi] && b[a] === b[c]) return b[a];
    }
    return b.every(Boolean) ? "Draw" : null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isX ? "X" : "O";
    const w = checkWinner(newBoard);
    setBoard(newBoard);
    setIsX(!isX);
    setWinner(w);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); setWinner(null); };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        ❌⭕ Tic-Tac-Toe
      </h2>

      <div className={`text-center mb-4 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        {winner ? (winner === "Draw" ? "🤝 Durrang!" : `🏆 ${winner} yutdi!`) : `Navbat: ${isX ? "❌" : "⭕"}`}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-24 h-24 text-4xl font-extrabold rounded-2xl transition flex items-center justify-center ${
              cell === "X" ? "text-blue-400" : "text-red-400"
            } ${darkMode
              ? "bg-slate-800 hover:bg-slate-700 border border-slate-600"
              : "bg-white hover:bg-gray-50 border border-gray-200 shadow"
            }`}>
            {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
          </button>
        ))}
      </div>

      <button onClick={reset}
        className={`px-8 py-3 rounded-xl font-semibold transition ${
          darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}>
        🔄 Qayta
      </button>
    </div>
  );
};

export default TicTacToe;