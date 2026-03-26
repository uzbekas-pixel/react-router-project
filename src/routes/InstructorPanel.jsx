import React, { useState, useEffect, useRef } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  collection, doc, getDoc, deleteDoc,
  onSnapshot, query, serverTimestamp, addDoc, updateDoc,
} from "firebase/firestore";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  LuBookOpen, LuUsers, LuStar, LuTrophy,
  LuPlus, LuTrash2, LuChartBar, LuCheck,
  LuX, LuPen, LuVideo, LuVideoOff, LuMic, LuMicOff,
  LuRadio, LuEye,
} from "react-icons/lu";

const APP_ID      = "2c3941d0b08d4c01b2735b6259550335";
const TOKEN       = null;
const COURSE_CATEGORIES = ["HTML","CSS","JavaScript","React","English","Russian","French","Python","Boshqa"];

// ─── Live dars komponenti ──────────────────────────────────────────────────────
const LiveLesson = ({ showToast, user, onClose }) => {
  const [liveTitle, setLiveTitle]     = useState("");
  const [isLive, setIsLive]           = useState(false);
  const [micOn, setMicOn]             = useState(true);
  const [camOn, setCamOn]             = useState(true);
  const [viewers, setViewers]         = useState(0);
  const [duration, setDuration]       = useState(0);
  const [messages, setMessages]       = useState([]);
  const [msgInput, setMsgInput]       = useState("");
  const [liveDocId, setLiveDocId]     = useState(null);

  const clientRef    = useRef(null);
  const localTracks  = useRef({ mic: null, cam: null });
  const videoRef     = useRef(null);
  const timerRef     = useRef(null);
  const messagesRef  = useRef(null);

  // Live chat tinglash
  useEffect(() => {
    if (!liveDocId) return;
    const unsub = onSnapshot(
      query(collection(db, "liveLessons", liveDocId, "messages")),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setMessages(list);
        setTimeout(() => {
          if (messagesRef.current)
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }, 50);
      }
    );
    // Viewers tinglash
    const unsub2 = onSnapshot(doc(db, "liveLessons", liveDocId), (snap) => {
      if (snap.exists()) setViewers(snap.data().viewers || 0);
    });
    return () => { unsub(); unsub2(); };
  }, [liveDocId]);

  const startLive = async () => {
    if (!liveTitle.trim()) { showToast && showToast("Dars nomini kiriting!", "error"); return; }
    try {
      // Firestore da live dars yaratish
      const docRef = await addDoc(collection(db, "liveLessons"), {
        title:           liveTitle,
        instructorId:    user.uid,
        instructorName:  user.displayName || user.email,
        instructorPhoto: user.photoURL || null,
        channelName:     `live_${user.uid}_${Date.now()}`,
        status:          "live",
        viewers:         0,
        startedAt:       serverTimestamp(),
      });
      setLiveDocId(docRef.id);

      // Agora ulanish
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      clientRef.current = client;
      await client.setClientRole("host");

      const channelName = `live_${user.uid}_${Date.now()}`;
      await client.join(APP_ID, channelName, TOKEN, null);

      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracks.current = { mic: micTrack, cam: camTrack };
      await client.publish([micTrack, camTrack]);

      // Video ko'rsatish
      if (videoRef.current) camTrack.play(videoRef.current);

      setIsLive(true);
      timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
      showToast && showToast("🔴 Live dars boshlandi!", "success");
    } catch (err) {
      console.error(err);
      showToast && showToast("Live boshlashda xatolik: " + err.message, "error");
    }
  };

  const stopLive = async () => {
    clearInterval(timerRef.current);
    localTracks.current.mic?.close();
    localTracks.current.cam?.close();
    await clientRef.current?.leave();
    if (liveDocId) {
      await updateDoc(doc(db, "liveLessons", liveDocId), {
        status: "ended", endedAt: serverTimestamp(),
      });
    }
    setIsLive(false);
    setDuration(0);
    showToast && showToast("Live dars yakunlandi", "success");
    onClose();
  };

  const toggleMic = () => {
    localTracks.current.mic?.setEnabled(!micOn);
    setMicOn(p => !p);
  };

  const toggleCam = () => {
    localTracks.current.cam?.setEnabled(!camOn);
    setCamOn(p => !p);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !liveDocId) return;
    const text = msgInput;
    setMsgInput("");
    await addDoc(collection(db, "liveLessons", liveDocId, "messages"), {
      text, uid: user.uid,
      name: user.displayName || "O'qituvchi",
      avatar: user.photoURL || null,
      isInstructor: true,
      createdAt: serverTimestamp(),
    });
  };

  const formatDuration = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2,"0")}:${String(Math.floor((s % 3600) / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.95)", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #334155" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {isLive && (
            <span style={{ background:"#ef4444", color:"#fff", fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:6, display:"flex", alignItems:"center", gap:4, animation:"pulse 2s infinite" }}>
              🔴 LIVE
            </span>
          )}
          <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:15 }}>
            {liveTitle || "Live Dars"}
          </span>
          {isLive && (
            <>
              <span style={{ color:"#94a3b8", fontSize:12 }}>⏱ {formatDuration(duration)}</span>
              <span style={{ color:"#94a3b8", fontSize:12 }}><LuEye size={13} style={{ display:"inline", marginRight:4 }}/>{viewers} tomoshabin</span>
            </>
          )}
        </div>
        <button onClick={isLive ? stopLive : onClose}
          style={{ padding:"8px 16px", borderRadius:10, border:"none", background: isLive?"#ef4444":"#334155", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {isLive ? "⏹ Yakunlash" : "✕ Yopish"}
        </button>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Video area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative" }}>

          {/* Video */}
          <div style={{ flex:1, background:"#0f172a", position:"relative", overflow:"hidden" }}>
            <div ref={videoRef} style={{ width:"100%", height:"100%" }}/>

            {!isLive && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
                <div style={{ fontSize:64 }}>📹</div>
                <p style={{ color:"#94a3b8", fontSize:16 }}>Kamera preview bu yerda ko'rinadi</p>

                {/* Live boshlash formasi */}
                <div style={{ width:"100%", maxWidth:420, padding:"24px", borderRadius:16, background:"#1e293b", border:"1px solid #334155" }}>
                  <h3 style={{ margin:"0 0 16px", fontWeight:700, fontSize:16, color:"#f1f5f9", textAlign:"center" }}>
                    🔴 Live Dars Boshlash
                  </h3>
                  <input
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="Dars nomi (masalan: React Hooks darsi)"
                    onKeyDown={(e) => e.key === "Enter" && startLive()}
                    style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #334155", background:"#0f172a", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14 }}
                  />
                  <button onClick={startLive}
                    style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", background:"#ef4444", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <LuRadio size={18}/> Live Boshlash
                  </button>
                  <p style={{ margin:"10px 0 0", fontSize:11, color:"#6b7280", textAlign:"center" }}>
                    O'quvchilar sizning darsингизни real vaqtda ko'rishi mumkin
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isLive && (
            <div style={{ padding:"14px 20px", background:"#1e293b", display:"flex", alignItems:"center", justifyContent:"center", gap:12, borderTop:"1px solid #334155" }}>
              <button onClick={toggleMic}
                style={{ width:52, height:52, borderRadius:"50%", border:"none", background: micOn?"#334155":"#ef4444", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                {micOn ? <LuMic size={20}/> : <LuMicOff size={20}/>}
              </button>
              <button onClick={toggleCam}
                style={{ width:52, height:52, borderRadius:"50%", border:"none", background: camOn?"#334155":"#ef4444", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                {camOn ? <LuVideo size={20}/> : <LuVideoOff size={20}/>}
              </button>
              <button onClick={stopLive}
                style={{ padding:"0 28px", height:52, borderRadius:26, border:"none", background:"#ef4444", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                ⏹ Darsni Yakunlash
              </button>
            </div>
          )}
        </div>

        {/* Chat */}
        {isLive && (
          <div style={{ width:320, borderLeft:"1px solid #334155", display:"flex", flexDirection:"column", background:"#0f172a" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #334155" }}>
              <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#f1f5f9" }}>
                💬 Live Chat ({messages.length})
              </p>
            </div>
            <div ref={messagesRef} style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length === 0 ? (
                <p style={{ color:"#6b7280", fontSize:12, textAlign:"center", paddingTop:20 }}>
                  Hali xabar yo'q...
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background: m.isInstructor?"#ef4444":"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0, overflow:"hidden" }}>
                      {m.avatar ? <img src={m.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : m.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize:11, fontWeight:700, color: m.isInstructor?"#f87171":"#60a5fa" }}>
                        {m.name} {m.isInstructor && "👨‍🏫"}
                      </span>
                      <p style={{ margin:"2px 0 0", fontSize:13, color:"#e2e8f0", lineHeight:1.5 }}>{m.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding:"12px 14px", borderTop:"1px solid #334155", display:"flex", gap:8 }}>
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Xabar yozing..."
                style={{ flex:1, padding:"9px 12px", borderRadius:10, border:"1px solid #334155", background:"#1e293b", color:"#f1f5f9", fontSize:13, outline:"none" }}
              />
              <button onClick={sendMessage}
                style={{ width:36, height:36, borderRadius:10, border:"none", background:"#3b82f6", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
};

// ─── Asosiy InstructorPanel ────────────────────────────────────────────────────
const InstructorPanel = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("overview");
  const [showLive, setShowLive]         = useState(false);

  // Kurslar
  const [myCourses, setMyCourses]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "", category: "HTML", description: "",
    price: "", duration: "", level: "Boshlang'ich",
    lessons: [{ title: "", videoUrl: "", duration: "" }],
  });

  // O'tgan live darslar
  const [pastLives, setPastLives] = useState([]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "instructors", user.uid))
      .then((snap) => {
        setIsInstructor(snap.exists() && snap.data().isInstructor === true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !isInstructor) return;
    const q = query(collection(db, "instructorCourses"));
    const unsub = onSnapshot(q, (snap) => {
      setMyCourses(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((c) => c.instructorId === user.uid)
      );
    });
    // O'tgan live darslar
    const q2 = query(collection(db, "liveLessons"));
    const unsub2 = onSnapshot(q2, (snap) => {
      setPastLives(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((l) => l.instructorId === user.uid)
          .sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0))
          .slice(0, 10)
      );
    });
    return () => { unsub(); unsub2(); };
  }, [user, isInstructor]);

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
        price:           Number(courseForm.price) || 0,
        instructorId:    user.uid,
        instructorName:  user.displayName || user.email,
        instructorPhoto: user.photoURL || null,
        rating:    0,
        students:  0,
        status:    "pending",
        createdAt: serverTimestamp(),
      });
      showToast && showToast("✅ Kurs adminga yuborildi!", "success");
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
      </p>
      <div style={{ padding: "16px 20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          📧 Admin: <span style={{ color: "#3b82f6", fontWeight: 600 }}>admin@uzbekaspixel.uz</span>
        </p>
      </div>
    </div>
  );

  const totalStudents = myCourses.reduce((a, c) => a + (c.students || 0), 0);
  const avgRating     = myCourses.length > 0
    ? (myCourses.reduce((a, c) => a + (c.rating || 0), 0) / myCourses.length).toFixed(1)
    : "0.0";

  return (
    <>
      {/* Live dars oynasi */}
      {showLive && (
        <LiveLesson
          darkMode={darkMode}
          showToast={showToast}
          user={user}
          onClose={() => setShowLive(false)}
        />
      )}

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
            <div style={{ display:"flex", gap:10 }}>
              {/* 🔴 Live tugmasi */}
              <button onClick={() => setShowLive(true)}
                style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow:"0 4px 16px #ef444455" }}>
                <LuRadio size={16}/> 🔴 Live Dars
              </button>
              <button onClick={() => setShowForm(!showForm)}
                style={{ padding: "12px 20px", borderRadius: 12, border: "none", background: showForm ? "#ef4444" : "#10b981", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {showForm ? <><LuX size={16} /> Yopish</> : <><LuPlus size={16} /> Yangi Kurs</>}
              </button>
            </div>
          </div>

          {/* Statistika */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { icon: <LuBookOpen size={22} />, color: "#3b82f6", label: "Kurslar",         value: myCourses.length },
              { icon: <LuUsers size={22} />,    color: "#10b981", label: "Talabalar",        value: totalStudents },
              { icon: <LuStar size={22} />,     color: "#f59e0b", label: "O'rt. reyting",    value: avgRating },
              { icon: <LuRadio size={22} />,    color: "#ef4444", label: "O'tgan live",       value: pastLives.filter(l=>l.status==="ended").length },
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

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap:"wrap" }}>
            {[
              { id: "overview", label: "📚 Kurslarim",     },
              { id: "live",     label: "🔴 Live Tarix",    },
              { id: "stats",    label: "📊 Statistika",    },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: activeTab === t.id ? "#3b82f6" : (darkMode ? "#1e293b" : "#f1f5f9"), color: activeTab === t.id ? "#fff" : (darkMode ? "#94a3b8" : "#374151"), fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                {t.label}
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

          {/* Live Tarix */}
          {activeTab === "live" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:darkMode?"#f1f5f9":"#111" }}>
                  🔴 Live Darslar Tarixi
                </h3>
                <button onClick={() => setShowLive(true)}
                  style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <LuRadio size={15}/> Yangi Live
                </button>
              </div>

              {pastLives.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📹</div>
                  <p style={{ color:"#6b7280", marginBottom:16 }}>Hali live dars o'tkazilmagan</p>
                  <button onClick={() => setShowLive(true)}
                    style={{ padding:"12px 24px", background:"#ef4444", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    Birinchi Live Darsni Boshlang
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {pastLives.map((live) => (
                    <div key={live.id} style={{ padding:"16px 20px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                      <div style={{ width:44, height:44, borderRadius:10, background: live.status==="live"?"#ef4444":"#334155", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <LuRadio size={20} color="#fff"/>
                      </div>
                      <div style={{ flex:1, minWidth:160 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <p style={{ margin:0, fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{live.title}</p>
                          <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700,
                            background: live.status==="live"?"#fee2e2":"#f1f5f9",
                            color:      live.status==="live"?"#ef4444":"#6b7280"
                          }}>
                            {live.status === "live" ? "🔴 LIVE" : "Yakunlandi"}
                          </span>
                        </div>
                        <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>
                          📅 {live.startedAt?.toDate?.()?.toLocaleString("uz") || "—"}
                          {live.viewers > 0 && ` · 👁 ${live.viewers} tomoshabin`}
                        </p>
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
                        <span>⭐ {course.rating || 0}</span>
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
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
};

export default InstructorPanel;