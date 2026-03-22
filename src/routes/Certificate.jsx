import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import {
  LuDownload, LuAward, LuStar, LuCalendar,
  LuUser, LuBadgeCheck, LuPrinter,
} from "react-icons/lu";

const COURSES = [
  { id: 1, title: "HTML Asoslar",         category: "HTML",       color: "#e44d26", duration: "12 soat", instructor: "Jasur Toshmatov" },
  { id: 2, title: "CSS & Flexbox To'liq", category: "CSS",        color: "#264de4", duration: "18 soat", instructor: "Nilufar Karimova" },
  { id: 3, title: "JavaScript To'liq",    category: "JavaScript", color: "#d4a017", duration: "36 soat", instructor: "Bobur Yusupov" },
  { id: 4, title: "React.js Zamonaviy",   category: "React",      color: "#0ea5e9", duration: "30 soat", instructor: "Sardor Nazarov" },
  { id: 5, title: "Ingliz Tili A1→B2",   category: "English",    color: "#003580", duration: "60 soat", instructor: "Malika Ergasheva" },
  { id: 6, title: "Rus Tili Asosiy",      category: "Russian",    color: "#c0392b", duration: "45 soat", instructor: "Alisher Hamidov" },
  { id: 7, title: "Fransuz Tili",         category: "French",     color: "#002395", duration: "40 soat", instructor: "Dilorom Saidova" },
  { id: 8, title: "HTML5 & Semantik",     category: "HTML",       color: "#e44d26", duration: "8 soat",  instructor: "Kamol Rashidov" },
];

const LEVELS = [
  { level: 1,  name: "Yangi boshlovchi", minXP: 0,     badge: "🌱" },
  { level: 2,  name: "O'quvchi",         minXP: 100,   badge: "📚" },
  { level: 3,  name: "Izlanuvchi",       minXP: 300,   badge: "🔍" },
  { level: 4,  name: "Bilimdon",         minXP: 600,   badge: "🧠" },
  { level: 5,  name: "Mahir",            minXP: 1000,  badge: "⚡" },
  { level: 6,  name: "Ekspert",          minXP: 1500,  badge: "🎯" },
  { level: 7,  name: "Usta",             minXP: 2500,  badge: "🏆" },
  { level: 8,  name: "Professional",     minXP: 4000,  badge: "💎" },
  { level: 9,  name: "Champion",         minXP: 6000,  badge: "👑" },
  { level: 10, name: "Legenda",          minXP: 10000, badge: "🌟" },
];

const getLevel  = (xp = 0) => LEVELS.slice().reverse().find((l) => xp >= l.minXP) || LEVELS[0];
const formatDate = (date = new Date()) =>
  date.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" });

