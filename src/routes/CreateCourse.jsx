import React, { useState } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/useAuth";

const CATEGORIES = ["HTML","CSS","JavaScript","React","Vue","Angular","Python","English","Russian","French","Design","Other"];
const LEVELS     = ["Boshlang'ich","O'rta","Yuqori","Barcha daraja"];

const CreateCourse = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Info | 2: Sections | 3: Preview
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState({
    title: "", category: "HTML", level: "Boshlang'ich",
    description: "", price: "", language: "O'zbek", thumbnail: "",
  });

  const [sections, setSections] = useState([
    { title: "Kirish", lessons: [{ title: "", duration: "10 min", free: true }] },
  ]);

  const inputStyle = (err) => ({
    width: "100%", padding:"10px 14px", borderRadius:10,
    border: `1px solid ${err?"#ef4444":(darkMode?"#334155":"#e5e7eb")}`,
    background: darkMode?"#0f172a":"#f8fafc",
    color: darkMode?"#f1f5f9":"#111", fontSize:14, outline:"none", boxSizing:"border-box",
  });

  const label = (text, required) => (
    <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:5 }}>
      {text}{required && <span style={{ color:"#ef4444" }}> *</span>}
    </label>
  );

  // Section handlers
  const addSection = () => setSections([...sections, { title: "", lessons: [{ title: "", duration: "10 min", free: false }] }]);
  const removeSection = (si) => setSections(sections.filter((_, i) => i !== si));
  const updateSection = (si, key, val) => setSections(sections.map((s, i) => i === si ? { ...s, [key]: val } : s));
  const addLesson = (si) => setSections(sections.map((s, i) => i === si ? { ...s, lessons: [...s.lessons, { title:"", duration:"10 min", free:false }] } : s));
  const removeLesson = (si, li) => setSections(sections.map((s, i) => i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s));
  const updateLesson = (si, li, key, val) => setSections(sections.map((s, i) => i === si ? { ...s, lessons: s.lessons.map((l, j) => j === li ? { ...l, [key]: val } : l) } : s));

  const totalLessons = sections.reduce((a, s) => a + s.lessons.length, 0);

  const validate1 = () => {
    if (!info.title.trim()) { showToast && showToast("Kurs nomi kiritilmadi!", "error"); return false; }
    if (!info.description.trim()) { showToast && showToast("Tavsif kiritilmadi!", "error"); return false; }
    return true;
  };

  const validate2 = () => {
    for (let s of sections) {
      if (!s.title.trim()) { showToast && showToast("Bo'lim nomi kiritilmadi!", "error"); return false; }
      for (let l of s.lessons) {
        if (!l.title.trim()) { showToast && showToast("Dars nomi kiritilmadi!", "error"); return false; }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "courses_pending"), {
        ...info,
        price: Number(info.price) || 0,
        sections,
        totalLessons,
        instructorId:   user.uid,
        instructorName: user.displayName || user.email,
        status:         "pending", // admin tasdiqlanishini kutadi
        rating:         0,
        students:       0,
        createdAt:      serverTimestamp(),
      });
      showToast && showToast("Kurs admin tekshiruviga yuborildi! ✅", "success");
      setStep(1);
      setInfo({ title:"", category:"HTML", level:"Boshlang'ich", description:"", price:"", language:"O'zbek", thumbnail:"" });
      setSections([{ title:"Kirish", lessons:[{ title:"", duration:"10 min", free:true }] }]);
    } catch {
      showToast && showToast("Saqlashda xatolik!", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width:"100%", maxWidth:760, margin:"0 auto", padding:"40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #bfdbfe" }}>
          📝 O'qituvchi
        </span>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:darkMode?"#f1f5f9":"#111" }}>Kurs Yaratish</h2>
        <p style={{ color:"#6b7280", fontSize:14, marginBottom:28 }}>Kurs ma'lumotlarini to'ldiring va admin tasdiqlashiga yuboring</p>

        {/* Progress steps */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
          {[{n:1,label:"Asosiy ma'lumot"},{n:2,label:"Bo'limlar"},{n:3,label:"Ko'rib chiqish"}].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:step>=s.n?"#3b82f6":(darkMode?"#334155":"#e5e7eb"), color:step>=s.n?"#fff":(darkMode?"#6b7280":"#9ca3af"), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, transition:"all 0.3s" }}>
                  {step>s.n ? "✓" : s.n}
                </div>
                <span style={{ fontSize:11, color:step>=s.n?"#3b82f6":(darkMode?"#6b7280":"#9ca3af"), fontWeight:600, whiteSpace:"nowrap" }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:2, background:step>s.n?"#3b82f6":(darkMode?"#334155":"#e5e7eb"), margin:"0 8px", marginBottom:22, transition:"all 0.3s" }}/>}
            </React.Fragment>
          ))}
        </div>
      </ScrollReveal>

      {/* Step 1: Info */}
      {step === 1 && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              {label("Kurs nomi", true)}
              <input value={info.title} onChange={(e)=>setInfo({...info,title:e.target.value})} placeholder="Masalan: React.js Zamonaviy Kurs" style={inputStyle(!info.title)}/>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:140 }}>
                {label("Kategoriya", true)}
                <select value={info.category} onChange={(e)=>setInfo({...info,category:e.target.value})} style={inputStyle()}>
                  {CATEGORIES.map((c)=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:1, minWidth:140 }}>
                {label("Daraja", true)}
                <select value={info.level} onChange={(e)=>setInfo({...info,level:e.target.value})} style={inputStyle()}>
                  {LEVELS.map((l)=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex:1, minWidth:140 }}>
                {label("Til")}
                <select value={info.language} onChange={(e)=>setInfo({...info,language:e.target.value})} style={inputStyle()}>
                  {["O'zbek","Русский","English"].map((l)=><option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              {label("Tavsif", true)}
              <textarea value={info.description} onChange={(e)=>setInfo({...info,description:e.target.value})} placeholder="Kurs haqida batafsil ma'lumot..." rows={4} style={{ ...inputStyle(!info.description), resize:"none" }}/>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ flex:1 }}>
                {label("Narx (so'm, 0 = bepul)")}
                <input type="number" value={info.price} onChange={(e)=>setInfo({...info,price:e.target.value})} placeholder="0" style={inputStyle()}/>
              </div>
              <div style={{ flex:1 }}>
                {label("Thumbnail URL (ixtiyoriy)")}
                <input value={info.thumbnail} onChange={(e)=>setInfo({...info,thumbnail:e.target.value})} placeholder="https://..." style={inputStyle()}/>
              </div>
            </div>
            <button onClick={()=>validate1()&&setStep(2)} style={{ padding:"12px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", marginTop:4 }}>
              Keyingisi: Bo'limlar →
            </button>
          </div>
        </ScrollReveal>
      )}

      {/* Step 2: Sections */}
      {step === 2 && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {sections.map((section, si) => (
              <div key={si} style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:14, overflow:"hidden" }}>
                {/* Section header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:darkMode?"#0f172a":"#f8fafc", borderBottom:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                  <input value={section.title} onChange={(e)=>updateSection(si,"title",e.target.value)} placeholder={`Bo'lim ${si+1} nomi`}
                    style={{ flex:1, padding:"8px 12px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#1e293b":"#fff", color:darkMode?"#f1f5f9":"#111", fontSize:13, outline:"none" }}/>
                  {sections.length > 1 && (
                    <button onClick={()=>removeSection(si)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:16 }}>🗑️</button>
                  )}
                </div>

                {/* Lessons */}
                <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                  {section.lessons.map((lesson, li) => (
                    <div key={li} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"#6b7280", minWidth:20 }}>{li+1}.</span>
                      <input value={lesson.title} onChange={(e)=>updateLesson(si,li,"title",e.target.value)} placeholder="Dars nomi"
                        style={{ flex:1, padding:"7px 10px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:12, outline:"none" }}/>
                      <select value={lesson.duration} onChange={(e)=>updateLesson(si,li,"duration",e.target.value)}
                        style={{ padding:"7px 8px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:11, outline:"none" }}>
                        {["5 min","10 min","15 min","20 min","25 min","30 min","45 min","60 min"].map((d)=><option key={d}>{d}</option>)}
                      </select>
                      <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#6b7280", whiteSpace:"nowrap", cursor:"pointer" }}>
                        <input type="checkbox" checked={lesson.free} onChange={(e)=>updateLesson(si,li,"free",e.target.checked)} style={{ cursor:"pointer" }}/>
                        Bepul
                      </label>
                      {section.lessons.length > 1 && (
                        <button onClick={()=>removeLesson(si,li)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:13, padding:"0 4px" }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={()=>addLesson(si)} style={{ alignSelf:"flex-start", padding:"6px 12px", borderRadius:8, border:`1px dashed ${darkMode?"#334155":"#d1d5db"}`, background:"transparent", color:"#6b7280", fontSize:12, cursor:"pointer", marginTop:4 }}>
                    + Dars qo'shish
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addSection} style={{ padding:"11px 0", borderRadius:12, border:`2px dashed ${darkMode?"#334155":"#d1d5db"}`, background:"transparent", color:darkMode?"#94a3b8":"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              + Bo'lim qo'shish
            </button>

            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button onClick={()=>setStep(1)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:"transparent", color:darkMode?"#94a3b8":"#374151", fontSize:14, fontWeight:600, cursor:"pointer" }}>← Orqaga</button>
              <button onClick={()=>validate2()&&setStep(3)} style={{ flex:2, padding:"12px 0", borderRadius:10, background:"#3b82f6", color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:"pointer" }}>Ko'rib chiqish →</button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:16, padding:"24px", marginBottom:14 }}>
            <h3 style={{ margin:"0 0 16px", fontWeight:700, fontSize:16, color:darkMode?"#f1f5f9":"#111" }}>📋 Kurs ko'rinishi</h3>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:16 }}>
              {info.thumbnail && <img src={info.thumbnail} alt="" style={{ width:120, height:80, borderRadius:8, objectFit:"cover" }} onError={(e)=>e.target.style.display="none"}/>}
              <div>
                <h4 style={{ margin:"0 0 4px", fontWeight:800, fontSize:18, color:darkMode?"#f1f5f9":"#111" }}>{info.title}</h4>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, background:"#eff6ff", color:"#3b82f6", padding:"2px 8px", borderRadius:6, fontWeight:600 }}>{info.category}</span>
                  <span style={{ fontSize:12, background:darkMode?"#334155":"#f1f5f9", color:"#6b7280", padding:"2px 8px", borderRadius:6 }}>{info.level}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:info.price==0||!info.price?"#10b981":"#3b82f6" }}>{info.price==0||!info.price?"Bepul":Number(info.price).toLocaleString()+" so'm"}</span>
                </div>
              </div>
            </div>
            <p style={{ margin:"0 0 16px", fontSize:13, color:darkMode?"#94a3b8":"#4b5563", lineHeight:1.6 }}>{info.description}</p>
            <div style={{ display:"flex", gap:12, fontSize:13, color:"#6b7280" }}>
              <span>📚 {sections.length} bo'lim</span>
              <span>🎬 {totalLessons} dars</span>
              <span>👤 {user?.displayName || user?.email}</span>
            </div>
          </div>

          <div style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:14, padding:"16px 20px", marginBottom:14 }}>
            <p style={{ margin:"0 0 4px", fontSize:13, color:"#f59e0b", fontWeight:600 }}>⚠️ Eslatma</p>
            <p style={{ margin:0, fontSize:12, color:"#6b7280", lineHeight:1.6 }}>
              Kurs admin tomonidan tekshirilgandan so'ng platforma da ko'rinadi. Odatda 1-2 ish kunida tasdiqlanadi.
            </p>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setStep(2)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:"transparent", color:darkMode?"#94a3b8":"#374151", fontSize:14, fontWeight:600, cursor:"pointer" }}>← Orqaga</button>
            <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:"12px 0", borderRadius:10, background:saving?"#93c5fd":"#10b981", color:"#fff", border:"none", fontSize:14, fontWeight:700, cursor:saving?"default":"pointer" }}>
              {saving ? "⏳ Saqlanmoqda..." : "✅ Yuborish"}
            </button>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default CreateCourse;