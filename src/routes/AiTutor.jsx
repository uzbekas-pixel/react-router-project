import React, { useState, useRef, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { 
  LuMic, LuMicOff, LuPaperclip, LuRefreshCw, LuSend, 
  LuX, LuGlobe, LuPalette, LuZap, LuFlame, LuLanguages, 
  LuBot, LuUser, LuInbox, LuMessageSquare, LuAtom,
  LuBriefcase, LuVolume2, LuVolumeX 
} from "react-icons/lu";

const getQuickTopics = (t, lang) => {
  const isUz = lang === "uz";
  const isRu = lang === "ru";
  const isFr = lang === "fr";

  const label = {
    html: t.aiTutorTopicHtml || "HTML",
    css:  t.aiTutorTopicCss  || "CSS",
    js:   t.aiTutorTopicJs   || "JavaScript",
    react: t.aiTutorTopicReact || "React",
    en:   t.aiTutorTopicEn  || "English",
    ru:   t.aiTutorTopicRu  || "Russian",
    fr:   t.aiTutorTopicFr  || "French",
    fb:   t.aiTutorTopicFb  || "Firebase",
  };

  const topics = [
    {
      icon: <LuGlobe className="text-blue-400" />,
      label: label.html,
      prompt: isUz
        ? "HTML da eng ko'p ishlatiladigan teglar qaysilar va ularning vazifasi nima?"
        : isRu ? "Какие самые часто используемые HTML-теги?" : isFr ? "Quelles sont les balises HTML ?" : "Which are the most commonly used HTML tags?",
    },
    {
      icon: <LuPalette className="text-purple-400" />,
      label: label.css,
      prompt: isUz
        ? "CSS Flexbox va Grid farqi nima? Qachon qaysinisini ishlataman?"
        : "What is the difference between CSS Flexbox and Grid?",
    },
    {
      icon: <LuZap className="text-yellow-400" />,
      label: label.js,
      prompt: isUz
        ? "JavaScript da async/await qanday ishlaydi? Misol bilan tushuntir."
        : "How does async/await work in JavaScript?",
    },
    {
      icon: <LuAtom className="text-cyan-400" />,
      label: label.react,
      prompt: isUz
        ? "React hooks nima? useState va useEffect ni tushuntir."
        : "What are React hooks? Explain useState and useEffect.",
    },
    {
      icon: <LuLanguages className="text-green-400" />,
      label: label.en,
      prompt: isUz
        ? "Ingliz tilida Present Perfect va Simple Past farqini misol bilan tushuntir."
        : "Explain the difference between Present Perfect and Simple Past.",
    },
    {
      icon: <LuFlame className="text-orange-400" />,
      label: label.fb,
      prompt: isUz
        ? "Firebase Firestore da ma'lumot qo'shish, o'qish va o'chirish qanday amalga oshiriladi?"
        : "How do I add, read, and delete data in Firebase Firestore?",
    },
  ];

  return topics;
};

const getSuggestedQuestions = (lang) => {
  const isUz = lang === "uz";
  const isRu = lang === "ru";
  const isFr = lang === "fr";

  return [
    isUz ? "HTML form elementlari qaysilar?" : isRu ? "Какие есть элементы форм в HTML?" : isFr ? "Quels éléments de formulaire HTML existent ?" : "Which HTML form elements exist?",
    isUz ? "CSS animatsiya qanday yoziladi?" : isRu ? "Как написать анимации в CSS?" : isFr ? "Comment écrire des animations CSS ?" : "How do I write CSS animations?",
    isUz ? "JavaScript Promise nima?" : isRu ? "Что такое Promise в JavaScript?" : isFr ? "Qu'est-ce qu'une Promise en JavaScript ?" : "What is a JavaScript Promise?",
    isUz ? "React component lifecycle tushuntir" : isRu ? "Объясни жизненный цикл компонента React." : isFr ? "Explique le cycle de vie d'un composant React." : "Explain React component lifecycle.",
    isUz ? "SQL va NoSQL farqi nima?" : isRu ? "В чем разница между SQL и NoSQL?" : isFr ? "Quelle est la différence entre SQL et NoSQL ?" : "What is the difference between SQL and NoSQL?",
    isUz ? "Git clone, pull, push farqi?" : isRu ? "В чем разница между git clone, pull и push?" : isFr ? "Quelle est la différence entre git clone, pull et push ?" : "What is the difference between git clone, pull, and push?",
    isUz ? "REST API nima?" : isRu ? "Что такое REST API?" : isFr ? "Qu'est-ce qu'une API REST ?" : "What is a REST API?",
    isUz ? "Ingliz tilida past simple ishlatish" : isRu ? "Как использовать Past Simple?" : isFr ? "Comment utiliser le prétérit (Past Simple) ?" : "How to use Past Simple tense?",
  ];
};

const getSystemPrompt = (lang, isMockMode) => {
  const langRule =
    lang === "uz"
      ? "Har doim o'zbek tilida javob ber (agar savol boshqa tilda bo'lsa, o'sha tilda javob ber)."
      : lang === "ru"
        ? "Всегда отвечай на русском языке (если вопрос задан на другом языке, ответь на языке вопроса)."
        : lang === "fr"
          ? "Réponds toujours en français (si la question est posée dans une autre langue, réponds dans la langue de la question)."
          : "Always respond in English (if the question is asked in another language, respond in the question's language).";

  if (isMockMode) {
    return `Sen nufuzli IT kompaniyasining "Senior Dasturchisi" va HR mutaxassisisan. Maqsading: foydalanuvchini Frontend (HTML, CSS, JavaScript, React) yoki Fullstack yo'nalishi bo'yicha ishga kirish suhbatidan (Mock Interview) o'tkazish.
Qoidalar:
- ${langRule}
- Realistik suhbat atmosferasini yarat.
- Boshlanishida foydalanuvchidan qaysi yo'nalish/stack bo'yicha suhbat qilishini so'ra.
- SAVOLLARNI BITTA-BITTADAN BER. Hech qachon birdaniga 2-3 ta savol tashlama.
- Foydalanuvchi javob bergach, uning javobini to'g'ri yoki noto'g'ri ekanligini qisqacha bahola (konstruktiv feedback ber) va keyin asoratini uzmasdan DARRHOL keyingi texnik savolga o't.
- Texnik savollar bilan birga ba'zida soft-skill savollarini ham qoshib ket (masalan: "Qiyin bug chiqqanda nima qilasan?").
- Gaplaringni xuddi haqiqiy odamdek qisqa, tabiiy va og'zaki nutqqa moslab tuz, chunki bu matn ovozli o'qiladi. Markdown ishlatishdan qoch (***, ###, kod bloklari o'qilganda xunuk eshitiladi).
- Agar foydalanuvchi bilmasligini aytsa, javobni o'zing tushuntir va boshqa mavzuga o't.`;
  }

  return `Sen "Uzbekas Pixel" online ta'lim platformasining AI o'qituvchisisan. Sening vazifang o'quvchilarga quyidagi mavzularda yordam berish:

Dasturlash: HTML5, CSS, JavaScript, React, Firebase, Git, REST API, SQL/NoSQL
Tillar: Ingliz tili (IELTS, grammar), Rus tili, Fransuz tili

Qoidalar:
- ${langRule}
- Javoblarni tushunarli va qisqa qil, lekin to'liq tushuntir
- Kod misollar berganingda aniq va tushunarli yoz
- Faqat ta'lim va dasturlash mavzularida gapir
- Friendly va ragbatlantiruci bo'l`;
};

const MessageBubble = ({ msg, darkMode, isMockMode }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, gap: 8, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ 
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0, 
          background: isMockMode ? "linear-gradient(135deg, #ef4444, #f97316)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", 
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white" 
        }}>
          {isMockMode ? <LuBriefcase /> : <LuBot />}
        </div>
      )}
      <div style={{
        maxWidth: "72%", padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "linear-gradient(135deg, #3b82f6, #6366f1)" : darkMode ? "#1e293b" : "#f1f5f9",
        color: isUser ? "#fff" : darkMode ? "#e2e8f0" : "#1e293b",
        fontSize: 14, lineHeight: 1.7,
        border: !isUser ? `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` : "none",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.imagePreviewUrl && (
          <img
            src={msg.imagePreviewUrl}
            alt="Rasm"
            style={{
              maxWidth: "100%",
              maxHeight: 260,
              borderRadius: 12,
              display: "block",
              marginBottom: msg.content ? 8 : 0,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
            }}
          />
        )}
        {msg.content}
        {msg.loading && (
          <span style={{ display: "inline-flex", gap: 3, marginLeft: 6, verticalAlign: "middle" }}>
            {[0,1,2].map((i) => (
              <span key={i} style={{ 
                width: 5, height: 5, borderRadius: "50%", 
                background: isMockMode ? "#f97316" : "#60a5fa", 
                display: "inline-block", 
                animation: "dotBounce 1.2s ease-in-out infinite", 
                animationDelay: `${i * 0.2}s` 
              }} />
            ))}
          </span>
        )}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#f1f5f9", fontWeight: 700 }}>
          <LuUser />
        </div>
      )}
    </div>
  );
};

