import React, { useState, useEffect, useRef, useCallback } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, collection,
  onSnapshot, query, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import {
  LuTrophy, LuSwords, LuKeyboard, LuTarget,
  LuArrowRight, LuArrowLeft, LuRefreshCw,
} from "react-icons/lu";

// ─── So'zlar ──────────────────────────────────────────────────────────────────
const WORDS = [
  "hi","hello","good","bad","day","night","sun","moon","star","sky",
  "water","food","bread","tea","book","pen","table","chair","house","school",
  "friend","boy","girl","city","road","tree","flower","green","blue","red",
  "happy","sad","fast","slow","big","small","new","old","clean","open",
  "close","start","finish","learn","write","read","think","dream","walk","run",
  "play","work","rest","laugh","smile","light","dark","sweet","fresh","warm",
];

const QUIZ_QUESTIONS = [
  { q: "HTML qisqartmasi nima?",             options: ["HyperText Markup Language","High Text Machine Language","HyperText Machine Language","None"],  answer: 0 },
  { q: "CSS flexbox uchun qaysi display?",   options: ["block","flex","inline","grid"],                                                                 answer: 1 },
  { q: "JavaScript typeof null natijasi?",   options: ["null","undefined","object","string"],                                                           answer: 2 },
  { q: "Array.map() nima qaytaradi?",        options: ["undefined","Yangi array","Shu array","Boolean"],                                                answer: 1 },
  { q: "HTML da rasm tegi qaysi?",           options: ["<image>","<img>","<src>","<pic>"],                                                              answer: 1 },
  { q: "CSS border-radius:50% nima?",        options: ["Kvadrat","Doira","Uchburchak","Oval"],                                                          answer: 1 },
  { q: "JS da === nima?",                    options: ["Farqi yo'q","Qat'iy tenglik","Oddiy tenglik","Noto'g'ri"],                                      answer: 1 },
  { q: "React useState nima qaytaradi?",     options: ["Faqat state","Faqat setter","[state, setter]","{state, setter}"],                               answer: 2 },
  { q: "useEffect ikkinchi argumenti?",      options: ["Callback","Dependency array","Return value","Initial state"],                                   answer: 1 },
  { q: "Promise.all qachon reject?",         options: ["Hech qachon","Bitta reject","Hammasi reject","2 ta reject"],                                    answer: 1 },
];

const MEDAL = ["🥇", "🥈", "🥉"];

const getWeekKey = () => {
  const d   = new Date();
  const jan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

const generateWords = (count = 60) =>
  Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);

const shuffleQuestions = () =>
  [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);

