import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { LuHand, LuCheck, LuTrash2, LuX, LuMessageCircle, LuEye } from "react-icons/lu";

// ─── ZegoCloud credentials ─────────────────────────────────────────────────────
const ZEGO_APP_ID        = 77698519;
const ZEGO_SERVER_SECRET = "640db04ef5b4b66c82185215c289bd00";

// ─── Reaction emojis ───────────────────────────────────────────────────────────
const REACTION_EMOJIS = ["❤️", "🔥", "👍", "👏", "😂"];

// ─── In-room command types ─────────────────────────────────────────────────────
const CMD_REACTION   = "REACTION";
const CMD_RAISE_HAND = "RAISE_HAND";
const CMD_HAND_DOWN  = "HAND_DOWN";
const CMD_ACCEPT     = "ACCEPT_COHOST";
const CMD_REMOVE     = "REMOVE_COHOST";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
};

const timeAgo = (ts) => {
  if (!ts) return "";
  const d   = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)   return `${sec}s oldin`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m oldin`;
  return `${Math.floor(sec / 3600)}s oldin`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── Floating Reaction Bubble
// ═══════════════════════════════════════════════════════════════════════════════
const FloatingReaction = ({ emoji, onDone, rightOffset, riseAmount }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.style.opacity   = "0";
      el.style.transform = `translateY(-${riseAmount}px) scale(0.5)`;
    });
    const t = setTimeout(onDone, 2200);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [onDone, riseAmount]);

  return (
    <div
      ref={ref}
      style={{
        position:      "absolute",
        bottom:        80,
        right:         rightOffset,
        fontSize:      28,
        opacity:       1,
        transform:     "translateY(0) scale(1)",
        transition:    "opacity 2s ease-out, transform 2s ease-out",
        pointerEvents: "none",
        zIndex:        100,
        userSelect:    "none",
        filter:        "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
      }}
    >
      {emoji}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── Avatar component
// ═══════════════════════════════════════════════════════════════════════════════
const Avatar = ({ photo, name, size = 28, className = "", bgClass = "bg-blue-500/20 border-blue-500/30 text-blue-300" }) => (
  <div
    className={`rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden border ${bgClass} ${className}`}
    style={{ width: size, height: size, fontSize: size * 0.4 }}
  >
    {photo
      ? <img src={photo} alt="" className="w-full h-full object-cover" />
      : name?.[0]?.toUpperCase()}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ── Toast notification
// ═══════════════════════════════════════════════════════════════════════════════
const Toast = ({ show, icon, title, subtitle, color = "green" }) => {
  if (!show) return null;
  const colors = {
    green: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", text: "text-green-300", sub: "text-green-400/60" },
    red:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "text-red-300",   sub: "text-red-400/60"   },
    amber: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "text-yellow-300", sub: "text-yellow-400/60" },
  };
  const c = colors[color];
  return (
    <div
      className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
      style={{ background: c.bg, border: `1px solid ${c.border}`, backdropFilter: "blur(12px)", animation: "slideDown 0.3s ease" }}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className={`m-0 font-bold text-sm ${c.text}`}>{title}</p>
        {subtitle && <p className={`m-0 text-xs ${c.sub}`}>{subtitle}</p>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── WATCH VIEW
// ═══════════════════════════════════════════════════════════════════════════════
const WatchView = ({ live, currentUser, onBack }) => {
  const [messages,         setMessages]         = useState([]);
  const [msgInput,         setMsgInput]         = useState("");
  const [isQuestion,       setIsQuestion]       = useState(false);
  const [chatOpen,         setChatOpen]         = useState(false); // mobile: default yopiq
  const [zegoError,        setZegoError]        = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [handRaised,       setHandRaised]       = useState(false);
  const [isCohost,         setIsCohost]         = useState(false);
  const [coHostNotif,      setCoHostNotif]      = useState(false);
  const [removedNotif,     setRemovedNotif]     = useState(false);
  const [isMobile,         setIsMobile]         = useState(false);

  const zegoRef            = useRef(null);
  const zegoInst           = useRef(null);
  const chatBottom         = useRef(null);
  const presenceRegistered = useRef(false);
  const inputRef           = useRef(null);

  // ── Mobile detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop chat default ochiq
  useEffect(() => {
    if (!isMobile) setChatOpen(true);
  }, [isMobile]);

  // ── Presence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!live?.id || !currentUser) return;
    const presenceRef = doc(db, "liveLessons", live.id, "viewers", currentUser.uid);
    setDoc(presenceRef, {
      uid:      currentUser.uid,
      name:     currentUser.displayName || "Tomoshabin",
      joinedAt: serverTimestamp(),
    }).then(() => { presenceRegistered.current = true; }).catch(() => {});
    return () => {
      if (presenceRegistered.current) {
        deleteDoc(presenceRef).catch(() => {});
        presenceRegistered.current = false;
      }
    };
  }, [live?.id, currentUser]);

  // ── Viewer count ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!live?.id) return;
    const unsub = onSnapshot(
      collection(db, "liveLessons", live.id, "viewers"),
      (snap) => {
        updateDoc(doc(db, "liveLessons", live.id), { viewers: snap.size }).catch(() => {});
      }
    );
    return () => unsub();
  }, [live?.id]);

  // ── Realtime chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!live?.id) return;
    const q = query(
      collection(db, "liveLessons", live.id, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => chatBottom.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return () => unsub();
  }, [live?.id]);

  // ── In-room command handler ────────────────────────────────────────────────
  const handleInRoomCommand = useCallback((fromUser, command) => {
    try {
      const parsed = JSON.parse(command);
      if (parsed.type === CMD_REACTION) {
        setFloatingReactions((prev) => [
          ...prev,
          {
            id:          `r_${Date.now()}_${Math.random()}`,
            emoji:       parsed.emoji,
            rightOffset: 60 + Math.random() * 80,
            riseAmount:  80 + Math.random() * 60,
          },
        ]);
      } else if (parsed.type === CMD_ACCEPT && parsed.uid === currentUser?.uid) {
        setIsCohost(true);
        setHandRaised(false);
        setCoHostNotif(true);
        setTimeout(() => setCoHostNotif(false), 4000);
      } else if (parsed.type === CMD_REMOVE && parsed.uid === currentUser?.uid) {
        setIsCohost(false);
        setRemovedNotif(true);
        setTimeout(() => setRemovedNotif(false), 4000);
      }
    } catch (_err) {
      console.error("Command parse error:", _err);
    }
  }, [currentUser]);

  // ── Zego Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !live?.channelName) return;

    // 1-QADAM: useEffect boshlanishidayoq zegoRef.current ni o'zgaruvchiga saqlab olamiz!
    const containerRef = zegoRef.current;

    const raf = requestAnimationFrame(() => {
      // Bu yerda zegoRef.current o'rniga saqlab olingan containerRef ni ishlatamiz
      if (!containerRef) {
        setZegoError("Video konteyneri yuklanmadi. Qaytadan urinib ko'ring.");
        return;
      }
      try {
        const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID, 
          ZEGO_SERVER_SECRET,
          live.channelName,
          currentUser.uid,
          currentUser.displayName || "Tomoshabin"
        );
        
        const zc = ZegoUIKitPrebuilt.create(token);
        zegoInst.current = zc;

        zc.joinRoom({
          container: containerRef, // <--- MANA SHU YERDA HAM containerRef ISHLATILDI
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: {
              role: isCohost ? ZegoUIKitPrebuilt.Cohost : ZegoUIKitPrebuilt.Audience,
            },
          },
          showPreJoinView: false,
          showLeavingView: false,
          showRoomDetailsButton: false,
          showScreenSharingButton: false,
          showUserList: false,
          showTextChat: false,
          showRoomMessageButton: false,
          onInRoomCommandReceived: handleInRoomCommand, 
          onError: (err) => {
            console.error("Zego error:", err);
            setZegoError("Ulanishda xatolik. Sahifani yangilang.");
          },
        });
      } catch (err) {
        console.error("Init error:", err);
        setZegoError("Initsializatsiya xatosi: " + err.message);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      
      // 1. Agar Zego instansi mavjud bo'lsa, uni o'chiramiz
      if (zegoInst.current) {
        try { 
          zegoInst.current.destroy(); 
        } catch (_err) {
          console.log(_err);
        }
        zegoInst.current = null;
      }

      // 2-QADAM: Tozalash qismida zegoRef.current emas, tepada saqlangan containerRef ishlatiladi
      if (containerRef) {
        containerRef.innerHTML = "";
      }
    };
  }, [live, currentUser, handleInRoomCommand, isCohost]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!msgInput.trim() || !currentUser || !live?.id) return;
    const text       = msgInput.trim();
    const asQuestion = isQuestion;
    setMsgInput("");
    setIsQuestion(false);
    try {
      await addDoc(collection(db, "liveLessons", live.id, "messages"), {
        text,
        uid:          currentUser.uid,
        name:         currentUser.displayName || "Tomoshabin",
        avatar:       currentUser.photoURL || null,
        isInstructor: false,
        isQuestion:   asQuestion,
        answered:     false,
        createdAt:    serverTimestamp(),
      });
    } catch (err) { console.warn("Message send failed:", err); }
  }, [msgInput, isQuestion, currentUser, live]);

  // ── Delete message ────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (msgId) => {
    if (!live?.id || !currentUser) return;
    setDeletingId(msgId);
    try {
      await deleteDoc(doc(db, "liveLessons", live.id, "messages", msgId));
    } catch (err) {
      console.warn("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  }, [live?.id, currentUser]);

  // ── Send reaction ─────────────────────────────────────────────────────────
  const sendReaction = useCallback((emoji) => {
    const newR = {
      id:          `r_${Date.now()}_${Math.random()}`,
      emoji,
      rightOffset: 60 + Math.random() * 80,
      riseAmount:  80 + Math.random() * 60,
    };
    setFloatingReactions((prev) => [...prev, newR]);
    if (!zegoInst.current) return;
    try {
      const cmd = JSON.stringify({
        type:       CMD_REACTION,
        emoji,
        senderName: currentUser?.displayName || "O'quvchi",
      });
      zegoInst.current.sendInRoomCommand(cmd, []);
    } catch (err) { console.error("Reaction error:", err); }
  }, [currentUser]);

  // ── Toggle hand ───────────────────────────────────────────────────────────
  const toggleHand = useCallback(() => {
    if (!zegoInst.current || !currentUser) return;
    if (handRaised) {
      try {
        zegoInst.current.sendInRoomCommand?.(
          JSON.stringify({ type: CMD_HAND_DOWN, uid: currentUser.uid }), []
        );
      } catch (_err) {
        console.error("Hand down error:", _err);
      }
      setHandRaised(false);
    } else {
      try {
        zegoInst.current.sendInRoomCommand?.(
          JSON.stringify({ type: CMD_RAISE_HAND, uid: currentUser.uid, name: currentUser.displayName || "Tomoshabin" }), []
        );
      } catch (_err) {
        console.error("Hand up error:", _err);
      }
      setHandRaised(true);
    }
  }, [handRaised, currentUser]);

  const unreadQuestions = messages.filter((m) => m.isQuestion && !m.answered).length;

  return (
    <div className="live-watch-root">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="live-header">
        <div className="live-header-left">
          <button onClick={onBack} className="btn-back" aria-label="Orqaga">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="live-header-info">
            <div className="live-header-title-row">
              <span className="live-badge">
                <span className="live-dot"/>LIVE
              </span>
              <span className="live-title-text">{live?.title}</span>
              {isCohost && <span className="cohost-badge">🎙 CO-HOST</span>}
            </div>
            <p className="live-instructor-name">👨‍🏫 {live?.instructorName}</p>
          </div>
        </div>

        <div className="live-header-right">
          <span className="viewer-count">
            <LuEye size={14}/>
            {live?.viewers || 0}
          </span>

          {/* Mobile: chat toggle */}
          <button
            onClick={() => setChatOpen((p) => !p)}
            className={`btn-chat-toggle ${chatOpen ? "active" : ""}`}
            aria-label="Chat"
          >
            <LuMessageCircle size={16}/>
            {unreadQuestions > 0 && <span className="chat-badge">{unreadQuestions}</span>}
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div className="live-body">

        {/* ── VIDEO AREA ──────────────────────────────────────────────────── */}
        <div className="live-video-area">

          {/* Error overlay */}
          {zegoError && (
            <div className="zego-error-overlay">
              <div className="text-4xl">📡</div>
              <p className="zego-error-text">{zegoError}</p>
              <button onClick={() => window.location.reload()} className="btn-retry">
                Qayta urinish
              </button>
            </div>
          )}

          {/* Zego container */}
          <div ref={zegoRef} className="zego-container"/>

          {/* Floating reactions */}
          <div className="reactions-layer">
            {floatingReactions.map((r) => (
              <FloatingReaction
                key={r.id}
                emoji={r.emoji}
                rightOffset={r.rightOffset}
                riseAmount={r.riseAmount}
                onDone={() => setFloatingReactions((prev) => prev.filter((x) => x.id !== r.id))}
              />
            ))}
          </div>

          {/* Hand raised indicator */}
          {handRaised && (
            <div className="hand-indicator">
              <span className="hand-wave">🖐️</span>
              <span>Qo'lingiz ko'tarilgan — o'qituvchi javob beradi</span>
            </div>
          )}

          {/* Toasts */}
          <Toast show={coHostNotif}  icon="🎙️" color="green" title="Sahnaga qo'shildingiz!" subtitle="Kamera va mikrofoniz yoqildi"/>
          <Toast show={removedNotif} icon="👋" color="red"   title="Sahna tugadi"/>

          {/* ── REACTION + RAISE HAND BAR ── */}
          <div className="reaction-bar">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="btn-emoji"
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
            <div className="reaction-divider"/>
            <button
              onClick={toggleHand}
              className={`btn-hand ${handRaised ? "raised" : ""}`}
              title={handRaised ? "Qo'lni tushirish" : "Qo'l ko'tarish (sahna so'rash)"}
            >
              <LuHand size={15} className={handRaised ? "hand-anim" : ""}/>
              <span className="hand-label">{handRaised ? "Tushirish" : "So'rash"}</span>
            </button>
          </div>
        </div>

        {/* ── CHAT PANEL ──────────────────────────────────────────────────── */}
        <div className={`live-chat-panel ${chatOpen ? "open" : ""}`}>

          {/* Chat header */}
          <div className="chat-header">
            <span className="chat-header-title">
              💬 Jonli Chat
            </span>
            <div className="chat-header-right">
              {unreadQuestions > 0 && (
                <span className="question-count-badge">
                  ❓ {unreadQuestions} savol
                </span>
              )}
              {/* Mobile: close button */}
              <button
                onClick={() => setChatOpen(false)}
                className="btn-close-chat"
                aria-label="Yopish"
              >
                <LuX size={14}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">💬</div>
                <p>Birinchi xabarni yozing!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isOwn = m.uid === currentUser?.uid;
                return (
                  <div
                    key={m.id}
                    className={`chat-message ${m.isQuestion && !m.answered ? "question-msg" : ""} ${m.isQuestion && m.answered ? "answered-msg" : ""}`}
                  >
                    <Avatar
                      photo={m.avatar}
                      name={m.name}
                      size={28}
                      bgClass={
                        m.isInstructor
                          ? "bg-red-500/30 border-red-500/50 text-red-300"
                          : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                      }
                    />

                    <div className="chat-msg-content">
                      <div className="chat-msg-meta">
                        <span className={`chat-msg-name ${m.isInstructor ? "instructor" : isOwn ? "own" : "other"}`}>
                          {m.name}
                          {isOwn && <span className="you-label">(siz)</span>}
                        </span>
                        {m.isInstructor && <span className="badge-host">HOST</span>}
                        {m.isQuestion && !m.answered && <span className="badge-question">❓ SAVOL</span>}
                        {m.isQuestion && m.answered && (
                          <span className="badge-answered">
                            <LuCheck size={8}/> Javob
                          </span>
                        )}
                        <span className="chat-msg-time">{formatTime(m.createdAt)}</span>
                      </div>
                      <p className="chat-msg-text">{m.text}</p>
                    </div>

                    {isOwn && (
                      <button
                        onClick={() => deleteMessage(m.id)}
                        disabled={deletingId === m.id}
                        className="btn-delete-msg"
                        title="Xabarni o'chirish"
                        aria-label="O'chirish"
                      >
                        {deletingId === m.id
                          ? <span className="spin-sm"/>
                          : <LuTrash2 size={11}/>}
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatBottom}/>
          </div>

          {/* Chat input */}
          <div className="chat-input-area">
            <button
              onClick={() => setIsQuestion((p) => !p)}
              className={`btn-question-mode ${isQuestion ? "active" : ""}`}
            >
              {isQuestion ? "❓ Savol rejimi" : "Savol yuborish"}
            </button>
            <div className="chat-input-row">
              <input
                ref={inputRef}
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={isQuestion ? "Savolingizni yozing..." : "Xabar yozing..."}
                className={`chat-input ${isQuestion ? "question-mode" : ""}`}
              />
              <button
                onClick={sendMessage}
                disabled={!msgInput.trim()}
                className="btn-send"
                aria-label="Yuborish"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: chat overlay backdrop */}
        {isMobile && chatOpen && (
          <div className="chat-backdrop" onClick={() => setChatOpen(false)}/>
        )}
      </div>

      <style>{`
        /* ── ROOT ─────────────────────────────────────────────────────────── */
        :root { --navbar-h: 60px; }
        .live-watch-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          bottom: var(--navbar-h);
          z-index: 50;
          background: #060a14;
          display: flex; flex-direction: column;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #fff;
          overflow: hidden;
        }
        @media (min-width: 768px) { .live-watch-root { bottom: 0; } }

        /* ── HEADER ─────────────────────────────────────────────────────── */
        .live-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(10,16,32,0.97);
          backdrop-filter: blur(12px);
          flex-shrink: 0; min-height: 50px; gap: 6px;
        }
        @media (min-width: 768px) { .live-header { padding: 10px 16px; min-height: 56px; } }
        .live-header-left {
          display: flex; align-items: center; gap: 8px;
          flex: 1; min-width: 0; overflow: hidden;
        }
        .live-header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .btn-back {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6); cursor: pointer; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-back:active { background: rgba(255,255,255,0.18); transform: scale(0.93); }
        .live-header-info { flex: 1; min-width: 0; overflow: hidden; }
        .live-header-title-row { display: flex; align-items: center; gap: 5px; overflow: hidden; }
        .live-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4);
          color: #f87171; font-size: 9px; font-weight: 800;
          padding: 2px 7px; border-radius: 999px;
          animation: pulse-badge 2s ease infinite; flex-shrink: 0;
        }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #f87171; }
        .live-title-text {
          font-size: 12px; font-weight: 600; color: #fff;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          flex: 1; min-width: 0;
        }
        @media (min-width: 480px) { .live-title-text { font-size: 13px; } }
        .cohost-badge {
          font-size: 9px; font-weight: 800; background: rgba(16,185,129,0.2); color: #6ee7b7;
          padding: 2px 6px; border-radius: 999px; border: 1px solid rgba(16,185,129,0.35); flex-shrink: 0;
        }
        .live-instructor-name {
          margin: 1px 0 0; font-size: 10px; color: rgba(255,255,255,0.38);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .viewer-count {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: rgba(255,255,255,0.4); flex-shrink: 0;
        }
        @media (max-width: 360px) { .viewer-count { display: none; } }
        .btn-chat-toggle {
          position: relative; width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); cursor: pointer;
          -webkit-tap-highlight-color: transparent; flex-shrink: 0;
        }
        .btn-chat-toggle.active { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.4); color: #60a5fa; }
        .btn-chat-toggle:active { transform: scale(0.91); }
        .chat-badge {
          position: absolute; top: -4px; right: -4px;
          background: #f59e0b; color: #000; font-size: 9px; font-weight: 900;
          min-width: 16px; height: 16px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
        }

        /* ── BODY ─────────────────────────────────────────────────────────── */
        .live-body {
          flex: 1; display: flex; overflow: hidden; position: relative; min-height: 0;
        }

        /* ── VIDEO AREA ───────────────────────────────────────────────────── */
        .live-video-area {
          flex: 1; position: relative; min-height: 0; min-width: 0;
          background: #030609; overflow: hidden;
        }
        .zego-container {
          width: 100% !important; height: 100% !important;
          position: relative; overflow: hidden;
        }
        /* Zego ichki barcha elementlari to'liq joy olsin */
        .zego-container > * {
          width: 100% !important; height: 100% !important;
        }
        .zego-error-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 14px; background: #060a14;
        }
        .zego-error-text {
          color: rgba(255,255,255,0.45); font-size: 14px; text-align: center;
          max-width: 280px; line-height: 1.5;
        }
        .btn-retry {
          padding: 8px 20px; border-radius: 10px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65); font-size: 13px; cursor: pointer;
          transition: background 0.2s;
        }
        .btn-retry:hover { background: rgba(255,255,255,0.14); }

        .reactions-layer {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }

        /* ── HAND INDICATOR ──────────────────────────────────────────────── */
        .hand-indicator {
          position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
          z-index: 40;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4);
          backdrop-filter: blur(8px);
          color: #fbbf24; font-size: 11px; font-weight: 700;
          white-space: nowrap; max-width: calc(100vw - 24px);
          overflow: hidden; text-overflow: ellipsis;
        }
        .hand-wave { animation: wave 0.6s ease infinite alternate; display: inline-block; flex-shrink: 0; }

        /* ── REACTION BAR ─────────────────────────────────────────────────── */
        .reaction-bar {
          position: absolute;
          bottom: 14px;
          left: 50%; transform: translateX(-50%);
          z-index: 40;
          display: flex; align-items: center; gap: 1px;
          background: rgba(0,0,0,0.78); backdrop-filter: blur(12px);
          padding: 5px 7px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          max-width: calc(100vw - 12px);
          box-sizing: border-box;
        }
        @media (min-width: 480px) { .reaction-bar { gap: 3px; padding: 6px 10px; bottom: 16px; } }
        .btn-emoji {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; cursor: pointer;
          background: transparent; border: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; flex-shrink: 0;
        }
        @media (min-width: 480px) { .btn-emoji { width: 36px; height: 36px; font-size: 18px; } }
        .btn-emoji:active { transform: scale(0.82); }
        .reaction-divider {
          width: 1px; height: 18px; background: rgba(255,255,255,0.15);
          margin: 0 2px; flex-shrink: 0;
        }
        .btn-hand {
          display: flex; align-items: center; gap: 4px;
          padding: 0 9px; height: 30px; border-radius: 999px;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.12);
          font-size: 11px; font-weight: 700;
          background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation; flex-shrink: 0; white-space: nowrap;
        }
        @media (min-width: 480px) { .btn-hand { padding: 0 12px; height: 36px; font-size: 12px; gap: 6px; } }
        .btn-hand.raised { background: rgba(245,158,11,0.22); border-color: rgba(245,158,11,0.6); color: #f59e0b; }
        .btn-hand:active { transform: scale(0.93); }
        .hand-label { display: none; }
        @media (min-width: 360px) { .hand-label { display: inline; } }
        .hand-anim { animation: wave 0.6s ease infinite alternate; }

        /* ── CHAT PANEL ───────────────────────────────────────────────────── */
        /* Desktop */
        .live-chat-panel {
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(255,255,255,0.08);
          background: #0a1020;
          width: 0; overflow: hidden;
          transition: width 0.3s ease;
          flex-shrink: 0;
        }
        .live-chat-panel.open {
          width: 300px;
        }
        @media (min-width: 1024px) {
          .live-chat-panel.open { width: 340px; }
        }

        /* Mobile: slide up, stops above navbar */
        @media (max-width: 767px) {
          .live-chat-panel {
            position: fixed;
            bottom: var(--navbar-h);
            left: 0; right: 0;
            width: 100% !important;
            height: 0;
            max-height: calc(100dvh - var(--navbar-h) - 50px);
            border-left: none; border-top: 1px solid rgba(255,255,255,0.12);
            border-radius: 20px 20px 0 0;
            z-index: 60; overflow: hidden;
            transition: height 0.35s cubic-bezier(0.32, 0.72, 0, 1);
          }
          .live-chat-panel.open {
            height: calc(100dvh - var(--navbar-h) - 50px);
          }
        }
        .chat-backdrop { display: none; }
        @media (max-width: 767px) {
          .chat-backdrop {
            display: block;
            position: fixed; top: 0; left: 0; right: 0;
            bottom: var(--navbar-h);
            z-index: 55;
            background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
          }
        }

        /* Chat header */
        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .chat-header-title {
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.65);
        }
        .chat-header-right {
          display: flex; align-items: center; gap: 8px;
        }
        .question-count-badge {
          font-size: 10px; font-weight: 800;
          background: rgba(245,158,11,0.2); color: #fbbf24;
          padding: 2px 8px; border-radius: 999px;
          border: 1px solid rgba(245,158,11,0.35);
        }
        .btn-close-chat {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: all 0.2s;
        }
        .btn-close-chat:hover { background: rgba(255,255,255,0.12); color: #fff; }
        /* Desktop: hide close button */
        @media (min-width: 768px) { .btn-close-chat { display: none; } }

        /* Messages */
        .chat-messages {
          flex: 1; overflow-y: auto; padding: 12px 14px;
          display: flex; flex-direction: column; gap: 10px;
          scroll-behavior: smooth;
        }
        .chat-messages::-webkit-scrollbar { width: 3px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .chat-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 48px 0; color: rgba(255,255,255,0.25);
          font-size: 12px; gap: 8px;
        }
        .chat-empty-icon { font-size: 28px; }

        .chat-message {
          display: flex; align-items: flex-start; gap: 8px;
          position: relative;
        }
        .chat-message:hover .btn-delete-msg { opacity: 1; }

        .question-msg {
          padding: 10px; border-radius: 12px;
          background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.22);
        }
        .answered-msg { opacity: 0.4; transition: opacity 0.5s; }

        .chat-msg-content { flex: 1; min-width: 0; }
        .chat-msg-meta {
          display: flex; align-items: center; gap: 4px;
          margin-bottom: 3px; flex-wrap: wrap;
        }
        .chat-msg-name {
          font-size: 11px; font-weight: 700;
        }
        .chat-msg-name.instructor { color: #f87171; }
        .chat-msg-name.own        { color: #34d399; }
        .chat-msg-name.other      { color: #60a5fa; }
        .you-label { font-size: 9px; color: rgba(255,255,255,0.3); font-weight: 400; margin-left: 3px; }

        .badge-host {
          font-size: 9px; font-weight: 800;
          background: rgba(239,68,68,0.18); color: #f87171;
          padding: 1px 6px; border-radius: 999px; border: 1px solid rgba(239,68,68,0.3);
        }
        .badge-question {
          font-size: 9px; font-weight: 800;
          background: rgba(245,158,11,0.18); color: #fbbf24;
          padding: 1px 6px; border-radius: 999px; border: 1px solid rgba(245,158,11,0.3);
        }
        .badge-answered {
          font-size: 9px; font-weight: 800;
          background: rgba(16,185,129,0.18); color: #6ee7b7;
          padding: 1px 6px; border-radius: 999px; border: 1px solid rgba(16,185,129,0.3);
          display: flex; align-items: center; gap: 2px;
        }
        .chat-msg-time {
          font-size: 10px; color: rgba(255,255,255,0.2);
          margin-left: auto; opacity: 0; transition: opacity 0.2s;
        }
        .chat-message:hover .chat-msg-time { opacity: 1; }

        .chat-msg-text {
          margin: 0; font-size: 13px; color: rgba(255,255,255,0.82);
          line-height: 1.5; word-break: break-word;
        }

        .btn-delete-msg {
          flex-shrink: 0; width: 24px; height: 24px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s, background 0.2s;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          color: rgba(239,68,68,0.7); cursor: pointer;
          align-self: center;
        }
        .btn-delete-msg:hover:not(:disabled) { background: rgba(239,68,68,0.22); color: #ef4444; }
        .btn-delete-msg:disabled { cursor: not-allowed; }
        /* Mobile: always show */
        @media (max-width: 767px) { .btn-delete-msg { opacity: 1; } }

        .spin-sm {
          width: 10px; height: 10px; border-radius: 50%;
          border: 1.5px solid rgba(239,68,68,0.5); border-top-color: transparent;
          display: inline-block; animation: spin 0.7s linear infinite;
        }

        /* Chat input */
        .chat-input-area {
          padding: 10px 12px 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0; background: #0a1020;
        }
        .btn-question-mode {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          font-size: 11px; font-weight: 700; cursor: pointer;
          margin-bottom: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.35);
          transition: all 0.2s;
        }
        .btn-question-mode.active {
          background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.4); color: #f59e0b;
        }
        .chat-input-row { display: flex; gap: 8px; align-items: center; }
        .chat-input {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; color: #fff; outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.25); }
        .chat-input:focus { border-color: rgba(59,130,246,0.5); }
        .chat-input.question-mode { border-color: rgba(245,158,11,0.4); }
        .chat-input.question-mode:focus { border-color: rgba(245,158,11,0.7); }

        .btn-send {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: #3b82f6; border: none; color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-send:hover:not(:disabled) { background: #60a5fa; }
        .btn-send:active:not(:disabled) { transform: scale(0.93); }
        .btn-send:disabled { background: rgba(255,255,255,0.08); cursor: not-allowed; }

        /* ── ANIMATIONS ─────────────────────────────────────────────────── */
        @keyframes wave {
          from { transform: rotate(-15deg); }
          to   { transform: rotate(15deg);  }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to   { opacity: 1; transform: translate(-50%, 0);      }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-badge {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.65; }
        }

        /* ── Zego barcha ichki UI yashirish ──────────────────────────────── */
        /* Chat */
        .zego-room-message-list, .zego-chat-message-list,
        [class*="ZegoRoomMessage"], [class*="ZegoChat"],
        [class*="zego-im"], [class*="RoomMessage"],
        [class*="MessageList"], .zego-uikit-room-message,
        /* Toolbar / footer / header */
        [class*="ZegoFooter"], [class*="zego-footer"],
        [class*="ZegoToolbar"], [class*="zego-toolbar"],
        [class*="ZegoBottomBar"], [class*="zego-bottom-bar"],
        [class*="ZegoTopBar"], [class*="zego-top-bar"],
        [class*="ZegoHeader"], [class*="zego-header"],
        /* Live / member buttons */
        [class*="ZegoLive"], [class*="zego-live"],
        [class*="LiveButton"], [class*="liveButton"],
        [class*="MemberButton"], [class*="memberButton"],
        [class*="ZegoMember"], [class*="zego-member"],
        /* Any overlay controls */
        [class*="ZegoUIKit"] > div:not([class*="Video"]):not([class*="video"]):not([class*="Stream"]):not([class*="stream"]) { display: none !important; }

        /* Video stream o'zi to'liq joy olsin */
        .zego-container [class*="Video"],
        .zego-container [class*="video"],
        .zego-container [class*="Stream"],
        .zego-container [class*="stream"] {
          width: 100% !important; height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── LIVE CARD
// ═══════════════════════════════════════════════════════════════════════════════
const LiveCard = ({ live, onWatch }) => (
  <div
    onClick={() => onWatch(live)}
    className="lc-card"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onWatch(live)}
    aria-label={`${live.title} - Jonli efir`}
  >
    <div className="lc-thumb">
      <div className="lc-thumb-bg"/>
      <Avatar
        photo={live.instructorPhoto}
        name={live.instructorName}
        size={52}
        bgClass="bg-red-500/20 border-red-500/40 text-red-300"
        className="lc-avatar"
      />
      <span className="lc-live-pill">
        <span className="lc-live-dot"/>LIVE
      </span>
      <span className="lc-viewer-pill">
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        {live.viewers || 0}
      </span>
      <div className="lc-play-overlay">
        <div className="lc-play-btn">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </div>
    </div>
    <div className="lc-body">
      <h3 className="lc-title">{live.title}</h3>
      <div className="lc-meta">
        <Avatar photo={live.instructorPhoto} name={live.instructorName} size={18} bgClass="bg-white/10 border-white/10 text-white/60"/>
        <span className="lc-instructor">{live.instructorName}</span>
        <span className="lc-time">{timeAgo(live.startedAt)}</span>
      </div>
      <button className="lc-join-btn" tabIndex={-1}>
        <span className="lc-join-dot"/>
        Efirga Qo'shilish
      </button>
    </div>

    <style>{`
      .lc-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 18px; overflow: hidden;
        cursor: pointer; outline: none;
        transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .lc-card:hover {
        border-color: rgba(239,68,68,0.35);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(239,68,68,0.08);
      }
      .lc-card:active { transform: scale(0.97); border-color: rgba(239,68,68,0.4); }
      .lc-card:focus-visible { box-shadow: 0 0 0 2px rgba(239,68,68,0.5); }

      .lc-thumb {
        position: relative; height: 140px;
        background: linear-gradient(135deg, rgba(127,29,29,0.35) 0%, #0f172a 60%, rgba(88,28,135,0.2) 100%);
        display: flex; align-items: center; justify-content: center; overflow: hidden;
      }
      .lc-thumb-bg {
        position: absolute; inset: 0; opacity: 0.18;
        background-image: radial-gradient(circle, rgba(239,68,68,0.5) 1px, transparent 1px);
        background-size: 22px 22px;
      }
      .lc-avatar { position: relative; z-index: 1; }
      .lc-live-pill {
        position: absolute; top: 10px; left: 10px;
        display: flex; align-items: center; gap: 5px;
        background: rgba(239,68,68,0.9); color: #fff;
        font-size: 10px; font-weight: 900; padding: 3px 10px; border-radius: 999px;
      }
      .lc-live-dot {
        width: 6px; height: 6px; border-radius: 50%; background: #fff;
        animation: pulse-badge 1.5s ease infinite;
      }
      .lc-viewer-pill {
        position: absolute; top: 10px; right: 10px;
        display: flex; align-items: center; gap: 4px;
        background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.8);
        font-size: 10px; padding: 3px 8px; border-radius: 999px;
        backdrop-filter: blur(4px);
      }
      .lc-play-overlay {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0); transition: background 0.25s;
      }
      .lc-card:hover .lc-play-overlay { background: rgba(0,0,0,0.28); }
      .lc-play-btn {
        width: 44px; height: 44px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0);
        display: flex; align-items: center; justify-content: center;
        color: rgba(255,255,255,0);
        transition: all 0.25s; transform: scale(0.6);
      }
      .lc-card:hover .lc-play-btn {
        border-color: rgba(255,255,255,0.5); color: #fff;
        background: rgba(255,255,255,0.15); transform: scale(1);
      }

      .lc-body { padding: 14px 14px 0; }
      .lc-title {
        color: #fff; font-size: 13px; font-weight: 700;
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
        overflow: hidden; line-height: 1.4; margin: 0 0 10px;
      }
      .lc-meta {
        display: flex; align-items: center; gap: 7px; margin-bottom: 12px; flex-wrap: wrap;
      }
      .lc-instructor { font-size: 11px; color: rgba(255,255,255,0.45); }
      .lc-time { font-size: 11px; color: rgba(255,255,255,0.25); margin-left: auto; }
      .lc-join-btn {
        width: 100%; padding: 10px; border-radius: 12px; margin-bottom: 14px;
        background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
        color: #f87171; font-size: 12px; font-weight: 800;
        display: flex; align-items: center; justify-content: center; gap: 6px;
        transition: all 0.2s; cursor: pointer;
      }
      .lc-card:hover .lc-join-btn { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.5); }
      .lc-join-dot {
        width: 6px; height: 6px; border-radius: 50%; background: #f87171;
        animation: pulse-badge 1.5s ease infinite;
      }
    `}</style>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ── ENDED CARD
// ═══════════════════════════════════════════════════════════════════════════════
const EndedCard = ({ live }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "11px 12px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
  }}>
    <Avatar photo={live.instructorPhoto} name={live.instructorName} size={38} bgClass="bg-white/10 border-white/10 text-white/40"/>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 13, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {live.title}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{live.instructorName}</span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>·</span>
        <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{timeAgo(live.startedAt)}</span>
        {live.viewers > 0 && <>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{live.viewers} tomoshabin</span>
        </>}
      </div>
    </div>
    <span style={{
      fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.35)", padding: "3px 8px", borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap", flexShrink: 0,
    }}>Yakunlandi</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ── ASOSIY SAHIFA
// ═══════════════════════════════════════════════════════════════════════════════
const LiveInstructor = () => {
  const [currentUser]  = useAuthState(auth);
  const [liveLessons,  setLiveLessons]  = useState([]);
  const [endedLessons, setEndedLessons] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("live");
  const [watching,     setWatching]     = useState(null);

  useEffect(() => {
    const qLive = query(collection(db, "liveLessons"), where("status", "==", "live"));
    const unsubLive = onSnapshot(qLive, (snap) => {
      setLiveLessons(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0))
      );
      setLoading(false);
    });

    const qEnded = query(collection(db, "liveLessons"), where("status", "==", "ended"));
    const unsubEnded = onSnapshot(qEnded, (snap) => {
      setEndedLessons(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0))
          .slice(0, 20)
      );
    });

    return () => { unsubLive(); unsubEnded(); };
  }, []);

  const handleWatch = useCallback((live) => setWatching(live), []);
  const handleBack  = useCallback(() => setWatching(null), []);

  if (watching) {
    return <WatchView live={watching} currentUser={currentUser} onBack={handleBack}/>;
  }

  const TABS = [
    { id: "live",  label: "🔴 Hozir Live",     count: liveLessons.length  },
    { id: "ended", label: "📼 O'tgan Efirlar",  count: endedLessons.length },
  ];

  return (
    <div className="li-page">

      <div className="li-glow"/>

      <div className="li-container">

        {/* ── Page header ── */}
        <div className="li-page-header">
          <div className="li-header-top">
            <span className="li-live-tag">
              <span className="li-live-tag-dot"/>Jonli Efirlar
            </span>
            {liveLessons.length > 0 && (
              <span className="li-count-tag">{liveLessons.length} ta faol</span>
            )}
          </div>
          <h1 className="li-heading">Live Darslar</h1>
          <p className="li-subtext">O'qituvchilar tomonidan o'tkazilayotgan jonli darslarni tomosha qiling</p>
        </div>

        {/* ── Tabs ── */}
        <div className="li-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`li-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`li-tab-count ${activeTab === tab.id ? "active" : ""}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Live tab ── */}
        {activeTab === "live" && (
          loading ? (
            <div className="li-loading">
              <div className="li-spinner"/>
            </div>
          ) : liveLessons.length === 0 ? (
            <div className="li-empty">
              <div className="li-empty-icon">📡</div>
              <h3 className="li-empty-title">Hozircha faol efir yo'q</h3>
              <p className="li-empty-text">O'qituvchilar live dars boshlashsa, bu yerda ko'rinadi. Keyinroq qaytib keling!</p>
            </div>
          ) : (
            <div className="li-grid">
              {liveLessons.map((live) => (
                <LiveCard key={live.id} live={live} onWatch={handleWatch}/>
              ))}
            </div>
          )
        )}

        {/* ── Ended tab ── */}
        {activeTab === "ended" && (
          endedLessons.length === 0 ? (
            <div className="li-empty">
              <div className="li-empty-icon">📼</div>
              <h3 className="li-empty-title">O'tgan efirlar yo'q</h3>
              <p className="li-empty-text">Hali birorta efir yakunlanmagan</p>
            </div>
          ) : (
            <div className="li-ended-list">
              {endedLessons.map((live) => <EndedCard key={live.id} live={live}/>)}
            </div>
          )
        )}
      </div>

      <style>{`
        .li-page {
          min-height: 100vh;
          background: transparent;
          color: #fff;
          position: relative;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .li-glow {
          position: fixed; top: 0; left: 50%; transform: translateX(-50%);
          width: min(600px, 100vw); height: 280px;
          background: radial-gradient(ellipse, rgba(239,68,68,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .li-container {
          position: relative; z-index: 1;
          max-width: 1080px; margin: 0 auto;
          padding: 32px 16px 60px;
        }
        @media (min-width: 640px) { .li-container { padding: 40px 24px 80px; } }

        .li-page-header { margin-bottom: 32px; }
        .li-header-top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .li-live-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(239,68,68,0.18); border: 1px solid rgba(239,68,68,0.3);
          color: #f87171; font-size: 11px; font-weight: 800;
          padding: 4px 12px; border-radius: 999px;
        }
        .li-live-tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #f87171;
          animation: pulse-badge 1.5s ease infinite;
        }
        .li-count-tag {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55);
          font-size: 11px; font-weight: 800;
          padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1);
        }
        .li-heading { font-size: clamp(22px, 5vw, 32px); font-weight: 800; color: #fff; margin: 0 0 8px; }
        .li-subtext { color: rgba(255,255,255,0.38); font-size: 14px; margin: 0; line-height: 1.5; }

        /* Tabs */
        .li-tabs { display: flex; gap: 6px; margin-bottom: 28px; flex-wrap: wrap; }
        .li-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 12px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.38);
          transition: all 0.2s; -webkit-tap-highlight-color: transparent;
        }
        .li-tab:hover { color: rgba(255,255,255,0.65); border-color: rgba(255,255,255,0.18); }
        .li-tab.active { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #fff; }
        .li-tab:active { transform: scale(0.97); }
        .li-tab-count {
          font-size: 10px; font-weight: 900; padding: 1px 7px; border-radius: 999px;
          background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.38);
        }
        .li-tab-count.active { background: rgba(255,255,255,0.2); color: #fff; }

        /* States */
        .li-loading {
          display: flex; align-items: center; justify-content: center; padding: 80px 0;
        }
        .li-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2.5px solid rgba(239,68,68,0.3); border-top-color: #ef4444;
          animation: spin 0.75s linear infinite;
        }
        .li-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center; padding: 80px 20px;
        }
        .li-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 18px;
        }
        .li-empty-title { color: rgba(255,255,255,0.55); font-size: 17px; font-weight: 700; margin: 0 0 8px; }
        .li-empty-text { color: rgba(255,255,255,0.28); font-size: 13px; max-width: 300px; line-height: 1.6; margin: 0; }

        /* Grid */
        .li-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 480px)  { .li-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .li-grid { grid-template-columns: repeat(3, 1fr); } }

        .li-ended-list { display: flex; flex-direction: column; gap: 10px; }

        @keyframes pulse-badge {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LiveInstructor;