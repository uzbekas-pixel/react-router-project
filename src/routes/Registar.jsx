import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const Register = ({ darkMode, showToast, showConfetti }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Ism kiritilmadi";
    if (!form.email.trim()) e.email = "Email kiritilmadi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email noto'g'ri";
    if (!form.password) e.password = "Parol kiritilmadi";
    else if (form.password.length < 6) e.password = "Parol kamida 6 ta belgi";
    if (form.password !== form.confirm) e.confirm = "Parollar mos kelmadi";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(res.user, { displayName: form.name });
      showConfetti();
      showToast(`Xush kelibsiz, ${form.name}! 🎉`, "success");
      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        showToast("Bu email allaqachon ro'yxatdan o'tgan!", "error");
      } else {
        showToast("Xatolik yuz berdi!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showConfetti();
      showToast("Google orqali ro'yxatdan o'tdingiz! 🎉", "success");
      navigate("/");
    } catch {
      showToast("Google kirish xatoligi!", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
    errors[field] ? "border-red-400" : darkMode ? "border-slate-600 focus:border-blue-400" : "border-gray-200 focus:border-blue-400"
  } ${darkMode ? "bg-slate-800 text-white placeholder-gray-500" : "bg-white text-gray-900 placeholder-gray-400"}`;

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex items-center justify-center px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>

        <div className="text-center mb-8">
          <h2 className={`text-3xl font-extrabold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Ro'yxatdan o'tish</h2>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Yangi hisob yarating</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Ism</label>
            <input type="text" placeholder="Ismingiz" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass("name")} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
            <input type="email" placeholder="example@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass("email")} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Parol</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass("password")} />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Parolni tasdiqlang</label>
            <input type="password" placeholder="••••••••" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={inputClass("confirm")} />
            {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
          </div>

          {/* Ro'yxatdan o'tish tugmasi */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 mt-2">
            {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish →"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>yoki</span>
            <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
          </div>

          {/* Google tugmasi */}
          <button onClick={handleGoogle} disabled={loading}
            className={`w-full py-3 flex items-center justify-center gap-3 rounded-xl border font-semibold text-sm transition-all duration-300 ${
              darkMode
                ? "border-slate-600 text-white hover:bg-slate-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google bilan ro'yxatdan o'tish
          </button>

          <p className={`text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Hisobingiz bormi?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;