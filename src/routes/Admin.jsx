import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import ScrollReveal from "../components/ScrollReveal";

const Admin = ({ darkMode, showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  const allPosts = [
    { id: 1, title: "East Village Ice Cream Crawl", author: "Maria Phillips", category: "Food", date: "2026-03-01" },
    { id: 2, title: "Brooklyn Bridge cinematic photo walk", author: "James Calzoni", category: "Nature", date: "2026-03-05" },
    { id: 3, title: "Central Park Morning Walk", author: "Sarah Johnson", category: "Nature", date: "2026-03-10" },
    { id: 4, title: "NYC Food Tour Downtown", author: "Mike Brown", category: "Food", date: "2026-03-12" },
  ];

  // Foydalanuvchilarni yuklash
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(list);
      } catch {
        showToast("Foydalanuvchilarni yuklashda xatolik!", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showToast]);

  // Foydalanuvchini o'chirish
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`${userName} ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      showToast(`${userName} o'chirildi!`, "success");
    } catch {
      showToast("O'chirishda xatolik!", "error");
    }
  };

  const cardClass = `rounded-2xl p-6 shadow-lg ${darkMode ? "bg-slate-800" : "bg-white"}`;
  const tabs = [
    { id: "stats", label: "📊 Statistika" },
    { id: "users", label: "👥 Foydalanuvchilar" },
    { id: "posts", label: "📝 Postlar" },
  ];

  return (
    <div className={`page-transition w-full max-w-6xl mx-auto px-6 py-10 mt-10 ${darkMode ? "text-white" : "text-gray-900"}`}>

      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-extrabold ${darkMode ? "text-white" : "text-gray-900"}`}>
              🛡️ Admin Panel
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Loyihani boshqarish markazi
            </p>
          </div>
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl">
            ✅ Admin
          </span>
        </div>
      </ScrollReveal>

      {/* Tablar */}
      <ScrollReveal direction="up" delay={100}>
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Statistika tab */}
      {activeTab === "stats" && (
        <ScrollReveal direction="up" delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Jami foydalanuvchilar", value: users.length, icon: "👥", color: "text-blue-400" },
              { label: "Jami postlar", value: allPosts.length, icon: "📝", color: "text-green-400" },
              { label: "Food postlar", value: allPosts.filter(p => p.category === "Food").length, icon: "🍔", color: "text-yellow-400" },
              { label: "Nature postlar", value: allPosts.filter(p => p.category === "Nature").length, icon: "🌿", color: "text-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className={cardClass}>
                <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-2xl mt-1">{stat.icon}</div>
                <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* So'nggi foydalanuvchilar */}
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              👥 So'nggi foydalanuvchilar
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              </div>
            ) : users.length > 0 ? (
              <div className="flex flex-col gap-3">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.displayName?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {user.displayName || "Noma'lum"}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Hali foydalanuvchilar yo'q
              </p>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Foydalanuvchilar tab */}
      {activeTab === "users" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              👥 Barcha foydalanuvchilar ({users.length})
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
              </div>
            ) : users.length > 0 ? (
              <div className="flex flex-col gap-3">
                {users.map((user) => (
                  <div key={user.id} className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.[0]?.toUpperCase() || "?"
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {user.displayName || "Noma'lum"}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                        {user.phone && <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📞 {user.phone}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.displayName || user.email)}
                      className="px-3 py-1.5 text-xs text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition"
                    >
                      O'chirish
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Hali foydalanuvchilar yo'q
              </p>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* Postlar tab */}
      {activeTab === "posts" && (
        <ScrollReveal direction="up" delay={200}>
          <div className={cardClass}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
              📝 Barcha postlar ({allPosts.length})
            </h3>
            <div className="flex flex-col gap-3">
              {allPosts.map((post) => (
                <div key={post.id} className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                  <div>
                    <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{post.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>👤 {post.author}</span>
                      <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-0.5 rounded-full">{post.category}</span>
                      <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📅 {post.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast("Post o'chirildi!", "success")}
                    className="px-3 py-1.5 text-xs text-red-400 border border-red-400 rounded-xl hover:bg-red-400 hover:text-white transition"
                  >
                    O'chirish
                  </button>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

    </div>
  );
};

export default Admin;