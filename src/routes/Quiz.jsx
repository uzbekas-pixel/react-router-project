import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TIMER              = 20;
const QUESTIONS_PER_QUIZ = 5;
const DIFF_ORDER         = ["Oson", "O'rta", "Qiyin"];

const DIFF_COLOR = {
  "Oson":   "#10b981",
  "O'rta":  "#f59e0b",
  "Qiyin":  "#ef4444",
  "Barcha": "#3b82f6",
};

const CATEGORY_ICON = {
  HTML:       "🌐",
  CSS:        "🎨",
  JavaScript: "⚡",
  React:      "⚛️",
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getDifficultyFromScore = (quizAvg) => {
  if (quizAvg === null || quizAvg === undefined) return null;
  if (quizAvg < 50) return "Oson";
  if (quizAvg < 80) return "O'rta";
  return "Qiyin";
};

/**
 * FIX #1 — SAFE POOL
 * Maqsadli darajadan savollar yetarli bo'lmasa,
 * qo'shni darajalardan to'ldirib, har doim `needed` ta qaytaradi.
 */
const buildSafePool = (allQuestions, targetDiff, needed) => {
  const targetPool = targetDiff
    ? allQuestions.filter((q) => q.difficulty === targetDiff)
    : allQuestions;

  if (targetPool.length >= needed) {
    return shuffleArray(targetPool).slice(0, needed);
  }

  const chosen     = [...shuffleArray(targetPool)];
  const remaining  = needed - chosen.length;
  const otherDiffs = targetDiff ? DIFF_ORDER.filter((d) => d !== targetDiff) : [];
  const supplement = shuffleArray(
    allQuestions.filter((q) => otherDiffs.includes(q.difficulty))
  );

  chosen.push(...supplement.slice(0, remaining));
  return shuffleArray(chosen);
};

const shuffleOptions = (q) => {
  const indexed  = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
  const shuffled = shuffleArray(indexed);
  return {
    ...q,
    options: shuffled.map((x) => x.opt),
    answer:  shuffled.findIndex((x) => x.isCorrect),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ DATA — har darajada 6+ savol (jami 18+ har kategoriyada)
// ─────────────────────────────────────────────────────────────────────────────
const quizData = [
  {
    id: 1, category: "HTML",
    questions: [
      // OSON (6)
      { id:  1, difficulty: "Oson",  q: "HTML qisqartmasi nima?",                            options: ["HyperText Markup Language","High Text Machine Language","HyperText Machine Language","Home Tool Markup Language"],   answer: 0 },
      { id:  2, difficulty: "Oson",  q: "Sarlavha uchun eng katta teg?",                      options: ["<h6>","<h3>","<h1>","<heading>"],                                                                                    answer: 2 },
      { id:  3, difficulty: "Oson",  q: "Rasm qo'shish uchun qaysi teg?",                     options: ["<image>","<img>","<src>","<picture>"],                                                                               answer: 1 },
      { id:  4, difficulty: "Oson",  q: "Havola uchun qaysi atribut?",                        options: ["src","link","href","url"],                                                                                           answer: 2 },
      { id:  5, difficulty: "Oson",  q: "Bo'sh (void) element qaysi?",                        options: ["<div>","<p>","<br>","<span>"],                                                                                      answer: 2 },
      { id:  6, difficulty: "Oson",  q: "HTML sahifasining asosiy tarkib tegi?",              options: ["<head>","<main>","<body>","<html>"],                                                                                 answer: 2 },
      { id:  7, difficulty: "Oson",  q: "Tartibsiz ro'yxat tegi?",                            options: ["<ol>","<li>","<ul>","<dl>"],                                                                                        answer: 2 },
      // O'RTA (6)
      { id:  8, difficulty: "O'rta", q: "HTML5 da semantik bo'lmagan element?",               options: ["<article>","<section>","<div>","<nav>"],                                                                             answer: 2 },
      { id:  9, difficulty: "O'rta", q: "<meta charset='UTF-8'> nima qiladi?",                options: ["Sarlavha belgilaydi","Belgilar kodlashini belgilaydi","CSS ulashtiradi","Favicon qo'shadi"],                          answer: 1 },
      { id: 10, difficulty: "O'rta", q: "data-* atributlari nima uchun?",                     options: ["CSS styling","Maxsus ma'lumot saqlash","Server so'rovi","Forma validatsiyasi"],                                       answer: 1 },
      { id: 11, difficulty: "O'rta", q: "defer va async qaysi tegga tegishli?",               options: ["<link>","<style>","<script>","<meta>"],                                                                              answer: 2 },
      { id: 12, difficulty: "O'rta", q: "<figure> tegi nima maqsadda?",                       options: ["Jadval","Rasmga izoh berish","Video","Form"],                                                                        answer: 1 },
      { id: 13, difficulty: "O'rta", q: "target='_blank' nima qiladi?",                       options: ["Yangi tabda ochadi","Havola o'chiradi","Sahifa yangilanadi","CSS qo'llanadi"],                                        answer: 0 },
      // QIYIN (6)
      { id: 14, difficulty: "Qiyin", q: "Shadow DOM asosan nima uchun?",                      options: ["SEO","Kapsüllash va izolyatsiya","Tezlik","Animatsiya"],                                                              answer: 1 },
      { id: 15, difficulty: "Qiyin", q: "<template> tegi qanday render bo'ladi?",             options: ["Ko'rinadi","Ko'rinmaydi, JS bilan aktivlanadi","CSS bilan ko'rinadi","Faqat printda"],                                answer: 1 },
      { id: 16, difficulty: "Qiyin", q: "ARIA role='alert' qachon?",                          options: ["Navigatsiya","Muhim o'zgarishlarni ekran o'quvchiga bildirish","Forma","Jadval"],                                    answer: 1 },
      { id: 17, difficulty: "Qiyin", q: "Content Security Policy nima qiladi?",               options: ["Tezlashtiradi","XSS hujumlarini oldini oladi","SEO","Cache"],                                                        answer: 1 },
      { id: 18, difficulty: "Qiyin", q: "preload va prefetch farqi?",                         options: ["Farqi yo'q","preload hozirgi, prefetch keyingi sahifa uchun","prefetch tezroq","preload faqat CSS"],                   answer: 1 },
    ],
  },
  {
    id: 2, category: "CSS",
    questions: [
      // OSON (6)
      { id:  1, difficulty: "Oson",  q: "CSS qisqartmasi nima?",                              options: ["Cascading Style Sheets","Computer Style Sheets","Creative Style System","Coded Style Sheets"],                       answer: 0 },
      { id:  2, difficulty: "Oson",  q: "Matn rangini o'zgartirish uchun?",                   options: ["font-color","text-color","color","foreground-color"],                                                                answer: 2 },
      { id:  3, difficulty: "Oson",  q: "Elementni yashirish uchun?",                         options: ["hide: true","visible: false","display: none","opacity: 0"],                                                          answer: 2 },
      { id:  4, difficulty: "Oson",  q: "border-radius: 50% nima qiladi?",                    options: ["Kvadrat","Doira","Uchburchak","O'zgartirmaydi"],                                                                     answer: 1 },
      { id:  5, difficulty: "Oson",  q: "Shrift o'lchamini belgilash?",                       options: ["font-weight","text-size","font-size","text-scale"],                                                                  answer: 2 },
      { id:  6, difficulty: "Oson",  q: "Fon rangini belgilash?",                             options: ["bg-color","color","background-color","back-color"],                                                                  answer: 2 },
      { id:  7, difficulty: "Oson",  q: "Matn qalinligini oshirish?",                         options: ["font-size: bold","font-style: bold","font-weight: bold","text-bold: true"],                                           answer: 2 },
      // O'RTA (6)
      { id:  8, difficulty: "O'rta", q: "Flexbox uchun qaysi display?",                       options: ["display: block","display: flex","display: inline","display: grid"],                                                   answer: 1 },
      { id:  9, difficulty: "O'rta", q: "Z-index nima qiladi?",                               options: ["Gorizontal joy","Vertikal joy","Qatlam tartibi","O'lcham"],                                                          answer: 2 },
      { id: 10, difficulty: "O'rta", q: "CSS Grid: 3 teng ustun?",                            options: ["grid-template: 3","grid-columns: 3","grid-template-columns: repeat(3,1fr)","columns: 3"],                            answer: 2 },
      { id: 11, difficulty: "O'rta", q: "CSS specificity eng kuchli?",                        options: ["Element selektor","Class selektor","ID selektor","Inline style"],                                                     answer: 3 },
      { id: 12, difficulty: "O'rta", q: "position: sticky qanday?",                           options: ["Har doim o'rinda","Scroll'da 'yopishib' qoladi","Absolute kabi","Fixed kabi"],                                        answer: 1 },
      { id: 13, difficulty: "O'rta", q: "align-items: center Flexbox'da nima qiladi?",        options: ["Gorizontal markazlashtiradi","Vertikal markazlashtiradi","Matnni","Hech nima"],                                       answer: 1 },
      // QIYIN (6)
      { id: 14, difficulty: "Qiyin", q: "CSS Custom Property va preprocessor farqi?",         options: ["Farqi yo'q","CSS var runtime'da o'zgaradi, preprocessor compile'da","Preprocessor tezroq","CSS var faqat Chrome"],    answer: 1 },
      { id: 15, difficulty: "Qiyin", q: "contain: layout nima qiladi?",                       options: ["Yashiradi","Layout hisob-kitoblarini izolyatsiya qiladi","Scrollni bloklaydi","Z-index"],                             answer: 1 },
      { id: 16, difficulty: "Qiyin", q: "@layer nima uchun?",                                 options: ["Animatsiya","Specificity ziddiyatlarini tartibga solish","Media query","Font"],                                       answer: 1 },
      { id: 17, difficulty: "Qiyin", q: "will-change xususiyati nima qiladi?",                options: ["Animatsiya o'chiradi","Brauzerni oldindan optimizatsiya qilishga undaydi","Rang o'zgartiradi","Transition"],           answer: 1 },
      { id: 18, difficulty: "Qiyin", q: "CSS Houdini nima?",                                  options: ["CSS preprocessori","Brauzer render API'larini ochib beruvchi to'plam","Animatsiya kutubxona","Grid tizim"],            answer: 1 },
    ],
  },
  {
    id: 3, category: "JavaScript",
    questions: [
      // OSON (6)
      { id:  1, difficulty: "Oson",  q: "JavaScript qaysi kompaniya tomonidan?",              options: ["Google","Microsoft","Netscape","Apple"],                                                                             answer: 2 },
      { id:  2, difficulty: "Oson",  q: "Konsol chiqarish?",                                  options: ["print()","echo()","console.log()","log()"],                                                                          answer: 2 },
      { id:  3, difficulty: "Oson",  q: "Massiv uzunligi?",                                   options: [".size",".count",".length",".total"],                                                                                 answer: 2 },
      { id:  4, difficulty: "Oson",  q: "ES6+ da o'zgaruvchi e'lon?",                         options: ["var","variable","let / const","def"],                                                                                answer: 2 },
      { id:  5, difficulty: "Oson",  q: "String'ni raqamga aylantirish?",                     options: ["toNumber()","parseInt() / Number()","str()","cast()"],                                                               answer: 1 },
      { id:  6, difficulty: "Oson",  q: "Massivga element qo'shish?",                         options: ["arr.add()","arr.push()","arr.append()","arr.insert()"],                                                              answer: 1 },
      { id:  7, difficulty: "Oson",  q: "'&&' operatori nima?",                               options: ["OR","AND","NOT","XOR"],                                                                                              answer: 1 },
      // O'RTA (6)
      { id:  8, difficulty: "O'rta", q: "typeof null natijasi?",                              options: ["null","undefined","object","string"],                                                                                answer: 2 },
      { id:  9, difficulty: "O'rta", q: "=== va == farqi?",                                   options: ["Farqi yo'q","=== tip ham tekshiradi","== qat'iy tenglik","=== faqat stringlar"],                                      answer: 1 },
      { id: 10, difficulty: "O'rta", q: "Array.map() nima qaytaradi?",                        options: ["undefined","Yangi array","Shu array","Boolean"],                                                                     answer: 1 },
      { id: 11, difficulty: "O'rta", q: "Event bubbling nima?",                               options: ["Faqat targetda","Child'dan parent'ga tarqaladi","Parent'dan child'ga","Bekor qilinadi"],                             answer: 1 },
      { id: 12, difficulty: "O'rta", q: "Closures nima?",                                     options: ["Yopiq funksiya","Funksiyaning tashqi scope'ini eslab qolishi","Class metodi","Async funksiya"],                       answer: 1 },
      { id: 13, difficulty: "O'rta", q: "Array.filter() nima qaytaradi?",                     options: ["Boolean","Birinchi mos element","Mos elementlar yangi array'i","undefined"],                                          answer: 2 },
      // QIYIN (6)
      { id: 14, difficulty: "Qiyin", q: "Promise.all() qachon reject?",                       options: ["Hech qachon","Bitta reject bo'lsa","Hammasi reject","2 ta reject"],                                                   answer: 1 },
      { id: 15, difficulty: "Qiyin", q: "Microtask va macrotask tartibi?",                    options: ["Macrotask birinchi","Microtask birinchi","Bir xil","Random"],                                                         answer: 1 },
      { id: 16, difficulty: "Qiyin", q: "WeakMap Map dan farqi?",                             options: ["Farqi yo'q","Kalitlar faqat obyekt, GC o'chirishi mumkin","Tezroq","Ko'proq saqlaydi"],                               answer: 1 },
      { id: 17, difficulty: "Qiyin", q: "Proxy obyekti nima uchun?",                          options: ["Tarmoq","Obyektga kirish/o'zgartirishni kuzatish","Kesh","Import"],                                                   answer: 1 },
      { id: 18, difficulty: "Qiyin", q: "Generator funksiya nima qaytaradi?",                 options: ["Array","Promise","Iterator obyekti","undefined"],                                                                     answer: 2 },
    ],
  },
  {
    id: 4, category: "React",
    questions: [
      // OSON (6)
      { id:  1, difficulty: "Oson",  q: "React qaysi kompaniya tomonidan?",                   options: ["Google","Meta (Facebook)","Twitter","Microsoft"],                                                                    answer: 1 },
      { id:  2, difficulty: "Oson",  q: "JSX nima?",                                          options: ["Java So'rovi","JavaScript XML sintaksisi","JSON kengaytmasi","Yangi til"],                                           answer: 1 },
      { id:  3, difficulty: "Oson",  q: "useState hook nima qaytaradi?",                      options: ["Faqat state","Faqat setter","[state, setter]","{state, setter}"],                                                   answer: 2 },
      { id:  4, difficulty: "Oson",  q: "Key prop nima uchun?",                               options: ["Styling","Event handling","List elementlarni aniqlash","Ref"],                                                       answer: 2 },
      { id:  5, difficulty: "Oson",  q: "Komponent nomi qanday boshlanadi?",                  options: ["kichik harf","Katta harf","Raqam","_ belgisi"],                                                                      answer: 1 },
      { id:  6, difficulty: "Oson",  q: "Props nima?",                                        options: ["State turi","Tashqaridan uzatiladigan ma'lumot","Hook turi","Event"],                                                answer: 1 },
      { id:  7, difficulty: "Oson",  q: "HTML class o'rniga React da nima?",                  options: ["class","className","htmlClass","cssClass"],                                                                          answer: 1 },
      // O'RTA (6)
      { id:  8, difficulty: "O'rta", q: "useEffect ikkinchi argumenti?",                      options: ["Callback","Dependency array","Return value","Initial state"],                                                        answer: 1 },
      { id:  9, difficulty: "O'rta", q: "State o'zgartirish uchun?",                          options: ["this.state =","setState()","useState setter","B va C"],                                                              answer: 3 },
      { id: 10, difficulty: "O'rta", q: "useCallback va useMemo farqi?",                      options: ["Farqi yo'q","useCallback funksiya, useMemo qiymat memolashtiradi","useMemo tezroq","useCallback faqat classda"],      answer: 1 },
      { id: 11, difficulty: "O'rta", q: "React.memo nima qiladi?",                            options: ["State saqlaydi","Props o'zgarmasa qayta render qilmaydi","Hook","Context"],                                          answer: 1 },
      { id: 12, difficulty: "O'rta", q: "Context API nima hal qiladi?",                       options: ["Performans","Prop drilling","Routing","Stil"],                                                                       answer: 1 },
      { id: 13, difficulty: "O'rta", q: "useRef nima uchun?",                                 options: ["State","DOM elementga murojaat va render qilmaydigan qiymatlar","Asinxron","Routing"],                               answer: 1 },
      // QIYIN (6)
      { id: 14, difficulty: "Qiyin", q: "Transitions nima beradi?",                           options: ["Animatsiya","Muhim bo'lmagan yangilanishlarni kechiktirish","Routing","Server render"],                              answer: 1 },
      { id: 15, difficulty: "Qiyin", q: "useLayoutEffect va useEffect farqi?",                options: ["Farqi yo'q","useLayoutEffect DOM'dan keyin, paint'dan oldin","useLayoutEffect async","useEffect server'da"],           answer: 1 },
      { id: 16, difficulty: "Qiyin", q: "React Fiber nima hal qildi?",                        options: ["Xotirani kamaytirdi","Render'ni bo'laklarga bo'lib, to'xtatish/davom imkoni","CSS","SSR"],                            answer: 1 },
      { id: 17, difficulty: "Qiyin", q: "Reconciliation nima qiladi?",                        options: ["CSS hisoblaydi","Virtual DOM ni real DOM bilan taqqoslab minimal o'zgarish","State reset","Event tozalaydi"],         answer: 1 },
      { id: 18, difficulty: "Qiyin", q: "React Server Components nima beradi?",               options: ["Bundle kattalashtiradi","Server'da render bo'lib, JS bundle'ga qo'shilmaydi","SSR bilan bir xil","Faqat API"],        answer: 1 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DARS TAVSIYALARI — kategoriya + daraja bo'yicha aniq
// ─────────────────────────────────────────────────────────────────────────────
const LESSON_RECOMMENDATIONS = {
  HTML: {
    "Oson":   { icon: "🌐", title: "HTML Asoslarini mustahkamlash",       lessons: ["HTML teg va atributlar", "Ro'yxat va jadvallar", "Forma elementlari"] },
    "O'rta":  { icon: "🌐", title: "HTML5 Semantika va Meta",             lessons: ["Semantik teglar (article, nav, section)", "Meta teglar va SEO", "defer / async"] },
    "Qiyin":  { icon: "🌐", title: "HTML Ilg'or mavzular",                lessons: ["Shadow DOM va Web Components", "ARIA va Accessibility", "Resource hints (preload/prefetch)"] },
  },
  CSS: {
    "Oson":   { icon: "🎨", title: "CSS Asoslarini mustahkamlash",        lessons: ["Ranglar va shriftlar", "Box model", "Display turlari"] },
    "O'rta":  { icon: "🎨", title: "CSS Layout va Pozitsiya",             lessons: ["Flexbox chuqur", "CSS Grid", "position va z-index"] },
    "Qiyin":  { icon: "🎨", title: "CSS Ilg'or texnikalar",               lessons: ["CSS Custom Properties (runtime)", "@layer va Cascade", "contain va will-change"] },
  },
  JavaScript: {
    "Oson":   { icon: "⚡", title: "JS Asoslarini mustahkamlash",         lessons: ["Ma'lumot turlari", "Massiv metodlari", "Shart va tsikllar"] },
    "O'rta":  { icon: "⚡", title: "JavaScript Mexanizmlari",             lessons: ["typeof va type coercion", "Closures va Scope", "Array.map/filter/reduce"] },
    "Qiyin":  { icon: "⚡", title: "JavaScript Ilg'or mavzular",          lessons: ["Promise va async/await", "Event Loop (micro/macrotask)", "Proxy va Generator"] },
  },
  React: {
    "Oson":   { icon: "⚛️", title: "React Asoslarini mustahkamlash",     lessons: ["Komponentlar va Props", "JSX sintaksisi", "useState"] },
    "O'rta":  { icon: "⚛️", title: "React Hooks va Optimallashtirish",   lessons: ["useEffect va dependency array", "useCallback va useMemo", "React.memo va Context"] },
    "Qiyin":  { icon: "⚛️", title: "React Ilg'or arxitektura",           lessons: ["React Fiber va Reconciliation", "Concurrent Mode va Transitions", "Server Components"] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOOK — Firebase user stats
// ─────────────────────────────────────────────────────────────────────────────
const useUserStats = (user) => {
  const [quizAvg, setQuizAvg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (!cancelled) setQuizAvg(snap.exists() ? (snap.data().quizAvg ?? null) : null);
      } catch { if (!cancelled) setQuizAvg(null); }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return { quizAvg, loading };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const DifficultyBadge = memo(({ difficulty }) => {
  const color = DIFF_COLOR[difficulty] || "#3b82f6";
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
      background: color + "22", color, border: `1px solid ${color}44`,
    }}>
      {difficulty}
    </span>
  );
});

const ProgressBar = memo(({ value, color, transition }) => (
  <div style={{
    height: "100%", borderRadius: "inherit",
    background: color,
    width: `${Math.max(0, Math.min(100, value))}%`,
    transition,
  }} />
));

/**
 * FIX #4 — Smart Recommendation Block
 * Xatolar { category, difficulty } juftlari bo'yicha aniq tavsiya qiladi.
 */
const RecommendationBlock = memo(({ wrongByDiff, darkMode }) => {
  if (!wrongByDiff || wrongByDiff.length === 0) return null;

  const countMap = {};
  wrongByDiff.forEach(({ category, difficulty }) => {
    const key = `${category}__${difficulty}`;
    countMap[key] = (countMap[key] || 0) + 1;
  });

  const sorted = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => {
      const [category, difficulty] = key.split("__");
      return { category, difficulty };
    });

  return (
    <div style={{
      background: darkMode ? "#0f172a" : "#eff6ff",
      border: `1px solid ${darkMode ? "#1e3a5f" : "#bfdbfe"}`,
      borderRadius: 14, padding: "18px 20px", marginBottom: 20, textAlign: "left",
    }}>
      <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14, color: darkMode ? "#93c5fd" : "#1d4ed8" }}>
        📖 Siz uchun tavsiya etilgan darslar
      </p>
      {sorted.map(({ category, difficulty }) => {
        const rec = LESSON_RECOMMENDATIONS[category]?.[difficulty];
        if (!rec) return null;
        return (
          <div key={`${category}-${difficulty}`} style={{
            marginBottom: 14, paddingLeft: 10,
            borderLeft: `3px solid ${DIFF_COLOR[difficulty] || "#3b82f6"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{rec.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: darkMode ? "#e2e8f0" : "#1e293b" }}>{rec.title}</span>
              <DifficultyBadge difficulty={difficulty} />
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {rec.lessons.map((l) => (
                <li key={l} style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#6b7280", marginBottom: 3 }}>{l}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Quiz = ({ darkMode, showToast }) => {
  const { user }             = useAuth();
  const { quizAvg, loading } = useUserStats(user);

  const [screen,       setScreen]       = useState("select");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQ,     setCurrentQ]     = useState(0);
  const [selected,     setSelected]     = useState(null);
  const [answers,      setAnswers]      = useState([]);
  const [timeLeft,     setTimeLeft]     = useState(TIMER);
  const [streak,       setStreak]       = useState(0);
  const [resultData,   setResultData]   = useState(null);

  const timerRef  = useRef(null);
  // FIX #2 — cascading renders uchun pending side-effects ref'da saqlanadi
  const pendingRef = useRef(null);
  // BUG #1 FIX — double-submission guard
  const savingRef  = useRef(false);

  const currentDiffLabel = useMemo(() => getDifficultyFromScore(quizAvg) ?? "Barcha", [quizAvg]);

  // ── buildQuestions — safe pool bilan ──────────────────────────────────────
  const buildQuestions = useCallback((quiz) => {
    const targetDiff = getDifficultyFromScore(quizAvg);
    const pool       = buildSafePool(quiz.questions, targetDiff, QUESTIONS_PER_QUIZ);
    return pool.map(shuffleOptions);
  }, [quizAvg]);

  // ── startQuiz ─────────────────────────────────────────────────────────────
  const startQuiz = useCallback((quiz) => {
    clearInterval(timerRef.current);
    pendingRef.current = null;
    savingRef.current = false;
    const questions = buildQuestions(quiz);
    const quizState = { quiz: { ...quiz, questions }, currentQ: 0, answers: [], streak: 0 };
    try { sessionStorage.setItem("activeQuiz", JSON.stringify(quizState)); } catch (e) { void e; /* sessionStorage unavailable */ }
    setSelectedQuiz({ ...quiz, questions });
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setStreak(0);
    setTimeLeft(TIMER);
    setResultData(null);
    setScreen("playing");
  }, [buildQuestions]);

  // ── handleAnswer ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx) => {
    setSelected((prev) => {
      if (prev !== null) return prev;
      clearInterval(timerRef.current);
      pendingRef.current = null;
      return idx;
    });
  }, []);

  // ── saveQuizResult ── BUG #1 FIX: savingRef mutex prevents double-submit ──
  const saveQuizResult = useCallback(async (pct, score, totalQ, category) => {
    if (!user || savingRef.current) return;
    savingRef.current = true;
    try {
      const statsRef  = doc(db, "users", user.uid, "data", "stats");
      const statsSnap = await getDoc(statsRef);
      const old       = statsSnap.exists() ? statsSnap.data() : {};
      const oldCount  = old.quizCount || 0;
      const newCount  = oldCount + 1;
      const newAvg    = Math.round(((old.quizAvg || 0) * oldCount + pct) / newCount);
      const xpGained  = score * 5;

      const xpAfter = (old.xp || 0) + xpGained;

      await setDoc(statsRef, {
        xp:        xpAfter,
        quizAvg:   newAvg,
        quizCount: newCount,
        streak:    old.streak || 0,
      }, { merge: true });

      // DENORM — mirror xp + quizAvg onto users/{uid} for zero-read Leaderboard
      await setDoc(doc(db, "users", user.uid), {
        xp:      xpAfter,
        quizAvg: newAvg,
      }, { merge: true });

      await setDoc(
        doc(db, "users", user.uid, "notifications", `quiz_${Date.now()}`),
        {
          title:     `Quiz tugadi! ${pct >= 60 ? "🎉" : "📚"}`,
          message:   `${category}: ${score}/${totalQ} to'g'ri. +${xpGained} XP!`,
          type:      pct >= 60 ? "success" : "info",
          read:      false,
          createdAt: new Date(),
        }
      );
      showToast?.(`+${xpGained} XP qo'shildi! ✅`, "success");
    } catch (err) {
      console.error("Quiz save error:", err);
    } finally {
      savingRef.current = false;
    }
  }, [user, showToast]);

  // ── finalizeQuiz ──────────────────────────────────────────────────────────
  const finalizeQuiz = useCallback((finalAnswers, questions, category) => {
    const score      = finalAnswers.filter((a) => a.correct).length;
    const pct        = Math.round((score / questions.length) * 100);
    const wrongByDiff = finalAnswers
      .map((a, i) => (!a.correct ? { category, difficulty: questions[i]?.difficulty } : null))
      .filter(Boolean);

    // BUG #7 FIX — quiz done, clear sessionStorage
    try { sessionStorage.removeItem("activeQuiz"); } catch (e) { void e; /* non-critical */ }

    setResultData({ score, pct, wrongByDiff, questions, answers: finalAnswers });
    setScreen("result");
    showToast?.(`Test tugadi! ${score}/${questions.length} to'g'ri ✅`, pct >= 60 ? "success" : "error");
    saveQuizResult(pct, score, questions.length, category);
  }, [showToast, saveQuizResult]);

  // ── handleNext — FIX #2 cascading renders yo'qotildi ─────────────────────
  /**
   * setAnswers callback ichida boshqa setState chaqirilmaydi.
   * Barcha side-effect'lar pendingRef'ga yoziladi va keyingi
   * useEffect(,[answers]) da bitta render tsiklida bajariladi.
   */
  const handleNext = useCallback((timeout = false) => {
    clearInterval(timerRef.current);
    setAnswers((prevAnswers) => {
      const q          = selectedQuiz.questions[currentQ];
      const isCorrect  = !timeout && selected === q.answer;
      const newAnswers = [...prevAnswers, { correct: isCorrect, selected, timeout }];
      // side-effect keyingi tick'ga ko'chirildi
      pendingRef.current = {
        newAnswers,
        questions: selectedQuiz.questions,
        category:  selectedQuiz.category,
        isCorrect,
        nextIndex: currentQ + 1,
      };
      return newAnswers;
    });
  }, [selectedQuiz, currentQ, selected]);

  // Pending side-effects — answers o'zgarganda bir marta ishlaydi
  useEffect(() => {
    if (!pendingRef.current) return;
    const { newAnswers, questions, category, isCorrect, nextIndex } = pendingRef.current;
    pendingRef.current = null;

    setStreak((s) => isCorrect ? s + 1 : 0);

    if (nextIndex >= questions.length) {
      finalizeQuiz(newAnswers, questions, category);
    } else {
      setCurrentQ(nextIndex);
      setSelected(null);
      setTimeLeft(TIMER);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "playing" || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleNext(true); return TIMER; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, selected, currentQ, handleNext]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // BUG #7 FIX — restore quiz from sessionStorage on mount (browser refresh recovery)
  useEffect(() => {
    if (screen !== "select") return;
    try {
      const saved = sessionStorage.getItem("activeQuiz");
      if (!saved) return;
      const state = JSON.parse(saved);
      if (!state?.quiz?.questions?.length) { sessionStorage.removeItem("activeQuiz"); return; }
      clearInterval(timerRef.current);
      pendingRef.current = null;
      setSelectedQuiz(state.quiz);
      setCurrentQ(state.currentQ || 0);
      setAnswers(state.answers || []);
      setStreak(state.streak || 0);
      setSelected(null);
      setTimeLeft(TIMER);
      setResultData(null);
      setScreen("playing");
    } catch (e) { void e; sessionStorage.removeItem("activeQuiz"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SELECT SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === "select") {
    return (
      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>
        <ScrollReveal direction="up">
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 12, border: "1px solid #bfdbfe" }}>
            🎯 Bilimingizni sinang
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>Quiz / Test</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 4 }}>
            Har bir test {QUESTIONS_PER_QUIZ} ta savol · {TIMER} soniya limit
          </p>
          {!loading && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, borderRadius: 10, padding: "6px 14px", marginBottom: 28 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Sizning darajangiz:</span>
              <DifficultyBadge difficulty={currentDiffLabel} />
              {quizAvg !== null && <span style={{ fontSize: 12, color: "#6b7280" }}>({quizAvg}% o'rtacha)</span>}
            </div>
          )}
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {quizData.map((quiz, i) => (
            <ScrollReveal key={quiz.id} direction="up" delay={i * 80}>
              <div
                onClick={() => startQuiz(quiz)}
                style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 16, padding: "24px 20px", cursor: "pointer", textAlign: "center", transition: "all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{CATEGORY_ICON[quiz.category]}</div>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 16, color: darkMode ? "#f1f5f9" : "#111" }}>{quiz.category}</p>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b7280" }}>{quiz.questions.length} ta savol bazasi</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                  Sizga: <strong style={{ color: DIFF_COLOR[currentDiffLabel] }}>{currentDiffLabel}</strong>
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === "playing") {
    const q          = selectedQuiz.questions[currentQ];
    const progress   = (currentQ / selectedQuiz.questions.length) * 100;
    const timerPct   = (timeLeft / TIMER) * 100;
    const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "#10b981";

    return (
      <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => { clearInterval(timerRef.current); setScreen("select"); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14, fontWeight: 600, padding: 0 }}>
            ← Chiqish
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {streak >= 2 && <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>🔥 {streak} ketma-ket!</span>}
            <DifficultyBadge difficulty={q.difficulty} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>{currentQ + 1} / {selectedQuiz.questions.length}</span>
          </div>
        </div>

        <div style={{ height: 6, borderRadius: 3, background: darkMode ? "#334155" : "#e5e7eb", marginBottom: 16 }}>
          <ProgressBar value={progress} color="#3b82f6" transition="width 0.3s" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: darkMode ? "#334155" : "#e5e7eb" }}>
            <ProgressBar value={timerPct} color={timerColor} transition="width 1s linear" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 28, textAlign: "right", color: timerColor }}>{timeLeft}s</span>
        </div>

        <div style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
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
            const dotBg    = selected !== null && i === q.answer ? "#10b981" : selected !== null && i === selected ? "#ef4444" : darkMode ? "#334155" : "#f3f4f6";
            const dotColor = selected !== null && (i === q.answer || i === selected) ? "#fff" : darkMode ? "#94a3b8" : "#6b7280";
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                style={{ padding: "14px 18px", borderRadius: 12, background: bg, border: `2px solid ${border}`, color, fontSize: 14, fontWeight: 500, cursor: selected !== null ? "default" : "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: dotBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color: dotColor }}>
                  {selected !== null && i === q.answer ? "✓" : selected !== null && i === selected ? "✗" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button onClick={() => handleNext()}
            style={{ marginTop: 20, width: "100%", padding: "14px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {currentQ + 1 < selectedQuiz.questions.length ? "Keyingisi →" : "Natijani ko'rish 🏆"}
          </button>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RESULT SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === "result" && resultData) {
    const { score, pct, wrongByDiff, questions, answers: ans } = resultData;
    const emoji = pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : pct >= 40 ? "📚" : "💪";
    const msg   = pct === 100 ? "Mukammal! Barcha savollar to'g'ri!" : pct >= 80 ? "Ajoyib natija!" : pct >= 60 ? "Yaxshi, lekin yaxshiroq bo'ladi!" : "Ko'proq o'qish kerak!";

    return (
      <div style={{ width: "100%", maxWidth: 580, margin: "0 auto", padding: "40px 20px 80px", textAlign: "center" }}>
        <ScrollReveal direction="up">
          <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: darkMode ? "#f1f5f9" : "#111" }}>{msg}</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>{selectedQuiz.category} testi</p>

          <div style={{ width: 130, height: 130, borderRadius: "50%", border: `8px solid ${pct >= 60 ? "#3b82f6" : "#ef4444"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: pct >= 60 ? "#3b82f6" : "#ef4444" }}>{pct}%</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{score}/{questions.length}</span>
          </div>

          <RecommendationBlock wrongByDiff={wrongByDiff} darkMode={darkMode} />

          <div style={{ background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
            {questions.map((q, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: i < questions.length - 1 ? 10 : 0, borderBottom: i < questions.length - 1 ? `1px solid ${darkMode ? "#334155" : "#f3f4f6"}` : "none", marginBottom: i < questions.length - 1 ? 10 : 0 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: ans[i]?.correct ? "#d1fae5" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: ans[i]?.correct ? "#065f46" : "#991b1b", fontWeight: 700 }}>
                  {ans[i]?.correct ? "✓" : "✗"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <p style={{ margin: 0, fontSize: 13, color: darkMode ? "#e2e8f0" : "#374151" }}>{q.q}</p>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  {!ans[i]?.correct && <p style={{ margin: 0, fontSize: 11, color: "#10b981" }}>To'g'ri: {q.options[q.answer]}</p>}
                  {ans[i]?.timeout  && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#f59e0b" }}>⏱ Vaqt tugadi</p>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => startQuiz(selectedQuiz)}
              style={{ padding: "11px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              🔄 Qayta urinish
            </button>
            <button onClick={() => setScreen("select")}
              style={{ padding: "11px 24px", background: "transparent", color: darkMode ? "#94a3b8" : "#374151", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Boshqa test
            </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return null;
};

export default memo(Quiz);