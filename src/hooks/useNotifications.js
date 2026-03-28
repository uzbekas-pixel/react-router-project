import { messaging, getToken, onMessage } from "../firebase/config";

const VAPID_KEY = "BLbg_DE95QoElBm64YHoUDCcanyHLyFX181JIFCKihZ-5fRfWoSy94c6lMiNsE0rQPfn13tmo4LlJQwACUCV51U";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log("FCM Token:", token);
      return token;
    }
  } catch (err) {
    console.error("Notification xatolik:", err);
  }
};

// BUG #11 FIX — returns the unsubscribe function so callers can clean up the listener.
// Old onMessageListener() created a Promise that never unsubscribed the Firebase onMessage handler,
// causing memory leaks and multiple concurrent listeners accumulating over re-renders.
export const setupMessageListener = (callback) => {
  return onMessage(messaging, callback); // returns unsub function
};