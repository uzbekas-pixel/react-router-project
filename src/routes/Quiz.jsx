import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { doc, getDoc, setDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useLang } from "../context/useLang";
import {
  LuBrain, 
  LuTrophy, 
  LuRefreshCw, 
  LuChevronRight, 
  LuFlame, 
  LuGlobe, 
  LuPalette, 
  LuZap, 
  LuAtom, 
  LuLanguages, 
LuInfo,
  LuTimer,
 LuCheck,
  LuSettings, 


  LuTarget
} from "react-icons/lu";
import { completeRealTask } from "../utils/taskManager";

const TIMER              = 20;
const QUESTIONS_PER_QUIZ = 10;
const GEMINI_API_KEY     = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL         = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const DIFF_ORDER = ["Oson", "O'rta", "Qiyin"];

const CATEGORY_CONFIG = {
  HTML:       { icon: <LuGlobe size={32} />, color: "orange" },
  CSS:        { icon: <LuPalette size={32} />, color: "purple" },
  JavaScript: { icon: <LuZap size={32} />, color: "yellow" },
  React:      { icon: <LuAtom size={32} />, color: "cyan" },
  English:    { icon: <LuLanguages size={32} />, color: "blue" },
  Russian:    { icon: <LuLanguages size={32} />, color: "red" },
  French:     { icon: <LuLanguages size={32} />, color: "indigo" },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

const STATIC_QUESTIONS = {
  HTML: {
    Oson: [
      { q:"HTML qisqartmasi nima?", options:["HyperText Markup Language","High Text Machine Language","HyperText Machine Language","Home Tool Markup Language"], answer:0, explanation:"HTML = HyperText Markup Language." },
      { q:"Rasm qo'shish uchun qaysi teg?", options:["<image>","<img>","<src>","<pic>"], answer:1, explanation:"<img> HTML da rasm uchun." },
      { q:"Eng katta sarlavha tegi?", options:["<h6>","<h3>","<h1>","<heading>"], answer:2, explanation:"H1 eng katta sarlavha." },
      { q:"Havola uchun qaysi atribut?", options:["src","link","href","url"], answer:2, explanation:"href havolaning manzilini ko'rsatadi." },
      { q:"Tartibsiz ro'yxat tegi?", options:["<ol>","<li>","<ul>","<dl>"], answer:2, explanation:"<ul> tartiblashtirilmagan ro'yxat." },
      { q:"Paragraf tegi?", options:["<para>","<p>","<pg>","<par>"], answer:1, explanation:"<p> paragraf uchun." },
      { q:"Bo'sh element (void) qaysi?", options:["<div>","<p>","<br>","<span>"], answer:2, explanation:"<br> yopilmaydigan void element." },
      { q:"HTML da izoh yozish?", options:["// izoh","/* izoh */","<!-- izoh -->","## izoh"], answer:2, explanation:"HTML izohlar <!-- --> orasida yoziladi." },
      { q:"Jadval tegi qaysi?", options:["<tbl>","<table>","<grid>","<tab>"], answer:1, explanation:"<table> HTML jadval uchun." },
      { q:"Forma uchun qaysi teg?", options:["<input>","<field>","<form>","<data>"], answer:2, explanation:"<form> forma yaratadi." },
    ],
    "O'rta": [
      { q:"HTML5 semantik bo'lmagan element?", options:["<article>","<section>","<div>","<nav>"], answer:2, explanation:"<div> semantik ma'nosiz." },
      { q:"defer atributi qaysi tegga tegishli?", options:["<link>","<style>","<script>","<meta>"], answer:2, explanation:"defer <script> tegiga tegishli." },
      { q:"data-* atributlari nima uchun?", options:["CSS styling","Maxsus ma'lumot saqlash","Server so'rov","Validatsiya"], answer:1, explanation:"data-* maxsus ma'lumotlar saqlash uchun." },
      { q:"target='_blank' nima qiladi?", options:["Yangi tabda ochadi","Havola o'chiradi","Sahifa yangilanadi","CSS"], answer:0, explanation:"_blank yangi tabda ochadi." },
      { q:"<figure> tegi nima uchun?", options:["Jadval","Rasmga izoh","Video","Form"], answer:1, explanation:"<figure> rasmga izoh berish uchun." },
      { q:"<meta charset='UTF-8'> nima qiladi?", options:["Sarlavha","Kodlash","CSS","Favicon"], answer:1, explanation:"Belgilar kodlashini belgilaydi." },
      { q:"<header> tegi nima?", options:["Faqat sarlavha","Sahifa yoki bo'lim boshi","Footer","Navigation"], answer:1, explanation:"<header> sahifa yoki bo'limning bosh qismi." },
      { q:"<aside> tegi qayerda ishlatiladi?", options:["Asosiy kontent","Yon panel","Footer","Header"], answer:1, explanation:"<aside> asosiy kontentga aloqador yon panel." },
      { q:"autocomplete atributi qaysi elementga tegishli?", options:["<div>","<span>","<input>","<p>"], answer:2, explanation:"autocomplete input elementlari uchun ishlatiladi." },
      { q:"<main> tegi nima maqsadda?", options:["Navigation","Asosiy kontent","Footer","Header"], answer:1, explanation:"<main> sahifaning asosiy kontentini belgilaydi." },
    ],
    Qiyin: [
      { q:"Shadow DOM nima uchun?", options:["SEO","Izolyatsiya","Tezlik","Animatsiya"], answer:1, explanation:"Shadow DOM komponentlarni izolyatsiya qiladi." },
      { q:"<template> tegi qanday render bo'ladi?", options:["Ko'rinadi","Ko'rinmaydi, JS bilan","CSS bilan","Faqat print"], answer:1, explanation:"<template> JS bilan aktivlanadi." },
      { q:"preload va prefetch farqi?", options:["Farqi yo'q","preload hozirgi, prefetch keyingi","prefetch tezroq","preload faqat CSS"], answer:1, explanation:"preload hozirgi, prefetch keyingi sahifa uchun." },
      { q:"ARIA role='alert' nima uchun?", options:["Navigatsiya","Muhim xabarlarni e'lon qilish","Jadval","Form"], answer:1, explanation:"role='alert' ekran o'quvchilariga muhim o'zgarishlarni bildiradi." },
      { q:"Content Security Policy (CSP) nima qiladi?", options:["Tezlashtiradi","XSS hujumlarini oldini oladi","SEO","Cache"], answer:1, explanation:"CSP XSS va injection hujumlarini oldini oladi." },
      { q:"Web Components qanday texnologiyalardan iborat?", options:["HTML+CSS","Custom Elements+Shadow DOM+Templates","React+Vue","JS+CSS"], answer:1, explanation:"Web Components: Custom Elements, Shadow DOM va HTML Templates." },
      { q:"<slot> elementi nima uchun?", options:["CSS","Web Components da kontent joylashtirish","Form","Video"], answer:1, explanation:"<slot> Web Components da tashqaridan kontent qo'shish imkonini beradi." },
      { q:"Intersection Observer nima uchun?", options:["Click event","Element ko'rinish holatini kuzatish","Scroll blok","Animatsiya"], answer:1, explanation:"Intersection Observer element viewport bilan kesishishini kuzatadi." },
    ],
  },
  CSS: {
    Oson: [
      { q:"Matn rangi uchun CSS?", options:["font-color","text-color","color","foreground"], answer:2, explanation:"color matn rangini belgilaydi." },
    ],
    "O'rta": [
      { q:"Flexbox uchun display?", options:["block","flex","inline","grid"], answer:1, explanation:"display:flex flexbox ni yoqadi." },
    ],
    Qiyin: [
      { q:"will-change nima qiladi?", options:["O'chiradi","GPU oldindan optimizatsiya","Rang","Transition"], answer:1, explanation:"will-change GPU ni oldindan tayyorlaydi." },
    ],
  },
  JavaScript: {
    Oson: [
      { q:"Konsolga chiqarish?", options:["print()","echo()","console.log()","log()"], answer:2, explanation:"console.log() JS standart." },
    ],
    "O'rta": [
      { q:"typeof null?", options:["null","undefined","object","string"], answer:2, explanation:"typeof null === 'object' — JS bug." },
    ],
    Qiyin: [
      { q:"Promise.all() qachon reject?", options:["Hech qachon","1 ta reject","Hammasi","2 ta"], answer:1, explanation:"Bitta reject bo'lsa darhol reject." },
    ],
  },
  React: {
    Oson: [
      { q:"useState nima qaytaradi?", options:["Faqat state","Faqat setter","[state,setter]","{state,setter}"], answer:2, explanation:"useState [state, setter] qaytaradi." },
    ],
    "O'rta": [
      { q:"useEffect 2-argumenti?", options:["Callback","Dependency array","Return","Initial state"], answer:1, explanation:"Dependency array o'zgarganda effect ishlaydi." },
    ],
    Qiyin: [
      { q:"React Fiber nima?", options:["CSS","Render bo'laklash","Storage","SSR"], answer:1, explanation:"Fiber render ni bo'laklarga ajratadi." },
    ],
  },
};

const generateAIQuestion = async (category, difficulty, usedQuestionTexts = []) => {
  if (!GEMINI_API_KEY) return null;
  const usedList = usedQuestionTexts.length > 0
    ? usedQuestionTexts.map((q, i) => `${i + 1}. "${q}"`).join("\n")
    : "none";

  const topicHints = {
    HTML:       "tags, attributes, semantics, forms, media, accessibility, web components",
    CSS:        "selectors, flexbox, grid, animations, variables, specificity, responsive",
    JavaScript: "functions, arrays, objects, async, DOM, ES6+, closures, prototypes, events",
    React:      "hooks, components, state, props, lifecycle, context, performance, routing",
    English:    "grammar, tenses, vocabulary, prepositions, conditionals, passive voice",
    Russian:    "grammar, cases, verb conjugation, aspects, syntax, vocabulary",
    French:     "grammar, verb conjugation, tenses, articles, vocabulary, subjunctive",
  };

  const prompt = `You are a quiz generator. Generate ONE unique multiple-choice question about ${category} (topics: ${topicHints[category] || category}) for a "${difficulty}" level student.
STRICT RULES:
1. Do NOT ask about any of these already-used questions:
${usedList}
2. Choose a DIFFERENT topic/concept than what was already asked above
3. Make it appropriate for "${difficulty}" level: ${difficulty === "Oson" ? "basic concepts, beginners" : difficulty === "O'rta" ? "intermediate, practical usage" : "advanced, edge cases, deep concepts"}
4. Return ONLY this exact JSON format, no markdown, no extra text:
{"q":"Your question here?","options":["Option A","Option B","Option C","Option D"],"answer":0,"explanation":"One clear sentence explaining why the answer is correct."}
Where "answer" is the index (0-3) of the correct option.`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 500 },
      }),
    });
    // MANA SHU QATORLARNI QO'SHING:
