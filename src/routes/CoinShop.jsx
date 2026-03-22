import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import {
  LuCoins, LuShoppingBag, LuZap, LuStar,
  LuCheck, LuLock, LuGift, LuHistory,
  LuPalette, LuBadgeCheck,
} from "react-icons/lu";

const SHOP_ITEMS = [
  { id:"xp_boost_2x",   category:"boost", icon:"⚡", name:"XP Boost x2",    desc:"1 soat XP 2x",                price:50,  color:"#f59e0b" },
  { id:"xp_boost_3x",   category:"boost", icon:"🚀", name:"XP Boost x3",    desc:"3 soat XP 3x",                price:120, color:"#ef4444" },
  { id:"streak_shield", category:"boost", icon:"🛡️", name:"Streak Shield",  desc:"1 kun streak himoyasi",       price:30,  color:"#3b82f6" },
  { id:"hint_pack",     category:"boost", icon:"💡", name:"Hint Pack",       desc:"Quiz da 3 ta maslahat",       price:40,  color:"#8b5cf6" },
  { id:"daily_double",  category:"boost", icon:"🎯", name:"Daily Double",    desc:"Kunlik vazifalardan 2x coin", price:70,  color:"#06b6d4" },
  { id:"extra_lives",   category:"boost", icon:"❤️", name:"Extra Lives",     desc:"Quiz da 3 ta urinish",        price:60,  color:"#ef4444" },
  { id:"xp_pack_500",   category:"xp",   icon:"⭐", name:"500 XP Pack",     desc:"Darhol +500 XP",              price:100, color:"#10b981" },
  { id:"xp_pack_1000",  category:"xp",   icon:"🌟", name:"1000 XP Pack",    desc:"Darhol +1000 XP",             price:180, color:"#f59e0b" },
  { id:"theme_neon",    category:"theme", icon:"🌈", name:"Neon mavzu",      desc:"Neon rangli maxsus mavzu",    price:100, color:"#06b6d4" },
  { id:"theme_gold",    category:"theme", icon:"✨", name:"Gold mavzu",      desc:"Oltin rangli maxsus mavzu",   price:120, color:"#d97706" },
  { id:"badge_champion",category:"badge", icon:"🏆", name:"Champion Badge", desc:"Profilga Champion nishon",    price:150, color:"#f59e0b" },
  { id:"badge_pro",     category:"badge", icon:"💎", name:"Pro Badge",       desc:"Profilga Pro nishon",         price:200, color:"#8b5cf6" },
];

const CATEGORIES = [
  { id:"all",   label:"Barchasi",  icon:<LuShoppingBag size={14}/> },
  { id:"boost", label:"Boostlar",  icon:<LuZap size={14}/>         },
  { id:"xp",    label:"XP Paklar", icon:<LuStar size={14}/>        },
  { id:"theme", label:"Mavzular",  icon:<LuPalette size={14}/>     },
  { id:"badge", label:"Nishonlar", icon:<LuBadgeCheck size={14}/>  },
];

const XP_PER_COIN = 10;

