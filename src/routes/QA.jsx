import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";

import { db } from "../firebase/config";
import {
  collection, addDoc, updateDoc, doc, deleteDoc,
  onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";

import { LuSend, LuBot, LuUser, LuLoader, LuMessageCircle, LuInfo, LuCheck, LuClock, LuBadgeCheck, LuTimer } from "react-icons/lu";
import { getNameStyleByKey } from "../constants/shopConstants";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ADMIN_UID = "wr0kldBkU3MDfvRlNqaeOsyv3v63";
const SYSTEM_PROMPT = `Sen "Uzbekas Pixel" online ta'lim platformasining rasmiy AI yordamchisisan.
Ismingiz: Pixel Assistant
Platforma haqida:
- HTML, CSS, JavaScript, React, Ingliz tili, Rus tili, Fransuz tili kurslari mavjud
- Kurslar bepul va pullik bo'ladi
- Har bir kursni tugatgandan so'ng sertifikat beriladi
- DailyTasks orqali XP yig'ib darajangizni oshirishingiz mumkin
- Coin do'koni, turnirlar, quiz va typing o'yinlari mavjud

Qoidalar:
- Har doim o'zbek tilida javob ber (agar savol inglizcha bo'lsa inglizcha)
- Qisqa, aniq va foydali javob ber
- O'zingni "Pixel Assistant —” Uzbekas Pixel platformasi yordamchisi" sifatida tanit
- Platforma bilan bog'liq bo'lmagan savollarga ham umumiy yordam ber
- Javoblar 2-4 jumladan iborat bo'lsin, zarur bo'lsa ko'proq`;

const askGemini = async (question) => {
  if (!GEMINI_KEY) throw new Error("VITE_GEMINI_API_KEY topilmadi!");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\nFoydalanuvchi savoli: ${question}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) throw new Error("Gemini API xatosi");
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || t.aiError;
};

