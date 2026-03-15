import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBaMm5pXooMcdiLKdqcSM_eVh1zB6_n7Eo",
  authDomain: "uzbekas.firebaseapp.com",
  projectId: "uzbekas",
  storageBucket: "uzbekas.firebasestorage.app",
  messagingSenderId: "450501998688",
  appId: "1:450501998688:web:ef401b336acd22457a2b05",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const messaging = getMessaging(app);
export { getToken, onMessage };
export const githubProvider = new GithubAuthProvider();