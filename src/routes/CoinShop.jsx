import React, { useState, useEffect, useRef, useMemo } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  doc, getDoc, setDoc, onSnapshot, serverTimestamp,
  runTransaction, increment,
} from "firebase/firestore";
import {
  LuCoins, LuShoppingBag, LuZap, LuStar,
  LuCheck, LuLock, LuGift, LuHistory,
  LuPalette, LuBadgeCheck, LuVideo, LuUpload, LuSparkles,
  LuLoader, LuRocket, LuShield, LuLightbulb, LuTarget, LuHeart, LuGhost, LuTrophy, LuGem, LuFolder, LuFlower, LuLeaf, LuArrowRight, LuBookOpen, LuUserPlus, LuFlame, LuX
} from "react-icons/lu";
import { NAME_COLORS } from "../constants/shopConstants";

const IMGBB_KEY         = "2166816880e7d95d3a1fccc6a40a0a2b";
const DEFAULT_MAX_SNIPPETS = 5;
const XP_PER_COIN          = 10;

// ─── VIDEO AVATAR MODAL (imgbb) ───────────────────────────────────────────────
const VideoAvatarModal = ({ darkMode, onClose, onSave, showToast, t }) => {
  const [videoUrl,  setVideoUrl]  = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      showToast?.(t.videoFormatError, "error"); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast?.(t.videoSizeError, "error"); return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method:"POST", body:formData });
      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.data.url);
        showToast?.(t.videoUploadSuccess, "success");
      } else {
        showToast?.(t.videoUploadError, "error");
      }
    } catch {
      showToast?.(t.videoUploadError, "error");
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
      <div className={`w-full max-w-md p-8 rounded-4xl border shadow-2xl transition-all duration-500 ${
        darkMode ? "bg-slate-900 border-white/10 shadow-slate-900/50" : "bg-white border-slate-200 shadow-slate-200/50"
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`text-xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
            <LuVideo className="inline mr-3 text-red-500" /> {t.videoAvatarTitle}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 transition-colors">
            <LuX size={20} className="text-slate-500" />
          </button>
        </div>

        <p className="text-slate-500 text-sm font-medium mb-8 uppercase tracking-widest">{t.videoAvatarLimit}</p>

        <div
          onClick={() => fileRef.current?.click()}
          className={`group border-2 border-dashed rounded-4xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden ${
            darkMode ? "bg-slate-900/50 border-white/5 hover:border-red-500/50" : "bg-slate-50 border-slate-200 hover:border-red-500/50"
          }`}
        >
          {preview ? (
            <video src={preview} className="absolute inset-0 w-full h-full object-cover" muted autoPlay loop />
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <LuUpload size={32} className="text-red-500" />
              </div>
              <p className="text-slate-500 text-sm font-black mb-2 uppercase tracking-wide">{t.videoUploadPrompt}</p>
              <p className="text-slate-500/60 text-[10px] font-bold uppercase tracking-[0.15em]">MP4, WebM, OGG · max 10MB</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {uploading && (
          <div className={`mb-8 flex items-center gap-4 p-4 rounded-2xl ${darkMode ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <LuLoader size={20} className="text-red-500 animate-spin" />
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">{t.converting}</span>
          </div>
        )}

        <div className="mb-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">{t.videoUrlPrompt}</p>
          <input 
            type="url" 
            value={videoUrl} 
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className={`w-full px-6 py-4 rounded-xl border text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${
              darkMode ? "bg-slate-800/50 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${
              darkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            }`}
          >
            {t.cancelBtn}
          </button>
          <button
            onClick={() => { if (!videoUrl) { showToast?.(t.videoAvatarActive?.replace("!", "") || "", "error"); return; } onSave(videoUrl); }}
            disabled={!videoUrl || uploading}
            className={`flex-1 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-3 ${
              videoUrl && !uploading 
                ? "bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-500 active:scale-95" 
                : "bg-slate-500/20 text-slate-500 opacity-50 cursor-not-allowed"
            }`}
          >
            {uploading ? <LuLoader size={18} className="animate-spin" /> : t.saveBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const CoinShop = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();

  // ── SHOP ITEMS ──────────────────────────────────────────────────────────────
  const SHOP_ITEMS = useMemo(() => [
    // ─── BOOSTS ──────────────────────────────────────────────────────────
    { 
      id: "xp_boost_2x", 
      category: "boost", 
      icon: <LuZap />, 
      name: t.itemXpBoost2xName || "XP Boost 2x", 
      desc: t.itemXpBoost2xDesc || "2 soat davomida 2 baravar ko'p XP olish", 
      price: 50, 
      color: "#f59e0b" 
    },
    { 
      id: "xp_boost_3x", 
      category: "boost", 
      icon: <LuRocket />, 
      name: t.itemXpBoost3xName || "XP Boost 3x", 
      desc: t.itemXpBoost3xDesc || "1 soat davomida 3 baravar ko'p XP olish", 
      price: 120, 
      color: "#ef4444" 
    },
    { 
      id: "streak_shield", 
      category: "boost", 
      icon: <LuShield />, 
      name: t.itemStreakShieldName || "Streak Shield", 
      desc: t.itemStreakShieldDesc || "Bir kun dars qoldirsangiz, streakni saqlab qoladi", 
      price: 30, 
      color: "#3b82f6" 
    },
    { 
      id: "hint_pack", 
      category: "boost", 
      icon: <LuLightbulb />, 
      name: t.itemHintPackName || "Hint Pack", 
      desc: t.itemHintPackDesc || "Quizlarda foydalanish uchun 5 ta yordam (hint)", 
      price: 40, 
      color: "#8b5cf6" 
    },
    { 
      id: "daily_double", 
      category: "boost", 
      icon: <LuTarget />, 
      name: t.itemDailyDoubleName || "Daily Double", 
      desc: t.itemDailyDoubleDesc || "Bugungi vazifalar uchun 2 baravar ko'p Coin", 
      price: 70, 
      color: "#06b6d4" 
    },
    { 
      id: "extra_lives", 
      category: "boost", 
      icon: <LuHeart />, 
      name: t.itemExtraLivesName || "Extra Lives", 
      desc: t.itemExtraLivesDesc || "O'yinlarda foydalanish uchun +3 ta hayot", 
      price: 60, 
      color: "#ef4444" 
    },

    // ─── XP PACKS ────────────────────────────────────────────────────────
    { 
      id: "xp_pack_500", 
      category: "xp", 
      icon: <LuStar />, 
      name: t.itemXpPack500Name || "500 XP Pack", 
      desc: t.itemXpPack500Desc || "Darajangizni oshirish uchun 500 XP qo'shish", 
      price: 100, 
      color: "#10b981" 
    },
    { 
      id: "xp_pack_1000", 
      category: "xp", 
      icon: <LuSparkles />, 
      name: t.itemXpPack1000Name || "1000 XP Pack", 
      desc: t.itemXpPack1000Desc || "Darajangizni tezroq oshirish uchun 1000 XP qo'shish", 
      price: 180, 
      color: "#f59e0b" 
    },

    // ─── THEMES & BADGES ──────────────────────────────────────────────────
    { 
      id: "theme_neon", 
      category: "theme", 
      icon: <LuPalette />, 
      name: t.itemThemeNeonName || "Neon Theme", 
      desc: t.itemThemeNeonDesc || "Platforma uchun neon uslubidagi dizayn", 
      price: 100, 
      color: "#06b6d4" 
    },
    { 
      id: "theme_gold", 
      category: "theme", 
      icon: <LuSparkles />, 
      name: t.itemThemeGoldName || "Gold Theme", 
      desc: t.itemThemeGoldDesc || "Platforma uchun oltin uslubidagi dizayn", 
      price: 120, 
      color: "#d97706" 
    },
    { 
      id: "theme_dracula", 
      category: "dev", 
      icon: <LuGhost />, 
      name: t.itemThemeDraculaName || "Dracula Theme", 
      desc: t.itemThemeDraculaDesc || "Dasturchilar uchun maxsus qora (Dracula) mavzu", 
      price: 200, 
      color: "#8b5cf6" 
    },
    { 
      id: "badge_champion", 
      category: "badge", 
      icon: <LuTrophy />, 
      name: t.itemBadgeChampionName || "Champion Badge", 
      desc: t.itemBadgeChampionDesc || "Profil uchun maxsus Chempion nishoni", 
      price: 150, 
      color: "#f59e0b" 
    },
    { 
      id: "badge_pro", 
      category: "badge", 
      icon: <LuGem />, 
      name: t.itemBadgeProName || "Pro Badge", 
      desc: t.itemBadgeProDesc || "Profil uchun maxsus Professional nishoni", 
      price: 200, 
      color: "#8b5cf6" 
    },
    { 
      id: "snippet_slot_5", 
      category: "dev", 
      icon: <LuFolder />, 
      name: t.itemSnippetSlot5Name || "5x Snippet Slots", 
      desc: t.itemSnippetSlot5Desc || "Kod saqlash uchun qo'shimcha 5 ta joy", 
      price: 100, 
      color: "#10b981" 
    },

    // ─── IDENTITY (Names & Avatars) ───────────────────────────────────────
    { 
      id: "name_gold", 
      category: "identity", 
      icon: <LuSparkles />, 
      name: t.itemNameGoldName || "Oltin Ism", 
      desc: t.itemNameGoldDesc || "Ismingizni oltin rangda ko'rsatish", 
      price: 80, 
      color: "#d97706", 
      nameColor: "gold" 
    },
    { 
      id: "name_neon_blue", 
      category: "identity", 
      icon: <LuGem />, 
      name: t.itemNameNeonBlueName || "Neon Moviy Ism", 
      desc: t.itemNameNeonBlueDesc || "Ismingizni neon moviy rangda ko'rsatish", 
      price: 80, 
      color: "#06b6d4", 
      nameColor: "neon_blue" 
    },
    { 
      id: "name_neon_green", 
      category: "identity", 
      icon: <LuLeaf />, 
      name: t.itemNameNeonGreenName || "Neon Yashil Ism", 
      desc: t.itemNameNeonGreenDesc || "Ismingizni neon yashil rangda ko'rsatish", 
      price: 80, 
      color: "#10b981", 
      nameColor: "neon_green" 
    },
    { 
      id: "name_purple", 
      category: "identity", 
      icon: <LuSparkles />, 
      name: t.itemNamePurpleName || "Siyohrang Ism", 
      desc: t.itemNamePurpleDesc || "Ismingizni siyohrangda ko'rsatish", 
      price: 80, 
      color: "#8b5cf6", 
      nameColor: "purple" 
    },
    { 
      id: "name_rose", 
      category: "identity", 
      icon: <LuFlower />, 
      name: t.itemNameRoseName || "Atirgul Ism", 
      desc: t.itemNameRoseDesc || "Ismingizni pushti-rose rangda ko'rsatish", 
      price: 80, 
      color: "#f43f5e", 
      nameColor: "rose" 
    },
    { 
      id: "name_rainbow", 
      category: "identity", 
      icon: <LuSparkles />, 
      name: t.itemNameRainbowName || "Kamalak Ism", 
      desc: t.itemNameRainbowDesc || "Ismingizni kamalak rangida ko'rsatish", 
      price: 200, 
      color: "#6366f1", 
      nameColor: "rainbow" 
    },
    { 
      id: "video_avatar", 
      category: "identity", 
      icon: <LuVideo />, 
      name: t.itemVideoAvatarName || "Video Avatar", 
      desc: t.itemVideoAvatarDesc || "Profil rasmi o'rniga video o'rnatish imkoniyati", 
      price: 300, 
      color: "#ef4444" 
    },
  ], [t]);

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const CATEGORIES = useMemo(() => [
    { id:"all",      label:t.catAll,      icon:<LuShoppingBag size={14}/> },
    { id:"boost",    label:t.catBoosts,   icon:<LuZap size={14}/>         },
    { id:"xp",       label:t.catXP,       icon:<LuStar size={14}/>        },
    { id:"theme",    label:t.catThemes,   icon:<LuPalette size={14}/>     },
    { id:"badge",    label:t.catBadges,   icon:<LuBadgeCheck size={14}/>  },
    { id:"dev",      label:t.catDev,      icon:<LuCoins size={14}/>       },
    { id:"identity", label:t.catIdentity, icon:<LuSparkles size={14}/>    },
  ], [t]);

  // ── STATE ────────────────────────────────────────────────────────────────────
  const [coins,           setCoins]           = useState(0);
  const [xp,              setXp]              = useState(0);
  const [owned,           setOwned]           = useState([]);
  const [history,         setHistory]         = useState([]);
  const [activeNameColor, setActiveNameColor] = useState("default");
  const [videoAvatarUrl,  setVideoAvatarUrl]  = useState("");
  const [dataReady,       setDataReady]       = useState(false);
  const [buying,          setBuying]          = useState(null);
  const [converting,      setConverting]      = useState(false);
  const [convertAmount,   setConvertAmount]   = useState(100);
  const [tab,             setTab]             = useState("shop");
  const [category,        setCategory]        = useState("all");
  const [showVideoModal,  setShowVideoModal]  = useState(false);

  // ── FIREBASE LISTENERS ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid, "data", "wallet"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCoins(d.coins || 0);
          setOwned(d.owned || []);
          setHistory(d.history || []);
          setActiveNameColor(d.activeNameColor || "default");
          setVideoAvatarUrl(d.videoAvatarUrl || "");
        }
        setDataReady(true);
      },
      (error) => {
        console.error("CoinShop wallet snapshot error:", error);
        setDataReady(true);
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid, "data", "stats"), (snap) => {
      if (snap.exists()) setXp(snap.data().xp || 0);
    });
    return () => unsub();
  }, [user]);

  // ── FILTERED ITEMS ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const allItems = Array.isArray(SHOP_ITEMS) ? SHOP_ITEMS : [];
    if (category === "all") return allItems;
    return allItems.filter((item) => item.category === category);
  }, [category, SHOP_ITEMS]);

  // ── BUY ITEM ─────────────────────────────────────────────────────────────────
  const buyItem = async (item) => {
    if (!user || buying) return;
    const isConsumable = item.category === "boost" || item.category === "xp" || item.id === "snippet_slot_5";
    const notBuyable   = owned.includes(item.id) && !isConsumable;
    if (notBuyable)         { showToast?.(t.alreadyOwned, "error"); return; }
    if (coins < item.price) { showToast?.(t.insufficientCoins, "error"); return; }

    if (item.id === "video_avatar" && !owned.includes("video_avatar")) {
      setBuying(item.id);
      setShowVideoModal(true);
      return;
    }

    setBuying(item.id);
    try {
      const wRef = doc(db, "users", user.uid, "data", "wallet");
      await runTransaction(db, async (transaction) => {
        const wSnap = await transaction.get(wRef);
        const w     = wSnap.exists() ? wSnap.data() : { coins:0, owned:[], history:[] };
        if ((w.coins || 0) < item.price) throw new Error("INSUFFICIENT_COINS");
        const newOwned   = isConsumable ? (w.owned || []) : [...new Set([...(w.owned || []), item.id])];
        const extras     = {};
        if (item.nameColor) extras.activeNameColor = item.nameColor;
        const newHistory = [
          { id:item.id, name:item.name, price:item.price, date:new Date().toLocaleDateString(t.lang === "uz" ? "uz-UZ" : "en-US") },
          ...(w.history || []),
        ].slice(0, 20);
        transaction.set(wRef, { coins:(w.coins||0)-item.price, owned:newOwned, history:newHistory, updatedAt:serverTimestamp(), ...extras });
      });

      if (item.id === "xp_pack_500" || item.id === "xp_pack_1000") {
        const bonus = item.id === "xp_pack_500" ? 500 : 1000;
        const sRef  = doc(db, "users", user.uid, "data", "stats");
        const sSnap = await getDoc(sRef);
        const curXP = sSnap.exists() ? (sSnap.data().xp || 0) : 0;
        await setDoc(sRef, { ...(sSnap.data() || {}), xp:curXP + bonus });
        await setDoc(doc(db, "users", user.uid), { xp:increment(bonus) }, { merge:true });
        setXp(curXP + bonus);
      }
      if (item.id === "snippet_slot_5") {
        const uRef   = doc(db, "users", user.uid);
        const uSnap  = await getDoc(uRef);
        const curMax = uSnap.exists() ? (uSnap.data().maxSnippets ?? DEFAULT_MAX_SNIPPETS) : DEFAULT_MAX_SNIPPETS;
        await setDoc(uRef, { maxSnippets:curMax + 5 }, { merge:true });
      }
      if (item.nameColor) {
        await setDoc(doc(db, "users", user.uid), { nameColor:item.nameColor }, { merge:true });
      }
      showToast?.(`✅ "${item.name}" ${t.buySuccess}`, "success");
    } catch (err) {
      if (err.message === "INSUFFICIENT_COINS") showToast?.(t.insufficientCoins, "error");
      else showToast?.(t.updateError, "error");
    }
    setBuying(null);
  };

  // ── VIDEO AVATAR SAVE ────────────────────────────────────────────────────────
  const handleVideoAvatarSave = async (url) => {
    setShowVideoModal(false);
    if (!user || !url) { setBuying(null); return; }
    try {
      const wRef = doc(db, "users", user.uid, "data", "wallet");
      await runTransaction(db, async (transaction) => {
        const wSnap = await transaction.get(wRef);
        const w     = wSnap.exists() ? wSnap.data() : { coins:0, owned:[], history:[] };
        if ((w.coins || 0) < 300) throw new Error("INSUFFICIENT_COINS");
        const newHistory = [
          { id:"video_avatar", name:t.itemVideoAvatarName, price:300, date:new Date().toLocaleDateString(t.lang === "uz" ? "uz-UZ" : "en-US") },
          ...(w.history || []),
        ].slice(0, 20);
        transaction.set(wRef, {
          coins:(w.coins||0)-300, owned:[...new Set([...(w.owned||[]), "video_avatar"])],
          history:newHistory, videoAvatarUrl:url, updatedAt:serverTimestamp(),
        });
      });
      await setDoc(doc(db, "users", user.uid), { videoAvatarUrl:url }, { merge:true });
      setVideoAvatarUrl(url);
      showToast?.(t.videoAvatarActive, "success");
    } catch (err) {
      if (err.message === "INSUFFICIENT_COINS") showToast?.(t.insufficientCoins, "error");
      else showToast?.(t.updateError, "error");
    }
    setBuying(null);
  };

  // ── CONVERT XP → COINS ──────────────────────────────────────────────────────
  const convertXpToCoins = async () => {
    if (!user || converting || xp < XP_PER_COIN) return;
    const maxConvertable = Math.floor(xp / XP_PER_COIN) * XP_PER_COIN;
    const amount         = Math.min(convertAmount, maxConvertable);
    const gained         = Math.floor(amount / XP_PER_COIN);
    if (gained <= 0) return;
    setConverting(true);
    try {
      const sRef  = doc(db, "users", user.uid, "data", "stats");
      const sSnap = await getDoc(sRef);
      const curXP = sSnap.exists() ? (sSnap.data().xp || 0) : 0;
      await setDoc(sRef, { ...(sSnap.data() || {}), xp:curXP - amount });
      setXp(curXP - amount);
      const wRef  = doc(db, "users", user.uid, "data", "wallet");
      const wSnap = await getDoc(wRef);
      const curW  = wSnap.exists() ? wSnap.data() : { coins:0, owned:[], history:[] };
      await setDoc(wRef, { ...curW, coins:(curW.coins||0)+gained, updatedAt:serverTimestamp() });
      showToast?.(`✅ ${amount} XP → ${gained} ${t.convertSuccess}`, "success");
    } catch { showToast?.(t.updateError, "error"); }
    setConverting(false);
  };

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (!user || !dataReady) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-black tracking-widest animate-pulse uppercase">
        {t?.loadingData || "Yuklanmoqda..."}
      </p>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-8 lg:py-12">
      {showVideoModal && (
        <VideoAvatarModal darkMode={darkMode} onClose={() => { setShowVideoModal(false); setBuying(null); }} onSave={handleVideoAvatarSave} showToast={showToast} t={t} />
      )}

      {/* Header Section */}
      <ScrollReveal direction="up">
        {/* Title + Stats — bir qatorda, kompakt */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
              {t.shopTitle}
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">{t.shopSub}</p>
          </div>

          {/* Stats — kichik, inline */}
          <div className="flex gap-2 shrink-0">
            {[
              { icon:<LuCoins size={14} />, label:t.coinsLabel, value:coins, color:"amber" },
              { icon:<LuStar size={14} />,  label:t.xpLabel,    value:xp.toLocaleString(), color:"blue" },
            ].map((s, i) => (
              <div key={i} className={`px-3 py-2 rounded-2xl border flex items-center gap-2 ${
                darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-md"
              }`}>
                <span className={s.color === "amber" ? "text-amber-500" : "text-blue-500"}>{s.icon}</span>
                <span className={`text-base font-black tabular-nums ${darkMode ? "text-white" : "text-slate-900"}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Identity Preview Card — mavjud bo'lsa, kompakt */}
        {(activeNameColor !== "default" || videoAvatarUrl) && (
          <div className={`px-4 py-3 rounded-2xl border mb-4 flex items-center gap-4 transition-all duration-500 ${
            darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-md"
          }`}>
            <div className="relative shrink-0">
              {videoAvatarUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-red-500/20">
                  <video src={videoAvatarUrl} className="w-full h-full object-cover" muted autoPlay loop />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base font-black">
                  {user?.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-lg flex items-center justify-center text-white border border-slate-900">
                <LuSparkles size={10} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-black tracking-tight block truncate" style={NAME_COLORS[activeNameColor]?.style}>
                {user?.displayName || t.userLabel}
              </span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest truncate">
                {t.activeIdentity} · {NAME_COLORS[activeNameColor]?.label || "Default"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900/10 dark:bg-slate-900/40 border dark:border-white/5 backdrop-blur-md mb-4">
          {[
            { id:"shop",    label:t.shopTabShop,    icon:<LuShoppingBag size={14}/> },
            { id:"convert", label:t.shopTabConvert, icon:<LuCoins size={14}/>       },
            { id:"history", label:t.shopTabHistory, icon:<LuHistory size={14}/>     },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setTab(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all duration-300 ${
                tab === item.id 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 active:scale-95" 
                  : "text-slate-500 hover:text-amber-500"
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── SHOP TAB ── */}
      {tab === "shop" && (
        <ScrollReveal direction="up" delay={100}>
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {CATEGORIES.map((c) => (
              <button 
                key={c.id} 
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all duration-300 ${
                  category === c.id 
                    ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/25" 
                    : darkMode ? "bg-slate-900/40 border-white/5 text-slate-500 hover:text-amber-500" : "bg-white border-slate-100 text-slate-500 hover:border-amber-500"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {!filtered || filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800/20 rounded-[3rem]">
              <LuShoppingBag size={48} className="mx-auto mb-4 opacity-20 text-slate-500" />
              <p className="text-slate-500 font-bold">Hozircha mahsulotlar yuklanmadi.</p>
              <p className="text-slate-400 text-sm">Turkum: {category} | Jami: {SHOP_ITEMS?.length || 0}</p>
              <button 
                onClick={() => setCategory("all")} 
                className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl font-black shadow-lg"
              >
                Hammasini ko'rish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isConsumable     = item.category === "boost" || item.category === "xp" || item.id === "snippet_slot_5";
                const isOwned          = owned.includes(item.id);
                const canBuy           = coins >= item.price;
                const isBuying         = buying === item.id;
                const noBuy            = isOwned && !isConsumable;
                const isActiveNameItem = item.nameColor && activeNameColor === item.nameColor;
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition-all duration-500 group flex flex-col relative ${
                      noBuy ? "opacity-60 grayscale-[0.5]" : ""
                    } ${
                      darkMode ? "bg-slate-900/40 border-white/5 hover:bg-slate-900/60" : "bg-white border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-xl"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: `${item.color}15`, color: item.color }}
                      >
                        {item.icon}
                      </div>
                      {noBuy && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                          {isActiveNameItem ? "Active" : t.owned}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm font-black mb-1 leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{item.name}</h3>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-3 flex-1">{item.desc}</p>

                    {item.nameColor && (
                      <div className={`p-2 rounded-xl mb-3 text-center text-sm font-black transition-all ${
                        darkMode ? "bg-slate-800/50" : "bg-slate-50"
                      }`} style={NAME_COLORS[item.nameColor]?.style}>
                        {user?.displayName || "Username"}
                      </div>
                    )}

                    {item.id === "video_avatar" && videoAvatarUrl && isOwned && (
                      <div className="relative h-16 rounded-xl overflow-hidden mb-3 ring-2 ring-red-500/20">
                        <video src={videoAvatarUrl} className="w-full h-full object-cover" muted autoPlay loop />
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className="flex items-center gap-1">
                        <LuCoins size={14} className="text-amber-500" />
                        <span className="text-base font-black tabular-nums text-amber-500 leading-none">{item.price}</span>
                      </div>
                      <button 
                        onClick={() => buyItem(item)} 
                        disabled={isBuying || noBuy}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1.5 ${
                          noBuy 
                            ? "bg-slate-500/10 text-slate-500" 
                            : canBuy 
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 hover:bg-amber-500 active:scale-95"
                              : "bg-slate-500/10 text-slate-500/60"
                        }`}
                      >
                        {isBuying ? <LuLoader size={12} className="animate-spin" /> : noBuy ? <LuCheck size={12} /> : canBuy ? t.get : <LuLock size={12} />}
                        {noBuy ? (isActiveNameItem ? "Active" : t.owned) : canBuy ? t.get : t.neededMore}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollReveal>
      )}

      {/* ── CONVERT TAB ── */}
      {tab === "convert" && (
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Conversion Card */}
            <div className={`p-10 rounded-[3rem] border ${
              darkMode ? "bg-slate-900/40 border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-2xl"
            }`}>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <LuCoins size={28} />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>{t.xpToCoin}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t.xpToCoinRate}</p>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border mb-10 flex items-center justify-between gap-8 ${
                darkMode ? "bg-slate-900/60 border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="flex-1 text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">{t.spending}</p>
                  <div className="text-3xl font-black text-blue-500 tabular-nums">{Math.min(convertAmount,xp)} XP</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <LuArrowRight size={24} />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">{t.receiving}</p>
                  <div className="text-3xl font-black text-amber-500 tabular-nums flex items-center justify-center gap-2">
                    {Math.floor(Math.min(convertAmount,xp)/XP_PER_COIN)} <LuCoins size={24} />
                  </div>
                </div>
              </div>

              <div className="px-4 mb-10">
                <input 
                  type="range" 
                  min={XP_PER_COIN} 
                  max={Math.max(XP_PER_COIN, Math.floor(xp/XP_PER_COIN)*XP_PER_COIN)} 
                  step={XP_PER_COIN} 
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(Number(e.target.value))} 
                  className="w-full h-2 bg-slate-800/10 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>{t.min}: {XP_PER_COIN} XP</span>
                  <span className="text-amber-500">{convertAmount} XP</span>
                  <span>{t.max}: {Math.floor(xp/XP_PER_COIN)*XP_PER_COIN} XP</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-10">
                {[100, 500, 1000, 2000].map((amt) => (
                  <button 
                    key={amt} 
                    onClick={() => setConvertAmount(Math.min(amt, Math.floor(xp/XP_PER_COIN)*XP_PER_COIN))}
                    className={`px-6 py-3 rounded-xl text-xs font-black transition-all border ${
                      convertAmount === amt 
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg" 
                        : darkMode ? "bg-slate-900/60 border-white/5 text-slate-500 hover:text-amber-500" : "bg-white border-slate-200 text-slate-500 hover:border-amber-500"
                    }`}
                  >
                    {amt} XP
                  </button>
                ))}
              </div>

              <button 
                onClick={convertXpToCoins} 
                disabled={converting || xp < XP_PER_COIN}
                className={`w-full py-6 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-4 ${
                  converting || xp < XP_PER_COIN 
                    ? "bg-slate-500/20 text-slate-500/50 grayscale" 
                    : "bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-2xl shadow-amber-600/30 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {converting ? <LuLoader className="animate-spin" /> : <LuCoins size={20} />}
                {t.xpToCoin}
              </button>
            </div>

            {/* Methods Card */}
            <div className={`p-10 rounded-[3rem] border ${
              darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-xl"
            }`}>
              <h4 className={`text-xl font-black mb-10 flex items-center gap-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                <LuGift className="text-emerald-500" /> {t.howToEarn}
              </h4>
              <div className="space-y-4">
                {[
                  { icon:<LuBookOpen />, text:t.earnLesson,     coins:"+2",      color:"blue"    },
                  { icon:<LuTarget />,  text:t.earnQuiz,        coins:"+3",      color:"red"     },
                  { icon:<LuTrophy />,  text:t.earnTournament,  coins:"+5",      color:"amber"   },
                  { icon:<LuFlame />,   text:t.earnStreak,      coins:"+10",     color:"orange"  },
                  { icon:<LuUserPlus />,text:t.earnInvite,      coins:"+20",     color:"emerald" },
                  { icon:<LuStar />,    text:t.earnConvert,     coins:t.catDev,  color:"blue"    },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-6 p-5 rounded-4xl border transition-all hover:scale-[1.02] ${
                    darkMode ? "bg-slate-900/60 border-white/5" : "bg-slate-50 border-slate-100 shadow-sm"
                  }`}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ 
                      backgroundColor: `${item.color === 'emerald' ? '#10b981' : item.color === 'blue' ? '#3b82f6' : '#f59e0b'}15`, 
                      color: item.color === 'emerald' ? '#10b981' : item.color === 'blue' ? '#3b82f6' : '#f59e0b' 
                    }}>
                      {item.icon}
                    </div>
                    <span className={`flex-1 text-sm font-bold tracking-tight ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{item.text}</span>
                    <span className="text-base font-black text-amber-500 tabular-nums">{item.coins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <ScrollReveal direction="up" delay={100}>
          {history.length === 0 ? (
            <div className={`py-40 text-center rounded-[3rem] border border-dashed ${
              darkMode ? "bg-slate-900/20 border-white/10" : "bg-slate-50 border-slate-200"
            }`}>
              <LuShoppingBag size={64} className="mx-auto mb-8 opacity-20 text-slate-500" />
              <p className="text-slate-400 text-lg font-black uppercase tracking-widest">{t.noHistory}</p>
            </div>
          ) : (
            <div className="grid gap-4 max-w-3xl mx-auto">
              {history.map((h, i) => (
                <div key={i} className={`p-6 rounded-4xl border transition-all hover:scale-[1.01] flex items-center gap-8 ${
                  darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-100 shadow-lg"
                }`}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-slate-500/10 text-slate-500">
                    {h.icon || <LuShoppingBag />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-black tracking-tight mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>{h.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{h.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-500 tabular-nums">🪙 -{h.price}</span>
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

export default CoinShop;