const CoinShop = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [coins, setCoins]           = useState(0);
  const [xp, setXp]                 = useState(0);
  const [owned, setOwned]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [buying, setBuying]         = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState(100);
  const [tab, setTab]               = useState("shop");
  const [category, setCategory]     = useState("all");

  // Real-time wallet listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid, "data", "wallet"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setCoins(d.coins || 0);
        setOwned(d.owned || []);
        setHistory(d.history || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // XP yuklash (bir marta)
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "data", "stats"))
      .then((s) => { if (s.exists()) setXp(s.data().xp || 0); })
      .catch(() => {});
  }, [user]);

  const buyItem = async (item) => {
    if (!user || buying) return;
    const notBuyable = owned.includes(item.id) && item.category !== "boost" && item.category !== "xp";
    if (notBuyable) { showToast?.("Bu mahsulot sizda bor!", "error"); return; }
    if (coins < item.price) { showToast?.("Yetarli coin yo'q!", "error"); return; }

    setBuying(item.id);
    try {
      const wRef  = doc(db, "users", user.uid, "data", "wallet");
      const wSnap = await getDoc(wRef);
      const w     = wSnap.exists() ? wSnap.data() : { coins: 0, owned: [], history: [] };

      const newOwned = (item.category !== "boost" && item.category !== "xp")
        ? [...new Set([...(w.owned || []), item.id])]
        : (w.owned || []);

      const newHistory = [
        { id: item.id, name: item.name, icon: item.icon, price: item.price, date: new Date().toLocaleDateString("uz") },
        ...(w.history || []),
      ].slice(0, 20);

      const newCoins = (w.coins || 0) - item.price;

      // Wallet yangilash — setDoc merge bilan (dynamic import yo'q)
      await setDoc(wRef, {
        coins:     newCoins,
        owned:     newOwned,
        history:   newHistory,
        updatedAt: serverTimestamp(),
      });

      // XP pack bo'lsa stats yangilash
      if (item.id === "xp_pack_500" || item.id === "xp_pack_1000") {
        const bonus    = item.id === "xp_pack_500" ? 500 : 1000;
        const sRef     = doc(db, "users", user.uid, "data", "stats");
        const sSnap    = await getDoc(sRef);
        const curXP    = sSnap.exists() ? (sSnap.data().xp || 0) : 0;
        await setDoc(sRef, { ...(sSnap.data() || {}), xp: curXP + bonus });
        setXp(curXP + bonus);
      }

      showToast?.(`✅ "${item.name}" sotib olindi!`, "success");
    } catch (err) {
      console.error("buyItem error:", err);
      showToast?.("Xatolik!", "error");
    }
    setBuying(null);
  };

  const convertXpToCoins = async () => {
    if (!user || converting || xp < XP_PER_COIN) return;
    const maxConvertable = Math.floor(xp / XP_PER_COIN) * XP_PER_COIN;
    const amount = Math.min(convertAmount, maxConvertable);
    const gained = Math.floor(amount / XP_PER_COIN);
    if (gained <= 0) return;

    setConverting(true);
    try {
      // Stats yangilash
      const sRef  = doc(db, "users", user.uid, "data", "stats");
      const sSnap = await getDoc(sRef);
      const curXP = sSnap.exists() ? (sSnap.data().xp || 0) : 0;
      await setDoc(sRef, { ...(sSnap.data() || {}), xp: curXP - amount });
      setXp(curXP - amount);

      // Wallet yangilash
      const wRef  = doc(db, "users", user.uid, "data", "wallet");
      const wSnap = await getDoc(wRef);
      const curW  = wSnap.exists() ? wSnap.data() : { coins: 0, owned: [], history: [] };
      await setDoc(wRef, {
        ...curW,
        coins:     (curW.coins || 0) + gained,
        updatedAt: serverTimestamp(),
      });

      showToast?.(`✅ ${amount} XP → ${gained} Coin!`, "success");
    } catch (err) {
      console.error("convertXpToCoins error:", err);
      showToast?.("Xatolik!", "error");
    }
    setConverting(false);
  };

  const filtered = category === "all" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === category);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:300 }}>
      <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #f59e0b", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ width:"100%", maxWidth:800, margin:"0 auto", padding:"40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ marginBottom:24 }}>
          <span style={{ display:"inline-block", background:"#fef3c7", color:"#d97706", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #fcd34d" }}>
            🪙 Do'kon
          </span>
          <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>Coin Do'kon</h2>
          <p style={{ margin:0, fontSize:14, color:"#6b7280" }}>XP ni coinga aylantiring va maxsus narsalar oling</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
          {[
            { icon:<LuCoins size={20}/>, color:"#f59e0b", label:"Coinlar", value:coins },
            { icon:<LuStar size={20}/>,  color:"#3b82f6", label:"XP",      value:xp.toLocaleString() },
          ].map((s,i) => (
            <div key={i} style={{ padding:"18px 20px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, color:s.color }}>{s.icon}<span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>{s.label}</span></div>
              <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {[
            { id:"shop",    label:"Do'kon",  icon:<LuShoppingBag size={15}/> },
            { id:"convert", label:"XP→Coin", icon:<LuCoins size={15}/>       },
            { id:"history", label:"Tarix",   icon:<LuHistory size={15}/>     },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"10px 0", borderRadius:12, border:"none", background:tab===t.id?"#f59e0b":(darkMode?"#1e293b":"#f1f5f9"), color:tab===t.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── SHOP TAB ── */}
      {tab === "shop" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding:"6px 14px", borderRadius:20, border:"none", background:category===c.id?"#f59e0b":(darkMode?"#1e293b":"#f1f5f9"), color:category===c.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.2s" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
            {filtered.map((item) => {
              const isOwned  = owned.includes(item.id);
              const canBuy   = coins >= item.price;
              const isBuying = buying === item.id;
              const noBuy    = isOwned && item.category !== "boost" && item.category !== "xp";
              return (
                <div key={item.id} style={{ padding:"18px 16px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${noBuy ? item.color+"66" : (darkMode?"#334155":"#e5e7eb")}`, position:"relative" }}>
                  {noBuy && (
                    <span style={{ position:"absolute", top:10, right:10, background:"#10b981", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>✓ Bor</span>
                  )}
                  <div style={{ fontSize:36, marginBottom:10 }}>{item.icon}</div>
                  <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:15, color:darkMode?"#f1f5f9":"#111" }}>{item.name}</p>
                  <p style={{ margin:"0 0 12px", fontSize:12, color:"#6b7280", lineHeight:1.5 }}>{item.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontWeight:800, fontSize:16, color:"#f59e0b" }}>🪙 {item.price}</span>
                    <button onClick={() => buyItem(item)} disabled={isBuying || noBuy}
                      style={{ padding:"8px 16px", borderRadius:10, border:"none", background:noBuy?(darkMode?"#334155":"#e5e7eb"):canBuy?item.color:"#94a3b8", color:noBuy?"#6b7280":"#fff", fontSize:13, fontWeight:700, cursor:isBuying||noBuy?"default":"pointer", display:"flex", alignItems:"center", gap:5 }}>
                      {isBuying
                        ? <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
                        : noBuy ? <><LuCheck size={14}/> Bor</>
                        : canBuy ? <><LuShoppingBag size={14}/> Ol</>
                        : <><LuLock size={14}/> Yetmaydi</>
                      }
                    </button>
                  </div>
                  {!canBuy && !noBuy && (
                    <p style={{ margin:"8px 0 0", fontSize:11, color:"#ef4444" }}>Yana 🪙{item.price - coins} kerak</p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      )}

      {/* ── CONVERT TAB ── */}
      {tab === "convert" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ padding:"24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, marginBottom:16 }}>
            <h3 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:8 }}>
              <LuCoins size={20} style={{ color:"#f59e0b" }}/> XP → Coin
            </h3>
            <p style={{ margin:"0 0 20px", fontSize:13, color:"#6b7280" }}>Har {XP_PER_COIN} XP = 1 Coin</p>

            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20, padding:"14px", borderRadius:12, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>Sarflaysiz</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#3b82f6" }}>{Math.min(convertAmount, xp)} XP</div>
              </div>
              <div style={{ fontSize:22 }}>→</div>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>Olasiz</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#f59e0b" }}>{Math.floor(Math.min(convertAmount, xp) / XP_PER_COIN)} 🪙</div>
              </div>
            </div>

            <input type="range"
              min={XP_PER_COIN}
              max={Math.max(XP_PER_COIN, Math.floor(xp / XP_PER_COIN) * XP_PER_COIN)}
              step={XP_PER_COIN}
              value={convertAmount}
              onChange={(e) => setConvertAmount(Number(e.target.value))}
              style={{ width:"100%", accentColor:"#f59e0b", marginBottom:8 }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b7280", marginBottom:16 }}>
              <span>Min: {XP_PER_COIN}</span>
              <span style={{ fontWeight:700, color:"#f59e0b" }}>{convertAmount} XP</span>
              <span>Max: {Math.floor(xp / XP_PER_COIN) * XP_PER_COIN}</span>
            </div>

            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {[100, 500, 1000, 2000].map((amt) => (
                <button key={amt}
                  onClick={() => setConvertAmount(Math.min(amt, Math.floor(xp / XP_PER_COIN) * XP_PER_COIN))}
                  style={{ padding:"6px 14px", borderRadius:10, border:`1px solid ${convertAmount === amt ? "#f59e0b" : (darkMode?"#334155":"#e5e7eb")}`, background:convertAmount === amt?"#f59e0b22":"transparent", color:convertAmount === amt?"#f59e0b":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  {amt} XP
                </button>
              ))}
            </div>

            <button onClick={convertXpToCoins} disabled={converting || xp < XP_PER_COIN}
              style={{ width:"100%", padding:"14px 0", borderRadius:12, border:"none", background:converting||xp<XP_PER_COIN?"#94a3b8":"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:15, fontWeight:700, cursor:converting||xp<XP_PER_COIN?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {converting
                ? <><div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/> Konvertatsiya...</>
                : <><LuCoins size={18}/> {convertAmount} XP → {Math.floor(convertAmount / XP_PER_COIN)} Coin</>
              }
            </button>
          </div>

          <div style={{ padding:"20px 24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
            <h4 style={{ margin:"0 0 14px", fontWeight:700, fontSize:15, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:6 }}>
              <LuGift size={16} style={{ color:"#10b981" }}/> Coin qanday topiladi?
            </h4>
            {[
              { icon:"📚", text:"Dars ko'rish",     coins:"+2"      },
              { icon:"🎯", text:"Quiz yechish",     coins:"+3"      },
              { icon:"🏆", text:"Turnir o'ynash",   coins:"+5"      },
              { icon:"🔥", text:"7 kun streak",     coins:"+10"     },
              { icon:"👥", text:"Do'st taklif",     coins:"+20"     },
              { icon:"⭐", text:"10 XP → 1 Coin",  coins:"konvert" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<5?`1px solid ${darkMode?"#334155":"#f3f4f6"}`:"none" }}>
                <span style={{ fontSize:18 }}>{item.icon}</span>
                <span style={{ flex:1, fontSize:13, color:darkMode?"#94a3b8":"#4b5563" }}>{item.text}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b" }}>{item.coins}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <ScrollReveal direction="up" delay={100}>
          {history.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
              <p style={{ color:darkMode?"#94a3b8":"#6b7280" }}>Hali hech narsa sotib olinmagan</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                  <span style={{ fontSize:28 }}>{h.icon}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{h.name}</p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{h.date}</p>
                  </div>
                  <span style={{ fontWeight:800, fontSize:15, color:"#f59e0b" }}>🪙 -{h.price}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default CoinShop;