const AiTutor = ({ darkMode, showToast }) => {
  const { user: _user } = useAuth();
  const { lang, t } = useLang();
  
  // Yangi statelar
  const [isMockMode, setIsMockMode] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: t.aiTutorCleared || "Salom! Men AI o'qituvchiman. Savol bering!",
  }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  const [listening, setListening] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);

  const quickTopics = getQuickTopics(t, lang);
  const suggestedQuestions = getSuggestedQuestions(lang);

  const messagesAreaRef = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef   = useRef(null);
  const recognitionRef  = useRef(null);

  useEffect(() => {
    // Foydalanuvchi hali hech narsa yubormagan bo'lsa,
    // menyu tili o'zgarganda welcome-xabarni ham yangilaymiz.
    const hasUserMessage = messages.some((m) => m.role === "user");
    if (hasUserMessage) return;

    revokePendingImage();
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowSugg(!isMockMode);
    resetTextarea();
    
    if (!isMockMode) {
      setMessages([{ role: "assistant", content: t.aiTutorCleared }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const revokeObjectUrl = (url) => {
    try {
      if (url) URL.revokeObjectURL(url);
    } catch (e) {
      // Oldingi object URL bo'lsa ham, browser xatolarga yo'l qo'yishi mumkin.
      // Biz bu holatni jim e'tiborsiz qoldiramiz.
      void e;
    }
  };

  const revokePendingImage = () => {
    if (!pendingImage?.previewUrl) return;
    revokeObjectUrl(pendingImage.previewUrl);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      revokePendingImage();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Faqat messages box ichida scroll, sahifa emas
  useEffect(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  // Text-To-Speech function
  const speakText = (text) => {
    if (!aiVoiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); 
    
    // Kod bloklarini ovozli o'qimasligi uchun tozalab tashlaymiz
    const cleanText = text.replace(/```[\s\S]*?```/g, " [Kod yozildi] ").replace(/[*_#]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 1.05; 
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleMockMode = () => {
    if (loading) return;
    const newMode = !isMockMode;
    setIsMockMode(newMode);
    
    // Suhbatni tozalash
    messages.forEach((m) => revokeObjectUrl(m?.imagePreviewUrl));
    revokePendingImage();
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowSugg(!newMode); 
    resetTextarea();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    const startMsg = newMode 
      ? (lang === 'uz' ? "Assalomu alaykum! Men sizning texnik intervyueringizman. Suhbatni boshlashga tayyormisiz? Qaysi dasturlash yo'nalishi yoki texnologiyalar bo'yicha suhbatlashamiz?" 
        : lang === 'ru' ? "Привет! Я твой технический интервьюер. Готов начать? По какому стеку будем проходить собеседование?"
        : "Hello! I am your technical interviewer. Are you ready to start? Which stack are we evaluating today?")
      : (t.aiTutorCleared || "Salom! Men AI o'qituvchiman. Savol bering!");
      
    setMessages([{ role: "assistant", content: startMsg }]);
    
    if (newMode) speakText(startMsg);
  };

  const sendMessage = async (text) => {
    const rawText = (text || input).trim();
    const hasImage = Boolean(pendingImage);
    if ((!rawText && !hasImage) || loading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast && showToast(t.apiKeyMissing, "error");
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel(); // User yozganda ovoz to'xtasin

    const imageToSend = pendingImage;
    const effectiveText = rawText || (hasImage ? t.aiTutorImageOnlyFallback : "");
    const currentUserParts = [
      ...(effectiveText ? [{ text: effectiveText }] : []),
      ...(imageToSend?.base64
        ? [{ inlineData: { mimeType: imageToSend.mimeType, data: imageToSend.base64 } }]
        : []),
    ];

    setInput("");
    resetTextarea();
    setShowSugg(false);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: effectiveText,
        imagePreviewUrl: imageToSend?.previewUrl || null,
        imageInlineData: imageToSend?.base64
          ? { mimeType: imageToSend.mimeType, data: imageToSend.base64 }
          : null,
      },
      { role: "assistant", content: "", loading: true },
    ]);

    // Gemini history formati
    const history = messages
      .filter((m) => !m.loading && (m.content || m.imageInlineData))
      .slice(isMockMode ? -14 : -8) // Suhbatda kontekst ko'proq kerak
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts:
          m.role === "assistant"
            ? [{ text: m.content || "" }]
            : [
                ...(m.content ? [{ text: m.content }] : []),
                ...(m.imageInlineData
                  ? [{ inlineData: { mimeType: m.imageInlineData.mimeType, data: m.imageInlineData.data } }]
                  : []),
              ],
      }));

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: getSystemPrompt(lang, isMockMode) }] },
            contents: [
              ...history,
              { role: "user", parts: currentUserParts },
            ],
            generationConfig: { maxOutputTokens: 4096, temperature: isMockMode ? 0.6 : 0.7 },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || t.aiTutorError || "Javob olishda xatolik yuz berdi.";

      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: reply }]);
      
      // Ovozli javob
      if (isMockMode || aiVoiceEnabled) {
          speakText(reply);
      }

    } catch (err) {
      console.error("Gemini xato:", err.message);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `❌ Xatolik: ${err.message}` },
      ]);
      showToast && showToast(t.aiConnectError, "error");
    }

    setLoading(false);
    textareaRef.current?.focus();
  };

  const clearChat = () => {
    // Xabar ichidagi rasm preview-larni tozalash (object URL)
    messages.forEach((m) => revokeObjectUrl(m?.imagePreviewUrl));
    revokePendingImage();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([{ role: "assistant", content: isMockMode ? "Mock suhbat yangilandi. Qaysi yo'nalishda davom etamiz?" : t.aiTutorCleared }]);
    setShowSugg(!isMockMode);
    resetTextarea();
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Rasm 5MB dan katta bo'lmasligi kerak.");
      e.target.value = "";
      return;
    }

    setImageUploading(true);
    try {
      // Oldingi pending rasm preview-ni tozalaymiz (u hali yuborilmagan bo'ladi)
      revokePendingImage();

      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = dataUrl.split(",")[1] || "";
      const previewUrl = URL.createObjectURL(file);

      setPendingImage({
        mimeType: file.type || "image/png",
        base64,
        previewUrl,
      });
    } catch {
      alert("Rasmni o'qishda xato yuz berdi.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const toggleVoice = () => {
    if (loading) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast && showToast(t.aiTutorSpeechNotSupported, "error");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }
    
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    setShowSugg(false);
    setListening(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Hozirgi UI tiliga mos ravishda transkripsiya tilini ham moslaymiz.
    recognition.lang =
      lang === "uz" ? "uz-UZ" :
      lang === "ru" ? "ru-RU" :
      lang === "fr" ? "fr-FR" :
      "en-US";

    recognition.interimResults = true; // Matnni real-time ko'rsatish
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = "";
      let reachedFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          reachedFinal = true;
          break;
        }
      }

      const cleaned = transcript.replace(/\s+/g, " ").trim();
      if (cleaned) {
          setInput(cleaned);
          resetTextarea();
          if(textareaRef.current) {
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
          }
      }

      // Yakuniy natija bo'lsa matnni textarea'ga joylaymiz.
      // Keyin siz o'zingiz `Send` bosasiz (transkripsiya xatolarda noto'g'ri yuborib yubormaslik uchun).
      if (reachedFinal && cleaned) {
        try { recognition.stop(); } catch (e) {
          console.warn("SpeechRecognition stop error:", e);
        }
        setListening(false);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      const code = event?.error;
      // Brauzerlar xato kodlarini turlicha yuboradi.
      const message =
        code === "not-allowed" || code === "service-not-allowed"
          ? t.aiTutorSpeechMicrophoneDenied
          : code === "no-speech"
            ? t.aiTutorSpeechNoSpeech
            : code === "aborted"
              ? t.aiTutorSpeechAborted
              : code === "network"
                ? t.aiTutorSpeechNetwork
                : t.aiTutorSpeechError;

      console.warn("SpeechRecognition error:", code, event);
      showToast && showToast(message, "error");
    };

    recognition.onend = () => {
      setListening(false);
      textareaRef.current?.focus?.();
    };

    recognition.start();
  };

  const borderColor = darkMode ? "#334155" : "#e2e8f0";

  return (
    <div style={{
      width: "100%", maxWidth: 860, margin: "0 auto",
      padding: "16px 16px 16px",
      display: "flex", flexDirection: "column",
      // Sahifa scroll emas, box ichida scroll
      height: "calc(100vh - 68px)",
      boxSizing: "border-box",
      overflow: "hidden", // sahifa scrollini bloklaydi
    }}>
      <style>{`
        @keyframes dotBounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-5px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseBorder { 
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 
        }
        .ai-msg-area::-webkit-scrollbar { width: 4px; }
        .ai-msg-area::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .ai-msg-area { scrollbar-width: thin; scrollbar-color: #475569 transparent; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 12, 
            background: isMockMode ? "linear-gradient(135deg, #ef4444, #f97316)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", 
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "white",
            transition: "all 0.3s"
          }}>
            {isMockMode ? <LuBriefcase /> : <LuBot />}
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: darkMode ? "#f1f5f9" : "#111" }}>
              {isMockMode ? "Mock Intervyuer" : t.aiTutorTitle}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ 
                width: 7, height: 7, borderRadius: "50%", 
                background: isMockMode ? "#ef4444" : "#10b981",
                animation: isMockMode ? "pulseBorder 2s infinite" : "none" 
              }} />
              <span style={{ fontSize: 11, color: isMockMode ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                {isMockMode ? "Live Suhbat" : t.aiTutorOnline}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)} style={{
            padding: "6px", borderRadius: 10, background: "transparent",
            border: `1px solid ${borderColor}`, color: aiVoiceEnabled ? "#3b82f6" : (darkMode ? "#94a3b8" : "#64748b"), cursor: "pointer", transition: "all 0.2s"
          }} title="AI ovozini yoqish/o'chirish">
            {aiVoiceEnabled ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
          </button>
          
          <button onClick={toggleMockMode} style={{
            padding: "6px 14px", borderRadius: 10, 
            background: isMockMode ? "rgba(239, 68, 68, 0.1)" : "transparent",
            border: `1px solid ${isMockMode ? "#ef4444" : borderColor}`, 
            color: isMockMode ? "#ef4444" : (darkMode ? "#e2e8f0" : "#334155"), 
            fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s"
          }}>
            <LuBriefcase size={14} /> Mock Suhbat
          </button>
          
          <button onClick={clearChat} style={{ 
            padding: "6px 14px", borderRadius: 10, background: "transparent", 
            border: `1px solid ${borderColor}`, color: darkMode ? "#94a3b8" : "#6b7280", 
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <LuRefreshCw size={13} /> {t.aiTutorClear}
          </button>
        </div>
      </div>

      {/* Topic pills */}
      {!isMockMode && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, flexShrink: 0 }}>
          {quickTopics.map((t, i) => (
            <button key={i} onClick={() => sendMessage(t.prompt)} disabled={loading}
              style={{ padding: "4px 11px", borderRadius: 20, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${borderColor}`, color: darkMode ? "#94a3b8" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.color = darkMode ? "#94a3b8" : "#374151"; }}>
              <span className="flex items-center gap-1.5">{t.icon} {t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages area — flex:1 bilan to'liq joy oladi, ichida scroll */}
      <div
        ref={messagesAreaRef}
        className="ai-msg-area"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px",
          borderRadius: 14,
          background: darkMode ? "#0f172a" : "#f8fafc",
          border: `1px solid ${borderColor}`,
          marginBottom: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ animation: "fadeUp 0.2s ease" }}>
            <MessageBubble msg={msg} darkMode={darkMode} isMockMode={isMockMode} />
          </div>
        ))}

        {!isMockMode && showSugg && messages.length === 1 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>{t.aiTutorQuickQ}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  style={{ padding: "5px 11px", borderRadius: 16, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${borderColor}`, color: darkMode ? "#94a3b8" : "#374151", fontSize: 11, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = darkMode ? "#1e293b" : "#fff"; e.currentTarget.style.color = darkMode ? "#94a3b8" : "#374151"; e.currentTarget.style.borderColor = borderColor; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${listening ? (isMockMode ? "#ef4444" : "#3b82f6") : borderColor}`, borderRadius: 14, padding: "8px 10px", flexShrink: 0, transition: "all 0.3s" }}>
        <button
          onClick={toggleVoice}
          disabled={loading}
          title={t.aiTutorMic}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: listening ? (isMockMode ? "#ef4444" : "linear-gradient(135deg, #3b82f6, #6366f1)") : (darkMode ? "#0f172a" : "#f8fafc"),
            color: listening ? "#fff" : (darkMode ? "#94a3b8" : "#374151"),
            cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
            animation: listening ? "pulseBorder 1.5s infinite" : "none"
          }}
        >
          {listening ? <LuMicOff size={16} /> : <LuMic size={16} />}
        </button>

        {!isMockMode && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || imageUploading}
            title={t.aiTutorImageAttach}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: `1px solid ${borderColor}`,
              background: darkMode ? "#0f172a" : "#f8fafc",
              color: darkMode ? "#94a3b8" : "#374151",
              cursor: (loading || imageUploading) ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {imageUploading ? "⏳" : <LuPaperclip size={16} />}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          style={{ display: "none" }}
        />

        {pendingImage?.previewUrl && (
          <div style={{ position: "relative", width: 38, height: 38, borderRadius: 10, overflow: "hidden", border: `1px solid ${borderColor}`, background: darkMode ? "#0f172a" : "#f8fafc" }}>
            <img src={pendingImage.previewUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              onClick={() => {
                revokePendingImage();
                setPendingImage(null);
              }}
              disabled={loading}
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                borderRadius: 999,
                border: "none",
                background: "#ef4444",
                color: "#fff",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              }}
              title="Rasmni olib tashlash"
            >
              <LuX size={12} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "40px";
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder={listening ? "Eshitilmoqda..." : (isMockMode ? "Javobingizni yozing yoki mikrofondan foydalaning..." : t.aiTutorPlaceholder)}
          disabled={loading}
          style={{ flex: 1, paddingTop: 10, border: "none", outline: "none", resize: "none", background: "transparent", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, lineHeight: 1.6, fontFamily: "inherit", minHeight: 40, maxHeight: 100, overflowY: "auto", scrollbarWidth: "none" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || (!input.trim() && !pendingImage)}
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0,
            background: loading || (!input.trim() && !pendingImage) ? (darkMode ? "#334155" : "#e2e8f0") : (isMockMode ? "linear-gradient(135deg, #ef4444, #f97316)" : "linear-gradient(135deg, #3b82f6, #6366f1)"),
            color: loading || (!input.trim() && !pendingImage) ? "#6b7280" : "#fff",
            cursor: loading || (!input.trim() && !pendingImage) ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "all 0.2s",
          }}
        >
          {loading ? "⏳" : <LuSend size={16} />}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", marginTop: 5, flexShrink: 0 }}>
        {t.aiTutorDisclaimer}
      </p>
    </div>
  );
};

export default AiTutor;