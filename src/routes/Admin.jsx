import { useState, useEffect, useCallback } from "react";
import {
  collection, getDocs, deleteDoc, doc,
  setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import ScrollReveal from "../components/ScrollReveal";
import { useLang } from "../context/useLang";

const Admin = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  // ── Promo kodlar ──────────────────────────────────────────────────────────
  const [promoCodes, setPromoCodes]   = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: "", discount: "", type: "percent", course: "all", maxUses: "100",
  });
  const [promoSaving, setPromoSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        showToast(t.loadError, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showToast, t.loadError]);

  // Promo kodlarni yuklash
  const fetchPromoCodes = useCallback(async () => {
    setPromoLoading(true);
    try {
      const snap = await getDocs(collection(db, "promoCodes"));
      setPromoCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      showToast("Promo kodlarni yuklashda xatolik!", "error");
    }
    setPromoLoading(false);
  }, [showToast]);

  useEffect(() => {
    if (activeTab === "promo") fetchPromoCodes();
  }, [activeTab, fetchPromoCodes]);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} ${t.confirmDelete}`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      showToast(`${userName} ${t.deleteSuccess}`, "success");
    } catch {
      showToast(t.deleteError, "error");
    }
  };

  // ── Promo kod qo'shish ────────────────────────────────────────────────────
  const handleAddPromo = async () => {
    const code = promoForm.code.trim().toUpperCase();
    if (!code || !promoForm.discount) {
      showToast("Kod va chegirma kiritilmadi!", "error");
      return;
    }
    setPromoSaving(true);
    try {
      await setDoc(doc(db, "promoCodes", code), {
        discount:  Number(promoForm.discount),
        type:      promoForm.type,
        course:    promoForm.course,
        maxUses:   Number(promoForm.maxUses),
        uses:      0,
        valid:     true,
        createdAt: serverTimestamp(),
      });
      showToast(`✅ "${code}" promo kodi qo'shildi!`, "success");
      setShowPromoForm(false);
      setPromoForm({ code:"", discount:"", type:"percent", course:"all", maxUses:"100" });
      fetchPromoCodes();
    } catch {
      showToast("Xatolik yuz berdi!", "error");
    }
    setPromoSaving(false);
  };

  // ── Promo kodni o'chirish / deaktivlashtirish ─────────────────────────────
  const handleTogglePromo = async (promoId, currentValid) => {
    try {
      await updateDoc(doc(db, "promoCodes", promoId), { valid: !currentValid });
      setPromoCodes((prev) => prev.map((p) => p.id === promoId ? { ...p, valid: !currentValid } : p));
      showToast(currentValid ? "Promo kod o'chirildi" : "Promo kod yoqildi", "success");
    } catch {
      showToast("Xatolik!", "error");
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm(`"${promoId}" promo kodini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, "promoCodes", promoId));
      setPromoCodes((prev) => prev.filter((p) => p.id !== promoId));
      showToast("Promo kod o'chirildi!", "success");
    } catch {
      showToast("Xatolik!", "error");
    }
  };

  const cardClass = `rounded-2xl p-6 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`;
  const inputStyle = {
    width:"100%", padding:"9px 12px", borderRadius:8,
    border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`,
    background:darkMode?"#0f172a":"#f8fafc",
    color:darkMode?"#f1f5f9":"#111", fontSize:13, outline:"none", boxSizing:"border-box",
  };

  const tabs = [
    { id:"stats", label:t.statsTab     },
    { id:"users", label:t.usersTab     },
    { id:"promo", label:"🎟️ Promo Kodlar" },
  ];

  return (
    <div className={`page-transition w-full max-w-6xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
              🛡️ {t.adminTitle}
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t.adminSub}</p>
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

      {/* Stats tab */}
      {activeTab === "stats" && (
        <ScrollReveal direction="up" delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label:t.totalUsers,   value:users.length,                                    icon:"👥", color:"text-blue-400"    },
            ].map((stat, i) => (
              <div key={i} className={cardClass}>
                <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-2xl mt-1">{stat.icon}</div>
                <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.recentUsers}</h3>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" /></div>
            ) : users.slice(0,3).map((user) => (
              <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/> : user.displayName?.[0]?.toUpperCase()||"?"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode?"text-white":"text-gray-900"}`}>{user.displayName||t.unknown}</p>
                  <p className={`text-xs ${darkMode?"text-gray-400":"text-gray-500"}`}>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode?"text-white":"text-gray-900"}`}>{t.allUsers} ({users.length})</h3>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
            ) : users.map((user) => (
              <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl mb-3 ${darkMode?"bg-slate-700":"bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover"/> : user.displayName?.[0]?.toUpperCase()||"?"}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode?"text-white":"text-gray-900"}`}>{user.displayName||t.unknown}</p>
                    <p className={`text-xs ${darkMode?"text-gray-400":"text-gray-500"}`}>{user.email}</p>
                  </div>
                </div>
                <button onClick={()=>handleDeleteUser(user.id,user.displayName||user.email)}
                  className="px-3 py-1.5 text-xs text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition">
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Promo Kodlar tab ─────────────────────────────────────────────────── */}
      {activeTab === "promo" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${darkMode?"text-white":"text-gray-900"}`}>
                🎟️ Promo Kodlar ({promoCodes.length})
              </h3>
              <button onClick={()=>setShowPromoForm(!showPromoForm)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition">
                {showPromoForm ? "✕ Yopish" : "+ Yangi kod"}
              </button>
            </div>

            {/* Yangi promo kod formi */}
            {showPromoForm && (
              <div style={{ background:darkMode?"#0f172a":"#f8fafc", borderRadius:12, padding:"20px", marginBottom:20, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                <h4 style={{ margin:"0 0 16px", fontWeight:700, fontSize:14, color:darkMode?"#f1f5f9":"#111" }}>Yangi promo kod yaratish</h4>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Kod nomi *</label>
                    <input value={promoForm.code} onChange={(e)=>setPromoForm({...promoForm,code:e.target.value.toUpperCase()})}
                      placeholder="PIXEL50" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Chegirma *</label>
                    <input type="number" value={promoForm.discount} onChange={(e)=>setPromoForm({...promoForm,discount:e.target.value})}
                      placeholder="50" style={inputStyle}/>
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
                      <option value="all">Barcha kurslar</option>
                      <option value="HTML">HTML</option>
                      <option value="CSS">CSS</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="React">React</option>
                      <option value="English">English</option>
                      <option value="Russian">Russian</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:"#6b7280", display:"block", marginBottom:4 }}>Max foydalanish</label>
                    <input type="number" value={promoForm.maxUses} onChange={(e)=>setPromoForm({...promoForm,maxUses:e.target.value})}
                      placeholder="100" style={inputStyle}/>
                  </div>
                </div>
                <div style={{ marginTop:14, display:"flex", gap:8 }}>
                  <button onClick={handleAddPromo} disabled={promoSaving}
                    style={{ padding:"10px 24px", background:promoSaving?"#93c5fd":"#10b981", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:promoSaving?"default":"pointer" }}>
                    {promoSaving ? "⏳ Saqlanmoqda..." : "✅ Saqlash"}
                  </button>
                  <button onClick={()=>setShowPromoForm(false)} style={{ padding:"10px 16px", background:"transparent", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, borderRadius:10, fontSize:13, color:darkMode?"#94a3b8":"#374151", cursor:"pointer" }}>
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {/* Kodlar ro'yxati */}
            {promoLoading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"/></div>
            ) : promoCodes.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🎟️</div>
                <p style={{ color:"#6b7280" }}>Hali promo kod yo'q. "Yangi kod" bosing!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {promoCodes.map((promo) => (
                  <div key={promo.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, background:darkMode?"#0f172a":"#f8fafc", border:`1px solid ${promo.valid?(darkMode?"#334155":"#e5e7eb"):"#ef444433"}`, opacity:promo.valid?1:0.6 }}>
                    {/* Kod */}
                    <span style={{ fontFamily:"monospace", fontWeight:800, fontSize:15, color:promo.valid?"#3b82f6":"#9ca3af", minWidth:100 }}>
                      {promo.id}
                    </span>
                    {/* Info */}
                    <div style={{ flex:1, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ padding:"2px 10px", borderRadius:20, background:"#d1fae5", color:"#065f46", fontSize:12, fontWeight:700 }}>
                        {promo.type==="percent" ? `${promo.discount}%` : `${Number(promo.discount).toLocaleString()} so'm`}
                      </span>
                      <span style={{ fontSize:12, color:"#6b7280" }}>
                        {promo.course==="all" ? "Barcha kurslar" : promo.course}
                      </span>
                      <span style={{ fontSize:12, color:"#6b7280" }}>
                        {promo.uses || 0}/{promo.maxUses} marta
                      </span>
                      <span style={{ padding:"2px 8px", borderRadius:20, background:promo.valid?"#d1fae5":"#fee2e2", color:promo.valid?"#065f46":"#991b1b", fontSize:11, fontWeight:600 }}>
                        {promo.valid ? "✓ Aktiv" : "✕ O'chirilgan"}
                      </span>
                    </div>
                    {/* Tugmalar */}
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={()=>handleTogglePromo(promo.id, promo.valid)}
                        style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${promo.valid?"#ef4444":"#10b981"}`, background:"transparent", color:promo.valid?"#ef4444":"#10b981", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                        {promo.valid ? "O'chirish" : "Yoqish"}
                      </button>
                      <button onClick={()=>handleDeletePromo(promo.id)}
                        style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #ef4444", background:"transparent", color:"#ef4444", fontSize:11, cursor:"pointer" }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
};

export default Admin;