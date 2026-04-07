// src/utils/rewardSystem.js
import { doc, setDoc, addDoc, collection, serverTimestamp, increment } from "firebase/firestore";
import { db } from "../firebase/config";

// Bu funksiyani butun loyiha bo'ylab ishlatishingiz mumkin
export const giveReward = async (userId, amount, currency, title) => {
  if (!userId || !amount) return;

  try {
    // 1. Tanga (Coin) qo'shish kerak bo'lsa
    if (currency === "coins") {
      const walletRef = doc(db, "users", userId, "data", "wallet");
      await setDoc(walletRef, { coins: increment(amount) }, { merge: true });
    } 
    // 2. XP qo'shish kerak bo'lsa
    else if (currency === "xp") {
      const statsRef = doc(db, "users", userId, "data", "stats");
      const mainRef = doc(db, "users", userId); // Profil uchun
      
      await setDoc(statsRef, { xp: increment(amount) }, { merge: true });
      await setDoc(mainRef, { xp: increment(amount) }, { merge: true });
    }

    // 3. Har qanday holatda avtomatik Tarixga (History) yozib qo'yish
    const historyRef = collection(db, "users", userId, "history");
    await addDoc(historyRef, {
      title: title,
      amount: Math.abs(amount), // Faqat musbat son oladi
      currency: currency, // 'coins' yoki 'xp'
      type: amount > 0 ? "earn" : "spend", // Berilyaptimi yoki olinyaptimi
      date: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Mukofot berishda xatolik:", error);
    return false;
  }
};