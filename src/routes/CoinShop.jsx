import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import {
  LuCoins,
  LuShoppingBag,
  LuZap,
  LuStar,
  LuCheck,
  LuLock,
  LuGift,
  LuHistory,
  LuPalette,
  LuBadgeCheck,
  LuVideo,
  LuUpload,
  LuSparkles,
  LuLoader,
  LuRocket,
  LuShield,
  LuLightbulb,
  LuTarget,
  LuTrendingUp,
  LuHeart,
  LuGhost,
  LuTrophy,
  LuGem,
  LuFolder,
  LuFlower,
  LuLeaf,
  LuArrowRight,
  LuBookOpen,
  LuUserPlus,
  LuFlame,
  LuX,
  LuCat,
} from "react-icons/lu";
import {
  Drumstick,
  Gamepad2,
  Zap,
  Cookie,
} from "lucide-react";
import { NAME_COLORS } from "../constants/shopConstants";

const IMGBB_KEY = "2166816880e7d95d3a1fccc6a40a0a2b";
const DEFAULT_MAX_SNIPPETS = 5;
const XP_PER_COIN = 10;

// XP → Coin conversion packages with bonuses
const CONVERSION_PACKAGES = [
  { xp: 100, coins: 10, bonus: 0, popular: false },
  { xp: 500, coins: 60, bonus: 5, popular: false },
  { xp: 1000, coins: 130, bonus: 15, popular: true },
  { xp: 5000, coins: 700, bonus: 100, popular: false },
];

