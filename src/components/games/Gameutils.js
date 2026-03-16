import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export const saveScore = async (user, game, score) => {
  if (!user || score <= 0) return;
  try {
    await addDoc(collection(db, "gameScores"), {
      uid: user.uid,
      name: user.displayName || user.email,
      avatar: user.photoURL || null,
      game,
      score,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Score saqlashda xato:", e);
  }
};