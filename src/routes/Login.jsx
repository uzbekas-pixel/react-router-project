import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useLang } from "../context/useLang";
import { MdOutlineLogin } from "react-icons/md";
import { LuUser, LuLock, LuArrowRight } from "react-icons/lu";

const getFirebaseError = (err, t) => {
  switch (err?.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-email":       return t.loginError;
    case "auth/too-many-requests":   return "Juda ko'p urinish! Biroz kuting yoki parolni tiklang.";
    case "auth/user-disabled":       return "Bu hisob o'chirib qo'yilgan.";
    case "auth/popup-closed-by-user":return "Kirish oynasi yopildi. Qayta urinib ko'ring.";
    case "auth/popup-blocked":       return "Popup bloklandi. Brauzer sozlamalarini tekshiring.";
    case "auth/cancelled-popup-request": return null;
    case "auth/account-exists-with-different-credential": return "Bu email boshqa usul bilan ro'yxatdan o'tgan. Email/parol bilan kiring.";
    case "auth/network-request-failed": return "Internet aloqasi yo'q. Tekshirib qayta urinib ko'ring.";
    default: return t.googleError;
  }
};

// Firestore ga foydalanuvchini saqlash — faqat yangi bo'lsa
const saveUserToFirestore = async (user) => {
  if (!user) return;
  try {
    const ref  = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         user.uid,
        displayName: user.displayName || "",
        email:       user.email || "",
        photoURL:    user.photoURL || null,
        provider:    user.providerData?.[0]?.providerId || "email",
        createdAt:   serverTimestamp(),
        xp:          0,
        streak:      0,
      });
    }
  } catch (err) {
    console.error("Firestore user saqlashda xato:", err);
  }
};

const Login = ({ darkMode, showToast, showConfetti }) => {
  const { t } = useLang();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.emailInvalidMsg;
    if (!form.password) e.password = t.passwordRequired;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, form.email, form.password);
      await saveUserToFirestore(res.user);
      showConfetti && showConfetti();
      showToast(t.loginSuccess, "success");
      navigate("/");
    } catch (err) {
      const msg = getFirebaseError(err, t);
      if (msg) showToast(msg, "error");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(res.user);
      showConfetti && showConfetti();
      showToast(t.loginSuccess, "success");
      navigate("/");
    } catch (err) {
      const msg = getFirebaseError(err, t);
      if (msg) showToast(msg, "error");
    } finally { setLoading(false); }
  };

  const handleGithub = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, githubProvider);
      await saveUserToFirestore(res.user);
      showConfetti && showConfetti();
      showToast(t.loginSuccess, "success");
      navigate("/");
    } catch (err) {
      const msg = getFirebaseError(err, t);
      if (msg) showToast(msg, "error");
    } finally { setLoading(false); }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
      errors[field] ? "border-red-400"
        : darkMode ? "border-slate-600 focus:border-blue-400"
        : "border-gray-200 focus:border-blue-400"
    } ${darkMode ? "bg-slate-800 text-white placeholder-gray-500" : "bg-white text-gray-900 placeholder-gray-400"}`;

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex items-center justify-center px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-extrabold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.loginTitle}</h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.loginSub}</p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{t.email}</label>
            <input type="email" placeholder="example@email.com" value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: null }); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputClass("email")} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{t.password}</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">{t.forgotPassword}</Link>
            </div>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: null }); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={inputClass("password")} />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
         <button onClick={handleSubmit} disabled={loading}
  className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 mt-2 flex items-center justify-center gap-2">
  {loading ? t.loggingIn : <><MdOutlineLogin size={18} /> {t.loginBtn}</>}
</button>
          <div className="flex items-center gap-3 my-1">
            <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t.or}</span>
            <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
          </div>
          <button onClick={handleGoogle} disabled={loading}
            className={`w-full py-3 flex items-center justify-center gap-3 rounded-xl border font-semibold text-sm transition-all duration-300 ${darkMode ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {t.googleLogin}
          </button>
          <button onClick={handleGithub} disabled={loading}
            className={`w-full py-3 flex items-center justify-center gap-3 rounded-xl border font-semibold text-sm transition-all duration-300 ${darkMode ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {t.githubLogin}
          </button>
          <p className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t.noAccount}{" "}
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">{t.register}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;