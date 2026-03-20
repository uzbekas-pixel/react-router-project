import React, { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import CourseDetail from "./CourseDetail";

const allCourses = [
  {
    id: 1, category: "HTML", title: "HTML Asoslar",
    instructor: "Jasur Toshmatov", duration: 12, rating: 4.8,
    students: 3240, price: 0, level: "Boshlang'ich",
    color: "#e44d26", thumbnail: "https://placehold.co/400x220/e44d26/ffffff?text=HTML",
    videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU",
  },
  {
    id: 2, category: "CSS", title: "CSS & Flexbox To'liq",
    instructor: "Nilufar Karimova", duration: 18, rating: 4.7,
    students: 2890, price: 49000, level: "O'rta",
    color: "#264de4", thumbnail: "https://placehold.co/400x220/264de4/ffffff?text=CSS",
    videoUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc",
  },
  {
    id: 3, category: "JavaScript", title: "JavaScript To'liq Kurs",
    instructor: "Bobur Yusupov", duration: 36, rating: 4.9,
    students: 5100, price: 89000, level: "Barcha daraja",
    color: "#d4a017", thumbnail: "https://placehold.co/400x220/d4a017/ffffff?text=JavaScript",
    videoUrl: "https://www.youtube.com/embed/PkZNo7MFNFg",
  },
  {
    id: 4, category: "React", title: "React.js Zamonaviy",
    instructor: "Sardor Nazarov", duration: 30, rating: 4.9,
    students: 4200, price: 120000, level: "O'rta-Yuqori",
    color: "#0ea5e9", thumbnail: "https://placehold.co/400x220/0ea5e9/ffffff?text=React",
    videoUrl: "https://www.youtube.com/embed/bMknfKXIFA8",
  },
  {
    id: 5, category: "English", title: "Ingliz Tili A1→B2",
    instructor: "Malika Ergasheva", duration: 60, rating: 4.6,
    students: 8900, price: 75000, level: "Boshlang'ich",
    color: "#003580", thumbnail: "https://placehold.co/400x220/003580/ffffff?text=English",
    videoUrl: "https://www.youtube.com/embed/3IqtmUscE_U",
  },
  {
    id: 6, category: "Russian", title: "Rus Tili Asosiy Kurs",
    instructor: "Alisher Hamidov", duration: 45, rating: 4.5,
    students: 4500, price: 65000, level: "Boshlang'ich",
    color: "#c0392b", thumbnail: "https://placehold.co/400x220/c0392b/ffffff?text=Русский",
    videoUrl: "https://www.youtube.com/embed/ex7XbNaEdAk",
  },
  {
    id: 7, category: "French", title: "Fransuz Tili Kursi",
    instructor: "Dilorom Saidova", duration: 40, rating: 4.4,
    students: 2100, price: 70000, level: "Boshlang'ich",
    color: "#002395", thumbnail: "https://placehold.co/400x220/002395/ffffff?text=Français",
    videoUrl: "https://www.youtube.com/embed/KN_2RMkVGXA",
  },
  {
    id: 8, category: "HTML", title: "HTML5 & Semantik Teglar",
    instructor: "Kamol Rashidov", duration: 8, rating: 4.3,
    students: 1800, price: 35000, level: "O'rta",
    color: "#e44d26", thumbnail: "https://placehold.co/400x220/e44d26/ffffff?text=HTML5",
    videoUrl: "https://www.youtube.com/embed/UB1O30fR-EE",
  },
];

const categoriesBase = ["HTML", "CSS", "JavaScript", "React", "English", "Russian", "French"];

const catColors = {
  HTML: "#e44d26", CSS: "#264de4", JavaScript: "#d4a017",
  React: "#0ea5e9", English: "#003580", Russian: "#c0392b", French: "#002395",
};

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ fontSize: 12, color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
    ))}
  </div>
);

