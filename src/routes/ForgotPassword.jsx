import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";

const ForgotPassword = ({ darkMode, showToast }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { showToast("Email kiritilmadi!", "error"); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      showToast("Reset email yuborildi! 📧", "success");
    } catch {
      showToast("Email topilmadi!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex items-center justify-center px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>

        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔑</div>
              <h2 className={`text-2xl font-extrabold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Parolni tiklash
              </h2>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Emailingizga tiklash havolasi yuboramiz
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className={`text-xs font-semibold mb-1 block ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
                    darkMode ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
                  }`}
                />
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300">
                {loading ? "Yuborilmoqda..." : "Yuborish →"}
              </button>
              <Link to="/login" className={`text-center text-sm text-blue-400 hover:underline`}>
                ← Kirish sahifasiga qaytish
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Email yuborildi!
            </h2>
            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <span className="text-blue-400 font-semibold">{email}</span> ga tiklash havolasi yuborildi. Emailingizni tekshiring!
            </p>
            <Link to="/login"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-300">
              Kirish sahifasiga qaytish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;