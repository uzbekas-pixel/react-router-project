import React, { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";

const instructors = [
  {
    id: 1, name: "Jasur Toshmatov", role: "HTML & CSS Mutaxassisi",
    avatar: "https://placehold.co/120x120/e44d26/ffffff?text=JT",
    students: 5200, courses: 3, rating: 4.8, experience: "6 yil",
    bio: "Frontend dasturchisi va o'qituvchi. 6 yillik tajriba bilan 5000+ talabani o'qitgan.",
    skills: ["HTML5", "CSS3", "Flexbox", "Grid", "Responsive Design"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
  {
    id: 2, name: "Nilufar Karimova", role: "CSS & Dizayn Mutaxassisi",
    avatar: "https://placehold.co/120x120/264de4/ffffff?text=NK",
    students: 3800, courses: 2, rating: 4.7, experience: "4 yil",
    bio: "UI/UX dizayner va CSS mutaxassisi. Zamonaviy web dizayn yo'nalishida ishlaydi.",
    skills: ["CSS", "Sass", "Figma", "Tailwind", "Animations"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
  {
    id: 3, name: "Bobur Yusupov", role: "JavaScript Eksperti",
    avatar: "https://placehold.co/120x120/d4a017/ffffff?text=BY",
    students: 7100, courses: 4, rating: 4.9, experience: "8 yil",
    bio: "Senior JavaScript dasturchisi. Node.js, React va zamonaviy JS ekosistema bo'yicha mutaxassis.",
    skills: ["JavaScript", "TypeScript", "Node.js", "React", "Vue"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
  {
    id: 4, name: "Sardor Nazarov", role: "React Developer",
    avatar: "https://placehold.co/120x120/0ea5e9/ffffff?text=SN",
    students: 4600, courses: 2, rating: 4.9, experience: "5 yil",
    bio: "Full-stack React dasturchisi. Yirik kompaniyalarda ishlagan tajribali dasturchi va mentor.",
    skills: ["React", "Next.js", "Redux", "GraphQL", "Firebase"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
  {
    id: 5, name: "Malika Ergasheva", role: "Ingliz Tili O'qituvchisi",
    avatar: "https://placehold.co/120x120/003580/ffffff?text=ME",
    students: 9200, courses: 3, rating: 4.6, experience: "10 yil",
    bio: "IELTS 8.0 ball egasi. 10 yillik pedagogik tajriba. Ingliz tilini qiziqarli va samarali o'rgatadi.",
    skills: ["IELTS", "TOEFL", "Grammar", "Speaking", "Writing"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
  {
    id: 6, name: "Alisher Hamidov", role: "Rus Tili O'qituvchisi",
    avatar: "https://placehold.co/120x120/c0392b/ffffff?text=AH",
    students: 4800, courses: 2, rating: 4.5, experience: "7 yil",
    bio: "Rus tili va adabiyoti mutaxassisi. Moskvada tahsil olgan, O'zbekistonda 7 yildan beri o'qitadi.",
    skills: ["Rus tili grammatikasi", "Suhbat", "Biznes rus tili", "TORFL"],
    socials: { linkedin: "#", github: "#", youtube: "#" },
  },
];

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ fontSize: 13, color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
    ))}
  </div>
);

const Instructors = ({ darkMode }) => {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);

  if (selected) {
    const ins = instructors.find((i) => i.id === selected);
    return (
      <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", padding: "32px 20px 80px" }}>
        <button
          onClick={() => setSelected(null)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "#3b82f6", fontSize: 14, fontWeight: 600, marginBottom: 24, padding: 0,
          }}
        >
          {t.backToInstructors}
        </button>

        <ScrollReveal direction="up">
          <div style={{
            background: darkMode ? "#1e293b" : "#fff",
            borderRadius: 20, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
            padding: "28px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              <img src={ins.avatar} alt={ins.name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 22, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.name}</h2>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "#3b82f6", fontWeight: 600 }}>{ins.role}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "#6b7280" }}>
                  <span>⭐ {ins.rating}</span>
                  <span>👥 {ins.students.toLocaleString()} {t.studentsCount}</span>
                  <span>📚 {ins.courses} {t.coursesCount}</span>
                  <span>🕐 {ins.experience} {t.experience}</span>
                </div>
              </div>
            </div>
            <p style={{ margin: "20px 0 0", fontSize: 14, color: darkMode ? "#94a3b8" : "#4b5563", lineHeight: 1.8 }}>{ins.bio}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <div style={{
            background: darkMode ? "#1e293b" : "#fff",
            borderRadius: 14, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
            padding: "20px", marginBottom: 20,
          }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>
              {t.skills}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ins.skills.map((sk) => (
                <span key={sk} style={{
                  padding: "5px 14px", borderRadius: 20,
                  background: darkMode ? "#0f172a" : "#eff6ff",
                  color: "#3b82f6", fontSize: 12, fontWeight: 600,
                  border: "1px solid #bfdbfe",
                }}>{sk}</span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>
      <ScrollReveal direction="up">
        <span style={{
          display: "inline-block", background: "#eff6ff", color: "#3b82f6",
          fontSize: 12, fontWeight: 700, padding: "4px 14px",
          borderRadius: 20, marginBottom: 12, border: "1px solid #bfdbfe",
        }}>
          {t.ourTeam}
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>
          {t.instructorsTitle}
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
          {t.instructorsDesc}
        </p>
      </ScrollReveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {instructors.map((ins, i) => (
          <ScrollReveal key={ins.id} direction="up" delay={i * 80}>
            <div
              onClick={() => setSelected(ins.id)}
              style={{
                background: darkMode ? "#1e293b" : "#fff",
                borderRadius: 16, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
                padding: "24px 20px", cursor: "pointer",
                transition: "all 0.25s",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <img
                src={ins.avatar}
                alt={ins.name}
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  objectFit: "cover", marginBottom: 12,
                  border: "3px solid #3b82f6",
                }}
              />
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.name}</p>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{ins.role}</p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <Stars rating={ins.rating} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginLeft: 4 }}>{ins.rating}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 12, borderTop: `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.courses}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{t.coursesCount}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111" }}>
                    {ins.students >= 1000 ? (ins.students / 1000).toFixed(1) + "K" : ins.students}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{t.studentsCount}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.experience}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{t.experience}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default Instructors;