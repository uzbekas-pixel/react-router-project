import React, { useState, useEffect } from "react";

import { db } from "../firebase/config";
import {
  collection, doc, getDoc, getDocs, setDoc,
 updateDoc, serverTimestamp, increment,
} from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import { giveReward } from "../utils/rewardSystem";
import { useLang } from "../context/useLang"; // Added useLang import
import { 
  LuLightbulb, LuStar, LuGem, LuRocket, LuCrown, 
  LuTicket, LuGift, LuHistory, LuLock, LuCheck, LuClock 
} from "react-icons/lu";

const getGifts = (t) => [
  { 
    id: "g1", 
    title: t.giftQuizHelper, 
    icon: <LuLightbulb className="text-yellow-400" />, 
    desc: t.giftQuizHelperDesc, 
    xpRequired: 1000 
  },
  { 
    id: "g2", 
    title: t.gift1MonthPro, 
    icon: <LuStar className="text-blue-400" />, 
    desc: t.gift1MonthProDesc, 
    xpRequired: 2000 
  },
  { 
    id: "g3", 
    title: t.gift1MonthPremium, 
    icon: <LuGem className="text-purple-400" />, 
    desc: t.gift1MonthPremiumDesc, 
    xpRequired: 3000 
  },
  { 
    id: "g4", 
    title: t.gift1YearPro, 
    icon: <LuRocket className="text-blue-500" />, 
    desc: t.gift1YearProDesc, 
    xpRequired: 5000 
  },
  { 
    id: "g5", 
    title: t.gift1YearPremium, 
    icon: <LuCrown className="text-yellow-500" />, 
    desc: t.gift1YearPremiumDesc, 
    xpRequired: 8000 
  }
];

