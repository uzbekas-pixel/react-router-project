import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // O'zingizdagi to'g'ri yo'lni tekshiring
import { useNavigate } from "react-router-dom";

// ✅ React Icons'dan kerakli kutubxonalarni import qilish
import { FaUsers, FaStar, FaComments, FaFrown, FaLanguage, FaBook,FaRocket,FaHandsHelping } from "react-icons/fa"; // Umumiy va tillar uchun
import { DiHtml5, DiCss3, DiJavascript1, DiReact } from "react-icons/di"; // Texnologiyalar uchun (Devicons)

const Supports = ({ darkMode, showToast }) => {
  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Barchasi");
  const navigate = useNavigate();

  // ✅ Yo'nalishlar ma'lumotlari (Aniq React Icons bilan)
  // HTML5, Rus tili, Fransuz tili shu yerda
  const subjectMap = {
    "Barchasi": { icon: FaUsers, color: "text-gray-500", bgColor: "bg-gray-100" },
    "HTML5": { icon: DiHtml5, color: "text-red-500", bgColor: "bg-red-100" }, // Devicon
    "CSS": { icon: DiCss3, color: "text-blue-500", bgColor: "bg-blue-100" }, // Devicon
    "JavaScript": { icon: DiJavascript1, color: "text-yellow-500", bgColor: "bg-yellow-100" }, // Devicon
    "React": { icon: DiReact, color: "text-cyan-500", bgColor: "bg-cyan-100" }, // Devicon
    "English": { icon: FaLanguage, color: "text-green-600", bgColor: "bg-green-100" },
    "Rus tili": { icon: FaBook, color: "text-amber-700", bgColor: "bg-amber-100" },
    "Fransuz tili": { icon: FaBook, color: "text-blue-800", bgColor: "bg-indigo-100" },
  };

  // Filtr tugmalari ro'yxati
  const filterOptions = Object.keys(subjectMap);

  useEffect(() => {
    const fetchSupports = async () => {
      try {
        // Faqat isSupport: true bo'lganlarni chaqiramiz
        const q = query(collection(db, "users"), where("isSupport", "==", true));
        const snap = await getDocs(q);
        const supportsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ma'lumotlar bazasidan kelgan supportSubjects massividagi "HTML"ni "HTML5"ga to'g'rilash (ixtiyoriy, agar bazada HTML deb saqlangan bo'lsa)
        const correctedData = supportsData.map(support => ({
          ...support,
          supportSubjects: support.supportSubjects?.map(subj => subj === "HTML" ? "HTML5" : subj)
        }));

        setSupports(correctedData);
      } catch (error) {
        console.error("Supportlarni yuklashda xato:", error);
        showToast?.("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSupports();
  }, [showToast]);

  const filteredSupports = filter === "Barchasi" 
    ? supports 
    : supports.filter(s => s.supportSubjects?.includes(filter));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className={`text-4xl font-extrabold mb-3 flex
            justify-center gap-2 
             ${darkMode ? "text-white" : "text-gray-950"}`}>
          <FaHandsHelping className="text-indigo-500 animate-bounce mt-1"/>Platforma Ko'makchilari (Supports)
        </h1>
        <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Kurslarni muvaffaqiyatli tugatgan va boshqalarga yordam berishga tayyor o'quvchilar
        </p>
      </div>

      {/* ✅ Filtrlar (React Icons bilan, chiroyli dizayn) */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-10 p-4 rounded-3xl dark:bg-slate-900 bg-white shadow-inner border border-gray-100 dark:border-slate-800">
        {filterOptions.map(subjName => {
          const { icon: Icon, color: textColor } = subjectMap[subjName];
          const isActive = filter === subjName;
          return (
            <button
              key={subjName}
              onClick={() => setFilter(subjName)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 hover:shadow-md ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg scale-105" 
                  : darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className={`text-xl ${isActive ? "text-white" : textColor}`} />
              {subjName}
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
          <h3 className="text-xl font-bold mb-2">Hozircha ko'makchilar yo'q</h3>
          <p className="flex justify-center gap-2">Ushbu yo'nalishda hali dars tugatgan supportlarimiz yo'q. Birinchi bo'lish imkoniyati sizda! <FaRocket className="text-blue-400 animate-bounce mt-1"/></p>
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
                  {/* ✅ "Top Mentor" yulduz piktogrammasi bilan */}
                  <p className="text-sm text-yellow-500 font-bold flex items-center gap-1.5 mt-0.5">
                    <FaStar className="text-yellow-400" /> Top Mentor
                  </p>
                </div>
              </div>
              
              {/* ✅ Yo'nalish nishonlari (har biri o'z React Icons piktogrammasi bilan) */}
              <div className="mb-8 flex flex-wrap gap-2.5">
                {support.supportSubjects?.map(subj => {
                  const subjectInfo = subjectMap[subj];
                  const Icon = subjectInfo ? subjectInfo.icon : FaBook; // Fallback icon
                  const colorClass = subjectInfo ? subjectInfo.color : "text-gray-500";
                  const bgColorClass = subjectInfo ? subjectInfo.bgColor : "bg-gray-100";
                  return (
                    <span key={subj} className={`px-3 py-1.5 ${bgColorClass} ${colorClass} text-xs rounded-lg font-extrabold flex items-center gap-2 shadow-inner border border-current/10 dark:bg-slate-900`}>
                      <Icon className={`text-lg`} />
                      {subj}
                    </span>
                  );
                })}
              </div>

              {/* ✅ "Savol so'rash" tugmasi chat piktogrammasi bilan */}
              <button 
                onClick={() => navigate(`/dm?user=${support.id}`)} // Agar sizda DM/Chat tizimi bo'lsa
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-300 flex justify-center items-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
              >
                <FaComments className="text-2xl" />
                Savol so'rash
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Supports;