const VideoModal = ({ course, onClose, darkMode }) => {
  React.useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.78)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 780, borderRadius: 18, overflow: "hidden",
        background: darkMode ? "#1e293b" : "#fff",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>{course.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{course.instructor}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6b7280", padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
          <iframe src={course.videoUrl + "?autoplay=1"} title={course.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", flexWrap: "wrap" }}>
          <Stars rating={course.rating} />
          <span style={{ fontSize: 13, color: "#6b7280" }}>⏱ {course.duration} soat</span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>👥 {course.students.toLocaleString()}</span>
          <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: 16, color: "#3b82f6" }}>
            {course.price === 0 ? "🆓 Bepul" : course.price.toLocaleString() + " so'm"}
          </span>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, isFav, onToggleFav, onPlay, onDetail, darkMode }) => {
  const { t } = useLang();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16, overflow: "hidden",
        background: darkMode ? "#1e293b" : "#fff",
        border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.25s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", height: 175, overflow: "hidden" }}>
        <img src={course.thumbnail} alt={course.title} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.35s ease",
        }} />
        <div onClick={() => onPlay(course)} style={{
          position: "absolute", inset: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered ? "rgba(0,0,0,0.42)" : "rgba(0,0,0,0.15)", transition: "background 0.25s",
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0.65, transition: "all 0.25s",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={course.color}>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleFav(course.id); }} style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(255,255,255,0.93)", border: "none",
          borderRadius: "50%", width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
        <span style={{
          position: "absolute", bottom: 10, left: 10,
          background: course.color, color: "#fff",
          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
        }}>{course.category}</span>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111827", lineHeight: 1.4 }}>
          {course.title}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>👤 {course.instructor}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars rating={course.rating} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{course.rating}</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
          <span>⏱ {course.duration} soat</span>
          <span>👥 {course.students.toLocaleString()}</span>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderTop: `1px solid ${darkMode ? "#334155" : "#f3f4f6"}`,
        gap: 8,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: course.price === 0 ? "#10b981" : "#3b82f6" }}>
          {course.price === 0 ? t.freeLabel : course.price.toLocaleString() + " " + t.priceLabel}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onPlay(course)} style={{
            background: "transparent", color: course.color,
            border: `1.5px solid ${course.color}`,
            borderRadius: 8, fontSize: 12, fontWeight: 600,
            padding: "6px 10px", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = course.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = course.color; }}
          >▶</button>
          <button onClick={() => onDetail(course.id)} style={{
            background: course.color, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
            padding: "6px 12px", cursor: "pointer", transition: "opacity 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t.detailBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsBar = ({ darkMode }) => {
  const stats = [
    { emoji: "🎓", value: "8+", label: "Kurs" },
    { emoji: "👨‍🏫", value: "6", label: "O'qituvchi" },
    { emoji: "👥", value: "32K+", label: "Talaba" },
    { emoji: "⭐", value: "4.7", label: "O'rtacha reyting" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 36 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: darkMode ? "#1e293b" : "#fff",
          border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
          borderRadius: 12, padding: "14px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 22 }}>{s.emoji}</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#3b82f6", margin: "4px 0 2px" }}>{s.value}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

const Courses = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const categories = [t.allCategories, ...categoriesBase];
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortBy, setSortBy] = useState("default");
  const [favorites, setFavorites] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [playingCourse, setPlayingCourse] = useState(null);
  const [detailId, setDetailId] = useState(null);

  // Show detail page
  if (detailId) {
    return (
      <CourseDetail
        courseId={detailId}
        onBack={() => setDetailId(null)}
        darkMode={darkMode}
        showToast={showToast}
      />
    );
  }

  const toggleFav = (id) => {
    if (favorites.includes(id)) {
      setFavorites((f) => f.filter((x) => x !== id));
      showToast && showToast(t.removedFromFav, "error");
    } else {
      setFavorites((f) => [...f, id]);
      showToast && showToast(t.addedToFav, "success");
    }
  };

  const filtered = allCourses
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchCat = activeCategory === 0 || c.category === categoriesBase[activeCategory - 1];
      const matchFav = showFavOnly ? favorites.includes(c.id) : true;
      return matchSearch && matchCat && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "students") return b.students - a.students;
      return 0;
    });

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <span style={{
            display: "inline-block", background: "#eff6ff", color: "#3b82f6",
            fontSize: 12, fontWeight: 700, padding: "4px 14px",
            borderRadius: 20, marginBottom: 12, border: "1px solid #bfdbfe",
          }}>{t.onlinePlatform}</span>
          <h1 style={{
            fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: darkMode ? "#f1f5f9" : "#111827", margin: "0 0 10px",
          }}>{t.catalogTitle}</h1>
          <p style={{ color: "#6b7280", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            {t.catalogDesc}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={100}>
        <StatsBar darkMode={darkMode} />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={150}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
            <input type="text" placeholder={t.searchPlaceholder} value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", paddingLeft: 36, paddingRight: search ? 32 : 12,
                paddingTop: 9, paddingBottom: 9, borderRadius: 10,
                border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
                background: darkMode ? "#1e293b" : "#fff",
                color: darkMode ? "#f1f5f9" : "#111", fontSize: 13, outline: "none", boxSizing: "border-box",
              }} />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13,
              }}>✕</button>
            )}
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
            padding: "9px 12px", borderRadius: 10,
            border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
            background: darkMode ? "#1e293b" : "#fff",
            color: darkMode ? "#f1f5f9" : "#111", fontSize: 13, cursor: "pointer", outline: "none",
          }}>
            <option value="default">{t.sortDefault}</option>
            <option value="price-asc">{t.sortPriceAsc}</option>
            <option value="price-desc">{t.sortPriceDesc}</option>
            <option value="rating">{t.sortRating}</option>
            <option value="students">{t.sortStudents}</option>
          </select>

          <button onClick={() => setShowFavOnly(!showFavOnly)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10,
            border: `1px solid ${showFavOnly ? "#ef4444" : darkMode ? "#334155" : "#e5e7eb"}`,
            background: showFavOnly ? "#ef4444" : darkMode ? "#1e293b" : "#fff",
            color: showFavOnly ? "#fff" : darkMode ? "#f1f5f9" : "#374151",
            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
          }}>
            {showFavOnly ? "❤️" : "🤍"}
            {favorites.length > 0 && (
              <span style={{
                background: showFavOnly ? "rgba(255,255,255,0.3)" : "#ef4444",
                color: "#fff", borderRadius: 10, padding: "0 6px", fontSize: 11, fontWeight: 700,
              }}>{favorites.length}</span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {categories.map((cat, idx) => {
            const isActive = activeCategory === idx;
            const color = idx === 0 ? "#3b82f6" : catColors[categoriesBase[idx - 1]] || "#3b82f6";
            return (
              <button key={cat} onClick={() => setActiveCategory(idx)} style={{
                padding: "7px 16px", borderRadius: 20,
                border: `1.5px solid ${isActive ? color : darkMode ? "#334155" : "#e5e7eb"}`,
                background: isActive ? color : darkMode ? "#1e293b" : "#fff",
                color: isActive ? "#fff" : darkMode ? "#94a3b8" : "#374151",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              }}>{cat}</button>
            );
          })}
        </div>
        <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 16 }}>{filtered.length} {t.foundCourses}</p>
      </ScrollReveal>

      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 20 }}>
          {filtered.map((course, i) => (
            <ScrollReveal key={course.id} direction="up" delay={i * 70}>
              <CourseCard
                course={course}
                isFav={favorites.includes(course.id)}
                onToggleFav={toggleFav}
                onPlay={setPlayingCourse}
                onDetail={setDetailId}
                darkMode={darkMode}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12 }}>
          <span style={{ fontSize: 48 }}>{showFavOnly ? "🤍" : "🔍"}</span>
          <p style={{ fontSize: 18, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111827", margin: 0 }}>
            {showFavOnly ? t.noFavoriteCourses : t.noCoursesFound}
          </p>
          <button onClick={() => { setSearch(""); setActiveCategory(0); setSortBy("default"); setShowFavOnly(false); }}
            style={{ marginTop: 8, padding: "9px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {t.clearFilters}
          </button>
        </div>
      )}

      {playingCourse && (
        <VideoModal course={playingCourse} onClose={() => setPlayingCourse(null)} darkMode={darkMode} />
      )}
    </div>
  );
};

export default Courses;