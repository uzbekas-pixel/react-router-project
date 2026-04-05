import React, { useState, useEffect, useCallback } from "react";
import {
  LuBookOpen, LuBot, LuTarget, LuLayoutDashboard,
  LuRocket, LuArrowLeft, LuArrowRight, LuX
} from "react-icons/lu";
import { useLang } from "../context/useLang";

const Onboarding = ({ darkMode, onComplete, navigate }) => {
  const { t } = useLang();

  const STEPS = [
    {
      id: 1,
      icon: <LuRocket className="text-5xl" style={{ color: "#3b82f6" }} />,
      title: t.onboardingTitle1,
      desc: t.onboardingDesc1,
      color: "#3b82f6",
      action: null,
    },
    {
      id: 2,
      icon: <LuBookOpen className="text-5xl" style={{ color: "#10b981" }} />,
      title: t.onboardingTitle2,
      desc: t.onboardingDesc2,
      color: "#10b981",
      action: { label: t.onboardingBtn2, path: "/" },
    },
    {
      id: 21,
      icon: <LuBot className="text-5xl" style={{ color: "#8b5cf6" }} />,
      title: t.onboardingTitle3,
      desc: t.onboardingDesc3,
      color: "#8b5cf6",
      action: { label: t.onboardingBtn3, path: "/ai-tutor" },
    },
    {
      id: 4,
      icon: <LuTarget className="text-5xl" style={{ color: "#f59e0b" }} />,
      title: t.onboardingTitle4,
      desc: t.onboardingDesc4,
      color: "#f59e0b",
      action: { label: t.onboardingBtn4, path: "/quiz" },
    },
    {
      id: 5,
      icon: <LuLayoutDashboard className="text-5xl" style={{ color: "#ef4444" }} />,
      title: t.onboardingTitle5,
      desc: t.onboardingDesc5,
      color: "#ef4444",
      action: { label: t.onboardingBtn5, path: "/dashboard" },
    },
    {
      id: 6,
      icon: <LuRocket className="text-5xl" style={{ color: "#f59e0b" }} />,
      title: t.onboardingTitle6,
      desc: <span className="flex items-center justify-center gap-1">{t.onboardingDesc6} <LuRocket /></span>,
      color: "#f59e0b",
      action: { label: <span className="flex items-center gap-1">{t.onboardingBtn6} <LuRocket /></span>, path: "/" },
    },
  ];

  const [step, setStep]           = useState(0);
  const [animating, setAnimating] = useState(false);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (animating) return;
    if (isLast) {
      localStorage.setItem("onboarding_done", "true");
      onComplete && onComplete();
      return;
    }
    setAnimating(true);
    setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 300);
  }, [animating, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (animating || step === 0) return;
    setAnimating(true);
    setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 300);
  }, [animating, step]);

  const skip = useCallback(() => {
    localStorage.setItem("onboarding_done", "true");
    onComplete && onComplete();
  }, [onComplete]);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && skip();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [skip]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: darkMode ? "#1e293b" : "#fff",
        borderRadius: 24, padding: "36px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        opacity: animating ? 0 : 1,
        transform: animating ? "scale(0.97)" : "scale(1)",
        transition: "all 0.3s ease",
        position: "relative",
      }}>

        {/* Skip */}
        {!isLast && (
          <button onClick={skip} style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#6b7280", fontWeight: 600,
            padding: "4px 8px", borderRadius: 6,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <LuX size={14} />
            {t.onboardingSkip}
          </button>
        )}

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: current.color + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          {current.icon}
        </div>

        {/* Content */}
        <h2 style={{
          margin: "0 0 12px", fontWeight: 800, fontSize: 22,
          color: darkMode ? "#f1f5f9" : "#111",
          textAlign: "center",
        }}>
          {current.title}
        </h2>
        <p style={{
          margin: "0 0 28px", fontSize: 14,
          color: "#6b7280", textAlign: "center", lineHeight: 1.7,
        }}>
          {current.desc}
        </p>

        {/* Action Button */}
        {current.action && (
          <button
            onClick={() => navigate && navigate(current.action.path)}
            style={{
              display: "block", width: "100%",
              margin: "-16px 0 24px",
              padding: "10px", borderRadius: 12,
              border: `1px solid ${current.color}`,
              background: current.color + "11",
              color: current.color,
              fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}>
            {current.action.label}
          </button>
        )}

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => !animating && setStep(i)} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? current.color : (darkMode ? "#334155" : "#e5e7eb"),
              cursor: "pointer", transition: "all 0.3s", flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={goPrev} style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`,
              background: "transparent",
              color: darkMode ? "#94a3b8" : "#374151",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <LuArrowLeft size={16} /> {t.onboardingBack}
            </button>
          )}
          <button onClick={goNext} style={{
            flex: 2, padding: "12px 0", borderRadius: 12,
            border: "none", background: current.color,
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 4px 16px ${current.color}55`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {isLast ? (
              <>{t.onboardingBtn6} <LuRocket size={16} /></>
            ) : (
              <>{t.onboardingNext} <LuArrowRight size={16} /></>
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 4, borderRadius: 2, background: darkMode ? "#334155" : "#e5e7eb" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: current.color,
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: "width 0.4s ease",
          }} />
        </div>
        <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 11, color: "#6b7280" }}>
          {step + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
};

export default Onboarding;