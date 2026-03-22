import React, { useState, useRef, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";

// ─── Video Lesson Modal ────────────────────────────────────────────────────────
const VideoLessonModal = ({ lesson, courseColor, onClose, onComplete, darkMode }) => {
  const [watched, setWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      const pct = Math.min(Math.round((elapsed / 8) * 100), 100);
      setProgress(pct);
      if (elapsed >= 8) {
        clearInterval(timerRef.current);
        setWatched(true);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleComplete = () => {
    onComplete(lesson.id);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:800, borderRadius:18, overflow:"hidden", background:darkMode?"#1e293b":"#fff", boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
          <div>
            <p style={{ margin:0, fontWeight:700, fontSize:15, color:darkMode?"#f1f5f9":"#111" }}>{lesson.title}</p>
            <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>⏱ {lesson.duration}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#6b7280" }}>✕</button>
        </div>

        {/* Video */}
        <div style={{ position:"relative", paddingTop:"56.25%", background:"#000" }}>
          <iframe
            src={`https://www.youtube.com/embed/${lesson.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={lesson.title}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Progress + Button */}
        <div style={{ padding:"14px 20px" }}>
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, color:"#6b7280" }}>
                {watched ? "✅ Ko'rib bo'lindi" : "▶ Ko'rilmoqda..."}
              </span>
              <span style={{ fontSize:12, color:courseColor, fontWeight:700 }}>{progress}%</span>
            </div>
            <div style={{ height:4, borderRadius:2, background:darkMode?"#334155":"#e5e7eb" }}>
              <div style={{ height:"100%", borderRadius:2, background:watched?"#10b981":courseColor, width:`${progress}%`, transition:"width 0.5s ease" }}/>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button onClick={handleComplete} disabled={!watched}
              style={{ padding:"10px 24px", borderRadius:10, border:"none", background:watched?"#10b981":(darkMode?"#334155":"#e2e8f0"), color:watched?"#fff":(darkMode?"#6b7280":"#9ca3af"), fontSize:14, fontWeight:700, cursor:watched?"pointer":"default", transition:"all 0.3s" }}>
              {watched ? "✅ Darsni tugatdim" : "Videoni ko'ring..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Kurslar ma'lumotlari — har bir darsga alohida video ──────────────────────
const coursesData = {
  1: {
    id:1, category:"HTML", title:"HTML Asoslar",
    instructor:"Jasur Toshmatov", color:"#e44d26",
    thumbnail:"https://placehold.co/800x400/e44d26/ffffff?text=HTML",
    description:"Bu kursda HTML ning barcha asoslarini o'rganasiz. Teglar, atributlar, formalar, semantik HTML va zamonaviy HTML5 imkoniyatlari.",
    duration:12, rating:4.8, students:3240, price:0,
    sections:[
      { title:"Kirish", lessons:[
        { id:1,  title:"HTML nima?",              duration:"8 min",  free:true,  videoId:"qz0aGYrrlhU" },
        { id:2,  title:"Birinchi HTML sahifa",    duration:"12 min", free:true,  videoId:"UB1O30fR-EE" },
        { id:3,  title:"Asosiy teglar",           duration:"15 min", free:false, videoId:"kUMe1FH4CHE" },
      ]},
      { title:"Teglar va Atributlar", lessons:[
        { id:4,  title:"Matn teglari",            duration:"10 min", free:false, videoId:"PlxWf493en4" },
        { id:5,  title:"Havola va rasmlar",       duration:"14 min", free:false, videoId:"pQN-pnXPaVg" },
        { id:6,  title:"Jadvallar",               duration:"18 min", free:false, videoId:"hu-q2zYwEYs" },
      ]},
      { title:"Formalar", lessons:[
        { id:7,  title:"Form elementlari",        duration:"20 min", free:false, videoId:"G3e-cpL7ofc" },
        { id:8,  title:"Validatsiya",             duration:"16 min", free:false, videoId:"ysEN5RaKOlA" },
      ]},
      { title:"HTML5 Yangiliklari", lessons:[
        { id:9,  title:"Semantik teglar",         duration:"12 min", free:false, videoId:"kX3TfdUqpuU" },
        { id:10, title:"Audio va Video",          duration:"15 min", free:false, videoId:"OOy764mDfu0" },
        { id:11, title:"Canvas asoslari",         duration:"22 min", free:false, videoId:"gm1tiWcsMbI" },
        { id:12, title:"Loyiha: Portfolio sahifa",duration:"30 min", free:false, videoId:"r_hYR53r61M" },
      ]},
    ],
  },

  2: {
    id:2, category:"CSS", title:"CSS & Flexbox To'liq",
    instructor:"Nilufar Karimova", color:"#264de4",
    thumbnail:"https://placehold.co/800x400/264de4/ffffff?text=CSS",
    description:"CSS ning chuqur qatlamlarini o'rganing: Flexbox, Grid, animatsiyalar va responsive dizayn.",
    duration:18, rating:4.7, students:2890, price:49000,
    sections:[
      { title:"CSS Asoslari", lessons:[
        { id:1,  title:"CSS nima va qanday ishlaydi?", duration:"10 min", free:true,  videoId:"1Rs2ND1ryYc" },
        { id:2,  title:"Selektorlar",                  duration:"14 min", free:true,  videoId:"l1mER1bV0N0" },
        { id:3,  title:"Box Model",                    duration:"18 min", free:false, videoId:"rIO5326FgPE" },
      ]},
      { title:"Flexbox", lessons:[
        { id:4,  title:"Flex container",    duration:"16 min", free:false, videoId:"phWxA89Dy94" },
        { id:5,  title:"Flex items",        duration:"14 min", free:false, videoId:"3elGSZSWTbM" },
        { id:6,  title:"Amaliy misol",      duration:"20 min", free:false, videoId:"u044iM9xsjs" },
      ]},
      { title:"Grid Layout", lessons:[
        { id:7,  title:"Grid asoslari",     duration:"18 min", free:false, videoId:"9zBsdzdE4sM" },
        { id:8,  title:"Grid areas",        duration:"15 min", free:false, videoId:"jV8B24rSN5o" },
        { id:9,  title:"Responsive Grid",   duration:"22 min", free:false, videoId:"Tae96ze3xwY" },
      ]},
      { title:"Animatsiyalar", lessons:[
        { id:10, title:"Transition",              duration:"12 min", free:false, videoId:"YszOss4Xdpo" },
        { id:11, title:"@keyframes",              duration:"16 min", free:false, videoId:"f1WMjDx4snI" },
        { id:12, title:"Transform",               duration:"14 min", free:false, videoId:"rzD-crmF57o" },
        { id:13, title:"Loyiha: Landing Page",    duration:"35 min", free:false, videoId:"p0bGHP-PXD4" },
      ]},
    ],
  },

  3: {
    id:3, category:"JavaScript", title:"JavaScript To'liq Kurs",
    instructor:"Bobur Yusupov", color:"#d4a017",
    thumbnail:"https://placehold.co/800x400/d4a017/ffffff?text=JavaScript",
    description:"JavaScript ni noldan boshlab o'rganing: o'zgaruvchilar, funksiyalar, DOM, API va ES6+ imkoniyatlari.",
    duration:36, rating:4.9, students:5100, price:89000,
    sections:[
      { title:"Asoslar", lessons:[
        { id:1,  title:"JavaScript nima?",              duration:"10 min", free:true,  videoId:"PkZNo7MFNFg" },
        { id:2,  title:"O'zgaruvchilar: var, let, const",duration:"15 min", free:true, videoId:"W6NZfCO5SIk" },
        { id:3,  title:"Ma'lumot turlari",              duration:"18 min", free:false, videoId:"hdI2bqOjy3c" },
        { id:4,  title:"Operatorlar",                   duration:"14 min", free:false, videoId:"FZzyMA6Ca_4" },
      ]},
      { title:"Funksiyalar", lessons:[
        { id:5,  title:"Funksiyalar asoslari",    duration:"20 min", free:false, videoId:"N8ap4k_1QEQ" },
        { id:6,  title:"Arrow functions",         duration:"16 min", free:false, videoId:"h33Srr5J9nY" },
        { id:7,  title:"Callback funksiyalar",    duration:"22 min", free:false, videoId:"pTbSfCT42_M" },
      ]},
      { title:"DOM va Events", lessons:[
        { id:8,  title:"DOM nima?",               duration:"18 min", free:false, videoId:"y17RuWkWdn8" },
        { id:9,  title:"Element tanlash",         duration:"15 min", free:false, videoId:"i37KVt_IcXw" },
        { id:10, title:"Event listeners",         duration:"20 min", free:false, videoId:"XF1_MlZ5l6M" },
        { id:11, title:"DOM o'zgartirish",        duration:"18 min", free:false, videoId:"NS1ofs3Zrec" },
      ]},
      { title:"ES6+ Zamonaviy", lessons:[
        { id:12, title:"Destructuring",           duration:"16 min", free:false, videoId:"NIq3qLaHCIs" },
        { id:13, title:"Spread & Rest",           duration:"14 min", free:false, videoId:"iLx4ma8i0i8" },
        { id:14, title:"Promise va async/await",  duration:"25 min", free:false, videoId:"V_Kr9OSfDeU" },
        { id:15, title:"Fetch API",               duration:"22 min", free:false, videoId:"cuEtnrL9-H0" },
      ]},
      { title:"Loyihalar", lessons:[
        { id:16, title:"To-Do App",      duration:"30 min", free:false, videoId:"G0jO8kUrg-I" },
        { id:17, title:"Weather App",   duration:"35 min", free:false, videoId:"WZNG8UomjAg" },
        { id:18, title:"Quiz App",      duration:"28 min", free:false, videoId:"riDzcEQbX6k" },
      ]},
    ],
  },

  4: {
    id:4, category:"React", title:"React.js Zamonaviy",
    instructor:"Sardor Nazarov", color:"#0ea5e9",
    thumbnail:"https://placehold.co/800x400/0ea5e9/ffffff?text=React",
    description:"React.js ni chuqur o'rganing: komponentlar, hooks, state management, routing va real loyihalar.",
    duration:30, rating:4.9, students:4200, price:120000,
    sections:[
      { title:"React Asoslari", lessons:[
        { id:1,  title:"React nima? Virtual DOM",       duration:"12 min", free:true,  videoId:"bMknfKXIFA8" },
        { id:2,  title:"Create React App / Vite",       duration:"15 min", free:true,  videoId:"SqcY0GlETPk" },
        { id:3,  title:"JSX sintaksisi",                duration:"18 min", free:false, videoId:"7fPXI_MnBOY" },
        { id:4,  title:"Komponentlar",                  duration:"20 min", free:false, videoId:"Y2hgEGPzTZY" },
      ]},
      { title:"Props va State", lessons:[
        { id:5,  title:"Props tushunchasi",      duration:"16 min", free:false, videoId:"m7OWwFZGs_E" },
        { id:6,  title:"useState hook",          duration:"20 min", free:false, videoId:"O6P86uwfdR0" },
        { id:7,  title:"State o'zgartirish",     duration:"18 min", free:false, videoId:"4pO-HcG2igk" },
      ]},
      { title:"Hooks", lessons:[
        { id:8,  title:"useEffect",              duration:"22 min", free:false, videoId:"0ZJgIjIuY7U" },
        { id:9,  title:"useRef va useMemo",      duration:"18 min", free:false, videoId:"t2ypzz6gqm0" },
        { id:10, title:"Custom hooks",           duration:"20 min", free:false, videoId:"6ThXsUwLWvc" },
      ]},
      { title:"React Router", lessons:[
        { id:11, title:"Routing asoslari",       duration:"18 min", free:false, videoId:"aZGzwEjZrXc" },
        { id:12, title:"Dynamic routes",         duration:"16 min", free:false, videoId:"Law7wfdg_ls" },
        { id:13, title:"Protected routes",       duration:"20 min", free:false, videoId:"X8eAbu1RWZ4" },
      ]},
      { title:"Loyihalar", lessons:[
        { id:14, title:"Todo App",               duration:"25 min", free:false, videoId:"pCA4qpQDZD8" },
        { id:15, title:"E-commerce UI",          duration:"40 min", free:false, videoId:"y66RgYMAgSo" },
        { id:16, title:"Dashboard",              duration:"35 min", free:false, videoId:"XtMThy8QKqU" },
      ]},
    ],
  },

  5: {
    id:5, category:"English", title:"Ingliz Tili A1→B2",
    instructor:"Malika Ergasheva", color:"#003580",
    thumbnail:"https://placehold.co/800x400/003580/ffffff?text=English",
    description:"Ingliz tilini noldan boshlang — grammatika, lug'at, so'zlashuv va IELTS tayyorgarligi.",
    duration:60, rating:4.6, students:8900, price:75000,
    sections:[
      { title:"A1 — Boshlang'ich", lessons:[
        { id:1,  title:"Salomlashish va tanishish", duration:"15 min", free:true,  videoId:"3IqtmUscE_U" },
        { id:2,  title:"Sonlar va alifbo",          duration:"12 min", free:true,  videoId:"vnt2mBqBnAc" },
        { id:3,  title:"To be fe'li",               duration:"18 min", free:false, videoId:"b1qsWGCPTJA" },
        { id:4,  title:"Uy-joy va oila",            duration:"20 min", free:false, videoId:"WqFbE0P8iBU" },
      ]},
      { title:"A2 — Asosiy", lessons:[
        { id:5,  title:"Simple Present",     duration:"22 min", free:false, videoId:"UgK6S3iy_K0" },
        { id:6,  title:"Simple Past",        duration:"20 min", free:false, videoId:"S7bPiXjlj60" },
        { id:7,  title:"Kundalik suhbat",    duration:"18 min", free:false, videoId:"J5-JEnvfgMQ" },
        { id:8,  title:"Oziq-ovqat va xarid",duration:"16 min", free:false, videoId:"cg62_KPID3s" },
      ]},
      { title:"B1 — O'rta", lessons:[
        { id:9,  title:"Present Perfect",        duration:"24 min", free:false, videoId:"hMoAYFIYPGQ" },
        { id:10, title:"Modal fe'llar",           duration:"20 min", free:false, videoId:"DFIuZYODZqs" },
        { id:11, title:"Conditional sentences",   duration:"22 min", free:false, videoId:"if3vYAgaGOo" },
        { id:12, title:"Ish va kasb suhbati",     duration:"25 min", free:false, videoId:"HG68Ymazo18" },
      ]},
      { title:"B2 — Yuqori O'rta", lessons:[
        { id:13, title:"Passive voice",        duration:"20 min", free:false, videoId:"fftVGPPxqHg" },
        { id:14, title:"Advanced vocabulary",  duration:"22 min", free:false, videoId:"5MgBikgcWnY" },
        { id:15, title:"IELTS Writing",        duration:"30 min", free:false, videoId:"jShKfPwDMDk" },
        { id:16, title:"IELTS Speaking",       duration:"28 min", free:false, videoId:"KywMN-EtNiI" },
      ]},
    ],
  },

  6: {
    id:6, category:"Russian", title:"Rus Tili Asosiy Kurs",
    instructor:"Alisher Hamidov", color:"#c0392b",
    thumbnail:"https://placehold.co/800x400/c0392b/ffffff?text=Русский",
    description:"Rus tilini noldan o'rganing: alifbo, grammatika, kundalik suhbat va biznes rus tili.",
    duration:45, rating:4.5, students:4500, price:65000,
    sections:[
      { title:"Kirish", lessons:[
        { id:1,  title:"Rus alifbosi — kirill",    duration:"20 min", free:true,  videoId:"ex7XbNaEdAk" },
        { id:2,  title:"Talaffuz qoidalari",       duration:"18 min", free:true,  videoId:"PyKFfNLTbMM" },
        { id:3,  title:"Salomlashish iboralari",   duration:"15 min", free:false, videoId:"9PzHiDrJIiw" },
      ]},
      { title:"Asosiy Grammatika", lessons:[
        { id:4,  title:"Ot va sifatlar",           duration:"22 min", free:false, videoId:"rXUgFXL0-No" },
        { id:5,  title:"Падежlar (6 ta)",          duration:"30 min", free:false, videoId:"Cv5Vu2GPKZE" },
        { id:6,  title:"Fe'llar va zamonlar",      duration:"25 min", free:false, videoId:"w2X7-a10B4c" },
        { id:7,  title:"Son va sanoq",             duration:"18 min", free:false, videoId:"0xvjN0BNTVE" },
      ]},
      { title:"Suhbat", lessons:[
        { id:8,  title:"Tanishish va o'zini taqdim etish", duration:"20 min", free:false, videoId:"KPwCsNIUAKM" },
        { id:9,  title:"Yo'l so'rash va tushuntirish",     duration:"18 min", free:false, videoId:"FbTs7ckVEYE" },
        { id:10, title:"Do'kon va bozorda",                 duration:"16 min", free:false, videoId:"9nGCb8JQKNE" },
        { id:11, title:"Mehmonxona va restoran",            duration:"20 min", free:false, videoId:"pXIuiPDgH4A" },
      ]},
      { title:"Biznes Rus Tili", lessons:[
        { id:12, title:"Ish muloqoti",         duration:"25 min", free:false, videoId:"SZ2lFa4EFxE" },
        { id:13, title:"Pochta va hujjatlar",  duration:"22 min", free:false, videoId:"UGPGAn4qyrU" },
        { id:14, title:"TORFL tayyorgarligi",  duration:"30 min", free:false, videoId:"3Vp3BsIE3sA" },
      ]},
    ],
  },

  7: {
    id:7, category:"French", title:"Fransuz Tili Kursi",
    instructor:"Dilorom Saidova", color:"#002395",
    thumbnail:"https://placehold.co/800x400/002395/ffffff?text=Français",
    description:"Fransuz tilini asosdan o'rganing — talaffuz, grammatika, suhbat va madaniyat.",
    duration:40, rating:4.4, students:2100, price:70000,
    sections:[
      { title:"Asoslar", lessons:[
        { id:1,  title:"Fransuz alifbosi va talaffuz", duration:"18 min", free:true,  videoId:"KN_2RMkVGXA" },
        { id:2,  title:"Salomlashish — Bonjour!",      duration:"14 min", free:true,  videoId:"x8pEAfKJp8M" },
        { id:3,  title:"Sonlar 1-100",                 duration:"16 min", free:false, videoId:"l7M_Jzh9mME" },
        { id:4,  title:"Ranglar va o'lchamlar",        duration:"14 min", free:false, videoId:"bBdH0GNqW3o" },
      ]},
      { title:"Grammatika", lessons:[
        { id:5,  title:"Artikl: le, la, les, un, une", duration:"20 min", free:false, videoId:"VVcibWkGnks" },
        { id:6,  title:"Être va Avoir fe'llari",        duration:"22 min", free:false, videoId:"dxpMc1H06Rw" },
        { id:7,  title:"Présent tense",                 duration:"20 min", free:false, videoId:"bFjFwlxTMPo" },
        { id:8,  title:"Sifatlar kelishigi",            duration:"18 min", free:false, videoId:"MYVR2xzLVlw" },
      ]},
      { title:"Suhbat", lessons:[
        { id:9,  title:"O'zini taqdim etish",          duration:"18 min", free:false, videoId:"Lxs6PpBo6QA" },
        { id:10, title:"Parijda yo'l so'rash",         duration:"16 min", free:false, videoId:"5gQF6IfRBgM" },
        { id:11, title:"Restoranda buyurtma berish",   duration:"18 min", free:false, videoId:"RLvKC9RMGFU" },
      ]},
      { title:"Fransuz Madaniyati", lessons:[
        { id:12, title:"Fransiya tarixi va madaniyati", duration:"20 min", free:false, videoId:"I_4NokttBYo" },
        { id:13, title:"Fransuz oshxonasi",             duration:"16 min", free:false, videoId:"kVRczHpoa2A" },
        { id:14, title:"Imtihon tayyorgarligi",         duration:"30 min", free:false, videoId:"G0-EvQWVb1Y" },
      ]},
    ],
  },

  8: {
    id:8, category:"HTML", title:"HTML5 & Semantik Teglar",
    instructor:"Kamol Rashidov", color:"#e44d26",
    thumbnail:"https://placehold.co/800x400/e44d26/ffffff?text=HTML5",
    description:"HTML5 ning yangi imkoniyatlari: semantik teglar, multimedia, Canvas va zamonaviy web standartlari.",
    duration:8, rating:4.3, students:1800, price:35000,
    sections:[
      { title:"HTML5 Yangiliklari", lessons:[
        { id:1,  title:"HTML5 nima yangi?",                       duration:"12 min", free:true,  videoId:"UB1O30fR-EE" },
        { id:2,  title:"Doctype va meta teglar",                   duration:"10 min", free:true,  videoId:"D-h8L5hgW-w" },
        { id:3,  title:"Semantik teglar: header, main, footer",   duration:"15 min", free:false, videoId:"kX3TfdUqpuU" },
      ]},
      { title:"Semantik Tuzilma", lessons:[
        { id:4,  title:"nav, article, section, aside", duration:"18 min", free:false, videoId:"OOy764mDfu0" },
        { id:5,  title:"figure va figcaption",         duration:"12 min", free:false, videoId:"gm1tiWcsMbI" },
        { id:6,  title:"SEO uchun semantika",          duration:"16 min", free:false, videoId:"r_hYR53r61M" },
      ]},
      { title:"Multimedia", lessons:[
        { id:7,  title:"Video tegi",     duration:"14 min", free:false, videoId:"PlxWf493en4" },
        { id:8,  title:"Audio tegi",     duration:"12 min", free:false, videoId:"pQN-pnXPaVg" },
        { id:9,  title:"Canvas asoslari",duration:"20 min", free:false, videoId:"hu-q2zYwEYs" },
        { id:10, title:"SVG grafikalar", duration:"18 min", free:false, videoId:"G3e-cpL7ofc" },
      ]},
    ],
  },
};

// ─── Reviews ───────────────────────────────────────────────────────────────────
const Stars = ({ rating, interactive=false, onChange }) => (
  <div style={{ display:"flex", gap:3 }}>
    {[1,2,3,4,5].map(s=>(
      <span key={s} onClick={()=>interactive&&onChange&&onChange(s)}
        style={{ fontSize:interactive?24:14, color:s<=rating?"#f59e0b":"#d1d5db", cursor:interactive?"pointer":"default" }}>★</span>
    ))}
  </div>
);

const Reviews = ({ darkMode }) => {
  const reviews = [
    { name:"Aziz T.",   rating:5, date:"2 kun oldin",  text:"Juda yaxshi kurs! Hamma narsa tushunarli tushuntirilgan." },
    { name:"Kamola R.", rating:4, date:"1 hafta oldin", text:"Kurs materiallari sifatli, amaliy mashqlar juda foydali bo'ldi." },
    { name:"Sherzod M.",rating:5, date:"2 hafta oldin", text:"O'qituvchi juda yaxshi tushuntiradi. Loyiha qismi ayniqsa foydali." },
  ];
  const [allReviews, setAllReviews] = useState(reviews);
  const [newReview, setNewReview]   = useState({ rating:5, text:"" });
  const [submitted, setSubmitted]   = useState(false);
  const avg = (allReviews.reduce((a,r)=>a+r.rating,0)/allReviews.length).toFixed(1);

  const handleSubmit = () => {
    if (!newReview.text.trim()) return;
    setAllReviews([{ name:"Siz", rating:newReview.rating, date:"Hozirgina", text:newReview.text }, ...allReviews]);
    setSubmitted(true);
    setNewReview({ rating:5, text:"" });
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20, padding:"16px 20px", background:darkMode?"#1e293b":"#f8fafc", borderRadius:12, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:40, fontWeight:800, color:"#f59e0b" }}>{avg}</div>
          <Stars rating={Math.round(avg)} />
          <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>{allReviews.length} ta sharh</div>
        </div>
        <div style={{ flex:1 }}>
          {[5,4,3,2,1].map(star=>{
            const cnt = allReviews.filter(r=>r.rating===star).length;
            const pct = Math.round((cnt/allReviews.length)*100);
            return (
              <div key={star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:12, color:"#6b7280", width:16 }}>{star}</span>
                <span style={{ fontSize:12, color:"#f59e0b" }}>★</span>
                <div style={{ flex:1, height:6, borderRadius:3, background:darkMode?"#334155":"#e5e7eb" }}>
                  <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:"#f59e0b" }}/>
                </div>
                <span style={{ fontSize:12, color:"#6b7280", width:28 }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {!submitted ? (
        <div style={{ marginBottom:20, padding:"16px 20px", background:darkMode?"#1e293b":"#fff", borderRadius:12, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
          <p style={{ margin:"0 0 10px", fontWeight:600, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>Sharh yozing</p>
          <Stars rating={newReview.rating} interactive onChange={r=>setNewReview({...newReview, rating:r})} />
          <textarea rows={3} placeholder="Kurs haqida fikringiz..." value={newReview.text}
            onChange={e=>setNewReview({...newReview, text:e.target.value})}
            style={{ width:"100%", marginTop:10, padding:"10px 12px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:13, resize:"none", outline:"none", boxSizing:"border-box" }}/>
          <button onClick={handleSubmit} style={{ marginTop:8, padding:"8px 20px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>Yuborish</button>
        </div>
      ) : (
        <div style={{ marginBottom:20, padding:"12px 16px", background:"#d1fae5", borderRadius:10, fontSize:13, color:"#065f46", fontWeight:600 }}>✅ Sharhingiz qabul qilindi!</div>
      )}

      {allReviews.map((r,i)=>(
        <div key={i} style={{ marginBottom:14, padding:"14px 16px", background:darkMode?"#1e293b":"#fff", borderRadius:12, border:`1px solid ${darkMode?"#334155":"#f3f4f6"}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#3b82f6", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13 }}>{r.name[0]}</div>
            <div>
              <p style={{ margin:0, fontWeight:600, fontSize:13, color:darkMode?"#f1f5f9":"#111" }}>{r.name}</p>
              <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{r.date}</p>
            </div>
            <div style={{ marginLeft:"auto" }}><Stars rating={r.rating}/></div>
          </div>
          <p style={{ margin:0, fontSize:13, color:darkMode?"#94a3b8":"#4b5563", lineHeight:1.6 }}>{r.text}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Payment Modal ─────────────────────────────────────────────────────────────
const PaymentModal = ({ course, onClose, onSuccess, darkMode }) => {
  const { t } = useLang();
  const [step, setStep]       = useState(1);
  const [method, setMethod]   = useState("card");
  const [cardNum, setCardNum] = useState("");
  const [loading, setLoading] = useState(false);
  const formatCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const handlePay = () => {
    if (cardNum.replace(/\s/g,"").length < 16) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setStep(3); }, 2000);
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:420, borderRadius:18, overflow:"hidden", background:darkMode?"#1e293b":"#fff", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
          <p style={{ margin:0, fontWeight:700, fontSize:15, color:darkMode?"#f1f5f9":"#111" }}>{step===3?`✅ ${t.paymentSuccess}`:`💳 ${t.paymentTitle}`}</p>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#6b7280" }}>✕</button>
        </div>
        <div style={{ padding:"20px" }}>
          {step===1 && (
            <>
              <div style={{ padding:"12px 14px", borderRadius:10, marginBottom:18, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                <p style={{ margin:"0 0 4px", fontWeight:600, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{course.title}</p>
                <p style={{ margin:"8px 0 0", fontWeight:800, fontSize:20, color:"#3b82f6" }}>{course.price.toLocaleString()} so'm</p>
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:18 }}>
                {[{id:"card",label:"💳 Karta"},{id:"payme",label:"🟢 Payme"},{id:"click",label:"🔵 Click"}].map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)} style={{ flex:1, padding:"9px 0", borderRadius:8, border:`2px solid ${method===m.id?"#3b82f6":darkMode?"#334155":"#e5e7eb"}`, background:method===m.id?(darkMode?"#1e3a5f":"#eff6ff"):"transparent", color:method===m.id?"#3b82f6":darkMode?"#94a3b8":"#374151", fontSize:12, fontWeight:600, cursor:"pointer" }}>{m.label}</button>
                ))}
              </div>
              <button onClick={()=>setStep(2)} style={{ width:"100%", padding:"12px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>Davom etish →</button>
            </>
          )}
          {step===2 && (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                <input placeholder="0000 0000 0000 0000" value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))}
                  style={{ padding:"11px 14px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:16, letterSpacing:"0.1em", outline:"none" }}/>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="MM/YY" style={{ flex:1, padding:"11px 14px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:14, outline:"none" }}/>
                  <input placeholder="CVV" maxLength={3} style={{ width:80, padding:"11px 14px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:14, outline:"none" }}/>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderRadius:8, marginBottom:14, background:darkMode?"#0f172a":"#f8fafc" }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Jami:</span>
                <span style={{ fontSize:14, fontWeight:800, color:"#3b82f6" }}>{course.price.toLocaleString()} so'm</span>
              </div>
              <button onClick={handlePay} disabled={loading} style={{ width:"100%", padding:"12px 0", background:loading?"#93c5fd":"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?"default":"pointer" }}>
                {loading?"⏳ Tekshirilmoqda...":`💳 ${course.price.toLocaleString()} so'm To'lash`}
              </button>
            </>
          )}
          {step===3 && (
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
              <p style={{ fontWeight:700, fontSize:16, color:darkMode?"#f1f5f9":"#111", margin:"0 0 6px" }}>Tabriklaymiz!</p>
              <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 20px" }}>"{course.title}" kursiga muvaffaqiyatli yozildingiz!</p>
              <button onClick={()=>{ onSuccess(); onClose(); }} style={{ padding:"11px 28px", background:"#10b981", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>O'qishni boshlash →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const FaqItem = ({ faq, darkMode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:8 }}>
      <button onClick={()=>setOpen(!open)} style={{ width:"100%", textAlign:"left", padding:"13px 16px", borderRadius:open?"10px 10px 0 0":10, background:darkMode?"#1e293b":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, cursor:"pointer", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontWeight:600, fontSize:13, color:darkMode?"#f1f5f9":"#111" }}>{faq.q}</span>
        <span style={{ color:"#6b7280", fontSize:16 }}>{open?"−":"+"}</span>
      </button>
      {open && <div style={{ padding:"12px 16px", background:darkMode?"#0f172a":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderTop:"none", borderRadius:"0 0 10px 10px", fontSize:13, color:darkMode?"#94a3b8":"#4b5563", lineHeight:1.7 }}>{faq.a}</div>}
    </div>
  );
};

// ─── Main CourseDetail ─────────────────────────────────────────────────────────
const CourseDetail = ({ courseId, onBack, darkMode, showToast }) => {
  const { t } = useLang();
  const course = coursesData[courseId] || coursesData[1];
  const [activeTab, setActiveTab]       = useState("lessons");
  const [openSections, setOpenSections] = useState([0]);
  const [purchased, setPurchased]       = useState(course.price === 0);
  const [completedLessons, setCompletedLessons] = useState(course.price === 0 ? [1,2] : []);
  const [showPayment, setShowPayment]   = useState(false);
  const [playingLesson, setPlayingLesson] = useState(null);

  const totalLessons = course.sections.reduce((a,s)=>a+s.lessons.length, 0);
  const progress     = Math.round((completedLessons.length / totalLessons) * 100);
  const toggleSection = (i) => setOpenSections(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  const markComplete  = (id) => { if (!completedLessons.includes(id)) setCompletedLessons(prev=>[...prev, id]); };

  const faqs = [
    { q:"Kursga qancha vaqt kirish mumkin?",    a:"Sotib olgandan so'ng umrbod kirish imkoniyatiga ega bo'lasiz." },
    { q:"Sertifikat beriladimi?",                a:"Ha, kursni 100% tugatgandan so'ng sertifikat yuklab olishingiz mumkin." },
    { q:"Qaytarish mumkinmi?",                   a:"30 kun ichida so'rasangiz, to'lovni qaytarib beramiz." },
    { q:"Mobil qurilmada o'qish mumkinmi?",      a:"Ha, barcha qurilmalarda ishlaydi." },
    { q:"O'qituvchi bilan bog'lanish mumkinmi?", a:"Ha, har bir dars ostidagi izoh bo'limida savol berishingiz mumkin." },
  ];

  return (
    <div style={{ width:"100%", maxWidth:900, margin:"0 auto", padding:"32px 20px 80px" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", color:"#3b82f6", fontSize:14, fontWeight:600, marginBottom:20, padding:0 }}>
        {t.backToCatalog}
      </button>

      <ScrollReveal direction="up">
        <div style={{ borderRadius:16, overflow:"hidden", marginBottom:24, position:"relative" }}>
          <img src={course.thumbnail} alt={course.title} style={{ width:"100%", height:260, objectFit:"cover", display:"block" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent, rgba(0,0,0,0.7))", padding:"32px 24px 20px" }}>
            <span style={{ background:course.color, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{course.category}</span>
            <h1 style={{ color:"#fff", fontWeight:800, fontSize:24, margin:"8px 0 4px" }}>{course.title}</h1>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, margin:0 }}>⭐ {course.rating} · 👥 {course.students.toLocaleString()} talaba · ⏱ {course.duration} soat</p>
          </div>
        </div>
      </ScrollReveal>

      <div style={{ display:"flex", flexWrap:"wrap", gap:20 }}>
        {/* Left */}
        <div style={{ flex:"1 1 520px" }}>
          {purchased && (
            <ScrollReveal direction="up">
              <div style={{ marginBottom:20, padding:"16px 20px", background:darkMode?"#1e293b":"#fff", borderRadius:12, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:darkMode?"#f1f5f9":"#111" }}>{t.progressLabel}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:"#3b82f6" }}>{progress}%</span>
                </div>
                <div style={{ height:8, borderRadius:4, background:darkMode?"#334155":"#e5e7eb" }}>
                  <div style={{ height:"100%", borderRadius:4, background:progress===100?"#10b981":"#3b82f6", width:`${progress}%`, transition:"width 0.4s ease" }}/>
                </div>
                <p style={{ margin:"8px 0 0", fontSize:12, color:"#6b7280" }}>
                  {completedLessons.length} / {totalLessons} {t.lessonsCount} {t.completedLabel}
                  {progress===100 ? " 🎉 — Kurs tugatildi!" : ""}
                </p>
                {progress===100 && (
                  <button style={{ marginTop:10, padding:"8px 18px", background:"#10b981", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                    {t.certificateBtn}
                  </button>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
            {[{id:"lessons",label:t.lessonsTab},{id:"reviews",label:t.reviewsTab},{id:"faq",label:t.faqTab}].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600, color:activeTab===tab.id?"#3b82f6":"#6b7280", borderBottom:`2px solid ${activeTab===tab.id?"#3b82f6":"transparent"}`, marginBottom:-1 }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lessons */}
          {activeTab==="lessons" && (
            <div>
              <p style={{ margin:"0 0 14px", fontSize:13, color:"#6b7280" }}>
                {course.sections.length} {t.sectionsCount} · {totalLessons} {t.lessonsCount}
              </p>
              {course.sections.map((section, si)=>(
                <div key={si} style={{ marginBottom:8 }}>
                  <button onClick={()=>toggleSection(si)}
                    style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderRadius:10, background:darkMode?"#1e293b":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, cursor:"pointer", textAlign:"left" }}>
                    <span style={{ fontWeight:600, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>
                      {openSections.includes(si)?"▾":"▸"} {section.title}
                    </span>
                    <span style={{ fontSize:12, color:"#6b7280" }}>{section.lessons.length} {t.lessonsCount}</span>
                  </button>
                  {openSections.includes(si) && (
                    <div style={{ borderRadius:"0 0 10px 10px", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderTop:"none", overflow:"hidden" }}>
                      {section.lessons.map(lesson=>{
                        const done   = completedLessons.includes(lesson.id);
                        const locked = !purchased && !lesson.free;
                        return (
                          <div key={lesson.id}
                            onClick={()=>{ if(!locked) setPlayingLesson(lesson); else setShowPayment(true); }}
                            style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", background:done?(darkMode?"#0f2818":"#f0fdf4"):(darkMode?"#0f172a":"#fff"), borderBottom:`1px solid ${darkMode?"#1e293b":"#f3f4f6"}`, cursor:locked?"not-allowed":"pointer", opacity:locked?0.6:1, transition:"background 0.15s" }}
                            onMouseEnter={e=>{ if(!locked) e.currentTarget.style.background=darkMode?"#1e293b":"#f8fafc"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.background=done?(darkMode?"#0f2818":"#f0fdf4"):(darkMode?"#0f172a":"#fff"); }}
                          >
                            <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${done?"#10b981":locked?"#9ca3af":"#3b82f6"}`, background:done?"#10b981":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:done?"#fff":locked?"#9ca3af":"#3b82f6", flexShrink:0 }}>
                              {done ? "✓" : locked ? "🔒" : "▶"}
                            </div>
                            <div style={{ flex:1 }}>
                              <span style={{ fontSize:13, color:darkMode?"#e2e8f0":"#374151" }}>{lesson.title}</span>
                              {lesson.free&&!purchased&&<span style={{ marginLeft:6, fontSize:10, fontWeight:700, background:"#d1fae5", color:"#065f46", padding:"1px 6px", borderRadius:4 }}>{t.freeLesson}</span>}
                              {done&&<span style={{ marginLeft:6, fontSize:10, fontWeight:700, background:"#d1fae5", color:"#065f46", padding:"1px 6px", borderRadius:4 }}>✓ {t.completedLabel}</span>}
                            </div>
                            <span style={{ fontSize:12, color:"#9ca3af" }}>{lesson.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab==="reviews" && <Reviews darkMode={darkMode}/>}

          {activeTab==="faq" && (
            <div>
              {faqs.map((faq,i)=><FaqItem key={i} faq={faq} darkMode={darkMode}/>)}
            </div>
          )}
        </div>

        {/* Right — CTA */}
        <div style={{ width:260, flexShrink:0 }}>
          <div style={{ position:"sticky", top:84, background:darkMode?"#1e293b":"#fff", borderRadius:16, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, padding:"20px", boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
            <p style={{ margin:"0 0 4px", fontSize:24, fontWeight:800, color:purchased?"#10b981":"#3b82f6" }}>
              {course.price===0 ? t.freeLabel : course.price.toLocaleString()+" "+t.priceLabel}
            </p>
            {!purchased&&course.price>0&&<p style={{ margin:"0 0 14px", fontSize:11, color:"#6b7280" }}>{t.oneTimePayment}</p>}
            {purchased ? (
              <div style={{ padding:"10px 14px", borderRadius:10, marginBottom:14, background:"#d1fae5", textAlign:"center" }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#065f46" }}>{t.enrolledLabel}</p>
                <p style={{ margin:"4px 0 0", fontSize:12, color:"#065f46" }}>Progress: {progress}%</p>
              </div>
            ) : (
              <button onClick={()=>course.price===0?setPurchased(true):setShowPayment(true)}
                style={{ width:"100%", padding:"13px 0", marginBottom:10, background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {course.price===0 ? t.startFreeBtn : t.buyBtn}
              </button>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                {icon:"⏱", text:`${course.duration} ${t.videoHours}`},
                {icon:"📱", text:t.mobileAccess},
                {icon:"♾️", text:t.lifeTimeAccess},
                {icon:"🏆", text:t.certificate},
                {icon:"🔄", text:t.moneyBack},
              ].map((item,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  <span style={{ fontSize:12, color:darkMode?"#94a3b8":"#6b7280" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {playingLesson && (
        <VideoLessonModal
          lesson={playingLesson}
          courseColor={course.color}
          onClose={()=>setPlayingLesson(null)}
          onComplete={markComplete}
          darkMode={darkMode}
        />
      )}

      {showPayment && (
        <PaymentModal
          course={course}
          onClose={()=>setShowPayment(false)}
          onSuccess={()=>{ setPurchased(true); showToast&&showToast(t.enrolledSuccess+" 🎉","success"); }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default CourseDetail;