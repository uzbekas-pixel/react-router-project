import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import {
  LuDownload, LuAward, LuStar, LuCalendar,
  LuUser, LuBadgeCheck, LuPrinter, LuGraduationCap, LuSprout, LuBookOpen, LuSearch, LuBrain, LuZap, LuTarget, LuTrophy, LuGem, LuCrown, LuCheck, LuTriangleAlert,
} from "react-icons/lu";
import { useLang } from "../context/useLang";

const getCertificateCourses = (t) => [
  { id: 1, title: t.course_html_basis || "HTML Asoslar",         category: "HTML",       color: "#e44d26",  instructor: "Uzbekas AI" },
  { id: 2, title: t.course_css_flex  || "CSS & Flexbox To'liq", category: "CSS",        color: "#264de4",  instructor: "Uzbekas AI" },
  { id: 3, title: t.course_js_full   || "JavaScript To'liq",    category: "JavaScript", color: "#d4a017",  instructor: "Uzbekas AI" },
  { id: 4, title: t.course_react_mod || "React.js Zamonaviy",   category: "React",      color: "#0ea5e9",  instructor: "Uzbekas AI" },
  { id: 5, title: t.course_en_a1b2   || "Ingliz Tili A1→B2",   category: "English",    color: "#003580",  instructor: "Uzbekas AI" },
  { id: 6, title: t.course_ru_basis  || "Rus Tili Asosiy",      category: "Russian",    color: "#c0392b",  instructor: "Uzbekas AI" },
  { id: 7, title: t.course_fr_full   || "Fransuz Tili",         category: "French",     color: "#002395",  instructor: "  Uzbekas AI" },
  { id: 8, title: t.course_html5_sem || "HTML5 & Semantik",     category: "HTML",       color: "#e44d26",  instructor: "Uzbekas AI" },
];

// Kurs kategoriyasiga qarab darajani olish
const getCourseLevel = (course, t) => {
  const levels = {
    "HTML": { name: t.levelHTML || "HTML Developer", badge: <LuBookOpen />, color: "#e44d26" },
    "CSS": { name: t.levelCSS || "CSS Expert", badge: <LuSearch />, color: "#264de4" },
    "JavaScript": { name: t.levelJS || "JavaScript Specialist", badge: <LuBrain />, color: "#d4a017" },
    "React": { name: t.levelReact || "React Developer", badge: <LuZap />, color: "#0ea5e9" },
    "English": { name: t.levelEnglish || "English Learner", badge: <LuTrophy />, color: "#003580" },
    "Russian": { name: t.levelRussian || "Russian Learner", badge: <LuTrophy />, color: "#c0392b" },
    "French": { name: t.levelFrench || "French Learner", badge: <LuTrophy />, color: "#002395" },
  };
  
  return levels[course?.category] || { name: t.levelDefault || "Developer", badge: <LuStar />, color: "#3b82f6" };
};
const formatDate = (lang) =>
  new Date().toLocaleDateString(lang === "uz" ? "uz-UZ" : "en-US", { year: "numeric", month: "long", day: "numeric" });

