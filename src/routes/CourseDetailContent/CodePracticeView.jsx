// src/routes/CourseDetailContent/CodePracticeView.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function CodePracticeView({ lesson, onComplete, darkMode }) {
  const task = lesson?.task;
  const [code, setCode] = useState(task?.starterCode || "");
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  // Lesson o'zgarganda kodni reset qilish
  useEffect(() => {
    setCode(task?.starterCode || "");
    setFeedback(null);
  }, [lesson?.id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bgColor = darkMode ? "bg-slate-900" : "bg-white";
  const textColor = darkMode ? "text-slate-200" : "text-slate-800";
  const borderColor = darkMode ? "border-slate-800" : "border-slate-200";

  // Talablarni tekshirish funksiyasi
  const validateCode = (codeToCheck, taskObj) => {
    const codeLower = codeToCheck.toLowerCase();
    const errors = [];
    const requirements = taskObj.requirements || [];

    requirements.forEach((req, index) => {
      const reqLower = req.toLowerCase();

      // Atributlar: attrName="value" yoki attrName='value' — case-insensitive
      const attrMatches = req.match(/([a-zA-Z-]+)=["']([^"']+)["']/g);
      if (attrMatches) {
        attrMatches.forEach((attr) => {
          if (!codeLower.includes(attr.toLowerCase())) {
            const attrName = attr.split("=")[0];
            if (!codeLower.includes(attrName.toLowerCase())) {
              errors.push(`${index + 1}. ${attrName} atributi topilmadi`);
            }
          }
        });
      }

      // id atributini alohida tekshirish
      const idMatch = req.match(/id=["']([^"']+)["']/i);
      if (idMatch) {
        const idVal = idMatch[1].toLowerCase();
        if (
          !codeLower.includes(`id="${idVal}"`) &&
          !codeLower.includes(`id='${idVal}'`)
        ) {
          errors.push(`${index + 1}. id="${idMatch[1]}" topilmadi`);
        }
      }

      // JavaScript funksiyalarini tekshirish — to'g'ri escape bilan
      const jsFunctions = [
        "console.log",
        "console.error",
        "console.warn",
        "document.querySelector",
        "document.getElementById",
        "document.createElement",
        "window.worker",
        "fetch",
        "alert",
        "prompt",
        "settimeout",
        "setinterval",
      ];
      jsFunctions.forEach((func) => {
        if (reqLower.includes(func) && !codeLower.includes(func)) {
          errors.push(`${index + 1}. ${func}() funksiyasi topilmadi`);
        }
      });

      // JavaScript kalit so'zlar
      const jsKeywords = ["const", "let", "var", "function", "return", "if", "else", "for", "while", "new"];
      jsKeywords.forEach((keyword) => {
        // Faqat mustaqil so'z sifatida tekshirish (boshqa so'z bilan qo'shilib ketmasin)
        if (reqLower.includes(`'${keyword}'`) || reqLower.includes(`"${keyword}"`)) {
          const regex = new RegExp(`\\b${keyword}\\b`);
          if (!regex.test(codeToCheck)) {
            errors.push(`${index + 1}. '${keyword}' kalit so'zi topilmadi`);
          }
        }
      });
    });

    // mustInclude — case-insensitive tekshiruv
    if (taskObj.mustInclude && Array.isArray(taskObj.mustInclude)) {
      taskObj.mustInclude.forEach((keyword) => {
        if (!codeLower.includes(keyword.toLowerCase())) {
          errors.push(`Kodingizda quyidagi qism yetishmayapti: ${keyword}`);
        }
      });
    }

    // Minimal uzunlik
    if (codeToCheck.trim().length < 15) {
      errors.push("Kod juda qisqa (kamida 15 ta belgi)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleAICheck = () => {
    setIsChecking(true);
    setFeedback(null);
    timerRef.current = setTimeout(() => {
      const result = validateCode(code, task);

      if (result.isValid) {
        setFeedback({
          success: true,
          message: "Ajoyib! Barcha talablar bajarildi. Kodingiz to'g'ri ishladi!",
        });
      } else {
        setFeedback({
          success: false,
          message: `Quyidagi talablar bajarilmagan:\n${result.errors.join("\n")}`,
        });
      }
      setIsChecking(false);
    }, 2000);
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  if (!task) return null;

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Chap tomon — Topshiriq */}
        <div className="space-y-6">
          <div className={`${bgColor} rounded-3xl p-8 border ${borderColor} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4 text-indigo-500">
              <Terminal size={24} />
              <h3 className={`font-bold text-xl ${textColor}`}>Amaliy Topshiriq</h3>
            </div>
            <p className={darkMode ? "text-slate-300" : "text-slate-700"}>{task.description}</p>

            <div className="mt-6">
              <h4
                className={`font-semibold mb-3 text-sm uppercase tracking-wider ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Talablar:
              </h4>
              <ul className="space-y-2">
                {task.requirements.map((req, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-sm ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-500 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Maslahatlar */}
            {task.hints && task.hints.length > 0 && (
              <div className="mt-6">
                <h4
                  className={`font-semibold mb-3 text-sm uppercase tracking-wider ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Maslahat:
                </h4>
                <ul className="space-y-2">
                  {task.hints.map((hint, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm italic ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      💡 {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* O'ng tomon — Kod yozish */}
        <div className="flex flex-col h-full min-h-[300px] md:min-h-[400px]">
          <div className="bg-[#0d1117] rounded-t-2xl border border-slate-800 p-3 flex gap-2 items-center">
            <div className="flex gap-1.5 ml-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-4 text-xs font-mono text-slate-500">index.html</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[250px] md:min-h-[350px] w-full bg-[#161b22] text-slate-200 font-mono text-sm p-6 resize-none outline-none border-x border-b border-slate-800 rounded-b-2xl shadow-xl leading-relaxed"
            placeholder="// Kodingizni shu yerga yozing..."
          />
        </div>
      </div>

      {/* AI Tekshiruv Tugmasi va Natija */}
      <div className="mt-10 flex flex-col items-center max-w-2xl mx-auto text-center">
        {!feedback?.success && (
          <button
            onClick={handleAICheck}
            disabled={isChecking || code.trim().length === 0}
            className="group relative flex items-center gap-3 px-8 py-4 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all overflow-hidden"
          >
            {isChecking ? (
              <>
                <Loader2 className="animate-spin" size={24} /> AI kodni tahlil qilmoqda...
              </>
            ) : (
              <>
                <BrainCircuit size={24} className="group-hover:animate-pulse" /> AI orqali
                tekshirish
              </>
            )}
          </button>
        )}

        {/* AI Fikr-mulohazasi */}
        {feedback && (
          <div
            className={`mt-6 w-full p-6 rounded-2xl border flex items-center justify-between ${
              feedback.success
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                : "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800"
            } animate-slideUp`}
          >
            <div className="flex items-center gap-4 text-left">
              {feedback.success ? (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={32} />
              ) : (
                <XCircle className="text-rose-500 shrink-0" size={32} />
              )}
              <div>
                <h4
                  className={`font-bold text-lg ${
                    feedback.success
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {feedback.success ? "Mukammal natija!" : "Xatolik bor"}
                </h4>
                <p
                  className={`whitespace-pre-line text-sm ${
                    feedback.success
                      ? "text-emerald-600 dark:text-emerald-500"
                      : "text-rose-600 dark:text-rose-500"
                  }`}
                >
                  {feedback.message}
                </p>
              </div>
            </div>

            {feedback.success ? (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 transition-all shrink-0 ml-4"
              >
                Testga o'tish <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg hover:bg-rose-600 transition-all shrink-0 ml-4"
              >
                <RotateCcw size={20} /> Qayta urinish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}