const PromoCode = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang(); // Added useLang hook
  const GIFTS = getGifts(t); // Modified GIFTS array
  const [code, setCode]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [myXP, setMyXP]               = useState(0);
  const [claimedGifts, setClaimedGifts] = useState([]);
  const [history, setHistory]         = useState([]);
  const [activeTab, setActiveTab]     = useState("promo");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setDataLoading(true);
      try {
        // XP
        const statsSnap = await getDoc(doc(db, "users", user.uid, "data", "stats"));
        if (!cancelled && statsSnap.exists()) setMyXP(statsSnap.data().xp || 0);

        // Ishlatilgan kodlar
        const usedSnap = await getDocs(collection(db, "users", user.uid, "usedCodes"));
        if (!cancelled) {
          const hist = usedSnap.docs.map((d) => ({
            code:     d.id,
            discount: d.data().discount,
            course:   d.data().course,
            date:     d.data().usedAt?.toDate?.()?.toLocaleDateString("uz") || "—",
            status:   t.statusUsed,
          }));
          setHistory(hist.reverse());
        }

        // Olingan sovg'alar
        const achSnap = await getDoc(doc(db, "users", user.uid, "data", "achievements"));
        if (!cancelled && achSnap.exists()) {
          const ach = achSnap.data();
          setClaimedGifts(Object.keys(ach).filter((k) => k.startsWith("gift_") && ach[k]));
        }
      } catch (err) {
        console.error("PromoCode load error:", err);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const handleApply = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    setResult(null);

    const upperCode = code.trim().toUpperCase();

    try {
      // Avval ishlatilganmi tekshir
      const usedRef  = doc(db, "users", user.uid, "usedCodes", upperCode);
      const usedSnap = await getDoc(usedRef);
      if (usedSnap.exists()) {
        setResult({ success: false, message: t.promoAlreadyUsed });
        setLoading(false);
        return;
      }

      // Promo kodni tekshir
      const promoRef  = doc(db, "promoCodes", upperCode);
      const promoSnap = await getDoc(promoRef);

      if (!promoSnap.exists()) {
        setResult({ success: false, message: t.promoNotFound });
        setLoading(false);
        return;
      }

      const promo = promoSnap.data();

      if (!promo.valid) {
        setResult({ success: false, message: t.promoDisabled });
        setLoading(false);
        return;
      }

      if (promo.uses >= promo.maxUses) {
        setResult({ success: false, message: t.promoLimitReached });
        setLoading(false);
        return;
      }

      const discountText = promo.type === "percent"
        ? `${promo.discount}%`
        : `${Number(promo.discount).toLocaleString()} so'm`;

      // Promo uses oshirish
      await updateDoc(promoRef, { uses: increment(1) });

      // Foydalanuvchi usedCodes ga yozish — setDoc (import tepada)
      await setDoc(usedRef, {
        discount: discountText,
        course:   promo.course === "all" ? t.allCourses : promo.course,
        coins:    promo.coins || 0,
        usedAt:   serverTimestamp(),
      });

      // Agar coinlar bo'lsa, foydalanuvchiga coin qo'shish
      if (promo.coins && promo.coins > 0) {
        await giveReward(user.uid, promo.coins, "coins", `Promokod "${upperCode}" bo'yicha`);
      }

      // Natija xabarini tayyorlash
      const hasDiscount = promo.discount && promo.discount > 0;
      const hasCoins = promo.coins && promo.coins > 0;
      let successMessage = t.promoAccepted;
      if (hasDiscount && hasCoins) {
        successMessage = `${discountText} chegirma va ${promo.coins} coin qo'shildi!`;
      } else if (hasCoins && !hasDiscount) {
        successMessage = `${promo.coins} coin qo'shildi!`;
      }

      setResult({
        success:  true,
        message:  successMessage,
        discount: hasDiscount ? discountText : null,
        coins:    hasCoins ? promo.coins : null,
        course:   promo.course === "all" ? t.allCourses : promo.course,
      });

      setHistory((prev) => [{
        code:     upperCode,
        discount: hasDiscount ? discountText : (hasCoins ? `${promo.coins} coin` : "-"),
        course:   promo.course === "all" ? t.allCourses : promo.course,
        date:     new Date().toLocaleDateString("uz"),
        status:   t.statusApplied,
      }, ...prev]);

      const toastMessage = hasDiscount && hasCoins
        ? `${discountText} chegirma va ${promo.coins} coin!`
        : hasCoins
        ? `${promo.coins} coin qo'shildi!`
        : `${discountText} ${t.discountAdded}`;
      showToast?.(toastMessage, "success");
      setCode("");

    } catch (err) {
      console.error("PromoCode apply error:", err);
      setResult({ success: false, message: t.errorOccurred });
    }
    setLoading(false);
  };

 const claimGift = async (gift) => {
    if (!user) return;
    if (myXP < gift.xpRequired) {
      showToast?.(`${t.insufficientXP} ${gift.xpRequired} XP`, "error");
      return;
    }
    const key = `gift_${gift.id}`;
    if (claimedGifts.includes(key)) return;

    try {
      const achRef  = doc(db, "users", user.uid, "data", "achievements");
      const achSnap = await getDoc(achRef);
      const existing = achSnap.exists() ? achSnap.data() : {};
      
      await setDoc(achRef, { ...existing, [key]: true });
      
      // BU QISM YANGI QO'SHILDI: Agar "Quiz yordamchisi" olingan bo'lsa, stats ga 10 ta yordam beramiz
      if (gift.id === "g1") {
        const statsRef = doc(db, "users", user.uid, "data", "stats");
        await updateDoc(statsRef, { quizHints: increment(10) });
      }

      setClaimedGifts((prev) => [...prev, key]);
      showToast?.(`${gift.title} ${t.giftClaimed}`, "success");
    } catch (err) {
      console.error("claimGift error:", err);
      showToast?.(t.errorOccurred, "error");
    }
  };

  const inputStyle = {
    width: "100%", padding:"12px 16px", borderRadius:12,
    border: `1px solid ${result?.success ? "#10b981" : result?.success === false ? "#ef4444" : (darkMode?"#334155":"#e5e7eb")}`,
    background: darkMode?"#0f172a":"#f8fafc",
    color: darkMode?"#f1f5f9":"#111",
    fontSize:15, outline:"none", letterSpacing:"0.06em", fontWeight:600, boxSizing:"border-box",
  };

  return (
    <div style={{ width:"100%", maxWidth:720, margin:"0 auto", padding:"40px 16px 80px" }}>
      <div>
        <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #bfdbfe" }}>
          {t.bonuses}
        </span>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>{t.promoAndGifts}</h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>{t.promoSubtitle}</p>

        {/* XP card */}
        <div style={{ marginBottom:24, padding:"16px 20px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>{t.myXP}</p>
            <p style={{ margin:"4px 0 0", fontSize:28, fontWeight:800, color:"#f59e0b" }}>
              {dataLoading ? "..." : myXP.toLocaleString()} <LuStar className="inline text-yellow-500 mb-1" />
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{t.nextGift}</p>
            <p style={{ margin:"4px 0 0", fontSize:14, fontWeight:600, color:"#3b82f6" }}>
              {GIFTS.find((g) => !claimedGifts.includes(`gift_${g.id}`) && g.xpRequired > myXP)?.xpRequired.toLocaleString() || t.allClaimed} XP
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:darkMode?"#1e293b":"#f1f5f9", borderRadius:12, padding:4 }}>
          {[
            { id:"promo",   label: <><LuTicket className="inline mr-1" /> {t.tabPromo}</> },
            { id:"gifts",   label: <><LuGift className="inline mr-1" /> {t.tabGifts}</>  },
            { id:"history", label: <><LuHistory className="inline mr-1" /> {t.tabHistory}</>       },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:"none", cursor:"pointer", background:activeTab===t.id?"#3b82f6":"transparent", color:activeTab===t.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600, transition:"all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* в”Ђв”Ђ PROMO TAB в”Ђв”Ђ */}
      {activeTab === "promo" && (
        <div>
          <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px" }}>
            <p style={{ margin:"0 0 14px", fontWeight:600, fontSize:15, color:darkMode?"#f1f5f9":"#111" }}>{t.enterPromoCode}</p>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                placeholder={t.promoPlaceholder}
                style={inputStyle}
              />
              <button onClick={handleApply} disabled={loading || !code.trim() || !user}
                style={{ padding:"12px 20px", borderRadius:12, background:loading||!code.trim()?"#94a3b8":"#3b82f6", color:"#fff", border:"none", cursor:loading||!code.trim()?"default":"pointer", fontWeight:700, fontSize:14, whiteSpace:"nowrap", flexShrink:0 }}>
                {loading ? <LuClock className="animate-spin" /> : t.verify}
              </button>
            </div>

            {result && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:result.success?"#d1fae5":"#fee2e2", border:`1px solid ${result.success?"#10b981":"#ef4444"}`, marginBottom:14 }}>
                <p style={{ margin:0, fontWeight:600, fontSize:13, color:result.success?"#065f46":"#991b1b" }}>{result.message}</p>
                {result.success && (
                  <p style={{ margin:"6px 0 0", fontSize:12, color:"#065f46" }}>
                    {t.courseLabel} <strong>{result.course}</strong> В· {t.discountLabel} <strong>{result.discount}</strong>
                  </p>
                )}
              </div>
            )}

            {!user && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"#fef3c7", border:"1px solid #f59e0b" }}>
                <p style={{ margin:0, fontSize:13, color:"#92400e" }}>⚠️ {t.loginToUsePromo}</p>
              </div>
            )}

            <div style={{ marginTop:20, padding:"14px 16px", borderRadius:10, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#6b7280", fontWeight:600 }}>ℹ️ {t.whereToGetPromo}</p>
              <p style={{ margin:0, fontSize:12, color:"#6b7280", lineHeight:1.6 }}>
                {t.promoInfo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ GIFTS TAB в”Ђв”Ђ */}
      {activeTab === "gifts" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
            {GIFTS.map((gift) => {
              const key      = `gift_${gift.id}`;
              const claimed  = claimedGifts.includes(key);
              const canClaim = myXP >= gift.xpRequired;
              const pct      = Math.min(100, Math.round((myXP / gift.xpRequired) * 100));
              return (
                <div key={gift.id} style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${claimed?"#10b981":(darkMode?"#334155":"#e5e7eb")}`, borderRadius:14, padding:"20px 16px", textAlign:"center", opacity:claimed?0.75:1, position:"relative" }}>
                  {claimed && <span style={{ position:"absolute", top:10, right:10, fontSize:16 }}><LuCheck className="text-emerald-500" /></span>}
                  <div style={{ fontSize:36, marginBottom:10 }}>{gift.icon}</div>
                  <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{gift.title}</p>
                  <p style={{ margin:"0 0 12px", fontSize:11, color:"#6b7280", lineHeight:1.5 }}>{gift.desc}</p>
                  <div style={{ height:5, borderRadius:3, background:darkMode?"#334155":"#e5e7eb", marginBottom:8 }}>
                    <div style={{ height:"100%", borderRadius:3, background:canClaim?"#10b981":"#3b82f6", width:`${pct}%`, transition:"width 0.5s" }}/>
                  </div>
                  <p style={{ margin:"0 0 10px", fontSize:11, color:canClaim?"#10b981":"#6b7280", fontWeight:600 }}>
                    {gift.xpRequired.toLocaleString()} {t.xpRequired}
                  </p>
                  <button onClick={() => claimGift(gift)} disabled={!canClaim || claimed}
                    style={{ width:"100%", padding:"8px 0", borderRadius:8, border:"none", background:claimed?"#d1fae5":canClaim?"#10b981":"#94a3b8", color:claimed?"#065f46":"#fff", fontSize:12, fontWeight:700, cursor:canClaim&&!claimed?"pointer":"default" }}>
                    {claimed ? t.claimed : canClaim ? <><LuGift className="inline mr-1" /> {t.claim}</> : <><LuLock className="inline mr-1" /> {(gift.xpRequired - myXP).toLocaleString()} {t.xpRequired}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ HISTORY TAB в”Ђв”Ђ */}
      {activeTab === "history" && (
        <div>
          {dataLoading ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#6b7280" }}>{t.loading}</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <LuTicket className="text-slate-400 mx-auto mb-4" size={48} />
              <p style={{ color:"#6b7280" }}>{t.noPromoUsed}</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                  <LuTicket className="text-blue-500" />
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111", fontFamily:"monospace" }}>{h.code}</p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{h.course} В· {h.date}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#10b981" }}>{h.discount}</p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{h.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCode;
