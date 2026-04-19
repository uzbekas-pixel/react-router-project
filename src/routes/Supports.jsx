import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/useLang";

// React Icons'dan kerakli kutubxonalarni import qilish
import { FaUsers, FaStar, FaComments, FaFrown, FaLanguage, FaBook, FaRocket, FaHandsHelping } from "react-icons/fa";
import { DiHtml5, DiCss3, DiJavascript1, DiReact } from "react-icons/di";

const Supports = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | subject database value
  const navigate = useNavigate();

  // Yo'nalishlar ma'lumotlari - database qiymatlari (inglizcha)
  // Keylar database'dagi qiymatlarga mos (HTML, CSS, JavaScript, React, English, Russian, French)
  const subjectConfig = {
    "HTML": { icon: DiHtml5, color: "text-red-500", bgColor: "bg-red-100", labelKey: "supportsSubjectHTML" },
    "CSS": { icon: DiCss3, color: "text-blue-500", bgColor: "bg-blue-100", labelKey: "supportsSubjectCSS" },
    "JavaScript": { icon: DiJavascript1, color: "text-yellow-500", bgColor: "bg-yellow-100", labelKey: "supportsSubjectJS" },
    "React": { icon: DiReact, color: "text-cyan-500", bgColor: "bg-cyan-100", labelKey: "supportsSubjectReact" },
    "English": { icon: FaLanguage, color: "text-green-600", bgColor: "bg-green-100", labelKey: "supportsSubjectEnglish" },
    "Russian": { icon: FaBook, color: "text-amber-700", bgColor: "bg-amber-100", labelKey: "supportsSubjectRussian" },
    "French": { icon: FaBook, color: "text-blue-800", bgColor: "bg-indigo-100", labelKey: "supportsSubjectFrench" },
  };

  useEffect(() => {
    const fetchSupports = async () => {
      try {
        // Faqat isSupport: true bo'lganlarni chaqiramiz
        const q = query(collection(db, "users"), where("isSupport", "==", true));
        const snap = await getDocs(q);
        const supportsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ma'lumotlar bazasidan kelgan supportSubjects massividagi eski qiymatlarni yangilash
        // "Rus tili" -> "Russian", "Fransuz tili" -> "French"
        const correctedData = supportsData.map(support => ({
          ...support,
          supportSubjects: support.supportSubjects?.map(subj => {
            if (subj === "Rus tili") return "Russian";
            if (subj === "Fransuz tili") return "French";
            return subj;
          })
        }));

        setSupports(correctedData);
      } catch (error) {
        console.error("Supportlarni yuklashda xato:", error);
        showToast?.(t.supportsDataError, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSupports();
  }, [showToast]);

  const filteredSupports = filter === "all" 
    ? supports 
    : supports.filter(s => s.supportSubjects?.includes(filter));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-extrabold mb-3 flex
            justify-center gap-2 
             ${darkMode ? "text-white" : "text-gray-950"}`}>
          <FaHandsHelping className="text-indigo-500 animate-bounce mt-1"/>{t.supportsTitle}
        </h1>
        <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {t.supportsSubtitle}
        </p>
      </div>

      {/* Filters with React Icons */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-10 p-4 rounded-3xl dark:bg-slate-900 bg-white shadow-inner border border-gray-100 dark:border-slate-800">
        {/* "All" / "Barchasi" button */}
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 hover:shadow-md ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-lg scale-105" 
              : darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaUsers className={`text-xl ${filter === "all" ? "text-white" : "text-gray-500"}`} />
          {t.supportsFilterAll || "All"}
        </button>
        {/* Subject buttons */}
        {Object.entries(subjectConfig).map(([dbValue, config]) => {
          const { icon: Icon, color: textColor, labelKey } = config;
          const isActive = filter === dbValue;
          const label = t[labelKey] || dbValue;
          return (
            <button
              key={dbValue}
              onClick={() => setFilter(dbValue)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 hover:shadow-md ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg scale-105" 
                  : darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className={`text-xl ${isActive ? "text-white" : textColor}`} />
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSupports.length === 0 ? (
        <div className={`text-center py-20 px-6 rounded-3xl border-2 border-dashed ${darkMode ? "border-slate-700 bg-slate-800/50 text-gray-500" : "border-gray-300 bg-gray-50 text-gray-500"}`}>
          <FaFrown className="text-7xl mx-auto mb-5 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">{t.supportsNoHelpers}</h3>
          <p className="flex justify-center gap-2">{t.supportsNoHelpersDesc} <FaRocket className="text-blue-400 animate-bounce mt-1"/></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSupports.map(support => (
            <div key={support.id} className={`p-7 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? "bg-slate-800 border-slate-700 hover:shadow-2xl hover:shadow-blue-900/20" : "bg-white border-gray-100 hover:shadow-2xl"}`}>
              {/* Card Tepasi: Avatar va Ism */}
              <div className="flex items-center gap-5 mb-6 pb-5 border-b-2 dark:border-slate-700 border-gray-100">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-extrabold overflow-hidden shadow-lg border-4 border-white dark:border-slate-700">
                  {support.photoURL ? <img src={support.photoURL} alt="avatar" className="w-full h-full object-cover" /> : (support.displayName?.[0] || "?")}
                </div>
                <div>
                  <h3 className={`font-extrabold text-xl ${darkMode ? "text-white" : "text-gray-950"}`}>
                    {support.displayName || "Foydalanuvchi"}
                  </h3>
                  {/* "Top Mentor" yulduz piktogrammasi bilan */}
                  <p className="text-sm text-yellow-500 font-bold flex items-center gap-1.5 mt-0.5">
                    <FaStar className="text-yellow-400" /> {t.supportsTopMentor}
                  </p>
                </div>
              </div>
              
              {/* Yo'nalish nishonlari (har biri o'z React Icons piktogrammasi bilan) */}
              <div className="mb-8 flex flex-wrap gap-2.5">
                {support.supportSubjects?.map(subj => {
                  const config = subjectConfig[subj];
                  const Icon = config ? config.icon : FaBook; // Fallback icon
                  const colorClass = config ? config.color : "text-gray-500";
                  const bgColorClass = config ? config.bgColor : "bg-gray-100";
                  const label = config ? (t[config.labelKey] || subj) : subj;
                  return (
                    <span key={subj} className={`px-3 py-1.5 ${bgColorClass} ${colorClass} text-xs rounded-lg font-extrabold flex items-center gap-2 shadow-inner border border-current/10 dark:bg-slate-900`}>
                      <Icon className={`text-lg`} />
                      {label}
                    </span>
                  );
                })}
              </div>

              {/* "Savol so'rash" tugmasi chat piktogrammasi bilan */}
              <button 
                onClick={() => navigate(`/dm?user=${support.id}`)} // Agar sizda DM/Chat tizimi bo'lsa
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-300 flex justify-center items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
              >
                <FaComments className="text-2xl" />
                {t.supportsAskQuestion}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Supports;
