import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  doc, getDoc, setDoc, runTransaction,
  increment, collection, addDoc,
} from "firebase/firestore";
import {
  getDatabase, ref, set, onValue, off,
  push, remove, onDisconnect, serverTimestamp as rtServerTimestamp,
} from "firebase/database";
import ScrollReveal from "../components/ScrollReveal";
import {
  LuSwords, LuTrophy, LuBrain, LuFlame, LuStar,
  LuLoader, LuRefreshCw, 
  LuZap, LuTarget, LuUsers, LuClock,
  LuShield, 
} from "react-icons/lu";

const BATTLE_DURATION  = 60;
const DEFAULT_WAGER_XP = 50;
const GEMINI_API_KEY   = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL       = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const FALLBACK_POOL = [
  { id:1,  category:"HTML",       difficulty:"Oson",  q:"HTML qisqartmasi nima?",                 options:["HyperText Markup Language","High Text Machine","HyperText Machine Language","Home Tool Markup"],    answer:0, explanation:"HTML = HyperText Markup Language." },
  { id:2,  category:"HTML",       difficulty:"Oson",  q:"Rasm uchun qaysi teg?",                  options:["<image>","<img>","<src>","<pic>"],                                                                  answer:1, explanation:"<img> HTML da rasm uchun." },
  { id:3,  category:"HTML",       difficulty:"Oson",  q:"Eng katta sarlavha tegi?",               options:["<h6>","<h3>","<h1>","<heading>"],                                                                   answer:2, explanation:"<h1> eng katta sarlavha." },
  { id:4,  category:"HTML",       difficulty:"O'rta", q:"HTML5 semantik bo'lmagan element?",       options:["<article>","<section>","<div>","<nav>"],                                                           answer:2, explanation:"<div> semantik ma'nosiz." },
  { id:5,  category:"HTML",       difficulty:"O'rta", q:"defer atributi qaysi tegga?",             options:["<link>","<style>","<script>","<meta>"],                                                            answer:2, explanation:"defer <script> tegiga tegishli." },
  { id:6,  category:"HTML",       difficulty:"Qiyin", q:"Shadow DOM nima uchun?",                  options:["SEO","Izolyatsiya","Tezlik","Animatsiya"],                                                         answer:1, explanation:"Shadow DOM komponentlarni izolyatsiya qiladi." },
  { id:7,  category:"CSS",        difficulty:"Oson",  q:"Matn rangi uchun CSS?",                   options:["font-color","text-color","color","foreground"],                                                    answer:2, explanation:"color matn rangini belgilaydi." },
  { id:8,  category:"CSS",        difficulty:"Oson",  q:"Elementni yashirish?",                    options:["hide:true","visible:false","display:none","opacity:0"],                                            answer:2, explanation:"display:none butunlay yashiradi." },
  { id:9,  category:"CSS",        difficulty:"Oson",  q:"border-radius:50% nima qiladi?",          options:["Kvadrat","Doira","Uchburchak","O'zgartirmaydi"],                                                  answer:1, explanation:"50% doira shakl hosil qiladi." },
  { id:10, category:"CSS",        difficulty:"O'rta", q:"Flexbox uchun display?",                  options:["block","flex","inline","grid"],                                                                    answer:1, explanation:"display:flex flexbox ni yoqadi." },
  { id:11, category:"CSS",        difficulty:"O'rta", q:"CSS specificity eng kuchli?",             options:["Element","Class","ID","Inline style"],                                                             answer:3, explanation:"Inline style eng kuchli — 1000 ball." },
  { id:12, category:"CSS",        difficulty:"Qiyin", q:"will-change nima qiladi?",                options:["O'chiradi","GPU optimizatsiya","Rang","Transition"],                                               answer:1, explanation:"will-change GPU ni oldindan tayyorlaydi." },
  { id:13, category:"JavaScript", difficulty:"Oson",  q:"Konsolga chiqarish?",                     options:["print()","echo()","console.log()","log()"],                                                        answer:2, explanation:"console.log() JS standart." },
  { id:14, category:"JavaScript", difficulty:"Oson",  q:"Massivga element qo'shish?",              options:["arr.add()","arr.push()","arr.append()","arr.insert()"],                                           answer:1, explanation:"push() massiv oxiriga qo'shadi." },
  { id:15, category:"JavaScript", difficulty:"Oson",  q:"Massiv uzunligi?",                        options:[".size",".count",".length",".total"],                                                               answer:2, explanation:".length uzunlikni qaytaradi." },
  { id:16, category:"JavaScript", difficulty:"O'rta", q:"typeof null natijasi?",                   options:["null","undefined","object","string"],                                                              answer:2, explanation:"typeof null === 'object' — JS bug." },
  { id:17, category:"JavaScript", difficulty:"O'rta", q:"=== va == farqi?",                        options:["Farqi yo'q","=== tip ham tekshiradi","== qat'iy","=== faqat string"],                            answer:1, explanation:"=== qiymat va tipni tekshiradi." },
  { id:18, category:"JavaScript", difficulty:"O'rta", q:"Array.map() nima qaytaradi?",             options:["undefined","Yangi array","Shu array","Boolean"],                                                  answer:1, explanation:"map() yangi array qaytaradi." },
  { id:19, category:"JavaScript", difficulty:"Qiyin", q:"Promise.all() qachon reject?",            options:["Hech qachon","1 ta reject","Hammasi","2 ta"],                                                     answer:1, explanation:"Bitta reject bo'lsa darhol reject." },
  { id:20, category:"JavaScript", difficulty:"Qiyin", q:"Closure nima?",                           options:["Yopiq funksiya","Tashqi scope eslab qolish","Class","Async"],                                     answer:1, explanation:"Closure tashqi scope ga kirish imkoni." },
  { id:21, category:"React",      difficulty:"Oson",  q:"useState nima qaytaradi?",                options:["Faqat state","Faqat setter","[state,setter]","{state,setter}"],                                   answer:2, explanation:"useState [state, setter] qaytaradi." },
  { id:22, category:"React",      difficulty:"Oson",  q:"JSX nima?",                               options:["Java","JavaScript XML","JSON","Yangi til"],                                                        answer:1, explanation:"JSX JS ichida HTML yozish." },
  { id:23, category:"React",      difficulty:"Oson",  q:"Key prop nima uchun?",                    options:["Stil","Event","List aniqlash","Ref"],                                                             answer:2, explanation:"Key list elementlarni farqlash uchun." },
  { id:24, category:"React",      difficulty:"O'rta", q:"useEffect 2-argumenti?",                  options:["Callback","Dependency array","Return","Initial state"],                                           answer:1, explanation:"Dependency array o'zgarganda effect ishlaydi." },
  { id:25, category:"React",      difficulty:"O'rta", q:"React.memo nima qiladi?",                 options:["State","Props o'zgarmasa render yo'q","Hook","Context"],                                          answer:1, explanation:"React.memo keraksiz re-render oldini oladi." },
  { id:26, category:"React",      difficulty:"Qiyin", q:"React Fiber nima?",                       options:["CSS","Render bo'laklash","Storage","SSR"],                                                        answer:1, explanation:"Fiber render ni bo'laklarga ajratadi." },
  { id:27, category:"HTML",       difficulty:"O'rta", q:"target='_blank' nima qiladi?",            options:["Yangi tabda","Havola o'chiradi","Yangilanadi","CSS"],                                             answer:0, explanation:"_blank yangi tabda ochadi." },
  { id:28, category:"CSS",        difficulty:"O'rta", q:"position:sticky qanday?",                 options:["Har doim","Scroll da yopishib","Absolute","Fixed"],                                               answer:1, explanation:"sticky scroll da yopishib qoladi." },
  { id:29, category:"JavaScript", difficulty:"O'rta", q:"Array.filter() nima qaytaradi?",          options:["Boolean","Birinchi mos","Mos elementlar array","undefined"],                                      answer:2, explanation:"filter() mos elementlar yangi array qaytaradi." },
  { id:30, category:"React",      difficulty:"O'rta", q:"useCallback va useMemo farqi?",            options:["Farqi yo'q","useCallback funksiya, useMemo qiymat","useMemo tezroq","Faqat class"],              answer:1, explanation:"useCallback funksiya, useMemo qiymat memolashtiradi." },
];

