import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import About from "./routes/About";
import Contact from "./routes/Contact";
import Products from "./routes/Products";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import CustomCursor from "./components/CustomCursor";
import ParticleBackground from "./components/ParticleBackground";
import Toast from "./components/Toast";
import Confetti from "./components/Confetti";
import Login from "./routes/Login";
import Register from "./routes/Registar";
import Profile from "./routes/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./routes/NotFound";
import ForgotPassword from "./routes/ForgotPassword";
import Admin from "./routes/Admin";
import AdminRoute from "./components/AdminRoute";
import Chat from "./routes/Chat";
import { requestNotificationPermission, onMessageListener } from "./hooks/useNotifications";
import { useAuth } from "./context/useAuth";
import TypingGame from "./routes/TypingGame";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const showToast = (message, type = "success") => setToast({ message, type });
  const showConfetti = () => setConfetti(true);
  const handleNavClick = () => {};

  // Push notification ruxsat so'rash
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  // App ochiq bo'lganda notification
  useEffect(() => {
    onMessageListener().then((payload) => {
      if (payload?.notification) {
        showToast(`🔔 ${payload.notification.title}: ${payload.notification.body}`, "info");
      }
    }).catch(() => {});
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <ParticleBackground darkMode={darkMode} />
      <CustomCursor darkMode={darkMode} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confetti && <Confetti onDone={() => setConfetti(false)} />}
      <Navbar darkMode={darkMode} setDarkMode={toggleDarkMode} onNavClick={handleNavClick} />
      <div className="mt-16 pb-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><Home darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} /></ProtectedRoute>} />
            <Route path="/login" element={<Login darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/register" element={<Register darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/forgot-password" element={<ForgotPassword darkMode={darkMode} showToast={showToast} />} />
            <Route path="/profile" element={<ProtectedRoute><Profile darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin darkMode={darkMode} showToast={showToast} /></AdminRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat darkMode={darkMode} /></ProtectedRoute>} />
            <Route path="*" element={<NotFound darkMode={darkMode} />} />
            <Route path="/typing" element={<TypingGame darkMode={darkMode} />} />
          </Routes>
        </AnimatePresence>
      </div>
      <ScrollToTop darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;