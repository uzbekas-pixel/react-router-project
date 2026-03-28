import React, { useState, useEffect } from "react";
import ScrollReveal from "../components/ScrollReveal";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import {
  collection, doc, setDoc,
  deleteDoc, onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore";
import {
  LuUserPlus, LuUserCheck, LuUserX, LuUsers,
  LuSearch, LuTrophy, LuFlame, LuStar, LuMessageSquare,
  LuCheck, LuX, LuUser,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { getNameStyleByKey } from "../constants/shopConstants";

const LEVELS = [
  { level: 1, name: "Yangi boshlovchi", minXP: 0,     color: "#6b7280", badge: "🌱" },
  { level: 2, name: "O'quvchi",         minXP: 100,   color: "#10b981", badge: "📚" },
  { level: 3, name: "Izlanuvchi",       minXP: 300,   color: "#3b82f6", badge: "🔍" },
  { level: 4, name: "Bilimdon",         minXP: 600,   color: "#8b5cf6", badge: "🧠" },
  { level: 5, name: "Mahir",            minXP: 1000,  color: "#f59e0b", badge: "⚡" },
  { level: 6, name: "Ekspert",          minXP: 1500,  color: "#ef4444", badge: "🎯" },
  { level: 7, name: "Usta",             minXP: 2500,  color: "#06b6d4", badge: "🏆" },
  { level: 8, name: "Professional",     minXP: 4000,  color: "#f97316", badge: "💎" },
  { level: 9, name: "Champion",         minXP: 6000,  color: "#ec4899", badge: "👑" },
  { level: 10,name: "Legenda",          minXP: 10000, color: "#d97706", badge: "🌟" },
];

const getLevel = (xp = 0) => LEVELS.slice().reverse().find((l) => xp >= l.minXP) || LEVELS[0];

// ─── Avatar component ─────────────────────────────────────────────────────────
const Avatar = ({ user: u, size = 44 }) => {
  const initials = (u?.displayName || u?.email || "?")[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>
      {u?.photoURL || u?.avatarUrl
        ? <img src={u.photoURL || u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials}
    </div>
  );
};

// ─── User Card ────────────────────────────────────────────────────────────────
const UserCard = ({ u, status, onAdd, onAccept, onDecline, onRemove, onMessage, onViewProfile, darkMode }) => {
  const level = getLevel(u.xp || 0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: darkMode ? "#1e293b" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, transition: "all 0.2s" }}>
      {/* Avatar - bosiladigan */}
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onViewProfile && onViewProfile(u.id)}>
        <Avatar user={u} size={46} />
        <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 14 }}>{level.badge}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Ism - bosiladigan */}
        <p
          onClick={() => onViewProfile && onViewProfile(u.id)}
          style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#3b82f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", ...getNameStyleByKey(u.nameColor) }}
        >
          {u.displayName || u.email?.split("@")[0]}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: level.color, fontWeight: 600 }}>{level.name}</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
          <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
            <LuStar size={10} style={{ color: "#f59e0b" }} /> {(u.xp || 0).toLocaleString()} XP
          </span>
          {u.streak > 0 && (
            <>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
              <span style={{ fontSize: 11, color: "#ef4444", display: "flex", alignItems: "center", gap: 2 }}>
                <LuFlame size={10} /> {u.streak}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tugmalar */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {status === "none" && (
          <button onClick={() => onAdd(u)} style={{ padding: "7px 14px", borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <LuUserPlus size={14} /> Qo'shish
          </button>
        )}
        {status === "pending_sent" && (
          <span style={{ padding: "7px 14px", borderRadius: 10, background: darkMode ? "#334155" : "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 600 }}>
            Kutilmoqda...
          </span>
        )}
        {status === "pending_received" && (
          <>
            <button onClick={() => onAccept(u)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuCheck size={14} /> Qabul
            </button>
            <button onClick={() => onDecline(u)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuX size={14} /> Rad
            </button>
          </>
        )}
        {status === "friends" && (
          <>
            <button onClick={() => onMessage(u)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuMessageSquare size={14} />
            </button>
            <button onClick={() => onRemove(u)} style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid #ef4444`, background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuUserX size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Friends ─────────────────────────────────────────────────────────────
const Friends = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]             = useState("friends");
  const [search, setSearch]       = useState("");
  const [allUsers, setAllUsers]   = useState([]);
  const [friends, setFriends]     = useState([]);
  const [requests, setRequests]   = useState({ sent: [], received: [] });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== user.uid);
      setAllUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const friendsUnsub = onSnapshot(
      collection(db, "users", user.uid, "friends"),
      (snap) => setFriends(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const sentUnsub = onSnapshot(
      query(collection(db, "friendRequests"), where("fromId", "==", user.uid), where("status", "==", "pending")),
      (snap) => setRequests((prev) => ({ ...prev, sent: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }))
    );

    const receivedUnsub = onSnapshot(
      query(collection(db, "friendRequests"), where("toId", "==", user.uid), where("status", "==", "pending")),
      (snap) => setRequests((prev) => ({ ...prev, received: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }))
    );

    return () => { friendsUnsub(); sentUnsub(); receivedUnsub(); };
  }, [user]);

  const sendRequest = async (toUser) => {
    if (!user) return;
    try {
      const reqId = `${user.uid}_${toUser.id}`;
      await setDoc(doc(db, "friendRequests", reqId), {
        fromId:   user.uid,
        fromName: user.displayName || user.email,
        fromPhoto:user.photoURL || null,
        toId:     toUser.id,
        toName:   toUser.displayName || toUser.email,
        status:   "pending",
        createdAt: serverTimestamp(),
      });
      showToast && showToast(`${toUser.displayName || toUser.email}ga so'rov yuborildi! 📨`, "success");
    } catch (err) {
      console.error(err);
      showToast && showToast("Xatolik yuz berdi!", "error");
    }
  };

  const acceptRequest = async (fromUser) => {
    if (!user) return;
    try {
      const reqId = `${fromUser.fromId}_${user.uid}`;
      await setDoc(doc(db, "users", user.uid, "friends", fromUser.fromId), {
        uid:      fromUser.fromId,
        displayName: fromUser.fromName,
        photoURL: fromUser.fromPhoto || null,
        addedAt:  serverTimestamp(),
      });
      await setDoc(doc(db, "users", fromUser.fromId, "friends", user.uid), {
        uid:      user.uid,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        addedAt:  serverTimestamp(),
      });
      await deleteDoc(doc(db, "friendRequests", reqId));
      showToast && showToast("Do'st qo'shildi! 🎉", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const declineRequest = async (fromUser) => {
    if (!user) return;
    try {
      const reqId = `${fromUser.fromId}_${user.uid}`;
      await deleteDoc(doc(db, "friendRequests", reqId));
      showToast && showToast("So'rov rad etildi", "error");
    } catch (err) {
      console.error(err);
    }
  };

  const removeFriend = async (friendUser) => {
    if (!user || !window.confirm(`${friendUser.displayName || friendUser.uid}ni do'stlardan olib tashlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "friends", friendUser.uid || friendUser.id));
      await deleteDoc(doc(db, "users", friendUser.uid || friendUser.id, "friends", user.uid));
      showToast && showToast("Do'stdan olib tashlandi", "error");
    } catch (err) {
      console.error(err);
    }
  };

  const goToMessage = () => {
    navigate("/dm");
  };

  // ← YANGI: profilga o'tish
  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getStatus = (targetUser) => {
    if (friends.find((f) => f.uid === targetUser.id || f.id === targetUser.id)) return "friends";
    if (requests.sent.find((r) => r.toId === targetUser.id)) return "pending_sent";
    if (requests.received.find((r) => r.fromId === targetUser.id)) return "pending_received";
    return "none";
  };

  const friendsList = allUsers.filter((u) =>
    friends.find((f) => f.uid === u.id || f.id === u.id)
  );

  const searchResults = search.length >= 2
    ? allUsers.filter((u) =>
        (u.displayName || u.email || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const receivedUsers = requests.received.map((r) => ({
    id: r.fromId,
    displayName: r.fromName,
    photoURL: r.fromPhoto,
    ...r,
  }));

  const tabs = [
    { id: "friends",  label: "Do'stlar",   count: friendsList.length },
    { id: "requests", label: "So'rovlar",  count: requests.received.length },
    { id: "search",   label: "Qidirish",   count: null },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", padding: "40px 16px 80px" }}>
      <ScrollReveal direction="up">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            👥 Ijtimoiy
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>
            Do'stlar
          </h2>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer",
              background: tab === t.id ? "#3b82f6" : (darkMode ? "#1e293b" : "#f1f5f9"),
              color: tab === t.id ? "#fff" : (darkMode ? "#94a3b8" : "#374151"),
              fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {t.count !== null && t.count > 0 && (
                <span style={{ background: tab === t.id ? "rgba(255,255,255,0.3)" : "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Do'stlar tab ── */}
      {tab === "friends" && (
        <ScrollReveal direction="up" delay={100}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Yuklanmoqda...</div>
          ) : friendsList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <p style={{ color: darkMode ? "#94a3b8" : "#6b7280", marginBottom: 16 }}>Hali do'stlar yo'q</p>
              <button onClick={() => setTab("search")} style={{ padding: "10px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Do'st qidirish
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{friendsList.length} ta do'st</p>
              {friendsList.map((u) => (
                <UserCard key={u.id} u={u} status="friends"
                  onRemove={removeFriend} onMessage={goToMessage}
                  onViewProfile={goToProfile}
                  darkMode={darkMode} />
              ))}
            </div>
          )}
        </ScrollReveal>
      )}

      {/* ── So'rovlar tab ── */}
      {tab === "requests" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {receivedUsers.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  📨 Kelgan so'rovlar ({receivedUsers.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {receivedUsers.map((u) => (
                    <UserCard key={u.id} u={u} status="pending_received"
                      onAccept={acceptRequest} onDecline={declineRequest}
                      onViewProfile={goToProfile}
                      darkMode={darkMode} />
                  ))}
                </div>
              </div>
            )}

            {requests.sent.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  📤 Yuborilgan so'rovlar ({requests.sent.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {requests.sent.map((r) => {
                    const toUser = allUsers.find((u) => u.id === r.toId) || { id: r.toId, displayName: r.toName };
                    return (
                      <UserCard key={r.id} u={toUser} status="pending_sent"
                        onViewProfile={goToProfile}
                        darkMode={darkMode} />
                    );
                  })}
                </div>
              </div>
            )}

            {receivedUsers.length === 0 && requests.sent.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>Hali so'rovlar yo'q</p>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* ── Qidirish tab ── */}
      {tab === "search" && (
        <ScrollReveal direction="up" delay={100}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <LuSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 16 }} />
            <input
              type="text"
              placeholder="Ism yoki email bilan qidiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {search.length < 2 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <LuSearch style={{ fontSize: 48, margin: "0 auto", color: darkMode ? "#475569" : "#cbd5e1", marginBottom: 12 }} />
              <p style={{ marginTop: 10, color: darkMode ? "#94a3b8" : "#6b7280" }}>Kamida 2 ta harf kiriting</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <LuUser style={{ fontSize: 48, color: darkMode ? "#475569" : "#cbd5e1", marginBottom: 12 }} />
              <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>Foydalanuvchi topilmadi</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{searchResults.length} ta natija</p>
              {searchResults.map((u) => (
                <UserCard key={u.id} u={u} status={getStatus(u)}
                  onAdd={sendRequest} onAccept={acceptRequest}
                  onDecline={declineRequest} onRemove={removeFriend}
                  onMessage={goToMessage}
                  onViewProfile={goToProfile}
                  darkMode={darkMode} />
              ))}
            </div>
          )}
        </ScrollReveal>
      )}
    </div>
  );
};

export default Friends;