import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  serverTimestamp, increment
} from "firebase/firestore";
import { useAuth } from "../context/useAuth";

// ─── Firestore structure ───────────────────────────────────────────────────────
// promoCodes/{code} → { discount, type, course, maxUses, uses, valid, createdAt }
// users/{uid}/usedCodes/{code} → { usedAt, discount }
// users/{uid}/data/stats → { xp, ... }

const GIFTS = [
  { id:"g1", title:"Bepul HTML kurs",    icon:"🎁", desc:"HTML Asoslar kursini bepul oling",        xpRequired:500  },
  { id:"g2", title:"Quiz bonus",          icon:"⭐", desc:"Keyingi quiz da +20% bonus ball",          xpRequired:1000 },
  { id:"g3", title:"CSS chegirma 30%",    icon:"🎨", desc:"CSS & Flexbox kursiga 30% chegirma",       xpRequired:1500 },
  { id:"g4", title:"Mentor sessiya",      icon:"👨‍🏫", desc:"O'qituvchi bilan 30 daqiqa bepul suhbat", xpRequired:2000 },
  { id:"g5", title:"Premium 1 oy",        icon:"💎", desc:"1 oylik Premium a'zolik bepul",            xpRequired:3000 },
  { id:"g6", title:"Barcha kurslar",      icon:"🚀", desc:"Barcha kurslarga 1 yillik kirish",          xpRequired:5000 },
];

