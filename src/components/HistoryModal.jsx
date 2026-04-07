import React, { useState, useEffect } from "react";
import { X, History, Coins, Star, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";

const HistoryModal = ({ darkMode, onClose }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "users", user.uid, "history"),
          orderBy("date", "desc"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(data);
      } catch (error) {
        console.error("Tarixni yuklashda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Hozirgina";
    const date = timestamp.toDate();
    return `${date.toLocaleDateString("uz-UZ")} • ${date.toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-12000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className={`relative w-full max-w-md max-h-[80vh] flex flex-col rounded-3xl shadow-2xl transition-all ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              <History size={22} />
            </div>
            <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Faollik Tarixi</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
               <Clock className="animate-spin mb-3 text-indigo-500" size={30} />
               <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Yuklanmoqda...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
               <History size={40} className="mb-3 text-slate-400" />
               <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Hali tarix mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isEarn = item.type === "earn";
                const isCoin = item.currency === "coins";

                return (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isEarn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isEarn ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.title}</p>
                        <p className={`text-[11px] font-medium mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 font-black text-lg ${isEarn ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isEarn ? "+" : "-"}{item.amount}
                      {isCoin ? <Coins size={16} className="text-yellow-500" /> : <Star size={16} className="text-orange-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;