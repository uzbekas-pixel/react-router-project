import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  push,
  remove,
  onDisconnect,
  serverTimestamp as rtServerTimestamp,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import {
  LuSwords,
  LuTrophy,
  LuBrain,
  LuFlame,
  LuStar,
  LuLoader,
  LuRefreshCw,
  LuZap,
  LuTarget,
  LuUsers,
  LuClock,
  LuShield,
  LuWifiOff,
  LuHandshake,
  LuActivity,
  LuCheck,
  LuX,
  LuPlus,
  LuMinus,
  LuEye,
  LuSmile,
  LuInfo,
  LuCode,
  LuPlay,
  LuTerminal,
  LuLightbulb,
} from "react-icons/lu";

const BATTLE_DURATION = 60;
const DEFAULT_WAGER_XP = 50;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const FALLBACK_POOL = [
  {
    id: 1,
    category: "HTML",
    difficulty: "Oson",
    q: "HTML qisqartmasi nima?",
    options: [
      "HyperText Markup Language",
      "High Text Machine",
      "HyperText Machine Language",
      "Home Tool Markup",
    ],
    answer: 0,
    explanation: "HTML = HyperText Markup Language.",
  },
  {
    id: 2,
    category: "HTML",
    difficulty: "Oson",
    q: "Rasm uchun qaysi teg?",
    options: ["<image>", "<img>", "<src>", "<pic>"],
    answer: 1,
    explanation: "<img> HTML da rasm uchun.",
  },
  {
    id: 3,
    category: "HTML",
    difficulty: "Oson",
    q: "Eng katta sarlavha tegi?",
    options: ["<h6>", "<h3>", "<h1>", "<heading>"],
    answer: 2,
    explanation: "<h1> eng katta sarlavha.",
  },
  {
    id: 4,
    category: "HTML",
    difficulty: "O'rta",
    q: "HTML5 semantik bo'lmagan element?",
    options: ["<article>", "<section>", "<div>", "<nav>"],
    answer: 2,
    explanation: "<div> semantik ma'nosiz.",
  },
  {
    id: 5,
    category: "HTML",
    difficulty: "O'rta",
    q: "defer atributi qaysi tegga?",
    options: ["<link>", "<style>", "<script>", "<meta>"],
    answer: 2,
    explanation: "defer <script> tegiga tegishli.",
  },
  {
    id: 6,
    category: "HTML",
    difficulty: "Qiyin",
    q: "Shadow DOM nima uchun?",
    options: ["SEO", "Izolyatsiya", "Tezlik", "Animatsiya"],
    answer: 1,
    explanation: "Shadow DOM komponentlarni izolyatsiya qiladi.",
  },
  {
    id: 7,
    category: "CSS",
    difficulty: "Oson",
    q: "Matn rangi uchun CSS?",
    options: ["font-color", "text-color", "color", "foreground"],
    answer: 2,
    explanation: "color matn rangini belgilaydi.",
  },
  {
    id: 8,
    category: "CSS",
    difficulty: "Oson",
    q: "Elementni yashirish?",
    options: ["hide:true", "visible:false", "display:none", "opacity:0"],
    answer: 2,
    explanation: "display:none butunlay yashiradi.",
  },
  {
    id: 9,
    category: "CSS",
    difficulty: "Oson",
    q: "border-radius:50% nima qiladi?",
    options: ["Kvadrat", "Doira", "Uchburchak", "O'zgartirmaydi"],
    answer: 1,
    explanation: "50% doira shakl hosil qiladi.",
  },
  {
    id: 10,
    category: "CSS",
    difficulty: "O'rta",
    q: "Flexbox uchun display?",
    options: ["block", "flex", "inline", "grid"],
    answer: 1,
    explanation: "display:flex flexbox ni yoqadi.",
  },
  {
    id: 11,
    category: "CSS",
    difficulty: "O'rta",
    q: "CSS specificity eng kuchli?",
    options: ["Element", "Class", "ID", "Inline style"],
    answer: 3,
    explanation: "Inline style eng kuchli — 1000 ball.",
  },
  {
    id: 12,
    category: "CSS",
    difficulty: "Qiyin",
    q: "will-change nima qiladi?",
    options: ["O'chiradi", "GPU optimizatsiya", "Rang", "Transition"],
    answer: 1,
    explanation: "will-change GPU ni oldindan tayyorlaydi.",
  },
  {
    id: 13,
    category: "JavaScript",
    difficulty: "Oson",
    q: "Konsolga chiqarish?",
    options: ["print()", "echo()", "console.log()", "log()"],
    answer: 2,
    explanation: "console.log() JS standart.",
  },
  {
    id: 14,
    category: "JavaScript",
    difficulty: "Oson",
    q: "Massivga element qo'shish?",
    options: ["arr.add()", "arr.push()", "arr.append()", "arr.insert()"],
    answer: 1,
    explanation: "push() massiv oxiriga qo'shadi.",
  },
  {
    id: 15,
    category: "JavaScript",
    difficulty: "Oson",
    q: "Massiv uzunligi?",
    options: [".size", ".count", ".length", ".total"],
    answer: 2,
    explanation: ".length uzunlikni qaytaradi.",
  },
  {
    id: 16,
    category: "JavaScript",
    difficulty: "O'rta",
    q: "typeof null natijasi?",
    options: ["null", "undefined", "object", "string"],
    answer: 2,
    explanation: "typeof null === 'object' — JS bug.",
  },
  {
    id: 17,
    category: "JavaScript",
    difficulty: "O'rta",
    q: "=== va == farqi?",
    options: [
      "Farqi yo'q",
      "=== tip ham tekshiradi",
      "== qat'iy",
      "=== faqat string",
    ],
    answer: 1,
    explanation: "=== qiymat va tipni tekshiradi.",
  },
  {
    id: 18,
    category: "JavaScript",
    difficulty: "O'rta",
    q: "Array.map() nima qaytaradi?",
    options: ["undefined", "Yangi array", "Shu array", "Boolean"],
    answer: 1,
    explanation: "map() yangi array qaytaradi.",
  },
  {
    id: 19,
    category: "JavaScript",
    difficulty: "Qiyin",
    q: "Promise.all() qachon reject?",
    options: ["Hech qachon", "1 ta reject", "Hammasi", "2 ta"],
    answer: 1,
    explanation: "Bitta reject bo'lsa darhol reject.",
  },
  {
    id: 20,
    category: "JavaScript",
    difficulty: "Qiyin",
    q: "Closure nima?",
    options: ["Yopiq funksiya", "Tashqi scope eslab qolish", "Class", "Async"],
    answer: 1,
    explanation: "Closure tashqi scope ga kirish imkoni.",
  },
  {
    id: 21,
    category: "React",
    difficulty: "Oson",
    q: "useState nima qaytaradi?",
    options: [
      "Faqat state",
      "Faqat setter",
      "[state,setter]",
      "{state,setter}",
    ],
    answer: 2,
    explanation: "useState [state, setter] qaytaradi.",
  },
  {
    id: 22,
    category: "React",
    difficulty: "Oson",
    q: "JSX nima?",
    options: ["Java", "JavaScript XML", "JSON", "Yangi til"],
    answer: 1,
    explanation: "JSX JS ichida HTML yozish.",
  },
  {
    id: 23,
    category: "React",
    difficulty: "Oson",
    q: "Key prop nima uchun?",
    options: ["Stil", "Event", "List aniqlash", "Ref"],
    answer: 2,
    explanation: "Key list elementlarni farqlash uchun.",
  },
  {
    id: 24,
    category: "React",
    difficulty: "O'rta",
    q: "useEffect 2-argumenti?",
    options: ["Callback", "Dependency array", "Return", "Initial state"],
    answer: 1,
    explanation: "Dependency array o'zgarganda effect ishlaydi.",
  },
  {
    id: 25,
    category: "React",
    difficulty: "O'rta",
    q: "React.memo nima qiladi?",
    options: ["State", "Props o'zgarmasa render yo'q", "Hook", "Context"],
    answer: 1,
    explanation: "React.memo keraksiz re-render oldini oladi.",
  },
  {
    id: 26,
    category: "React",
    difficulty: "Qiyin",
    q: "React Fiber nima?",
    options: ["CSS", "Render bo'laklash", "Storage", "SSR"],
    answer: 1,
    explanation: "Fiber render ni bo'laklarga ajratadi.",
  },
  {
    id: 27,
    category: "HTML",
    difficulty: "O'rta",
    q: "target='_blank' nima qiladi?",
    options: ["Yangi tabda", "Havola o'chiradi", "Yangilanadi", "CSS"],
    answer: 0,
    explanation: "_blank yangi tabda ochadi.",
  },
  {
    id: 28,
    category: "CSS",
    difficulty: "O'rta",
    q: "position:sticky qanday?",
    options: ["Har doim", "Scroll da yopishib", "Absolute", "Fixed"],
    answer: 1,
    explanation: "sticky scroll da yopishib qoladi.",
  },
  {
    id: 29,
    category: "JavaScript",
    difficulty: "O'rta",
    q: "Array.filter() nima qaytaradi?",
    options: ["Boolean", "Birinchi mos", "Mos elementlar array", "undefined"],
    answer: 2,
    explanation: "filter() mos elementlar yangi array qaytaradi.",
  },
  {
    id: 30,
    category: "React",
    difficulty: "O'rta",
    q: "useCallback va useMemo farqi?",
    options: [
      "Farqi yo'q",
      "useCallback funksiya, useMemo qiymat",
      "useMemo tezroq",
      "Faqat class",
    ],
    answer: 1,
    explanation: "useCallback funksiya, useMemo qiymat memolashtiradi.",
  },
];

