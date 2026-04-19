import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  collection, doc, getDoc, deleteDoc,
  onSnapshot, query, serverTimestamp, addDoc, updateDoc,
} from "firebase/firestore";
import {
  LuBookOpen, LuUsers, LuStar, LuTrophy,
  LuPlus, LuTrash2, LuCheck,
  LuX, LuPen, LuRadio, LuEye, 
  LuMic, LuMicOff, LuUserMinus,
} from "react-icons/lu";
import { getNameStyleByKey } from "../constants/shopConstants";

const ZEGO_APP_ID        = 77698519;
const ZEGO_SERVER_SECRET = "640db04ef5b4b66c82185215c289bd00";

const COURSE_CATEGORIES = (t) => [
  "HTML","CSS","JavaScript","React","English","Russian","French","Python",t.other,
];

const CMD_REACTION   = "REACTION";
const CMD_RAISE_HAND = "RAISE_HAND";
const CMD_HAND_DOWN  = "HAND_DOWN";
const CMD_ACCEPT     = "ACCEPT_COHOST";
const CMD_REMOVE     = "REMOVE_COHOST";
const CMD_MUTE       = "MUTE_COHOST";

// в”Ђв”Ђ Floating Reaction (o'quvchilardan keladiganlar ko'rsatiladi) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
    <div ref={ref} style={{
      position:"absolute", bottom:48, right:rightOffset,
      fontSize:28, opacity:1, transform:"translateY(0) scale(1)",
      transition:"opacity 2s ease-out, transform 2s ease-out",
      pointerEvents:"none", zIndex:100, userSelect:"none",
    }}>
      {emoji}
    </div>
  );
};

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
// в”Ђв”Ђ LIVE LESSON —” HOST
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
const LiveLesson = ({ showToast, user, onClose }) => {
  const [liveTitle,  setLiveTitle]  = useState("");
  const [isLive,     setIsLive]     = useState(false);
  const [viewers,    setViewers]    = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [messages,   setMessages]   = useState([]);
  const [msgInput,   setMsgInput]   = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [liveDocId,  setLiveDocId]  = useState(null);
  const [starting,   setStarting]   = useState(false);

  // O'quvchilardan kelgan floating reactions
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Raise hand
  const [raisedHands, setRaisedHands] = useState([]);
  const [cohosts,     setCohosts]     = useState([]);
  const [handNotif,   setHandNotif]   = useState(null);

  const zegoRef        = useRef(null);
  const zegoInst       = useRef(null);
  const timerRef       = useRef(null);
  const messagesRef    = useRef(null);
  const liveDocIdRef   = useRef(null);
  const isLiveRef      = useRef(false);
  const raisedHandsRef = useRef([]);

  useEffect(() => { raisedHandsRef.current = raisedHands; }, [raisedHands]);

  // Ghost-stream fix
  useEffect(() => {
    const onBefore = (e) => {
      if (!isLiveRef.current) return;
      e.preventDefault();
      e.returnValue = t.liveNotFinished;
    };
    const onHide = () => {
      if (isLiveRef.current && liveDocIdRef.current) {
        updateDoc(doc(db, "liveLessons", liveDocIdRef.current), {
          status:"ended", endedAt:serverTimestamp(),
        }).catch(() => {});
        isLiveRef.current = false;
      }
    };
    window.addEventListener("beforeunload", onBefore);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("beforeunload", onBefore);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  // Chat + viewers
  useEffect(() => {
    if (!liveDocId) return;
    const unsubChat = onSnapshot(
      query(collection(db, "liveLessons", liveDocId, "messages")),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id:d.id, ...d.data() }))
          .sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
        setMessages(list);
        setTimeout(() => {
          if (messagesRef.current)
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }, 50);
      }
    );
    const unsubDoc = onSnapshot(doc(db, "liveLessons", liveDocId), (snap) => {
      if (snap.exists()) setViewers(snap.data().viewers || 0);
    });
    return () => { unsubChat(); unsubDoc(); };
  }, [liveDocId]);

  // в”Ђв”Ђ O'quvchilardan kelgan commandlarni qabul qilish в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleInRoomCommand = useCallback((command) => {
    try {
      const parsed = JSON.parse(command);

      if (parsed.type === CMD_REACTION) {
        // O'quvchi reaction в†’ o'qituvchi ekranida ko'rsatish
        setFloatingReactions((prev) => [...prev, {
          id:          `r_${Date.now()}_${prev.length}`,
          emoji:       parsed.emoji,
          rightOffset: 60 + Math.random() * 120,
          riseAmount:  80 + Math.random() * 80,
        }]);

      } else if (parsed.type === CMD_RAISE_HAND) {
        const { uid, name } = parsed;
        if (!raisedHandsRef.current.find((h) => h.uid === uid)) {
          setRaisedHands((prev) => [...prev, { uid, name }]);
        }
        setHandNotif({ uid, name });
        setTimeout(() => setHandNotif(null), 6000);

      } else if (parsed.type === CMD_HAND_DOWN) {
        setRaisedHands((prev) => prev.filter((h) => h.uid !== parsed.uid));
        setHandNotif((prev) => prev?.uid === parsed.uid ? null : prev);
      }
    } catch (_err) {
      console.error("handleInRoomCommand error:", _err);
    }
  }, []);

  const startLive = async () => {
    if (!liveTitle.trim()) { showToast?.(t.enterLessonName, "error"); return; }
    if (starting) return;
    setStarting(true);
    try {
      const channelName = `instructor_${user.uid}`;
      const docRef = await addDoc(collection(db, "liveLessons"), {
        title:liveTitle.trim(), instructorId:user.uid,
        instructorName:user.displayName||user.email,
        instructorPhoto:user.photoURL||null, channelName,
        status:"live", viewers:0, startedAt:serverTimestamp(),
      });
      setLiveDocId(docRef.id);
      liveDocIdRef.current = docRef.id;
      isLiveRef.current    = true;

      await new Promise((res) => requestAnimationFrame(res));
      await new Promise((res) => setTimeout(res, 0));
      if (!zegoRef.current) throw new Error(t.videoContainerNotFound);

      const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
        ZEGO_APP_ID, ZEGO_SERVER_SECRET,
        channelName, user.uid, user.displayName || t.instructor
      );
      const zc = ZegoUIKitPrebuilt.create(token);
      zegoInst.current = zc;

      zc.joinRoom({
        container: zegoRef.current,
        scenario: { mode:ZegoUIKitPrebuilt.LiveStreaming, config:{ role:ZegoUIKitPrebuilt.Host } },
        showPreJoinView:false, showLeavingView:false,
        showRoomDetailsButton:false, showScreenSharingButton:true, showUserList:false,
        onLeaveRoom: () => stopLive(liveDocIdRef.current, false),
        // вњ… O'quvchilardan kelgan commandlar shu yerda qabul qilinadi
        // ... boshqa sozlamalar (container, scenario va h.k.)
onInRoomCommandReceived: (fromUser, command) => {
  try {
    const data = JSON.parse(command);
    console.log("Yangi buyruq:", data);

    // 1. Reaksiyalarni chiqarish
    if (data.type === CMD_REACTION) {
      setFloatingReactions((prev) => [
        ...prev,
        {
          id: `r_${Date.now()}_${Math.random()}`,
          emoji: data.emoji,
          rightOffset: 50 + Math.random() * 150,
          riseAmount: 100 + Math.random() * 100,
        },
      ]);
    }

    // 2. Qo'l ko'tarish logikasi
    if (data.type === CMD_RAISE_HAND) {
      setRaisedHands((prev) => {
        if (prev.find((h) => h.uid === data.uid)) return prev;
        return [...prev, { uid: data.uid, name: data.name || fromUser.userName }];
      });
    }

    // 3. Qo'lni tushirish
    if (data.type === CMD_HAND_DOWN) {
      setRaisedHands((prev) => prev.filter((h) => h.uid !== data.uid));
    }
  } catch (error) {
    console.error("Xabarni o'qishda xato:", error);
  }
}, handleInRoomCommand,
      });

      setIsLive(true);
      timerRef.current = setInterval(() => setDuration((p) => p + 1), 1000);
      showToast?.("рџ”ґ " + t.liveStarted, "success");
    } catch (err) {
      showToast?.(t.error + err.message, "error");
      if (liveDocIdRef.current) {
        await updateDoc(doc(db, "liveLessons", liveDocIdRef.current), {
          status:"ended", endedAt:serverTimestamp(),
        }).catch(() => {});
      }
      isLiveRef.current = false;
    } finally { setStarting(false); }
  };

  const stopLive = async (docId, destroyZego = true) => {
    const id = docId ?? liveDocIdRef.current;
    clearInterval(timerRef.current);
    if (destroyZego) { try { zegoInst.current?.destroy?.(); } catch (_err) {
      console.error(_err);
    } }
    zegoInst.current  = null;
    isLiveRef.current = false;
    if (id) {
      try { await updateDoc(doc(db, "liveLessons", id), { status:"ended", endedAt:serverTimestamp() }); }
      catch (e) { console.warn(e); }
    }
    setIsLive(false); setDuration(0); liveDocIdRef.current = null;
    showToast?.("Live dars yakunlandi", "success");
    onClose();
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !liveDocId) return;
    const text = msgInput.trim(); const asQ = isQuestion;
    setMsgInput(""); setIsQuestion(false);
    try {
      await addDoc(collection(db, "liveLessons", liveDocId, "messages"), {
        text, uid:user.uid, name:user.displayName||t.instructor,
        avatar:user.photoURL||null, isInstructor:true,
        isQuestion:asQ, answered:false, createdAt:serverTimestamp(),
      });
    } catch (e) { console.warn(e); }
  };

  const markAnswered = async (msgId) => {
    if (!liveDocId) return;
    try { await updateDoc(doc(db, "liveLessons", liveDocId, "messages", msgId), { answered:true }); }
    catch (e) { console.warn(e); }
  };