const QA = ({ darkMode, showToast }) => {
  const { user }  = useAuth();
  const { t } = useLang();

  const [questions,    setQuestions]    = useState([]);
  const [inputText,    setInputText]    = useState("");
  const [sending,      setSending]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const bottomRef = useRef(null);

  // в”Ђв”Ђ Real-time savollarni yuklash в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    const q    = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // в”Ђв”Ђ Savol yuborish в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    if (!user) { showToast?.(t.loginToAsk, "error"); return; }
    if (text.length < 5) { showToast?.(t.questionTooShort, "error"); return; }

    setSending(true);
    setInputText("");

    let questionRef = null;

    try {
      // 1. Savolni Firebase ga yozamiz
      questionRef = await addDoc(collection(db, "questions"), {
        uid:          user.uid,
        userName:     user.displayName || user.email,
        userAvatar:   user.photoURL || null,
        questionText: text,
        aiResponse:   null,
        status:       "pending",
        createdAt:    serverTimestamp(),
        answeredAt:   null,
      });

      // 2. Gemini dan javob olamiz
      const aiAnswer = await askGemini(text);

      // 3. Javobni Firebase ga yozamiz
      await updateDoc(doc(db, "questions", questionRef.id), {
        aiResponse:  aiAnswer,
        status:      "answered",
        answeredAt:  serverTimestamp(),
      });

      showToast?.(t.questionAnswered, "success");
    } catch (err) {
      console.error("QA error:", err);

      // Xato bo'lsa ham javob yozamiz
      if (questionRef) {
        await updateDoc(doc(db, "questions", questionRef.id), {
          aiResponse: t.aiResponseError,
          status:     "answered",
          answeredAt: serverTimestamp(),
        }).catch(() => {});
      }
      showToast?.(t.errorOccurred, "error");
    }

    setSending(false);
  };
  const handleDelete = async (id) => {
  if (window.confirm(t.confirmDeleteQuestion)) {
    try {
      await deleteDoc(doc(db, "questions", id));
      showToast?.(t.questionDeleted, "success");
    } catch (err) {
      console.error("O'chirishda xato:", err);
      showToast?.(t.deleteError, "error");
    }
  }
};

  // в”Ђв”Ђ Vaqtni formatlash в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const formatTime = (ts) => {
    if (!ts) return "";
    const date = ts.toDate?.() || new Date(ts);
    return date.toLocaleString("uz", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{ width:"100%", maxWidth:800, margin:"0 auto", padding:"40px 16px 80px" }}>

      {/* Header */}
      <div>
        <div style={{ marginBottom:28 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:darkMode?"#1e3a5f":"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:10, border:`1px solid ${darkMode?"#3b82f6":"#bfdbfe"}` }}>
            <LuMessageCircle size={14}/> {t.questionsAndAnswers}
          </span>
          <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>
            {t.askQuestion}
          </h2>
          <p style={{ margin:0, fontSize:14, color:darkMode?"#94a3b8":"#6b7280" }}>
            {t.qaSubtitle}
          </p>
        </div>
      </div>

      {/* Savol yozish */}
      <div>
        <div style={{
          padding:"20px", borderRadius:16, marginBottom:28,
          background:darkMode?"#1e293b":"#fff",
          border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`,
          boxShadow:"0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            {/* Avatar */}
            <div style={{ width:40, height:40, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0, overflow:"hidden", ...getNameStyleByKey(user.nameColor) }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : user
                ? (user.displayName?.[0] || user.email?.[0] || "?").toUpperCase()
                : <LuUser size={18}/>
              }
            </div>

            {/* Input */}
            <div style={{ flex:1 }}>
             <textarea
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    }
  }}
  // TIZIMGA KIRMAGAN BO'LSA HAM INPUT KO'RINISHI UCHUN:
  placeholder={user ? t.writeQuestion : t.loginToAsk}
  // SENDING BO'LGANDAGINA BLOKLAYMIZ
  disabled={sending} 
  rows={3}
  style={{
    width: "100%", 
    padding: "12px 14px", 
    borderRadius: 12,
    border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
    background: darkMode ? "#0f172a" : "#f8fafc",
    color: darkMode ? "#f1f5f9" : "#111",
    fontSize: 14, 
    resize: "none", 
    outline: "none",
    boxSizing: "border-box",
    opacity: sending ? 0.7 : 1 // Sending payti biroz xiralashadi
  }}
/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                <span style={{ fontSize:11, color:darkMode?"#64748b":"#9ca3af" }}>
                  {inputText.length}/500 {t.characters}
                </span>
                <button
                  onClick={handleSend}
                  disabled={!user || sending || !inputText.trim()}
                  style={{
                    padding:"9px 20px", borderRadius:10, border:"none",
                    background: (!user || sending || !inputText.trim()) ? "#94a3b8" : "#3b82f6",
                    color:"#fff", fontSize:13, fontWeight:700,
                    cursor: (!user || sending || !inputText.trim()) ? "default" : "pointer",
                    display:"flex", alignItems:"center", gap:6,
                    transition:"all 0.2s",
                  }}>
                  {sending
                    ? <><LuLoader size={14} style={{ animation:"spin 1s linear infinite" }}/> {t.aiAnswering}</>
                    : <><LuSend size={14}/> {t.send}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistika */}
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:t.totalQuestions, value:questions.length, color:"#3b82f6", icon: <LuInfo size={20} className={`${darkMode ? "text-white" : "text-black"}`} /> },
            { label:t.answered, value:questions.filter(q=>q.status==="answered").length, color:"#10b981", icon: <LuCheck size={20} className={`${darkMode ? "text-white" : "text-black"}`} /> },
            { label:t.pending,    value:questions.filter(q=>q.status==="pending").length,  color:"#f59e0b", icon: <LuClock size={20} className={`${darkMode ? "text-white" : "text-black"}`} /> },
          ].map((s,i) => (
            <div key={i} style={{ padding:"14px", borderRadius:12, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:4, display: "flex", justifyContent: "center", alignItems: "center" }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:darkMode?"#94a3b8":"#6b7280", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Savollar ro'yxati */}
      {loading ? (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #3b82f6", borderTopColor:"transparent", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }}/>
          <p style={{ color:darkMode?"#94a3b8":"#6b7280", fontSize:14 }}>{t.loading}</p>
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:darkMode?"#94a3b8":"#6b7280" }}>
          <LuMessageCircle size={48} style={{ opacity:0.3, marginBottom:12, margin: "12px auto", color:darkMode?"#475569":"#9ca3af"}}/>
          <p style={{ fontSize:16, fontWeight:600, color:darkMode?"#f1f5f9":"#111" }}>{t.noQuestions}</p>
          <p style={{ fontSize:13, color:darkMode?"#64748b":"#6b7280" }}>{t.beFirstToAsk}</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {questions.map((q, i) => (
            <div>
              <div style={{
                borderRadius:16, overflow:"hidden",
                background:darkMode?"#1e293b":"#fff",
                border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`,
                boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
              }}>
                {/* Savol */}
                <div style={{ padding:"16px 20px", borderBottom:`1px solid ${darkMode?"#334155":"#f3f4f6"}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, overflow:"hidden", flexShrink:0 }}>
                      {q.userAvatar
                        ? <img src={q.userAvatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        : (q.userName?.[0] || "?").toUpperCase()
                      }
                    </div>
                    <div>
                      <p style={{ margin:0, fontWeight:600, fontSize:13, color:darkMode?"#f1f5f9":"#111" }}>
                        {q.userName || t.user}
                        {q.uid === user?.uid && (
                          <span style={{ marginLeft:6, fontSize:10, background:"#3b82f6", color:"#fff", padding:"1px 6px", borderRadius:4 }}>{t.you}</span>
                        )}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:darkMode?"#64748b":"#9ca3af" }}>{formatTime(q.createdAt)}</p>
                    </div>
                    <span style={{
                      marginLeft:"auto", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                      background: q.status==="answered" ? (darkMode?"#064e3b":"#d1fae5") : (darkMode?"#78350f":"#fef3c7"),
                      color:      q.status==="answered" ? (darkMode?"#6ee7b7":"#065f46") : (darkMode?"#fcd34d":"#92400e"),
                    }}>
                      {q.status==="answered" ? <span style={{display:"inline-flex",alignItems:"center",gap:4}}><LuBadgeCheck size={12}/> {t.answered}</span> : <span style={{display:"inline-flex",alignItems:"center",gap:4}}><LuTimer size={12}/> {t.pending}</span>}
                    </span>
                   {user?.uid === ADMIN_UID && (
  <button 
    onClick={() => handleDelete(q.id)}
    style={{ 
      background: "#fee2e2", 
      color: "#ef4444", 
      border: "none", 
      padding: "4px 8px", 
      borderRadius: 6, 
      cursor: "pointer", 
      fontSize: 12,
      fontWeight: 600
    }}
  >
    {t.delete}
  </button>
)}
                  </div>
                  <p style={{ margin:0, fontSize:14, color:darkMode?"#e2e8f0":"#374151", lineHeight:1.6, fontWeight:500 }}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6}}><LuInfo size={16}/> {q.questionText}</span>
                  </p>
                </div>

                {/* AI Javobi */}
                {q.aiResponse ? (
                  <div style={{ padding:"16px 20px", background:darkMode?"#0f172a":"#f8fafc" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <LuBot size={16} color="#fff"/>
                      </div>
                      <div>
                        <p style={{ margin:0, fontWeight:700, fontSize:12, color:"#3b82f6" }}>{t.pixelAssistant}</p>
                        <p style={{ margin:0, fontSize:10, color:darkMode?"#64748b":"#9ca3af" }}>{t.pixelAssistantSubtitle}</p>
                      </div>
                    </div>
                    <p style={{ margin:0, fontSize:14, color:darkMode?"#94a3b8":"#4b5563", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                      {q.aiResponse}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding:"14px 20px", background:darkMode?"#0f172a":"#f8fafc", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid #3b82f6", borderTopColor:"transparent", animation:"spin 0.8s linear infinite", flexShrink:0 }}/>
                    <p style={{ margin:0, fontSize:13, color:darkMode?"#94a3b8":"#6b7280" }}>{t.aiPreparingResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={bottomRef}/>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: ${darkMode ? "#64748b" : "#9ca3af"}; }
      `}</style>
    </div>
  );
};

export default QA;