const getShuffledFallback = () =>
  [...FALLBACK_POOL].sort(() => Math.random() - 0.5).slice(0, 10);

// ==================== CODE PUZZLE GAME ====================
const CODE_PUZZLE_POOL = [
  {
    id: 1,
    category: "JavaScript",
    difficulty: "Oson",
    code: `const result = [1, 2, 3]._____(x => x * 2);\nconsole.log(result); // [2, 4, 6]`,
    answer: "map",
    hint: "Har bir elementni o'zgartiradi",
    explanation: "map() har bir elementga funksiya qo'llab yangi array qaytaradi.",
  },
  {
    id: 2,
    category: "JavaScript",
    difficulty: "Oson",
    code: `const arr = [10, 20, 30];\nconst first = arr._____[0];`,
    answer: "at",
    hint: "Element olish (ES2022)",
    explanation: "at(0) birinchi elementni qaytaradi.",
  },
  {
    id: 3,
    category: "JavaScript",
    difficulty: "O'rta",
    code: `const nums = [5, 12, 8, 130, 44];\nconst found = nums._____(num => num > 10);`,
    answer: "find",
    hint: "Birinchi mos element",
    explanation: "find() shartga mos birinchi elementni qaytaradi.",
  },
  {
    id: 4,
    category: "JavaScript",
    difficulty: "O'rta",
    code: `const items = [1, 2, 3, 4];\nconst sum = items._____((acc, cur) => acc + cur, 0);`,
    answer: "reduce",
    hint: "Yig'indini hisoblash",
    explanation: "reduce() array ni bitta qiymatga kamaytiradi.",
  },
  {
    id: 5,
    category: "JavaScript",
    difficulty: "Qiyin",
    code: `const obj = { a: 1, b: 2 };\nconst clone = { _____ };`,
    answer: "...obj",
    hint: "Spread operator",
    explanation: "Spread ... obj ni nusxalaydi.",
  },
  {
    id: 6,
    category: "CSS",
    difficulty: "Oson",
    code: `.box {\n  display: _____;\n  justify-content: center;\n  align-items: center;\n}`,
    answer: "flex",
    hint: "Flexbox container",
    explanation: "display:flex bo'lsa justify-content va align-items ishlaydi.",
  },
  {
    id: 7,
    category: "CSS",
    difficulty: "O'rta",
    code: `.item {\n  position: _____;\n  top: 0;\n}`,
    answer: "sticky",
    hint: "Scroll bilan yopishadi",
    explanation: "position:sticky scroll bo'lganda yopishib qoladi.",
  },
  {
    id: 8,
    category: "HTML",
    difficulty: "Oson",
    code: `<input type="_____" placeholder="Email kiriting">`,
    answer: "email",
    hint: "Email validatsiyasi",
    explanation: "type=email email formatini tekshiradi.",
  },
  {
    id: 9,
    category: "React",
    difficulty: "O'rta",
    code: `const [count, _____] = useState(0);`,
    answer: "setCount",
    hint: "State o'zgartirish funksiyasi",
    explanation: "useState [qiymat, setter] qaytaradi.",
  },
  {
    id: 10,
    category: "React",
    difficulty: "Qiyin",
    code: `use_____(() => {\n  fetchData();\n}, []);`,
    answer: "Effect",
    hint: "Side effect uchun",
    explanation: "useEffect component mount/unmount da ishlaydi.",
  },
];

