import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  collection, doc, getDoc, deleteDoc,
  onSnapshot, query, serverTimestamp, addDoc,
} from "firebase/firestore";
import {
  LuBookOpen, LuUsers, LuStar, LuTrophy,
  LuPlus, LuTrash2, LuChartBar, LuCheck,
  LuX, LuClock, LuMessageSquare, LuPen,
} from "react-icons/lu";

const COURSE_CATEGORIES = ["HTML", "CSS", "JavaScript", "React", "English", "Russian", "French", "Python", "Boshqa"];

const InstructorPanel = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("overview");

  // Kurslar
  const [myCourses, setMyCourses]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "", category: "HTML", description: "",
    price: "", duration: "", level: "Boshlang'ich",
    lessons: [{ title: "", videoUrl: "", duration: "" }],
  });

  // ── Instructor tekshirish ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "instructors", user.uid))
      .then((snap) => {
        setIsInstructor(snap.exists() && snap.data().isInstructor === true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // ── Kurslarni yuklash ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isInstructor) return;
    const q = query(
      collection(db, "instructorCourses"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyCourses(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.instructorId === user.uid)
      );
    });
    return () => unsub();
  }, [user, isInstructor]);

  // ── Kurs qo'shish ────────────────────────────────────────────────────────
  const handleAddLesson = () => {
    setCourseForm((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { title: "", videoUrl: "", duration: "" }],
    }));
  };

  const handleRemoveLesson = (i) => {
    setCourseForm((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, idx) => idx !== i),
    }));
  };

  const handleLessonChange = (i, field, value) => {
    setCourseForm((prev) => {
      const lessons = [...prev.lessons];
      lessons[i] = { ...lessons[i], [field]: value };
      return { ...prev, lessons };
    });
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      showToast && showToast("Sarlavha va tavsif kiritilmadi!", "error");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "instructorCourses"), {
        ...courseForm,
        price:        Number(courseForm.price) || 0,
        instructorId: user.uid,
        instructorName: user.displayName || user.email,
        instructorPhoto: user.photoURL || null,
        rating:    0,
        students:  0,
        status:    "pending", // admin tasdiqlashi kerak
        createdAt: serverTimestamp(),
      });
      showToast && showToast("✅ Kurs adminga yuborildi! Tasdiqlanishini kuting.", "success");
      setShowForm(false);
      setCourseForm({
        title: "", category: "HTML", description: "",
        price: "", duration: "", level: "Boshlang'ich",
        lessons: [{ title: "", videoUrl: "", duration: "" }],
      });
    } catch (err) {
      console.error(err);
      showToast && showToast("Xatolik!", "error");
    }
    setSaving(false);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bu kursni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, "instructorCourses", courseId));
      showToast && showToast("Kurs o'chirildi!", "error");
    } catch {
      showToast && showToast("Xatolik!", "error");
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
    background: darkMode ? "#0f172a" : "#f8fafc",
    color: darkMode ? "#f1f5f9" : "#111",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  // ── Ruxsat yo'q ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!isInstructor) return (
    <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: darkMode ? "#f1f5f9" : "#111" }}>
        Ruxsat yo'q
      </h2>
      <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        O'qituvchi paneliga kirish uchun Admin ruxsati kerak.
        Admin bilan bog'laning va ruxsat so'rang.
      </p>
      <div style={{ padding: "16px 20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          📧 Admin: <span style={{ color: "#3b82f6", fontWeight: 600 }}>admin@uzbekaspixel.uz</span>
        </p>
      </div>
    </div>
  );

  // ── O'qituvchi panel ──────────────────────────────────────────────────────
  const totalStudents = myCourses.reduce((a, c) => a + (c.students || 0), 0);
  const avgRating     = myCourses.length > 0
    ? (myCourses.reduce((a, c) => a + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : "0.0";

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "40px 16px 80px" }}>
      <ScrollReveal direction="up">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ display: "inline-block", background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #6ee7b7" }}>
              👨‍🏫 O'qituvchi Panel
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>
              Xush kelibsiz, {user?.displayName || "O'qituvchi"}!
            </h2>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: showForm ? "#ef4444" : "#10b981", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {showForm ? <><LuX size={16} /> Yopish</> : <><LuPlus size={16} /> Yangi Kurs</>}
          </button>
        </div>

        {/* Statistika */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <LuBookOpen size={22} />, color: "#3b82f6", label: "Kurslar",   value: myCourses.length },
            { icon: <LuUsers size={22} />,    color: "#10b981", label: "Talabalar", value: totalStudents },
            { icon: <LuStar size={22} />,     color: "#f59e0b", label: "O'rtacha reyting", value: avgRating },
            { icon: <LuTrophy size={22} />,   color: "#8b5cf6", label: "Faol kurslar",
              value: myCourses.filter((c) => c.status === "approved").length },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px 16px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, textAlign: "center" }}>
              <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Yangi kurs formasi */}
        {showForm && (
          <div style={{ marginBottom: 24, padding: "24px", borderRadius: 16, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111", display: "flex", alignItems: "center", gap: 8 }}>
              <LuPen size={18} style={{ color: "#3b82f6" }} /> Yangi Kurs Yaratish
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Kurs nomi *</label>
                <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Masalan: React.js To'liq Kurs" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Kategoriya</label>
                <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} style={inputStyle}>
                  {COURSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Narx (so'm)</label>
                <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                  placeholder="0 = Bepul" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Davomiyligi</label>
                <input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="Masalan: 20 soat" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Daraja</label>
                <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} style={inputStyle}>
                  {["Boshlang'ich", "O'rta", "Yuqori"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Tavsif *</label>
              <textarea rows={3} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Kurs haqida batafsil yozing..." style={{ ...inputStyle, resize: "none" }} />
            </div>

            {/* Darslar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>
                  Darslar ({courseForm.lessons.length} ta)
                </label>
                <button onClick={handleAddLesson} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <LuPlus size={14} /> Dars qo'shish
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {courseForm.lessons.map((lesson, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, alignItems: "center", padding: "12px", borderRadius: 10, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                    <input value={lesson.title} onChange={(e) => handleLessonChange(i, "title", e.target.value)}
                      placeholder={`${i + 1}-dars nomi`} style={{ ...inputStyle, fontSize: 12 }} />
                    <input value={lesson.videoUrl} onChange={(e) => handleLessonChange(i, "videoUrl", e.target.value)}
                      placeholder="YouTube link" style={{ ...inputStyle, fontSize: 12 }} />
                    <input value={lesson.duration} onChange={(e) => handleLessonChange(i, "duration", e.target.value)}
                      placeholder="10 min" style={{ ...inputStyle, fontSize: 12, width: 80 }} />
                    <button onClick={() => handleRemoveLesson(i)} disabled={courseForm.lessons.length === 1}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#fee2e2", color: "#ef4444", cursor: courseForm.lessons.length === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSaveCourse} disabled={saving}
                style={{ flex: 1, padding: "13px 0", background: saving ? "#94a3b8" : "#10b981", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {saving ? "Saqlanmoqda..." : <><LuCheck size={16} /> Adminga yuborish</>}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "13px 20px", background: "transparent", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 12, fontSize: 14, color: darkMode ? "#94a3b8" : "#374151", cursor: "pointer" }}>
                Bekor
              </button>
            </div>
          </div>
        )}

        {/* Tab */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "overview", label: "Kurslarim",  icon: <LuBookOpen size={15} />   },
            { id: "stats",    label: "Statistika", icon: <LuChartBar size={15} />   },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === t.id ? "#3b82f6" : (darkMode ? "#1e293b" : "#f1f5f9"), color: activeTab === t.id ? "#fff" : (darkMode ? "#94a3b8" : "#374151"), fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Kurslarim */}
        {activeTab === "overview" && (
          <div>
            {myCourses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                <p style={{ color: "#6b7280", marginBottom: 16 }}>Hali kurs yaratilmagan</p>
                <button onClick={() => setShowForm(true)} style={{ padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Birinchi kursni yarating
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myCourses.map((course) => (
                  <div key={course.id} style={{ padding: "18px 20px", borderRadius: 16, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: course.status === "approved" ? "#d1fae5" : course.status === "rejected" ? "#fee2e2" : "#fef3c7",
                            color:      course.status === "approved" ? "#065f46" : course.status === "rejected" ? "#991b1b" : "#92400e",
                          }}>
                            {course.status === "approved" ? "✓ Tasdiqlangan" : course.status === "rejected" ? "✗ Rad etilgan" : "⏳ Kutilmoqda"}
                          </span>
                          <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#3b82f6" }}>
                            {course.category}
                          </span>
                        </div>
                        <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>
                          {course.title}
                        </h4>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                          {course.description?.slice(0, 100)}...
                        </p>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
                          <span>⏱ {course.duration}</span>
                          <span>👥 {course.students || 0} talaba</span>
                          <span>⭐ {course.rating || 0}</span>
                          <span>📚 {course.lessons?.length || 0} dars</span>
                          <span>💰 {course.price === 0 ? "Bepul" : `${Number(course.price).toLocaleString()} so'm`}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCourse(course.id)}
                        style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <LuTrash2 size={14} /> O'chirish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistika */}
        {activeTab === "stats" && (
          <div style={{ padding: "24px", borderRadius: 16, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>
              Umumiy statistika
            </h3>
            {myCourses.length === 0 ? (
              <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>Hali ma'lumot yo'q</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {myCourses.map((course) => (
                  <div key={course.id} style={{ padding: "14px 16px", borderRadius: 12, background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111" }}>{course.title}</p>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{course.students || 0} talaba</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: darkMode ? "#334155" : "#e5e7eb" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: "#3b82f6", width: `${Math.min(100, ((course.students || 0) / Math.max(1, totalStudents)) * 100)}%`, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                      <span>⭐ {course.rating || 0} reyting</span>
                      <span>💰 {course.price === 0 ? "Bepul" : `${Number(course.price).toLocaleString()} so'm`}</span>
                      <span style={{ marginLeft: "auto", color: course.status === "approved" ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                        {course.status === "approved" ? "✓ Faol" : "⏳ Kutilmoqda"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollReveal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default InstructorPanel;