const getShuffledFallback = () => [...FALLBACK_POOL].sort(() => Math.random() - 0.5).slice(0, 10);

const generateBattleQuestions = async (difficulty) => {
  if (!GEMINI_API_KEY) return getShuffledFallback();
  const prompt = `Generate exactly 10 multiple-choice quiz questions about HTML, CSS, JavaScript, React for "${difficulty}" difficulty.
Return ONLY valid JSON array, no markdown:
[{"id":1,"category":"JavaScript","difficulty":"${difficulty}","q":"?","options":["A","B","C","D"],"answer":0,"explanation":"Why."}]
answer is 0-3 index. Mix all 4 categories equally.`;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 3000 } }),
    });
    if (!res.ok) return getShuffledFallback();
    const data = await res.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const qs   = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (!Array.isArray(qs) || qs.length < 5) return getShuffledFallback();
    return qs;
  } catch { return getShuffledFallback(); }
};

const generateMistakeReview = async (wrong) => {
  if (!wrong.length || !GEMINI_API_KEY) return "";
  try {
    const prompt = `Student got these wrong:\n${wrong.map((w, i) => `${i + 1}. Q:"${w.q}" Their:"${w.userAnswer}" Correct:"${w.correct}" (${w.category})`).join("\n")}\nWrite SHORT encouraging Uzbek review. Each: why correct (1 sentence) + tip. End motivation. Max 150 words. Plain text.`;
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 500 } }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch { return ""; }
};

