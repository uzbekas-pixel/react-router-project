// src/routes/CourseDetailContent/LessonView.jsx
import React, { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2, FileCode } from "lucide-react";

export default function LessonView({
  lesson,
  onComplete,
  darkMode,
  accentColor = "#3b82f6",
  hasPractice = true, // index.jsx dan uzatiladi: isProgramming
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = lesson?.slides || [];
  const currentSlideData = slides[currentSlide];

  const bgColor = darkMode ? "bg-slate-900" : "bg-white";
  const textColor = darkMode ? "text-slate-200" : "text-slate-800";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";
  const borderColor = darkMode ? "border-slate-800" : "border-slate-200";

  const isLastSlide = currentSlide === slides.length - 1;

  // Tugma matni: amaliyot bormi yoki yo'qmi?
  const lastSlideLabel = hasPractice ? "Amaliyotga o'tish" : "Testga o'tish";

  if (!slides.length)
    return <div className="text-center py-10">Slaydlar topilmadi</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Slayd progressi */}
      <div className="flex gap-2 mb-8 justify-center">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-8" : "w-2"
            } ${
              idx <= currentSlide ? "" : "bg-slate-300 dark:bg-slate-700"
            }`}
            style={{
              backgroundColor: idx <= currentSlide ? accentColor : undefined,
            }}
          />
        ))}
      </div>

      {/* Asosiy Slayd Kontenti */}
      <div
        key={currentSlide}
        className={`${bgColor} animate-fadeIn rounded-3xl border ${borderColor} p-8 md:p-12 shadow-sm min-h-[400px] flex flex-col justify-center transition-all duration-300`}
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">{currentSlideData.icon}</span>
          <h2 className={`text-2xl md:text-3xl font-extrabold ${textColor}`}>
            {currentSlideData.title}
          </h2>
        </div>

        <div
          className={`prose prose-lg max-w-none ${darkMode ? "prose-invert" : ""} ${mutedText}`}
          dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
        />

        {/* Kod bloki */}
        {currentSlideData.code && (
          <div className="mt-8 rounded-2xl overflow-hidden bg-[#0d1117] border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-slate-800">
              <FileCode size={16} className="text-slate-400" />
              <span className="text-xs text-slate-400 font-mono">
                misol.{currentSlideData.language || "js"}
              </span>
            </div>
            <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <code>{currentSlideData.code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Navigatsiya Tugmalari */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setCurrentSlide((c) => c - 1)}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            currentSlide === 0
              ? "opacity-0 pointer-events-none"
              : `${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"} ${mutedText}`
          }`}
        >
          <ArrowLeft size={20} /> Oldingi
        </button>

        <button
          onClick={() =>
            isLastSlide ? onComplete() : setCurrentSlide((c) => c + 1)
          }
          className="flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 10px 25px -5px ${accentColor}80`,
          }}
        >
          {isLastSlide ? (
            <>
              <CheckCircle2 size={20} /> {lastSlideLabel}
            </>
          ) : (
            <>
              Keyingi slayd <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}