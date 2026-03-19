import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Courses from "./routes/Courses";
import Instructors from "./routes/Instructors";
import Pricing from "./routes/Pricing";
import Quiz from "./routes/Quiz";
import Dashboard from "./routes/Dashboard";
import Notifications from "./routes/Notifications";
import AiTutor from "./routes/AiTutor";
import Leaderboard from "./routes/Leaderboard";
import Schedule from "./routes/Schedule";
import PromoCode from "./routes/PromoCode";
import CreateCourse from "./routes/CreateCourse";
import Onboarding, { useOnboarding } from "./components/Onboarding";
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
import MultiTyping from "./routes/MultiTyping";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import BottomNav from "./components/BottomNav";
import Games from "./routes/Games";
import CodeEditor from "./routes/CodeEditor";
import DM from "./routes/DM";
import Story from "./routes/Story";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const toggleDarkMode = () => { setDarkMode(!darkMode); localStorage.setItem("darkMode", !darkMode); };
  const [toast, setToast]     = useState(null);
  const [confetti, setConfetti] = useState(false);
  const location  = useLocation();
  const { user }  = useAuth();
  const { show: showOnboarding, hide: hideOnboarding } = useOnboarding();

  useOnlineStatus(user?.uid);
  const showToast     = (message, type = "success") => setToast({ message, type });
  const showConfetti  = () => setConfetti(true);
  const handleNavClick = () => {};

  useEffect(() => { if (user) requestNotificationPermission(); }, [user]);
  useEffect(() => {
    onMessageListener().then((payload) => {
      if (payload?.notification) showToast(`🔔 ${payload.notification.title}: ${payload.notification.body}`, "info");
    }).catch(() => {});
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <ParticleBackground darkMode={darkMode} />
      <CustomCursor darkMode={darkMode} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confetti && <Confetti onDone={() => setConfetti(false)} />}

      {/* Onboarding — faqat birinchi kirganda */}
      {showOnboarding && <Onboarding darkMode={darkMode} onComplete={hideOnboarding} />}

      <Navbar darkMode={darkMode} setDarkMode={toggleDarkMode} onNavClick={handleNavClick} />

      <div className="mt-16 pb-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Asosiy ── */}
            <Route path="/"             element={<Courses      darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/courses"      element={<Courses      darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/instructors"  element={<Instructors  darkMode={darkMode} showToast={showToast} />} />
            <Route path="/pricing"      element={<Pricing      darkMode={darkMode} showToast={showToast} />} />
            <Route path="/ai-tutor"     element={<AiTutor      darkMode={darkMode} showToast={showToast} />} />

            {/* ── O'quv ── */}
            <Route path="/quiz"         element={<Quiz         darkMode={darkMode} showToast={showToast} />} />
            <Route path="/dashboard"    element={<Dashboard    darkMode={darkMode} showToast={showToast} />} />
            <Route path="/notifications"element={<Notifications darkMode={darkMode} showToast={showToast} />} />
            <Route path="/leaderboard"  element={<Leaderboard  darkMode={darkMode} showToast={showToast} />} />
            <Route path="/schedule"     element={<Schedule     darkMode={darkMode} showToast={showToast} />} />
            <Route path="/promo"        element={<PromoCode    darkMode={darkMode} showToast={showToast} />} />
            <Route path="/create-course"element={<CreateCourse darkMode={darkMode} showToast={showToast} />} />

            {/* ── Auth ── */}
            <Route path="/login"          element={<Login         darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/register"       element={<Register      darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/forgot-password"element={<ForgotPassword darkMode={darkMode} showToast={showToast} />} />

            {/* ── Protected ── */}
            <Route path="/profile"      element={<Profile      darkMode={darkMode} showToast={showToast} showConfetti={showConfetti} />} />
            <Route path="/admin"        element={<AdminRoute><Admin darkMode={darkMode} showToast={showToast} /></AdminRoute>} />
            <Route path="/chat"         element={<Chat         darkMode={darkMode} />} />
            <Route path="/typing"       element={<TypingGame   darkMode={darkMode} />} />
            <Route path="/games"        element={<ProtectedRoute><Games     darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />
            <Route path="/code"         element={<ProtectedRoute><CodeEditor darkMode={darkMode} /></ProtectedRoute>} />
            <Route path="/story"        element={<ProtectedRoute><Story     darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />
            <Route path="/dm"           element={<ProtectedRoute><DM        darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />
            <Route path="/multiplayer"  element={<ProtectedRoute><MultiTyping darkMode={darkMode} showToast={showToast} /></ProtectedRoute>} />

            <Route path="*" element={<NotFound darkMode={darkMode} />} />
          </Routes>
        </AnimatePresence>
      </div>

      <ScrollToTop darkMode={darkMode} />
      <BottomNav darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;