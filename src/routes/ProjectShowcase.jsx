// в•”в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•—
// в•‘          ProjectShowcase.jsx  —”  Uzbekas Pixel Platform                     в•‘
// в•‘          Stack: React (Vite) + Tailwind CSS + Firebase + Lucide-React        в•‘
// в•љв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ќ

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import {
  LuHeart,
  LuGithub,
  LuPlus,
  LuX,
  LuInfo,
  LuCheck,
  LuLoader,
  LuTerminal,
  LuGlobe,
  LuUser,
  LuClock,
  LuStar,
  LuUpload,
  LuFolderOpen,
} from "react-icons/lu";

// в”Ђв”Ђв”Ђ TRANSLATIONS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const TRANSLATIONS = {
  uz: {
    badge: "Uzbekas Pixel",
    title: "O'quvchilar Loyihalari",
    subtitle: "Hamjamiyat tomonidan yaratilgan eng zo'r ishlar",
    uploadBtn: "Loyiha Qo'shish",
    noProjects: "Hali hech qanday loyiha yo'q.",
    noProjectsSub: "Birinchi loyihani yuklagan kishi bo'ling!",
    modalTitle: "Yangi Loyiha Qo'shish",
    modalSubtitle: "Uzbekas Pixel • Portfolio",
    labelTitle: "Loyiha nomi",
    labelDesc: "Texnik tavsif",
    labelLive: "Demo havolasi (ixtiyoriy)",
    labelGithub: "GitHub havolasi (ixtiyoriy)",
    placeholderTitle: "Masalan: E-Commerce Platform",
    placeholderDesc:
      "React, Firebase va Tailwind bilan qurilgan to'liq stack loyiha...",
    placeholderLive: "https://mening-loyiham.vercel.app",
    placeholderGithub: "https://github.com/username/repo",
    cancel: "Bekor qilish",
    submit: "Loyihani Yuklash",
    submitting: "Yuklanmoqda...",
    successMsg: "Loyihangiz muvaffaqiyatli qo'shildi! рџЋ‰",
    errorMsg: "Xatolik yuz berdi. Qayta urinib ko'ring.",
    loginRequired: "Ushbu amalni bajarish uchun tizimga kiring.",
    validUrl: "To'g'ri URL kiriting (https:// bilan boshlang).",
    required: "Bu maydon to'ldirilishi shart.",
    demoBtn: "Demo",
    codeBtn: "Kod",
    likeError: "Layk bosishda xatolik yuz berdi.",
    oneUrlRequired: "Kamida bitta havola (Demo yoki GitHub) kiriting.",
    optional: "ixtiyoriy",
    projectCount: (n) => `${n} ta loyiha`,
    community: "Uzbekas Pixel hamjamiyati",
    untitledProject: "Nomsiz loyiha",
    unknown: "Noma'lum",
    like: "Layk bosish",
    unlike: "Laykni olib tashlash",
    close: "Yopish",
    user: "Foydalanuvchi",
  },
  en: {
    badge: "Uzbekas Pixel",
    title: "Student Projects",
    subtitle: "The best works created by the community",
    uploadBtn: "Add Project",
    noProjects: "No projects yet.",
    noProjectsSub: "Be the first to upload a project!",
    modalTitle: "Add New Project",
    modalSubtitle: "Uzbekas Pixel • Portfolio",
    labelTitle: "Project name",
    labelDesc: "Technical description",
    labelLive: "Demo link (optional)",
    labelGithub: "GitHub link (optional)",
    placeholderTitle: "E.g.: E-Commerce Platform",
    placeholderDesc:
      "Full-stack project built with React, Firebase and Tailwind...",
    placeholderLive: "https://my-project.vercel.app",
    placeholderGithub: "https://github.com/username/repo",
    cancel: "Cancel",
    submit: "Upload Project",
    submitting: "Uploading...",
    successMsg: "Your project has been added successfully! рџЋ‰",
    errorMsg: "An error occurred. Please try again.",
    loginRequired: "Please login to perform this action.",
    validUrl: "Enter a valid URL (starting with https://).",
    required: "This field is required.",
    demoBtn: "Demo",
    codeBtn: "Code",
    likeError: "Error liking the project.",
    oneUrlRequired: "Enter at least one link (Demo or GitHub).",
    optional: "optional",
    projectCount: (n) => `${n} projects`,
    community: "Uzbekas Pixel community",
    untitledProject: "Untitled project",
    unknown: "Unknown",
    like: "Like",
    unlike: "Unlike",
    close: "Close",
    user: "User",
  },
};

