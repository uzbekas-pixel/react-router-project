import { useState, useEffect } from "react";
import { useLang } from "../../context/useLang";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/useAuth";
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { FaRedo, FaSignOutAlt, FaCopy, FaGlobe, FaUsers } from "react-icons/fa";

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const checkWinner = (b) => {
  for (const [a, bi, c] of LINES) {
    if (b[a] && b[a] === b[bi] && b[a] === b[c]) return b[a];
  }
  return b.every(Boolean) ? "Draw" : null;
};

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// ---- LOCAL MODE ----
const LocalGame = ({ darkMode, t }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [winLine, setWinLine] = useState(null);

  const findWinLine = (b) => {
    for (const line of LINES) {
      const [a, bi, c] = line;
      if (b[a] && b[a] === b[bi] && b[a] === b[c]) return line;
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = isX ? "X" : "O";
    const w = checkWinner(newBoard);
    setBoard(newBoard);
    setIsX(!isX);
    if (w) {
      setWinner(w);
      setWinLine(findWinLine(newBoard));
      setScores(prev => ({ ...prev, [w]: prev[w] + 1 }));
    }
  };

  const reset = () => { setBoard(Array(9).fill(null)); setIsX(true); setWinner(null); setWinLine(null); };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Skor */}
      <div className="flex gap-3">
        {[["❌ O'yinchi 1", "X"], ["🤝 Durrang", "Draw"], ["⭕ O'yinchi 2", "O"]].map(([label, key]) => (
          <div key={key} className={`px-4 py-2 rounded-xl text-center min-w-[80px] ${darkMode ? "bg-slate-700" : "bg-white shadow"}`}>
            <p className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
            <p className={`text-2xl font-extrabold ${key === "X" ? "text-blue-400" : key === "O" ? "text-red-400" : darkMode ? "text-gray-300" : "text-gray-600"}`}>{scores[key]}</p>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className={`text-center font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        {winner
          ? winner === "Draw" ? "🤝 Durrang!" : `🏆 ${winner === "X" ? "O'yinchi 1" : "O'yinchi 2"} yutdi!`
          : `Navbat: ${isX ? "❌" : "⭕"}`}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => {
          const isWinCell = winLine?.includes(i);
          return (
            <button key={i} onClick={() => handleClick(i)}
              className={`w-24 h-24 text-4xl font-extrabold rounded-2xl transition flex items-center justify-center
                ${isWinCell ? "ring-4 ring-yellow-400" : ""}
                ${darkMode
                  ? "bg-slate-800 hover:bg-slate-700 border border-slate-600"
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow"
                }`}>
              {cell === "X" ? <span className="text-blue-400">❌</span> : cell === "O" ? <span className="text-red-400">⭕</span> : ""}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
       <button onClick={reset}
  className={`px-6 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
  <FaRedo /> {t.again}
</button>
        <button onClick={() => { reset(); setScores({ X: 0, O: 0, Draw: 0 }); }}
          className={`px-6 py-2 rounded-xl font-semibold transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Hisobni sifrlash
        </button>
      </div>
    </div>
  );
};

// ---- ONLINE MODE ----
const OnlineGame = ({ darkMode, t, user }) => {
  const [screen, setScreen] = useState("lobby");
  const [roomId, setRoomId] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState("");

  const isHost = roomData?.hostUid === user?.uid;
  const mySymbol = isHost ? "X" : "O";
  const opponentSymbol = isHost ? "O" : "X";
  const board = roomData?.board || Array(9).fill(null);
  const currentTurn = roomData?.turn || "X";
  const winner = roomData?.winner || null;
  const isMyTurn = currentTurn === mySymbol;

  // Room tinglash
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "tictacRooms", roomId), (snap) => {
      if (!snap.exists()) {
        setRoomData(null);
        setScreen("lobby");
        setRoomId("");
        setError("Room o'chirildi!");
        return;
      }
      setRoomData(snap.data());
    });
    return () => unsub();
  }, [roomId]);

  const createRoom = async () => {
    if (!user) return;
    const id = generateRoomId();
    await setDoc(doc(db, "tictacRooms", id), {
      board: Array(9).fill(null),
      turn: "X",
      winner: null,
      hostUid: user.uid,
      hostName: user.displayName || user.email,
      guestUid: null,
      guestName: null,
      scores: { X: 0, O: 0, Draw: 0 },
      createdAt: new Date().toISOString(),
    });
    setRoomId(id);
    setScreen("waiting");
  };

  const joinRoom = async () => {
    if (!joinInput.trim() || !user) return;
    const id = joinInput.toUpperCase().trim();
    const snap = await getDoc(doc(db, "tictacRooms", id));
    if (!snap.exists()) { setError("Room topilmadi!"); return; }
    const data = snap.data();
    if (data.guestUid) { setError("Room to'liq!"); return; }
    if (data.hostUid === user.uid) { setError("O'z roomingizga kira olmaysiz!"); return; }
    await updateDoc(doc(db, "tictacRooms", id), {
      guestUid: user.uid,
      guestName: user.displayName || user.email,
    });
    setRoomId(id);
    setScreen("playing");
  };

  const handleClick = async (i) => {
    if (!isMyTurn || board[i] || winner || !roomData?.guestUid) return;
    const newBoard = [...board];
    newBoard[i] = mySymbol;
    const w = checkWinner(newBoard);
    const newScores = { ...(roomData.scores || { X: 0, O: 0, Draw: 0 }) };
    if (w) newScores[w] = (newScores[w] || 0) + 1;
    await updateDoc(doc(db, "tictacRooms", roomId), {
      board: newBoard,
      turn: opponentSymbol,
      winner: w || null,
      scores: newScores,
    });
  };

  const resetGame = async () => {
    if (!isHost) return;
    await updateDoc(doc(db, "tictacRooms", roomId), {
      board: Array(9).fill(null),
      turn: "X",
      winner: null,
    });
  };

  const leaveRoom = async () => {
    if (isHost) await deleteDoc(doc(db, "tictacRooms", roomId)).catch(() => {});
    else await updateDoc(doc(db, "tictacRooms", roomId), { guestUid: null, guestName: null }).catch(() => {});
    setRoomId(""); setRoomData(null); setScreen("lobby");
  };

  const scores = roomData?.scores || { X: 0, O: 0, Draw: 0 };

  // Lobby
  if (screen === "lobby") return (
    <div className={`w-full max-w-sm mx-auto rounded-2xl p-6 shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
      <h3 className={`text-lg font-extrabold mb-4 text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
        🌐 Online O'yin
      </h3>
      {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
      <button onClick={createRoom}
        className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition mb-3">
        🏠 Yangi room yaratish
      </button>
      <div className="flex gap-2">
        <input type="text" placeholder="Room ID kiriting..." value={joinInput}
          onChange={e => setJoinInput(e.target.value.toUpperCase())} maxLength={6}
          onKeyDown={e => e.key === "Enter" && joinRoom()}
          className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none ${darkMode ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`} />
        <button onClick={joinRoom}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition text-sm">
          Kirish
        </button>
      </div>
    </div>
  );

  // Waiting
  if (screen === "waiting") return (
    <div className={`w-full max-w-sm mx-auto rounded-2xl p-8 text-center shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
      <div className="text-5xl mb-4">⏳</div>
      <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Raqib kutilmoqda...</h3>
      <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Do'stingizga bu kodni yuboring:</p>
      <div className={`text-4xl font-extrabold tracking-widest mb-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>{roomId}</div>
    <button onClick={() => { navigator.clipboard.writeText(roomId); }}
  className={`px-4 py-2 rounded-xl text-sm font-semibold mb-4 transition flex items-center gap-2 ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
  <FaCopy /> Nusxalash
</button>
      <br />
      <button onClick={leaveRoom} className="text-red-400 text-sm hover:underline mt-2">Bekor qilish</button>
      {roomData?.guestUid && (() => { setScreen("playing"); return null; })()}
    </div>
  );

  // Playing
  const opponentName = isHost ? (roomData?.guestName || "Raqib") : (roomData?.hostName || "Raqib");
  const myName = user?.displayName || user?.email || "Siz";

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
      {/* Skor */}
      <div className="flex gap-2 w-full">
        {[
          { label: `${myName} (${mySymbol === "X" ? "❌" : "⭕"})`, val: scores[mySymbol], color: "text-blue-400" },
          { label: "🤝", val: scores["Draw"], color: darkMode ? "text-gray-300" : "text-gray-600" },
          { label: `${opponentName} (${opponentSymbol === "X" ? "❌" : "⭕"})`, val: scores[opponentSymbol], color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className={`flex-1 px-2 py-2 rounded-xl text-center ${darkMode ? "bg-slate-700" : "bg-white shadow"}`}>
            <p className={`text-[10px] font-semibold truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.val || 0}</p>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        {!roomData?.guestUid
          ? "Raqib kutilmoqda..."
          : winner
            ? winner === "Draw" ? "🤝 Durrang!" : `🏆 ${winner === mySymbol ? "Siz yutdingiz!" : `${opponentName} yutdi!`}`
            : isMyTurn ? "Sizning navbatingiz ✨" : `${opponentName} o'ylayapti...`
        }
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-24 h-24 text-4xl font-extrabold rounded-2xl transition flex items-center justify-center
              ${isMyTurn && !cell && !winner && roomData?.guestUid ? "hover:scale-105 cursor-pointer" : "cursor-default"}
              ${darkMode ? "bg-slate-800 border border-slate-600" : "bg-white border border-gray-200 shadow"}`}>
            {cell === "X" ? <span className="text-blue-400">❌</span> : cell === "O" ? <span className="text-red-400">⭕</span> : ""}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {isHost && winner && (
          <button onClick={resetGame}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-sm transition">
            {t.again}
          </button>
        )}
        {!isHost && winner && (
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Host qayta boshlashini kuting...</p>
        )}
      <button onClick={leaveRoom}
  className={`px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
  <FaSignOutAlt /> Chiqish
</button>
      </div>
    </div>
  );
};

// ---- MAIN ----
const TicTacToe = ({ darkMode }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [mode, setMode] = useState("local"); // "local" | "online"

  return (
    <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h2 className={`text-xl font-extrabold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
        ❌⭕ Tic-Tac-Toe
      </h2>

      {/* Mode tanlash */}
      <div className={`flex rounded-2xl overflow-hidden border mb-6 ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
      <button onClick={() => setMode("local")} className={`px-6 py-2 text-sm font-semibold transition flex items-center gap-2 ${mode === "local" ? "bg-blue-500 text-white" : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"}`}>
  <FaUsers /> 2 kishi (local)
</button>
<button onClick={() => setMode("online")} className={`px-6 py-2 text-sm font-semibold transition flex items-center gap-2 ${mode === "online" ? "bg-blue-500 text-white" : darkMode ? "text-gray-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"}`}>
  <FaGlobe /> Online
</button>
      </div>

      {mode === "local"
        ? <LocalGame darkMode={darkMode} t={t} />
        : <OnlineGame darkMode={darkMode} t={t} user={user} />
      }
    </div>
  );
};

export default TicTacToe;