import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  LuDownload, LuUser, LuMail, LuPhone, LuBriefcase, 
  LuGraduationCap, LuAward, LuGlobe, LuMapPin, LuShield, LuCrown, LuCheck 
} from "react-icons/lu";
import { useLang } from "../context/useLang";

const ResumeBuilder = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const resumeRef = useRef();
  const [userData, setUserData] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // 1. Foydalanuvchi asosiy ma'lumotlari
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setUserData(userSnap.data());

        // 2. Tugatilgan kurslarni olish (progress 100 bo'lganlar)
        const coursesSnap = await getDocs(collection(db, "users", user.uid, "progress"));
        const completed = coursesSnap.docs
          .map(d => d.data())
          .filter(c => c.progress === 100);
        setCompletedCourses(completed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const downloadPDF = async () => {
    const element = resumeRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${userData?.displayName || t.unknownUser}_UzbekasPixel.pdf`);
    showToast(t.resumeDownloaded, "success");
  };

  if (loading) return <div className="p-20 text-center">{t.loading}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
            {t.cvGenerator}
          </h1>
          <p className="text-slate-500 text-sm">{t.resumeSubtitle}</p>
        </div>
        <button 
          onClick={downloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <LuDownload size={20} /> {t.downloadPDF}
        </button>
      </div>

      {/* ——— REZYUME SHABLONI (A4 formatiga yaqin dizayn) ——— */}
      <div 
        ref={resumeRef}
        className={`w-full bg-white text-slate-900 p-10 shadow-2xl rounded-sm border border-gray-200 overflow-hidden mx-auto`}
        style={{ minHeight: "297mm", width: "210mm" }}
      >
        {/* Header Section */}
        <div className="flex items-center gap-8 border-b-4 border-blue-600 pb-8 mb-8">
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
            {userData?.avatarUrl ? (
              <img src={userData.avatarUrl} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300">?</div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
              {userData?.displayName || t.unknownUser}
            </h2>
            <p className="text-blue-600 font-bold text-xl mb-4">{t.juniorWebDeveloper}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-2"><LuMail size={14}/> {user?.email}</span>
              <span className="flex items-center gap-2"><LuPhone size={14}/> {userData?.phone || "+998 -- --- -- --"}</span>
              <span className="flex items-center gap-2"><LuMapPin size={14}/> {t.uzbekistan}</span>
              <span className="flex items-center gap-2"><LuGlobe size={14}/> uzbekas-pixel.uz</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Chap ustun */}
          <div className="col-span-4 space-y-8">
            <section>
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LuAward /> {t.statuses}
              </h3>
              <div className="space-y-2">
                {userData?.isSupport && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800 font-bold text-xs flex items-center gap-2">
                    <LuShield size={14} /> {t.officialSupport}
                  </div>
                )}
                {userData?.isMentor && (
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-800 font-bold text-xs flex items-center gap-2">
                    <LuCrown size={14} /> {t.topMentor}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LuCheck /> {t.skills}
              </h3>
              <div className="flex flex-wrap gap-2">
                {userData?.supportSubjects?.map(s => (
                  <span key={s} className="bg-slate-100 px-3 py-1 rounded-md text-xs font-bold text-slate-700">
                    {s}
                  </span>
                )) || <span className="text-slate-400 text-xs italic">{t.noSkills}</span>}
              </div>
            </section>
          </div>

          {/* O'ng ustun */}
          <div className="col-span-8 space-y-8 border-l border-slate-100 pl-10">
            <section>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <LuUser className="text-blue-600" /> {t.personalProfile}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {userData?.bio || t.defaultBio}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <LuGraduationCap className="text-blue-600" /> {t.completedCourses}
              </h3>
              <div className="space-y-4">
                {completedCourses.length > 0 ? completedCourses.map((c, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{c.courseTitle}</h4>
                      <p className="text-xs text-slate-500 italic">Uzbekas Pixel Onlayn Ta'lim Platformasi</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {t.certified}
                    </span>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic">{t.noCompletedCourses}</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                <LuBriefcase className="text-blue-600" /> {t.experienceActivity}
              </h3>
              <div className="space-y-4 text-sm text-slate-600">
                <p>• {t.experienceText1}</p>
                <p>• {t.experienceText2}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            {t.resumeFooter}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