// в”Ђв”Ђв”Ђ GLOBAL STYLES (Tailwind arbitrary value xatolarini oldini olish uchun inline CSS) в”Ђв”Ђ
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&display=swap');

  .up-root * { font-family: 'Onest', system-ui, sans-serif; box-sizing: border-box; }

  @keyframes up-fadeIn     { from { opacity: 0 } to { opacity: 1 } }
  @keyframes up-slideUp    { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
  @keyframes up-slideRight { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes up-pulse      { 0%, 100% { opacity: 0.4 } 50% { opacity: 0.95 } }
  @keyframes up-heartPop   { 0% { transform: scale(1) } 40% { transform: scale(1.45) } 70% { transform: scale(0.88) } 100% { transform: scale(1) } }
  @keyframes up-spin       { to { transform: rotate(360deg) } }
  @keyframes up-orb1       { 0%,100% { transform: translate(0,0) } 33% { transform: translate(10px,-20px) } 66% { transform: translate(-15px,10px) } }
  @keyframes up-orb2       { 0%,100% { transform: translate(0,0) } 33% { transform: translate(-10px,15px) } 66% { transform: translate(20px,-10px) } }

  .up-anim-fadeIn     { animation: up-fadeIn 0.3s ease forwards }
  .up-anim-slideUp    { animation: up-slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards }
  .up-anim-slideRight { animation: up-slideRight 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards }
  .up-anim-pulse      { animation: up-pulse 2s ease-in-out infinite }
  .up-anim-spin       { animation: up-spin 0.75s linear infinite }
  .up-anim-orb1       { animation: up-orb1 9s ease-in-out infinite }
  .up-anim-orb2       { animation: up-orb2 12s ease-in-out infinite }
  .up-heart-pop       { animation: up-heartPop 0.35s ease }

  /* line-clamp —” Tailwind plugin olmasa ham ishlaydi */
  .up-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .up-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Glassmorphism */
  .up-glass {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .up-card {
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
    cursor: default;
  }
  .up-card:hover {
    background: rgba(124,58,237,0.07);
    border-color: rgba(139,92,246,0.32);
    box-shadow: 0 0 48px rgba(139,92,246,0.13), 0 20px 60px rgba(0,0,0,0.35);
    transform: translateY(-4px);
  }

  /* Input */
  .up-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 11px 16px;
    color: rgba(255,255,255,0.85);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    font-family: 'Onest', system-ui, sans-serif;
    line-height: 1.5;
  }
  .up-input::placeholder { color: rgba(255,255,255,0.2); }
  .up-input:focus {
    border-color: rgba(139,92,246,0.6);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
    background: rgba(139,92,246,0.05);
  }
  .up-input-error { border-color: rgba(244,63,94,0.55) !important; box-shadow: 0 0 0 3px rgba(244,63,94,0.1) !important; }
  textarea.up-input { resize: none; }

  /* Buttons */
  .up-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border-radius: 14px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #7c3aed, #06b6d4);
    color: white; font-weight: 700; font-size: 14px;
    box-shadow: 0 8px 24px rgba(124,58,237,0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
    font-family: 'Onest', system-ui, sans-serif; text-decoration: none;
  }
  .up-btn-primary:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 12px 32px rgba(124,58,237,0.45); filter: brightness(1.08); }
  .up-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .up-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  .up-btn-cancel {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 12px 20px; border-radius: 14px; cursor: pointer;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.55); font-weight: 600; font-size: 13px;
    transition: all 0.2s ease; font-family: 'Onest', system-ui, sans-serif;
  }
  .up-btn-cancel:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }
  .up-btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

  .up-btn-demo {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 16px; border-radius: 12px; cursor: pointer;
    background: rgba(124,58,237,0.14);
    border: 1px solid rgba(139,92,246,0.24);
    color: rgb(196,181,253); font-weight: 600; font-size: 12px;
    transition: all 0.2s ease; text-decoration: none;
    font-family: 'Onest', system-ui, sans-serif; flex: 1;
  }
  .up-btn-demo:hover { background: rgba(124,58,237,0.28); border-color: rgba(139,92,246,0.5); color: white; }

  .up-btn-github {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 16px; border-radius: 12px; cursor: pointer;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6); font-weight: 600; font-size: 12px;
    transition: all 0.2s ease; text-decoration: none;
    font-family: 'Onest', system-ui, sans-serif; flex: 1;
  }
  .up-btn-github:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.22); color: white; }

  .up-like-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 9px 12px; border-radius: 12px; cursor: pointer; border: none;
    font-weight: 700; font-size: 12px;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    font-family: 'Onest', system-ui, sans-serif; white-space: nowrap;
  }
  .up-like-btn.liked   { background: rgba(244,63,94,0.18); border: 1px solid rgba(244,63,94,0.32); color: rgb(253,164,175); }
  .up-like-btn.liked:hover { background: rgba(244,63,94,0.1); }
  .up-like-btn.unlike  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }
  .up-like-btn.unlike:hover { background: rgba(244,63,94,0.12); border-color: rgba(244,63,94,0.28); color: rgb(253,164,175); }

  /* Skeleton shimmer */
  .up-skeleton { background: rgba(255,255,255,0.07); border-radius: 10px; animation: up-pulse 1.9s ease-in-out infinite; }

  /* Modal */
  .up-overlay {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  .up-modal {
    position: relative; width: 100%; max-width: 480px;
    background: #0c0c1a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px; overflow: hidden;
    max-height: 92vh; overflow-y: auto;
  }
  .up-modal::-webkit-scrollbar { width: 4px; }
  .up-modal::-webkit-scrollbar-track { background: transparent; }
  .up-modal::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }

  /* Close button */
  .up-close-btn {
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.45);
    transition: background 0.2s ease, color 0.2s ease;
  }
  .up-close-btn:hover { background: rgba(255,255,255,0.1); color: white; }

  @media (max-width: 640px) {
    .up-modal { border-radius: 20px; }
  }
