// src/constants/shopConstants.js
// Barcha komponentlarda ism rangini ko'rsatish uchun: Leaderboard, Profile, Chat, DM, CoinShop

export const NAME_COLORS = {
  default:    { label: "Standart",    style: {} },
  gold:       { label: "Oltin",       style: { color: "#d97706", textShadow: "0 0 8px #f59e0b88" } },
  neon_blue:  { label: "Neon Ko'k",   style: { color: "#06b6d4", textShadow: "0 0 10px #06b6d499" } },
  neon_green: { label: "Neon Yashil", style: { color: "#10b981", textShadow: "0 0 10px #10b98199" } },
  purple:     { label: "Binafsha",    style: { color: "#8b5cf6", textShadow: "0 0 8px #8b5cf699" } },
  rose:       { label: "Atirgul",     style: { color: "#f43f5e", textShadow: "0 0 8px #f43f5e99" } },
  rainbow:    {
    label: "Kamalak",
    style: {
      background: "linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#3b82f6,#8b5cf6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
  },
};

/** Owned items ro'yxatiga qarab CSS style qaytaradi */
export const getNameStyle = (owned = []) => {
  for (const key of ["rainbow", "rose", "purple", "neon_green", "neon_blue", "gold"]) {
    if (owned.includes("name_" + key)) return NAME_COLORS[key].style;
  }
  return NAME_COLORS.default.style;
};

/** nameColor string ga qarab CSS style qaytaradi (Firestore users/{uid}.nameColor uchun) */
export const getNameStyleByKey = (nameColor = "default") => {
  return NAME_COLORS[nameColor]?.style || {};
};