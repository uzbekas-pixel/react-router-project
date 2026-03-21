import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/useAuth";
import { FaTrophy } from "react-icons/fa";

const MEDALS = ["🥇", "🥈", "🥉"];

const Leaderboard = ({ darkMode, game }) => {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "gameScores"),
      orderBy("score", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.game === game);

      // Har foydalanuvchidan faqat eng yuqori natija
      const best = {};
      all.forEach(d => {
        if (!best[d.uid] || d.score > best[d.uid].score) best[d.uid] = d;
      });

      setScores(Object.values(best).sort((a, b) => b.score - a.score).slice(0, 10));
      setLoading(false);
    });
    return () => unsub();
  }, [game]);

  if (loading) return (
    <div className="flex justify-center py-4">
      <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!scores.length) return (
  <div className="flex flex-col items-center py-4 gap-2">
  <FaTrophy className="text-3xl text-gray-400" />
  <p className={`text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
    Hali natijalar yo'q!
  </p>
</div>
  );

  return (
    <div className="flex flex-col gap-2">
      {scores.map((s, i) => (
        <div key={s.id}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
            s.uid === user?.uid
              ? "ring-2 ring-blue-400 " + (darkMode ? "bg-slate-700" : "bg-blue-50")
              : darkMode ? "bg-slate-700" : "bg-gray-50"
          }`}>
          <div className="w-7 text-center text-lg">
            {i < 3 ? MEDALS[i] : <span className={`text-sm font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>#{i + 1}</span>}
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
            {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : s.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              {s.name}
              {s.uid === user?.uid && <span className="ml-1 text-xs text-blue-400">(Siz)</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-blue-400">{s.score}</p>
            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>ball</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;