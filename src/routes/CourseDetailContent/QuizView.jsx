// src/routes/CourseDetailContent/QuizView.jsx
import React, { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, RotateCcw } from "lucide-react";

export default function QuizView({ lesson, onComplete, darkMode, accentColor = "#3b82f6" }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const quiz = lesson?.quizQuestions?.[0]; // Hozircha bitta test

  if (!quiz) return null;

  const isCorrect = selectedOpt === quiz.correct;
  
  const handleRetry = () => {
    setSelectedOpt(null);
    setIsChecked(false);
  };
  
  const bgColor = darkMode ? "bg-slate-900" : "bg-white";
  const textColor = darkMode ? "text-slate-200" : "text-slate-800";
  const borderColor = darkMode ? "border-slate-800" : "border-slate-200";

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className={`text-3xl font-bold ${textColor}`}>Bilimni sinash</h2>
        <p className="text-slate-500 mt-2">Darsni muvaffaqiyatli yakunlash uchun to'g'ri javobni tanlang.</p>
      </div>

      <div className={`${bgColor} border ${borderColor} rounded-3xl p-8 md:p-12 shadow-sm`}>
        <h3 className={`text-xl md:text-2xl font-semibold mb-8 ${textColor}`}>{quiz.question}</h3>

        <div className="space-y-4">
          {quiz.options.map((opt, idx) => {
            let itemClass = `border-2 ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-700'}`;
            
            if (isChecked) {
              if (idx === quiz.correct) itemClass = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
              else if (idx === selectedOpt) itemClass = "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400";
            } else if (idx === selectedOpt) {
              itemClass = "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 scale-[1.01]";
            }

            return (
              <button 
                key={idx} 
                disabled={isChecked}
                onClick={() => setSelectedOpt(idx)}
                className={`w-full text-left px-6 py-5 rounded-2xl font-medium transition-all ${itemClass} hover:border-indigo-400 flex justify-between items-center`}
              >
                <span>{opt}</span>
                {isChecked && idx === quiz.correct && <CheckCircle2 className="text-emerald-500" />}
                {isChecked && idx === selectedOpt && idx !== quiz.correct && <XCircle className="text-rose-500" />}
              </button>
            );
          })}
        </div>

        {/* Natija Izohi */}
        {isChecked && (
          <div className={`mt-8 p-6 rounded-2xl ${isCorrect ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-300'} animate-slideUp`}>
            <p className="font-bold text-lg mb-1">{isCorrect ? "Barakalla!" : "Noto'g'ri javob"}</p>
            <p className="text-slate-700 dark:text-slate-300">{quiz.explanation}</p>
          </div>
        )}
      </div>

      {/* Tugatish */}
      <div className="mt-8 flex justify-center gap-4">
        {!isChecked ? (
          <button 
            onClick={() => setIsChecked(true)} 
            disabled={selectedOpt === null}
            className="px-10 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 disabled:opacity-50 transition-all"
          >
            Javobni tekshirish
          </button>
        ) : isCorrect ? (
          <button 
            onClick={onComplete}
            className="flex items-center gap-2 px-10 py-4 font-bold rounded-2xl shadow-xl transition-all text-white hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            Darsni Yakunlash <ArrowRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleRetry}
            className="flex items-center gap-2 px-10 py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw size={20} /> Qayta urinish
          </button>
        )}
      </div>
    </div>
  );
}