const acceptCohost = (uid, name) => {
  if (!zegoInst.current) return;
  
  try {
    // FIX: [uid] o'rniga [] (bo'sh massiv) ishlatamiz. 
    // Bu xabarni xonadagi hamma eshitadi va o'quvchi o'z ID-sini tekshirib qo'lini tushiradi.
    const cmd = JSON.stringify({ 
      type: CMD_ACCEPT, 
      uid: uid 
    });
    
    zegoInst.current.sendInRoomCommand?.(cmd, []); 
    
    // O'qituvchi interfeysini yangilash
    setRaisedHands((prev) => prev.filter((h) => h.uid !== uid));
    setHandNotif(null);
    
    // Cohostlar ro'yxatiga qo'shish
    setCohosts((prev) => {
      if (prev.find(c => c.uid === uid)) return prev;
      return [...prev, { uid, name, muted: false }];
    });

    if (typeof showToast === "function") {
      showToast(`${name} ${t.addedToStage}`, "success");
    }
  } catch (_err) {
    console.error("Cohost qabul qilishda xato:", _err);
  }
};

  const removeCohost = (uid) => {
    if (!zegoInst.current) return;
    try { zegoInst.current.sendInRoomCommand?.(JSON.stringify({ type:CMD_REMOVE, uid }), [uid]); } catch (_err) {
      console.error(_err);
    }
    setCohosts((prev) => prev.filter((c) => c.uid !== uid));
  };

  const muteCohost = (uid) => {
    if (!zegoInst.current) return;
    try { zegoInst.current.sendInRoomCommand?.(JSON.stringify({ type:CMD_MUTE, uid }), [uid]); } catch (_err) {
      console.error(_err);
    }
    setCohosts((prev) => prev.map((c) => c.uid === uid ? { ...c, muted:!c.muted } : c));
  };

  const fmt = (s) =>
    `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.97)", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #1e293b" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {isLive && <span style={{ background:"#ef4444", color:"#fff", fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:6 }}>рџ”ґ LIVE</span>}
          <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:15 }}>{liveTitle || t.liveLesson}</span>
          {isLive && <>
            <span style={{ color:"#94a3b8", fontSize:12 }}>вЏ± {fmt(duration)}</span>
            <span style={{ color:"#94a3b8", fontSize:12, display:"flex", alignItems:"center", gap:4 }}><LuEye size={13}/>{viewers} {t.viewers}</span>
          </>}
        </div>
        <button onClick={() => isLive ? stopLive(liveDocIdRef.current) : onClose()}
          style={{ padding:"8px 18px", borderRadius:10, border:"none", background:isLive?"#ef4444":"#334155", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {isLive ? `вЏ№ ${t.end}` : `вњ• ${t.close}`}
        </button>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Video area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", background:"#060a14" }}>

          {/* Pre-join */}
          {!isLive && (
            <div style={{ position:"absolute", inset:0, zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
              <div style={{ fontSize:56 }}>рџ“№</div>
              <div style={{ width:"100%", maxWidth:400, padding:"24px", borderRadius:16, background:"#1e293b", border:"1px solid #334155" }}>
                <h3 style={{ margin:"0 0 14px", fontWeight:700, fontSize:16, color:"#f1f5f9", textAlign:"center" }}>рџ”ґ {t.startLiveLesson}</h3>
                <input value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)}
                  onKeyDown={(e) => e.key==="Enter" && !starting && startLive()}
                  placeholder={t.lessonName}
                  style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid #334155", background:"#0f172a", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14 }}/>
                <button onClick={startLive} disabled={starting || !liveTitle.trim()}
                  style={{ width:"100%", padding:"13px 0", borderRadius:12, border:"none", background:(starting||!liveTitle.trim())?"#475569":"#ef4444", color:"#fff", fontSize:15, fontWeight:800, cursor:(starting||!liveTitle.trim())?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {starting
                    ? <><span style={{ width:16,height:16,borderRadius:"50%",border:"2px solid #fff",borderTopColor:"transparent",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>{t.connecting}</>
                    : <><LuRadio size={18}/> {t.startLive}</>}
                </button>
              </div>
            </div>
          )}

          {/* Zego */}
          <div ref={zegoRef} style={{ flex:1, minHeight:0, display:isLive?"flex":"none" }}/>

          {/* вњ… O'quvchilardan kelgan floating reactions ko'rsatish */}
          {isLive && (
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
              {floatingReactions.map((r) => (
                <FloatingReaction key={r.id} emoji={r.emoji} rightOffset={r.rightOffset} riseAmount={r.riseAmount}
                  onDone={() => setFloatingReactions((prev) => prev.filter((x) => x.id !== r.id))}/>
              ))}
            </div>
          )}

          {/* вњ… Raise Hand notification —” top-right */}
          {handNotif && (
            <div style={{ position:"absolute", top:16, right:16, zIndex:60, background:"#1e293b", border:"2px solid #f59e0b", borderRadius:14, padding:"14px 18px", minWidth:260, animation:"slideIn 0.3s ease", boxShadow:"0 8px 32px rgba(245,158,11,0.2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:24, display:"inline-block", animation:"wave 0.6s ease infinite alternate" }}>рџ–ђпёЏ</span>
                <div>
                  <p style={{ margin:0, color:"#f1f5f9", fontWeight:800, fontSize:14 }}>{handNotif.name}</p>
                  <p style={{ margin:0, color:"#f59e0b", fontSize:12, fontWeight:600 }}>sahna so'ramoqda</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => acceptCohost(handNotif.uid, handNotif.name)}
                  style={{ flex:1, padding:"9px 0", background:"#10b981", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  вњ“ Qabul qilish
                </button>
                <button onClick={() => setHandNotif(null)}
                  style={{ flex:1, padding:"9px 0", background:"#334155", color:"#94a3b8", border:"none", borderRadius:10, fontSize:13, cursor:"pointer" }}>
                  вњ• Rad etish
                </button>
              </div>
            </div>
          )}

          {/* вњ… Qo'l ko'targanlar ro'yxati —” bottom-left */}
          {isLive && raisedHands.length > 0 && (
            <div style={{ position:"absolute", bottom:16, left:16, zIndex:60 }}>
              <div style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:12, padding:"10px 14px", minWidth:190 }}>
                <p style={{ margin:"0 0 8px", color:"#f59e0b", fontSize:11, fontWeight:800 }}>
                  рџ–ђпёЏ Qo'l ko'targanlar ({raisedHands.length})
                </p>
                {raisedHands.map((h) => (
                  <div key={h.uid} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:24,height:24,borderRadius:"50%",background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontSize:10,fontWeight:800,flexShrink:0 }}>
                      {h.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ color:"#f1f5f9", fontSize:12, flex:1 }}>{h.name}</span>
                    <button onClick={() => acceptCohost(h.uid, h.name)}
                      style={{ padding:"3px 10px", background:"#10b981", color:"#fff", border:"none", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer" }}>
                      Qabul
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Co-hostlar —” top-left */}
          {isLive && cohosts.length > 0 && (
            <div style={{ position:"absolute", top:16, left:16, zIndex:60, display:"flex", flexDirection:"column", gap:6 }}>
              {cohosts.map((c) => (
                <div key={c.uid} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:10, padding:"8px 10px" }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700 }}>
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{c.name}</span>
                  <span style={{ fontSize:9, color:"#6ee7b7", background:"rgba(16,185,129,0.15)", padding:"1px 6px", borderRadius:4, fontWeight:700 }}>CO-HOST</span>
                  <button onClick={() => muteCohost(c.uid)}
                    style={{ width:26,height:26,borderRadius:6,border:"none",background:c.muted?"#ef4444":"#334155",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    {c.muted ? <LuMicOff size={12}/> : <LuMic size={12}/>}
                  </button>
                  <button onClick={() => removeCohost(c.uid)}
                    style={{ width:26,height:26,borderRadius:6,border:"none",background:"#7f1d1d",color:"#fca5a5",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <LuUserMinus size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat panel */}
        {isLive && (
          <div style={{ width:320, borderLeft:"1px solid #1e293b", display:"flex", flexDirection:"column", background:"#060a14" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #1e293b" }}>
              <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#f1f5f9" }}>
                рџ’¬ Live Chat ({messages.length})
                {messages.filter(m => m.isQuestion && !m.answered).length > 0 && (
                  <span style={{ marginLeft:8, background:"#f59e0b", color:"#000", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:10 }}>
                    вќ“ {messages.filter(m => m.isQuestion && !m.answered).length}
                  </span>
                )}
              </p>
            </div>

            <div ref={messagesRef} style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length === 0
                ? <p style={{ color:"#6b7280", fontSize:12, textAlign:"center", paddingTop:20 }}>Hali xabar yo'q...</p>
                : messages.map((m) => (
                  <div key={m.id} style={{
                    opacity: m.isQuestion && m.answered ? 0.4 : 1,
                    transition:"opacity 0.5s",
                    padding: m.isQuestion ? "10px" : "0",
                    borderRadius: m.isQuestion ? 10 : 0,
                    background: m.isQuestion && !m.answered ? "rgba(245,158,11,0.08)" : "transparent",
                    border: m.isQuestion && !m.answered ? "1px solid rgba(245,158,11,0.3)" : "none",
                  }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:m.isInstructor?"#ef4444":"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,flexShrink:0,overflow:"hidden" }}>
                        {m.avatar ? <img src={m.avatar} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : m.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <span style={{ fontSize:11, fontWeight:700, color:m.isInstructor?"#f87171":"#60a5fa" }}>
                            {m.name} {m.isInstructor && "рџ‘Ё—ЌрџЏ«"}
                          </span>
                          {m.isQuestion && !m.answered && (
                            <span style={{ fontSize:9, fontWeight:800, background:"#f59e0b", color:"#000", padding:"1px 6px", borderRadius:6 }}>вќ“ SAVOL</span>
                          )}
                          {m.isQuestion && m.answered && (
                            <span style={{ fontSize:9, fontWeight:800, background:"#10b981", color:"#fff", padding:"1px 6px", borderRadius:6 }}>вњ“ Javob</span>
                          )}
                        </div>
                        <p style={{ margin:"2px 0 0", fontSize:13, color:"#e2e8f0", lineHeight:1.5 }}>{m.text}</p>
                        {m.isQuestion && !m.answered && (
                          <button onClick={() => markAnswered(m.id)}
                            style={{ marginTop:6, padding:"3px 10px", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.4)", color:"#6ee7b7", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                            <LuCheck size={10}/> Javob berildi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            <div style={{ padding:"12px 14px", borderTop:"1px solid #1e293b" }}>
              <div style={{ marginBottom:8 }}>
                <button onClick={() => setIsQuestion((p) => !p)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:8, border:`1px solid ${isQuestion?"#f59e0b":"#334155"}`, background:isQuestion?"rgba(245,158,11,0.12)":"transparent", color:isQuestion?"#f59e0b":"#6b7280", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                   {isQuestion ? "вќ“ Savol rejimi" : "Savol yuborish"}
                </button>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key==="Enter" && sendMessage()}
                  placeholder={isQuestion ? "Savolingizni yozing..." : "Xabar yozing..."}
                  style={{ flex:1, padding:"9px 12px", borderRadius:10, border:`1px solid ${isQuestion?"#f59e0b":"#334155"}`, background:"#1e293b", color:"#f1f5f9", fontSize:13, outline:"none" }}/>
                <button onClick={sendMessage} disabled={!msgInput.trim()}
                  style={{ width:36,height:36,borderRadius:10,border:"none",background:msgInput.trim()?"#3b82f6":"#334155",color:"#fff",cursor:msgInput.trim()?"pointer":"default",fontSize:16 }}>
                  вћ¤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes wave    { from { transform:rotate(-15deg); } to { transform:rotate(15deg); } }
      `}</style>
    </div>
  );
};

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
// в”Ђв”Ђ InstructorPanel (asosiy)
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
const InstructorPanel = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [showLive,     setShowLive]     = useState(false);
  const [deletingLive, setDeletingLive] = useState(null);
  const [myCourses,    setMyCourses]    = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [courseForm,   setCourseForm]   = useState({
    title:"", category:"HTML", description:"",
    price:"", duration:"", level:"Boshlang'ich",
    lessons:[{ title:"", videoUrl:"", duration:"" }],
  });
  const [pastLives, setPastLives] = useState([]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "instructors", user.uid))
      .then((snap) => { setIsInstructor(snap.exists() && snap.data().isInstructor === true); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !isInstructor) return;
    const u1 = onSnapshot(query(collection(db, "instructorCourses")), (snap) => {
      setMyCourses(snap.docs.map((d) => ({ id:d.id, ...d.data() })).filter((c) => c.instructorId === user.uid));
    });
    const u2 = onSnapshot(query(collection(db, "liveLessons")), (snap) => {
      setPastLives(
        snap.docs.map((d) => ({ id:d.id, ...d.data() }))
          .filter((l) => l.instructorId === user.uid)
          .sort((a,b) => (b.startedAt?.seconds||0) - (a.startedAt?.seconds||0))
          .slice(0, 20)
      );
    });
    return () => { u1(); u2(); };
  }, [user, isInstructor]);

  const handleAddLesson    = () => setCourseForm((p) => ({ ...p, lessons:[...p.lessons, { title:"", videoUrl:"", duration:"" }] }));
  const handleRemoveLesson = (i) => setCourseForm((p) => ({ ...p, lessons:p.lessons.filter((_,idx) => idx !== i) }));
  const handleLessonChange = (i, field, value) => setCourseForm((p) => {
    const ls = [...p.lessons]; ls[i] = { ...ls[i], [field]:value }; return { ...p, lessons:ls };
  });

  const handleSaveCourse = async () => {
    if (!courseForm.title.trim() || !courseForm.description.trim()) { showToast?.(t.titleDescRequired, "error"); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "instructorCourses"), {
        ...courseForm, price:Number(courseForm.price)||0,
        instructorId:user.uid, instructorName:user.displayName||user.email,
        instructorPhoto:user.photoURL||null,
        rating:0, students:0, status:"pending", createdAt:serverTimestamp(),
      });
      showToast?.("вњ… " + t.courseSentToAdmin, "success");
      setShowForm(false);
      setCourseForm({ title:"", category:"HTML", description:"", price:"", duration:"", level:"Boshlang'ich", lessons:[{ title:"", videoUrl:"", duration:"" }] });
    } catch { showToast?.(t.errorOccurred, "error"); }
    setSaving(false);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm(t.confirmDeleteCourse)) return;
    try { await deleteDoc(doc(db, "instructorCourses", id)); showToast?.(t.courseDeleted, "error"); }
    catch { showToast?.(t.errorOccurred, "error"); }
  };

  const handleDeleteLive = async (id) => {
    if (!window.confirm(t.confirmDeleteLive)) return;
    setDeletingLive(id);
    try { await deleteDoc(doc(db, "liveLessons", id)); showToast?.(t.liveHistoryDeleted, "success"); }
    catch { showToast?.(t.errorOccurred, "error"); }
    finally { setDeletingLive(null); }
  };

  const inp = { width:"100%", padding:"10px 14px", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:13, outline:"none", boxSizing:"border-box" };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:300 }}>
      <div style={{ width:36,height:36,borderRadius:"50%",border:"3px solid #3b82f6",borderTopColor:"transparent",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!isInstructor) return (
    <div style={{ maxWidth:500, margin:"0 auto", padding:"80px 20px", textAlign:"center" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>рџ”’</div>
      <h2 style={{ fontSize:22, fontWeight:800, margin:"0 0 10px", color:darkMode?"#f1f5f9":"#111" }}>{t.permissionDenied}</h2>
      <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.6, marginBottom:24 }}>{t.adminPermissionRequired}</p>
      <div style={{ padding:"16px 20px", borderRadius:14, background:darkMode?"#1e293b":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
        <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>рџ“§ Admin: <span style={{ color:"#3b82f6", fontWeight:600 }}>admin@uzbekaspixel.uz</span></p>
      </div>
    </div>
  );

  const totalStudents = myCourses.reduce((a,c) => a+(c.students||0), 0);
  const avgRating = myCourses.length > 0 ? (myCourses.reduce((a,c) => a+(c.rating||0), 0) / myCourses.length).toFixed(1) : "0.0";

  return (
    <>
      {showLive && <LiveLesson showToast={showToast} user={user} onClose={() => setShowLive(false)}/>}
      <div style={{ width:"100%", maxWidth:900, margin:"0 auto", padding:"40px 16px 80px" }}>
        <div direction="up">

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
            <div>
              <span style={{ display:"inline-block", background:"#d1fae5", color:"#065f46", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #6ee7b7" }}>рџ‘Ё—ЌрџЏ« {t.instructorPanel}</span>
              <h2 style={{ fontSize:24, fontWeight:800, margin:0, color:darkMode?"#f1f5f9":"#111", ...getNameStyleByKey(user.nameColor) }}>{t.welcome}, {user?.displayName || t.instructor}!</h2>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowLive(true)} style={{ padding:"12px 20px", borderRadius:12, border:"none", background:"#ef4444", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 16px #ef444455" }}>
                <LuRadio size={16}/> рџ”ґ {t.liveLesson}
              </button>
              <button onClick={() => setShowForm(!showForm)} style={{ padding:"12px 20px", borderRadius:12, border:"none", background:showForm?"#ef4444":"#10b981", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                {showForm ? <><LuX size={16}/> {t.close}</> : <><LuPlus size={16}/> {t.newCourse}</>}
              </button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:12, marginBottom:24 }}>
            {[
              { icon:<LuBookOpen size={22}/>, color:"#3b82f6", label:t.coursesLabel,      value:myCourses.length },
              { icon:<LuUsers size={22}/>,   color:"#10b981", label:t.studentsLabel,     value:totalStudents },
              { icon:<LuStar size={22}/>,    color:"#f59e0b", label:t.avgRatingLabel, value:avgRating },
              { icon:<LuRadio size={22}/>,   color:"#ef4444", label:t.pastLiveLabel,   value:pastLives.filter((l)=>l.status==="ended").length },
              { icon:<LuTrophy size={22}/>,  color:"#8b5cf6", label:t.activeCoursesLabel,  value:myCourses.filter((c)=>c.status==="approved").length },
            ].map((s,i) => (
              <div key={i} style={{ padding:"18px 16px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, textAlign:"center" }}>
                <div style={{ color:s.color, display:"flex", justifyContent:"center", marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {showForm && (
            <div style={{ marginBottom:24, padding:"24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:8 }}>
                <LuPen size={18} style={{ color:"#3b82f6" }}/> Yangi Kurs Yaratish
              </h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:14, marginBottom:14 }}>
                {[{ label:"Kurs nomi *", field:"title", placeholder:"React.js To'liq Kurs" },{ label:"Narx (so'm)", field:"price", placeholder:"0 = Bepul", type:"number" },{ label:"Davomiyligi", field:"duration", placeholder:"20 soat" }].map(({ label, field, placeholder, type }) => (
                  <div key={field}>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>{label}</label>
                    <input type={type||"text"} value={courseForm[field]} placeholder={placeholder} onChange={(e) => setCourseForm({ ...courseForm, [field]:e.target.value })} style={inp}/>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>Kategoriya</label>
                  <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category:e.target.value })} style={inp}>
                    {COURSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>Daraja</label>
                  <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level:e.target.value })} style={inp}>
                    {["Boshlang'ich","O'rta","Yuqori"].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>Tavsif *</label>
                <textarea rows={3} value={courseForm.description} placeholder="Kurs haqida..." onChange={(e) => setCourseForm({ ...courseForm, description:e.target.value })} style={{ ...inp, resize:"none" }}/>
              </div>
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:darkMode?"#f1f5f9":"#111" }}>Darslar ({courseForm.lessons.length} ta)</label>
                  <button onClick={handleAddLesson} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#3b82f6", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                    <LuPlus size={14}/> Dars qo'shish
                  </button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {courseForm.lessons.map((lesson, i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:8, alignItems:"center", padding:"12px", borderRadius:10, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                      <input value={lesson.title} placeholder={`${i+1}-dars nomi`} onChange={(e) => handleLessonChange(i,"title",e.target.value)} style={{ ...inp, fontSize:12 }}/>
                      <input value={lesson.videoUrl} placeholder="YouTube link" onChange={(e) => handleLessonChange(i,"videoUrl",e.target.value)} style={{ ...inp, fontSize:12 }}/>
                      <input value={lesson.duration} placeholder="10 min" onChange={(e) => handleLessonChange(i,"duration",e.target.value)} style={{ ...inp, fontSize:12, width:80 }}/>
                      <button onClick={() => handleRemoveLesson(i)} disabled={courseForm.lessons.length===1}
                        style={{ width:32,height:32,borderRadius:8,border:"none",background:"#fee2e2",color:"#ef4444",cursor:courseForm.lessons.length===1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <LuTrash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleSaveCourse} disabled={saving}
                  style={{ flex:1, padding:"13px 0", background:saving?"#94a3b8":"#10b981", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:saving?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {saving ? "Saqlanmoqda..." : <><LuCheck size={16}/> Adminga yuborish</>}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding:"13px 20px", background:"transparent", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:12, fontSize:14, color:darkMode?"#94a3b8":"#374151", cursor:"pointer" }}>
                  Bekor
                </button>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
            {[{ id:"overview", label:"рџ“љ Kurslarim" },{ id:"live", label:"рџ”ґ Live Tarix" },{ id:"stats", label:"рџ“Љ Statistika" }].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding:"10px 20px", borderRadius:12, border:"none", background:activeTab===t.id?"#3b82f6":darkMode?"#1e293b":"#f1f5f9", color:activeTab===t.id?"#fff":darkMode?"#94a3b8":"#374151", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            myCourses.length === 0
              ? <div style={{ textAlign:"center", padding:"60px 0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>рџ“љ</div>
                  <p style={{ color:"#6b7280", marginBottom:16 }}>Hali kurs yaratilmagan</p>
                  <button onClick={() => setShowForm(true)} style={{ padding:"12px 24px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>Birinchi kursni yarating</button>
                </div>
              : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {myCourses.map((course) => (
                    <div key={course.id} style={{ padding:"18px 20px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                        <div style={{ flex:1, minWidth:200 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                            <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:course.status==="approved"?"#d1fae5":course.status==="rejected"?"#fee2e2":"#fef3c7", color:course.status==="approved"?"#065f46":course.status==="rejected"?"#991b1b":"#92400e" }}>
                              {course.status==="approved"?"вњ“ Tasdiqlangan":course.status==="rejected"?"вњ— Rad etilgan":"вЏі Kutilmoqda"}
                            </span>
                            <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:"#eff6ff", color:"#3b82f6" }}>{course.category}</span>
                          </div>
                          <h4 style={{ margin:"0 0 4px", fontSize:16, fontWeight:700, color:darkMode?"#f1f5f9":"#111" }}>{course.title}</h4>
                          <p style={{ margin:"0 0 10px", fontSize:13, color:"#6b7280", lineHeight:1.5 }}>{course.description?.slice(0,100)}...</p>
                          <div style={{ display:"flex", gap:16, fontSize:12, color:"#6b7280", flexWrap:"wrap" }}>
                            <span>вЏ± {course.duration}</span><span>рџ‘Ґ {course.students||0}</span>
                            <span>в­ђ {course.rating||0}</span><span>рџ“љ {course.lessons?.length||0} dars</span>
                            <span>рџ’° {course.price===0?"Bepul":`${Number(course.price).toLocaleString()} so'm`}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCourse(course.id)}
                          style={{ padding:"8px 14px", borderRadius:10, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                          <LuTrash2 size={14}/> O'chirish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {activeTab === "live" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:darkMode?"#f1f5f9":"#111" }}>рџ”ґ Live Darslar Tarixi</h3>
                <button onClick={() => setShowLive(true)} style={{ padding:"10px 18px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <LuRadio size={15}/> Yangi Live
                </button>
              </div>
              {pastLives.length === 0
                ? <div style={{ textAlign:"center", padding:"48px 0" }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>рџ“№</div>
                    <p style={{ color:"#6b7280", marginBottom:16 }}>Hali live dars o'tkazilmagan</p>
                    <button onClick={() => setShowLive(true)} style={{ padding:"12px 24px", background:"#ef4444", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>Birinchi Live Darsni Boshlang</button>
                  </div>
                : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {pastLives.map((live) => (
                      <div key={live.id} style={{ padding:"16px 20px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                        <div style={{ width:44,height:44,borderRadius:10,background:live.status==="live"?"#ef4444":"#334155",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <LuRadio size={20} color="#fff"/>
                        </div>
                        <div style={{ flex:1, minWidth:160 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                            <p style={{ margin:0, fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{live.title}</p>
                            <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700, background:live.status==="live"?"#fee2e2":"#f1f5f9", color:live.status==="live"?"#ef4444":"#6b7280" }}>
                              {live.status==="live"?"рџ”ґ LIVE":"Yakunlandi"}
                            </span>
                          </div>
                          <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>
                            рџ“… {live.startedAt?.toDate?.()?.toLocaleString("uz") || "—”"}
                            {live.viewers > 0 && ` В· рџ‘Ѓ ${live.viewers} tomoshabin`}
                          </p>
                        </div>
                        {live.status === "ended" && (
                          <button onClick={() => handleDeleteLive(live.id)} disabled={deletingLive === live.id}
                            style={{ padding:"8px 14px", borderRadius:10, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", fontSize:12, cursor:deletingLive===live.id?"default":"pointer", display:"flex", alignItems:"center", gap:6, flexShrink:0, opacity:deletingLive===live.id?0.5:1 }}
                            onMouseEnter={(e) => { if (deletingLive!==live.id) e.currentTarget.style.background="#fee2e2"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; }}>
                            {deletingLive===live.id
                              ? <span style={{ width:13,height:13,borderRadius:"50%",border:"2px solid #ef4444",borderTopColor:"transparent",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>
                              : <LuTrash2 size={14}/>}
                            O'chirish
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {activeTab === "stats" && (
            <div style={{ padding:"24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <h3 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700, color:darkMode?"#f1f5f9":"#111" }}>Umumiy statistika</h3>
              {myCourses.length === 0
                ? <p style={{ color:"#6b7280", textAlign:"center", padding:"40px 0" }}>Hali ma'lumot yo'q</p>
                : <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {myCourses.map((course) => (
                      <div key={course.id} style={{ padding:"14px 16px", borderRadius:12, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <p style={{ margin:0, fontWeight:600, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{course.title}</p>
                          <span style={{ fontSize:12, color:"#6b7280" }}>{course.students||0} talaba</span>
                        </div>
                        <div style={{ height:8, borderRadius:4, background:darkMode?"#334155":"#e5e7eb" }}>
                          <div style={{ height:"100%", borderRadius:4, background:"#3b82f6", width:`${Math.min(100,((course.students||0)/Math.max(1,totalStudents))*100)}%`, transition:"width 0.5s" }}/>
                        </div>
                        <div style={{ display:"flex", gap:16, marginTop:8, fontSize:12, color:"#6b7280" }}>
                          <span>в­ђ {course.rating||0}</span>
                          <span>рџ’° {course.price===0?"Bepul":`${Number(course.price).toLocaleString()} so'm`}</span>
                          <span style={{ marginLeft:"auto", color:course.status==="approved"?"#10b981":"#f59e0b", fontWeight:600 }}>
                            {course.status==="approved"?"вњ“ Faol":"вЏі Kutilmoqda"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
};

export default InstructorPanel;