// в”Ђв”Ђв”Ђ Sertifikat preview в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const CertificatePreview = ({ userName, course, date, certId, xp, t }) => {
  const level = getCourseLevel(course, t);
  return (
    <div
      id="certificate-preview"
      style={{
        width: "100%", maxWidth: 800,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: 20, overflow: "hidden",
        border: "3px solid #f59e0b",
        boxShadow: "0 0 60px rgba(245,158,11,0.3)",
        position: "relative",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Burchak bezaklari */}
      {[
        { top: 12,   left: 12,   borderTop: "2px solid #f59e0b",    borderLeft:   "2px solid #f59e0b"   },
        { top: 12,   right: 12,  borderTop: "2px solid #f59e0b",    borderRight:  "2px solid #f59e0b"   },
        { bottom: 12, left: 12,  borderBottom: "2px solid #f59e0b", borderLeft:   "2px solid #f59e0b"   },
        { bottom: 12, right: 12, borderBottom: "2px solid #f59e0b", borderRight:  "2px solid #f59e0b"   },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", width: 40, height: 40, ...style }} />
      ))}

      {/* Fon pattern */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(circle, #f59e0b 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

      {/* Kontent */}
      <div style={{ padding: "40px 48px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, #f59e0b)" }} />
            <span style={{ fontSize: 24, color: "#f59e0b" }}><LuTrophy /></span>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, #f59e0b)" }} />
          </div>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 4, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>
            Uzbekas Pixel
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>
            {t.certificateTitle.toUpperCase()}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8", letterSpacing: 3, textTransform: "uppercase" }}>
            {t.certOfCompletion}
          </p>
        </div>

        {/* Ism */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8", letterSpacing: 1 }}>
            {t.certPresentedTo}
          </p>
          <div style={{ margin: "0 0 6px", padding: "10px 32px", borderBottom: "2px solid #f59e0b44", display: "inline-block" }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#f59e0b", fontStyle: "italic" }}>
              {userName || t.unknown || "Foydalanuvchi"}
            </h2>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "#94a3b8" }}>
            {t.certSuccessMsg}
          </p>
        </div>

        {/* Kurs nomi */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-block", padding: "14px 32px", background: course.color + "22", border: `2px solid ${course.color}`, borderRadius: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>{t.certCourseName}</p>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>{course.title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: course.color }}>{course.category} В· {course.duration}</p>
          </div>
        </div>

        {/* Info qator */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          {[
            { label: t.certInstructor, value: course.instructor, icon: <LuGraduationCap /> },
            { label: t.levelLabel.charAt(0).toUpperCase() + t.levelLabel.slice(1),     value: level.name, icon: <span style={{ color: level.color }}>{level.badge}</span> },
            { label: t.certDate,       value: date, icon: <LuCalendar /> },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 2px", fontSize: 22, color: "#f59e0b", display: "flex", justifyContent: "center" }}>{item.icon}</p>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #334155" }}>
          <div>
            <div style={{ width: 80, height: 1, background: "#f59e0b", marginBottom: 4 }} />
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{t.certSignature}</p>
          </div>
          {/* PECHAT - Uzbekas Pixel Coding Corporations */}
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "3px double #1e40af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 4px",
              position: "relative",
              background: "rgba(30, 64, 175, 0.05)",
              boxShadow: "0 0 20px rgba(30, 64, 175, 0.3), inset 0 0 20px rgba(30, 64, 175, 0.1)"
            }}>
              {/* Ichki chegara */}
              <div style={{
                position: "absolute",
                inset: 6,
                borderRadius: "50%",
                border: "1px solid #1e40af"
              }} />
              {/* Atrafdagi yozuv */}
              <svg viewBox="0 0 100 100" style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <defs>
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <text fill="#1e40af" fontSize="8" fontWeight="700" letterSpacing="2">
                  <textPath href="#circlePath">
                    UZBEKAS PIXEL CODING CORPORATIONS
                  </textPath>
                </text>
              </svg>
              {/* TUGATILDI yozuvi */}
              <div style={{
                textAlign: "center",
                zIndex: 1,
                transform: "rotate(-5deg)"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#1e40af",
                  letterSpacing: 1,
                  lineHeight: 1,
                  textShadow: "0 0 5px rgba(30, 64, 175, 0.5)"
                }}>
                  {t.certStamp || "TUGATILDI"}
                </p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>ID: {certId}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>uzbekas.vercel.app</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// в”Ђв”Ђв”Ђ Main Certificate в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const Certificate = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const courses = React.useMemo(() => getCertificateCourses(t), [t]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [userName, setUserName]             = useState("");
  const [xp, setXp]                         = useState(0);
  const [printing, setPrinting]             = useState(false);
  const [date]                              = useState(formatDate(lang));
  const [certId]                            = useState(`UZP-${Date.now().toString(36).toUpperCase()}`);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    setSelectedCourse(courses[0]);
  }, [courses]);

  useEffect(() => {
    if (!user) return;
    setUserName(user.displayName || user.email?.split("@")[0] || "");
    
    // XP ni olish
    getDoc(doc(db, "users", user.uid, "data", "stats"))
      .then((snap) => { if (snap.exists()) setXp(snap.data().xp || 0); })
      .catch(console.error);
    
    // Tugatilgan kurslarni olish (progress 100% bo'lgan kurslar)
    const loadCompletedCourses = async () => {
      try {
        console.log("Loading progress for user:", user.uid);
        const progressSnapshot = await getDocs(collection(db, "users", user.uid, "progress"));
        const completed = [];
        progressSnapshot.forEach((doc) => {
          const data = doc.data();
          const courseId = Number(doc.id);
          console.log(`Course ${courseId} progress:`, data.progress, "completedLessons:", data.completedLessons?.length);
          
          // Faqat progress 100% bo'lsa tugatilgan hisoblanadi
          const progress = Number(data.progress) || 0;
          const isCompleted = progress === 100;
          
          if (isCompleted) {
            completed.push(courseId);
            console.log(`✅ Course ${courseId} is COMPLETED (progress: ${progress}%)`);
          } else {
            console.log(`❌ Course ${courseId} NOT completed (progress: ${progress}%)`);
          }
        });
        console.log("Total completed courses:", completed);
        setCompletedCourses(completed);
        // Agar hozirgi tanlangan kurs tugatilmagan bo'lsa, birinchi tugatilgan kursni tanlash
        if (completed.length > 0 && !completed.includes(selectedCourse.id)) {
          const firstCompleted = courses.find(c => completed.includes(c.id));
          if (firstCompleted) setSelectedCourse(firstCompleted);
        }
      } catch (err) {
        console.error("Error loading completed courses:", err);
      }
    };
    loadCompletedCourses();
  }, [user]);

  // в”Ђв”Ђ Print в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      const el = document.getElementById("certificate-preview");
      if (!el) { setPrinting(false); return; }

      const win = window.open("", "_blank");
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t.certificateTitle} — ${userName}</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh; }
            @media print {
              body { background:white; }
              @page { size:A4 landscape; margin:10mm; }
            }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>window.onload=()=>{window.print();window.close();}</script>
        </body>
        </html>
      `);
      win.document.close();
      setPrinting(false);
      showToast?.(t.certPrintingSuccess, "success");
    }, 400);
  };

  // в”Ђв”Ђ Download — Canvas API (tashqi kutubxonasiz) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleDownload = async () => {
    if (!userName) { showToast?.(t.certNameError, "error"); return; }
    setPrinting(true);

    try {
      // html2canvas ni CDN dan yuklash (xavfsiz usul)
      const script = document.createElement("script");
      script.src   = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = async () => {
        try {
          const el     = document.getElementById("certificate-preview");
          const canvas = await window.html2canvas(el, {
            scale:           2,
            backgroundColor: null,
            useCORS:         true,
            logging:         false,
          });
          const link      = document.createElement("a");
          link.download   = `cert-${userName.replace(/\s/g, "_")}-${selectedCourse.category}.png`;
          link.href       = canvas.toDataURL("image/png");
          link.click();
          showToast?.(t.certDownloadSuccess, "success");
        } catch {
          // Canvas ishlamasa print ga fallback
          handlePrint();
        } finally {
          setPrinting(false);
          // scripni tozalash
          document.head.removeChild(script);
        }
      };
      script.onerror = () => {
        // CDN ishlamasa print ga fallback
        handlePrint();
        setPrinting(false);
        document.head.removeChild(script);
      };
      document.head.appendChild(script);
    } catch {
      handlePrint();
      setPrinting(false);
    }
  };

  const level = getCourseLevel(selectedCourse, t);

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "40px 16px 80px" }}>
              {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            <LuAward className="inline-block mr-1" /> {t.certificateTitle}
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>
            {t.certificateSub}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            {t.certSubtitle}
          </p>
        </div>

        {/* Sozlamalar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>

          {/* Ism */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuUser size={14} /> {t.certFullName}
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.certPlaceholder}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Daraja */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuStar size={14} /> {t.certYourLevel}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
              <span style={{ fontSize: 22 }}>{level.badge}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>{level.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{xp.toLocaleString()} {t.xpLabel}</p>
              </div>
            </div>
          </div>

          {/* Sana */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuCalendar size={14} /> {t.certDate}
            </label>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>
              {date}
            </div>
          </div>
        </div>

        {/* Kurs tanlash */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            <LuAward size={16} /> {t.certChooseCourse}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {courses.map((course) => {
              const isCompleted = completedCourses.includes(course.id);
              const isSelected = selectedCourse.id === course.id;
              return (
                <button 
                  key={course.id} 
                  onClick={() => isCompleted && setSelectedCourse(course)}
                  disabled={!isCompleted}
                  style={{ 
                    padding: "12px 14px", 
                    borderRadius: 12, 
                    border: `2px solid ${isSelected ? course.color : isCompleted ? (darkMode ? "#334155" : "#e5e7eb") : (darkMode ? "#1e293b" : "#f1f5f4")}`, 
                    background: isSelected ? course.color + "22" : isCompleted ? (darkMode ? "#1e293b" : "#fff") : (darkMode ? "#0f172a" : "#f8fafc"), 
                    cursor: isCompleted ? "pointer" : "not-allowed", 
                    textAlign: "left", 
                    transition: "all 0.2s",
                    opacity: isCompleted ? 1 : 0.5,
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: isSelected ? course.color : isCompleted ? (darkMode ? "#f1f5f9" : "#111") : "#64748b" }}>
                      {course.title}
                    </p>
                    {!isCompleted && (
                      <span style={{ fontSize: 12, color: "#64748b" }}>🔒</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
                    {isCompleted ? course.duration : t.courseNotCompleted || "Tugatilmagan"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      
      {/* Sertifikat preview */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            <LuBadgeCheck size={16} /> {t.certView}
          </p>
          <CertificatePreview
            userName={userName}
            course={selectedCourse}
            date={date}
            certId={certId}
            xp={xp}
            t={t}
          />
        </div>

        {/* Tugmalar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleDownload}
            disabled={printing || !userName}
            style={{ flex: 1, minWidth: 160, padding: "14px 24px", borderRadius: 12, border: "none", background: printing || !userName ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: printing || !userName ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
            {printing
              ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> {t.certPreparing}</>
              : <><LuDownload size={18} /> {t.certDownloadPng}</>
            }
          </button>

          <button
            onClick={handlePrint}
            disabled={printing || !userName}
            style={{ flex: 1, minWidth: 160, padding: "14px 24px", borderRadius: 12, border: `2px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: "transparent", color: darkMode ? "#f1f5f9" : "#374151", fontSize: 14, fontWeight: 700, cursor: printing || !userName ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LuPrinter size={18} /> {t.certPrint}
          </button>
        </div>

        {!userName && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#ef4444", textAlign: "center" }}>
            <LuTriangleAlert className="inline-block mr-1" /> {t.certNameError}
          </p>
        )}
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
    </div>
  );
};

export default Certificate;
