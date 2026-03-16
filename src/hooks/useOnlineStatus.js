import { useEffect } from "react";
import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase/config";

export const useOnlineStatus = (uid) => {
  useEffect(() => {
    if (!uid) return;
    const userRef = ref(rtdb, `online/${uid}`);
    
    // Online qilish
    set(userRef, { online: true, lastSeen: serverTimestamp() });
    
    // Chiqganda offline
    onDisconnect(userRef).set({ online: false, lastSeen: serverTimestamp() });

    return () => {
      set(userRef, { online: false, lastSeen: serverTimestamp() });
    };
  }, [uid]);
};