// в”Ђв”Ђв”Ђ VIDEO AVATAR MODAL (imgbb) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const VideoAvatarModal = ({ darkMode, onClose, onSave, showToast, t }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;

    if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      showToast?.(
        t.videoFormatError || "Faqat video formatlari ruxsat etiladi",
        "error"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast?.(
        t.videoSizeError || "Video hajmi 10MB dan oshmasligi kerak",
        "error"
      );
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success) {
        setVideoUrl(data.data.url);
        showToast?.(t.videoUploadSuccess || "Video yuklandi", "success");
      } else {
        showToast?.(t.videoUploadError || "Video yuklashda xatolik", "error");
      }
    } catch {
      showToast?.(t.videoUploadError || "Video yuklashda xatolik", "error");
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
      <div
        className={`w-full max-w-md p-8 rounded-4xl border shadow-2xl transition-all duration-500 ${
          darkMode
            ? "bg-slate-900 border-white/10 shadow-slate-900/50"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h3
            className={`text-xl font-black ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            <LuVideo className="inline mr-3 text-red-500" />{" "}
            {t.videoAvatarTitle || "Video Avatar"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-500/10 transition-colors"
          >
            <LuX size={20} className="text-slate-500" />
          </button>
        </div>

        <p className="text-slate-500 text-sm font-medium mb-8 uppercase tracking-widest">
          {t.videoAvatarLimit || "Max 10MB"}
        </p>

        <div
          onClick={() => fileRef.current?.click()}
          className={`group border-2 border-dashed rounded-4xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden ${
            darkMode
              ? "bg-slate-900/50 border-white/5 hover:border-red-500/50"
              : "bg-slate-50 border-slate-200 hover:border-red-500/50"
          }`}
        >
          {preview ? (
            <video
              src={preview}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              autoPlay
              loop
            />
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <LuUpload size={32} className="text-red-500" />
              </div>
              <p className="text-slate-500 text-sm font-black mb-2 uppercase tracking-wide">
                {t.videoUploadPrompt || "Videoni yuklang"}
              </p>
              <p className="text-slate-500/60 text-[10px] font-bold uppercase tracking-[0.15em]">
                MP4, WebM, OGG В· max 10MB
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {uploading && (
          <div
            className={`mb-8 flex items-center gap-4 p-4 rounded-2xl ${
              darkMode ? "bg-slate-800/50" : "bg-slate-100"
            }`}
          >
            <LuLoader size={20} className="text-red-500 animate-spin" />
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">
              {t.converting || "Yuklanmoqda..."}
            </span>
          </div>
        )}

        <div className="mb-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 ml-1">
            {t.videoUrlPrompt || "Video URL manzili"}
          </p>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className={`w-full px-6 py-4 rounded-xl border text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${
              darkMode
                ? "bg-slate-800/50 border-white/5 text-white"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${
              darkMode
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
            }`}
          >
            {t.cancelBtn || "Bekor qilish"}
          </button>
          <button
            onClick={() => {
              if (!videoUrl) {
                showToast?.("Avval videoni yuklang", "error");
                return;
              }
              onSave(videoUrl);
            }}
            disabled={!videoUrl || uploading}
            className={`flex-1 py-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-3 ${
              videoUrl && !uploading
                ? "bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-500 active:scale-95"
                : "bg-slate-500/20 text-slate-500 opacity-50 cursor-not-allowed"
            }`}
          >
            {uploading ? (
              <LuLoader size={18} className="animate-spin" />
            ) : (
              t.saveBtn || "Saqlash"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// в”Ђв”Ђв”Ђ MAIN COIN SHOP COMPONENT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const CoinShop = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();

  // в”Ђв”Ђ SHOP ITEMS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const SHOP_ITEMS = useMemo(
    () => [
      // BOOSTS
      {
        id: "xp_boost_2x",
        category: "boost",
        icon: <LuZap />,
        name: t.itemXpBoost2xName || "XP Boost 2x",
        desc: t.itemXpBoost2xDesc || "2 soat davomida 2 baravar ko'p XP olish",
        price: 50,
        color: "#f59e0b",
      },
      {
        id: "xp_boost_3x",
        category: "boost",
        icon: <LuRocket />,
        name: t.itemXpBoost3xName || "XP Boost 3x",
        desc: t.itemXpBoost3xDesc || "1 soat davomida 3 baravar ko'p XP olish",
        price: 120,
        color: "#ef4444",
      },
      {
        id: "streak_shield",
        category: "boost",
        icon: <LuShield />,
        name: t.itemStreakShieldName || "Streak Shield",
        desc:
          t.itemStreakShieldDesc ||
          "Bir kun dars qoldirsangiz, streakni saqlab qoladi",
        price: 30,
        color: "#3b82f6",
      },
      {
        id: "hint_pack",
        category: "boost",
        icon: <LuLightbulb />,
        name: t.itemHintPackName || "Hint Pack",
        desc: t.itemHintPackDesc || "Quizlarda foydalanish uchun 5 ta yordam (hint)",
        price: 40,
        color: "#8b5cf6",
      },
      {
        id: "daily_double",
        category: "boost",
        icon: <LuTarget />,
        name: t.itemDailyDoubleName || "Daily Double",
        desc: t.itemDailyDoubleDesc || "Bugungi vazifalar uchun 2 baravar ko'p Coin",
        price: 70,
        color: "#06b6d4",
      },
      {
        id: "extra_lives",
        category: "boost",
        icon: <LuHeart />,
        name: t.itemExtraLivesName || "Extra Lives",
        desc: t.itemExtraLivesDesc || "O'yinlarda foydalanish uchun +3 ta hayot",
        price: 60,
        color: "#ef4444",
      },

      // XP PACKS
      {
        id: "xp_pack_500",
        category: "xp",
        icon: <LuStar />,
        name: t.itemXpPack500Name || "500 XP Pack",
        desc: t.itemXpPack500Desc || "Darajangizni oshirish uchun 500 XP qo'shish",
        price: 100,
        color: "#10b981",
      },
      {
        id: "xp_pack_1000",
        category: "xp",
        icon: <LuSparkles />,
        name: t.itemXpPack1000Name || "1000 XP Pack",
        desc:
          t.itemXpPack1000Desc ||
          "Darajangizni tezroq oshirish uchun 1000 XP qo'shish",
        price: 180,
        color: "#f59e0b",
      },

      // THEMES
      {
        id: "theme_neon",
        category: "theme",
        icon: <LuPalette />,
        name: t.itemThemeNeonName || "Neon Theme",
        desc: t.itemThemeNeonDesc || "Platforma uchun neon uslubidagi dizayn",
        price: 100,
        color: "#06b6d4",
      },
      {
        id: "theme_gold",
        category: "theme",
        icon: <LuSparkles />,
        name: t.itemThemeGoldName || "Gold Theme",
        desc: t.itemThemeGoldDesc || "Platforma uchun oltin uslubidagi dizayn",
        price: 120,
        color: "#d97706",
      },
      {
        id: "theme_dracula",
        category: "dev",
        icon: <LuGhost />,
        name: t.itemThemeDraculaName || "Dracula Theme",
        desc:
          t.itemThemeDraculaDesc ||
          "Dasturchilar uchun maxsus qora (Dracula) mavzu",
        price: 200,
        color: "#8b5cf6",
      },

      // BADGES (Nishonlar)
      {
        id: "badge_champion",
        category: "badge",
        icon: <LuTrophy />,
        name: t.itemBadgeChampionName || "Champion Badge",
        desc: t.itemBadgeChampionDesc || "Profil uchun maxsus Chempion nishoni",
        price: 150,
        color: "#f59e0b",
      },
      {
        id: "badge_pro",
        category: "badge",
        icon: <LuGem />,
        name: t.itemBadgeProName || "Pro Badge",
        desc: t.itemBadgeProDesc || "Profil uchun maxsus Professional nishoni",
        price: 200,
        color: "#8b5cf6",
      },

      // DEV TOOLS
      {
        id: "snippet_slot_5",
        category: "dev",
        icon: <LuFolder />,
        name: t.itemSnippetSlot5Name || "5x Snippet Slots",
        desc: t.itemSnippetSlot5Desc || "Kod saqlash uchun qo'shimcha 5 ta joy",
        price: 100,
        color: "#10b981",
      },

      // IDENTITY (Ism ranglari)
      {
        id: "name_gold",
        category: "identity",
        icon: <LuSparkles />,
        name: t.itemNameGoldName || "Oltin Ism",
        desc: t.itemNameGoldDesc || "Ismingizni oltin rangda ko'rsatish",
        price: 80,
        color: "#d97706",
        nameColor: "gold",
      },
      {
        id: "name_neon_blue",
        category: "identity",
        icon: <LuGem />,
        name: t.itemNameNeonBlueName || "Neon Moviy Ism",
        desc: t.itemNameNeonBlueDesc || "Ismingizni neon moviy rangda ko'rsatish",
        price: 80,
        color: "#06b6d4",
        nameColor: "neon_blue",
      },
      {
        id: "name_neon_green",
        category: "identity",
        icon: <LuLeaf />,
        name: t.itemNameNeonGreenName || "Neon Yashil Ism",
        desc:
          t.itemNameNeonGreenDesc || "Ismingizni neon yashil rangda ko'rsatish",
        price: 80,
        color: "#10b981",
        nameColor: "neon_green",
      },
      {
        id: "name_purple",
        category: "identity",
        icon: <LuSparkles />,
        name: t.itemNamePurpleName || "Siyohrang Ism",
        desc: t.itemNamePurpleDesc || "Ismingizni siyohrangda ko'rsatish",
        price: 80,
        color: "#8b5cf6",
        nameColor: "purple",
      },
      {
        id: "name_rose",
        category: "identity",
        icon: <LuFlower />,
        name: t.itemNameRoseName || "Atirgul Ism",
        desc: t.itemNameRoseDesc || "Ismingizni pushti-rose rangda ko'rsatish",
        price: 80,
        color: "#f43f5e",
        nameColor: "rose",
      },
      {
        id: "name_rainbow",
        category: "identity",
        icon: <LuSparkles />,
        name: t.itemNameRainbowName || "Kamalak Ism",
        desc: t.itemNameRainbowDesc || "Ismingizni kamalak rangida ko'rsatish",
        price: 200,
        color: "#6366f1",
        nameColor: "rainbow",
      },
      {
        id: "video_avatar",
        category: "identity",
        icon: <LuVideo />,
        name: t.itemVideoAvatarName || "Video Avatar",
        desc:
          t.itemVideoAvatarDesc || "Profil rasmi o'rniga video o'rnatish imkoniyati",
        price: 300,
        color: "#ef4444",
      },

      // PET ITEMS
      {
        id: "pet_food",
        category: "pet",
        icon: <Drumstick size={20} />,
        name: t.itemPetFoodName || "Pet Food",
        desc: t.itemPetFoodDesc || "Petni oziqlantirish - ochlikni 0% qiladi",
        price: 50,
        color: "#f97316",
        effect: { hunger: -100, happiness: +20, xp: +15 },
      },
      {
        id: "pet_toy",
        category: "pet",
        icon: <Gamepad2 size={20} />,
        name: t.itemPetToyName || "Pet Toy",
        desc: t.itemPetToyDesc || "Pet bilan o'ynash - baxtni 100% qiladi",
        price: 80,
        color: "#ec4899",
        effect: { happiness: +100, energy: -10, xp: +25 },
      },
      {
        id: "pet_energy",
        category: "pet",
        icon: <Zap size={20} />,
        name: t.itemPetEnergyName || "Energy Drink",
        desc: t.itemPetEnergyDesc || "Pet energiyasini to'ldirish +100%",
        price: 60,
        color: "#3b82f6",
        effect: { energy: +100, xp: +10 },
      },
      {
        id: "pet_treat",
        category: "pet",
        icon: <Cookie size={20} />,
        name: t.itemPetTreatName || "Premium Treat",
        desc: t.itemPetTreatDesc || "Maxsus delicatessen - barcha statistikani to'ldiradi",
        price: 150,
        color: "#a855f7",
        effect: { hunger: 0, happiness: 100, energy: 100, xp: +50 },
      },
    ],
    [t]
  );

  // в”Ђв”Ђ CATEGORIES в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const CATEGORIES = useMemo(
    () => [
      {
        id: "all",
        label: t.catAll || "Hammasi",
        icon: <LuShoppingBag size={14} />,
      },
      {
        id: "boost",
        label: t.catBoosts || "Boostlar",
        icon: <LuZap size={14} />,
      },
      {
        id: "xp",
        label: t.catXP || "XP Paketlar",
        icon: <LuStar size={14} />,
      },
      {
        id: "theme",
        label: t.catThemes || "Mavzular",
        icon: <LuPalette size={14} />,
      },
      {
        id: "badge",
        label: t.catBadges || "Nishonlar",
        icon: <LuBadgeCheck size={14} />,
      },
      {
        id: "dev",
        label: t.catDev || "Dasturchi",
        icon: <LuCoins size={14} />,
      },
      {
        id: "identity",
        label: t.catIdentity || "Profil",
        icon: <LuSparkles size={14} />,
      },
      {
        id: "pet",
        label: t.catPet || "Pet",
        icon: <LuCat size={14} />,
      },
    ],
    [t]
  );

  // в”Ђв”Ђ STATE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [owned, setOwned] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeNameColor, setActiveNameColor] = useState("default");
  const [videoAvatarUrl, setVideoAvatarUrl] = useState("");
  const [dataReady, setDataReady] = useState(false);
  const [buying, setBuying] = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState(100);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [tab, setTab] = useState("shop");
  const [category, setCategory] = useState("all");
  const [showVideoModal, setShowVideoModal] = useState(false);

  // в”Ђв”Ђ FIREBASE LISTENERS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid, "data", "wallet"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCoins(d.coins || 0);
          setOwned(d.owned || []);
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
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("date", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const hist = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(hist);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid, "data", "stats"),
      (snap) => {
        if (snap.exists()) setXp(snap.data().xp || 0);
      }
    );
    return () => unsub();
  }, [user]);

  // в”Ђв”Ђ FILTERED ITEMS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const filtered = useMemo(() => {
    const allItems = Array.isArray(SHOP_ITEMS) ? SHOP_ITEMS : [];
    if (category === "all") return allItems;
    return allItems.filter((item) => item.category === category);
  }, [category, SHOP_ITEMS]);

  // в”Ђв”Ђ YAXSHILANGAN BUY ITEM FUNKSIYASI в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const buyItem = async (item) => {
    if (!user || buying) return;

    const isConsumable =
      item.category === "boost" ||
      item.category === "xp" ||
      item.category === "pet" ||
      item.id === "snippet_slot_5";
    const isBadge = item.category === "badge";
    const isNameColor = item.nameColor;

    const notBuyable = owned.includes(item.id) && !isConsumable;

    if (notBuyable) {
      showToast?.(t.alreadyOwned || "Sizda bu mavjud", "error");
      return;
    }
    if (coins < item.price) {
      showToast?.(t.insufficientCoins || "Coin yetarli emas", "error");
      return;
    }

    if (item.id === "video_avatar" && !owned.includes("video_avatar")) {
      setBuying(item.id);
      setShowVideoModal(true);
      return;
    }

    setBuying(item.id);

    try {
      const wRef = doc(db, "users", user.uid, "data", "wallet");
      const uRef = doc(db, "users", user.uid); // Profil referensi qo'shildi

      await runTransaction(db, async (transaction) => {
        const wSnap = await transaction.get(wRef);
        const w = wSnap.exists()
          ? wSnap.data()
          : { coins: 0, owned: [] };

        if ((w.coins || 0) < item.price) throw new Error("INSUFFICIENT_COINS");

        const newOwned = isConsumable
          ? w.owned || []
          : [...new Set([...(w.owned || []), item.id])];

        const extras = {};
        if (isNameColor) extras.activeNameColor = item.nameColor;


        // Hamyonni yangilash (Coins va History qismi olib tashlandi, giveReward orqali qilinadi)
        transaction.set(
          wRef,
          {
            owned: newOwned,
            updatedAt: serverTimestamp(),
            ...extras,
          },
          { merge: true }
        );
      });

      // Tangalarni yechish va tarixga yozish
      await giveReward(user.uid, -item.price, "coins", item.name + " xaridi");

      // Profilga ism rangini saqlash
      if (isNameColor) {
        await setDoc(uRef, { nameColor: item.nameColor }, { merge: true });
      }

      // Profilga yangi nishon qo'shilganini bildirish
      if (isBadge) {
        await setDoc(uRef, { hasNewBadge: true }, { merge: true });
      }

      // XP va maxSnippets kabi boshqa funksiyalar
      if (item.id === "xp_pack_500" || item.id === "xp_pack_1000") {
        const bonus = item.id === "xp_pack_500" ? 500 : 1000;
        await giveReward(user.uid, bonus, "xp", item.name);
      }

      if (item.id === "snippet_slot_5") {
        const uSnap = await getDoc(uRef);
        const curMax = uSnap.exists()
          ? uSnap.data().maxSnippets ?? DEFAULT_MAX_SNIPPETS
          : DEFAULT_MAX_SNIPPETS;

        await setDoc(uRef, { maxSnippets: curMax + 5 }, { merge: true });
      }

      // Pet items - saqlash Firebase'ga
      if (item.category === "pet") {
        const petRef = doc(db, "users", user.uid, "data", "pet");
        const petSnap = await getDoc(petRef);
        const petData = petSnap.exists() ? petSnap.data() : {};
        const effect = item.effect || {};
        
        // Apply effects
        const updates = {};
        if (effect.hunger !== undefined) updates.hunger = effect.hunger;
        if (effect.happiness !== undefined) updates.happiness = effect.happiness;
        if (effect.energy !== undefined) updates.energy = effect.energy;
        if (effect.xp) updates.xp = (petData.xp || 0) + effect.xp;
        
        await setDoc(petRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        
        // XP ham qo'shish
        if (effect.xp) {
          await giveReward(user.uid, effect.xp, "xp", `${item.name} ishlatildi`);
        }
      }

      showToast?.(
        `✅ "${item.name}" ${t.buySuccess || "sotib olindi"}`,
        "success"
      );

      // Nishon xarid qilinganda bildirishnoma
      if (isBadge) {
        showToast?.(
          "Ajoyib! Nishon profilingizdagi Kolleksiyaga qo'shildi",
          "info"
        );
      }
    } catch (err) {
      if (err.message === "INSUFFICIENT_COINS") {
        showToast?.(t.insufficientCoins || "Coin yetarli emas", "error");
      } else {
        showToast?.(t.updateError || "Xatolik yuz berdi", "error");
      }
    }
    setBuying(null);
  };

  // в”Ђв”Ђ VIDEO AVATAR SAVE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handleVideoAvatarSave = async (url) => {
    setShowVideoModal(false);
    if (!user || !url) {
      setBuying(null);
      return;
    }

    try {
      const wRef = doc(db, "users", user.uid, "data", "wallet");

      await runTransaction(db, async (transaction) => {
        const wSnap = await transaction.get(wRef);
        const w = wSnap.exists()
          ? wSnap.data()
          : { coins: 0, owned: [] };

        if ((w.coins || 0) < 300) throw new Error("INSUFFICIENT_COINS");


        transaction.set(
          wRef,
          {
            owned: [...new Set([...(w.owned || []), "video_avatar"])],
            videoAvatarUrl: url,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });

      // Tangalarni yechish
      await giveReward(user.uid, -300, "coins", "Video Avatar xaridi");

      await setDoc(
        doc(db, "users", user.uid),
        { videoAvatarUrl: url },
        { merge: true }
      );
      setVideoAvatarUrl(url);
      showToast?.(
        t.videoAvatarActive || "Video avatar o'rnatildi",
        "success"
      );
    } catch (err) {
      if (err.message === "INSUFFICIENT_COINS") {
        showToast?.(t.insufficientCoins || "Coin yetarli emas", "error");
      } else {
        showToast?.(t.updateError || "Xatolik yuz berdi", "error");
      }
    }
    setBuying(null);
  };

  // в”Ђв”Ђ CONVERT XP в†’ COINS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”‚
  const convertXpToCoins = async (pkg = null) => {
    if (!user || converting) return;
    
    const targetPkg = pkg || selectedPackage;
    if (!targetPkg) return;
    
    if (xp < targetPkg.xp) {
      showToast?.(t.notEnoughXP || "Yetarli XP yo'q!", "error");
      return;
    }

    setConverting(true);

    try {
      await giveReward(user.uid, -targetPkg.xp, "xp", "Tangaga almashtirildi");
      await giveReward(user.uid, targetPkg.coins + targetPkg.bonus, "coins", "XP konvertatsiyasi");
      showToast?.(
        `вњ… ${targetPkg.xp} XP в†’ ${targetPkg.coins + targetPkg.bonus} ${
          t.convertSuccess || "Tanga aylantirildi"
        }${targetPkg.bonus > 0 ? ` (+${targetPkg.bonus} bonus)` : ''}`,
        "success"
      );
      setSelectedPackage(null);
    } catch {
      showToast?.(t.updateError || "Xatolik yuz berdi", "error");
    }
    setConverting(false);
  };

  // в”Ђв”Ђ LOADING в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (!user || !dataReady)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-black tracking-widest animate-pulse uppercase">
          {t?.loadingData || "Yuklanmoqda..."}
        </p>
      </div>
    );

  // в”Ђв”Ђ RENDER в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-8 lg:py-12">
      {showVideoModal && (
        <VideoAvatarModal
          darkMode={darkMode}
          onClose={() => {
            setShowVideoModal(false);
            setBuying(null);
          }}
          onSave={handleVideoAvatarSave}
          showToast={showToast}
          t={t}
        />
      )}

      {/* Header Section */}
      <div direction="up">
        {/* Title + Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2
              className={`text-2xl md:text-4xl font-black tracking-tight leading-tight ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {t.shopTitle}
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {t.shopSub}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {[
              {
                icon: <LuCoins size={16} />,
                label: t.coinsLabel,
                value: coins,
                color: "amber",
              },
              {
                icon: <LuStar size={16} />,
                label: t.xpLabel,
                value: xp.toLocaleString(),
                color: "blue",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 ${
                  darkMode
                    ? "bg-slate-900/40 border-white/5"
                    : "bg-white border-slate-100 shadow-md"
                }`}
              >
                <span
                  className={
                    s.color === "amber" ? "text-amber-500" : "text-blue-500"
                  }
                >
                  {s.icon}
                </span>
                <span
                  className={`text-lg font-black tabular-nums ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Identity Preview Card */}
        {(activeNameColor !== "default" || videoAvatarUrl) && (
          <div
            className={`px-5 py-4 rounded-2xl border mb-6 flex items-center gap-4 transition-all duration-500 ${
              darkMode
                ? "bg-slate-900/40 border-white/5"
                : "bg-white border-slate-100 shadow-md"
            }`}
          >
            <div className="relative shrink-0">
              {videoAvatarUrl ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-red-500/20">
                  <video
                    src={videoAvatarUrl}
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black">
                  {user?.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white border-2 border-slate-900">
                <LuSparkles size={12} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-base font-black tracking-tight block truncate"
                style={NAME_COLORS[activeNameColor]?.style}
              >
                {user?.displayName || t.userLabel}
              </span>
              <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest truncate mt-0.5">
                {t.activeIdentity} В·{" "}
                {NAME_COLORS[activeNameColor]?.label || "Default"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900/5 dark:bg-slate-900/40 border dark:border-white/5 backdrop-blur-md mb-8 overflow-x-auto no-scrollbar">
          {[
            {
              id: "shop",
              label: t.shopTabShop || "Do'kon",
              icon: <LuShoppingBag size={16} />,
            },
            {
              id: "convert",
              label: t.shopTabConvert || "XP→Coin",
              icon: <LuZap size={16} />,
            },
            {
              id: "history",
              label: t.shopTabHistory || "Tarix",
              icon: <LuHistory size={16} />,
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 min-w-max flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                tab === item.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                  : "text-slate-500 hover:text-orange-500"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* в”Ђв”Ђ SHOP TAB в”Ђв”Ђ */}
      {tab === "shop" && (
        <div direction="up" delay={100}>
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all duration-300 ${
                  category === c.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-lg shadow-orange-500/25 scale-[1.02]"
                    : darkMode
                    ? "bg-slate-900/40 border-white/5 text-slate-500 hover:text-orange-500"
                    : "bg-white border-slate-100 text-slate-500 hover:border-orange-500 hover:shadow-md"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {!filtered || filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800/20 rounded-[3rem]">
              <LuShoppingBag
                size={48}
                className="mx-auto mb-4 opacity-20 text-slate-500"
              />
              <p className="text-slate-500 font-bold">
                {t.shopEmpty}
              </p>
              <p className="text-slate-400 text-sm">{t.category}: {category}</p>
              <button
                onClick={() => setCategory("all")}
                className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl font-black shadow-lg hover:bg-amber-600 transition-colors"
              >
                {t.showAll}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((item) => {
                const isConsumable =
                  item.category === "boost" ||
                  item.category === "xp" ||
                  item.id === "snippet_slot_5";
                const isOwned = owned.includes(item.id);
                const canBuy = coins >= item.price;
                const isBuying = buying === item.id;
                const noBuy = isOwned && !isConsumable;
                const isActiveNameItem =
                  item.nameColor && activeNameColor === item.nameColor;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl border transition-all duration-500 group flex flex-col relative ${
                      noBuy ? "opacity-75 grayscale-[0.3]" : ""
                    } ${
                      darkMode
                        ? "bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/10"
                        : "bg-white border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-xl hover:border-amber-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-transform duration-500 group-hover:scale-110"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </div>
                      {noBuy && (
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          {isActiveNameItem
                            ? t.active
                            : t.owned}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-base font-black mb-1.5 leading-tight ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4 flex-1">
                      {item.desc}
                    </p>

                    {item.nameColor && (
                      <div
                        className={`p-3 rounded-xl mb-4 text-center text-sm font-black transition-all ${
                          darkMode ? "bg-slate-800/50" : "bg-slate-50"
                        }`}
                        style={NAME_COLORS[item.nameColor]?.style}
                      >
                        {user?.displayName || t.userLabel}
                      </div>
                    )}

                    {item.id === "video_avatar" &&
                      videoAvatarUrl &&
                      isOwned && (
                        <div className="relative h-20 rounded-xl overflow-hidden mb-4 ring-2 ring-red-500/20">
                          <video
                            src={videoAvatarUrl}
                            className="w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                          />
                        </div>
                      )}

                    <div className="flex items-center justify-between gap-3 mt-auto">
                      <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-2 rounded-xl">
                        <LuCoins size={16} className="text-amber-500" />
                        <span className="text-lg font-black tabular-nums text-amber-500 leading-none">
                          {item.price}
                        </span>
                      </div>
                      <button
                        onClick={() => buyItem(item)}
                        disabled={isBuying || noBuy}
                        className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                          noBuy
                            ? "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                            : canBuy
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-95"
                            : "bg-slate-500/10 text-slate-500/60 cursor-not-allowed"
                        }`}
                      >
                        {isBuying ? (
                          <LuLoader size={16} className="animate-spin" />
                        ) : noBuy ? (
                          <LuCheck size={16} />
                        ) : canBuy ? (
                          <LuShoppingBag size={16} />
                        ) : (
                          <LuLock size={16} />
                        )}
                        {noBuy
                          ? isActiveNameItem
                            ? t.active
                            : t.owned
                          : canBuy
                          ? t.get
                          : t.neededMore}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* в”Ђв”Ђ CONVERT TAB в”Ђв”Ђ */}
      {tab === "convert" && (
        <div direction="up" delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Conversion Card with Packages */}
            <div
              className={`p-6 md:p-10 rounded-4xl md:rounded-[3rem] border ${
                darkMode
                  ? "bg-slate-900/40 border-white/5 shadow-2xl"
                  : "bg-white border-slate-100 shadow-2xl"
              }`}
            >
              <div className="flex items-center gap-4 mb-8 md:mb-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <LuCoins size={28} />
                </div>
                <div>
                  <h3
                    className={`text-xl md:text-2xl font-black ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {t.xpToCoin}
                  </h3>
                  <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                    XP ni Coin ga bonuslar bilan almashtiring
                  </p>
                </div>
              </div>

              {/* Package Selection Grid */}
              <div className="space-y-3 mb-8">
                {CONVERSION_PACKAGES.map((pkg, index) => {
                  const canAfford = xp >= pkg.xp;
                  const isSelected = selectedPackage?.xp === pkg.xp;
                  const totalCoins = pkg.coins + pkg.bonus;

                  return (
                    <button
                      key={pkg.xp}
                      onClick={() => canAfford && setSelectedPackage(pkg)}
                      disabled={!canAfford}
                      className={`w-full relative p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                          : canAfford
                          ? darkMode
                            ? "border-slate-600 hover:border-amber-500/50 bg-slate-800/50"
                            : "border-slate-200 hover:border-amber-300 bg-slate-50"
                          : darkMode
                          ? "border-slate-700 bg-slate-800/30 opacity-50"
                          : "border-slate-100 bg-slate-50 opacity-50"
                      }`}
                    >
                      {/* Popular Badge */}
                      {pkg.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <LuSparkles className="w-3 h-3" />
                          Ommabop
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected 
                              ? "bg-amber-500 text-white" 
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            <LuTrendingUp className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {pkg.xp.toLocaleString()} XP
                            </p>
                            <p className="text-sm text-slate-500">
                              → {totalCoins} coin
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {pkg.bonus > 0 && (
                            <p className="text-xs text-emerald-500 font-medium mb-0.5">
                              +{pkg.bonus} bonus
                            </p>
                          )}
                          {!canAfford && (
                            <p className="text-xs text-red-400">
                              XP yetarli emas
                            </p>
                          )}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center ml-auto">
                              <LuCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Summary Display */}
              {selectedPackage && (
                <div
                  className={`p-6 rounded-2xl border mb-6 flex items-center justify-between gap-4 ${
                    darkMode
                      ? "bg-slate-900/60 border-white/5"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="text-center flex-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                      {t.spending}
                    </p>
                    <div className="text-2xl font-black text-blue-500">
                      {selectedPackage.xp} <span className="text-sm">XP</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <LuArrowRight size={16} />
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                      {t.receiving}
                    </p>
                    <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                      {selectedPackage.coins + selectedPackage.bonus}
                      <LuCoins size={18} />
                    </div>
                    {selectedPackage.bonus > 0 && (
                      <p className="text-xs text-emerald-500 mt-0.5">
                        ({selectedPackage.coins} + {selectedPackage.bonus} bonus)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={() => convertXpToCoins()}
                disabled={converting || !selectedPackage || xp < (selectedPackage?.xp || 0)}
                className={`w-full py-5 rounded-2xl text-sm md:text-base font-black transition-all flex items-center justify-center gap-3 md:gap-4 ${
                  converting || !selectedPackage || xp < (selectedPackage?.xp || 0)
                    ? "bg-slate-500/20 text-slate-500/50 cursor-not-allowed border border-slate-500/20"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {converting ? (
                  <LuLoader className="animate-spin" size={20} />
                ) : (
                  <LuCoins size={20} />
                )}
                {selectedPackage 
                  ? `${selectedPackage.xp} XP ni ${selectedPackage.coins + selectedPackage.bonus} coin ga almashtirish`
                  : "Paket tanlang"
                }
              </button>

              <p className={`text-center text-xs mt-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Almashtirilgan coinlar do'konda ishlatiladi. XP dan kamayish darajangizga ta'sir qilmaydi.
              </p>
            </div>

            {/* Methods Card */}
            <div
              className={`p-6 md:p-10 rounded-4xl md:rounded-[3rem] border ${
                darkMode
                  ? "bg-slate-900/40 border-white/5"
                  : "bg-white border-slate-100 shadow-xl"
              }`}
            >
              <h4
                className={`text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                <LuGift className="text-emerald-500" size={24} />{" "}
                {t.howToEarn}
              </h4>
              <div className="space-y-3 md:space-y-4">
                {[
                  {
                    icon: <LuBookOpen />,
                    text: t.earnLesson,
                    coins: "+2",
                    color: "blue",
                  },
                  {
                    icon: <LuTarget />,
                    text: t.earnQuiz,
                    coins: "+3",
                    color: "red",
                  },
                  {
                    icon: <LuTrophy />,
                    text: t.earnTournament,
                    coins: "+5",
                    color: "amber",
                  },
                  {
                    icon: <LuFlame />,
                    text: t.earnStreak,
                    coins: "+10",
                    color: "orange",
                  },
                  {
                    icon: <LuUserPlus />,
                    text: t.earnInvite,
                    coins: "+20",
                    color: "emerald",
                  },
                  {
                    icon: <LuCoins />,
                    text: t.earnPixelChallenge,
                    coins: "500",
                    color: "amber",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 md:gap-5 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                      darkMode
                        ? "bg-slate-900/60 border-white/5"
                        : "bg-slate-50 border-slate-100 shadow-sm"
                    }`}
                  >
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0"
                      style={{
                        backgroundColor: `${
                          item.color === "emerald"
                            ? "#10b981"
                            : item.color === "blue"
                            ? "#3b82f6"
                            : item.color === "red"
                            ? "#ef4444"
                            : "#f59e0b"
                        }15`,
                        color:
                          item.color === "emerald"
                            ? "#10b981"
                            : item.color === "blue"
                            ? "#3b82f6"
                            : item.color === "red"
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`flex-1 text-xs md:text-sm font-bold tracking-tight ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {item.text}
                    </span>
                    <span className="text-sm md:text-base font-black text-amber-500 tabular-nums bg-amber-500/10 px-3 py-1 rounded-lg">
                      {item.coins}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ HISTORY TAB в”Ђв”Ђ */}
      {tab === "history" && (
        <div direction="up" delay={100}>
          {history.length === 0 ? (
            <div
              className={`py-24 md:py-32 text-center rounded-4xl border border-dashed ${
                darkMode
                  ? "bg-slate-900/20 border-white/10"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <LuShoppingBag
                size={56}
                className="mx-auto mb-6 opacity-20 text-slate-500"
              />
              <p className="text-slate-400 text-sm md:text-base font-black uppercase tracking-widest">
                {t.noHistory || "Hozircha tarix yo'q"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4 max-w-3xl mx-auto">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-5 md:p-6 rounded-2xl md:rounded-4xl border transition-all hover:scale-[1.01] flex items-center gap-4 md:gap-6 ${
                    darkMode
                      ? "bg-slate-900/40 border-white/5"
                      : "bg-white border-slate-100 shadow-sm"
                  }`}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl bg-slate-500/10 text-slate-500 shrink-0">
                    <LuShoppingBag size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base md:text-lg font-black tracking-tight mb-1 truncate ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {h.title}
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                      {h.date?.toDate ? h.date.toDate().toLocaleDateString() : h.date?.seconds ? new Date(h.date.seconds * 1000).toLocaleDateString() : typeof h.date === 'string' ? h.date : 'Noma\'lum sana'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg md:text-xl font-black text-red-500 tabular-nums bg-red-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      -{h.amount} <LuCoins size={18} />
                    </span>
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

export default CoinShop;
