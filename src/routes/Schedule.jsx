import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/useAuth";

const DAYS    = ["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"];
const DAYS_SH = ["Du","Se","Ch","Pa","Ju","Sh","Ya"];
const HOURS   = Array.from({ length: 16 }, (_, i) => `${(i + 7).toString().padStart(2,"0")}:00`);
const COLORS  = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"];

const COURSES = [
  "HTML Asoslar","CSS & Flexbox","JavaScript","React.js",
  "Ingliz Tili","Rus Tili","Fransuz Tili","Firebase","Quiz tayyorgarligi","Mustaqil mashq",
];

const Schedule = ({ darkMode, showToast }) => {
  const { user }  = useAuth();
  const [lessons, setLessons] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({ course:"HTML Asoslar", day:0, time:"09:00", duration:60, note:"" });
  const [viewMode, setViewMode] = useState("week"); // week | day
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "schedules"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setLessons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "schedules"), {
        ...form,
        uid:       user.uid,
        color:     COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: serverTimestamp(),
      });
      showToast && showToast("Dars jadvali qo'shildi! ✅", "success");
      setShowAdd(false);
      setForm({ course:"HTML Asoslar", day:0, time:"09:00", duration:60, note:"" });
    } catch {
      showToast && showToast("Xatolik yuz berdi", "error");
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "schedules", id));
    showToast && showToast("O'chirildi", "error");
  };

  const getLessonsForDay = (dayIdx) => lessons.filter((l) => l.day === dayIdx).sort((a,b)=>a.time.localeCompare(b.time));

  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ width:"100%", maxWidth:1000, margin:"0 auto", padding:"40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div>
            <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #bfdbfe" }}>
              📅 Mening jadvalim
            </span>
            <h2 style={{ fontSize:26, fontWeight:800, margin:0, color:darkMode?"#f1f5f9":"#111" }}>Dars Jadvali</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ display:"flex", gap:4, background:darkMode?"#1e293b":"#f1f5f9", borderRadius:10, padding:4 }}>
              {[{id:"week",label:"Hafta"},{id:"day",label:"Kun"}].map((m)=>(
                <button key={m.id} onClick={()=>setViewMode(m.id)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:viewMode===m.id?"#3b82f6":"transparent", color:viewMode===m.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600 }}>
                  {m.label}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowAdd(true)} style={{ padding:"8px 18px", borderRadius:10, background:"#3b82f6", color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              + Qo'shish
            </button>
          </div>
        </div>

        {/* Kunlar */}
        <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
          {DAYS.map((day, i) => {
            const cnt = getLessonsForDay(i).length;
            return (
              <button key={i} onClick={()=>setActiveDay(i)}
                style={{ flexShrink:0, padding:"10px 14px", borderRadius:12, border:`2px solid ${activeDay===i?"#3b82f6":(darkMode?"#334155":"#e5e7eb")}`, background:activeDay===i?"#3b82f6":(today===i?(darkMode?"#1e3a5f":"#eff6ff"):(darkMode?"#1e293b":"#fff")), cursor:"pointer", textAlign:"center", minWidth:72, transition:"all 0.2s" }}>
                <p style={{ margin:0, fontSize:11, color:activeDay===i?"#93c5fd":(today===i?"#3b82f6":(darkMode?"#94a3b8":"#6b7280")) }}>{DAYS_SH[i]}</p>
                <p style={{ margin:"2px 0 4px", fontWeight:700, fontSize:14, color:activeDay===i?"#fff":(darkMode?"#f1f5f9":"#111") }}>{day.slice(0,3)}</p>
                {cnt > 0 && <span style={{ background:activeDay===i?"rgba(255,255,255,0.3)":"#3b82f6", color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:10 }}>{cnt}</span>}
                {today===i && activeDay!==i && <p style={{ margin:"2px 0 0", fontSize:9, color:"#3b82f6", fontWeight:600 }}>Bugun</p>}
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Darslar ro'yxati */}
      <ScrollReveal direction="up" delay={100}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {getLessonsForDay(activeDay).length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
              <p style={{ color:"#6b7280", marginBottom:16 }}>{DAYS[activeDay]} uchun dars yo'q</p>
              <button onClick={()=>{ setForm({...form, day:activeDay}); setShowAdd(true); }} style={{ padding:"9px 20px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                + Dars qo'shish
              </button>
            </div>
          ) : (
            getLessonsForDay(activeDay).map((lesson) => (
              <div key={lesson.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderLeft:`4px solid ${lesson.color}` }}>
                <div style={{ textAlign:"center", minWidth:48 }}>
                  <p style={{ margin:0, fontWeight:700, fontSize:15, color:lesson.color }}>{lesson.time}</p>
                  <p style={{ margin:0, fontSize:10, color:"#6b7280" }}>{lesson.duration} min</p>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{lesson.course}</p>
                  {lesson.note && <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{lesson.note}</p>}
                </div>
                <button onClick={()=>handleDelete(lesson.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#ef4444", opacity:0.6, padding:"4px 8px" }}
                  onMouseEnter={(e)=>e.currentTarget.style.opacity="1"}
                  onMouseLeave={(e)=>e.currentTarget.style.opacity="0.6"}>🗑️</button>
              </div>
            ))
          )}
        </div>

        {/* Haftalik umumiy */}
        <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
          {[
            { label:"Jami darslar", value:lessons.length, icon:"📚", color:"#3b82f6" },
            { label:"Haftalik soat", value:`${Math.round(lessons.reduce((a,l)=>a+(l.duration||60),0)/60)}h`, icon:"⏱", color:"#10b981" },
            { label:"Eng ko'p kun", value:DAYS_SH[(() => { const cnt=DAYS.map((_,i)=>getLessonsForDay(i).length); return cnt.indexOf(Math.max(...cnt)); })()], icon:"🔥", color:"#f59e0b" },
          ].map((s,i)=>(
            <div key={i} style={{ background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:12, padding:"14px 16px", borderTop:`3px solid ${s.color}` }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <p style={{ margin:"6px 0 2px", fontSize:22, fontWeight:800, color:s.color }}>{s.value}</p>
              <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Add modal */}
      {showAdd && (
        <div onClick={()=>setShowAdd(false)} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ width:"100%", maxWidth:440, borderRadius:18, background:darkMode?"#1e293b":"#fff", padding:"24px", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ margin:0, fontWeight:700, fontSize:16, color:darkMode?"#f1f5f9":"#111" }}>📅 Dars qo'shish</h3>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#6b7280" }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kurs</label>
                <select value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})} style={inputStyle}>
                  {COURSES.map((c)=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kun</label>
                <select value={form.day} onChange={(e)=>setForm({...form,day:Number(e.target.value)})} style={inputStyle}>
                  {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Vaqt</label>
                  <select value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})} style={inputStyle}>
                    {HOURS.map((h)=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Davomiyligi (min)</label>
                  <select value={form.duration} onChange={(e)=>setForm({...form,duration:Number(e.target.value)})} style={inputStyle}>
                    {[30,45,60,90,120].map((d)=><option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Izoh (ixtiyoriy)</label>
                <input placeholder="Masalan: 3-bo'lim, Flexbox..." value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} style={inputStyle}/>
              </div>
              <button onClick={handleAdd} style={{ padding:"12px 0", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", marginTop:4 }}>
                ✅ Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;