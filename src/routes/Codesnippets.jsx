import React, { useState, useEffect, useRef } from "react";
import { useLang } from "../context/useLang";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  LuCode,
  LuPlus,
  LuTrash2,
  LuCopy,
  LuCheck,
  LuX,
  LuChevronDown,
  LuChevronUp,
  LuSave,
} from "react-icons/lu";

// в”Ђв”Ђв”Ђ CodeSnippets Panel в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const CodeSnippets = ({ isOpen, onClose, darkMode, user, triggerRef }) => {
  const { t } = useLang();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const panelRef = useRef(null);

  const LANGUAGES = [
    "javascript", "typescript", "python", "css", "html",
    "json", "bash", "sql", "jsx", "tsx",
  ];

  // в”Ђв”Ђ Firestore real-time listener в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!user || !isOpen) return;
    setLoading(true);
    const q = query(
      collection(db, "users", user.uid, "snippets"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSnippets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user, isOpen]);

  // в”Ђв”Ђ Outside click to close в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    const handler = (e) => {
      // Panel va trigger button—™dan tashqariga bosilgandagina yopish
      if (
        panelRef.current && 
        !panelRef.current.contains(e.target) &&
        !(triggerRef?.current && triggerRef.current.contains(e.target))
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, triggerRef]);

  // в”Ђв”Ђ Save snippet в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleSave = async () => {
    if (!title.trim() || !code.trim() || !user) return;
    // LIMIT TEKSHIRISH:
  // Bu yerda maxSnippets ni bazadan olib, snippets.length bilan solishtirish kerak
  if (snippets.length >= (user.maxSnippets || 5)) {
    alert(t.snippetsLimit);
    return;
  }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "snippets"), {
        title: title.trim(),
        code: code.trim(),
        language,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setCode("");
      setLanguage("javascript");
      setShowForm(false);
    } catch (err) {
      console.error("Snippet saqlashda xato:", err);
    } finally {
      setSaving(false);
    }
  };

  // в”Ђв”Ђ Delete snippet в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleDelete = async (snippetId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "snippets", snippetId));
    } catch (err) {
      console.error("O'chirishda xato:", err);
    }
  };

  // в”Ђв”Ђ Copy to clipboard в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleCopy = (snippetId, codeText) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (!isOpen) return null;

  // в”Ђв”Ђ Styles в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const glass = {
    background: darkMode
      ? "rgba(10, 15, 30, 0.88)"
      : "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: darkMode
      ? "1px solid rgba(99,102,241,0.3)"
      : "1px solid rgba(148,163,184,0.35)",
    boxShadow: darkMode
      ? "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)"
      : "0 20px 60px rgba(0,0,0,0.15)",
  };

  const textPrimary = darkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = darkMode ? "#94a3b8" : "#64748b";
  const inputBg = darkMode ? "rgba(30,41,59,0.7)" : "rgba(241,245,249,0.8)";
  const inputBorder = darkMode ? "rgba(99,102,241,0.25)" : "rgba(148,163,184,0.4)";

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        width: "360px",
        maxHeight: "calc(100vh - 100px)",
        borderRadius: "1.25rem",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: "auto",
        ...glass,
      }}
    >
      {/* в”Ђв”Ђ Header в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: darkMode
            ? "1px solid rgba(99,102,241,0.2)"
            : "1px solid rgba(148,163,184,0.2)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LuCode style={{ color: "#6366f1", fontSize: 18 }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: textPrimary, letterSpacing: "0.01em" }}>
            {t.snippetsTitle}
          </span>
          <span
            style={{
              background: "rgba(99,102,241,0.2)",
              color: "#818cf8",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            {snippets.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setShowForm((s) => !s)}
            title={t.snippetNew}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: showForm ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#818cf8",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <LuPlus style={{ fontSize: 16 }} />
          </button>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <LuX style={{ fontSize: 15 }} />
          </button>
        </div>
      </div>

      {/* в”Ђв”Ђ Add Form в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      {showForm && (
        <div
          style={{
            padding: "12px 14px",
            borderBottom: darkMode
              ? "1px solid rgba(99,102,241,0.15)"
              : "1px solid rgba(148,163,184,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Title input */}
          <input
            type="text"
            placeholder={t.snippetPlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12,
              color: textPrimary,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          {/* Language select */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: "7px 12px",
              fontSize: 12,
              color: textSecondary,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* Code textarea */}
          <textarea
            placeholder={t.snippetCodePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={5}
            style={{
              background: darkMode ? "rgba(0,0,0,0.4)" : "rgba(15,23,42,0.06)",
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 11.5,
              color: darkMode ? "#a5f3fc" : "#0369a1",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              resize: "vertical",
              lineHeight: 1.6,
            }}
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !code.trim()}
            style={{
              background:
                saving || !title.trim() || !code.trim()
                  ? "rgba(99,102,241,0.2)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: 10,
              padding: "9px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: saving || !title.trim() || !code.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.2s",
              opacity: saving || !title.trim() || !code.trim() ? 0.5 : 1,
            }}
          >
            <LuSave style={{ fontSize: 14 }} />
            {saving ? t.snippetSaving : t.snippetSave}
          </button>
        </div>
      )}

      {/* в”Ђв”Ђ Snippets List в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {!user ? (
          <div style={{ textAlign: "center", padding: "30px 16px", color: textSecondary, fontSize: 13 }}>
            {t.snippetLogin}
          </div>
        ) : loading ? (
          <div style={{ padding: 20, textAlign: "center", color: textSecondary, fontSize: 12 }}>
            {t.snippetLoading}
          </div>
        ) : snippets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 16px" }}>
            <LuCode style={{ fontSize: 32, color: "rgba(99,102,241,0.4)", margin: "0 auto 10px" }} />
            <p style={{ color: textSecondary, fontSize: 12, lineHeight: 1.6 }}>
              {t.snippetEmpty} <br />
              <button
                onClick={() => setShowForm(true)}
                style={{
                  fontSize: 12,
                  color: "#6366f1",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {t.snippetAddFirst}
              </button>
            </p>
          </div>
        ) : (
          snippets.map((snippet) => {
            const isExpanded = expandedId === snippet.id;
            return (
              <div
                key={snippet.id}
                style={{
                  background: darkMode ? "rgba(30,41,59,0.55)" : "rgba(241,245,249,0.7)",
                  border: darkMode
                    ? "1px solid rgba(99,102,241,0.18)"
                    : "1px solid rgba(148,163,184,0.3)",
                  borderRadius: 12,
                  marginBottom: 8,
                  overflow: "hidden",
                  transition: "all 0.2s",
                }}
              >
                {/* Snippet header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : snippet.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span
                      style={{
                        background: "rgba(99,102,241,0.18)",
                        color: "#818cf8",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {snippet.language || t.snippetCode}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {snippet.title}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 6 }}>
                    {/* Copy button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(snippet.id, snippet.code);
                      }}
                      title={t.snippetCopy}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          copiedId === snippet.id
                            ? "rgba(34,197,94,0.2)"
                            : "rgba(99,102,241,0.12)",
                        border: `1px solid ${
                          copiedId === snippet.id
                            ? "rgba(34,197,94,0.4)"
                            : "rgba(99,102,241,0.2)"
                        }`,
                        color: copiedId === snippet.id ? "#4ade80" : "#818cf8",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {copiedId === snippet.id ? (
                        <LuCheck style={{ fontSize: 12 }} />
                      ) : (
                        <LuCopy style={{ fontSize: 12 }} />
                      )}
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(snippet.id);
                      }}
                      title={t.snippetDelete}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "#f87171",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <LuTrash2 style={{ fontSize: 12 }} />
                    </button>
                    {/* Expand toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : snippet.id);
                      }}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: darkMode ? "rgba(51,65,85,0.6)" : "rgba(203,213,225,0.5)",
                        border: "1px solid transparent",
                        color: textSecondary,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {isExpanded ? (
                        <LuChevronUp style={{ fontSize: 13 }} />
                      ) : (
                        <LuChevronDown style={{ fontSize: 13 }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded code view */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: darkMode
                        ? "1px solid rgba(99,102,241,0.15)"
                        : "1px solid rgba(148,163,184,0.2)",
                      padding: "10px 12px",
                      background: darkMode ? "rgba(0,0,0,0.35)" : "rgba(15,23,42,0.05)",
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontSize: 11,
                        lineHeight: 1.7,
                        color: darkMode ? "#a5f3fc" : "#0369a1",
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        maxHeight: 160,
                        overflowY: "auto",
                      }}
                    >
                      {snippet.code}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CodeSnippets;
