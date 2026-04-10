import React, { useState, useEffect, useCallback } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/useAuth";
import { db } from "../firebase/config";
import {
  collection, getDocs, addDoc, doc, getDoc,
  serverTimestamp, runTransaction, query, orderBy, deleteDoc
} from "firebase/firestore";
import { giveReward } from "../utils/rewardSystem";
import { 
  LuCode, LuCoins, LuShoppingBag, LuPlus, 
  LuCheck, LuDownload, LuUser, LuSearch,
  LuTrash2, LuEye, LuX, LuLayers, LuTag, LuInfo
} from "react-icons/lu";

const CATEGORIES = [
  { id: "all", label: "Barchasi" },
  { id: "react", label: "React Components" },
  { id: "tailwind", label: "Tailwind UI" },
  { id: "js", label: "JavaScript Logic" },
  { id: "htmlcss", label: "HTML/CSS Templates" }
];

const PixelMarket = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState("market");
  const [items, setItems] = useState([]);
  const [myCoins, setMyCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [newItem, setNewItem] = useState({ title: "", desc: "", code: "", price: 50, category: "react" });
  const [viewingCode, setViewingCode] = useState(null);

  const fetchMarketItems = useCallback(async () => {
    try {
      const q = query(collection(db, "market_items"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const fetchedItems = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);

      if (user) {
        const wRef = doc(db, "users", user.uid, "data", "wallet");
        const wSnap = await getDoc(wRef);
        if (wSnap.exists()) setMyCoins(wSnap.data().coins || 0);
      }
    } catch (err) {
      console.error("Market fetch xatosi:", err);
      showToast?.("Bozorni yuklashda xatolik!", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchMarketItems();
  }, [fetchMarketItems]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.title || !newItem.code || !newItem.desc) return showToast?.("Barcha maydonlarni to'ldiring", "warning");
    const numericPrice = Number(newItem.price);
    if (!numericPrice || numericPrice < 10) return showToast?.("Eng kam narx 10 tanga!", "error");

    setActionLoading("create");
    try {
      await addDoc(collection(db, "market_items"), {
        ...newItem,
        price: numericPrice,
        sellerId: user.uid,
        sellerName: user.displayName || "Noma'lum",
        buyers: [], 
        createdAt: serverTimestamp()
      });
      showToast?.("Mahsulotingiz sotuvga qo'yildi!", "success");
      setNewItem({ title: "", desc: "", code: "", price: 50, category: "react" });
      setTab("market");
      fetchMarketItems();
    } catch (err) {
      console.error("Mahsulot yaratishda xatolik:", err);
      showToast?.("Joylashda xatolik yuz berdi", "error");
    }
    setActionLoading(null);
  };

  const handleBuyItem = async (item) => {
    if (!user) return;
    if (myCoins < item.price) return showToast?.("Tangangiz yetarli emas!", "error");

    setActionLoading(item.id);
    try {
      await runTransaction(db, async (transaction) => {
        const buyerRef = doc(db, "users", user.uid, "data", "wallet");
        const buyerSnap = await transaction.get(buyerRef);
        const buyerCoins = buyerSnap.exists() ? buyerSnap.data().coins || 0 : 0;
        
        if (buyerCoins < item.price) throw new Error("INSUFFICIENT_COINS");

        const itemRef = doc(db, "market_items", item.id);
        const itemSnap = await transaction.get(itemRef);
        const itemBuyers = itemSnap.data().buyers || [];

        if (itemBuyers.includes(user.uid)) throw new Error("ALREADY_BOUGHT");
        
        transaction.update(itemRef, { buyers: [...itemBuyers, user.uid] });
      });

      // Markaziy tizim orqali tangalarni yechish va berish
      await giveReward(user.uid, -item.price, "coins", `Pixel Market xaridi: ${item.title}`);
      await giveReward(item.sellerId, item.price, "coins", `Pixel Market sotuvi: ${item.title}`);

      showToast?.(`Muvaffaqiyatli xarid qilindi! ${item.price} tanga yechildi.`, "success");
      setMyCoins(prev => prev - item.price);
      fetchMarketItems();
    } catch (err) {
      showToast?.(err.message === "INSUFFICIENT_COINS" ? "Tangangiz yetarli emas" : "Xarid amalga oshmadi", "error");
    }
    setActionLoading(null);
  };

  const handleDeleteItem = async (id) => {
    if(!window.confirm("Rostdan ham bu mahsulotni bozordan o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, "market_items", id));
      showToast?.("Mahsulot o'chirildi", "success");
      fetchMarketItems();
    } catch (err) {
        console.error("Mahsulot o'chirishda xatolik:", err);
      showToast?.("O'chirishda xatolik", "error");
    }
  };

  const filteredItems = items.filter(item => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!user) return <div className="p-4 md:p-10 text-center">Iltimos, avval tizimga kiring.</div>;

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
      
      {/* ── MODAL (Responsive) ── */}
      {viewingCode && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 md:p-6 backdrop-blur-md bg-black/70 animate-in fade-in">
          <div className={`w-full max-w-3xl rounded-2xl md:rounded-3xl border shadow-2xl flex flex-col h-[85vh] md:max-h-[80vh] md:h-auto transition-colors duration-300 ${
            darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className={`flex justify-between items-center p-4 md:p-6 border-b transition-colors duration-300 ${darkMode ? "border-white/10" : "border-slate-100"}`}>
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2 truncate"><LuCode className="text-purple-600 shrink-0"/> {viewingCode.title}</h3>
              <button onClick={() => setViewingCode(null)} className="p-2 md:p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors shrink-0">
                <LuX size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <pre className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-[#0d1117] text-[#e6edf3] font-mono text-[10px] sm:text-xs md:text-sm overflow-x-auto shadow-inner">
                {viewingCode.code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER (Responsive) ── */}
      <ScrollReveal direction="up">
        <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              Pixel <span className="text-purple-600">Market</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">Dasturchilar tomonidan dasturchilar uchun yaratilgan kodlar bozori.</p>
          </div>
          <div className={`w-full sm:w-auto px-5 py-3 rounded-2xl border flex items-center gap-3 shadow-lg transition-colors duration-300 ${
            darkMode ? "bg-slate-900/50 border-purple-600/30" : "bg-purple-50 border-purple-200"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-600 shrink-0">
              <LuCoins size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-0.5">Balansingiz</p>
              <p className="text-xl font-black text-purple-600 leading-none">{myCoins} <span className="text-xs">Tanga</span></p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── TABS (Mobil uchun Swipeable) ── */}
      <ScrollReveal direction="up" delay={100}>
        <div className={`flex gap-2 mb-8 p-1.5 rounded-2xl md:rounded-3xl border backdrop-blur-md overflow-x-auto no-scrollbar transition-colors duration-300 ${
          darkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-50 border-slate-200"
        }`}>
          {[
            { id: "market", label: "Bozor", icon: <LuShoppingBag size={18} /> },
            { id: "purchases", label: "Xaridlarim", icon: <LuCheck size={18} /> },
            { id: "my_items", label: "Sotuvdagilarim", icon: <LuLayers size={18} /> },
            { id: "add_new", label: "Yangi", icon: <LuPlus size={18} /> }
          ].map(t => (
             <button 
               key={t.id} onClick={() => setTab(t.id)}
               className={`flex-1 min-w-max flex items-center justify-center gap-2 py-3 px-5 md:px-6 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${
                 tab === t.id 
                 ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                 : "text-slate-500 hover:text-purple-600 hover:bg-slate-800/5"
               }`}
             >
               {t.icon} {t.label}
             </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── LOADING STATE ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-20 gap-4">
           <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
           <p className="text-slate-500 text-sm md:text-base font-bold tracking-widest uppercase">Bozor yuklanmoqda...</p>
        </div>
      ) : (
        <>
          {/* ── BOZOR TAB ── */}
          {tab === "market" && (
            <ScrollReveal direction="up" delay={200}>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
                <div className="relative flex-1">
                  <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="Kod yoki shablon izlash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border text-sm outline-none transition-colors duration-300 ${
                      darkMode ? "bg-slate-900/50 border-white/10 text-white focus:border-purple-600" : "bg-white border-slate-200 text-slate-900 focus:border-purple-600"
                    }`}
                  />
                </div>
                <select 
                  value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}
                  className={`px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border text-sm font-bold outline-none cursor-pointer w-full sm:w-auto transition-colors duration-300 ${
                    darkMode ? "bg-slate-900/50 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id} className={darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map(item => {
                   const isOwner = item.sellerId === user.uid;
                   const hasBought = item.buyers?.includes(user.uid);
                   
                   return (
                     <div key={item.id} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full ${
                       darkMode ? "bg-slate-900/40 border-white/5 hover:border-purple-600/50" : "bg-white border-slate-100 hover:border-purple-400"
                     }`}>
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                          <span className="px-2.5 md:px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 text-[9px] md:text-[10px] font-black uppercase flex items-center gap-1">
                            <LuTag size={12}/> {CATEGORIES.find(c => c.id === item.category)?.label || "Boshqa"}
                          </span>
                          <span className="flex items-center gap-1 font-black text-purple-600 bg-purple-600/10 px-2.5 md:px-3 py-1 rounded-lg text-xs md:text-sm">
                            <LuCoins size={14}/> {item.price}
                          </span>
                        </div>
                        <h3 className={`text-base md:text-lg font-black leading-tight mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mb-4 flex-1 line-clamp-3">{item.desc}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                            <LuUser className="text-slate-500" size={14}/>
                          </div>
                          <span className="text-[11px] md:text-xs font-bold text-slate-500 truncate">{item.sellerName}</span>
                        </div>

                        {isOwner ? (
                          <button className={`w-full py-2.5 rounded-xl font-bold text-xs md:text-sm cursor-not-allowed border border-dashed transition-colors ${
                            darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}>Sizning mahsulotingiz</button>
                        ) : hasBought ? (
                          <button onClick={() => setViewingCode(item)} className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors font-bold text-xs md:text-sm flex items-center justify-center gap-2 border border-emerald-500/20">
                            <LuEye size={16} /> Kodni ko'rish
                          </button>
                        ) : (
                          <button onClick={() => handleBuyItem(item)} disabled={actionLoading === item.id} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50">
                            {actionLoading === item.id ? <LuInfo className="animate-spin" size={16}/> : <><LuDownload size={16}/> Xarid qilish</>}
                          </button>
                        )}
                     </div>
                   )
                })}
              </div>
              {filteredItems.length === 0 && (
                <div className={`text-center py-16 md:py-20 text-slate-500 text-sm md:text-base font-bold border-2 border-dashed rounded-2xl md:rounded-3xl transition-colors ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}>Ushbu so'rov bo'yicha hech narsa topilmadi.</div>
              )}
            </ScrollReveal>
          )}

          {/* ── XARIDLARIM VA SOTUVDAGILARIM TAB ── */}
          {(tab === "purchases" || tab === "my_items") && (
            <ScrollReveal direction="up" delay={100}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {items.filter(item => tab === "purchases" ? item.buyers?.includes(user.uid) : item.sellerId === user.uid).map(item => (
                  <div key={item.id} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border flex flex-col h-full transition-colors duration-300 ${
                    darkMode ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200 shadow-lg"
                  }`}>
                    <h3 className={`text-base md:text-lg font-black mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                    <p className="text-slate-500 text-xs md:text-sm mb-4 flex-1 line-clamp-2">{item.desc}</p>
                    
                    {tab === "purchases" ? (
                      <button onClick={() => setViewingCode(item)} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30">
                        <LuEye size={16}/> Kodni ko'rish
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-auto">
                         <div className={`flex-1 py-2 md:py-2.5 rounded-xl font-bold text-center text-xs md:text-sm text-slate-500 flex items-center justify-center gap-1.5 md:gap-2 transition-colors ${
                           darkMode ? "bg-slate-800" : "bg-slate-100"
                         }`}>
                           <LuUser size={14} md:size={16}/> Xaridorlar: {item.buyers?.length || 0}
                         </div>
                         <button onClick={() => handleDeleteItem(item.id)} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shrink-0">
                           <LuTrash2 size={16} />
                         </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {items.filter(item => tab === "purchases" ? item.buyers?.includes(user.uid) : item.sellerId === user.uid).length === 0 && (
                <div className={`text-center py-16 md:py-20 text-slate-500 text-sm md:text-base font-bold border-2 border-dashed rounded-2xl md:rounded-3xl transition-colors ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}>Hozircha hech narsa yo'q.</div>
              )}
            </ScrollReveal>
          )}

          {/* ── YANGI QO'SHISH TAB ── */}
          {tab === "add_new" && (
            <ScrollReveal direction="up" delay={100}>
               <form onSubmit={handleCreateItem} className={`w-full max-w-3xl mx-auto p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border transition-colors duration-300 ${
                 darkMode ? "bg-slate-900/40 border-white/5 shadow-2xl shadow-black/50" : "bg-white border-slate-100 shadow-2xl shadow-slate-200/50"
               }`}>
                  <h3 className={`text-xl md:text-2xl font-black mb-6 md:mb-8 flex items-center gap-2 md:gap-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                    <LuPlus className="text-purple-600" size={24}/> Yangi kod qo'shish
                  </h3>
                  
                  <div className="space-y-5 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                      <div>
                        <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">Kod nomi *</label>
                        <input required type="text" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} placeholder="Qisqa va aniq nom" 
                        className={`w-full p-3 md:p-4 rounded-xl border text-sm outline-none transition-colors duration-300 ${
                          darkMode ? "bg-slate-800/50 border-white/10 focus:border-purple-600 text-white" : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-900"
                        }`} />
                      </div>
                      <div>
                        <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">Kategoriya *</label>
                        <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} 
                        className={`w-full p-3 md:p-4 rounded-xl border text-sm font-bold outline-none transition-colors duration-300 ${
                          darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}>
                           {CATEGORIES.filter(c => c.id !== "all").map(c => (
                             <option key={c.id} value={c.id} className={darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                               {c.label}
                             </option>
                           ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">Qisqacha ta'rif *</label>
                      <input required type="text" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} placeholder="Bu kod qanday vazifani bajaradi?" 
                      className={`w-full p-3 md:p-4 rounded-xl border text-sm outline-none transition-colors duration-300 ${
                        darkMode ? "bg-slate-800/50 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      }`} />
                    </div>

                    <div>
                      <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 flex items-center justify-between">
                        <span>Manba Kod *</span>
                        <span className="text-purple-600 font-medium normal-case text-[10px] md:text-xs">Xaridorlar ko'radi</span>
                      </label>
                      <textarea required rows="8" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} placeholder="Kodni shu yerga joylang..." 
                      className={`w-full p-3 md:p-4 rounded-xl text-xs md:text-sm font-mono outline-none transition-colors duration-300 ${
                        darkMode ? "bg-[#0d1117] text-[#58a6ff] border border-white/10" : "bg-slate-900 text-green-400"
                      }`} />
                    </div>

                    <div>
                      <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">Narxi (Tanga) *</label>
                      <div className="relative">
                        <LuCoins className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18}/>
                        <input 
                          required 
                          type="number" 
                          min="10"
                          value={newItem.price} 
                          onChange={e => setNewItem({...newItem, price: e.target.value})} 
                          placeholder="150" 
                          className={`w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl border text-base md:text-lg font-black outline-none transition-colors duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            darkMode ? "bg-slate-800/50 border-white/10 focus:border-purple-600 text-white" : "bg-slate-50 border-slate-200 focus:border-purple-600 text-slate-900"
                          }`} 
                        />
                      </div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 mt-1.5 md:mt-2 uppercase">Platforma hozircha komissiya olmaydi (0%)</p>
                    </div>

                    <button type="submit" disabled={actionLoading === "create"} className="w-full py-4 md:py-5 mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-purple-600/30 transition-all text-sm md:text-lg flex items-center justify-center gap-2 active:scale-95">
                      {actionLoading === "create" ? <LuInfo className="animate-spin" size={20}/> : "Kodni Bozorga Chiqarish"}
                    </button>
                  </div>
               </form>
            </ScrollReveal>
          )}
        </>
      )}
    </div>
  );
};

export default PixelMarket;