if (res.status === 429) {
  console.error("Gemini API limiti tugadi, statik savollarga o'tilmoqda...");
  return null; 
}
    if (!res.ok) throw new Error("API xatolik");
    const data   = await res.json();
    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return parsed;
  } catch { return null; }
};

const getDifficultyFromScore = (avg) => {
  if (avg === null || avg === undefined) return "Oson";
  if (avg < 50) return "Oson";
  if (avg < 80) return "O'rta";
  return "Qiyin";
};

const escalateDifficulty   = (d) => { const i = DIFF_ORDER.indexOf(d); return i < DIFF_ORDER.length - 1 ? DIFF_ORDER[i + 1] : d; };
const deescalateDifficulty = (d) => { const i = DIFF_ORDER.indexOf(d); return i > 0 ? DIFF_ORDER[i - 1] : d; };

const shuffleOptions = (q) => {
  if (!q) return null;
  const indexed  = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
  const shuffled = [...indexed].sort(() => Math.random() - 0.5);
  return { ...q, options: shuffled.map((x) => x.opt), answer: shuffled.findIndex((x) => x.isCorrect) };
};

const useUserStats = (user) => {
  const [stats, setStats] = useState({ quizAvg: null, xp: 0, highScores: {} });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (!cancelled && snap.exists()) {
          const d = snap.data();
          setStats({ quizAvg: d.quizAvg ?? null, xp: d.xp || 0, highScores: d.highScores || {} });
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);
  return { stats, loading };
};

