import { useState, useEffect, useRef, useCallback } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const quizData = [
  {
    id: 1, category: "HTML", difficulty: "Oson",
    questions: [
      { id: 1, q: "HTML qisqartmasi nima?", options: ["HyperText Markup Language", "High Text Machine Language", "HyperText Machine Language", "None"], answer: 0 },
      { id: 2, q: "HTML da sarlavha uchun qaysi teg ishlatiladi?", options: ["<head>", "<h1>", "<header>", "<title>"], answer: 1 },
      { id: 3, q: "Rasmni qo'shish uchun qaysi teg ishlatiladi?", options: ["<image>", "<img>", "<src>", "<picture>"], answer: 1 },
      { id: 4, q: "HTML da havola uchun qaysi atribut ishlatiladi?", options: ["src", "link", "href", "url"], answer: 2 },
      { id: 5, q: "Bo'sh element qaysi?", options: ["<div>", "<p>", "<br>", "<span>"], answer: 2 },
    ],
  },
  {
    id: 2, category: "CSS", difficulty: "O'rta",
    questions: [
      { id: 1, q: "CSS qisqartmasi nima?", options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Coded Style Sheets"], answer: 0 },
      { id: 2, q: "Matn rangini o'zgartirish uchun qaysi xususiyat?", options: ["font-color", "text-color", "color", "foreground-color"], answer: 2 },
      { id: 3, q: "Flexbox uchun qaysi display qiymati ishlatiladi?", options: ["display: block", "display: flex", "display: inline", "display: grid"], answer: 1 },
      { id: 4, q: "border-radius: 50% nima qiladi?", options: ["Kvadrat qiladi", "Doira qiladi", "Uchburchak qiladi", "O'zgartirmaydi"], answer: 1 },
      { id: 5, q: "Z-index qanday ishlaydi?", options: ["Gorizontal joy", "Vertikal joy", "Qatlam tartibi", "O'lcham"], answer: 2 },
    ],
  },
  {
    id: 3, category: "JavaScript", difficulty: "Qiyin",
    questions: [
      { id: 1, q: "JavaScript qaysi kompaniya tomonidan yaratilgan?", options: ["Google", "Microsoft", "Netscape", "Apple"], answer: 2 },
      { id: 2, q: "typeof null natijasi nima?", options: ["null", "undefined", "object", "string"], answer: 2 },
      { id: 3, q: "=== va == farqi nima?", options: ["Farqi yo'q", "=== qat'iy tenglik (tip ham tekshiradi)", "== qat'iy tenglik", "=== faqat stringlar uchun"], answer: 1 },
      { id: 4, q: "Array.map() nima qaytaradi?", options: ["undefined", "Yangi array", "Shu array", "Boolean"], answer: 1 },
      { id: 5, q: "Promise.all() qachon reject bo'ladi?", options: ["Hech qachon", "Bitta promise reject bo'lsa", "Hammasi reject bo'lsa", "2 ta reject bo'lsa"], answer: 1 },
    ],
  },
  {
    id: 4, category: "React", difficulty: "O'rta",
    questions: [
      { id: 1, q: "React qaysi kompaniya tomonidan yaratilgan?", options: ["Google", "Meta (Facebook)", "Twitter", "Microsoft"], answer: 1 },
      { id: 2, q: "useState hook nima qaytaradi?", options: ["Faqat state", "Faqat setter", "[state, setter]", "{state, setter}"], answer: 2 },
      { id: 3, q: "useEffect ikkinchi argumenti nima?", options: ["Callback", "Dependency array", "Return value", "Initial state"], answer: 1 },
      { id: 4, q: "Key prop nima uchun kerak?", options: ["Styling uchun", "Event handling uchun", "List elementlarni aniqlash uchun", "Ref uchun"], answer: 2 },
      { id: 5, q: "React da state o'zgartirish uchun nima ishlatiladi?", options: ["this.state =", "setState()", "useState setter", "B va C"], answer: 3 },
    ],
  },
];

const TIMER = 20;

const Quiz = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [screen,        setScreen]        = useState("select");
  const [selectedQuiz,  setSelectedQuiz]  = useState(null);
  const [currentQ,      setCurrentQ]      = useState(0);
  const [selected,      setSelected]      = useState(null);
  const [answers,       setAnswers]       = useState([]);
  const [timeLeft,      setTimeLeft]      = useState(TIMER);
  const [streak,        setStreak]        = useState(0);
  const timerRef = useRef(null);

  const startQuiz = (quiz) => {
    const shuffledQuestions = shuffleArray(quiz.questions)
      .slice(0, 5)
      .map((q) => ({
        ...q,
        _shuffled: (() => {
          const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
          const shuffled = shuffleArray(indexed);
          return {
            options: shuffled.map((x) => x.opt),
            answer:  shuffled.findIndex((x) => x.isCorrect),
          };
        })(),
      }))
      .map((q) => ({
        ...q,
        options: q._shuffled.options,
        answer:  q._shuffled.answer,
      }));

    setSelectedQuiz({ ...quiz, questions: shuffledQuestions });
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setStreak(0);
    setTimeLeft(TIMER);
    setScreen("playing");
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    clearInterval(timerRef.current);
  };

  // Firebase ga saqlash
  const saveQuizResult = useCallback(async (pct, score, totalQ) => {
    if (!user) return;
    try {
      const statsRef  = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      const oldStats  = statsSnap.exists() ? statsSnap.data() : {};

      // quizAvg — o'rtacha hisoblash
      const oldAvg   = oldStats.quizAvg  || 0;
      const oldCount = oldStats.quizCount || 0;
      const newCount = oldCount + 1;
      const newAvg   = Math.round((oldAvg * oldCount + pct) / newCount);

      // XP — har to'g'ri javob uchun 5 XP
      const xpGained = score * 5;
      const newXP    = (oldStats.xp || 0) + xpGained;

      await setDoc(statsRef, {
        xp:        newXP,
        quizAvg:   newAvg,
        quizCount: newCount,
        streak:    oldStats.streak || 0,
      }, { merge: true });

      // Notification
      await setDoc(
        doc(db, "users", user.uid, "notifications", `quiz_${Date.now()}`),
        {
          title:     `Quiz tugadi! ${pct >= 60 ? "🎉" : "📚"}`,
          message:   `${selectedQuiz?.category || ""} testi: ${score}/${totalQ} to'g'ri. +${xpGained} XP!`,
          type:      pct >= 60 ? "success" : "info",
          read:      false,
          createdAt: new Date(),
        }
      );

      showToast && showToast(`+${xpGained} XP qo'shildi! ✅`, "success");
    } catch (err) {
      console.error("Quiz save error:", err);
    }
  }, [user, selectedQuiz, showToast]);

  const handleNext = useCallback((timeout = false) => {
    clearInterval(timerRef.current);
    const q         = selectedQuiz.questions[currentQ];
    const isCorrect = !timeout && selected === q.answer;

    setAnswers((prev) => {
      const newAnswers = [...prev, { correct: isCorrect, selected, timeout }];

      if (currentQ + 1 >= selectedQuiz.questions.length) {
        setScreen("result");
        const score = newAnswers.filter((a) => a.correct).length;
        const pct   = Math.round((score / selectedQuiz.questions.length) * 100);
        showToast && showToast(
          `Test tugadi! ${score}/${selectedQuiz.questions.length} to'g'ri ✅`,
          pct >= 60 ? "success" : "error"
        );
        // Firebase ga saqlash
        setTimeout(() => saveQuizResult(pct, score, selectedQuiz.questions.length), 0);
      }

      return newAnswers;
    });

    setStreak((prev) => (isCorrect ? prev + 1 : 0));

    if (currentQ + 1 < selectedQuiz.questions.length) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setTimeLeft(TIMER);
    }
  }, [selectedQuiz, currentQ, selected, showToast, saveQuizResult]);

  useEffect(() => {
    if (screen !== "playing" || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleNext(true); return TIMER; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, screen, selected, handleNext]);

  const diffColor = { "Oson": "#10b981", "O'rta": "#f59e0b", "Qiyin": "#ef4444" };

  // ── SELECT ────────────────────────────────────────────────────────────────
  if (screen === "select") {
    return (
      <div style={{ width:"100%", maxWidth:900, margin:"0 auto", padding:"40px 20px 80px" }}>
        <ScrollReveal direction="up">
          <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:12, border:"1px solid #bfdbfe" }}>
            🎯 Bilimingizni sinang
          </span>
          <h2 style={{ fontSize:28, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>Quiz / Test</h2>
          <p style={{ color:"#6b7280", fontSize:14, marginBottom:32 }}>Har bir test 5 ta savol, 20 soniya limit</p>
        </ScrollReveal>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16 }}>
          {quizData.map((quiz, i) => (
            <ScrollReveal key={quiz.id} direction="up" delay={i * 80}>
              <div
                onClick={() => startQuiz(quiz)}
                style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px 20px", cursor:"pointer", textAlign:"center", transition:"all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
              >
                <div style={{ fontSize:36, marginBottom:10 }}>
                  {quiz.category === "HTML" ? "🌐" : quiz.category === "CSS" ? "🎨" : quiz.category === "JavaScript" ? "⚡" : "⚛️"}
                </div>
                <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:16, color:darkMode?"#f1f5f9":"#111" }}>{quiz.category}</p>
                <span style={{ display:"inline-block", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:diffColor[quiz.difficulty]+"22", color:diffColor[quiz.difficulty], border:`1px solid ${diffColor[quiz.difficulty]}44`, marginBottom:10 }}>
                  {quiz.difficulty}
                </span>
                <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{quiz.questions.length} savol</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (screen === "playing") {
    const q        = selectedQuiz.questions[currentQ];
    const progress = (currentQ / selectedQuiz.questions.length) * 100;
    const timerPct = (timeLeft / TIMER) * 100;

    return (
      <div style={{ width:"100%", maxWidth:640, margin:"0 auto", padding:"40px 20px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <button onClick={() => setScreen("select")} style={{ background:"none", border:"none", cursor:"pointer", color:"#3b82f6", fontSize:14, fontWeight:600, padding:0 }}>
            ← Chiqish
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {streak >= 2 && <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b" }}>🔥 {streak} ketma-ket!</span>}
            <span style={{ fontSize:13, color:"#6b7280" }}>{currentQ + 1} / {selectedQuiz.questions.length}</span>
          </div>
        </div>

        <div style={{ height:6, borderRadius:3, background:darkMode?"#334155":"#e5e7eb", marginBottom:20 }}>
          <div style={{ height:"100%", borderRadius:3, background:"#3b82f6", width:`${progress}%`, transition:"width 0.3s" }} />
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
          <div style={{ flex:1, height:8, borderRadius:4, background:darkMode?"#334155":"#e5e7eb" }}>
            <div style={{ height:"100%", borderRadius:4, background:timeLeft<=5?"#ef4444":timeLeft<=10?"#f59e0b":"#10b981", width:`${timerPct}%`, transition:"width 1s linear, background 0.3s" }} />
          </div>
          <span style={{ fontSize:14, fontWeight:700, minWidth:28, textAlign:"right", color:timeLeft<=5?"#ef4444":timeLeft<=10?"#f59e0b":darkMode?"#f1f5f9":"#111" }}>
            {timeLeft}s
          </span>
        </div>

        <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px", marginBottom:20 }}>
          <p style={{ margin:0, fontWeight:700, fontSize:17, color:darkMode?"#f1f5f9":"#111", lineHeight:1.5 }}>
            {currentQ + 1}. {q.q}
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {q.options.map((opt, i) => {
            let bg     = darkMode?"#1e293b":"#fff";
            let border = darkMode?"#334155":"#e5e7eb";
            let color  = darkMode?"#f1f5f9":"#374151";
            if (selected !== null) {
              if (i === q.answer)                       { bg="#d1fae5"; border="#10b981"; color="#065f46"; }
              else if (i === selected && i !== q.answer){ bg="#fee2e2"; border="#ef4444"; color="#991b1b"; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                style={{ padding:"14px 18px", borderRadius:12, background:bg, border:`2px solid ${border}`, color, fontSize:14, fontWeight:500, cursor:selected!==null?"default":"pointer", textAlign:"left", transition:"all 0.2s", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:26, height:26, borderRadius:"50%", background:selected!==null&&i===q.answer?"#10b981":selected!==null&&i===selected?"#ef4444":darkMode?"#334155":"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0, color:selected!==null&&(i===q.answer||i===selected)?"#fff":darkMode?"#94a3b8":"#6b7280" }}>
                  {selected!==null&&i===q.answer?"✓":selected!==null&&i===selected?"✗":String.fromCharCode(65+i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button onClick={() => handleNext()}
            style={{ marginTop:20, width:"100%", padding:"14px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer" }}>
            {currentQ + 1 < selectedQuiz.questions.length ? "Keyingisi →" : "Natijani ko'rish 🏆"}
          </button>
        )}
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  const score = answers.filter((a) => a.correct).length;
  const pct   = Math.round((score / selectedQuiz.questions.length) * 100);
  const emoji = pct===100?"🏆":pct>=80?"🎉":pct>=60?"👍":pct>=40?"📚":"💪";
  const msg   = pct===100?"Mukammal! Barcha savollar to'g'ri!":pct>=80?"Ajoyib natija!":pct>=60?"Yaxshi, lekin yaxshiroq bo'ladi!":"Ko'proq o'qish kerak!";

  return (
    <div style={{ width:"100%", maxWidth:580, margin:"0 auto", padding:"40px 20px 80px", textAlign:"center" }}>
      <ScrollReveal direction="up">
        <div style={{ fontSize:64, marginBottom:16 }}>{emoji}</div>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>{msg}</h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:28 }}>{selectedQuiz.category} testi</p>

        <div style={{ width:130, height:130, borderRadius:"50%", border:`8px solid ${pct>=60?"#3b82f6":"#ef4444"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 28px" }}>
          <span style={{ fontSize:32, fontWeight:800, color:pct>=60?"#3b82f6":"#ef4444" }}>{pct}%</span>
          <span style={{ fontSize:12, color:"#6b7280" }}>{score}/{selectedQuiz.questions.length}</span>
        </div>

        <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:14, padding:"16px 20px", marginBottom:24, textAlign:"left" }}>
          {selectedQuiz.questions.map((q, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, paddingBottom:i<selectedQuiz.questions.length-1?10:0, borderBottom:i<selectedQuiz.questions.length-1?`1px solid ${darkMode?"#334155":"#f3f4f6"}`:"none", marginBottom:i<selectedQuiz.questions.length-1?10:0 }}>
              <span style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:answers[i]?.correct?"#d1fae5":"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:answers[i]?.correct?"#065f46":"#991b1b", fontWeight:700 }}>
                {answers[i]?.correct?"✓":"✗"}
              </span>
              <div>
                <p style={{ margin:"0 0 2px", fontSize:13, color:darkMode?"#e2e8f0":"#374151" }}>{q.q}</p>
                {!answers[i]?.correct && (
                  <p style={{ margin:0, fontSize:11, color:"#10b981" }}>To'g'ri: {q.options[q.answer]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={() => startQuiz(selectedQuiz)}
            style={{ padding:"11px 24px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            🔄 Qayta urinish
          </button>
          <button onClick={() => setScreen("select")}
            style={{ padding:"11px 24px", background:"transparent", color:darkMode?"#94a3b8":"#374151", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
            Boshqa test
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Quiz;