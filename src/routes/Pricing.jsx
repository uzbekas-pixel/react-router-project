import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";
import { useAuth } from "../context/useAuth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  LuCheck, 
  LuX, 
  LuZap, 
  LuShieldCheck, 
  LuCrown, 
  LuPhone,
  LuInfo,
} from "react-icons/lu";

const Pricing = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [billing, setBilling] = useState("monthly");
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setUserPlan(snap.data().plan || null);
    });
  }, [user]);

  const plans = [
    {
      id: "free", 
      name: t.freeLabel, 
      price: { monthly: 0, yearly: 0 },
      color: "emerald",
      icon: <LuShieldCheck size={28} />,
      badge: null,
      features: [
        { text: t.feat5FreeCourses, ok: true },
        { text: t.featLimitedVideo, ok: true },
        { text: t.featCommunity, ok: true },
        { text: t.featCertificate, ok: false },
        { text: t.featAllCourses, ok: false },
        { text: t.featChat, ok: false },
        { text: t.featOffline, ok: false },
        { text: t.featSupport, ok: false },
      ],
    },
    {
      id: "pro", 
      name: t.planNamePro, 
      price: { monthly: 99000, yearly: 79000 },
      color: "blue",
      icon: <LuZap size={28} />,
      badge: t.badgePopular,
      features: [
        { text: t.featAllCourses, ok: true },
        { text: t.featUnlimitedVideo, ok: true },
        { text: t.featCommunity, ok: true },
        { text: t.featCertificate, ok: true },
        { text: t.featNewCourses, ok: true },
        { text: t.featChat, ok: false },
        { text: t.featOffline, ok: false },
        { text: t.featSupport, ok: false },
      ],
    },
    {
      id: "premium", 
      name: t.planNamePremium, 
      price: { monthly: 199000, yearly: 159000 },
      color: "indigo",
      icon: <LuCrown size={28} />,
      badge: t.badgeFull,
      features: [
        { text: t.featAllCourses, ok: true },
        { text: t.featUnlimitedVideo, ok: true },
        { text: t.featCommunity, ok: true },
        { text: t.featCertificate, ok: true },
        { text: t.featNewCourses, ok: true },
        { text: t.featChat, ok: true },
        { text: t.featOffline, ok: true },
        { text: t.featSupport, ok: true },
      ],
    },
  ];

  const selectPlan = async (plan) => {
    if (!user) { showToast?.(t.loginRequired, "error"); return; }
    if (userPlan === plan.id) { showToast?.(t.alreadySelected, "info"); return; }
    setLoading(plan.id);
  try {
      await setDoc(doc(db, "users", user.uid), {
        plan:        plan.id,
        // O'ZGARISH: Agar tarjima yo'q bo'lsa, xato bermasligi uchun qattiq matn qo'shildi
        planName:    plan.name || plan.id, 
        planBilling: billing,
        planPrice:   plan.price[billing] || 0,
        planStarted: serverTimestamp(),
      }, { merge: true });
      setUserPlan(plan.id);
      showToast?.(`${plan.name} ${t.planSelected}`, "success");
    } catch (err) {
      console.error(err);
      showToast?.(t.errorOccurred, "error");
    }
    setLoading(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {t.pricingBadge}
          </span>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            {t.pricingTitle}
          </h2>
          <p className="text-slate-500 text-lg mb-10">{t.pricingDesc}</p>

          <div className={`inline-flex p-1 rounded-2xl border transition-all duration-500 ${
            darkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-100 border-slate-200"
          }`}>
            {["monthly", "yearly"].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-500 flex items-center gap-3 ${
                  billing === b 
                    ? "bg-blue-500 text-white shadow-xl shadow-blue-500/25 scale-[1.02]" 
                    : "text-slate-500 hover:text-slate-400"
                }`}
              >
                {b === "monthly" ? t.monthly : t.yearly}
                {b === "yearly" && (
                  <span className="bg-yellow-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, i) => {
          const price = plan.price[billing];
          const isMain = plan.id === "pro";
          const isSelected = userPlan === plan.id;
          
          return (
            <ScrollReveal key={plan.id} direction="up" delay={i * 100}>
              <div className={`relative flex flex-col h-full rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 group ${
                isSelected 
                  ? "ring-2 ring-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10" 
                  : isMain 
                    ? `ring-1 ring-blue-500/50 ${darkMode ? "bg-slate-900/40 shadow-2xl shadow-blue-500/10" : "bg-white shadow-2xl shadow-slate-100"}`
                    : `${darkMode ? "bg-slate-900/40 hover:bg-slate-900/60" : "bg-white hover:bg-slate-50"} border border-white/5`
              }`} style={{ backdropFilter: "blur(20px)" }}>
                
                {isSelected && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg shadow-emerald-500/40">
                    {t.activePlan}
                  </div>
                )}
                {!isSelected && plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-${plan.color}-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                    darkMode ? `bg-${plan.color}-500/10 text-${plan.color}-400` : `bg-${plan.color}-50 text-${plan.color}-600`
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {price === 0 ? t.freeLabel : price.toLocaleString()}
                    </span>
                    {price > 0 && <span className="text-slate-500 text-sm font-medium">{t.perMonth}</span>}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className="mt-2 text-xs font-bold text-emerald-500 uppercase tracking-wide">{t.yearlySave}</p>
                  )}
                </div>

                <div className="flex-1 space-y-5 mb-10">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-4 group/item">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        f.ok 
                          ? darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                          : darkMode ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-300"
                      }`}>
                        {f.ok ? <LuCheck size={14} /> : <LuX size={14} />}
                      </div>
                      <span className={`text-sm tracking-tight transition-colors ${
                        f.ok 
                          ? darkMode ? "text-slate-300 group-hover/item:text-white" : "text-slate-600 group-hover/item:text-slate-900" 
                          : "text-slate-500 line-through opacity-50"
                      }`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => selectPlan(plan)}
                  disabled={loading === plan.id || isSelected}
                  className={`w-full py-4 rounded-2xl text-sm font-black transition-all duration-500 relative overflow-hidden group/btn ${
                    isSelected 
                      ? "bg-emerald-500 text-white cursor-default" 
                      : isMain 
                        ? "bg-blue-500 text-white hover:bg-blue-400 shadow-xl shadow-blue-500/25 active:scale-95"
                        : darkMode 
                          ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/5 active:scale-95" 
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200 active:scale-95"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading === plan.id ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isSelected ? (
                      <><LuCheck size={18} /> {t.activePlan}</>
                    ) : plan.id === "free" ? t.startFree : t.selectPlan}
                  </span>
                </button>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal direction="up" delay={200}>
        <div className="mt-20 text-center">
          <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-3xl border ${
            darkMode ? "bg-slate-900/40 border-white/5 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"
          }`}>
            <LuInfo className="text-blue-500" size={20} />
            <span className="text-sm font-medium">{t.haveQuestion}</span>
            <a 
              href="tel:+998330345644" 
              className="flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors"
            >
              <LuPhone size={16} />
              {t.contactUs}
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Pricing;