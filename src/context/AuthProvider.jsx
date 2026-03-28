import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Login bo'lganda users kolleksiyasiga avtomatik yozish
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // Yangi foydalanuvchi — birinchi marta yozamiz (xp/streak/courses/quizAvg for Leaderboard denorm)
            await setDoc(userRef, {
              displayName: currentUser.displayName || "",
              email:       currentUser.email || "",
              avatarUrl:   currentUser.photoURL || "",
              phone:       "",
              bio:         "",
              uid:         currentUser.uid,
              createdAt:   new Date().toISOString(),
              // DENORM defaults — Leaderboard reads these directly from users/{uid}
              xp:      0,
              streak:  0,
              courses: 0,
              quizAvg: 0,
            });
          } else {
            // Mavjud foydalanuvchi — displayName va avatarni yangilaymiz
            await updateDoc(userRef, {
              displayName: currentUser.displayName || snap.data().displayName || "",
              email: currentUser.email || "",
              avatarUrl: currentUser.photoURL || snap.data().avatarUrl || "",
            });
          }
        } catch (err) { console.error("AuthProvider: Failed to write user doc to Firestore:", err); }
      }
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, "typing", auth.currentUser.uid), { isTyping: false }).catch(() => {});
    }
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};