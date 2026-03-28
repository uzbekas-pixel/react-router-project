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
import { LuHand, LuCheck, LuTrash2 } from "react-icons/lu";

// ─── ZegoCloud credentials ─────────────────────────────────────────────────────
const ZEGO_APP_ID        = 77698519;
const ZEGO_SERVER_SECRET = "640db04ef5b4b66c82185215c289bd00";

// ─── Reaction emojis ───────────────────────────────────────────────────────────
const REACTION_EMOJIS = ["❤️", "🔥", "👍", "👏", "😂"];

// ─── In-room command types (must match InstructorPanel) ───────────────────────
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
    requestAnimationFrame(() => {
      el.style.opacity   = "0";
      el.style.transform = `translateY(-${riseAmount}px) scale(0.5)`;
    });
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone, riseAmount]);

  return (
    <div
      ref={ref}
      style={{
        position:      "absolute",
        bottom:        64,
        right:         rightOffset,
        fontSize:      28,
        opacity:       1,
        transform:     "translateY(0) scale(1)",
        transition:    "opacity 2s ease-out, transform 2s ease-out",
        pointerEvents: "none",
        zIndex:        100,
        userSelect:    "none",
      }}
    >
      {emoji}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── WATCH VIEW
// ═══════════════════════════════════════════════════════════════════════════════
const WatchView = ({ live, currentUser, onBack }) => {
  const [messages,   setMessages]   = useState([]);
  const [msgInput,   setMsgInput]   = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [chatOpen,   setChatOpen]   = useState(true);
  const [zegoError,  setZegoError]  = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Floating reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Raise hand
  const [handRaised,   setHandRaised]   = useState(false);
  const [isCohost,     setIsCohost]     = useState(false);
  const [coHostNotif,  setCoHostNotif]  = useState(false);
  const [removedNotif, setRemovedNotif] = useState(false);

  const zegoRef    = useRef(null);
  const zegoInst   = useRef(null);
  const chatBottom = useRef(null);
  const presenceRegistered = useRef(false);

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

  // ── Viewer count from presence ────────────────────────────────────────────
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
  // FIX 1: Reactions endi barcha foydalanuvchilarga ko'rinadi (broadcast).
  // FIX 2: Raise Hand komandasi o'qituvchiga ham yetib boradi — chunki
  //        sendInRoomCommand(cmd, []) barcha xona a'zolariga broadcast qiladi,
  //        shu jumladan o'qituvchi (Host) ham. Host tomonida
  //        onInRoomCommandReceived ishga tushadi.
 const handleInRoomCommand = useCallback((fromUser, command) => {
  try {
    // 1. ZegoCloud 2 ta parametr yuboradi: fromUser va command. 
    // Bizga aynan command (JSON string) kerak.
    const parsed = JSON.parse(command);
    console.log("Kelgan buyruq:", parsed);

    if (parsed.type === CMD_REACTION) {
      setFloatingReactions((prev) => [
        ...prev,
        {
          id: `r_${Date.now()}_${Math.random()}`,
          emoji: parsed.emoji,
          rightOffset: 60 + Math.random() * 80,
          riseAmount: 80 + Math.random() * 60,
        },
      ]);
    } 
    // 2. O'qituvchi qabul qilganini tekshirish
    else if (parsed.type === CMD_ACCEPT && parsed.uid === currentUser?.uid) {
      setIsCohost(true);
      setHandRaised(false); // <--- MANA SHU QATOR YOZUVNI O'CHIRADI
      setCoHostNotif(true);
      setTimeout(() => setCoHostNotif(false), 4000);
    } 
    // 3. O'qituvchi sahnadan chetlatganini tekshirish
    else if (parsed.type === CMD_REMOVE && parsed.uid === currentUser?.uid) {
      setIsCohost(false);
      setRemovedNotif(true);
      setTimeout(() => setRemovedNotif(false), 4000);
    }
  } catch (_err) {
    console.error("Xabarni parse qilishda xatolik:", _err);
  }
}, [currentUser]); // currentUser o'zgarganda funksiya yangilanishi kerak

  // ── ZegoUIKit — Audience / CoHost ─────────────────────────────────────────
  // FIX 3: Zego'ning o'z "Room messages" panelini CSS yordamida yashiramiz.
  //        showTextChat:false parametri ZegoUIKit v2+ da mavjud, lekin
  //        ba'zi versiyalarda ishlamaydi — shuning uchun CSS override ham qo'shamiz.
 useEffect(() => {
  if (!currentUser || !live?.channelName) return;

  const raf = requestAnimationFrame(() => {
    if (!zegoRef.current) {
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
        container: zegoRef.current,
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
        
        // MANA SHU YERDA BUYRUQLARNI QABUL QILADI
        onInRoomCommandReceived: handleInRoomCommand, 
        
        onError: (err) => {
          console.error("Zego audience error:", err);
          setZegoError("Ulanishda xatolik. Sahifani yangilang.");
        },
      });
    } catch (err) {
      console.error("Zego init error:", err);
      setZegoError("Zego initsializatsiya xatosi: " + err.message);
    }
  });

  return () => {
    cancelAnimationFrame(raf);
    try { 
      zegoInst.current?.destroy?.(); 
    } catch (_err) {
      console.error("Zego destroy error:", _err);
    }
    zegoInst.current = null;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [live, currentUser, handleInRoomCommand]);
  // ── Send chat / question ──────────────────────────────────────────────────
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

  // ── Delete own message ────────────────────────────────────────────────────
  // FIX 4: Foydalanuvchi o'z xabarini o'chira oladi
  const deleteMessage = useCallback(async (msgId) => {
    if (!live?.id || !currentUser) return;
    setDeletingId(msgId);
    try {
      await deleteDoc(doc(db, "liveLessons", live.id, "messages", msgId));
    } catch (err) {
      console.warn("Delete message failed:", err);
    } finally {
      setDeletingId(null);
    }
  }, [live?.id, currentUser]);

  // ── Send emoji reaction via Zego in-room command ──────────────────────────
  // FIX 5: [] → broadcast. Zego'da bo'sh array = xona barcha a'zolariga yuborish.
  //        O'qituvchi tomoni ham CMD_REACTION ni qabul qiladi va floating ko'rsatadi.
// Reaction yuborish funksiyasi
const sendReaction = useCallback((emoji) => {
  if (!zegoInst.current) return;

  const cmd = JSON.stringify({ 
    type: CMD_REACTION, 
    emoji: emoji,
    // O'qituvchiga kim yuborganini ko'rsatish uchun (ixtiyoriy)
    senderName: auth.currentUser?.displayName || "O'quvchi" 
  });

  try {
    // FIX: Ikkinchi parametr [] bo'lsa, xabarni xonadagi HAMMAga yuboradi
    zegoInst.current.sendInRoomCommand(cmd, []);
    
    // O'zida ham animatsiya chiqishi uchun
    setFloatingReactions((prev) => [
      ...prev,
      {
        id: `r_${Date.now()}_${Math.random()}`,
        emoji,
        rightOffset: 60 + Math.random() * 80,
        riseAmount: 80 + Math.random() * 60,
      },
    ]);
  } catch (err) {
    console.error("Reaction yuborishda xato:", err);
  }
}, []);

  // ── Raise / lower hand ────────────────────────────────────────────────────
  // FIX 6: [] bilan broadcast — o'qituvchi (Host) ham CMD_RAISE_HAND ni oladi
  const toggleHand = useCallback(() => {
    if (!zegoInst.current || !currentUser) return;
    if (handRaised) {
      const cmd = JSON.stringify({ type: CMD_HAND_DOWN, uid: currentUser.uid });
      try {
        zegoInst.current.sendInRoomCommand?.(cmd, []);
      } catch (_err) {
        console.error("Failed to send hand down command:", _err);
      }
      setHandRaised(false);
    } else {
      const cmd = JSON.stringify({
        type: CMD_RAISE_HAND,
        uid:  currentUser.uid,
        name: currentUser.displayName || "Tomoshabin",
      });
      try {
        // [] = broadcast — o'qituvchi ham oladi
        zegoInst.current.sendInRoomCommand?.(cmd, []);
      } catch (_err) {
        console.error("Failed to send hand raise command:", _err);
      }
      setHandRaised(true);
    }
  }, [handRaised, currentUser]);

  return (
    <div className="fixed inset-0 z-50 bg-[#060a14] flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a1020]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"/>LIVE
              </span>
              <span className="text-white font-semibold text-sm">{live?.title}</span>
              {isCohost && (
                <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                  🎙 CO-HOST
                </span>
              )}
            </div>
            <p className="text-white/40 text-xs mt-0.5">👨‍🏫 {live?.instructorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-white/40 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {live?.viewers || 0} tomoshabin
          </span>
          <button onClick={() => setChatOpen((p) => !p)}
            className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-white/50">{chatOpen ? "Yopish" : "Chat"}</span>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Video area ── */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>

          {/* Error overlay */}
          {zegoError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#060a14] gap-4">
              <div className="text-4xl">📡</div>
              <p className="text-white/50 text-sm text-center max-w-xs">{zegoError}</p>
              <button onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-all">
                Qayta urinish
              </button>
            </div>
          )}

          {/* Zego container */}
          <div ref={zegoRef} className="w-full h-full" style={{ minHeight: 0 }}/>

          {/* ── Floating Reactions Layer ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

          {/* ── Reaction + Raise Hand Bar ── */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50"
            style={{
              background:    "rgba(0,0,0,0.55)",
              backdropFilter:"blur(8px)",
              padding:       "8px 14px",
              borderRadius:  40,
              border:        "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-100"
                style={{ background: "rgba(255,255,255,0.07)", border: "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background  = "rgba(255,255,255,0.18)";
                  e.currentTarget.style.transform   = "scale(1.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform   = "scale(1)";
                }}
              >
                {emoji}
              </button>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.15)", margin: "0 4px" }}/>

            {/* Raise Hand Button */}
            <button
              onClick={toggleHand}
              title={handRaised ? "Qo'lni tushirish" : "Qo'l ko'tarish (sahna so'rash)"}
              className="flex items-center gap-1.5 px-3 h-9 rounded-full cursor-pointer transition-all duration-200"
              style={{
                background: handRaised ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.07)",
                border:     handRaised ? "1px solid rgba(245,158,11,0.6)" : "1px solid transparent",
                color:      handRaised ? "#f59e0b" : "rgba(255,255,255,0.5)",
                fontSize:   12,
                fontWeight: 700,
              }}
              onMouseEnter={(e) => { if (!handRaised) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { if (!handRaised) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            >
              <LuHand size={15} style={{ animation: handRaised ? "wave 0.6s ease infinite alternate" : "none" }}/>
              {handRaised ? "Tushirish" : "🖐️ So'rash"}
            </button>
          </div>

          {/* ── Toast: Accepted as co-host ── */}
          {coHostNotif && (
            <div
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background:    "rgba(16,185,129,0.15)",
                border:        "1px solid rgba(16,185,129,0.4)",
                backdropFilter:"blur(8px)",
                animation:     "slideDown 0.3s ease",
              }}
            >
              <span className="text-xl">🎙️</span>
              <div>
                <p className="m-0 text-green-300 font-bold text-sm">Sahnaga qo'shildingiz!</p>
                <p className="m-0 text-green-400/60 text-xs">Kamera va mikrofoniz yoqildi</p>
              </div>
            </div>
          )}

          {/* ── Toast: Removed from stage ── */}
          {removedNotif && (
            <div
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background:    "rgba(239,68,68,0.12)",
                border:        "1px solid rgba(239,68,68,0.3)",
                backdropFilter:"blur(8px)",
                animation:     "slideDown 0.3s ease",
              }}
            >
              <span className="text-xl">👋</span>
              <p className="m-0 text-red-300 font-bold text-sm">Sahna tugadi</p>
            </div>
          )}

          {/* ── Hand raised indicator (own feedback) ── */}
          {handRaised && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background:    "rgba(245,158,11,0.15)",
                border:        "1px solid rgba(245,158,11,0.4)",
                backdropFilter:"blur(8px)",
              }}
            >
              <span style={{ animation: "wave 0.6s ease infinite alternate", display: "inline-block" }}>🖐️</span>
              <span className="text-yellow-400 text-xs font-bold">
                Qo'lingiz ko'tarilgan — o'qituvchi javob beradi
              </span>
            </div>
          )}
        </div>

        {/* ── Chat panel ── */}
        <div
          className={`flex flex-col border-l border-white/10 bg-[#0a1020] transition-all duration-300 ${
            chatOpen ? "w-80" : "w-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
            <span className="text-white/60 text-sm font-semibold">💬 Jonli Chat</span>
            {messages.filter((m) => m.isQuestion && !m.answered).length > 0 && (
              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                ❓ {messages.filter((m) => m.isQuestion && !m.answered).length} savol
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-white/25 text-xs">Birinchi xabarni yozing!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isOwn = m.uid === currentUser?.uid;
                return (
                  <div
                    key={m.id}
                    className="flex gap-2.5 group"
                    style={{
                      opacity:      m.isQuestion && m.answered ? 0.4 : 1,
                      transition:   "opacity 0.5s",
                      padding:      m.isQuestion ? "10px" : "2px 0",
                      borderRadius: m.isQuestion ? 10 : 0,
                      background:   m.isQuestion && !m.answered
                        ? "rgba(245,158,11,0.07)"
                        : "transparent",
                      border: m.isQuestion && !m.answered
                        ? "1px solid rgba(245,158,11,0.25)"
                        : "none",
                    }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ${
                        m.isInstructor
                          ? "bg-red-500/30 border border-red-500/50 text-red-300"
                          : "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                      }`}
                    >
                      {m.avatar
                        ? <img src={m.avatar} alt="" className="w-full h-full object-cover"/>
                        : m.name?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            m.isInstructor ? "text-red-400" : isOwn ? "text-emerald-400" : "text-blue-400"
                          }`}
                        >
                          {m.name} {isOwn && <span className="text-[9px] text-white/30 font-normal">(siz)</span>}
                        </span>
                        {m.isInstructor && (
                          <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">
                            HOST
                          </span>
                        )}
                        {m.isQuestion && (
                          <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/30">
                            ❓ SAVOL
                          </span>
                        )}
                        {m.isQuestion && m.answered && (
                          <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">
                            <LuCheck size={8} style={{ display: "inline", marginRight: 2 }}/>Javob
                          </span>
                        )}
                        <span className="text-white/20 text-[10px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed wrap-break-words m-0">{m.text}</p>
                    </div>

                    {/* FIX 4: O'z xabarini o'chirish tugmasi */}
                    {isOwn && (
                      <button
                        onClick={() => deleteMessage(m.id)}
                        disabled={deletingId === m.id}
                        title="Xabarni o'chirish"
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border:     "1px solid rgba(239,68,68,0.25)",
                          color:      deletingId === m.id ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.7)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.22)";
                          e.currentTarget.style.color      = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                          e.currentTarget.style.color      = "rgba(239,68,68,0.7)";
                        }}
                      >
                        {deletingId === m.id ? (
                          <span
                            style={{
                              width:           10,
                              height:          10,
                              borderRadius:    "50%",
                              border:          "1.5px solid rgba(239,68,68,0.5)",
                              borderTopColor:  "transparent",
                              display:         "inline-block",
                              animation:       "spin 0.7s linear infinite",
                            }}
                          />
                        ) : (
                          <LuTrash2 size={11}/>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatBottom}/>
          </div>

          {/* ── Chat Input ── */}
          <div className="px-3 pt-2 pb-3 border-t border-white/10 shrink-0">
            {/* Question mode toggle */}
            <div className="mb-2">
              <button
                onClick={() => setIsQuestion((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
                style={{
                  background: isQuestion ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
                  border:     isQuestion ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  color:      isQuestion ? "#f59e0b" : "rgba(255,255,255,0.35)",
                }}
              >
                {isQuestion ? "❓ Savol rejimi" : "Savol yuborish"}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={isQuestion ? "Savolingizni yozing..." : "Xabar yozing..."}
                className="flex-1 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{
                  border: isQuestion
                    ? "1px solid rgba(245,158,11,0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!msgInput.trim()}
                className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*
        FIX 3 (CSS override): Agar showTextChat:false parametri ishlamasa,
        Zego'ning ichki "Room messages" panelini CSS bilan yashiramiz.
        Bu selector Zego DOM strukturasiga bog'liq — versiyaga qarab o'zgarishi mumkin.
      */}
      <style>{`
        @keyframes wave {
          from { transform: rotate(-15deg); }
          to   { transform: rotate(15deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Zego ichki chat panelini yashirish */
        .zego-room-message-list,
        .zego-chat-message-list,
        [class*="ZegoRoomMessage"],
        [class*="ZegoChat"],
        [class*="zego-im"],
        [class*="RoomMessage"],
        [class*="MessageList"],
        .zego-uikit-room-message { display: none !important; }
      `}</style>
    </div>
  );
};

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

  const handleBack = useCallback(() => setWatching(null), []);

  if (watching) {
    return <WatchView live={watching} currentUser={currentUser} onBack={handleBack}/>;
  }

  const LiveCard = ({ live }) => (
    <div
      onClick={() => setWatching(live)}
      className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-red-500/30 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-40 bg-linear-to-br from-red-900/30 via-[#0f172a] to-purple-900/20 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(239,68,68,0.4) 1px, transparent 1px)",
            backgroundSize:  "24px 24px",
          }}
        />
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-2xl font-bold text-red-300 overflow-hidden z-10">
          {live.instructorPhoto
            ? <img src={live.instructorPhoto} alt="" className="w-full h-full object-cover"/>
            : live.instructorName?.[0]?.toUpperCase()}
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse"/>LIVE
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-full">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {live.viewers || 0}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/20 border-2 border-white/0 group-hover:border-white/40 flex items-center justify-center transition-all duration-300 scale-75 group-hover:scale-100">
            <svg className="w-5 h-5 text-white/0 group-hover:text-white transition-all duration-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 leading-snug">{live.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[9px] text-white/60">
            {live.instructorPhoto
              ? <img src={live.instructorPhoto} alt="" className="w-full h-full object-cover"/>
              : live.instructorName?.[0]?.toUpperCase()}
          </div>
          <span className="text-white/50 text-xs">{live.instructorName}</span>
          <span className="text-white/25 text-xs ml-auto">{timeAgo(live.startedAt)}</span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse"/>
          Efirga Qo'shilish
        </button>
      </div>
    </div>
  );

  const EndedCard = ({ live }) => (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold text-white/40 shrink-0 overflow-hidden">
        {live.instructorPhoto
          ? <img src={live.instructorPhoto} alt="" className="w-full h-full object-cover"/>
          : live.instructorName?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 font-semibold text-sm truncate">{live.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-white/40 text-xs">{live.instructorName}</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs">{timeAgo(live.startedAt)}</span>
          {live.viewers > 0 && (
            <>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-white/40 text-xs">{live.viewers} tomoshabin</span>
            </>
          )}
        </div>
      </div>
      <span className="text-[10px] font-bold bg-white/10 text-white/40 px-2.5 py-1 rounded-full border border-white/10 shrink-0">
        Yakunlandi
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block animate-pulse"/>
              Jonli Efirlar
            </span>
            {liveLessons.length > 0 && (
              <span className="bg-white/10 text-white/60 text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
                {liveLessons.length} ta faol
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Darslar</h1>
          <p className="text-white/40 text-sm">
            O'qituvchilar tomonidan o'tkazilayotgan jonli darslarni tomosha qiling
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { id: "live",  label: "🔴 Hozir Live",    count: liveLessons.length  },
            { id: "ended", label: "📼 O'tgan Efirlar", count: endedLessons.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                activeTab === t.id
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-white/40 hover:text-white/60 hover:border-white/15"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-white/10 text-white/40"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "live" && (
          loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin"/>
            </div>
          ) : liveLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-5">📡</div>
              <h3 className="text-white/60 font-semibold text-lg mb-2">Hozircha faol efir yo'q</h3>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed">
                O'qituvchilar live dars boshlashsa, bu yerda ko'rinadi. Keyinroq qaytib keling!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveLessons.map((live) => <LiveCard key={live.id} live={live}/>)}
            </div>
          )
        )}

        {activeTab === "ended" && (
          endedLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-5">📼</div>
              <h3 className="text-white/60 font-semibold text-lg mb-2">O'tgan efirlar yo'q</h3>
              <p className="text-white/30 text-sm">Hali birorta efir yakunlanmagan</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {endedLessons.map((live) => <EndedCard key={live.id} live={live}/>)}
            </div>
          )
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default LiveInstructor;