`;

// в”Ђв”Ђв”Ђ TOAST в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function ToastContainer({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
        maxWidth: 360,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="up-anim-slideRight"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 14,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid",
            ...(toast.type === "success"
              ? {
                  background: "rgba(16,185,129,0.14)",
                  borderColor: "rgba(16,185,129,0.25)",
                  color: "rgb(167,243,208)",
                }
              : {
                  background: "rgba(244,63,94,0.14)",
                  borderColor: "rgba(244,63,94,0.25)",
                  color: "rgb(254,202,202)",
                }),
          }}
        >
          {toast.type === "success" ? (
            <LuCheck
              size={15}
              style={{ flexShrink: 0, color: "rgb(52,211,153)" }}
            />
          ) : (
            <LuInfo
              size={15}
              style={{ flexShrink: 0, color: "rgb(251,113,133)" }}
            />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// в”Ђв”Ђв”Ђ SKELETON CARD в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function SkeletonCard() {
  return (
    <div className="up-glass up-card" style={{ cursor: "default" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          className="up-skeleton"
          style={{ width: 34, height: 34, flexShrink: 0 }}
        />
        <div className="up-skeleton" style={{ height: 14, width: "60%" }} />
      </div>
      <div
        className="up-skeleton"
        style={{ height: 10, width: "100%", marginBottom: 8 }}
      />
      <div
        className="up-skeleton"
        style={{ height: 10, width: "88%", marginBottom: 8 }}
      />
      <div
        className="up-skeleton"
        style={{ height: 10, width: "72%", marginBottom: 20 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <div className="up-skeleton" style={{ height: 36, flex: 1 }} />
        <div className="up-skeleton" style={{ height: 36, flex: 1 }} />
        <div className="up-skeleton" style={{ height: 36, width: 56 }} />
      </div>
    </div>
  );
}

// в”Ђв”Ђв”Ђ PROJECT CARD в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const CARD_GRADIENTS = [
  "linear-gradient(135deg,#7c3aed,#06b6d4)",
  "linear-gradient(135deg,#db2777,#7c3aed)",
  "linear-gradient(135deg,#0891b2,#059669)",
  "linear-gradient(135deg,#d97706,#dc2626)",
  "linear-gradient(135deg,#6d28d9,#ec4899)",
  "linear-gradient(135deg,#0284c7,#7c3aed)",
];

function ProjectCard({ project, currentUser, onLike, t }) {
  const isLiked = !!(
    currentUser &&
    Array.isArray(project.likes) &&
    project.likes.includes(currentUser.uid)
  );
  const likeCount = Array.isArray(project.likes) ? project.likes.length : 0;
  const [heartClass, setHeartClass] = useState("");

  const formatDate = (ts) => {
    if (!ts || typeof ts.toDate !== "function") return "";
    try {
      return ts
        .toDate()
        .toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    } catch {
      return "";
    }
  };

  const handleLikeClick = () => {
    setHeartClass("up-heart-pop");
    onLike(project);
    setTimeout(() => setHeartClass(""), 400);
  };

  const gradIndex = project.id
    ? (project.id.charCodeAt(0) +
        project.id.charCodeAt(1 % project.id.length)) %
      CARD_GRADIENTS.length
    : 0;

  return (
    <div className="up-glass up-card">
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: CARD_GRADIENTS[gradIndex],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <LuTerminal size={16} color="white" />
        </div>
        <h3
          className="up-clamp-2"
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.35,
            margin: 0,
            flex: 1,
          }}
        >
          {project.title || t.untitledProject}
        </h3>
      </div>

      {/* Description */}
      <p
        className="up-clamp-3"
        style={{
          color: "rgba(255,255,255,0.42)",
          fontSize: 13,
          lineHeight: 1.65,
          marginBottom: 14,
          flex: 1,
        }}
      >
        {project.description || "—”"}
      </p>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4px 14px",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
          }}
        >
          <LuUser size={10} />
          {project.ownerName || t.unknown}
        </span>
        {project.createdAt && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "rgba(255,255,255,0.22)",
            }}
          >
            <LuClock size={10} />
            {formatDate(project.createdAt)}
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 14,
        }}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a
          href={project.liveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="up-btn-demo"
        >
          <LuGlobe size={12} />
          {t.demoBtn}
        </a>
        <a
          href={project.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="up-btn-github"
        >
          <LuGithub size={12} />
          {t.codeBtn}
        </a>
        <button
          onClick={handleLikeClick}
          className={`up-like-btn ${isLiked ? "liked" : "unlike"}`}
          aria-label={isLiked ? t.unlike : t.like}
        >
          <LuHeart
            size={13}
            fill={isLiked ? "currentColor" : "none"}
            className={heartClass}
          />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
}

// в”Ђв”Ђв”Ђ FORM FIELD в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function FormField({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255,255,255,0.38)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: 12,
            color: "rgb(251,113,133)",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontWeight: 500,
          }}
        >
          <LuInfo size={11} style={{ flexShrink: 0 }} />
          {error}
        </span>
      )}
    </div>
  );
}

// в”Ђв”Ђв”Ђ UPLOAD MODAL в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function UploadModal({ onClose, onSubmit, t }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    liveLink: "",
    githubLink: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  // Autofocus
  useEffect(() => {
    const id = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  // ESC tugmasi
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, loading]);

  const isValidUrl = (val) => {
    if (!val.trim()) return false;
    try {
      const url = new URL(val.trim());
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t.required;
    if (!form.description.trim()) e.description = t.required;
    // URL lar ixtiyoriy —” agar kiritilgan bo'lsa, format tekshiriladi
    if (form.liveLink.trim() && !isValidUrl(form.liveLink))
      e.liveLink = t.validUrl;
    if (form.githubLink.trim() && !isValidUrl(form.githubLink))
      e.githubLink = t.validUrl;
    // Kamida bitta havola bo'lishi shart
    if (!form.liveLink.trim() && !form.githubLink.trim()) {
      e.liveLink = t.oneUrlRequired;
      e.githubLink = t.oneUrlRequired;
    }
    return e;
  };

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        liveLink: form.liveLink.trim(),
        githubLink: form.githubLink.trim(),
      });
      // onSubmit muvaffaqiyatli bo'lsa, ichida modal yopiladi
    } catch {
      // Xato onSubmit ichida showToast orqali ko'rsatiladi
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div className="up-overlay up-anim-fadeIn" onClick={handleOverlayClick}>
      <div className="up-modal up-anim-slideUp">
        {/* Gradient stripe */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg,#7c3aed,#06b6d4,#7c3aed)",
          }}
        />

        <div style={{ padding: "28px 28px 32px" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(124,58,237,0.35)",
                }}
              >
                <LuUpload size={18} color="white" />
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.95)",
                  }}
                >
                  {t.modalTitle}
                </h2>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  {t.modalSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="up-close-btn"
              aria-label={t.close}
            >
              <LuX size={15} />
            </button>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <FormField label={t.labelTitle} error={errors.title}>
              <input
                ref={firstInputRef}
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder={t.placeholderTitle}
                className={`up-input${errors.title ? " up-input-error" : ""}`}
              />
            </FormField>

            <FormField label={t.labelDesc} error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder={t.placeholderDesc}
                rows={3}
                className={`up-input${errors.description ? " up-input-error" : ""}`}
              />
            </FormField>

            <FormField label={t.labelLive} error={errors.liveLink}>
              <div style={{ position: "relative" }}>
                <LuGlobe
                  size={14}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.22)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="url"
                  value={form.liveLink}
                  onChange={(e) => setField("liveLink", e.target.value)}
                  placeholder={t.placeholderLive}
                  className={`up-input${errors.liveLink ? " up-input-error" : ""}`}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </FormField>

            <FormField label={t.labelGithub} error={errors.githubLink}>
              <div style={{ position: "relative" }}>
                <LuGithub
                  size={14}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.22)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="url"
                  value={form.githubLink}
                  onChange={(e) => setField("githubLink", e.target.value)}
                  placeholder={t.placeholderGithub}
                  className={`up-input${errors.githubLink ? " up-input-error" : ""}`}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </FormField>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button
              onClick={onClose}
              disabled={loading}
              className="up-btn-cancel"
              style={{ flex: 1 }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="up-btn-primary"
              style={{ flex: 2, borderRadius: 14 }}
            >
              {loading ? (
                <>
                  <LuLoader size={15} className="up-anim-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <LuStar size={15} />
                  {t.submit}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// в”Ђв”Ђв”Ђ MAIN EXPORT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
export default function ProjectShowcase() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((item) => item.id !== id)),
      3800,
    );
  }, []);

  // Firestore realtime listener
  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (cancelled) return;
        setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        if (cancelled) return;
        console.error("Firestore onSnapshot xatosi:", error);
        // setState larni keyingi tick ga surish —” "cascading renders" xatosini oldini oladi
        setTimeout(() => {
          if (!cancelled) {
            setLoading(false);
            showToast(t.errorMsg, "error");
          }
        }, 0);
      },
    );

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [showToast, t.errorMsg]);

  // Loyiha yuklash
  const handleUpload = useCallback(
    async (formData) => {
      if (!user) {
        showToast(t.loginRequired, "error");
        throw new Error("unauthenticated");
      }
      await addDoc(collection(db, "projects"), {
        title: formData.title,
        description: formData.description,
        liveLink: formData.liveLink,
        githubLink: formData.githubLink,
        ownerId: user.uid,
        ownerName: user.displayName || user.email || t.user,
        likes: [],
        createdAt: serverTimestamp(),
      });
      showToast(t.successMsg, "success");
      setShowModal(false);
    },
    [user, showToast, t.loginRequired, t.successMsg],
  );

  // Layk bosish
  const handleLike = useCallback(
    async (project) => {
      if (!user) {
        showToast(t.loginRequired, "error");
        return;
      }
      const docRef = doc(db, "projects", project.id);
      const isLiked =
        Array.isArray(project.likes) && project.likes.includes(user.uid);
      try {
        await updateDoc(docRef, {
          likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        });
      } catch (error) {
        console.error("Like xatosi:", error);
        showToast(t.likeError, "error");
      }
    },
    [user, showToast, t.loginRequired, t.likeError],
  );

  return (
    <div
      className="up-root"
      style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}
    >
      {/* Global styles */}
      <style>{GLOBAL_CSS}</style>

      {/* Ambient background orbs */}
      <div
        className="up-anim-orb1"
        style={{
          position: "fixed",
          top: "8%",
          left: "3%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="up-anim-orb2"
        style={{
          position: "fixed",
          bottom: "8%",
          right: "3%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.055) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      {/* Modal */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSubmit={handleUpload}
          t={t}
        />
      )}

      {/* Page */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 20px 64px",
        }}
      >
        {/* в”Ђв”Ђ HEADER в”Ђв”Ђ */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <span
              className="up-anim-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgb(167,139,250)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgb(196,181,253)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {t.badge}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(30px,5vw,52px)",
              fontWeight: 900,
              background:
                "linear-gradient(135deg,white 30%,rgba(196,181,253,0.9) 65%,rgba(103,232,249,0.85) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            {t.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: "0 auto 32px",
              maxWidth: 400,
              fontSize: 15,
              color: "rgba(255,255,255,0.36)",
              lineHeight: 1.65,
            }}
          >
            {t.subtitle}
          </p>

          {/* CTA */}
          <button
            onClick={() =>
              user ? setShowModal(true) : showToast(t.loginRequired, "error")
            }
            className="up-btn-primary"
            style={{ padding: "13px 28px", fontSize: 14, borderRadius: 16 }}
          >
            <LuPlus size={18} />
            {t.uploadBtn}
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)",
            marginBottom: 44,
          }}
        />

        {/* в”Ђв”Ђ GRID в”Ђв”Ђ */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <LuFolderOpen size={32} color="rgba(255,255,255,0.18)" />
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgba(255,255,255,0.38)",
                margin: "0 0 6px",
              }}
            >
              {t.noProjects}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.2)",
                margin: 0,
              }}
            >
              {t.noProjectsSub}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={user}
                onLike={handleLike}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && projects.length > 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
              marginTop: 48,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {t.projectCount(projects.length)} • {t.community}
          </p>
        )}
      </section>
    </div>
  );
}