// ─── Sertifikat preview ───────────────────────────────────────────────────────
const CertificatePreview = ({ userName, course, date, certId, xp }) => {
  const level = getLevel(xp);
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
            <span style={{ fontSize: 28 }}>🏆</span>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, #f59e0b)" }} />
          </div>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 4, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>
            Uzbekas Pixel
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>
            SERTIFIKAT
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8", letterSpacing: 3, textTransform: "uppercase" }}>
            Certificate of Completion
          </p>
        </div>

        {/* Ism */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "#94a3b8", letterSpacing: 1 }}>
            Ushbu sertifikat taqdim etiladi
          </p>
          <div style={{ margin: "0 0 6px", padding: "10px 32px", borderBottom: "2px solid #f59e0b44", display: "inline-block" }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#f59e0b", fontStyle: "italic" }}>
              {userName || "Foydalanuvchi"}
            </h2>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "#94a3b8" }}>
            quyidagi kursni muvaffaqiyatli tugatganligi uchun
          </p>
        </div>

        {/* Kurs nomi */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-block", padding: "14px 32px", background: course.color + "22", border: `2px solid ${course.color}`, borderRadius: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Kurs nomi</p>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>{course.title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: course.color }}>{course.category} · {course.duration}</p>
          </div>
        </div>

        {/* Info qator */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          {[
            { label: "O'qituvchi", value: course.instructor, icon: "👨‍🏫" },
            { label: "Daraja",     value: `${level.badge} ${level.name}`, icon: "⭐" },
            { label: "Sana",       value: date, icon: "📅" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 2px", fontSize: 18 }}>{item.icon}</p>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #334155" }}>
          <div>
            <div style={{ width: 80, height: 1, background: "#f59e0b", marginBottom: 4 }} />
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>Uzbekas Pixel rasmiy imzosi</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: "2px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}>
              <span style={{ fontSize: 20 }}>✓</span>
            </div>
            <p style={{ margin: 0, fontSize: 9, color: "#64748b", letterSpacing: 1 }}>TASDIQLANGAN</p>
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

// ─── Main Certificate ─────────────────────────────────────────────────────────
const Certificate = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [userName, setUserName]             = useState("");
  const [xp, setXp]                         = useState(0);
  const [printing, setPrinting]             = useState(false);
  const [date]                              = useState(formatDate());
  const [certId]                            = useState(`UZP-${Date.now().toString(36).toUpperCase()}`);

  useEffect(() => {
    if (!user) return;
    setUserName(user.displayName || user.email?.split("@")[0] || "");
    getDoc(doc(db, "users", user.uid, "data", "stats"))
      .then((snap) => { if (snap.exists()) setXp(snap.data().xp || 0); })
      .catch(console.error);
  }, [user]);

  // ── Print ─────────────────────────────────────────────────────────────────
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
          <title>Sertifikat — ${userName}</title>
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
          <script>window.onload=()=>{window.print();window.close();}<\/script>
        </body>
        </html>
      `);
      win.document.close();
      setPrinting(false);
      showToast?.("Sertifikat chop etilmoqda! 🖨️", "success");
    }, 400);
  };

  // ── Download — Canvas API (tashqi kutubxonasiz) ───────────────────────────
  const handleDownload = async () => {
    if (!userName) { showToast?.("Ismingizni kiriting!", "error"); return; }
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
          link.download   = `sertifikat-${userName.replace(/\s/g, "_")}-${selectedCourse.category}.png`;
          link.href       = canvas.toDataURL("image/png");
          link.click();
          showToast?.("Sertifikat yuklab olindi! 📥", "success");
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

  const level = getLevel(xp);

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "40px 16px 80px" }}>
      <ScrollReveal direction="up">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            🏆 Sertifikatlar
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>
            Sertifikat Yaratish
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            Tugatgan kursingiz uchun rasmiy sertifikat oling
          </p>
        </div>

        {/* Sozlamalar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>

          {/* Ism */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuUser size={14} /> Ismingiz
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="To'liq ismingiz..."
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Daraja */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuStar size={14} /> Sizning darajangiz
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
              <span style={{ fontSize: 22 }}>{level.badge}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>{level.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{xp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>

          {/* Sana */}
          <div style={{ padding: "20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <LuCalendar size={14} /> Sana
            </label>
            <div style={{ padding: "10px 12px", borderRadius: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>
              {date}
            </div>
          </div>
        </div>

        {/* Kurs tanlash */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            <LuAward size={16} /> Kurs tanlang
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {COURSES.map((course) => (
              <button key={course.id} onClick={() => setSelectedCourse(course)}
                style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${selectedCourse.id === course.id ? course.color : (darkMode ? "#334155" : "#e5e7eb")}`, background: selectedCourse.id === course.id ? course.color + "22" : (darkMode ? "#1e293b" : "#fff"), cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: selectedCourse.id === course.id ? course.color : (darkMode ? "#f1f5f9" : "#111") }}>
                  {course.title}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{course.duration}</p>
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Sertifikat preview */}
      <ScrollReveal direction="up" delay={100}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
            <LuBadgeCheck size={16} /> Sertifikat ko'rinishi
          </p>
          <CertificatePreview
            userName={userName}
            course={selectedCourse}
            date={date}
            certId={certId}
            xp={xp}
          />
        </div>

        {/* Tugmalar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleDownload}
            disabled={printing || !userName}
            style={{ flex: 1, minWidth: 160, padding: "14px 24px", borderRadius: 12, border: "none", background: printing || !userName ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: printing || !userName ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
            {printing
              ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> Tayyorlanmoqda...</>
              : <><LuDownload size={18} /> PNG yuklab olish</>
            }
          </button>

          <button
            onClick={handlePrint}
            disabled={printing || !userName}
            style={{ flex: 1, minWidth: 160, padding: "14px 24px", borderRadius: 12, border: `2px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: "transparent", color: darkMode ? "#f1f5f9" : "#374151", fontSize: 14, fontWeight: 700, cursor: printing || !userName ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LuPrinter size={18} /> Chop etish
          </button>
        </div>

        {!userName && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#ef4444", textAlign: "center" }}>
            ⚠️ Yuklab olish uchun ismingizni kiriting
          </p>
        )}
      </ScrollReveal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Certificate;