const PromoCode = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [myXP, setMyXP]         = useState(0);
  const [claimedGifts, setClaimedGifts] = useState([]);
  const [history, setHistory]   = useState([]);
  const [activeTab, setActiveTab] = useState("promo");
  const [dataLoading, setDataLoading] = useState(true);

  // ─── Foydalanuvchi ma'lumotlarini yuklash ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setDataLoading(true);
      try {
        // XP
        const statsRef  = doc(db, "users", user.uid, "data", "stats");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) setMyXP(statsSnap.data().xp || 0);

        // Ishlatilgan kodlar tarixi
        const usedRef  = collection(db, "users", user.uid, "usedCodes");
        const usedSnap = await getDocs(usedRef);
        const hist = usedSnap.docs.map((d) => ({
          code:     d.id,
          discount: d.data().discount,
          course:   d.data().course,
          date:     d.data().usedAt?.toDate?.()?.toLocaleDateString("uz") || "—",
          status:   "Ishlatildi",
        }));
        setHistory(hist.reverse());

        // Olingan sovg'alar
        const achRef  = doc(db, "users", user.uid, "data", "achievements");
        const achSnap = await getDoc(achRef);
        if (achSnap.exists()) {
          const ach = achSnap.data();
          setClaimedGifts(Object.keys(ach).filter((k) => k.startsWith("gift_") && ach[k]));
        }
      } catch (err) {
        console.error(err);
      }
      setDataLoading(false);
    };
    load();
  }, [user]);

  // ─── Promo kod tekshirish ──────────────────────────────────────────────────
  const handleApply = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    setResult(null);

    const upperCode = code.trim().toUpperCase();

    try {
      // 1. Avval bu kodni ishlatganmi tekshir
      const usedRef  = doc(db, "users", user.uid, "usedCodes", upperCode);
      const usedSnap = await getDoc(usedRef);
      if (usedSnap.exists()) {
        setResult({ success: false, message: "❌ Siz bu promo kodni allaqachon ishlatgansiz!" });
        setLoading(false);
        return;
      }

      // 2. Promo kodni Firestore dan ol
      const promoRef  = doc(db, "promoCodes", upperCode);
      const promoSnap = await getDoc(promoRef);

      if (!promoSnap.exists()) {
        setResult({ success: false, message: "❌ Promo kod topilmadi!" });
        setLoading(false);
        return;
      }

      const promo = promoSnap.data();

      if (!promo.valid) {
        setResult({ success: false, message: "❌ Bu promo kod o'chirilgan!" });
        setLoading(false);
        return;
      }

      if (promo.uses >= promo.maxUses) {
        setResult({ success: false, message: "❌ Bu promo koddan foydalanish chegarasi tugagan!" });
        setLoading(false);
        return;
      }

      // 3. Tasdiqlash — foydalanuvchiga yoz
      const discountText = promo.type === "percent"
        ? `${promo.discount}%`
        : `${Number(promo.discount).toLocaleString()} so'm`;

      await updateDoc(promoRef, { uses: increment(1) });

      await addDoc(collection(db, "users", user.uid, "usedCodes"), {}).catch(() => {});
      // setDoc bilan aniq ID
      const { setDoc } = await import("firebase/firestore");
      await setDoc(usedRef, {
        discount:  discountText,
        course:    promo.course === "all" ? "Barcha kurslar" : promo.course,
        usedAt:    serverTimestamp(),
      });

      // 4. Natija
      setResult({
        success:  true,
        message:  `✅ Promo kod qabul qilindi!`,
        discount: discountText,
        course:   promo.course === "all" ? "Barcha kurslar" : promo.course,
      });

      setHistory((prev) => [{
        code: upperCode, discount: discountText,
        course: promo.course === "all" ? "Barcha kurslar" : promo.course,
        date: new Date().toLocaleDateString("uz"), status: "Ishlatildi",
      }, ...prev]);

      showToast && showToast(`🎉 ${discountText} chegirma qo'shildi!`, "success");
      setCode("");

    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "❌ Xatolik yuz berdi. Qayta urinib ko'ring." });
    }
    setLoading(false);
  };

  // ─── Sovg'a olish ─────────────────────────────────────────────────────────
  const claimGift = async (gift) => {
    if (!user) return;
    if (myXP < gift.xpRequired) {
      showToast && showToast(`Yetarli XP yo'q! Kerak: ${gift.xpRequired} XP`, "error");
      return;
    }
    const key = `gift_${gift.id}`;
    if (claimedGifts.includes(key)) return;

    try {
      const { setDoc } = await import("firebase/firestore");
      const achRef = doc(db, "users", user.uid, "data", "achievements");
      const achSnap = await getDoc(achRef);
      const existing = achSnap.exists() ? achSnap.data() : {};
      await setDoc(achRef, { ...existing, [key]: true });
      setClaimedGifts((prev) => [...prev, key]);
      showToast && showToast(`🎁 "${gift.title}" sovg'asi qabul qilindi!`, "success");
    } catch {
      showToast && showToast("Xatolik yuz berdi", "error");
    }
  };

  const inputStyle = {
    width: "100%", padding:"12px 16px", borderRadius:12,
    border: `1px solid ${result?.success?"#10b981":result?.success===false?"#ef4444":(darkMode?"#334155":"#e5e7eb")}`,
    background: darkMode?"#0f172a":"#f8fafc",
    color: darkMode?"#f1f5f9":"#111",
    fontSize:15, outline:"none", letterSpacing:"0.06em", fontWeight:600, boxSizing:"border-box",
  };

  return (
    <div style={{ width:"100%", maxWidth:720, margin:"0 auto", padding:"40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #bfdbfe" }}>
          🎁 Bonuslar
        </span>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>Promo Kodlar & Sovg'alar</h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:24 }}>Promo kod kiriting yoki XP yig'ib sovg'a oling</p>

        {/* XP card */}
        <div style={{ marginBottom:24, padding:"16px 20px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>Mening XP ballarim</p>
            <p style={{ margin:"4px 0 0", fontSize:28, fontWeight:800, color:"#f59e0b" }}>
              {dataLoading ? "..." : myXP.toLocaleString()} ⭐
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>Keyingi sovg'a</p>
            <p style={{ margin:"4px 0 0", fontSize:14, fontWeight:600, color:"#3b82f6" }}>
              {GIFTS.find((g)=>!claimedGifts.includes(`gift_${g.id}`)&&g.xpRequired>myXP)?.xpRequired.toLocaleString() || "Hammasi olindi"} XP
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:darkMode?"#1e293b":"#f1f5f9", borderRadius:12, padding:4 }}>
          {[{id:"promo",label:"🎟️ Promo Kod"},{id:"gifts",label:"🎁 Sovg'alar"},{id:"history",label:"📋 Tarix"}].map((tab)=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:"none", cursor:"pointer", background:activeTab===tab.id?"#3b82f6":"transparent", color:activeTab===tab.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600, transition:"all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Promo tab */}
      {activeTab === "promo" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px" }}>
            <p style={{ margin:"0 0 14px", fontWeight:600, fontSize:15, color:darkMode?"#f1f5f9":"#111" }}>Promo kodni kiriting</p>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <input
                value={code}
                onChange={(e)=>{ setCode(e.target.value.toUpperCase()); setResult(null); }}
                onKeyDown={(e)=>e.key==="Enter"&&handleApply()}
                placeholder="Masalan: EDUZONE25"
                style={inputStyle}
              />
              <button onClick={handleApply} disabled={loading||!code.trim()||!user}
                style={{ padding:"12px 20px", borderRadius:12, background:loading||!code.trim()?"#94a3b8":"#3b82f6", color:"#fff", border:"none", cursor:loading||!code.trim()?"default":"pointer", fontWeight:700, fontSize:14, whiteSpace:"nowrap", flexShrink:0 }}>
                {loading ? "⏳" : "Tasdiqlash"}
              </button>
            </div>

            {result && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:result.success?"#d1fae5":"#fee2e2", border:`1px solid ${result.success?"#10b981":"#ef4444"}`, marginBottom:14 }}>
                <p style={{ margin:0, fontWeight:600, fontSize:13, color:result.success?"#065f46":"#991b1b" }}>{result.message}</p>
                {result.success && (
                  <p style={{ margin:"6px 0 0", fontSize:12, color:"#065f46" }}>
                    Kurs: <strong>{result.course}</strong> · Chegirma: <strong>{result.discount}</strong>
                  </p>
                )}
              </div>
            )}

            {!user && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"#fef3c7", border:"1px solid #f59e0b" }}>
                <p style={{ margin:0, fontSize:13, color:"#92400e" }}>⚠️ Promo kod ishlatish uchun tizimga kiring!</p>
              </div>
            )}

            <div style={{ marginTop:20, padding:"14px 16px", borderRadius:10, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <p style={{ margin:"0 0 6px", fontSize:12, color:"#6b7280", fontWeight:600 }}>ℹ️ Promo kodlar qayerdan olinadi?</p>
              <p style={{ margin:0, fontSize:12, color:"#6b7280", lineHeight:1.6 }}>
                Promo kodlar Admin tomonidan yaratiladi va ijtimoiy tarmoqlarda, email orqali tarqatiladi.
                Hozircha test uchun Admin paneldan qo'shishingiz mumkin.
              </p>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Gifts tab */}
      {activeTab === "gifts" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14 }}>
            {GIFTS.map((gift)=>{
              const key      = `gift_${gift.id}`;
              const claimed  = claimedGifts.includes(key);
              const canClaim = myXP >= gift.xpRequired;
              const pct      = Math.min(100, Math.round((myXP / gift.xpRequired) * 100));
              return (
                <div key={gift.id} style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${claimed?"#10b981":(darkMode?"#334155":"#e5e7eb")}`, borderRadius:14, padding:"20px 16px", textAlign:"center", opacity:claimed?0.75:1, position:"relative" }}>
                  {claimed && <span style={{ position:"absolute", top:10, right:10, fontSize:16 }}>✅</span>}
                  <div style={{ fontSize:36, marginBottom:10 }}>{gift.icon}</div>
                  <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{gift.title}</p>
                  <p style={{ margin:"0 0 12px", fontSize:11, color:"#6b7280", lineHeight:1.5 }}>{gift.desc}</p>
                  <div style={{ height:5, borderRadius:3, background:darkMode?"#334155":"#e5e7eb", marginBottom:8 }}>
                    <div style={{ height:"100%", borderRadius:3, background:canClaim?"#10b981":"#3b82f6", width:`${pct}%`, transition:"width 0.5s" }}/>
                  </div>
                  <p style={{ margin:"0 0 10px", fontSize:11, color:canClaim?"#10b981":"#6b7280", fontWeight:600 }}>
                    {gift.xpRequired.toLocaleString()} XP kerak
                  </p>
                  <button onClick={()=>claimGift(gift)} disabled={!canClaim||claimed}
                    style={{ width:"100%", padding:"8px 0", borderRadius:8, border:"none", background:claimed?"#d1fae5":canClaim?"#10b981":"#94a3b8", color:claimed?"#065f46":"#fff", fontSize:12, fontWeight:700, cursor:canClaim&&!claimed?"pointer":"default" }}>
                    {claimed ? "✓ Olindi" : canClaim ? "🎁 Olish" : `🔒 ${(gift.xpRequired-myXP).toLocaleString()} XP kerak`}
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <ScrollReveal direction="up" delay={100}>
          {dataLoading ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#6b7280" }}>Yuklanmoqda...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🎟️</div>
              <p style={{ color:"#6b7280" }}>Hali promo kod ishlatilmagan</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                  <span style={{ fontSize:20 }}>🎟️</span>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111", fontFamily:"monospace" }}>{h.code}</p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{h.course} · {h.date}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#10b981" }}>{h.discount}</p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{h.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      )}
    </div>
  );
};

export default PromoCode;