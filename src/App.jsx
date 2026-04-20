import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import 'flag-icons/css/flag-icons.min.css';

// Asosiy komponentlar
import Navbar from "./components/Navbar";
import Onboarding from "./components/Onboarding";

import CustomCursor from "./components/CustomCursor";
import ParticleBackground from "./components/ParticleBackground";
import Toast from "./components/Toast";
import Confetti from "./components/Confetti";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Sahifalar (Routes)
import Courses from "./routes/Courses";
import Pricing from "./routes/Pricing";
import Quiz from "./routes/Quiz";
import Dashboard from "./routes/Dashboard";
import Notifications from "./routes/Notifications";
import AiTutor from "./routes/AiTutor";
import Leaderboard from "./routes/Leaderboard";
import PromoCode from "./routes/PromoCode";
import CreateCourse from "./routes/CreateCourse";
import Login from "./routes/Login";
import Register from "./routes/Registar";
import Profile from "./routes/Profile";
import NotFound from "./routes/NotFound";
import ForgotPassword from "./routes/ForgotPassword";
import Admin from "./routes/Admin";
import Chat from "./routes/Chat";
import TypingGame from "./routes/TypingGame";
import MultiTyping from "./routes/MultiTyping";
import Games from "./routes/Games";
import CodeEditor from "./routes/CodeEditor";
import DM from "./routes/DM";
import Story from "./routes/Story";
import Settings from "./routes/Settings";
import DailyTasks from "./routes/DailyTasks";
import Friends from "./routes/Friends";
import Certificate from "./routes/Certificate";
import Referral from "./routes/Referral";
import CoinShop from "./routes/CoinShop";
import InstructorPanel from "./routes/InstructorPanel";
import UserProfile from "./routes/UserProfile";
import QA from "./routes/QA";
import Live from "./routes/Liveinstructor";
import BattleMode from "./routes/BattleMode";
import Supports from "./routes/Supports";
import ResumeBuilder from "./routes/ResumeBuilder";
import ProjectShowcase from "./routes/ProjectShowcase";
import PixelMarket from "./routes/PixelMarket";
import PixelChallenge from "./routes/PixelChallenge";
import CodeSnippets from "./routes/Codesnippets";

// Hook va Contextlar
import { useOnboarding } from "./hooks/useOnboarding";
import {
  requestNotificationPermission,
  setupMessageListener,
} from "./hooks/useNotifications";
import { useAuth } from "./context/useAuth";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useLang } from "./context/useLang";


import DailySpinModal from "./components/DailySpinModal";

import { Gift } from "lucide-react";
import { LuWifiOff, LuPartyPopper } from "react-icons/lu";
import History from "./routes/History";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

const themeStyles = {
  default: null,
  sunset: "linear-gradient(135deg, #f97316, #ec4899)",
  ocean: "linear-gradient(135deg, #06b6d4, #3b82f6)",
  forest: "linear-gradient(135deg, #22c55e, #16a34a)",
  purple: "linear-gradient(135deg, #a855f7, #6366f1)",
  rose: "linear-gradient(135deg, #f43f5e, #e11d48)",
  gold: "linear-gradient(135deg, #eab308, #f97316)",
  midnight: "linear-gradient(135deg, #1e1b4b, #312e81)",
};