// ─── WordsBox — faol so'z doim birinchi qatorda ──────────────────────────────
const WordsBox = ({ words, currentIndex, input, getLetterColor, darkMode, onFocus }) => {
  const containerRef = React.useRef(null);
  const activeRef    = React.useRef(null);
  const [offsetY, setOffsetY] = React.useState(0);

  React.useLayoutEffect(() => {
    if (activeRef.current && containerRef.current) {
      const wordTop = activeRef.current.offsetTop;
      setOffsetY(wordTop);
    }
  }, [currentIndex]);

  return (
    <div
      onClick={onFocus}
      ref={containerRef}
      style={{
        height: 112,
        overflow: "hidden",
        borderRadius: 16,
        padding: "12px 16px",
        marginBottom: 16,
        cursor: "text",
        userSelect: "none",
        position: "relative",
        background: darkMode ? "#1e293b" : "#fff",
        border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
      }}>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 10px",
        transform: `translateY(${-offsetY}px)`,
        transition: "transform 0.15s ease",
      }}>
        {words.map((word, wi) => (
          <span
            key={wi}
            ref={wi === currentIndex ? activeRef : null}
            style={{
              padding: "2px 3px",
              borderRadius: 4,
              fontSize: 19,
              fontFamily: "monospace",
              lineHeight: "32px",
              background: wi === currentIndex
                ? (darkMode ? "#334155" : "#dbeafe")
                : "transparent",
              outline: wi === currentIndex ? "2px solid #3b82f6" : "none",
              opacity: wi < currentIndex ? 0.3 : 1,
            }}>
            {word.split("").map((letter, li) => (
              <span key={li} style={{ color: getLetterColor(wi, li) }}>{letter}</span>
            ))}
            {wi === currentIndex && input.length > word.length && (
              <span style={{ color: "#ef4444" }}>{input.slice(word.length)}</span>
            )}
          </span>
        ))}
      </div>
      {/* Pastdan gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
        background: `linear-gradient(transparent, ${darkMode ? "#1e293b" : "#fff"})`,
        pointerEvents: "none",
        borderRadius: "0 0 16px 16px",
      }} />
    </div>
  );
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const LeaderboardList = ({ entries, currentUid, darkMode, type }) => {
  if (entries.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
      <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.3 }}>🏆</div>
      <p>Hali natijalar yo'q. Birinchi bo'ling!</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {entries.map((e, i) => (
        <div key={`${e.uid}-${i}`} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", borderRadius: 12,
          background: e.uid === currentUid ? (darkMode ? "#1e3a5f" : "#eff6ff") : (darkMode ? "#1e293b" : "#fff"),
          border: `1px solid ${e.uid === currentUid ? "#3b82f6" : (darkMode ? "#334155" : "#e5e7eb")}`,
        }}>
          <div style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
            {i < 3 ? MEDAL[i] : <span style={{ color: "#6b7280", fontSize: 14 }}>#{i + 1}</span>}
          </div>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0, overflow: "hidden" }}>
            {e.avatar ? <img src={e.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (e.name || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: darkMode ? "#f1f5f9" : "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {e.name || "Foydalanuvchi"}
              {e.uid === currentUid && <span style={{ marginLeft: 6, fontSize: 10, background: "#3b82f6", color: "#fff", padding: "1px 6px", borderRadius: 4 }}>Siz</span>}
            </p>
          </div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "#3b82f6", flexShrink: 0 }}>
            {type === "typing" ? `${e.score} WPM` : `${e.score}%`}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Tournament = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [tab, setTab]       = useState("typing");
  const [screen, setScreen] = useState("lobby");
  const [leaderboard, setLeaderboard] = useState([]);
  const [myBest, setMyBest] = useState({ typing: 0, quiz: 0 });
  const weekKey = getWeekKey();

  // Typing
  const [words, setWords]               = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput]               = useState("");
  const [typedWords, setTypedWords]     = useState([]);
  const [timeLeft, setTimeLeft]         = useState(60);
  const [started, setStarted]           = useState(false);
  const [finished, setFinished]         = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Quiz
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ]   = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [qTimeLeft, setQTimeLeft] = useState(15);
  const [quizDone, setQuizDone]   = useState(false);

  const inputRef          = useRef(null);
  const timerRef          = useRef(null);

  const savedRef          = useRef(false);

  // Leaderboard
  useEffect(() => {
    const col   = tab === "typing" ? "tournamentTyping" : "tournamentQuiz";
    const field = tab === "typing" ? "wpm" : "score";
    const q = query(collection(db, col), orderBy(field, "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const best = {};
      snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((e) => e.week === weekKey)
        .forEach((e) => {
          const val = tab === "typing" ? e.wpm : e.score;
          if (!best[e.uid] || val > best[e.uid].score) {
            best[e.uid] = { uid: e.uid, name: e.name, avatar: e.avatar || null, score: val };
          }
        });
      setLeaderboard(Object.values(best).sort((a, b) => b.score - a.score));
    });
    return () => unsub();
  }, [tab, weekKey]);

  // My best
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "data", "tournamentBest"))
      .then((snap) => { if (snap.exists()) setMyBest(snap.data()); })
      .catch(() => {});
  }, [user]);

  // Save result
  const saveResult = useCallback(async (score, type) => {
    if (!user || savedRef.current) return;
    savedRef.current = true;
    try {
      const col   = type === "typing" ? "tournamentTyping" : "tournamentQuiz";
      const field = type === "typing" ? "wpm" : "score";
      await addDoc(collection(db, col), {
        uid: user.uid, name: user.displayName || user.email,
        avatar: user.photoURL || null, [field]: score,
        week: weekKey, createdAt: serverTimestamp(),
      });
      const updated = { ...myBest, [type]: Math.max(myBest[type] || 0, score) };
      await setDoc(doc(db, "users", user.uid, "data", "tournamentBest"), updated);
      setMyBest(updated);

      const xp = Math.max(10, type === "typing" ? Math.floor(score / 5) : Math.floor(score / 3));
      const statsRef  = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        await updateDoc(statsRef, { xp: (statsSnap.data().xp || 0) + xp });
      } else {
        await setDoc(statsRef, { xp, streak: 0 });
      }
      showToast && showToast(`🏆 +${xp} XP qo'shildi!`, "success");
    } catch (err) { console.error(err); }
  }, [user, weekKey, myBest, showToast]);

  // ── TYPING ────────────────────────────────────────────────────────────────
  const startTyping = useCallback(() => {
    clearInterval(timerRef.current);
    savedRef.current = false;
    setWords(generateWords());
    setCurrentIndex(0); setInput(""); setTypedWords([]);
    setTimeLeft(60); setStarted(false); setFinished(false); setCorrectCount(0);
    setScreen("typing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (finished && tab === "typing") {
      const wpm = Math.round((correctCount / 60) * 60);
      (wpm, "typing");
    }
  }, [finished,tab,correctCount,saveResult,user,weekKey,showToast,startTyping,timeLeft,started,typedWords,words,currentIndex,input,inputRef,timerRef,setWords,setCurrentIndex,setInput,setTypedWords,setTimeLeft,setStarted,setFinished,setCorrectCount]);

  const handleTypingInput = (e) => {
    const val = e.target.value;
    if (!started && val.length > 0) {
      setStarted(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timerRef.current); setFinished(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    if (finished) return;
    if (val.endsWith(" ")) {
      const typed   = val.trim();
      const correct = typed === words[currentIndex];
      setTypedWords((prev) => [...prev, { word: typed, correct }]);
      if (correct) setCorrectCount((p) => p + 1);
      setCurrentIndex((p) => p + 1);
      setInput("");
    } else {
      setInput(val);
    }
  };

  const typingWpm = correctCount > 0
    ? (finished ? Math.round((correctCount / 60) * 60) : Math.round((correctCount / Math.max(60 - timeLeft, 1)) * 60))
    : 0;



  const getLetterColor = (wi, li) => {
    if (wi < currentIndex) {
      const t = typedWords[wi];
      if (!t) return darkMode ? "#475569" : "#9ca3af";
      if (!t.correct) {
        const tl = t.word[li], ol = words[wi]?.[li];
        if (tl === undefined) return "#ef4444";
        return tl === ol ? (darkMode ? "#94a3b8" : "#6b7280") : "#ef4444";
      }
      return darkMode ? "#94a3b8" : "#6b7280";
    }
    if (wi === currentIndex) {
      const tl = input[li];
      if (tl === undefined) return darkMode ? "#f1f5f9" : "#111";
      return tl === words[wi]?.[li] ? "#10b981" : "#ef4444";
    }
    return darkMode ? "#475569" : "#9ca3af";
  };

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    clearInterval(timerRef.current);
    savedRef.current = false;
    setQuestions(shuffleQuestions());
    setCurrentQ(0); setSelected(null); setAnswers([]); setQTimeLeft(15); setQuizDone(false);
    setScreen("quiz");
  }, []);

  const handleQuizAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    clearInterval(timerRef.current);
  };

  const handleNextQ = useCallback((timeout = false) => {
    clearInterval(timerRef.current);
    if (!questions[currentQ]) return;
    const isCorrect  = !timeout && selected === questions[currentQ].answer;
    const newAnswers = [...answers, { correct: isCorrect, selected, timeout }];
    setAnswers(newAnswers);
    if (currentQ + 1 >= questions.length) {
      const score = Math.round((newAnswers.filter((a) => a.correct).length / questions.length) * 100);
      setQuizDone(true);
      setScreen("result");
      saveResult(score, "quiz");
    } else {
      setCurrentQ((p) => p + 1);
      setSelected(null);
      setQTimeLeft(15);
    }
  }, [currentQ, questions, selected, answers, saveResult]);

  useEffect(() => {
    if (screen !== "quiz" || selected !== null || quizDone) return;
    timerRef.current = setInterval(() => {
      setQTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleNextQ(true); return 15; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, currentQ, selected, quizDone, handleNextQ]);

  const quizScore = answers.length > 0 && questions.length > 0
    ? Math.round((answers.filter((a) => a.correct).length / questions.length) * 100)
    : 0;

  const goLobby = () => { clearInterval(timerRef.current); setScreen("lobby"); };

  // ════════════ LOBBY ════════════
  if (screen === "lobby") return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto", padding: "40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            ⚔️ Turnir
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", color: darkMode ? "#f1f5f9" : "#111" }}>Haftalik Turnir</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Hafta: {weekKey}</p>
        </div>

        {/* Best natijalar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <LuKeyboard size={22} />, color: "#8b5cf6", label: "Eng yaxshi WPM",  value: myBest.typing ? `${myBest.typing} WPM` : "—" },
            { icon: <LuTarget size={22} />,   color: "#10b981", label: "Eng yaxshi Quiz", value: myBest.quiz   ? `${myBest.quiz}%`    : "—" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, textAlign: "center" }}>
              <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { id: "typing", label: "Typing", icon: <LuKeyboard size={16} /> },
            { id: "quiz",   label: "Quiz",   icon: <LuTarget size={16} />   },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: tab === t.id ? "#3b82f6" : (darkMode ? "#1e293b" : "#f1f5f9"), color: tab === t.id ? "#fff" : (darkMode ? "#94a3b8" : "#374151"), fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Boshlash */}
        <button onClick={() => tab === "typing" ? startTyping() : startQuiz()}
          style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28, boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}>
          <LuSwords size={22} />
          {tab === "typing" ? "Typing Turnirini Boshlash (60s)" : "Quiz Turnirini Boshlash (5 savol)"}
        </button>

        {/* Reyting */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <LuTrophy size={18} style={{ color: "#f59e0b" }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: darkMode ? "#f1f5f9" : "#111" }}>
            Bu haftaning reytingi — {tab === "typing" ? "Typing" : "Quiz"}
          </h3>
        </div>
        <LeaderboardList entries={leaderboard} currentUid={user?.uid} darkMode={darkMode} type={tab} />
      </ScrollReveal>
    </div>
  );

  // ════════════ TYPING ════════════
  if (screen === "typing") return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={goLobby} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <LuArrowLeft size={16} /> Chiqish
        </button>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: timeLeft <= 10 ? "#ef4444" : "#3b82f6", lineHeight: 1 }}>{timeLeft}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>soniya</div>
          </div>
          {started && <>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>{typingWpm}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>WPM</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{correctCount}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>To'g'ri</div>
            </div>
          </>}
        </div>
      </div>

      <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#334155" : "#e5e7eb", marginBottom: 20 }}>
        <div style={{ height: "100%", borderRadius: 3, background: timeLeft <= 10 ? "#ef4444" : "#3b82f6", width: `${(timeLeft / 60) * 100}%`, transition: "width 1s linear" }} />
      </div>

      <WordsBox
        words={words}
        currentIndex={currentIndex}
        input={input}
        getLetterColor={getLetterColor}
        darkMode={darkMode}
        onFocus={() => inputRef.current?.focus()}
      />

      <input ref={inputRef} value={input} onChange={handleTypingInput}
        autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
        disabled={finished} style={{ opacity: 0, position: "absolute", pointerEvents: "none", width: 1, height: 1 }} />

      {!started && !finished && (
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14 }}>⌨Yozishni boshlang — timer avtomatik boshlanadi!</p>
      )}
      {finished && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ color: "#10b981", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>✅ Natija saqlandi! WPM: {typingWpm}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={startTyping} style={{ padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <LuRefreshCw size={16} /> Qayta
            </button>
            <button onClick={goLobby} style={{ padding: "12px 24px", background: "transparent", color: darkMode ? "#94a3b8" : "#374151", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <LuTrophy size={16} /> Reyting
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ════════════ QUIZ ════════════
  if (screen === "quiz" && !quizDone) {
    const q = questions[currentQ];
    if (!q) return null;
    return (
      <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: "32px 16px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={goLobby} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <LuArrowLeft size={16} /> Chiqish
          </button>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{currentQ + 1} / {questions.length}</span>
        </div>

        <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#334155" : "#e5e7eb", marginBottom: 16 }}>
          <div style={{ height: "100%", borderRadius: 3, background: "#3b82f6", width: `${(currentQ / questions.length) * 100}%`, transition: "width 0.3s" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: darkMode ? "#334155" : "#e5e7eb" }}>
            <div style={{ height: "100%", borderRadius: 4, background: qTimeLeft <= 5 ? "#ef4444" : qTimeLeft <= 10 ? "#f59e0b" : "#10b981", width: `${(qTimeLeft / 15) * 100}%`, transition: "width 1s linear" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: qTimeLeft <= 5 ? "#ef4444" : (darkMode ? "#f1f5f9" : "#111"), minWidth: 30 }}>{qTimeLeft}s</span>
        </div>

        <div style={{ padding: "20px 24px", borderRadius: 16, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, marginBottom: 16 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: darkMode ? "#f1f5f9" : "#111", lineHeight: 1.5 }}>
            {currentQ + 1}. {q.q}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = darkMode ? "#1e293b" : "#fff", border = darkMode ? "#334155" : "#e5e7eb", color = darkMode ? "#f1f5f9" : "#374151";
            if (selected !== null) {
              if (i === q.answer)                        { bg = "#d1fae5"; border = "#10b981"; color = "#065f46"; }
              else if (i === selected && i !== q.answer) { bg = "#fee2e2"; border = "#ef4444"; color = "#991b1b"; }
            }
            return (
              <button key={i} onClick={() => handleQuizAnswer(i)} disabled={selected !== null}
                style={{ padding: "14px 18px", borderRadius: 12, background: bg, border: `2px solid ${border}`, color, fontSize: 14, fontWeight: 500, cursor: selected !== null ? "default" : "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: selected !== null && i === q.answer ? "#10b981" : selected !== null && i === selected ? "#ef4444" : (darkMode ? "#334155" : "#f3f4f6"), color: selected !== null && (i === q.answer || i === selected) ? "#fff" : (darkMode ? "#94a3b8" : "#6b7280") }}>
                  {selected !== null && i === q.answer ? "✓" : selected !== null && i === selected ? "✗" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button onClick={() => handleNextQ()} style={{ marginTop: 16, width: "100%", padding: "14px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {currentQ + 1 < questions.length ? <>Keyingisi <LuArrowRight size={16} /></> : <>Natija <LuTrophy size={16} /></>}
          </button>
        )}
      </div>
    );
  }

  // ════════════ RESULT ════════════
  if (screen === "result") {
    const isTyping = tab === "typing";
    const score    = isTyping ? typingWpm : quizScore;
    const myRank   = leaderboard.findIndex((e) => e.uid === user?.uid) + 1;
    const emoji    = score >= (isTyping ? 60 : 80) ? "🏆" : score >= (isTyping ? 40 : 60) ? "🎉" : "💪";

    return (
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "40px 16px 80px", textAlign: "center" }}>
        <ScrollReveal direction="up">
          <div style={{ fontSize: 64, marginBottom: 12 }}>{emoji}</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>
            {isTyping ? `${typingWpm} WPM` : `${quizScore}%`}
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 6 }}>{isTyping ? "Typing tezligi" : "Quiz natijasi"}</p>
          {myRank > 0 && (
            <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 15, marginBottom: 24 }}>
              {myRank <= 3 ? MEDAL[myRank - 1] : `#${myRank}`} o'rin
            </p>
          )}

          {isTyping && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "WPM",     value: typingWpm,    color: "#3b82f6" },
                { label: "To'g'ri", value: correctCount, color: "#10b981" },
                { label: "Vaqt",    value: "60s",        color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "14px", borderRadius: 12, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}` }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {!isTyping && (
            <div style={{ padding: "16px 20px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, marginBottom: 24, textAlign: "left" }}>
              {questions.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < questions.length - 1 ? `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` : "none" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: answers[i]?.correct ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: answers[i]?.correct ? "#065f46" : "#991b1b" }}>
                    {answers[i]?.correct ? "✓" : "✗"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, color: darkMode ? "#e2e8f0" : "#374151" }}>{q.q}</p>
                    {!answers[i]?.correct && <p style={{ margin: 0, fontSize: 11, color: "#10b981" }}>To'g'ri: {q.options[q.answer]}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => isTyping ? startTyping() : startQuiz()}
              style={{ flex: 1, padding: "13px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <LuRefreshCw size={16} /> Qayta urinish
            </button>
            <button onClick={goLobby}
              style={{ flex: 1, padding: "13px 0", background: "transparent", color: darkMode ? "#94a3b8" : "#374151", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <LuTrophy size={16} /> Reyting
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return null;
};

export default Tournament;