const DiffBadge = memo(({ difficulty, t }) => {
  const labels = { "Oson": t.diffEasy, "O'rta": t.diffMedium, "Qiyin": t.diffHard };
  const colors = { "Oson": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", "O'rta": "text-amber-400 bg-amber-500/10 border-amber-500/20", "Qiyin": "text-rose-400 bg-rose-500/10 border-rose-500/20" };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[difficulty] || "text-blue-400 bg-blue-500/10 border-blue-500/20"}`}>
      {labels[difficulty] || difficulty}
    </span>
  );
});

const ExplanationBox = memo(({ explanation, darkMode }) => {
  if (!explanation) return null;
  return (
    <div className={`mt-6 p-4 rounded-2xl border ${darkMode ? "bg-blue-500/5 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-700"}`}>
      <div className="flex gap-3">
        <LuInfo className="shrink-0 mt-0.5" size={18} />
        <p className="text-sm leading-relaxed font-medium">
          {explanation}
        </p>
      </div>
    </div>
  );
});

const Quiz = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const { stats, loading } = useUserStats(user);

  const [screen, setScreen] = useState("select");
  const [category, setCategory] = useState(null);
  const [currentDiff, setCurrentDiff] = useState("Oson");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [hasHintGift, setHasHintGift] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER);
  const [streak, setStreak] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const timerRef = useRef(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(null);

  const initialDiff = useMemo(() => getDifficultyFromScore(stats.quizAvg), [stats.quizAvg]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const achSnap = await getDoc(doc(db, "users", user.uid, "data", "achievements"));
        if (achSnap.exists() && achSnap.data().gift_g1 === true) setHasHintGift(true);
        const statsSnap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (statsSnap.exists()) setHintsRemaining(statsSnap.data().quizHints || 0);
      } catch (err) { console.error(err); }
    })();
  }, [user]);

  const fetchNextQuestion = useCallback(async (cat, diff, usedQs = []) => {
    if (GEMINI_API_KEY) {
      const aiQ = await generateAIQuestion(cat, diff, usedQs);
      if (aiQ) return shuffleOptions({ ...aiQ, category: cat, difficulty: diff });
    }
    const pool = STATIC_QUESTIONS[cat]?.[diff] || STATIC_QUESTIONS[cat]?.["Oson"] || [];
    const unused = pool.filter(q => !usedQs.includes(q.q));
    const source = unused.length > 0 ? unused : pool;
    const picked = source[Math.floor(Math.random() * source.length)];
    return picked ? shuffleOptions({ ...picked, category: cat, difficulty: diff }) : null;
  }, []);

  const saveResult = useCallback(async (pct, score, totalQ, cat) => {
    if (!user || savingRef.current) return;
    savingRef.current = true;
    try {
      const statsRef = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      const old = statsSnap.exists() ? statsSnap.data() : {};
      const oldCount = old.quizCount || 0;
      const newAvg = Math.round(((old.quizAvg || 0) * oldCount + pct) / (oldCount + 1));
      const xpGained = score * 5;
      const prevHS = old.highScores?.[cat] || 0;
      const newHS = score > prevHS ? score : prevHS;

      await setDoc(statsRef, {
        xp: (old.xp || 0) + xpGained, quizAvg: newAvg, quizCount: oldCount + 1,
        highScores: { ...(old.highScores || {}), [cat]: newHS },
      }, { merge: true });

      await setDoc(doc(db, "users", user.uid), { xp: increment(xpGained), quizAvg: newAvg }, { merge: true });
      showToast?.(`+${xpGained} XP! ✅`, "success");
      completeRealTask(user.uid, "quiz");
    } catch (err) { console.error(err); }
    finally { savingRef.current = false; }
  }, [user, showToast]);

  const startQuiz = useCallback(async (cat) => {
    clearInterval(timerRef.current);
    setCategory(cat);
    setLoadingQ(true);
    setCurrentDiff(initialDiff);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setStreak(0);
    setResultData(null);
    setUsedQuestions([]);
    setIsAnswerRevealed(false);
    savingRef.current = false;

    const firstQ = await fetchNextQuestion(cat, initialDiff, []);
    if (!firstQ) { showToast?.(t.loadingError, "error"); setLoadingQ(false); return; }

    setQuestions([firstQ]);
    setUsedQuestions([firstQ.q]);
    setTimeLeft(TIMER);
    setLoadingQ(false);
    setScreen("playing");
  }, [initialDiff, fetchNextQuestion, showToast, t.loadingError]);

  const handleAnswer = useCallback((idx) => {
    setSelected((prev) => {
      if (prev !== null) return prev;
      clearInterval(timerRef.current);
      pendingRef.current = null;
      return idx;
    });
  }, []);

  const handleUseHint = async () => {
    if (!hasHintGift || hintsRemaining <= 0 || isAnswerRevealed || !user || selected !== null) return;
    try {
      const statsRef = doc(db, "users", user.uid, "data", "stats");
      await updateDoc(statsRef, { quizHints: increment(-1) });
      setHintsRemaining(prev => prev - 1);
      setIsAnswerRevealed(true);
      showToast?.(t.hintUsed, "success");
    } catch (err) { console.error(err); showToast?.(t.errorOccurred, "error"); }
  };

  const handleNext = useCallback(async (timeout = false) => {
    clearInterval(timerRef.current);
    setIsAnswerRevealed(false);
    setAnswers((prevAnswers) => {
      const q = questions[currentQ];
      const isCorrect = !timeout && selected === q?.answer;
      const newAnswers = [...prevAnswers, {
        correct: isCorrect, selected, timeout,
        q: q?.q, userAnswer: q?.options?.[selected],
        correct_ans: q?.options?.[q?.answer], explanation: q?.explanation,
      }];
      pendingRef.current = { newAnswers, isCorrect, currentQ: currentQ };
      return newAnswers;
    });
  }, [questions, currentQ, selected]);

  useEffect(() => {
    if (!pendingRef.current) return;
    const { newAnswers, isCorrect, currentQ: cq } = pendingRef.current;
    pendingRef.current = null;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    if (newAnswers.length >= QUESTIONS_PER_QUIZ) {
      const score = newAnswers.filter(a => a.correct).length;
      const pct = Math.round((score / newAnswers.length) * 100);
      setResultData({ score, pct, answers: newAnswers, questions: questions.slice(0, newAnswers.length) });
      setScreen("result");
      saveResult(pct, score, newAnswers.length, category);
    } else {
      const newDiff = isCorrect ? (newStreak >= 2 ? escalateDifficulty(currentDiff) : currentDiff) : deescalateDifficulty(currentDiff);
      setCurrentDiff(newDiff);
      setLoadingQ(true);
      setCurrentQ(cq + 1);
      setSelected(null);
      setTimeLeft(TIMER);
      fetchNextQuestion(category, newDiff, usedQuestions).then(nextQ => {
        if (nextQ) { 
          setQuestions(prev => [...prev, nextQ]); 
          setUsedQuestions(prev => [...prev, nextQ.q]); 
        }
        setLoadingQ(false);
      });
    }
  }, [answers, category, currentDiff, fetchNextQuestion, questions, saveResult, streak, usedQuestions]);

  useEffect(() => {
    if (screen !== "playing" || selected !== null || loadingQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { handleNext(true); return TIMER; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, selected, currentQ, loadingQ, handleNext]);

  // UI RENDERING
  if (screen === "select") return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {t.quizBadge}
          </span>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            {t.quizTitle}
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            {QUESTIONS_PER_QUIZ} {t.quizQuestions} · {TIMER}s {t.secLabel} limit · AI adaptive
          </p>
          {!loading && (
            <div className={`mt-8 inline-flex items-center gap-4 px-6 py-3 rounded-2xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"}`}>
              <LuTarget className="text-blue-500" size={20} />
              <span className="text-sm font-bold text-slate-400">{t.levelLabelPrefix}</span>
              <DiffBadge difficulty={initialDiff} t={t} />
            </div>
          )}
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, i) => {
          const cfg = CATEGORY_CONFIG[cat];
          const hs = stats.highScores?.[cat] || 0;
          return (
            <ScrollReveal key={cat} direction="up" delay={i * 100}>
              <div 
                onClick={() => startQuiz(cat)}
                className={`group relative p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${
                  darkMode 
                    ? "bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60" 
                    : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 shadow-xl shadow-slate-100/50"
                }`}
                style={{ backdropFilter: "blur(20px)" }}
              >
                {/* Background Glow */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[80px] opacity-20 transition-all duration-500 group-hover:scale-150 ${
                  cfg.color === "orange" ? "bg-orange-500" : cfg.color === "purple" ? "bg-purple-500" : cfg.color === "yellow" ? "bg-yellow-500" : "bg-blue-500"
                }`} />

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${
                  darkMode ? `bg-${cfg.color}-500/10 text-${cfg.color}-400` : `bg-${cfg.color}-50 text-${cfg.color}-600`
                }`}>
                  {cfg.icon}
                </div>
                
                <h3 className={`text-xl font-black mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{cat}</h3>
                <div className="flex flex-col gap-1">
                  {hs > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                      <LuTrophy size={14} />
                      {t.highScoreLabel} {hs}/{QUESTIONS_PER_QUIZ}
                    </div>
                  )}
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mt-2">{t.catAIPrompt}</p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-500 transition-all group-hover:gap-4">
                  {t.play} <LuChevronRight />
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );

  if (screen === "playing") {
    const q = questions[currentQ];
    const timerColor = timeLeft <= 5 ? "bg-rose-500 shadow-rose-500/40" : timeLeft <= 10 ? "bg-amber-500 shadow-amber-500/40" : "bg-emerald-500 shadow-emerald-500/40";

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => { clearInterval(timerRef.current); setScreen("select"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
             {t.exitQuiz}
          </button>
          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black animate-bounce">
                <LuFlame size={14} />
                {streak} {t.consecutiveStreak}
              </div>
            )}
            <DiffBadge difficulty={currentDiff} t={t} />
            <div className={`px-4 py-1.5 rounded-xl border text-xs font-black ${darkMode ? "bg-slate-900/40 border-white/5 text-slate-400" : "bg-white border-slate-100 text-slate-500"}`}>
              {Math.min(currentQ + 1, QUESTIONS_PER_QUIZ)} / {QUESTIONS_PER_QUIZ}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 w-full rounded-full bg-slate-800/10 overflow-hidden mb-12">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-700 shadow-lg shadow-indigo-500/30" 
            style={{ width: `${(currentQ / QUESTIONS_PER_QUIZ) * 100}%` }} 
          />
        </div>

        {/* Question Card */}
        {loadingQ ? (
          <div className={`p-16 rounded-[2.5rem] border text-center transition-all animate-pulse ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100"}`}>
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-6 text-indigo-500 animate-spin">
              <LuBrain size={40} />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{t.aiGenerating}</h3>
          </div>
        ) : q ? (
          <ScrollReveal direction="up">
            <div className={`p-8 md:p-12 rounded-[2.5rem] border mb-8 ${darkMode ? "bg-slate-900/40 border-white/5 shadow-2xl shadow-indigo-500/5" : "bg-white border-slate-100 shadow-2xl shadow-slate-200/50"}`} style={{ backdropFilter: "blur(20px)" }}>
              {/* Timer Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-widest">
                  <LuBrain className="text-indigo-400" />
                  {category}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black tabular-nums transition-colors ${timeLeft <= 5 ? "text-rose-500" : darkMode ? "text-white" : "text-slate-900"}`}>
                      {timeLeft}
                      <span className="text-xs ml-1 opacity-50">{t.secLabel}</span>
                    </span>
                    <div className={`mt-2 h-1 w-24 rounded-full overflow-hidden bg-slate-800/20`}>
                      <div className={`h-full transition-all duration-1000 linear ${timerColor}`} style={{ width: `${(timeLeft / TIMER) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                <h2 className={`text-xl md:text-2xl font-black leading-relaxed ${darkMode ? "text-white" : "text-slate-900"}`}>
                  <span className="text-indigo-500 mr-2 opacity-50">#{currentQ + 1}</span>
                  {q.q}
                </h2>
                
                {/* Hint Button */}
                {hasHintGift && hintsRemaining > 0 && !isAnswerRevealed && selected === null && (
                  <button
                    onClick={handleUseHint}
                    className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                      darkMode ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20" : "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <LuBrain size={18} />
                    {t.hintShort} ({hintsRemaining})
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => {
                  const isCorrectAnswer = i === q.answer;
                  const isUserSelection = i === selected;
                  
                  let stateStyle = darkMode ? "bg-slate-800/40 border-white/5 text-slate-300 hover:border-indigo-500/30 hover:bg-slate-800" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-indigo-200";
                  
                  if (selected !== null) {
                    if (isCorrectAnswer) stateStyle = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 z-10 scale-[1.02]";
                    else if (isUserSelection && !isCorrectAnswer) stateStyle = "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25 z-10 scale-[1.02]";
                    else stateStyle = "opacity-40 scale-95 grayscale";
                  } else if (isAnswerRevealed && isCorrectAnswer) {
                    stateStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500 ring-4 ring-emerald-500/10";
                  }

                  return (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)} 
                      disabled={selected !== null || isAnswerRevealed}
                      className={`relative flex items-center gap-4 p-6 rounded-[1.5rem] border text-left font-bold transition-all duration-500 group ${stateStyle}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black transition-all ${
                        selected !== null && (isCorrectAnswer || isUserSelection)
                          ? "bg-white/20 text-white"
                          : darkMode ? "bg-slate-900/60 text-slate-500 group-hover:text-white" : "bg-white text-slate-400 shadow-sm"
                      }`}>
                        {selected !== null && isCorrectAnswer ? <LuCheck /> : selected !== null && isUserSelection ? <LuXCircle /> : String.fromCharCode(65 + i)}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next */}
              {(selected !== null || isAnswerRevealed) && (
                <div className="mt-12 animate-in slide-in-from-top-4 duration-500">
                  <ExplanationBox explanation={q.explanation} darkMode={darkMode} />
                  <button 
                    onClick={() => handleNext()}
                    className="w-full mt-8 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
                  >
                    {currentQ + 1 < QUESTIONS_PER_QUIZ ? <>{t.nextQuestion} <LuChevronRight size={22} /></> : <>{t.seeResult} <LuTrophy size={22} /></>}
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center py-20">
             <p className="text-slate-500 mb-6">{t.loadingError}</p>
             <button onClick={() => setScreen("select")} className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold">{t.otherQuiz}</button>
          </div>
        )}
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const { score, pct, answers: ans, questions: qs } = resultData;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : pct >= 40 ? "📚" : "💪";
    const msg = pct === 100 ? t.allCorrect : pct >= 80 ? t.scoreGreat : pct >= 60 ? t.scoreGood : t.scoreStudy;
    const hs = stats.highScores?.[category] || 0;
    const isNewHS = score > hs;

    return (
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <div className="text-8xl mb-8 transform hover:scale-110 transition-transform duration-500 cursor-default inline-block">{emoji}</div>
            {isNewHS && (
              <div className="mb-6 inline-flex px-6 py-2 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-[0.2em] border border-amber-500/20 animate-pulse">
                <LuTrophy className="inline mr-2" /> {t.newRecord}
              </div>
            )}
            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{msg}</h2>
            <p className="text-slate-500 font-medium">{category} · {t.diffEasy}: {currentDiff}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Accuracy</p>
               <div className="text-5xl font-black tabular-nums text-indigo-500">{pct}%</div>
            </div>
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Total XP</p>
               <div className="text-5xl font-black tabular-nums text-emerald-500">+{score * 5}</div>
            </div>
            <div className={`p-8 rounded-[2rem] border text-center transition-all ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl shadow-slate-100"}`}>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Score</p>
               <div className={`text-5xl font-black tabular-nums ${darkMode ? "text-white" : "text-slate-900"}`}>{score}/{qs.length}</div>
            </div>
          </div>

          {/* Detailed Review */}
          <div className={`rounded-[2.5rem] border overflow-hidden mb-12 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-2xl shadow-slate-100"}`}>
            <div className={`px-8 py-6 border-b font-black text-sm uppercase tracking-widest ${darkMode ? "border-white/5 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-900"}`}>
              {t.detailedReview}
            </div>
            <div className="divide-y divide-slate-800/10">
              {ans.map((a, i) => (
                <div key={i} className="p-8 group hover:bg-slate-800/5 transition-colors">
                  <div className="flex gap-6">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 transition-all ${
                      a.correct ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {a.correct ? <LuCheckCircle2 size={22}/> : <LuXCircle size={22}/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h4 className={`text-lg font-bold leading-relaxed ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{a.q}</h4>
                        <DiffBadge difficulty={qs[i]?.difficulty || currentDiff} t={t} />
                      </div>
                      {!a.correct && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-xs font-bold ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                          {t.correctAnswerLabel}: {a.correct_ans}
                        </div>
                      )}
                      {a.timeout && <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold">⏱ {t.timeOutLabel}</div>}
                      {a.explanation && <p className="text-sm text-slate-500 leading-relaxed italic">💡 {a.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => startQuiz(category)} className="flex-1 py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/25 active:scale-95">
               <LuRefreshCw size={20} /> {t.retryQuiz}
            </button>
            <button onClick={() => setScreen("select")} className={`flex-1 py-5 rounded-3xl font-black border transition-all active:scale-95 ${darkMode ? "bg-slate-800 border-white/5 text-white hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200"}`}>
               {t.otherQuiz}
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return null;
};

export default memo(Quiz);