import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuCoins, LuSparkles, LuTrendingUp, LuCheck, LuAlertCircle } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

const CONVERSION_RATES = [
  { xp: 100, coins: 10, bonus: 0 },
  { xp: 500, coins: 60, bonus: 5 },
  { xp: 1000, coins: 130, bonus: 15 },
  { xp: 5000, coins: 700, bonus: 100 },
];

const CoinShop = ({ darkMode, showToast, onClose }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [userData, setUserData] = useState({ xp: 0, coins: 0 });
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            xp: data.xp || 0,
            coins: data.coins || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleConvert = async () => {
    if (!selectedRate || !user) return;
    
    if (userData.xp < selectedRate.xp) {
      showToast?.(t.notEnoughXP || "Yetarli XP yo'q!", "error");
      return;
    }

    setConverting(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        xp: increment(-selectedRate.xp),
        coins: increment(selectedRate.coins),
        lastConversion: serverTimestamp(),
      });

      setUserData(prev => ({
        xp: prev.xp - selectedRate.xp,
        coins: prev.coins + selectedRate.coins,
      }));

      showToast?.(
        `${selectedRate.xp} XP → ${selectedRate.coins} ${t.coinLabel || "coin"}`,
        "success"
      );
      setSelectedRate(null);
    } catch (error) {
      console.error("Conversion error:", error);
      showToast?.(t.conversionError || "Xatolik yuz berdi", "error");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-2xl max-w-md w-full mx-auto`}
    >
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-amber-500 to-yellow-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <LuCoins className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Coin Shop</h2>
            <p className="text-white/80 text-sm">XP ni coin ga almashtiring</p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <LuTrendingUp className="w-4 h-4" />
              <span>XP</span>
            </div>
            <p className="text-white text-xl font-bold">{userData.xp.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <LuCoins className="w-4 h-4" />
              <span>Coin</span>
            </div>
            <p className="text-white text-xl font-bold">{userData.coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Conversion Options */}
      <div className="p-6">
        <p className={`text-sm font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Almashtirish variantini tanlang:
        </p>

        <div className="space-y-3">
          {CONVERSION_RATES.map((rate, index) => {
            const canAfford = userData.xp >= rate.xp;
            const isSelected = selectedRate?.xp === rate.xp;
            const totalCoins = rate.coins + rate.bonus;

            return (
              <motion.button
                key={rate.xp}
                whileHover={{ scale: canAfford ? 1.02 : 1 }}
                whileTap={{ scale: canAfford ? 0.98 : 1 }}
                onClick={() => canAfford && setSelectedRate(rate)}
                disabled={!canAfford}
                className={`w-full relative p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : canAfford
                    ? darkMode
                      ? "border-slate-600 hover:border-amber-500/50 bg-slate-700/50"
                      : "border-gray-200 hover:border-amber-300 bg-gray-50"
                    : darkMode
                    ? "border-slate-700 bg-slate-800/50 opacity-50"
                    : "border-gray-100 bg-gray-50 opacity-50"
                }`}
              >
                {/* Popular badge */}
                {index === 2 && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <LuSparkles className="w-3 h-3" />
                    Ommabop
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-amber-500 text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      <LuTrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {rate.xp.toLocaleString()} XP
                      </p>
                      <p className="text-sm text-gray-500">→ {totalCoins} coin</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {rate.bonus > 0 && (
                      <p className="text-xs text-emerald-500 font-medium mb-0.5">
                        +{rate.bonus} bonus
                      </p>
                    )}
                    {!canAfford && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <LuAlertCircle className="w-3 h-3" />
                        Yetarli emas
                      </p>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center ml-auto">
                        <LuCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Convert Button */}
        <motion.button
          whileHover={{ scale: selectedRate ? 1.02 : 1 }}
          whileTap={{ scale: selectedRate ? 0.98 : 1 }}
          onClick={handleConvert}
          disabled={!selectedRate || converting}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${
            selectedRate
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
              : darkMode
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {converting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Almashtirilmoqda...
            </span>
          ) : selectedRate ? (
            <span className="flex items-center justify-center gap-2">
              <LuCoins className="w-5 h-5" />
              {selectedRate.xp} XP ni {selectedRate.coins + selectedRate.bonus} coin ga almashtirish
            </span>
          ) : (
            "Variant tanlang"
          )}
        </motion.button>

        {/* Info */}
        <p className={`text-center text-xs mt-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Almashtirilgan coinlar do'konda ishlatiladi. XP dan kamayish darajangizga ta'sir qilmaydi.
        </p>
      </div>
    </motion.div>
  );
};

export default CoinShop;