// ==================== CODE EDITOR GAME ====================
const CODE_EDITOR_CHALLENGES = [
  {
    id: 1,
    category: "JavaScript",
    difficulty: "Oson",
    instruction: "2 ta sonni qo'shish funksiyasi yozing",
    starterCode: `// a va b ni qo'shib qaytaring\nfunction add(a, b) {\n  // Kod yozing\n}`,
    testCases: [
      { input: [2, 3], output: 5 },
      { input: [10, 20], output: 30 },
      { input: [-5, 5], output: 0 },
    ],
    hint: "return a + b;",
  },
  {
    id: 2,
    category: "JavaScript",
    difficulty: "Oson",
    instruction: "Array elementlar yig'indisini hisoblang",
    starterCode: `// nums array elementlari yig'indisi\nfunction sumArray(nums) {\n  // Kod yozing\n}`,
    testCases: [
      { input: [[1, 2, 3]], output: 6 },
      { input: [[10, 20]], output: 30 },
      { input: [[]], output: 0 },
    ],
    hint: "reduce yoki for loop",
  },
  {
    id: 3,
    category: "JavaScript",
    difficulty: "O'rta",
    instruction: "Palindrom tekshiruvi (teskarisi o'zi)",
    starterCode: `// So'z palindrom bo'lsa true qaytaring\nfunction isPalindrome(str) {\n  // Kod yozing\n}`,
    testCases: [
      { input: ["radar"], output: true },
      { input: ["hello"], output: false },
      { input: ["level"], output: true },
    ],
    hint: "split('').reverse().join('')",
  },
  {
    id: 4,
    category: "JavaScript",
    difficulty: "O'rta",
    instruction: "Faktorial hisoblash (n!)",
    starterCode: `// n faktorialini hisoblang\nfunction factorial(n) {\n  // Kod yozing\n}`,
    testCases: [
      { input: [5], output: 120 },
      { input: [3], output: 6 },
      { input: [0], output: 1 },
    ],
    hint: "for yoki rekursiya",
  },
  {
    id: 5,
    category: "JavaScript",
    difficulty: "Qiyin",
    instruction: "Eng katta elementni toping",
    starterCode: `// Array da eng katta sonni toping\nfunction findMax(arr) {\n  // Kod yozing\n}`,
    testCases: [
      { input: [[1, 5, 3, 9, 2]], output: 9 },
      { input: [[-10, -5, -20]], output: -5 },
      { input: [[100]], output: 100 },
    ],
    hint: "Math.max(...arr)",
  },
];

const getCodePuzzles = () =>
  [...CODE_PUZZLE_POOL].sort(() => Math.random() - 0.5).slice(0, 5);

const getEditorChallenges = () =>
  [...CODE_EDITOR_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 3);

const generateBattleQuestions = async (difficulty) => {
  if (!GEMINI_API_KEY) return getShuffledFallback();
  const prompt = `Generate exactly 10 multiple-choice quiz questions about HTML, CSS, JavaScript, React for "${difficulty}" difficulty.
Return ONLY valid JSON array, no markdown:
[{"id":1,"category":"JavaScript","difficulty":"${difficulty}","q":"?","options":["A","B","C","D"],"answer":0,"explanation":"Why."}]
answer is 0-3 index. Mix all 4 categories equally.`;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
      }),
    });
    if (!res.ok) return getShuffledFallback();
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const qs = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (!Array.isArray(qs) || qs.length < 5) return getShuffledFallback();
    return qs;
  } catch {
    return getShuffledFallback();
  }
};

// ==================== CODE EDITOR HELPERS ====================
const runCodeSafely = (code, inputs) => {
  try {
    // Asosiy xavfsizlik tekshiruvi
    const dangerous = ['eval', 'Function', 'document', 'window', 'fetch', 'XMLHttpRequest', 'WebSocket'];
    for (const d of dangerous) {
      if (code.includes(d)) return { error: `Xavfli kod aniqlandi: ${d}`, output: null };
    }
    
    // Function yaratish va chaqirish
    const fn = new Function(...inputs.map((_, i) => `arg${i}`), code + '\nreturn typeof result !== "undefined" ? result : undefined;');
    const result = fn(...inputs);
    return { error: null, output: result };
  } catch (err) {
    return { error: err.message, output: null };
  }
};

const checkEditorAnswer = (code, testCases) => {
  let passed = 0;
  const results = [];
  
  // Extract function name automatically (e.g. from "function add(a, b) {")
  const funcMatch = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  const funcName = funcMatch ? funcMatch[1] : null;

  for (const tc of testCases) {
    let fullCode = code;
    if (funcName) {
      fullCode += `\nconst result = ${funcName}(${tc.input.map((_, i) => `arg${i}`).join(', ')});`;
    }
    
    const { error, output } = runCodeSafely(fullCode, tc.input);
    
    if (error) {
      results.push({ passed: false, error, input: tc.input });
    } else {
      const success = output === tc.output || JSON.stringify(output) === JSON.stringify(tc.output);
      if (success) passed++;
      results.push({ passed: success, output, expected: tc.output, input: tc.input });
    }
  }
  
  return { passed, total: testCases.length, results, allPassed: passed === testCases.length };
};

const generateMistakeReview = async (wrong) => {
  if (!wrong.length || !GEMINI_API_KEY) return "";
  try {
    const prompt = `Student got these wrong:\n${wrong.map((w, i) => `${i + 1}. Q:"${w.q}" Their:"${w.userAnswer}" Correct:"${w.correct}" (${w.category})`).join("\n")}\nWrite SHORT encouraging Uzbek review. Each: why correct (1 sentence) + tip. End motivation. Max 150 words. Plain text.`;
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
};

const PlayerAvatar = ({ displayName, avatarUrl, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      border: "3px solid #6366f1",
      background: "#6366f1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.4,
      color: "#fff",
      fontWeight: 700,
      flexShrink: 0,
    }}
  >
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      (displayName?.[0] || "?").toUpperCase()
    )}
  </div>
);

