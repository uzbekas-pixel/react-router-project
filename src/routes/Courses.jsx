import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { doc, setDoc, getDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  LuStar, LuUsers, LuGraduationCap, LuSearch, 
  LuHeart, LuBot, LuX, LuPuzzle, LuLaptop, 
  LuMessageSquare, LuRocket, LuArrowRight,
  LuTarget, LuCheck, LuLayoutDashboard,
  LuBookOpen, LuTrendingUp, LuSparkles, LuFilter,
  LuPlay, LuChevronRight, LuZap
} from "react-icons/lu";
import CourseDetail from "./CourseDetail";

const categoriesBase = ["HTML", "CSS", "JavaScript", "React", "English", "Russian", "French"];
const catColors = { 
  HTML: "#ff6b6b", 
  CSS: "#4ecdc4", 
  JavaScript: "#ffe66d", 
  React: "#45b7d1", 
  English: "#96ceb4", 
  Russian: "#feca57", 
  French: "#ff9ff3" 
};

const catGradients = {
  HTML: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  CSS: "linear-gradient(135deg, #4ecdc4 0%, #44a3aa 100%)",
  JavaScript: "linear-gradient(135deg, #ffe66d 0%, #f7b731 100%)",
  React: "linear-gradient(135deg, #45b7d1 0%, #2d98da 100%)",
  English: "linear-gradient(135deg, #96ceb4 0%, #5f9ea0 100%)",
  Russian: "linear-gradient(135deg, #feca57 0%, #e1b12c 100%)",
  French: "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)"
};

/* ═══ CSS injected for modern animations ═══ */
const MODERN_CSS = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.3)} 50%{box-shadow:0 0 40px rgba(59,130,246,0.6)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes scale-in { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.5s ease-out both; }
  .animate-scale-in { animation: scale-in 0.4s ease-out both; }
  .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
  .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
  
  .glass-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }
  
  .glass-card-dark {
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  
  .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
  
  .tilt-card { transform-style: preserve-3d; transition: transform 0.1s ease-out; }
  
  .glow-border {
    position: relative;
  }
  .glow-border::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(59,130,246,0.5), rgba(147,51,234,0.5), rgba(236,72,153,0.5));
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .glow-border:hover::before { opacity: 1; }
  
  .gradient-text {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .card-shine {
    position: relative;
    overflow: hidden;
  }
  .card-shine::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255,255,255,0.1) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .card-shine:hover::after {
    transform: translateX(100%);
  }