const PlayerAvatar = ({ displayName, avatarUrl, size = 48 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "3px solid #6366f1", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
    {avatarUrl
      ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : (displayName?.[0] || "?").toUpperCase()
    }
  </div>
);

const BattleMode = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const rtdb = getDatabase();

  // UI state — faqat render uchun kerak bo'lganlar
  const [screen,       setScreen]       = useState("lobby");
  const [wager,        setWager]        = useState(DEFAULT_WAGER_XP);
  const [opponent,     setOpponent]     = useState(null);
  const [questions,    setQuestions]    = useState([]);
  const [currentQ,     setCurrentQ]     = useState(0);
  const [selected,     setSelected]     = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(BATTLE_DURATION);
  const [countdown,    setCountdown]    = useState(3);
  const [myScore,      setMyScore]      = useState(0);
  const [opScore,      setOpScore]      = useState(0);
  const [resultData,   setResultData]   = useState(null);
  const [aiReview,     setAiReview]     = useState("");
  const [loadingAI,    setLoadingAI]    = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [myXP,         setMyXP]        = useState(0);

  // Logic refs — stale closure yo'q, ESLint warning yo'q
  const answersRef   = useRef([]);
  const questionsRef = useRef([]);
  const battleIdRef  = useRef(null);
  const myRoleRef    = useRef("player1");
  const timerRef     = useRef(null);
  const countdownRef = useRef(null);
  const battleRef    = useRef(null);
  const queueRef     = useRef(null);
  const savingRef    = useRef(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "data", "stats")).then((snap) => {
      if (snap.exists()) setMyXP(snap.data().xp || 0);
    });
  }, [user]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    if (queueRef.current) remove(queueRef.current).catch(() => {});
    if (battleRef.current) off(battleRef.current);
  }, []);

  const startSearch = useCallback(async () => {
    if (!user || loadingMatch) return;
    if (myXP < wager) { showToast?.(`Yetarli XP yo'q! Kerak: ${wager}`, "error"); return; }
    setLoadingMatch(true);

    try {
      const queuePath = ref(rtdb, "battleQueue");
      const myEntry   = { uid: user.uid, displayName: user.displayName || "Foydalanuvchi", avatarUrl: user.photoURL || "", wager, joinedAt: rtServerTimestamp() };

      onValue(queuePath, async (snap) => {
        off(queuePath);
        const queue   = snap.val() || {};
        const entries = Object.entries(queue).filter(([, v]) => v.uid !== user.uid && v.wager === wager);

        if (entries.length > 0) {
          const [opKey, opData] = entries[0];
          const newBattleRef    = push(ref(rtdb, "battles"));
          const bId             = newBattleRef.key;
          const mySnap          = await getDoc(doc(db, "users", user.uid, "data", "stats"));
          const myAvg           = mySnap.exists() ? (mySnap.data().quizAvg || 0) : 0;
          const diff            = myAvg < 40 ? "Oson" : myAvg < 70 ? "O'rta" : "Qiyin";
          const qs              = await generateBattleQuestions(diff);

          await set(newBattleRef, {
            id: bId, status: "countdown",
            player1: { uid: user.uid, displayName: user.displayName || "P1", avatarUrl: user.photoURL || "", score: 0, answers: {} },
            player2: { uid: opData.uid, displayName: opData.displayName, avatarUrl: opData.avatarUrl || "", score: 0, answers: {} },
            questions: qs, wager, createdAt: rtServerTimestamp(),
          });
          await remove(ref(rtdb, `battleQueue/${opKey}`)).catch(() => {});

          battleIdRef.current  = bId;
          myRoleRef.current    = "player1";
          questionsRef.current = qs;
          setOpponent({ uid: opData.uid, displayName: opData.displayName, avatarUrl: opData.avatarUrl });
          setQuestions(qs);
          setLoadingMatch(false);
          setScreen("countdown");
          startCountdown(bId);

        } else {
          const myQueueRef = push(queuePath);
          queueRef.current = myQueueRef;
          await set(myQueueRef, myEntry);
          onDisconnect(myQueueRef).remove();
          setScreen("searching");
          setLoadingMatch(false);

          const battlesPath = ref(rtdb, "battles");
          onValue(battlesPath, (bSnap) => {
            const battles = bSnap.val() || {};
            for (const [bId, battle] of Object.entries(battles)) {
              if (battle.player2?.uid !== user.uid) continue;
              off(battlesPath);
              remove(myQueueRef).catch(() => {});
              queueRef.current = null;
              const qs = battle.questions || getShuffledFallback();
              battleIdRef.current  = bId;
              myRoleRef.current    = "player2";
              questionsRef.current = qs;
              setOpponent({ uid: battle.player1.uid, displayName: battle.player1.displayName, avatarUrl: battle.player1.avatarUrl });
              setQuestions(qs);
              setScreen("countdown");
              startCountdown(bId);
              break;
            }
          });
        }
      }, { onlyOnce: true });

    } catch (err) {
      console.error("Matchmaking:", err);
      showToast?.("Xatolik! Qayta urinib ko'ring.", "error");
      setLoadingMatch(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wager, myXP, loadingMatch, rtdb, showToast]);

  const cancelSearch = useCallback(async () => {
    if (queueRef.current) { await remove(queueRef.current).catch(() => {}); queueRef.current = null; }
    setScreen("lobby");
    setLoadingMatch(false);
  }, []);

  const startCountdown = useCallback((bId) => {
    let c = 3;
    setCountdown(c);
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current);
        setScreen("battle");
        startBattleTimer(bId);
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startBattleTimer = useCallback((bId) => {
    answersRef.current = [];
    setCurrentQ(0); setSelected(null); setMyScore(0); setOpScore(0);
    setTimeLeft(BATTLE_DURATION);

    battleRef.current = ref(rtdb, `battles/${bId}`);
    onValue(battleRef.current, (snap) => {
      const data = snap.val();
      if (!data) return;
      const opKey = myRoleRef.current === "player1" ? "player2" : "player1";
      setOpScore(data[opKey]?.score || 0);
    });

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleBattleEnd(bId); return 0; }
        return t - 1;
      });
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtdb]);

  const handleAnswer = useCallback((idx) => {
    setSelected((prev) => { if (prev !== null) return prev; return idx; });

    const qs = questionsRef.current;
    const q  = qs[currentQ];
    if (!q) return;

    const isCorrect = idx === q.answer;
    answersRef.current = [...answersRef.current, {
      correct: isCorrect, selected: idx, q: q.q, category: q.category,
      userAnswer: q.options[idx], correct_ans: q.options[q.answer], explanation: q.explanation || "",
    }];

    setMyScore((s) => {
      const ns   = isCorrect ? s + 1 : s;
      const bId  = battleIdRef.current;
      const role = myRoleRef.current;
      if (bId) {
        set(ref(rtdb, `battles/${bId}/${role}/answers/${currentQ}`), { idx, correct: isCorrect }).catch(() => {});
        set(ref(rtdb, `battles/${bId}/${role}/score`), ns).catch(() => {});
      }
      return ns;
    });

    setTimeout(() => {
      setCurrentQ((cq) => {
        if (cq + 1 < qs.length) { setSelected(null); return cq + 1; }
        clearInterval(timerRef.current);
        handleBattleEnd(battleIdRef.current);
        return cq;
      });
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, rtdb]);

  const handleBattleEnd = useCallback((bId) => {
    clearInterval(timerRef.current);
    if (savingRef.current) return;
    savingRef.current = true;

    const finalAnswers = answersRef.current;
    const score        = finalAnswers.filter((a) => a.correct).length;
    const qs           = questionsRef.current;

    setOpScore((opFinal) => {
      const iWon    = score > opFinal;
      const isDraw  = score === opFinal;
      const xpDelta = isDraw ? 0 : iWon ? wager : -wager;

      setResultData({ score, opScore: opFinal, iWon, isDraw, xpDelta, answers: finalAnswers, questions: qs });
      setScreen("result");

      (async () => {
        try {
          const statsRef = doc(db, "users", user.uid, "data", "stats");
          await runTransaction(db, async (tx) => {
            const snap = await tx.get(statsRef);
            const old  = snap.exists() ? snap.data() : {};
            tx.set(statsRef, { xp: Math.max(0, (old.xp || 0) + xpDelta), battleWins: (old.battleWins || 0) + (iWon ? 1 : 0) }, { merge: true });
          });
          await setDoc(doc(db, "users", user.uid), { xp: increment(xpDelta) }, { merge: true });
          await addDoc(collection(db, "users", user.uid, "notifications"), {
            title: iWon ? "🏆 G'alaba!" : isDraw ? "🤝 Durang!" : "💪 Jang tugadi!",
            message: `${score}/${qs.length} savol. XP: ${xpDelta >= 0 ? "+" : ""}${xpDelta}`,
            type: iWon ? "success" : "info", read: false, createdAt: new Date(),
          });
          showToast?.(iWon ? `🏆 G'alaba! +${wager} XP!` : isDraw ? "🤝 Durang!" : "💪 Jang tugadi!", iWon ? "success" : "error");
        } catch (e) { console.error(e); }
        finally { savingRef.current = false; }

        const wrong = finalAnswers.filter((a) => !a.correct);
        if (wrong.length > 0) {
          setLoadingAI(true);
          const review = await generateMistakeReview(wrong.map((a) => ({ q: a.q, category: a.category, userAnswer: a.userAnswer, correct: a.correct_ans })));
          setAiReview(review);
          setLoadingAI(false);
        }
      })();

      if (bId) remove(ref(rtdb, `battles/${bId}`)).catch(() => {});
      return opFinal;
    });

  }, [wager, user, rtdb, showToast]);

  const resetBattle = () => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    if (battleRef.current) off(battleRef.current);
    answersRef.current = []; questionsRef.current = [];
    battleIdRef.current = null; myRoleRef.current = "player1"; savingRef.current = false;
    setOpponent(null); setQuestions([]); setCurrentQ(0); setSelected(null);
    setMyScore(0); setOpScore(0); setTimeLeft(BATTLE_DURATION);
    setResultData(null); setAiReview(""); setScreen("lobby");
  };

  const card = darkMode ? "#1e293b" : "#ffffff";
  const bdr  = darkMode ? "#334155" : "#e2e8f0";
  const txt  = darkMode ? "#f1f5f9" : "#111827";
  const sub  = darkMode ? "#94a3b8" : "#6b7280";

  if (screen === "lobby") return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}><LuSwords className="text-white mx-auto" /></div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: txt, margin: "0 0 8px" }}>AI Battle Arena</h2>
          <p style={{ color: sub, fontSize: 14 }}>Real vaqtda 1v1 bellashuv · AI savollar · XP tikish</p>
        </div>

        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontWeight: 700, color: txt, display: "flex", alignItems: "center", gap: 8 }}>
            <LuStar size={18} color="#f59e0b" /> XP tikish miqdori
          </h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[25, 50, 100, 200].map((amt) => (
              <button key={amt} onClick={() => setWager(amt)}
                style={{ flex: 1, minWidth: 70, padding: "12px 0", borderRadius: 10, border: `2px solid ${wager === amt ? "#6366f1" : bdr}`, background: wager === amt ? "#6366f122" : "transparent", color: wager === amt ? "#6366f1" : sub, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>
                ⭐ {amt}
              </button>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: sub }}>
            Sizning XP: <strong style={{ color: "#f59e0b" }}>{myXP}</strong> · G'alaba: +{wager} · Mag'lubiyat: -{wager}
          </p>
          {myXP < wager && (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
             Yetarli XP yo'q!
            </div>
          )}
        </div>

        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontWeight: 700, color: txt, display: "flex", alignItems: "center", gap: 8 }}>
            <LuTarget size={16} color="#6366f1" /> Qoidalar
          </h3>
          {[
            { icon: <LuBrain size={15} color="#8b5cf6" />,  text: "AI darajangizga mos 10 savol generatsiya qiladi" },
            { icon: <LuClock size={15} color="#f59e0b" />,  text: "60 soniya ichida imkon qadar ko'p javob bering" },
            { icon: <LuTrophy size={15} color="#d97706" />, text: "Ko'proq to'g'ri javob bergan yutadi" },
            { icon: <LuStar size={15} color="#f59e0b" />,   text: "G'olib yutqazgandan wager XP oladi" },
            { icon: <LuShield size={15} color="#06b6d4" />, text: "Jangdan so'ng AI xatolaringizni tahlil qiladi" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${bdr}` : "none" }}>
              {r.icon}
              <span style={{ fontSize: 13, color: sub }}>{r.text}</span>
            </div>
          ))}
        </div>

        <button onClick={startSearch} disabled={loadingMatch || myXP < wager}
          style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: myXP < wager ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: myXP < wager ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {loadingMatch
            ? <><LuLoader size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Tayyorlanmoqda...</>
            : <><LuSwords size={20} /> Jangga kirish</>
          }
        </button>
      </ScrollReveal>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (screen === "searching") return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
      <div style={{ width: 100, height: 100, margin: "0 auto 28px", position: "relative" }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", border: "4px solid #6366f1", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LuUsers size={36} color="#6366f1" />
        </div>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: txt, marginBottom: 8 }}>Raqib qidirilmoqda...</h2>
      <p style={{ color: sub, fontSize: 14, marginBottom: 4 }}>Wager: ⭐ {wager} XP</p>
      <p style={{ color: sub, fontSize: 12, marginBottom: 32 }}>Raqib topilganda jang boshlanadi</p>
      <button onClick={cancelSearch} style={{ padding: "10px 28px", borderRadius: 10, border: `1px solid ${bdr}`, background: "transparent", color: sub, cursor: "pointer", fontSize: 14 }}>
        Bekor qilish
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (screen === "countdown") return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, marginBottom: 40 }}>
        <div style={{ textAlign: "center" }}>
          <PlayerAvatar displayName={user?.displayName} avatarUrl={user?.photoURL} size={72} />
          <p style={{ margin: "8px 0 0", fontWeight: 700, color: txt, fontSize: 13 }}>{user?.displayName || "Siz"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "#6366f122", border: "2px solid #6366f1" }}>
          <LuSwords size={20} color="#6366f1" />
        </div>
        <div style={{ textAlign: "center" }}>
          <PlayerAvatar displayName={opponent?.displayName} avatarUrl={opponent?.avatarUrl} size={72} />
          <p style={{ margin: "8px 0 0", fontWeight: 700, color: txt, fontSize: 13 }}>{opponent?.displayName || "Raqib"}</p>
        </div>
      </div>
      <div style={{ fontSize: 96, fontWeight: 900, color: "#6366f1", lineHeight: 1, marginBottom: 8 }}>{countdown}</div>
      <p style={{ color: sub }}>Jang boshlanmoqda...</p>
    </div>
  );

  if (screen === "battle" && questions.length > 0) {
    const q          = questions[currentQ];
    const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f59e0b" : "#6366f1";
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PlayerAvatar displayName={user?.displayName} avatarUrl={user?.photoURL} size={36} />
            <span style={{ fontWeight: 800, color: "#6366f1", fontSize: 24 }}>{myScore}</span>
          </div>
          <div style={{ textAlign: "center", background: card, borderRadius: 12, padding: "8px 14px", border: `1px solid ${bdr}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: timerColor, display: "flex", alignItems: "center", gap: 4 }}>
              <LuClock size={16} color={timerColor} /> {timeLeft}s
            </div>
            <div style={{ fontSize: 10, color: sub }}>{Math.min(currentQ + 1, questions.length)}/{questions.length}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#ef4444", fontSize: 24 }}>{opScore}</span>
            <PlayerAvatar displayName={opponent?.displayName} avatarUrl={opponent?.avatarUrl} size={36} />
          </div>
        </div>

        <div style={{ height: 4, background: darkMode ? "#334155" : "#e5e7eb", borderRadius: 2, marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${(currentQ / questions.length) * 100}%`, background: "#6366f1", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
        <div style={{ height: 4, background: darkMode ? "#334155" : "#e5e7eb", borderRadius: 2, marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${(timeLeft / BATTLE_DURATION) * 100}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
        </div>

        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#6366f122", color: "#6366f1" }}>{q?.category}</span>
            <span style={{ fontSize: 11, color: sub }}>{q?.difficulty}</span>
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: txt, lineHeight: 1.5 }}>{currentQ + 1}. {q?.q}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(q?.options || []).map((opt, i) => {
            let bg = card, border = bdr, color = txt;
            if (selected !== null) {
              if (i === q.answer)                        { bg = "#d1fae5"; border = "#10b981"; color = "#065f46"; }
              else if (i === selected && i !== q.answer) { bg = "#fee2e2"; border = "#ef4444"; color = "#991b1b"; }
            }
            const dotBg    = selected !== null && i === q.answer ? "#10b981" : selected !== null && i === selected ? "#ef4444" : darkMode ? "#334155" : "#f3f4f6";
            const dotColor = selected !== null && (i === q.answer || i === selected) ? "#fff" : sub;
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                style={{ padding: "13px 16px", borderRadius: 12, border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 500, cursor: selected !== null ? "default" : "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: dotBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color: dotColor }}>
                  {selected !== null && i === q.answer ? "✓" : selected !== null && i === selected ? "✗" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const { score, opScore: opFinal, iWon, isDraw, xpDelta, answers, questions: qs } = resultData;
    return (
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 16px 80px", textAlign: "center" }}>
        <ScrollReveal direction="up">
          <div style={{ fontSize: 72, marginBottom: 8 }}>{iWon ? "🏆" : isDraw ? "🤝" : "💪"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: txt, marginBottom: 4 }}>{iWon ? "G'alaba!" : isDraw ? "Durang!" : "Yaxshi harakat!"}</h2>
          <p style={{ color: sub, marginBottom: 24 }}>XP: <strong style={{ color: xpDelta >= 0 ? "#10b981" : "#ef4444" }}>{xpDelta >= 0 ? "+" : ""}{xpDelta}</strong></p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 28, background: card, border: `1px solid ${bdr}`, borderRadius: 16, padding: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#6366f1" }}>{score}</div>
              <div style={{ fontSize: 12, color: sub }}>Siz</div>
            </div>
            <LuSwords size={20} color={sub} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#ef4444" }}>{opFinal}</div>
              <div style={{ fontSize: 12, color: sub }}>{opponent?.displayName || "Raqib"}</div>
            </div>
          </div>

          {loadingAI && (
            <div style={{ padding: 20, borderRadius: 14, background: card, border: `1px solid ${bdr}`, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <LuBrain size={18} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: sub, fontSize: 13 }}>AI xatolaringizni tahlil qilmoqda...</span>
            </div>
          )}
          {aiReview && !loadingAI && (
            <div style={{ background: darkMode ? "#1e3a5f" : "#eff6ff", border: `1px solid ${darkMode ? "#1d4ed8" : "#bfdbfe"}`, borderRadius: 14, padding: 20, marginBottom: 20, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <LuBrain size={18} color="#3b82f6" />
                <span style={{ fontWeight: 700, fontSize: 14, color: darkMode ? "#93c5fd" : "#1d4ed8" }}>Xatolaringiz ustida ishlaylikmi?</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: darkMode ? "#94a3b8" : "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{aiReview}</p>
            </div>
          )}

          <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
            {(qs || []).slice(0, answers.length).map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < answers.length - 1 ? `1px solid ${bdr}` : "none" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: answers[i]?.correct ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: answers[i]?.correct ? "#065f46" : "#991b1b" }}>
                  {answers[i]?.correct ? "✓" : "✗"}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: txt }}>{q.q}</p>
                  {!answers[i]?.correct && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#10b981" }}>To'g'ri: {q.options?.[q.answer]}</p>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={resetBattle}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LuRefreshCw size={16} /> Qayta jang
          </button>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
            <span style={{ fontSize: 12, color: sub, display: "flex", alignItems: "center", gap: 4 }}>
              <LuTrophy size={14} color="#f59e0b" /> {answers.filter((a) => a.correct).length} to'g'ri
            </span>
            <span style={{ fontSize: 12, color: sub, display: "flex", alignItems: "center", gap: 4 }}>
              <LuFlame size={14} color="#ef4444" /> {answers.filter((a) => !a.correct).length} xato
            </span>
          </div>
        </ScrollReveal>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return null;
};

export default BattleMode;