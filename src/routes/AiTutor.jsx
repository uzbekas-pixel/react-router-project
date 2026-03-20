import React, { useState, useRef, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";

const quickTopics = [
  { icon: "🌐", label: "HTML",       prompt: "HTML da eng ko'p ishlatiladigan teglar qaysilar va ularning vazifasi nima?" },
  { icon: "🎨", label: "CSS",        prompt: "CSS Flexbox va Grid farqi nima? Qachon qaysinisini ishlataman?" },
  { icon: "⚡", label: "JavaScript", prompt: "JavaScript da async/await qanday ishlaydi? Misol bilan tushuntir." },
  { icon: "⚛️", label: "React",      prompt: "React hooks nima? useState va useEffect ni tushuntir." },
  { icon: "🇬🇧", label: "English",   prompt: "Ingliz tilida Present Perfect va Simple Past farqini misol bilan tushuntir." },
  { icon: "🇷🇺", label: "Russian",   prompt: "Rus tilida падежlar qanday ishlaydi? Misollar bilan tushuntir." },
  { icon: "🇫🇷", label: "French",    prompt: "Fransuz tilida être va avoir fe'llarini qachon ishlatiladi?" },
  { icon: "🔥", label: "Firebase",   prompt: "Firebase Firestore da ma'lumot qo'shish, o'qish va o'chirish qanday amalga oshiriladi?" },
];

const suggestedQuestions = [
  "HTML form elementlari qaysilar?",
  "CSS animatsiya qanday yoziladi?",
  "JavaScript Promise nima?",
  "React Component lifecycle tushuntir",
  "SQL va NoSQL farqi nima?",
  "Git clone, pull, push farqi?",
  "REST API nima?",
  "Ingliz tilida past simple ishlatish",
];

const SYSTEM_PROMPT = `Sen "EduZone" online ta'lim platformasining AI o'qituvchisisans. Sening vazifang o'quvchilarga quyidagi mavzularda yordam berish:

Dasturlash: HTML5, CSS, JavaScript, React, Firebase, Git, REST API, SQL/NoSQL
Tillar: Ingliz tili (IELTS, grammar), Rus tili, Fransuz tili

Qoidalar:
- Har doim o'zbek tilida javob ber (agar savol boshqa tilda bo'lsa, o'sha tilda javob ber)
- Javoblarni tushunarli va qisqa qil, lekin to'liq tushuntir
- Kod misollar berganingda aniq va tushunarli yoz
- Faqat ta'lim va dasturlash mavzularida gapir
- Friendly va ragbatlantiruci bo'l`;

const MessageBubble = ({ msg, darkMode }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12, gap: 8, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
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
        {msg.content}
        {msg.loading && (
          <span style={{ display: "inline-flex", gap: 3, marginLeft: 6, verticalAlign: "middle" }}>
            {[0,1,2].map((i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "dotBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
        )}
      </div>
      {isUser && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#f1f5f9", fontWeight: 700 }}>👤</div>
      )}
    </div>
  );
};

const AiTutor = ({ darkMode, showToast }) => {
  const { user: _user } = useAuth();
  const { t } = useLang();
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `${t.aiTutorWelcome}`,
  }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  const messagesAreaRef = useRef(null);
  const textareaRef     = useRef(null);

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

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      showToast && showToast(t.apiKeyMissing, "error");
      return;
    }

    setInput("");
    resetTextarea();
    setShowSugg(false);
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user",      content: userText },
      { role: "assistant", content: "", loading: true },
    ]);

    // Gemini history formati
    const history = messages
      .filter((m) => !m.loading && m.content)
      .slice(-8)
      .map((m) => ({
        role:  m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              ...history,
              { role: "user", parts: [{ text: userText }] },
            ],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Javob olishda xatolik yuz berdi.";

      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Gemini xato:", err.message);
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: `❌ Xatolik: ${err.message}` }]);
      showToast && showToast(t.aiConnectError, "error");
    }

    setLoading(false);
    textareaRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: t.aiTutorCleared }]);
    setShowSugg(true);
    resetTextarea();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
        .ai-msg-area::-webkit-scrollbar { width: 4px; }
        .ai-msg-area::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .ai-msg-area { scrollbar-width: thin; scrollbar-color: #475569 transparent; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: darkMode ? "#f1f5f9" : "#111" }}>{t.aiTutorTitle}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>{t.aiTutorOnline}</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} style={{ padding: "6px 14px", borderRadius: 10, background: "transparent", border: `1px solid ${borderColor}`, color: darkMode ? "#94a3b8" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {t.aiTutorClear}
        </button>
      </div>

      {/* Topic pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, flexShrink: 0 }}>
        {quickTopics.map((t, i) => (
          <button key={i} onClick={() => sendMessage(t.prompt)} disabled={loading}
            style={{ padding: "4px 11px", borderRadius: 20, background: darkMode ? "#1e293b" : "#f8fafc", border: `1px solid ${borderColor}`, color: darkMode ? "#94a3b8" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.color = darkMode ? "#94a3b8" : "#374151"; }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

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
            <MessageBubble msg={msg} darkMode={darkMode} />
          </div>
        ))}

        {showSugg && messages.length === 1 && (
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
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${borderColor}`, borderRadius: 14, padding: "8px 10px", flexShrink: 0 }}>
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
          placeholder={t.aiTutorPlaceholder}
          disabled={loading}
          style={{ flex: 1, border: "none", outline: "none", resize: "none", background: "transparent", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, lineHeight: 1.6, fontFamily: "inherit", minHeight: 40, maxHeight: 100, overflowY: "auto", scrollbarWidth: "none" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0, background: loading || !input.trim() ? (darkMode ? "#334155" : "#e2e8f0") : "linear-gradient(135deg, #3b82f6, #6366f1)", color: loading || !input.trim() ? "#6b7280" : "#fff", cursor: loading || !input.trim() ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.2s" }}
        >
          {loading ? "⏳" : "➤"}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", marginTop: 5, flexShrink: 0 }}>
        {t.aiTutorDisclaimer}
      </p>
    </div>
  );
};

export default AiTutor;