`;

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <LuStar
        key={s}
        size={14}
        className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-400"}
      />
    ))}
  </div>
);

const AIPreviewModal = ({ course, onClose, darkMode, onDetail, t, stats }) => {
  const accentColor = course.color || "#3b82f6";

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const features = [
    { icon: <LuBot size={20} />, label: t.aiTutorLabel, desc: t.aiTutorDesc },
    { icon: <LuLaptop size={20} />, label: t.interactiveLabLabel, desc: t.interactiveLabDesc },
    { icon: <LuPuzzle size={20} />, label: t.miniQuizLabel, desc: t.miniQuizDesc },
    { icon: <LuMessageSquare size={20} />, label: t.aiChatLabel, desc: t.aiChatDesc },
    { icon: <LuLayoutDashboard size={20} />, label: t.progressTrackerLabel, desc: t.progressTrackerDesc },
  ];

  const modalBg = darkMode ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.98)";
  const cardBg = darkMode ? "rgba(30,41,59,0.8)" : "rgba(248,250,252,0.9)";
  const textMain = darkMode ? "#f1f5f9" : "#0f172a";
  const textSub = darkMode ? "#94a3b8" : "#64748b";

  return (
    <div
      onClick={onClose}
      style={{ 
        position: "fixed", 
        inset: 0, 
        zIndex: 1000, 
        background: "rgba(0,0,0,0.8)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: 24,
        backdropFilter: "blur(16px)"
      }}
    >
      <div
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: "100%", 
          maxWidth: 520, 
          borderRadius: 24, 
          overflow: "hidden", 
          background: modalBg,
          border: `1px solid ${accentColor}33`,
          boxShadow: `0 0 0 1px ${accentColor}22, 0 25px 80px rgba(0,0,0,0.5)`
        }}
      >
        {/* Header with gradient */}
        <div style={{ 
          position: "relative", 
          height: 200, 
          background: catGradients[course.category] || `linear-gradient(135deg, ${accentColor} 0%, #1e293b 100%)`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
          
          <div className="animate-float" style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.3)"
          }}>
            <LuBot size={40} color="#fff" />
          </div>
          
          <button 
            onClick={onClose} 
            style={{ 
              position: "absolute", 
              top: 16, 
              right: 16, 
              background: "rgba(0,0,0,0.3)", 
              border: "1px solid rgba(255,255,255,0.2)", 
              borderRadius: "50%", 
              width: 36, 
              height: 36, 
              color: "#fff", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)"
            }}
          >
            <LuX size={18} />
          </button>
          
          <span style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            {course.category}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ 
              margin: "0 0 8px", 
              fontSize: 22, 
              fontWeight: 800, 
              color: textMain,
              lineHeight: 1.3 
            }}>
              {t.courseData[course.id]?.title || course.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Stars rating={stats?.rating} />
              {stats?.rating > 0 && (
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
                  {stats.rating.toFixed(1)}
                </span>
              )}
              <span style={{ fontSize: 13, color: textSub }}>
                ({(stats?.students || course.students || 0).toLocaleString()} {t.studentsLabel})
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{
            display: "grid",
            gap: 12,
            marginBottom: 24
          }}>
            {features.map((f, i) => (
              <div 
                key={i}
                className="hover-lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: cardBg,
                  border: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${accentColor}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: accentColor
                }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: textMain, marginBottom: 2 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 12, color: textSub }}>{f.desc}</div>
                </div>
                <LuCheck size={18} color={accentColor} />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: 28, 
                fontWeight: 900, 
                color: course.price === 0 ? "#10b981" : accentColor,
                lineHeight: 1 
              }}>
                {course.price === 0 ? t.freeLabel : `${course.price.toLocaleString()} ${t.priceLabel}`}
              </div>
              {course.price > 0 && (
                <div style={{ fontSize: 12, color: textSub, marginTop: 4 }}>{t.oneTimePayment}</div>
              )}
            </div>
            <button
              onClick={() => { onDetail(course.id); onClose(); }}
              style={{
                padding: "14px 28px",
                background: catGradients[course.category] || accentColor,
                color: "#fff",
                border: "none",
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: `0 10px 30px ${accentColor}44`
              }}
              className="hover-lift"
            >
              <LuRocket size={20} /> {t.startLesson}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, isFav, onToggleFav, onPlay, onDetail, darkMode, purchased, index, stats }) => {
  const { t } = useLang();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const localizedTitle = t.courseData[course.id]?.title || course.title;
  const gradient = catGradients[course.category] || `linear-gradient(135deg, ${course.color} 0%, #1e293b 100%)`;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: -x * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="animate-slide-up"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        background: darkMode ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
        boxShadow: isHovered 
          ? `0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px ${course.color}30` 
          : "0 4px 20px rgba(0,0,0,0.08)",
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? 20 : 0}px)`,
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
        display: "flex",
        flexDirection: "column",
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Thumbnail */}
      <div 
        onClick={() => onPlay(course)}
        style={{ 
          position: "relative", 
          height: 200, 
          overflow: "hidden",
          cursor: "pointer"
        }}
      >
        <img 
          src={course.thumbnail} 
          alt={localizedTitle} 
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.5s ease"
          }} 
        />
        
        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)`
        }} />
        
        {/* Play button */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isHovered ? "rgba(0,0,0,0.3)" : "transparent",
          transition: "background 0.3s"
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isHovered ? "scale(1)" : "scale(0.8)",
            opacity: isHovered ? 1 : 0,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <LuPlay size={28} fill={course.color} color={course.color} style={{ marginLeft: 4 }} />
          </div>
        </div>
        
        {/* Favorite button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(course.id); }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
        >
          <LuHeart 
            size={20} 
            fill={isFav ? "#ef4444" : "none"}
            color={isFav ? "#ef4444" : "#64748b"}
          />
        </button>
        
        {/* Purchased badge */}
        {purchased && (
          <div style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "#10b981",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 15px rgba(16,185,129,0.4)"
          }}>
            <LuCheck size={14} /> {t.purchasedLabel}
          </div>
        )}
        
        {/* Category badge */}
        <div style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(255,255,255,0.95)",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 800,
          color: course.color,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          {course.category}
        </div>
        
        {/* Level badge */}
        <div style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          color: "#fff"
        }}>
          {course.level}
        </div>
      </div>
      
      {/* Content */}
      <div style={{
        padding: "20px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 800,
          color: darkMode ? "#f1f5f9" : "#0f172a",
          lineHeight: 1.4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {localizedTitle}
        </h3>
        
        {/* Stats row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 13,
          color: darkMode ? "#94a3b8" : "#64748b",
          fontWeight: 600
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LuUsers size={16} color={course.color} />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LuBookOpen size={16} color={course.color} />
            <span>{course.lessonCount} {t.lessonsLabel}</span>
          </div>
        </div>
        
        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars rating={stats?.rating} />
          {stats?.rating > 0 && (
            <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>
              {stats.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        padding: "16px 20px",
        borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 900,
          color: purchased || course.price === 0 ? "#10b981" : course.color
        }}>
          {purchased ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16 }}>
              <LuZap size={18} /> {t.openLabel}
            </span>
          ) : course.price === 0 ? (
            t.freeLabel
          ) : (
            `${course.price.toLocaleString()} ${t.priceLabel}`
          )}
        </div>
        
        <button 
          onClick={() => onDetail(course.id)}
          style={{
            padding: "12px 24px",
            background: gradient,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 8px 25px ${course.color}44`,
            transition: "all 0.3s"
          }}
        >
          {t.detailBtn} <LuChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const StatsBar = ({ darkMode, courses, t, courseStats }) => {
  const totalCourses = (courses || []).length;
  const totalStudents = Object.values(courseStats || {}).reduce((sum, s) => sum + (s?.students || 0), 0);
  const ratings = Object.values(courseStats || {}).filter(s => s?.rating > 0).map(s => s.rating);
  const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : "0.0";
  const formattedStudents = totalStudents >= 1000 ? Math.floor(totalStudents / 1000) + "K+" : totalStudents;

  const stats = [
    { 
      icon: <LuGraduationCap size={28} />, 
      value: `${totalCourses}+`, 
      label: t.statsCoursesCount,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    { 
      icon: <LuBot size={28} />, 
      value: "AI", 
      label: t.aiTutorLabel,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    { 
      icon: <LuUsers size={28} />, 
      value: formattedStudents, 
      label: t.statsStudentsCount,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    { 
      icon: <LuStar size={28} />, 
      value: avgRating, 
      label: t.statsRating,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: 20,
      marginBottom: 48
    }}>
      {stats.map((s, i) => (
        <div 
          key={i}
          className="animate-slide-up hover-lift"
          style={{
            background: darkMode ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
            borderRadius: 24,
            padding: "24px",
            textAlign: "center",
            animationDelay: `${i * 100}ms`
          }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: s.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            {s.icon}
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 900,
            background: s.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 4
          }}>
            {s.value}
          </div>
          <div style={{
            fontSize: 13,
            color: darkMode ? "#94a3b8" : "#64748b",
            fontWeight: 600
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const Courses = ({ darkMode, showToast, onDetailViewChange }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const categories = [t.allCategories, ...categoriesBase];
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [favorites, setFavorites] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [courseStats, setCourseStats] = useState({});

  useEffect(() => {
    if (onDetailViewChange) {
      onDetailViewChange(!!detailId);
    }
  }, [detailId, onDetailViewChange]);

  const allCourses = useMemo(() => [
    { id: 1, category: "HTML", title: "HTML Asoslar", price: 0, level: "Boshlang'ich", color: catColors.HTML, thumbnail: "https://placehold.co/600x340/e44d26/ffffff?text=HTML", lessonCount: 12 },
    { id: 2, category: "CSS", title: "CSS & Flexbox To'liq", price: 49000, level: "Intermediate", color: catColors.CSS, thumbnail: "https://placehold.co/600x340/264de4/ffffff?text=CSS", lessonCount: 13 },
    { id: 3, category: "JavaScript", title: "JavaScript To'liq Kurs", price: 89000, level: "All Levels", color: catColors.JavaScript, thumbnail: "https://placehold.co/600x340/d4a017/ffffff?text=JavaScript", lessonCount: 18 },
    { id: 4, category: "React", title: "React.js Zamonaviy", price: 120000, level: "Advanced", color: catColors.React, thumbnail: "https://placehold.co/600x340/0ea5e9/ffffff?text=React", lessonCount: 16 },
    { id: 5, category: "English", title: "Ingliz Tili A1→B2", price: 75000, level: "Boshlang'ich", color: catColors.English, thumbnail: "https://placehold.co/600x340/003580/ffffff?text=English", lessonCount: 16 },
    { id: 6, category: "Russian", title: "Rus Tili Asosiy Kurs", price: 65000, level: "Boshlang'ich", color: catColors.Russian, thumbnail: "https://placehold.co/600x340/c0392b/ffffff?text=Russian", lessonCount: 14 },
    { id: 7, category: "French", title: "Fransuz Tili Kursi", price: 70000, level: "Boshlang'ich", color: catColors.French, thumbnail: "https://placehold.co/600x340/002395/ffffff?text=French", lessonCount: 14 },
    { id: 8, category: "HTML", title: "HTML5 & Semantik Teglar", price: 35000, level: "Intermediate", color: catColors.HTML, thumbnail: "https://placehold.co/600x340/e44d26/ffffff?text=HTML5", lessonCount: 10 },
  ], []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribers = [];

    const fetchStats = async () => {
      const stats = {};

      for (const course of allCourses) {
        try {
          let realRating = 0;
          const reviewsSnap = await getDocs(collection(db, "courses", String(course.id), "reviews"));
          if (!reviewsSnap.empty) {
            let sum = 0;
            reviewsSnap.forEach(d => { sum += Number(d.data().rating || 0); });
            realRating = Number((sum / reviewsSnap.size).toFixed(1));
          }
          stats[course.id] = { rating: realRating, students: 0 };
        } catch (err) {
          console.error(err);
          stats[course.id] = { rating: 0, students: 0 };
        }
      }

      if (!cancelled) setCourseStats(stats);

      for (const course of allCourses) {
        const unsub = onSnapshot(doc(db, "courses", String(course.id)), (snap) => {
          if (!cancelled) {
            setCourseStats(prev => ({
              ...prev,
              [course.id]: {
                rating: prev[course.id]?.rating ?? 0,
                students: snap.exists() ? (snap.data().students || 0) : 0,
              }
            }));
          }
        });
        unsubscribers.push(unsub);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [allCourses]);

  const realCourses = allCourses.map(c => ({
    ...c,
    rating: courseStats[c.id]?.rating ?? 0,
    students: courseStats[c.id]?.students ?? 0,
  }));

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists() && !cancelled) {
        const data = snap.data();
        setFavorites(data.favoriteCourses || []);
        setUserPlan(data.plan || null);
      }
    });

    const loadProgress = async () => {
      try {
        const purchased = [];
        for (const course of allCourses) {
          if (course.price === 0) { purchased.push(course.id); continue; }
          const snap = await getDoc(doc(db, "users", user.uid, "progress", String(course.id)));
          if (snap.exists() && snap.data().purchased) purchased.push(course.id);
        }
        if (!cancelled) {
          setPurchasedIds(prev => [...new Set([...prev, ...purchased])]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProgress();

    return () => { 
      cancelled = true; 
      unsubUser(); 
    };
  }, [user, allCourses, t]);

  const effectivePurchasedIds = useMemo(() => {
    if (userPlan === "pro" || userPlan === "premium") {
      return allCourses.map(c => c.id);
    }
    return purchasedIds;
  }, [userPlan, allCourses, purchasedIds]);

  const toggleFav = async (id) => {
    const newFavs = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(newFavs);
    showToast?.(favorites.includes(id) ? t.removedFromFav : t.addedToFav, favorites.includes(id) ? "error" : "success");
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { favoriteCourses: newFavs }, { merge: true });
    } catch (err) { console.error(err); }
  };

  if (detailId) {
    return (
      <CourseDetail
        courseId={detailId}
        onBack={() => setDetailId(null)}
        darkMode={darkMode}
        showToast={showToast}
        userPlan={userPlan}
        onPurchased={(id) => setPurchasedIds((prev) => [...prev, id])}
      />
    );
  }

  const filtered = realCourses
    .filter((c) => {
      const q = search.toLowerCase();
      const localizedTitle = (t.courseData[c.id]?.title || c.title).toLowerCase();
      const matchSearch = localizedTitle.includes(q) || c.category.toLowerCase().includes(q);
      const matchCat = activeCategory === 0 || c.category === categoriesBase[activeCategory - 1];
      const matchFav = showFavOnly ? favorites.includes(c.id) : true;
      return matchSearch && matchCat && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (courseStats[b.id]?.rating || 0) - (courseStats[a.id]?.rating || 0);
      if (sortBy === "students") return (courseStats[b.id]?.students || 0) - (courseStats[a.id]?.students || 0);
      return 0;
    });

  return (
    <div style={{
      width: "100%",
      maxWidth: 1400,
      margin: "0 auto",
      padding: "60px 24px 100px"
    }}>
      {/* Inject CSS */}
      <style>{MODERN_CSS}</style>
      
      {/* Hero Header */}
      <div className="animate-slide-up" style={{
        marginBottom: 48,
        textAlign: "center",
        position: "relative"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(59,130,246,0.1)",
          color: "#3b82f6",
          fontSize: 13,
          fontWeight: 800,
          padding: "8px 20px",
          borderRadius: 30,
          marginBottom: 20,
          border: "1px solid rgba(59,130,246,0.2)",
          backdropFilter: "blur(10px)"
        }}>
          <LuSparkles size={16} /> {t.onlinePlatform}
        </div>
        
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 56px)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          margin: "0 0 20px",
          lineHeight: 1.1
        }}>
          <span className="gradient-text">{t.catalogTitle}</span>
        </h1>
        
        <p style={{
          color: darkMode ? "#94a3b8" : "#64748b",
          fontSize: 18,
          maxWidth: 600,
          margin: "0 auto",
          fontWeight: 500,
          lineHeight: 1.6
        }}>
          {t.catalogDesc}
        </p>
      </div>

      {/* Stats */}
      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <StatsBar darkMode={darkMode} courses={realCourses} t={t} courseStats={courseStats} />
      </div>

      {/* Search and Filters */}
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div style={{
          background: darkMode ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
          borderRadius: 24,
          padding: "24px",
          marginBottom: 32
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
            alignItems: "center"
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 320px" }}>
              <span style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center"
              }}>
                <LuSearch size={20} />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 16px 16px 52px",
                  borderRadius: 16,
                  border: `2px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
                  background: darkMode ? "rgba(30,41,59,0.5)" : "rgba(248,250,252,0.8)",
                  color: darkMode ? "#f1f5f9" : "#111",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s"
                }}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <LuX size={20} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <LuFilter size={18} style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "14px 20px 14px 44px",
                    borderRadius: 14,
                    border: `2px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
                    background: darkMode ? "rgba(30,41,59,0.5)" : "rgba(248,250,252,0.8)",
                    color: darkMode ? "#f1f5f9" : "#111",
                    fontSize: 14,
                    cursor: "pointer",
                    outline: "none",
                    fontWeight: 600
                  }}
                >
                  <option value="default">{t.sortDefault}</option>
                  <option value="price-asc">{t.sortPriceAsc}</option>
                  <option value="price-desc">{t.sortPriceDesc}</option>
                  <option value="rating">{t.sortRating}</option>
                  <option value="students">{t.sortStudents}</option>
                </select>
              </div>

              {/* Favorites filter */}
              <button
                onClick={() => setShowFavOnly(!showFavOnly)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 20px",
                  borderRadius: 14,
                  border: `2px solid ${showFavOnly ? "#ef4444" : darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
                  background: showFavOnly ? "#ef4444" : darkMode ? "rgba(30,41,59,0.5)" : "rgba(248,250,252,0.8)",
                  color: showFavOnly ? "#fff" : darkMode ? "#f1f5f9" : "#475569",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                <LuHeart size={20} fill={showFavOnly ? "currentColor" : "none"} />
                {favorites.length > 0 && (
                  <span style={{
                    background: showFavOnly ? "rgba(255,255,255,0.3)" : "#ef4444",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10
          }}>
            {categories.map((cat, idx) => {
              const isActive = activeCategory === idx;
              const color = idx === 0 ? "#3b82f6" : catColors[categoriesBase[idx - 1]] || "#3b82f6";
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(idx)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 30,
                    border: "none",
                    background: isActive 
                      ? (idx === 0 ? "#3b82f6" : catGradients[categoriesBase[idx - 1]]) || color
                      : darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    color: isActive ? "#fff" : darkMode ? "#94a3b8" : "#64748b",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  {idx > 0 && (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color
                    }} />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28
        }}>
          <div style={{
            height: 1,
            flex: 1,
            background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
          }} />
          <p style={{
            color: darkMode ? "#94a3b8" : "#64748b",
            fontSize: 14,
            fontWeight: 700,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <LuTrendingUp size={16} />
            {filtered.length} {t.foundCourses}
          </p>
          <div style={{
            height: 1,
            flex: 1,
            background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
          }} />
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 28
        }}>
          {filtered.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              isFav={favorites.includes(course.id)}
              onToggleFav={toggleFav}
              onPlay={setPlayingCourse}
              onDetail={setDetailId}
              darkMode={darkMode}
              purchased={effectivePurchasedIds.includes(course.id)}
              index={i}
              stats={courseStats[course.id]}
            />
          ))}
        </div>
      ) : (
        <div className="animate-scale-in" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 0",
          gap: 24
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: darkMode ? "rgba(30,41,59,0.5)" : "rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            color: darkMode ? "#64748b" : "#94a3b8"
          }}>
            {showFavOnly ? <LuHeart /> : <LuSearch />}
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{
              fontSize: 26,
              fontWeight: 800,
              color: darkMode ? "#f1f5f9" : "#0f172a",
              margin: "0 0 12px"
            }}>
              {showFavOnly ? t.noFavoriteCourses : t.noCoursesFound}
            </h3>
            <p style={{
              color: darkMode ? "#94a3b8" : "#64748b",
              fontSize: 16,
              margin: 0
            }}>
              {t.tryDifferentSearch}
            </p>
          </div>
          <button
            onClick={() => { setSearch(""); setActiveCategory(0); setSortBy("default"); setShowFavOnly(false); }}
            style={{
              marginTop: 8,
              padding: "16px 36px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
            className="hover-lift"
          >
            <LuFilter size={18} /> {t.clearFilters}
          </button>
        </div>
      )}

      {/* AI Preview Modal */}
      {playingCourse && (
        <AIPreviewModal 
          course={playingCourse} 
          onClose={() => setPlayingCourse(null)} 
          darkMode={darkMode} 
          onDetail={setDetailId} 
          t={t}
          stats={courseStats[playingCourse?.id]}
        />
      )}
    </div>
  );
};

export default Courses;
