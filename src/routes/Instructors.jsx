import React, { useState } from "react";
import { useLang } from "../context/useLang";
import { 
  LuStar, 
  LuUsers, 
  LuBookOpen, 
  LuClock, 
  LuArrowLeft,
  LuLinkedin,
  LuGithub,
  LuYoutube
} from "react-icons/lu";

const instructors = [
  { id: 1, name: "Jasur Toshmatov", avatar: "https://placehold.co/120x120/e44d26/ffffff?text=JT", students: 5200, courses: 3, rating: 4.8, experience: "6 yil", skills: ["HTML5", "CSS3", "Flexbox", "Grid", "Responsive Design"] },
  { id: 2, name: "Nilufar Karimova", avatar: "https://placehold.co/120x120/264de4/ffffff?text=NK", students: 3800, courses: 2, rating: 4.7, experience: "4 yil", skills: ["CSS", "Sass", "Figma", "Tailwind", "Animations"] },
  { id: 3, name: "Bobur Yusupov", avatar: "https://placehold.co/120x120/d4a017/ffffff?text=BY", students: 7100, courses: 4, rating: 4.9, experience: "8 yil", skills: ["JavaScript", "TypeScript", "Node.js", "React", "Vue"] },
  { id: 4, name: "Sardor Nazarov", avatar: "https://placehold.co/120x120/0ea5e9/ffffff?text=SN", students: 4600, courses: 2, rating: 4.9, experience: "5 yil", skills: ["React", "Next.js", "Redux", "GraphQL", "Firebase"] },
  { id: 5, name: "Malika Ergasheva", avatar: "https://placehold.co/120x120/003580/ffffff?text=ME", students: 9200, courses: 3, rating: 4.6, experience: "10 yil", skills: ["IELTS", "TOEFL", "Grammar", "Speaking", "Writing"] },
  { id: 6, name: "Alisher Hamidov", avatar: "https://placehold.co/120x120/c0392b/ffffff?text=AH", students: 4800, courses: 2, rating: 4.5, experience: "7 yil", skills: ["Rus tili grammatikasi", "Suhbat", "Biznes rus tili", "TORFL"] },
];

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map((s) => (
      <LuStar key={s} style={{ fontSize: 13, color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }} fill={s <= Math.round(rating) ? "#f59e0b" : "transparent"} />
    ))}
  </div>
);

const Instructors = ({ darkMode }) => {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);

  if (selected) {
    const ins = instructors.find((i) => i.id === selected);
    const detail = t.instructorData[ins.id] || { role: t.developer, bio: "..." };

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
          <LuArrowLeft /> {t.backToInstructors}
        </button>

        <div direction="up">
          <div style={{
            background: darkMode ? "rgba(30,41,59,.7)" : "#fff",
            backdropFilter: "blur(12px)",
            borderRadius: 24, border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : "#e5e7eb"}`,
            padding: "28px", marginBottom: 20,
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
              <img src={ins.avatar} alt={ins.name} style={{ width: 110, height: 110, borderRadius: 24, objectFit: "cover", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 24, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.name}</h2>
                <p style={{ margin: "0 0 16px", fontSize: 15, color: "#3b82f6", fontWeight: 600 }}>{detail.role}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: darkMode ? "#94a3b8" : "#64748b" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LuStar style={{ color: "#f59e0b" }} /> {ins.rating}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LuUsers style={{ color: "#3b82f6" }} /> {ins.students.toLocaleString()} {t.studentsCount}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LuBookOpen style={{ color: "#8b5cf6" }} /> {ins.courses} {t.coursesCount}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LuClock style={{ color: "#10b981" }} /> {ins.experience}</span>
                </div>
              </div>
            </div>
            <p style={{ margin: "24px 0 0", fontSize: 15, color: darkMode ? "#cbd5e1" : "#4b5563", lineHeight: 1.8 }}>{detail.bio}</p>
          </div>
        </div>

        <div direction="up" delay={100}>
          <div style={{
            background: darkMode ? "rgba(30,41,59,.7)" : "#fff",
            backdropFilter: "blur(12px)",
            borderRadius: 20, border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : "#e5e7eb"}`,
            padding: "24px", marginBottom: 20,
          }}>
            <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111", display: "flex", alignItems: "center", gap: 8 }}>
              {t.skills}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ins.skills.map((sk) => (
                <span key={sk} style={{
                  padding: "6px 16px", borderRadius: 12,
                  background: darkMode ? "rgba(59,130,246,.1)" : "#eff6ff",
                  color: "#3b82f6", fontSize: 12, fontWeight: 600,
                  border: `1px solid ${darkMode ? "rgba(59,130,246,.25)" : "#bfdbfe"}`,
                }}>{sk}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div direction="up">
        <span style={{
          display: "inline-block", background: darkMode ? "rgba(59,130,246,.15)" : "#eff6ff", 
          color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "5px 16px",
          borderRadius: 20, marginBottom: 12, border: "1px solid rgba(59,130,246,.3)",
        }}>
          {t.ourTeam}
        </span>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", color: darkMode ? "#f1f5f9" : "#111" }}>
          {t.instructorsTitle}
        </h2>
        <p style={{ color: darkMode ? "#94a3b8" : "#64748b", fontSize: 15, marginBottom: 40, maxWidth: 600 }}>
          {t.instructorsDesc}
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 24,
      }}>
        {instructors.map((ins, i) => {
          const detail = t.instructorData[ins.id] || { role: "..." };
          return (
            <div key={ins.id} direction="up" delay={i * 80}>
              <div
                onClick={() => setSelected(ins.id)}
                style={{
                  background: darkMode ? "rgba(30,41,59,.7)" : "#fff",
                  backdropFilter: "blur(12px)",
                  borderRadius: 24, border: `1px solid ${darkMode ? "rgba(255,255,255,.1)" : "#e5e7eb"}`,
                  padding: "28px 24px", cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "center",
                  boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 20px -5px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = darkMode ? "rgba(255,255,255,.1)" : "#e5e7eb";
                }}
              >
                <img
                  src={ins.avatar}
                  alt={ins.name}
                  style={{
                    width: 90, height: 90, borderRadius: 28,
                    objectFit: "cover", marginBottom: 16,
                    border: `4px solid ${darkMode ? "#1e293b" : "#fff"}`,
                    boxShadow: "0 10px 20px -5px rgba(0,0,0,0.2)"
                  }}
                />
                <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 18, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.name}</p>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>{detail.role}</p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <Stars rating={ins.rating} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", marginLeft: 6 }}>{ins.rating}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 16, borderTop: `1px solid ${darkMode ? "rgba(255,255,255,.05)" : "#f1f5f9"}` }}>
                  <div>
                    <LuBookOpen style={{ color: "#3b82f6", marginBottom: 4 }} size={16} />
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.courses}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{t.coursesCount}</p>
                  </div>
                  <div>
                    <LuUsers style={{ color: "#f59e0b", marginBottom: 4 }} size={16} />
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>
                      {ins.students >= 1000 ? (ins.students / 1000).toFixed(1) + "K" : ins.students}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{t.studentsCount}</p>
                  </div>
                  <div>
                    <LuClock style={{ color: "#10b981", marginBottom: 4 }} size={16} />
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{ins.experience}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{t.experience}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Instructors; Instructors;
