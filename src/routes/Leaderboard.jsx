import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/useAuth";

const TABS = [
  { id: "xp",      label: "⭐ XP ball"  },
  { id: "courses", label: "📚 Kurslar"   },
  { id: "quiz",    label: "🎯 Quiz"       },
  { id: "streak",  label: "🔥 Streak"     },
];

const MEDAL = { 0: "🥇", 1: "🥈", 2: "🥉" };

const Avatar = ({ user, size = 40 }) => {
  const initials = (user.displayName || user.email || "?")[0].toUpperCase();
  const colors   = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"];
  const color    = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.38, flexShrink:0, overflow:"hidden" }}>
      {user.photoURL || user.avatarUrl || user.avatar
        ? <img src={user.photoURL || user.avatarUrl || user.avatar} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : initials}
    </div>
  );
};

const Leaderboard = ({ darkMode }) => {
  const { user }          = useAuth();
  const [activeTab, setActiveTab] = useState("xp");
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState("all");

  // Firebase dan real ma'lumotlar yuklash
useEffect(() => {
  setTimeout(() => setLoading(true), 0); // ← shu

  const unsub = onSnapshot(collection(db, "users"), async (snap) => {
    const baseUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const enriched = await Promise.all(
      baseUsers.map(async (u) => {
        try {
          const statsSnap = await getDoc(doc(db, "users", u.id, "data", "stats"));
          const stats     = statsSnap.exists() ? statsSnap.data() : {};

          const progressSnap = await Promise.all(
            ["1","2","3","4","5","6","7","8"].map((id) =>
              getDoc(doc(db, "users", u.id, "progress", id))
            )
          );
          const completedCourses = progressSnap.filter(
            (s) => s.exists() && s.data().progress === 100
          ).length;

          return {
            ...u,
            xp:      stats.xp     || 0,
            streak:  stats.streak || 0,
            courses: completedCourses,
            quizAvg: stats.quizAvg || 0,
          };
        } catch {
          return { ...u, xp: 0, streak: 0, courses: 0, quizAvg: 0 };
        }
      })
    );

    setUsers(enriched);
    setLoading(false);
  });

  return () => unsub();
}, []);

  const sorted = [...users]
    .sort((a, b) => (b[activeTab] || 0) - (a[activeTab] || 0))
    .filter((u) => (u[activeTab] || 0) > 0); // 0 bo'lganlarni ko'rsatma

  const myRank = sorted.findIndex((u) => u.id === user?.uid);
  const myData = myRank >= 0 ? sorted[myRank] : null;

  const valueLabel = (u) => {
    if (activeTab === "xp")      return `${(u.xp || 0).toLocaleString()} XP`;
    if (activeTab === "courses") return `${u.courses || 0} kurs`;
    if (activeTab === "quiz")    return `${u.quizAvg || 0}%`;
    if (activeTab === "streak")  return `${u.streak || 0} kun`;
    return "";
  };

  return (
    <div style={{ width:"100%", maxWidth:800, margin:"0 auto", padding:"40px 16px 80px" }}>
      <ScrollReveal direction="up">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:28 }}>
          <div>
            <span style={{ display:"inline-block", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:20, marginBottom:8, border:"1px solid #bfdbfe" }}>
              🏆 Reyting
            </span>
            <h2 style={{ fontSize:26, fontWeight:800, margin:0, color:darkMode?"#f1f5f9":"#111" }}>Leaderboard</h2>
          </div>
          {/* Period filter */}
          <div style={{ display:"flex", gap:6, background:darkMode?"#1e293b":"#f1f5f9", borderRadius:10, padding:4 }}>
            {[{id:"all",label:"Barchasi"},{id:"month",label:"Oy"},{id:"week",label:"Hafta"}].map((p) => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:period===p.id?"#3b82f6":"transparent", color:period===p.id?"#fff":darkMode?"#94a3b8":"#374151", fontSize:12, fontWeight:600, transition:"all 0.2s" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && sorted.length >= 3 && (
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"center", gap:12, marginBottom:28 }}>
            {/* 2nd */}
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:8 }}>
                <Avatar user={sorted[1]} size={56}/>
                <span style={{ position:"absolute", bottom:-4, right:-4, fontSize:18 }}>🥈</span>
              </div>
              <p style={{ fontWeight:700, fontSize:13, color:darkMode?"#f1f5f9":"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:80, margin:"4px auto 2px" }}>
                {sorted[1].displayName || sorted[1].email?.split("@")[0]}
              </p>
              <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{valueLabel(sorted[1])}</p>
              <div style={{ height:70, background:"#94a3b8", borderRadius:"8px 8px 0 0", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:18 }}>2</span>
              </div>
            </div>
            {/* 1st */}
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:8 }}>
                <Avatar user={sorted[0]} size={68}/>
                <span style={{ position:"absolute", bottom:-4, right:-4, fontSize:22 }}>🥇</span>
              </div>
              <p style={{ margin:"4px auto 2px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:90 }}>
                {sorted[0].displayName || sorted[0].email?.split("@")[0]}
              </p>
              <p style={{ margin:0, fontSize:12, color:"#f59e0b", fontWeight:700 }}>{valueLabel(sorted[0])}</p>
              <div style={{ height:100, background:"linear-gradient(135deg,#f59e0b,#d97706)", borderRadius:"8px 8px 0 0", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:22 }}>1</span>
              </div>
            </div>
            {/* 3rd */}
            <div style={{ textAlign:"center", flex:1 }}>
              <div style={{ position:"relative", display:"inline-block", marginBottom:8 }}>
                <Avatar user={sorted[2]} size={52}/>
                <span style={{ position:"absolute", bottom:-4, right:-4, fontSize:16 }}>🥉</span>
              </div>
              <p style={{ margin:"4px auto 2px", fontWeight:700, fontSize:12, color:darkMode?"#f1f5f9":"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:75 }}>
                {sorted[2].displayName || sorted[2].email?.split("@")[0]}
              </p>
              <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>{valueLabel(sorted[2])}</p>
              <div style={{ height:55, background:"#cd7f32", borderRadius:"8px 8px 0 0", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>3</span>
              </div>
            </div>
          </div>
        )}
      </ScrollReveal>

      {/* Tabs */}
      <ScrollReveal direction="up" delay={100}>
        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer", background:activeTab===tab.id?"#3b82f6":(darkMode?"#1e293b":"#f1f5f9"), color:activeTab===tab.id?"#fff":(darkMode?"#94a3b8":"#374151"), fontSize:12, fontWeight:600, transition:"all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mening o'rnim */}
        {myData && (
          <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background:darkMode?"#1e3a5f":"#eff6ff", border:"2px solid #3b82f6", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#3b82f6", minWidth:28 }}>#{myRank + 1}</span>
            <Avatar user={myData} size={36}/>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:13, color:darkMode?"#f1f5f9":"#111" }}>Siz</p>
            </div>
            <span style={{ fontWeight:700, fontSize:14, color:"#3b82f6" }}>{valueLabel(myData)}</span>
          </div>
        )}

        {/* List */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #3b82f6", borderTopColor:"transparent", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }}/>
              <p style={{ color:"#6b7280", fontSize:14 }}>Yuklanmoqda...</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#6b7280" }}>
              <div style={{ fontSize:40, marginBottom:10, opacity:0.3 }}>🏆</div>
              <p>Hali natijalar yo'q. Birinchi bo'ling!</p>
            </div>
          ) : (
            sorted.map((u, i) => {
              const isMe = u.id === user?.uid;
              return (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, background:isMe?(darkMode?"#1e3a5f":"#eff6ff"):(darkMode?"#1e293b":"#fff"), border:`1px solid ${isMe?"#3b82f6":(darkMode?"#334155":"#e5e7eb")}`, transition:"all 0.2s" }}>
                  <span style={{ fontWeight:700, fontSize:15, minWidth:30, color:i<3?"#f59e0b":(darkMode?"#94a3b8":"#6b7280") }}>
                    {MEDAL[i] || `#${i + 1}`}
                  </span>
                  <Avatar user={u} size={38}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:13, color:darkMode?"#f1f5f9":"#111", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {u.displayName || u.email?.split("@")[0]}
                      {isMe && <span style={{ marginLeft:6, fontSize:10, background:"#3b82f6", color:"#fff", padding:"1px 6px", borderRadius:4 }}>Siz</span>}
                    </p>
                    <p style={{ margin:0, fontSize:11, color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width:80, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#cd7f32":"#3b82f6" }}>
                      {valueLabel(u)}
                    </span>
                    <div style={{ width:"100%", height:4, borderRadius:2, background:darkMode?"#334155":"#e5e7eb" }}>
                      <div style={{ height:"100%", borderRadius:2, background:i===0?"#f59e0b":i===1?"#94a3b8":i===2?"#cd7f32":"#3b82f6", width:`${Math.round(((u[activeTab]||0) / (sorted[0][activeTab]||1)) * 100)}%` }}/>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Leaderboard;