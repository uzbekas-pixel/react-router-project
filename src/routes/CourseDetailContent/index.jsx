// src/routes/CourseDetailContent/index.jsx
import React, { useState } from "react";
import { XCircle, MessageSquare } from "lucide-react";
import { lessonsDB } from "./lessonsDB";

import LessonView from "./LessonView";
import CodePracticeView from "./CodePracticeView";
import QuizView from "./QuizView";

// Bosqich identifikatorlari
const PHASE = {
  LESSON: "lesson",
  PRACTICE: "practice",
  QUIZ: "quiz",
};

export default function CourseDetailContent({
  lesson,
  courseId,
  courseColor,
  onClose,
  onComplete,
  darkMode,
}) {
  const dbLessonData = lessonsDB[courseId]?.[lesson.id];

  const textColor = darkMode ? "text-slate-100" : "text-slate-900";
  const modalBg = darkMode ? "bg-slate-950/95" : "bg-slate-50/95";

  // Dars turiga qarab bosqichlar ketma-ketligini aniqlaymiz
  const isProgramming = dbLessonData?.type === "programming" && !!dbLessonData?.task;
  const phases = isProgramming
    ? [PHASE.LESSON, PHASE.PRACTICE, PHASE.QUIZ]
    : [PHASE.LESSON, PHASE.QUIZ];

  const phasesLabels = {
    [PHASE.LESSON]: "Dars",
    [PHASE.PRACTICE]: "Amaliyot",
    [PHASE.QUIZ]: "Test",
  };

  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = phases[phaseIndex];

  if (!dbLessonData) {
    return (
      <div
        className={`fixed inset-0 z-10000 ${modalBg} backdrop-blur-md flex flex-col items-center justify-center p-4`}
      >
        <div
          className={`max-w-md w-full p-8 rounded-3xl ${
            darkMode ? "bg-slate-800" : "bg-white"
          } shadow-2xl text-center`}
        >
          <MessageSquare size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
          <h2 className={`text-xl font-bold mb-2 ${textColor}`}>Dars tayyorlanmoqda</h2>
          <p className="text-slate-500 mb-6">
            "{lesson.title}" darsi uchun ma'lumotlar tez orada qo'shiladi.
          </p>
          <button
            onClick={() => onClose(false)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium w-full hover:bg-indigo-700 transition-all"
          >
            Ortga qaytish
          </button>
        </div>
      </div>
    );
  }

  const handlePhaseComplete = () => {
    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
    } else {
      // Dars to'liq tugadi
      onComplete(lesson.id);
      onClose(true);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-10000 ${modalBg} backdrop-blur-xl flex flex-col overflow-y-auto`}
    >
      {/* Tepadagi Progress Bar */}
      <div
        className={`sticky top-0 z-50 ${
          darkMode
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/80 border-slate-200"
        } backdrop-blur-lg border-b px-4 md:px-8 py-4 flex items-center justify-between shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <span
            className="hidden md:inline-flex px-3 py-1 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: courseColor || "#3b82f6" }}
          >
            {isProgramming ? "Dasturlash" : "Til kursi"}
          </span>
          <h1
            className={`font-bold text-base md:text-lg ${textColor} truncate max-w-[200px] md:max-w-md`}
          >
            {dbLessonData.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex gap-2 mr-4">
            {phases.map((phase, i) => (
              <div
                key={phase}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  phaseIndex === i
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : phaseIndex > i
                    ? darkMode
                      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800"
                      : "bg-emerald-100 text-emerald-700"
                    : darkMode
                    ? "bg-slate-800 text-slate-500"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {phasesLabels[phase]}
              </div>
            ))}
          </div>
          <button
            onClick={() => onClose(false)}
            className={`p-2 rounded-full transition-all ${
              darkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <XCircle size={24} />
          </button>
        </div>
      </div>

      {/* Asosiy Ekran */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 py-8 md:py-12">
        {currentPhase === PHASE.LESSON && (
          <LessonView
            lesson={dbLessonData}
            onComplete={handlePhaseComplete}
            darkMode={darkMode}
            accentColor={courseColor}
            hasPractice={isProgramming}
          />
        )}
        {currentPhase === PHASE.PRACTICE && (
          <CodePracticeView
            lesson={dbLessonData}
            onComplete={handlePhaseComplete}
            darkMode={darkMode}
            accentColor={courseColor}
          />
        )}
        {currentPhase === PHASE.QUIZ && (
          <QuizView
            lesson={dbLessonData}
            onComplete={handlePhaseComplete}
            darkMode={darkMode}
            accentColor={courseColor}
          />
        )}
      </div>
    </div>
  );
}