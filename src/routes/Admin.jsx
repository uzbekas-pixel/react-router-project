import { useState, useEffect, useCallback } from "react";
import {
  collection, getDocs, deleteDoc, doc,
  setDoc, updateDoc, serverTimestamp, addDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";

const NOTIF_TYPES = [
  { value:"info",    label:"ℹ️ Ma'lumot",      color:"#3b82f6" },
  { value:"success", label:"✅ Muvaffaqiyat",   color:"#10b981" },
  { value:"warning", label:"⚠️ Ogohlantirish", color:"#f59e0b" },
  { value:"promo",   label:"🎁 Promo",          color:"#8b5cf6" },
  { value:"course",  label:"🎓 Kurs",           color:"#06b6d4" },
];

const Admin = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  // ── Promo ──────────────────────────────────────────────────────────────────
  const [promoCodes, setPromoCodes]       = useState([]);
  const [promoLoading, setPromoLoading]   = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm]         = useState({ code:"", discount:"", type:"percent", course:"all", maxUses:"100" });
  const [promoSaving, setPromoSaving]     = useState(false);

  // ── Bildirishnoma ──────────────────────────────────────────────────────────
  const [notifForm, setNotifForm] = useState({
    title:"", message:"", type:"info", target:"all", userId:"", link:"",
  });
  const [notifSending, setNotifSending] = useState(false);
  const [sentHistory, setSentHistory]   = useState([]);
  const [histLoading, setHistLoading]   = useState(false);

  // ── Foydalanuvchilar ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch { showToast(t.loadError, "error"); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [showToast, t.loadError]);

  // ── Promo kodlar ───────────────────────────────────────────────────────────
  const fetchPromoCodes = useCallback(async () => {
    setPromoLoading(true);
    try {
      const snap = await getDocs(collection(db, "promoCodes"));
      setPromoCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { showToast("Promo kodlarni yuklashda xatolik!", "error"); }
    setPromoLoading(false);
  }, [showToast]);

  // ── Bildirishnomalar tarixi ────────────────────────────────────────────────
  const fetchNotifHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const snap = await getDocs(collection(db, "adminNotifications"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setSentHistory(list);
    } catch (err) {
       console.error(err);
    }
    setHistLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "promo") fetchPromoCodes();
    if (activeTab === "notif") fetchNotifHistory();
  }, [activeTab, fetchPromoCodes, fetchNotifHistory]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} ${t.confirmDelete}`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      showToast(`${userName} ${t.deleteSuccess}`, "success");
    } catch { showToast(t.deleteError, "error"); }
  };

  const handleAddPromo = async () => {
    const code = promoForm.code.trim().toUpperCase();
    if (!code || !promoForm.discount) { showToast("Kod va chegirma kiritilmadi!", "error"); return; }
    setPromoSaving(true);
    try {
      await setDoc(doc(db, "promoCodes", code), {
        discount: Number(promoForm.discount), type: promoForm.type,
        course: promoForm.course, maxUses: Number(promoForm.maxUses),
        uses: 0, valid: true, createdAt: serverTimestamp(),
      });
      showToast(`✅ "${code}" promo kodi qo'shildi!`, "success");
      setShowPromoForm(false);
      setPromoForm({ code:"", discount:"", type:"percent", course:"all", maxUses:"100" });
      fetchPromoCodes();
    } catch { showToast("Xatolik!", "error"); }
    setPromoSaving(false);
  };

  const handleTogglePromo = async (promoId, currentValid) => {
    try {
      await updateDoc(doc(db, "promoCodes", promoId), { valid: !currentValid });
      setPromoCodes((prev) => prev.map((p) => p.id === promoId ? { ...p, valid: !currentValid } : p));
      showToast(currentValid ? "Promo kod o'chirildi" : "Promo kod yoqildi", "success");
    } catch { showToast("Xatolik!", "error"); }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm(`"${promoId}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, "promoCodes", promoId));
      setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
      showToast("O'chirildi!", "success");
    } catch { showToast("Xatolik!", "error"); }
  };

  // ── Bildirishnoma yuborish ─────────────────────────────────────────────────
  const handleSendNotif = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast("Sarlavha va xabar kiritilmadi!", "error"); return;
    }
    if (notifForm.target === "user" && !notifForm.userId) {
      showToast("Foydalanuvchi tanlanmadi!", "error"); return;
    }
    setNotifSending(true);
    try {
      const base = {
        title:     notifForm.title.trim(),
        message:   notifForm.message.trim(),
        type:      notifForm.type,
        link:      notifForm.link.trim() || null,
        read:      false,
        createdAt: serverTimestamp(),
      };

      if (notifForm.target === "all") {
        // Barcha foydalanuvchilarga batch write
        const batch = writeBatch(db);
        users.forEach((u) => {
          const ref = doc(collection(db, "users", u.id, "notifications"));
          batch.set(ref, { ...base, userId: u.id });
        });
        await batch.commit();
        await addDoc(collection(db, "adminNotifications"), {
          ...base, target:"all", targetCount: users.length,
        });
        showToast(`✅ ${users.length} ta foydalanuvchiga yuborildi!`, "success");
      } else {
        const targetUser = users.find((u) => u.id === notifForm.userId);
        await addDoc(collection(db, "users", notifForm.userId, "notifications"), {
          ...base, userId: notifForm.userId,
        });
        await addDoc(collection(db, "adminNotifications"), {
          ...base, target:"user",
          targetId:   notifForm.userId,
          targetName: targetUser?.displayName || targetUser?.email || "—",
        });
        showToast(`✅ ${targetUser?.displayName || "Foydalanuvchi"}ga yuborildi!`, "success");
      }

      setNotifForm({ title:"", message:"", type:"info", target:"all", userId:"", link:"" });
      fetchNotifHistory();
    } catch (err) {
      console.error(err);
      showToast("Yuborishda xatolik!", "error");
    }
    setNotifSending(false);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const cardClass  = `rounded-2xl p-6 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`;
  const inputStyle = {
    width:"100%", padding:"9px 12px", borderRadius:8,
    border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`,
    background:darkMode?"#0f172a":"#f8fafc",
    color:darkMode?"#f1f5f9":"#111", fontSize:13, outline:"none", boxSizing:"border-box",
  };

  const tabs = [
    { id:"stats", label: t.statsTab           },
    { id:"users", label: t.usersTab           },
    { id:"promo", label: "🎟️ Promo Kodlar"    },
    { id:"notif", label: "🔔 Bildirishnoma"   },
  ];

  return (
    <div className={`page-transition w-full max-w-6xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-extrabold ${darkMode?"text-white":"text-gray-900"}`}>🛡️ {t.adminTitle}</h1>
            <p className={`text-sm mt-1 ${darkMode?"text-gray-400":"text-gray-500"}`}>{t.adminSub}</p>
          </div>
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl">{t.adminBadge}</span>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={100}>
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id ? "bg-blue-500 text-white"
                : darkMode ? "bg-slate-800 text-gray-400 hover:bg-slate-700"
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Stats ── */}
      {activeTab === "stats" && (
        <ScrollReveal direction="up" delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className={cardClass}>
              <div className="text-3xl font-extrabold text-blue-400">{users.length}</div>
              <div className="text-2xl mt-1">👥</div>
              <p className={`text-xs mt-2 ${darkMode?"text-gray-400":"text-gray-500"}`}>{t.totalUsers}</p>
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode?"text-white":"text-gray-900"}`}>{t.recentUsers}</h3>
            {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
            : users.slice(0,3).map((u) => (
              <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${darkMode?"bg-slate-700":"bg-gray-50"}`}>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/> : u.displayName?.[0]?.toUpperCase()||"?"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode?"text-white":"text-gray-900"}`}>{u.displayName||t.unknown}</p>
                  <p className={`text-xs ${darkMode?"text-gray-400":"text-gray-500"}`}>{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Users ── */}
      {activeTab === "users" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode?"text-white":"text-gray-900"}`}>{t.allUsers} ({users.length})</h3>
            {loading ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
            : users.map((u) => (
              <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl mb-3 ${darkMode?"bg-slate-700":"bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/> : u.displayName?.[0]?.toUpperCase()||"?"}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode?"text-white":"text-gray-900"}`}>{u.displayName||t.unknown}</p>
                    <p className={`text-xs ${darkMode?"text-gray-400":"text-gray-500"}`}>{u.email}</p>
                  </div>
                </div>
                <button onClick={()=>handleDeleteUser(u.id,u.displayName||u.email)}
                  className="px-3 py-1.5 text-xs text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition">
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Promo ── */}
      {activeTab === "promo" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${darkMode?"text-white":"text-gray-900"}`}>🎟️ Promo Kodlar ({promoCodes.length})</h3>
              <button onClick={()=>setShowPromoForm(!showPromoForm)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition">
                {showPromoForm?"✕ Yopish":"+ Yangi kod"}
              </button>
            </div>
            {showPromoForm && (
              <div style={{ background:darkMode?"#0f172a":"#f8fafc", borderRadius:12, padding:"20px", marginBottom:20, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                <h4 style={{ margin:"0 0 16px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>Yangi promo kod</h4>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kod nomi *</label>
                    <input value={promoForm.code} placeholder="PIXEL50" onChange={(e)=>setPromoForm({...promoForm,code:e.target.value.toUpperCase()})} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Chegirma *</label>
                    <input type="number" value={promoForm.discount} placeholder="50" onChange={(e)=>setPromoForm({...promoForm,discount:e.target.value})} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Turi</label>
                    <select value={promoForm.type} onChange={(e)=>setPromoForm({...promoForm,type:e.target.value})} style={inputStyle}>
                      <option value="percent">Foiz (%)</option>
                      <option value="sum">So'm</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kurs</label>
                    <select value={promoForm.course} onChange={(e)=>setPromoForm({...promoForm,course:e.target.value})} style={inputStyle}>
                      {["all","HTML","CSS","JavaScript","React","English","Russian","French"].map((c)=>(
                        <option key={c} value={c}>{c==="all"?"Barcha kurslar":c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Max foydalanish</label>
                    <input type="number" value={promoForm.maxUses} placeholder="100" onChange={(e)=>setPromoForm({...promoForm,maxUses:e.target.value})} style={inputStyle}/>
                  </div>
                </div>
                <div style={{ marginTop:14, display:"flex", gap:8 }}>
                  <button onClick={handleAddPromo} disabled={promoSaving}
                    style={{ padding:"10px 24px", background:promoSaving?"#93c5fd":"#10b981", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:promoSaving?"default":"pointer" }}>
                    {promoSaving?"⏳ Saqlanmoqda...":"✅ Saqlash"}
                  </button>
                  <button onClick={()=>setShowPromoForm(false)} style={{ padding:"10px 16px", background:"transparent", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:10, fontSize:13, color:darkMode?"#94a3b8":"#374151", cursor:"pointer" }}>
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
            {promoLoading ? <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
            : promoCodes.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🎟️</div>
                <p style={{ color:"#6b7280" }}>Hali promo kod yo'q. "Yangi kod" bosing!</p>
              </div>
            ) : promoCodes.map((promo)=>(
              <div key={promo.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, marginBottom:8, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${promo.valid?(darkMode?"#334155":"#e5e7eb"):"#ef444433"}`, opacity:promo.valid?1:0.6 }}>
                <span style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color:promo.valid?"#3b82f6":"#9ca3af", minWidth:100 }}>{promo.id}</span>
                <div style={{ flex:1, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <span style={{ padding:"2px 10px", borderRadius:20, background:"#d1fae5", color:"#065f46", fontSize:12, fontWeight:700 }}>
                    {promo.type==="percent"?`${promo.discount}%`:`${Number(promo.discount).toLocaleString()} so'm`}
                  </span>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{promo.course==="all"?"Barcha kurslar":promo.course}</span>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{promo.uses||0}/{promo.maxUses} marta</span>
                  <span style={{ padding:"2px 8px", borderRadius:20, background:promo.valid?"#d1fae5":"#fee2e2", color:promo.valid?"#065f46":"#991b1b", fontSize:11, fontWeight:600 }}>
                    {promo.valid?"✓ Aktiv":"✕ O'chirilgan"}
                  </span>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={()=>handleTogglePromo(promo.id,promo.valid)} style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${promo.valid?"#ef4444":"#10b981"}`, background:"transparent", color:promo.valid?"#ef4444":"#10b981", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    {promo.valid?"O'chirish":"Yoqish"}
                  </button>
                  <button onClick={()=>handleDeletePromo(promo.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", fontSize:11, cursor:"pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Bildirishnoma ── */}
      {activeTab === "notif" && (
        <ScrollReveal direction="up" delay={200}>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Yuborish formasi */}
            <div className={cardClass}>
              <h3 className={`text-lg font-bold mb-6 ${darkMode?"text-white":"text-gray-900"}`}>🔔 Bildirishnoma Yuborish</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:16 }}>

                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Sarlavha *</label>
                  <input value={notifForm.title} onChange={(e)=>setNotifForm({...notifForm,title:e.target.value})}
                    placeholder="Yangi kurs qo'shildi!" style={inputStyle}/>
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Xabar matni *</label>
                  <textarea value={notifForm.message} onChange={(e)=>setNotifForm({...notifForm,message:e.target.value})}
                    placeholder="Xabar matnini yozing..." rows={3}
                    style={{ ...inputStyle, resize:"none" }}/>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Turi</label>
                  <select value={notifForm.type} onChange={(e)=>setNotifForm({...notifForm,type:e.target.value})} style={inputStyle}>
                    {NOTIF_TYPES.map((nt)=>(
                      <option key={nt.value} value={nt.value}>{nt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kimga yuborish</label>
                  <select value={notifForm.target} onChange={(e)=>setNotifForm({...notifForm,target:e.target.value,userId:""})} style={inputStyle}>
                    <option value="all">👥 Barcha foydalanuvchilar ({users.length} ta)</option>
                    <option value="user">👤 Bitta foydalanuvchi</option>
                  </select>
                </div>

                {notifForm.target === "user" && (
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Foydalanuvchi *</label>
                    <select value={notifForm.userId} onChange={(e)=>setNotifForm({...notifForm,userId:e.target.value})} style={inputStyle}>
                      <option value="">— Tanlang —</option>
                      {users.map((u)=>(
                        <option key={u.id} value={u.id}>{u.displayName||u.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Havola (ixtiyoriy)</label>
                  <input value={notifForm.link} onChange={(e)=>setNotifForm({...notifForm,link:e.target.value})}
                    placeholder="/courses yoki /quiz" style={inputStyle}/>
                </div>
              </div>

              {/* Preview */}
              {(notifForm.title || notifForm.message) && (
                <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:12, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${NOTIF_TYPES.find(n=>n.value===notifForm.type)?.color||"#3b82f6"}55` }}>
                  <p style={{ margin:"0 0 8px", fontSize:11, color:"#6b7280", fontWeight:600 }}>👁️ Ko'rinishi:</p>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                    <span style={{ fontSize:22 }}>{NOTIF_TYPES.find(n=>n.value===notifForm.type)?.label.split(" ")[0]||"🔔"}</span>
                    <div>
                      <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{notifForm.title||"Sarlavha"}</p>
                      <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{notifForm.message||"Xabar matni"}</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleSendNotif} disabled={notifSending}
                style={{ padding:"12px 28px", background:notifSending?"#93c5fd":"#3b82f6", color:"#fff", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:notifSending?"default":"pointer" }}>
                {notifSending ? "⏳ Yuborilmoqda..."
                  : notifForm.target==="all" ? `📢 Barcha ${users.length} ta foydalanuvchiga yuborish`
                  : "📨 Yuborish"}
              </button>
            </div>

            {/* Tarix */}
            <div className={cardClass}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode?"text-white":"text-gray-900"}`}>📋 Yuborilgan bildirishnomalar</h3>
              {histLoading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
              ) : sentHistory.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 0", color:"#6b7280" }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
                  <p>Hali bildirishnoma yuborilmagan</p>
                </div>
              ) : sentHistory.map((n) => {
                const typeInfo = NOTIF_TYPES.find((nt)=>nt.value===n.type)||NOTIF_TYPES[0];
                return (
                  <div key={n.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", borderRadius:12, marginBottom:10, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderLeft:`4px solid ${typeInfo.color}` }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{typeInfo.label.split(" ")[0]}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:"0 0 2px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>{n.title}</p>
                      <p style={{ margin:"0 0 6px", fontSize:12, color:"#6b7280" }}>{n.message}</p>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:11, padding:"1px 8px", borderRadius:20, background:darkMode?"#334155":"#e5e7eb", color:"#6b7280" }}>
                          {n.target==="all" ? `👥 ${n.targetCount||"?"} ta foydalanuvchi` : `👤 ${n.targetName||"?"}`}
                        </span>
                        {n.link && <span style={{ fontSize:11, color:"#3b82f6" }}>🔗 {n.link}</span>}
                        <span style={{ fontSize:11, color:"#9ca3af" }}>
                          {n.createdAt?.toDate?.()?.toLocaleString("uz")||"—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default Admin;