function App() {
  const { t } = useLang();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true",
  );
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { show: showOnboarding, hide: hideOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "default",
  );
  const [customBg, setCustomBg] = useState(
    localStorage.getItem("customBg") || null,
  );

  const [showSpinModal, setShowSpinModal] = useState(false);
  const [isCourseDetailView, setIsCourseDetailView] = useState(false);


  useOnlineStatus(user?.uid);

  const showToast = useCallback(
    (message, type = "success") => setToast({ message, type }),
    [],
  );
  const showConfetti = () => setConfetti(true);
  const handleNavClick = () => {};

  useEffect(() => {
    if (user) requestNotificationPermission();
  }, [user]);

  useEffect(() => {
    const unsub = setupMessageListener((payload) => {
      if (payload?.notification) {
        showToast(
          `${payload.notification.title}: ${payload.notification.body}`,
          "info",
        );
      }
    });
    return () => unsub();
  }, [showToast]);

  useEffect(() => {
    const goOffline = () => showToast(t.offlineMode, "error");
    const goOnline = () => showToast(t.onlineBack, "success");
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [showToast, t]);




  const bgStyle = customBg
    ? {
        backgroundImage: `url(${customBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : currentTheme !== "default" && themeStyles[currentTheme]
      ? { background: themeStyles[currentTheme] }
      : {};
  const hasCustomBg = customBg || currentTheme !== "default";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${hasCustomBg ? "" : darkMode ? "bg-slate-900" : "bg-slate-50"}`}
      style={bgStyle}
    >
      <ParticleBackground darkMode={darkMode} />
      <CustomCursor darkMode={darkMode} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {confetti && <Confetti onDone={() => setConfetti(false)} />}

      {showSpinModal && !isCourseDetailView && (
        <DailySpinModal
          darkMode={darkMode}
          onClose={() => setShowSpinModal(false)}
          showToast={showToast}
          showConfetti={showConfetti}
        />
      )}

      {showOnboarding && (
        <Onboarding
          darkMode={darkMode}
          onComplete={hideOnboarding}
          navigate={navigate}
        />
      )}

      <Navbar
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
        onNavClick={handleNavClick}
      />

      <div className="mt-16 pb-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <Courses
                  darkMode={darkMode}
                  showToast={showToast}
                  showConfetti={showConfetti}
                  onDetailViewChange={setIsCourseDetailView}
                />
              }
            />
            <Route
              path="/courses"
              element={
                <Courses
                  darkMode={darkMode}
                  showToast={showToast}
                  showConfetti={showConfetti}
                  onDetailViewChange={setIsCourseDetailView}
                />
              }
            />
            <Route
              path="/pricing"
              element={<Pricing darkMode={darkMode} showToast={showToast} />}
            />
            <Route
              path="/ai-tutor"
              element={<AiTutor darkMode={darkMode} showToast={showToast} />}
            />

            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard darkMode={darkMode} showToast={showToast} />}
            />
            <Route
              path="/notifications"
              element={
                <Notifications darkMode={darkMode} showToast={showToast} />
              }
            />
            <Route
              path="/leaderboard"
              element={
                <Leaderboard darkMode={darkMode} showToast={showToast} />
              }
            />
            <Route
              path="/promo"
              element={<PromoCode darkMode={darkMode} showToast={showToast} />}
            />
            <Route
              path="/create-course"
              element={
                <CreateCourse darkMode={darkMode} showToast={showToast} />
              }
            />
            <Route
              path="/qa"
              element={<QA darkMode={darkMode} showToast={showToast} />}
            />
            <Route
              path="/live"
              element={<Live darkMode={darkMode} showToast={showToast} />}
            />

            <Route
              path="/login"
              element={
                <Login
                  darkMode={darkMode}
                  showToast={showToast}
                  showConfetti={showConfetti}
                />
              }
            />
            <Route
              path="/register"
              element={
                <Register
                  darkMode={darkMode}
                  showToast={showToast}
                  showConfetti={showConfetti}
                />
              }
            />
            <Route
              path="/forgot-password"
              element={
                <ForgotPassword darkMode={darkMode} showToast={showToast} />
              }
            />
            <Route
              path="/battlemode"
              element={<BattleMode darkMode={darkMode} showToast={showToast} />}
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile
                    darkMode={darkMode}
                    showToast={showToast}
                    showConfetti={showConfetti}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin darkMode={darkMode} showToast={showToast} />
                </AdminRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/typing"
              element={
                <ProtectedRoute>
                  <TypingGame darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multiplayer"
              element={
                <ProtectedRoute>
                  <MultiTyping darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <Games darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/code"
              element={
                <ProtectedRoute>
                  <CodeEditor darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/story"
              element={
                <ProtectedRoute>
                  <Story darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dm"
              element={
                <ProtectedRoute>
                  <DM darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily"
              element={
                <ProtectedRoute>
                  <DailyTasks darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supports"
              element={
                <ProtectedRoute>
                  <Supports darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeBuilder darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectShowcase darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pixel-market"
              element={
                <ProtectedRoute>
                  <PixelMarket darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pixel-challenge"
              element={
                <ProtectedRoute>
                  <PixelChallenge darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate"
              element={
                <ProtectedRoute>
                  <Certificate darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referral"
              element={
                <ProtectedRoute>
                  <Referral darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <CoinShop darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor"
              element={
                <ProtectedRoute>
                  <InstructorPanel darkMode={darkMode} showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/codesnippets"
              element={
                <ProtectedRoute>
                  <CodeSnippets darkMode={darkMode} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings
                    darkMode={darkMode}
                    setDarkMode={toggleDarkMode}
                    showToast={showToast}
                    onThemeChange={(id) => {
                      setCurrentTheme(id);
                      localStorage.setItem("theme", id);
                    }}
                    currentTheme={currentTheme}
                    onBgChange={(bg) => {
                      setCustomBg(bg || null);
                      if (bg) localStorage.setItem("customBg", bg);
                      else localStorage.removeItem("customBg");
                    }}
                    currentBg={customBg}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound darkMode={darkMode} />} />
          </Routes>
        </AnimatePresence>
      </div>

     
      <BottomNav darkMode={darkMode} />
    </div>
  );
}

export default App;
