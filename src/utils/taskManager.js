import { doc, getDoc, setDoc } from "firebase/firestore";
import { giveReward, CURRENCY } from "./rewardSystem";
import { db } from "../firebase/config";

// DAILY_TASKS bilan bir xil id, xp va max qiymatlari saqlanishi kerak
export const TASK_CONFIG = {
  watch_lesson:   { id: "watch_lesson", xp: 20, max: 1 },
  watch_3lessons: { id: "watch_3lessons", xp: 50, max: 3 },
  quiz:           { id: "quiz", xp: 30, max: 1 },
  typing:         { id: "typing", xp: 15, max: 1 },
  game:           { id: "game", xp: 10, max: 1 },
  chat:           { id: "chat", xp: 5, max: 1 },
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

/**
 * Haqiqiy harakat bajarilganda ushbu funksiyani chaqiring.
 * U bazaga ulanib, bugungi vazifalarni yangilaydi.
 */
export const completeRealTask = async (userId, taskId, showToast) => {
  if (!userId) return;
  const taskConf = TASK_CONFIG[taskId];
  if (!taskConf) return;

  const today = getTodayKey();
  const taskRef = doc(db, "users", userId, "dailyTasks", today);

  try {
    const snap = await getDoc(taskRef);
    let tasks = {};
    if (snap.exists()) {
      tasks = snap.data().completed || {};
    }

    const currentCount = tasks[taskId] || 0;
    
    // Agar vazifa allaqachon maksimal darajada bajarilgan bo'lsa, hech narsa qilmaymiz
    if (currentCount >= taskConf.max) {
      return; 
    }

    const newCount = currentCount + 1;
    const newTasks = { ...tasks, [taskId]: newCount };

    // Vazifa progressini yangilash
    await setDoc(taskRef, { completed: newTasks, date: today }, { merge: true });

    // Agar vazifa endi to'liq bajarilgan bo'lsa (max ga yetgan bo'lsa), XP beramiz
    if (newCount === taskConf.max) {
        await giveReward(userId, taskConf.xp, CURRENCY.XP, "Kunlik vazifa bajarildi: " + taskId);
        
        if (showToast) {
           showToast(`Vazifa yakunlandi: +${taskConf.xp} XP!`, "success");
        }
    } else {
        // Masalan, 3 ta darsdan 1 tasi ko'rilganda shunchaki xabar berish
        if (showToast) {
           showToast(`Vazifa progressi: ${newCount}/${taskConf.max}`, "info");
        }
    }

  } catch (error) {
    console.error("Vazifani yozishda xatolik:", error);
  }
};