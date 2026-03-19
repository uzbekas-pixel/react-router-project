import React, { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";

const plans = [
  {
    id: "free", name: "Bepul", price: { monthly: 0, yearly: 0 },
    color: "#10b981", badge: null,
    features: [
      { text: "5 ta bepul kurs", ok: true },
      { text: "Video darslar (cheklangan)", ok: true },
      { text: "Community forum", ok: true },
      { text: "Sertifikat", ok: false },
      { text: "Barcha kurslar", ok: false },
      { text: "O'qituvchi bilan chat", ok: false },
      { text: "Offline yuklab olish", ok: false },
      { text: "Ustunlik qo'llab-quvvatlash", ok: false },
    ],
  },
  {
    id: "pro", name: "Pro", price: { monthly: 99000, yearly: 79000 },
    color: "#3b82f6", badge: "Eng mashhur",
    features: [
      { text: "Barcha kurslar", ok: true },
      { text: "Cheksiz video darslar", ok: true },
      { text: "Community forum", ok: true },
      { text: "Tugatish sertifikati", ok: true },
      { text: "Yangi kurslar (darhol)", ok: true },
      { text: "O'qituvchi bilan chat", ok: false },
      { text: "Offline yuklab olish", ok: false },
      { text: "Ustunlik qo'llab-quvvatlash", ok: false },
    ],
  },
  {
    id: "premium", name: "Premium", price: { monthly: 199000, yearly: 159000 },
    color: "#8b5cf6", badge: "To'liq imkoniyat",
    features: [
      { text: "Barcha kurslar", ok: true },
      { text: "Cheksiz video darslar", ok: true },
      { text: "Community forum", ok: true },
      { text: "Tugatish sertifikati", ok: true },
      { text: "Yangi kurslar (darhol)", ok: true },
      { text: "O'qituvchi bilan chat", ok: true },
      { text: "Offline yuklab olish", ok: true },
      { text: "Ustunlik qo'llab-quvvatlash", ok: true },
    ],
  },
];

const Pricing = ({ darkMode, showToast }) => {
  const [billing, setBilling] = useState("monthly");

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{
            display: "inline-block", background: "#eff6ff", color: "#3b82f6",
            fontSize: 12, fontWeight: 700, padding: "4px 14px",
            borderRadius: 20, marginBottom: 12, border: "1px solid #bfdbfe",
          }}>
            💎 Narxlar
          </span>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: darkMode ? "#f1f5f9" : "#111" }}>
            O'zingizga mos rejani tanlang
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Istalgan vaqt bekor qilish mumkin. Yashirin to'lovlar yo'q.
          </p>

          {/* Billing toggle */}
          <div style={{
            display: "inline-flex", gap: 0,
            background: darkMode ? "#1e293b" : "#f1f5f9",
            borderRadius: 10, padding: 4,
          }}>
            {["monthly", "yearly"].map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: "8px 20px", borderRadius: 8,
                  border: "none", cursor: "pointer",
                  background: billing === b ? "#3b82f6" : "transparent",
                  color: billing === b ? "#fff" : "#6b7280",
                  fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {b === "monthly" ? "Oylik" : "Yillik"}
                {b === "yearly" && (
                  <span style={{
                    background: "#fef08a", color: "#713f12",
                    fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                  }}>-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20, alignItems: "stretch",
      }}>
        {plans.map((plan, i) => {
          const price = plan.price[billing];
          const isPro = plan.id === "pro";
          return (
            <ScrollReveal key={plan.id} direction="up" delay={i * 100}>
              <div style={{
                background: darkMode ? "#1e293b" : "#fff",
                borderRadius: 18,
                border: `${isPro ? 2 : 1}px solid ${isPro ? plan.color : darkMode ? "#334155" : "#e5e7eb"}`,
                padding: "28px 24px",
                position: "relative",
                boxShadow: isPro ? `0 8px 32px ${plan.color}33` : "none",
                height: "100%", boxSizing: "border-box",
                display: "flex", flexDirection: "column",
              }}>
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: plan.color, color: "#fff",
                    fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16, color: plan.color }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: darkMode ? "#f1f5f9" : "#111" }}>
                      {price === 0 ? "Bepul" : price.toLocaleString()}
                    </span>
                    {price > 0 && (
                      <span style={{ fontSize: 13, color: "#6b7280" }}>so'm/oy</span>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#10b981" }}>
                      Yiliga {(price * 12).toLocaleString()} so'm — tejaysiz!
                    </p>
                  )}
                </div>

                <div style={{ flex: 1, marginBottom: 20 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: f.ok ? (plan.color + "22") : "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: f.ok ? plan.color : "#9ca3af",
                        flexShrink: 0,
                      }}>
                        {f.ok ? "✓" : "✕"}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: f.ok ? (darkMode ? "#e2e8f0" : "#374151") : "#9ca3af",
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast && showToast(`${plan.name} rejasi tanlandi! 🎉`, "success")}
                  style={{
                    width: "100%", padding: "12px 0",
                    background: isPro ? plan.color : "transparent",
                    color: isPro ? "#fff" : plan.color,
                    border: `2px solid ${plan.color}`,
                    borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = plan.color;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!isPro) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = plan.color;
                    }
                  }}
                >
                  {plan.id === "free" ? "Bepul Boshlash" : "Rejani Tanlash"}
                </button>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* FAQ under pricing */}
      <ScrollReveal direction="up" delay={200}>
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Savol bormi? <span style={{ color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>Biz bilan bog'laning →</span>
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Pricing;