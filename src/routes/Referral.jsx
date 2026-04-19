import React, { useState, useEffect } from "react";

import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import {
  collection, doc, getDoc, getDocs, setDoc,
  updateDoc, query, where, serverTimestamp, increment,
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import {
  LuUserPlus, LuUserCheck, LuUserX, LuUsers,
  LuSearch, LuTrophy, LuFlame, LuStar, LuMessageSquare,
  LuCheck, LuX, LuUser, LuSprout, LuBook, LuBrain, LuTarget, LuGem, LuCrown, LuBellOff, LuGift, LuCopy, LuZap, LuShare2, LuTicket, LuHistory, LuLock, LuLightbulb, LuClock,
} from "react-icons/lu";

const REFERRAL_XP = 100;
const REFERRED_XP = 50;

const Referral = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();

  const [referralCode,   setReferralCode]   = useState("");
  const [referredUsers,  setReferredUsers]  = useState([]);
  const [totalEarned,    setTotalEarned]    = useState(0);
  const [inputCode,      setInputCode]      = useState("");
  const [loading,        setLoading]        = useState(true);
  const [applying,       setApplying]       = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [alreadyUsed,    setAlreadyUsed]    = useState(false);

  // в”Ђв”Ђ Referral code yuklash в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const ref  = doc(db, "referrals", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          if (!cancelled) {
            setReferralCode(data.code || "");
            setTotalEarned(data.totalEarned || 0);
            setAlreadyUsed(!!data.usedCode);
          }
        } else {
          const code = `UZP-${user.uid.slice(0, 6).toUpperCase()}`;
          await setDoc(ref, {
            uid:         user.uid,
            code,
            totalEarned: 0,
            usedCode:    null,
            createdAt:   serverTimestamp(),
          });
          if (!cancelled) setReferralCode(code);
        }
      } catch (err) {
        console.error("Referral load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  // в”Ђв”Ђ Taklif qilingan userlar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!referralCode) return;
    let cancelled = false;

    const loadReferred = async () => {
      try {
        const q    = query(collection(db, "referrals"), where("usedCode", "==", referralCode));
        const snap = await getDocs(q);
        if (!cancelled) {
          setReferredUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Referred users load error:", err);
      }
    };

    loadReferred();
    return () => { cancelled = true; };
  }, [referralCode]);

  // в”Ђв”Ђ Kod qo'llash в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const applyCode = async () => {
    if (!user || !inputCode.trim()) return;
    const code = inputCode.trim().toUpperCase();

    if (code === referralCode) {
      showToast?.(t.cannotUseOwnCode, "error");
      return;
    }
    if (alreadyUsed) {
      showToast?.(t.alreadyUsedCode, "error");
      return;
    }

    setApplying(true);
    try {
      const q    = query(collection(db, "referrals"), where("code", "==", code));
      const snap = await getDocs(q);

      if (snap.empty) {
        showToast?.(t.codeNotFound, "error");
        setApplying(false);
        return;
      }

      const ownerDoc  = snap.docs[0];
      const ownerData = ownerDoc.data();

      await giveReward(ownerData.uid, REFERRAL_XP, "xp", t.referralReward);

      await updateDoc(doc(db, "referrals", ownerData.uid), {
        totalEarned: increment(REFERRAL_XP),
      });

      await giveReward(user.uid, REFERRED_XP, "xp", t.referredReward);

      await updateDoc(doc(db, "referrals", user.uid), {
        usedCode: code,
        usedAt:   serverTimestamp(),
      });

      await setDoc(
        doc(db, "users", ownerData.uid, "notifications", `ref_${Date.now()}`),
        {
          title:     t.referralNotification,
          message:   `${t.referralNotificationMessage} +${REFERRAL_XP} XP`,
          type:      "success",
          read:      false,
          createdAt: serverTimestamp(),
        }
      );

      setAlreadyUsed(true);
      setInputCode("");
      showToast?.(`${REFERRED_XP} ${t.xpAddedBoth}`, "success");

    } catch (err) {
      console.error("applyCode error:", err);
      showToast?.(t.error, "error");
    }
    setApplying(false);
  };

  // в”Ђв”Ђ Copy & Share в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    showToast?.(t.codeCopied, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `${t.shareTitle} ${t.shareTextLine1}\n${t.shareTextLine2} ${referralCode}\n+${REFERRED_XP} ${t.shareTextLine3}\nhttps://uzbekas.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: t.shareTitle, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      showToast?.(t.linkCopied, "success");
    }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:300 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #3b82f6", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ width:"100%", maxWidth:700, margin:"0 auto", padding:"40px 16px 80px" }}>
      <div>
        <div style={{ marginBottom:28 }}>
            <LuGift size={14} className={`${darkMode ? 'text-white' : 'text-black'}`} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} /> 
          <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>
            {t.referralTitle}
          </h2>
          <p style={{ margin:0, fontSize:14, color:"#6b7280" }}>
            {t.referralSubtitle}
          </p>
        </div>

        {/* Statistika */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { icon:<LuUsers size={20}/>,  color:"#3b82f6", value:referredUsers.length, label:t.referredCount },
            { icon:<LuStar size={20}/>,   color:"#f59e0b", value:`+${totalEarned}`,    label:t.totalXP       },
            { icon:<LuTrophy size={20}/>, color:"#10b981", value:REFERRAL_XP,          label:t.perReferral   },
          ].map((s,i) => (
            <div key={i} style={{ padding:"16px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, textAlign:"center" }}>
              <div style={{ color:s.color, display:"flex", justifyContent:"center", marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Referral kod */}
        <div style={{ padding:"24px", borderRadius:16, background:"linear-gradient(135deg,#3b82f611,#8b5cf611)", border:"2px solid #3b82f644", marginBottom:20 }}>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#6b7280", display:"flex", alignItems:"center", gap:6 }}>
            <LuGift size={14}/> {t.yourReferralCode}
          </p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ flex:1, padding:"14px 20px", borderRadius:12, background:darkMode?"#0f172a":"#fff", border:"2px dashed #3b82f6", textAlign:"center" }}>
              <span style={{ fontSize:24, fontWeight:800, color:"#3b82f6", letterSpacing:3, fontFamily:"monospace" }}>
                {referralCode || t.loading}
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <button onClick={copyCode}
                style={{ padding:"10px 16px", borderRadius:10, border:"none", background:copied?"#10b981":"#3b82f6", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
                {copied ? <><LuCheck size={16}/> {t.copied}</> : <><LuCopy size={16}/> {t.copy}</>}
              </button>
              <button onClick={shareCode}
                style={{ padding:"10px 16px", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:"transparent", color:darkMode?"#f1f5f9":"#374151", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                <LuShare2 size={16}/> {t.share}
              </button>
            </div>
          </div>

          <div style={{ display:"flex", gap:16, marginTop:16, flexWrap:"wrap" }}>
            {[
              { step:"1", text:t.referralStep1 },
              { step:"2", text:t.referralStep2 },
              { step:"3", text:t.referralStep3 },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:140 }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"#3b82f6", color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {s.step}
                </div>
                <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kod kiritish */}
        <div style={{ padding:"24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, marginBottom:24 }}>
          <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:6 }}>
            <LuZap size={16} style={{ color:"#f59e0b" }}/> {t.enterFriendCode}
          </p>

          {alreadyUsed ? (
            <div style={{ padding:"14px 16px", borderRadius:10, background:"#d1fae5", border:"1px solid #10b981", display:"flex", alignItems:"center", gap:10 }}>
              <LuCheck size={18} style={{ color:"#10b981", flexShrink:0 }}/>
              <p style={{ margin:0, fontSize:14, color:"#065f46", fontWeight:600 }}>
                {t.alreadyUsedReferral} +{REFERRED_XP} XP {t.earned}
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", gap:10 }}>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && applyCode()}
                placeholder={t.referralCodePlaceholder}
                style={{ flex:1, padding:"12px 16px", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:14, outline:"none", fontFamily:"monospace", letterSpacing:2 }}
              />
              <button onClick={applyCode} disabled={applying || !inputCode.trim()}
                style={{ padding:"12px 20px", borderRadius:10, border:"none", background:applying||!inputCode.trim()?"#94a3b8":"#10b981", color:"#fff", fontSize:14, fontWeight:700, cursor:applying||!inputCode.trim()?"default":"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                {applying
                  ? <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
                  : <><LuCheck size={16}/> {t.apply}</>
                }
              </button>
            </div>
          )}

          <p style={{ margin:"10px 0 0", fontSize:12, color:"#6b7280", display: 'flex', alignItems: 'center', gap: 6 }}>
            <LuLightbulb size={14} /> {t.referralOnceInfo} +{REFERRED_XP} XP {t.youGet}, {t.friendGets} +{REFERRAL_XP} XP.
          </p>
        </div>

        {/* Taklif qilinganlar */}
        {referredUsers.length > 0 && (
          <div>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:8 }}>
              <LuUsers size={18} style={{ color:"#3b82f6" }}/> {t.referredUsersTitle} ({referredUsers.length})
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {referredUsers.map((u) => (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                    {(u.displayName || u.uid || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:darkMode?"#f1f5f9":"#111" }}>
                      {u.displayName || t.user}
                    </p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>
                      {u.usedAt?.toDate?.()?.toLocaleDateString("uz") || "—”"}
                    </p>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#10b981", background:"#d1fae5", padding:"3px 10px", borderRadius:20 }}>
                    +{REFERRAL_XP} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Referral;