const BattleMode = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const rtdb = getDatabase();

  // UI state — faqat render uchun kerak bo'lganlar
  const [screen, setScreen] = useState("lobby");
  const [wager, setWager] = useState(DEFAULT_WAGER_XP);
  const [gameType, setGameType] = useState("quiz"); // quiz | puzzle | editor
  const [opponent, setOpponent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(BATTLE_DURATION);
  const [countdown, setCountdown] = useState(3);
  const [myScore, setMyScore] = useState(0);
  const [opScore, setOpScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [aiReview, setAiReview] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [myXP, setMyXP] = useState(0);
  // Yangi o'yinlar state
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [editorCode, setEditorCode] = useState("");
  const [editorOutput, setEditorOutput] = useState("");
  const [editorError, setEditorError] = useState("");

  // Logic refs — stale closure yo'q, ESLint warning yo'q
  const answersRef = useRef([]);
  const questionsRef = useRef([]);
  const battleIdRef = useRef(null);
  const myRoleRef = useRef("player1");
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const battleRef = useRef(null);
  const queueRef = useRef(null);
  const battlesListenerRef = useRef(null); // safely tracks listener for clean unmounts
  const savingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "data", "stats"))
      .then((snap) => {
        if (snap.exists() && isMountedRef.current) setMyXP(snap.data().xp || 0);
      })
      .catch(console.error);
    return () => {
      isMountedRef.current = false;
    };
  }, [user]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      if (queueRef.current) remove(queueRef.current).catch(() => {});
      if (battleRef.current) off(battleRef.current);
      if (battlesListenerRef.current) {
        off(battlesListenerRef.current.ref, "value", battlesListenerRef.current.fn);
      }
    };
  }, []);

  const handleBattleEnd = useCallback(
    (bId) => {
      clearInterval(timerRef.current);
      if (savingRef.current) return;
      savingRef.current = true;

      const finalAnswers = answersRef.current;
      const score = finalAnswers.filter((a) => a.correct).length;
      const qs = questionsRef.current;

      setOpScore((opFinal) => {
        const iWon = score > opFinal;
        const isDraw = score === opFinal;
        const xpDelta = isDraw ? 0 : iWon ? wager : -wager;

        setResultData({
          score,
          opScore: opFinal,
          iWon,
          isDraw,
          xpDelta,
          answers: finalAnswers,
          questions: qs,
        });
        setScreen("result");
        return opFinal;
      });

      // Side effects OUTSIDE of state setter
      (async () => {
        const iWon = score > opScore;
        const isDraw = score === opScore;
        const xpDelta = isDraw ? 0 : iWon ? wager : -wager;

        try {
          const statsRef = doc(db, "users", user.uid, "data", "stats");
          await setDoc(
            statsRef,
            { battleWins: increment(iWon ? 1 : 0) },
            { merge: true },
          );
          await giveReward(
            user.uid,
            xpDelta,
            "xp",
            iWon
              ? "Battle g'alabasi"
              : isDraw
                ? "Battle durang"
                : "Battle mag'lubiyati",
          );

          await addDoc(collection(db, "users", user.uid, "notifications"), {
            title: iWon
              ? "🏆 G'alaba!"
              : isDraw
                ? "🤝 Durang!"
                : "💪 Jang tugadi!",
            message: `${score}/${qs.length} savol. XP: ${xpDelta > 0 ? "+" : ""}${xpDelta}`,
            type: iWon ? "success" : "info",
            read: false,
            createdAt: new Date(),
          });
          
          if (isMountedRef.current && showToast) {
            showToast(
              iWon
                ? `G'alaba! +${wager} XP!`
                : isDraw
                  ? "Durang!"
                  : "Jang tugadi!",
              iWon ? "success" : "info",
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (isMountedRef.current) savingRef.current = false;
        }

        const wrong = finalAnswers.filter((a) => !a.correct);
        if (wrong.length > 0 && isMountedRef.current) {
          setLoadingAI(true);
          const review = await generateMistakeReview(
            wrong.map((a) => ({
              q: a.q,
              category: a.category,
              userAnswer: a.userAnswer,
              correct: a.correct_ans,
            })),
          );
          if (isMountedRef.current) {
            setAiReview(review);
            setLoadingAI(false);
          }
        }
      })();

      if (bId) remove(ref(rtdb, `battles/${bId}`)).catch(() => {});
    },
    [wager, user, showToast, opScore, rtdb],
  );

  const handleAnswer = useCallback(
    (idxOrCorrect, isPuzzle = false, puzzleAnswerText = "") => {
      const qs = questionsRef.current;
      const q = qs[currentQ];
      if (!q) return;

      let isCorrect;
      let selectedIdx;
      let userAnswerText;
      let correctAnswerText;

      if (isPuzzle) {
        isCorrect = idxOrCorrect === true;
        selectedIdx = isCorrect ? 0 : 1;
        userAnswerText = puzzleAnswerText || (isCorrect ? "To'g'ri" : "Noto'g'ri");
        correctAnswerText = q.answer || q.instruction || "To'g'ri javob";
      } else {
        isCorrect = idxOrCorrect === q.answer;
        selectedIdx = idxOrCorrect;
        userAnswerText = q.options?.[idxOrCorrect] || "Noma'lum";
        correctAnswerText = q.options?.[q.answer] || "Noma'lum";
      }

      setSelected((prev) => {
        if (prev !== null) return prev;
        return selectedIdx;
      });

      answersRef.current = [
        ...answersRef.current,
        {
          correct: isCorrect,
          selected: selectedIdx,
          q: q.q || q.code || q.instruction,
          category: q.category,
          userAnswer: userAnswerText,
          correct_ans: correctAnswerText,
          explanation: q.explanation || "",
        },
      ];

      setMyScore((s) => (isCorrect ? s + 1 : s));

      const bId = battleIdRef.current;
      const role = myRoleRef.current;
      if (bId) {
        set(ref(rtdb, `battles/${bId}/${role}/answers/${currentQ}`), {
          idx: selectedIdx,
          correct: isCorrect,
        }).catch(() => {});
        const currentScore = answersRef.current.filter((a) => a.correct).length;
        set(ref(rtdb, `battles/${bId}/${role}/score`), currentScore).catch(
          () => {},
        );
      }

      setTimeout(() => {
        if (!isMountedRef.current) return;
        setCurrentQ((cq) => {
          if (cq + 1 < qs.length) {
            setSelected(null);
            return cq + 1;
          }
          clearInterval(timerRef.current);
          handleBattleEnd(battleIdRef.current);
          return cq;
        });
      }, 1200);
    },
    [currentQ, rtdb, handleBattleEnd],
  );

  const startBattleTimer = useCallback(
    (bId) => {
      answersRef.current = [];
      setCurrentQ(0);
      setSelected(null);
      setMyScore(0);
      setOpScore(0);
      setTimeLeft(BATTLE_DURATION);

      battleRef.current = ref(rtdb, `battles/${bId}`);
      onValue(battleRef.current, (snap) => {
        if (!isMountedRef.current) return;
        const data = snap.val();
        if (!data) return;
        const opKey = myRoleRef.current === "player1" ? "player2" : "player1";
        setOpScore(data[opKey]?.score || 0);
      });

      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) return clearInterval(timerRef.current);
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleBattleEnd(bId);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    },
    [rtdb, handleBattleEnd],
  );

  const startCountdown = useCallback(
    (bId) => {
      let c = 3;
      setCountdown(c);
      countdownRef.current = setInterval(() => {
        if (!isMountedRef.current) return clearInterval(countdownRef.current);
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(countdownRef.current);
          setScreen("battle");
          startBattleTimer(bId);
        }
      }, 1000);
    },
    [startBattleTimer],
  );

  const startSearch = useCallback(async () => {
    if (!user || loadingMatch) return;
    if (myXP < wager) {
      showToast?.(
        t.battleNotEnoughXPToast?.replace("{wager}", wager) || `Yetarli XP yo'q! Kerak: ${wager}`,
        "error"
      );
      return;
    }
    setLoadingMatch(true);

    try {
      const queuePath = ref(rtdb, "battleQueue");
      const myEntry = {
        uid: user.uid,
        displayName: user.displayName || t.battleYou,
        avatarUrl: user.photoURL || "",
        wager,
        joinedAt: rtServerTimestamp(),
      };

      const snap = await get(queuePath);
      const queue = snap.val() || {};
      const entries = Object.entries(queue).filter(
        ([, v]) => v.uid !== user.uid && v.wager === wager,
      );

      if (entries.length > 0) {
        const [opKey, opData] = entries[0];
        const newBattleRef = push(ref(rtdb, "battles"));
        const bId = newBattleRef.key;
        const mySnap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        
        let qs;
        if (gameType === "puzzle") {
          qs = getCodePuzzles();
        } else if (gameType === "editor") {
          qs = getEditorChallenges();
        } else {
          const myAvg = mySnap.exists() ? mySnap.data().quizAvg || 0 : 0;
          const diff = myAvg < 40 ? t.battleEasy : myAvg < 70 ? t.battleMedium : t.battleHard;
          qs = await generateBattleQuestions(diff);
        }

        await set(newBattleRef, {
          id: bId,
          status: "countdown",
          player1: {
            uid: user.uid,
            displayName: user.displayName || t.battleYou,
            avatarUrl: user.photoURL || "",
            score: 0,
            answers: {},
          },
          player2: {
            uid: opData.uid,
            displayName: opData.displayName,
            avatarUrl: opData.avatarUrl || "",
            score: 0,
            answers: {},
          },
          questions: qs,
          wager,
          createdAt: rtServerTimestamp(),
        });
        await remove(ref(rtdb, `battleQueue/${opKey}`)).catch(() => {});

        if (!isMountedRef.current) return;
        battleIdRef.current = bId;
        myRoleRef.current = "player1";
        questionsRef.current = qs;
        setOpponent({
          uid: opData.uid,
          displayName: opData.displayName,
          avatarUrl: opData.avatarUrl,
        });
        setQuestions(qs);
        setLoadingMatch(false);
        setScreen("countdown");
        startCountdown(bId);
      } else {
        const myQueueRef = push(queuePath);
        queueRef.current = myQueueRef;
        await set(myQueueRef, myEntry);
        onDisconnect(myQueueRef).remove();
        
        if (!isMountedRef.current) return;
        setScreen("searching");
        setLoadingMatch(false);

        const battlesQuery = query(ref(rtdb, "battles"), orderByChild("player2/uid"), equalTo(user.uid));
        
        const handleBattles = (bSnap) => {
          if (!isMountedRef.current) return;
          const battles = bSnap.val() || {};
          for (const [bId, battle] of Object.entries(battles)) {
            off(battlesQuery, "value", handleBattles);
            battlesListenerRef.current = null;
            remove(myQueueRef).catch(() => {});
            queueRef.current = null;

            const qs = battle.questions || getShuffledFallback();
            battleIdRef.current = bId;
            myRoleRef.current = "player2";
            questionsRef.current = qs;
            setOpponent({
              uid: battle.player1.uid,
              displayName: battle.player1.displayName,
              avatarUrl: battle.player1.avatarUrl,
            });
            setQuestions(qs);
            setScreen("countdown");
            startCountdown(bId);
            break;
          }
        };

        battlesListenerRef.current = { ref: battlesQuery, fn: handleBattles };
        onValue(battlesQuery, handleBattles);

        setTimeout(() => {
          if (queueRef.current && isMountedRef.current) {
            if (battlesListenerRef.current) {
              off(battlesListenerRef.current.ref, "value", battlesListenerRef.current.fn);
              battlesListenerRef.current = null;
            }
            remove(myQueueRef).catch(() => {});
            queueRef.current = null;
            setScreen("lobby");
            setLoadingMatch(false);
            showToast?.(t.battleOpponentNotFound, "error");
          }
        }, 60000);
      }
    } catch (err) {
      console.error("Matchmaking:", err);
      if (isMountedRef.current) {
        showToast?.(t.battleErrorToast, "error");
        setLoadingMatch(false);
      }
    }
  }, [user, wager, myXP, loadingMatch, rtdb, showToast, gameType, startCountdown, t]);

  const cancelSearch = useCallback(async () => {
    if (queueRef.current) {
      await remove(queueRef.current).catch(() => {});
      queueRef.current = null;
    }
    if (battlesListenerRef.current) {
      off(battlesListenerRef.current.ref, "value", battlesListenerRef.current.fn);
      battlesListenerRef.current = null;
    }
    if (isMountedRef.current) {
      setScreen("lobby");
      setLoadingMatch(false);
    }
  }, []);

  const resetBattle = () => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    if (battleRef.current) off(battleRef.current);
    answersRef.current = [];
    questionsRef.current = [];
    battleIdRef.current = null;
    myRoleRef.current = "player1";
    savingRef.current = false;
    setOpponent(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setMyScore(0);
    setOpScore(0);
    setTimeLeft(BATTLE_DURATION);
    setResultData(null);
    setAiReview("");
    setScreen("lobby");
  };

  const card = darkMode ? "#1e293b" : "#ffffff";
  const bdr = darkMode ? "#334155" : "#e2e8f0";
  const txt = darkMode ? "#f1f5f9" : "#111827";
  const sub = darkMode ? "#94a3b8" : "#6b7280";

  if (screen === "lobby")
    return (
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 80px" }}
      >
                  <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>
              <LuSwords className="text-white mx-auto" />
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: txt,
                margin: "0 0 8px",
              }}
            >
              {t.battleTitle}
            </h2>
            <p style={{ color: sub, fontSize: 14 }}>
              {t.battleSubtitle}
            </p>
          </div>

          <div
            style={{
              background: card,
              border: `1px solid ${bdr}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontWeight: 700,
                color: txt,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LuStar size={18} color="#f59e0b" /> {t.battleWagerLabel}
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[25, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setWager(amt)}
                  style={{
                    flex: 1,
                    minWidth: 70,
                    padding: "12px 0",
                    borderRadius: 10,
                    border: `2px solid ${wager === amt ? "#6366f1" : bdr}`,
                    background: wager === amt ? "#6366f122" : "transparent",
                    color: wager === amt ? "#6366f1" : sub,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <LuStar className="inline mr-1" /> {amt}
                </button>
              ))}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: sub }}>
              {t.battleYourXP}: <strong style={{ color: "#f59e0b" }}>{myXP}</strong> ·
              {t.battleWin}: +{wager} · {t.battleLoss}: -{wager}
            </p>
          </div>

          {/* O'YIN TURI TANLASH */}
          <div
            style={{
              background: card,
              border: `1px solid ${bdr}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontWeight: 700,
                color: txt,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LuBrain size={18} color="#8b5cf6" /> {t.battleGameType || "O'yin turi"}
            </h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { id: "quiz", icon: <LuTarget size={16} />, label: t.battleQuiz || "Savollar", desc: "10 ta test" },
                { id: "puzzle", icon: <LuZap size={16} />, label: t.battlePuzzle || "Code Puzzle", desc: "Kod to'ldirish" },
                { id: "editor", icon: <LuBrain size={16} />, label: t.battleEditor || "Code Editor", desc: "Kod yozish" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setGameType(type.id)}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    padding: "20px 12px",
                    borderRadius: 12,
                    border: `2px solid ${gameType === type.id ? "#8b5cf6" : bdr}`,
                    background: gameType === type.id ? "#8b5cf622" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ 
                    fontSize: 28, 
                    color: gameType === type.id ? "#8b5cf6" : sub,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {type.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: gameType === type.id ? "#8b5cf6" : txt }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 11, color: sub }}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
            {myXP < wager && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#ef4444",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {t.battleNotEnoughXP}
              </div>
            )}
          </div>

          <div
            style={{
              background: card,
              border: `1px solid ${bdr}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontWeight: 700,
                color: txt,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LuTarget size={16} color="#6366f1" /> {t.battleRulesTitle}
            </h3>
            {[
              {
                icon: <LuBrain size={15} color="#8b5cf6" />,
                text: t.battleRule1,
              },
              {
                icon: <LuClock size={15} color="#f59e0b" />,
                text: t.battleRule2,
              },
              {
                icon: <LuTrophy size={15} color="#d97706" />,
                text: t.battleRule3,
              },
              {
                icon: <LuStar size={15} color="#f59e0b" />,
                text: t.battleRule4,
              },
              {
                icon: <LuShield size={15} color="#06b6d4" />,
                text: t.battleRule5,
              },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: i < 4 ? `1px solid ${bdr}` : "none",
                }}
              >
                {r.icon}
                <span style={{ fontSize: 13, color: sub }}>{r.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startSearch}
            disabled={loadingMatch || myXP < wager}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 14,
              border: "none",
              background:
                myXP < wager
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              cursor: myXP < wager ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {loadingMatch ? (
              <>
                <LuLoader
                  size={18}
                  style={{ animation: "spin 0.8s linear infinite" }}
                />{" "}
                {t.battlePreparing}
              </>
            ) : (
              <>
                <LuSwords size={20} /> {t.battleEnter}
              </>
            )}
          </button>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (screen === "searching")
    return (
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            margin: "0 auto 28px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "4px solid #6366f1",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LuUsers size={36} color="#6366f1" />
          </div>
        </div>
        <h2
          style={{ fontSize: 22, fontWeight: 800, color: txt, marginBottom: 8 }}
        >
          {t.battleSearchingOpponent}
        </h2>
        <p style={{ color: sub, fontSize: 14, marginBottom: 4 }}>
          Wager: <LuStar className="inline mr-1" color="#f59e0b" /> {wager} XP
        </p>
        <p style={{ color: sub, fontSize: 12, marginBottom: 32 }}>
          {t.battleFoundWhen}
        </p>
        <button
          onClick={cancelSearch}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: `1px solid ${bdr}`,
            background: "transparent",
            color: sub,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {t.battleCancel}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (screen === "countdown")
    return (
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "80px 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            marginBottom: 40,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <PlayerAvatar
              displayName={user?.displayName}
              avatarUrl={user?.photoURL}
              size={72}
            />
            <p
              style={{
                margin: "8px 0 0",
                fontWeight: 700,
                color: txt,
                fontSize: 13,
              }}
            >
              {user?.displayName || "Siz"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#6366f122",
              border: "2px solid #6366f1",
            }}
          >
            <LuSwords size={20} color="#6366f1" />
          </div>
          <div style={{ textAlign: "center" }}>
            <PlayerAvatar
              displayName={opponent?.displayName}
              avatarUrl={opponent?.avatarUrl}
              size={72}
            />
            <p
              style={{
                margin: "8px 0 0",
                fontWeight: 700,
                color: txt,
                fontSize: 13,
              }}
            >
              {opponent?.displayName || t.battleOpponent}
            </p>
          </div>
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#6366f1",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {countdown}
        </div>
        <p style={{ color: sub }}>{t.battleStarting}</p>
      </div>
    );

  if (screen === "battle" && questions.length > 0) {
    const q = questions[currentQ];
    const timerColor =
      timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f59e0b" : "#6366f1";
    
    // O'yin turiga qarab progressni hisoblash
    const totalItems = gameType === "quiz" ? questions.length : 
                       gameType === "puzzle" ? 5 : 3;
    const progress = Math.min(currentQ + 1, totalItems);
    
    return (
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PlayerAvatar
              displayName={user?.displayName}
              avatarUrl={user?.photoURL}
              size={36}
            />
            <span style={{ fontWeight: 800, color: "#6366f1", fontSize: 24 }}>
              {myScore}
            </span>
          </div>
          <div
            style={{
              textAlign: "center",
              background: card,
              borderRadius: 12,
              padding: "8px 14px",
              border: `1px solid ${bdr}`,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: timerColor,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LuClock size={16} color={timerColor} /> {timeLeft}s
            </div>
            <div style={{ fontSize: 10, color: sub }}>
              {progress}/{totalItems}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#ef4444", fontSize: 24 }}>
              {opScore}
            </span>
            <PlayerAvatar
              displayName={opponent?.displayName}
              avatarUrl={opponent?.avatarUrl}
              size={36}
            />
          </div>
        </div>

        <div
          style={{
            height: 4,
            background: darkMode ? "#334155" : "#e5e7eb",
            borderRadius: 2,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(currentQ / questions.length) * 100}%`,
              background: "#6366f1",
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            height: 4,
            background: darkMode ? "#334155" : "#e5e7eb",
            borderRadius: 2,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(timeLeft / BATTLE_DURATION) * 100}%`,
              background: timerColor,
              borderRadius: 2,
              transition: "width 1s linear",
            }}
          />
        </div>

        {/* ========== QUIZ O'YINI ========== */}
        {gameType === "quiz" && (
          <>
            <div
              style={{
                background: card,
                border: `1px solid ${bdr}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#6366f122",
                    color: "#6366f1",
                  }}
                >
                  {q?.category}
                </span>
                <span style={{ fontSize: 11, color: sub }}>{q?.difficulty}</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 16,
                  color: txt,
                  lineHeight: 1.5,
                }}
              >
                {currentQ + 1}. {q?.q}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(q?.options || []).map((opt, i) => {
                let bg = card,
                  border = bdr,
                  color = txt;
                if (selected !== null) {
                  if (i === q.answer) {
                    bg = "#d1fae5";
                    border = "#10b981";
                    color = "#065f46";
                  } else if (i === selected && i !== q.answer) {
                    bg = "#fee2e2";
                    border = "#ef4444";
                    color = "#991b1b";
                  }
                }
                const dotBg =
                  selected !== null && i === q.answer
                    ? "#10b981"
                    : selected !== null && i === selected
                      ? "#ef4444"
                      : darkMode
                        ? "#334155"
                        : "#f3f4f6";
                const dotColor =
                  selected !== null && (i === q.answer || i === selected)
                    ? "#fff"
                    : sub;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    style={{
                      padding: "13px 16px",
                      borderRadius: 12,
                      border: `2px solid ${border}`,
                      background: bg,
                      color,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: selected !== null ? "default" : "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: dotBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                        color: dotColor,
                      }}
                    >
                      {selected !== null && i === q.answer ? (
                        <LuCheck />
                      ) : selected !== null && i === selected ? (
                        <LuX />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ========== CODE PUZZLE O'YINI ========== */}
        {gameType === "puzzle" && (
          <>
            <div
              style={{
                background: card,
                border: `1px solid ${bdr}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#8b5cf122",
                    color: "#8b5cf6",
                  }}
                >
                  {q?.category || "JavaScript"}
                </span>
                <span style={{ fontSize: 11, color: sub }}>{q?.difficulty || "O'rta"}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: sub }}>
                  <LuCode size={14} style={{ verticalAlign: "middle" }} /> {currentQ + 1}/5
                </span>
              </div>
              
              {/* Kod blok */}
              <div
                style={{
                  background: darkMode ? "#0f172a" : "#1e293b",
                  borderRadius: 10,
                  padding: 16,
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 14,
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                  marginBottom: 16,
                  whiteSpace: "pre-wrap",
                }}
              >
                {q?.code?.split("_____")?.map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <input
                        type="text"
                        value={puzzleAnswer}
                        onChange={(e) => setPuzzleAnswer(e.target.value)}
                        placeholder="???"
                        style={{
                          width: 80,
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "2px solid #8b5cf6",
                          background: darkMode ? "#1e293b" : "#fff",
                          color: "#8b5cf6",
                          fontWeight: 700,
                          fontSize: 14,
                          fontFamily: "inherit",
                          textAlign: "center",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && puzzleAnswer.trim()) {
                            const isCorrect = puzzleAnswer.trim() === q?.answer;
                            if (isCorrect) {
                              handleAnswer(q?.answer);
                              setPuzzleAnswer("");
                            }
                          }
                        }}
                      />
                    )}
                  </span>
                )) || q?.q}
              </div>

              {/* Maslahat */}
              {q?.hint && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 12px",
                    background: darkMode ? "#fef3c722" : "#fef3c7",
                    borderRadius: 8,
                    border: "1px solid #f59e0b44",
                  }}
                >
                  <LuLightbulb size={16} color="#f59e0b" />
                  <span style={{ fontSize: 12, color: "#f59e0b" }}>
                    {t.battleHint || "Maslahat"}: {q.hint}
                  </span>
                </div>
              )}
            </div>

            {/* Tekshirish tugmasi */}
            <button
              onClick={() => {
                if (puzzleAnswer.trim()) {
                  const isCorrect = puzzleAnswer.trim().toLowerCase() === q?.answer?.toLowerCase();
                  handleAnswer(isCorrect, true, puzzleAnswer.trim());
                  setPuzzleAnswer("");
                }
              }}
              disabled={!puzzleAnswer.trim()}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                background: puzzleAnswer.trim() ? "linear-gradient(135deg, #8b5cf6, #6366f1)" : "#94a3b8",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: puzzleAnswer.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <LuCheck size={18} /> {t.battleCheck || "Tekshirish"}
            </button>
          </>
        )}

        {/* ========== CODE EDITOR O'YINI ========== */}
        {gameType === "editor" && (
          <>
            <div
              style={{
                background: card,
                border: `1px solid ${bdr}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#10b98122",
                    color: "#10b981",
                  }}
                >
                  {q?.category || "JavaScript"}
                </span>
                <span style={{ fontSize: 11, color: sub }}>{q?.difficulty || "O'rta"}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: sub }}>
                  <LuTerminal size={14} style={{ verticalAlign: "middle" }} /> {currentQ + 1}/3
                </span>
              </div>

              {/* Vazifa */}
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  color: txt,
                }}
              >
                {q?.instruction || "Kod yozing"}
              </p>

              {/* Kod editor */}
              <div style={{ position: "relative" }}>
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  placeholder={q?.starterCode || "// Kod yozing"}
                  style={{
                    width: "100%",
                    minHeight: 180,
                    padding: 16,
                    borderRadius: 10,
                    border: `1px solid ${bdr}`,
                    background: darkMode ? "#0f172a" : "#1e293b",
                    color: "#e2e8f0",
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 13,
                    lineHeight: 1.7,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>

              {/* Natija */}
              {editorOutput && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    borderRadius: 8,
                    background: editorError ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${editorError ? "#fecaca" : "#86efac"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    {editorError ? (
                      <LuX size={16} color="#ef4444" />
                    ) : (
                      <LuCheck size={16} color="#10b981" />
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: editorError ? "#ef4444" : "#10b981" }}>
                      {editorError ? t.battleError || "Xato" : t.battleSuccess || "To'g'ri"}
                    </span>
                  </div>
                  <pre style={{ margin: 0, fontSize: 12, color: txt, fontFamily: "monospace" }}>
                    {editorOutput}
                  </pre>
                </div>
              )}

              {/* Maslahat */}
              {q?.hint && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 12,
                    padding: "10px 12px",
                    background: darkMode ? "#fef3c722" : "#fef3c7",
                    borderRadius: 8,
                    border: "1px solid #f59e0b44",
                  }}
                >
                  <LuLightbulb size={16} color="#f59e0b" />
                  <span style={{ fontSize: 12, color: "#f59e0b" }}>
                    {t.battleHint || "Maslahat"}: {q.hint}
                  </span>
                </div>
              )}
            </div>

            {/* Tugmalar */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setEditorOutput("");
                  setEditorError("");
                  const result = checkEditorAnswer(editorCode, q?.testCases || []);
                  if (result.error) {
                    setEditorError(result.error);
                    setEditorOutput(result.error);
                  } else {
                    const output = result.results.map((r, i) => 
                      `Test ${i + 1}: ${r.passed ? "✅" : "❌"} ${JSON.stringify(r.input)} → ${JSON.stringify(r.output)}`
                    ).join("\n");
                    setEditorOutput(output);
                    handleAnswer(result.allPassed, true, "Kod muvaffaqiyatli ishladi");
                  }
                }}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <LuPlay size={18} /> {t.battleRun || "Ishga tushirish"}
              </button>
              
              <button
                onClick={() => {
                  handleAnswer(false, true, "O'tkazib yuborildi");
                  setEditorCode("");
                  setEditorOutput("");
                  setEditorError("");
                }}
                style={{
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `1px solid ${bdr}`,
                  background: "transparent",
                  color: sub,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t.battleSkip || "O'tkazib yuborish"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const {
      score,
      opScore: opFinal,
      iWon,
      isDraw,
      xpDelta,
      answers,
      questions: qs,
    } = resultData;
    return (
      <div
        style={{
          maxWidth: 580,
          margin: "0 auto",
          padding: "40px 16px 80px",
          textAlign: "center",
        }}
      >
                  <div
            style={{
              fontSize: 72,
              marginBottom: 8,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {iWon ? (
              <LuTrophy className="text-amber-500" />
            ) : isDraw ? (
              <LuHandshake className="text-indigo-500" />
            ) : (
              <LuActivity className="text-slate-500" />
            )}
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: txt,
              marginBottom: 4,
            }}
          >
            {iWon ? t.battleVictory : isDraw ? t.battleDraw : t.battleGoodTry}
          </h2>
          <p style={{ color: sub, marginBottom: 24 }}>
            XP:{" "}
            <strong style={{ color: xpDelta >= 0 ? "#10b981" : "#ef4444" }}>
              <LuStar className="inline mr-1" /> {xpDelta >= 0 ? "+" : ""}
              {xpDelta}
            </strong>
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginBottom: 28,
              background: card,
              border: `1px solid ${bdr}`,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#6366f1" }}>
                {score}
              </div>
              <div style={{ fontSize: 12, color: sub }}>{t.battleYou}</div>
            </div>
            <LuSwords size={20} color={sub} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#ef4444" }}>
                {opFinal}
              </div>
              <div style={{ fontSize: 12, color: sub }}>
                {opponent?.displayName || t.battleOpponent}
              </div>
            </div>
          </div>

          {loadingAI && (
            <div
              style={{
                padding: 20,
                borderRadius: 14,
                background: card,
                border: `1px solid ${bdr}`,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <LuBrain
                size={18}
                color="#6366f1"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span style={{ color: sub, fontSize: 13 }}>
                {t.battleAIAnalyzing}
              </span>
            </div>
          )}
          {aiReview && !loadingAI && (
            <div
              style={{
                background: darkMode ? "#1e3a5f" : "#eff6ff",
                border: `1px solid ${darkMode ? "#1d4ed8" : "#bfdbfe"}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 20,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <LuBrain size={18} color="#3b82f6" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: darkMode ? "#93c5fd" : "#1d4ed8",
                  }}
                >
                  {t.battleReviewTitle}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: darkMode ? "#94a3b8" : "#374151",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {aiReview}
              </p>
            </div>
          )}

          <div
            style={{
              background: card,
              border: `1px solid ${bdr}`,
              borderRadius: 14,
              padding: 16,
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            {(qs || []).slice(0, answers.length).map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom:
                    i < answers.length - 1 ? `1px solid ${bdr}` : "none",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: answers[i]?.correct ? "#d1fae5" : "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: answers[i]?.correct ? "#065f46" : "#991b1b",
                  }}
                >
                  {answers[i]?.correct ? <LuCheck /> : <LuX />}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: txt }}>{q.q}</p>
                  {!answers[i]?.correct && (
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 11,
                        color: "#10b981",
                      }}
                    >
                      {t.battleCorrect}: {q.options?.[q.answer]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={resetBattle}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <LuRefreshCw size={16} /> {t.battleRematch}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 16,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: sub,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LuCheck size={14} color="#10b981" />{" "}
              {answers.filter((a) => a.correct).length} {t.battleCorrectCount}
            </span>
            <span
              style={{
                fontSize: 12,
                color: sub,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <LuInfo size={14} color="#ef4444" />{" "}
              {answers.filter((a) => !a.correct).length} {t.battleWrongCount}
            </span>
          </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return null;
};

export default BattleMode;
