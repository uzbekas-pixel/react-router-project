import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

import { LuUser, LuPhone, LuArrowLeft, LuMail, LuStar, LuFlame, LuTrophy, LuBookOpen, LuFrown, LuBadgeCheck, LuCoins } from "react-icons/lu";
import { useLang } from "../context/useLang";
import { getNameStyleByKey } from "../constants/shopConstants";

const UserProfile = ({ darkMode }) => {
  const { t } = useLang();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());

          // Stats ham yuklab olish
          try {
            const statsSnap = await getDoc(doc(db, "users", userId, "data", "stats"));
            if (statsSnap.exists()) setStats(statsSnap.data());
          } catch {
            // stats bo'lmasa ham OK
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (loading) return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? "text-white" : "text-gray-900"}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.loading}</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className={`flex flex-col items-center justify-center min-h-screen gap-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <div className="text-6xl text-blue-400"><LuFrown size={64} /></div>
      <p className="text-xl font-bold">{t.userNotFound}</p>
      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.profileNotExist}</p>
      <button onClick={() => navigate(-1)}
        className="mt-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition font-semibold flex items-center gap-2">
        <LuArrowLeft size={16} /> {t.back}
      </button>
    </div>
  );

  const xp = stats?.xp || profile?.xp || 0;
  const streak = stats?.streak || profile?.streak || 0;
  const level = stats?.level || profile?.level || null;
  const coins = profile?.coins || 0;

  const hasStats = xp > 0 || streak > 0 || level || coins > 0;

  return (
    <div className={`w-full max-w-2xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>

      {/* Orqaga */}
      <button onClick={() => navigate(-1)}
        className={`flex items-center gap-2 mb-6 text-sm font-medium px-4 py-2 rounded-xl transition
          ${darkMode ? "text-gray-400 hover:text-white hover:bg-slate-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
        <LuArrowLeft size={16} /> {t.back}
      </button>

      {/* Asosiy karta */}
      <div>
        <div className={`rounded-2xl p-8 shadow-lg mb-4 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg shrink-0">
              {profile.avatarUrl || profile.photoURL ? (
                <img src={profile.avatarUrl || profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold" style={getNameStyleByKey(profile.nameColor)}>
                  {profile.displayName?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Ma'lumotlar */}
            <div className="text-center sm:text-left flex-1">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {profile.displayName || t.unknownUser}
              </h2>

              {profile.email && (
                <p className={`text-sm mt-1 flex items-center gap-1 justify-center sm:justify-start ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <LuMail size={13} /> {profile.email}
                </p>
              )}
              {profile.phone && (
                <p className={`text-sm mt-1 flex items-center gap-1 justify-center sm:justify-start ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <LuPhone size={13} /> {profile.phone}
                </p>
              )}
              {profile.bio && (
                <p className={`text-sm mt-2 italic ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  "{profile.bio}"
                </p>
              )}

              <span className="mt-3 inline-block text-xs bg-blue-400/20 text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                <LuBadgeCheck size={12} /> {t.activeLearner}
              </span>
            </div>
          </div>

          {/* Statistika */}
          {hasStats && (
            <div className={`mt-6 pt-6 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 ${darkMode ? "border-slate-700" : "border-gray-100"}`}>
              {xp > 0 && (
                <div className={`text-center p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuStar size={14} className="text-yellow-400" />
                    <p className="text-xl font-bold text-yellow-400">{xp.toLocaleString()}</p>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>XP {t.points}</p>
                </div>
              )}
              {streak > 0 && (
                <div className={`text-center p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuFlame size={14} className="text-orange-400" />
                    <p className="text-xl font-bold text-orange-400">{streak}</p>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.streakDays}</p>
                </div>
              )}
              {level && (
                <div className={`text-center p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuTrophy size={14} className="text-purple-400" />
                    <p className="text-xl font-bold text-purple-400">{level}</p>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.level}</p>
                </div>
              )}
              {coins > 0 && (
                <div className={`text-center p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <LuCoins size={16} className="text-yellow-400" />
                    <p className="text-xl font-bold text-yellow-500">{coins}</p>
                  </div>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.coins}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
