import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { LuHistory, LuTrendingUp, LuTrendingDown, LuCoins, LuStar, LuClock, LuShoppingBag } from "react-icons/lu";
import ScrollReveal from "../components/ScrollReveal";

const History = ({ darkMode }) => {
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
          limit(30) // Oxirgi 30 ta tarixni ko'rsatadi
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
      <ScrollReveal direction="up">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <LuHistory size={32} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Faollik Tarixi
            </h1>
            <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Sizning barcha yutuq va xarajatlaringiz ro'yxati
            </p>
          </div>
        </div>

        <div className={`rounded-4xl border p-2 md:p-6 min-h-[50vh] ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-60">
               <LuClock className="animate-spin mb-4 text-indigo-500" size={40} />
               <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Ma'lumotlar yuklanmoqda...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-60">
               <LuShoppingBag size={56} className="mb-4 text-slate-400" />
               <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Hali tarix mavjud emas</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {history.map((item) => {
                const isEarn = item.type === "earn";
                const isCoin = item.currency === "coins";

                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80' : 'bg-slate-50 border-slate-100 shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl ${isEarn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isEarn ? <LuTrendingUp size={24} /> : <LuTrendingDown size={24} />}
                      </div>
                      
                      <div>
                        <p className={`font-black text-sm md:text-lg tracking-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {item.title}
                        </p>
                        <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 font-black text-lg md:text-2xl px-3 py-1.5 rounded-xl ${isEarn ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {isEarn ? "+" : "-"}{item.amount}
                      {isCoin ? <LuCoins size={20} className="text-yellow-500" /> : <LuStar size={20} className="text-orange-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
};

export default History;