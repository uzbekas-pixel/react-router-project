import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { X, Gift, Sparkles, Clock, Star } from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { giveReward } from "../utils/rewardSystem";

const spinData = [
  { option: "10 Coin", style: { backgroundColor: "#3b82f6", textColor: "white" }, value: 10, type: "coins" },
  { option: "5 XP", style: { backgroundColor: "#f97316", textColor: "white" }, value: 5, type: "xp" },
  { option: "Pixel Tuxum", style: { backgroundColor: "#ec4899", textColor: "white" }, value: 1, type: "pet_egg" }, // <-- YANGI YUTUQ
  { option: "Bo'sh", style: { backgroundColor: "#64748b", textColor: "white" }, value: 0, type: "none" },
  { option: "20 XP", style: { backgroundColor: "#8b5cf6", textColor: "white" }, value: 20, type: "xp" },
  { option: "100 Coin", style: { backgroundColor: "#eab308", textColor: "white" }, value: 100, type: "coins" },
];

const DailySpinModal = ({ darkMode, onClose, showToast, showConfetti }) => {
  const { user } = useAuth();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [loadingEligiblity, setLoadingEligibility] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    let intervalId;
    const checkEligibility = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const lastSpin = userSnap.data().lastSpinTime;
          if (!lastSpin) {
            setCanSpin(true);
            setLoadingEligibility(false);
          } else {
            const lastSpinDate = lastSpin.toDate();
            const calculateTime = () => {
              const now = new Date();
              const diffInMs = now - lastSpinDate;
              const diffInHours = diffInMs / (1000 * 60 * 60);
              if (diffInHours >= 12) {
                setCanSpin(true);
                setTimeLeft("");
                clearInterval(intervalId);
              } else {
                setCanSpin(false);
                const remainingMs = (12 * 60 * 60 * 1000) - diffInMs;
                const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hours} soat ${minutes} daqiqa`);
              }
            };
            calculateTime();
            intervalId = setInterval(calculateTime, 60000); // Har daqiqada yangilanadi
            setLoadingEligibility(false);
          }
        }
      } catch (error) {
        console.error(error);
        setLoadingEligibility(false);
      }
    };
    checkEligibility();
    return () => clearInterval(intervalId); // Komponent yopilganda intervalni tozalash
  }, [user]);

  const handleSpinClick = () => {
    if (!mustSpin && !isSpinning && canSpin) {
      // Tavakkal logikasi: Bo'shga tushish ehtimolini biroz kamaytirish mumkin
      // Hozircha oddiy random ishlatamiz.
      const newPrizeNumber = Math.floor(Math.random() * spinData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setIsSpinning(true);
      setCanSpin(false); // Tugmani darhol bloklaymiz
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    setIsSpinning(false);
    const prize = spinData[prizeNumber];
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentData = userSnap.data();
          
          if (prize.type === "coins" || prize.type === "xp") {
            await giveReward(user.uid, prize.value, prize.type, "Omadli aylanma yutug'i");
          } else if (prize.type === "pet_egg") {
             // Agar hayvoni yo'q bo'lsa, yangi tuxum beramiz
             if (!currentData.hasPet) {
                const petUpdates = {
                  hasPet: true,
                  petLevel: 1,
                  petXP: 0,
                  petType: Math.floor(Math.random() * 10) + 1
                };
                await setDoc(userRef, petUpdates, { merge: true });
             }
          }
          
          // Vaqtni har doim yangilaymiz
          await setDoc(userRef, { lastSpinTime: serverTimestamp() }, { merge: true });
          
         if (prize.type !== "none") {
            showConfetti && showConfetti();
            const message = prize.type === "pet_egg" 
              ? `Pixel Tuxum yutdingiz!`
              : `+${prize.option}`; // Qisqa yozuv: "+10 Coin"
            showToast && showToast(message, "success");
          } else {
             showToast && showToast("Yutuq chiqmadi!", "info");
          }
        }
      } catch (error) { 
        console.error("Yutuqni saqlashda xato:", error);
        showToast("Xatolik yuz berdi", "error");
      }
    }
    setTimeout(() => {
      onClose();
    }, 2500); // Modelni 2 soniyadan keyin avtomatik yopish
  };

  return (
    <div className="fixed inset-0 z-11100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className={`relative w-full max-w-sm rounded-3xl p-6 flex flex-col items-center shadow-2xl transition-all ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}
        style={{ animation: 'fadeUp 0.3s ease-out' }}
      >
        <button onClick={onClose} disabled={isSpinning} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isSpinning ? 'opacity-50 cursor-not-allowed' : darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="text-pink-500" size={28} />
          <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Omadlar Aylanmasi</h2>
        </div>
        
        {loadingEligiblity ? (
            <p className={`text-sm text-center mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tekshirilmoqda...</p>
        ) : (
            <p className={`text-sm text-center mb-6 ${!canSpin ? 'text-red-400 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {!canSpin ? `Keyingi imkoniyat: ${timeLeft} dan so'ng` : "12 soatda bir marta aylantirib bepul Coin va XP yutib oling!"}
            </p>
        )}
        <div className="pointer-events-none drop-shadow-2xl mb-6 scale-90 md:scale-100">
          <Wheel mustStartSpinning={mustSpin} prizeNumber={prizeNumber} data={spinData} onStopSpinning={handleStopSpinning} outerBorderColor={darkMode ? "#1e293b" : "#f1f5f9"} outerBorderWidth={5} innerBorderColor={darkMode ? "#0f172a" : "#ffffff"} innerRadius={15} radiusLineColor="transparent" textColors={["#ffffff"]} fontSize={16} spinDuration={0.8} />
        </div>
        <button onClick={handleSpinClick} disabled={isSpinning || !canSpin || loadingEligiblity} className={`w-full py-3 px-6 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${ isSpinning || !canSpin || loadingEligiblity ? 'bg-slate-500 cursor-not-allowed opacity-60' : 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30' }`} >
          {isSpinning ? 'Aylanmoqda...' : !canSpin ? (
              <> <Clock size={20} /> Kutish kerak </>
          ) : (
             <> <Sparkles size={20} /> Aylantirish </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DailySpinModal;