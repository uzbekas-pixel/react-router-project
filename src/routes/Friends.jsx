import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import {
  collection, doc, setDoc,
  deleteDoc, onSnapshot, query, where, serverTimestamp,
  getDoc, getDocs, updateDoc, increment,
} from "firebase/firestore";
import {
  LuUserPlus, LuUserCheck, LuUserX, LuUsers,
  LuSearch, LuTrophy, LuFlame, LuStar, LuMessageSquare,
  LuCheck, LuX, LuUser, LuSprout, LuBook, LuBrain, LuTarget, LuGem, LuCrown, LuBellOff, LuZap, LuSend,
  LuGift, LuCopy, LuShare2, LuLightbulb,
} from "react-icons/lu";
import { giveReward } from "../utils/rewardSystem";
import { useNavigate } from "react-router-dom";
import { getNameStyleByKey } from "../constants/shopConstants";

const getLevels = (t) => [
  { level: 1, name: t.level1Name, minXP: 0,     color: "#6b7280", badge: <LuSprout size={14} /> },
  { level: 2, name: t.level2Name, minXP: 100,   color: "#10b981", badge: <LuBook size={14} /> },
  { level: 3, name: t.level3Name, minXP: 300,   color: "#3b82f6", badge: <LuSearch size={14} /> },
  { level: 4, name: t.level4Name, minXP: 600,   color: "#8b5cf6", badge: <LuBrain size={14} /> },
  { level: 5, name: t.level5Name, minXP: 1000,  color: "#f59e0b", badge: <LuZap size={14} /> },
  { level: 6, name: t.level6Name, minXP: 1500,  color: "#ef4444", badge: <LuTarget size={14} /> },
  { level: 7, name: t.level7Name, minXP: 2500,  color: "#06b6d4", badge: <LuTrophy size={14} /> },
  { level: 8, name: t.level8Name, minXP: 4000,  color: "#f97316", badge: <LuGem size={14} /> },
  { level: 9, name: t.level9Name, minXP: 6000,  color: "#ec4899", badge: <LuCrown size={14} /> },
  { level: 10,name: t.level10Name, minXP: 10000, color: "#d97706", badge: <LuStar size={14} /> },
];

const getLevel = (xp = 0, t) => {
  const levels = getLevels(t);
  return levels.slice().reverse().find((l) => xp >= l.minXP) || levels[0];
};

// в”Ђв”Ђв”Ђ Avatar component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

// в”Ђв”Ђв”Ђ User Card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const UserCard = ({ u, status, onAdd, onAccept, onDecline, onRemove, onMessage, onViewProfile, darkMode, t }) => {
  const level = getLevel(u.xp || 0, t);
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
          <span style={{ fontSize: 11, color: "#9ca3af" }}>В·</span>
          <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
            <LuStar size={10} style={{ color: "#f59e0b" }} /> {(u.xp || 0).toLocaleString()} XP
          </span>
          {u.streak > 0 && (
            <>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>В·</span>
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
            <LuUserPlus size={14} /> {t.addFriend}
          </button>
        )}
        {status === "pending_sent" && (
          <span style={{ padding: "7px 14px", borderRadius: 10, background: darkMode ? "#334155" : "#f3f4f6", color: "#6b7280", fontSize: 12, fontWeight: 600 }}>
            {t.pendingRequest}
          </span>
        )}
        {status === "pending_received" && (
          <>
            <button onClick={() => onAccept(u)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuCheck size={14} /> {t.accept}
            </button>
            <button onClick={() => onDecline(u)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <LuX size={14} /> {t.decline}
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

// в”Ђв”Ђв”Ђ Main Friends в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const Friends = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate  = useNavigate();
  const [tab, setTab]             = useState("friends");
  const [search, setSearch]       = useState("");
  const [allUsers, setAllUsers]   = useState([]);
  const [friends, setFriends]     = useState([]);
  const [requests, setRequests]   = useState({ sent: [], received: [] });
  const [loading, setLoading]     = useState(true);

  // Referral states
  const REFERRAL_XP = 100;
  const REFERRED_XP = 50;
  const [referralCode,   setReferralCode]   = useState("");
  const [referredUsers,  setReferredUsers]  = useState([]);
  const [totalEarned,    setTotalEarned]    = useState(0);
  const [inputCode,      setInputCode]      = useState("");
  const [applying,       setApplying]       = useState(false);
  const [copied,         setCopied]         = useState(false);
  const [alreadyUsed,    setAlreadyUsed]    = useState(false);

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
      showToast && showToast(`${toUser.displayName || toUser.email}${t.requestSentSuffix}`, "success");
    } catch (err) {
      console.error(err);
      showToast && showToast(t.errorOccurred, "error");
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
      showToast && showToast(t.friendAdded, "success");
    } catch (err) {
      console.error(err);
    }
  };

  const declineRequest = async (fromUser) => {
    if (!user) return;
    try {
      const reqId = `${fromUser.fromId}_${user.uid}`;
      await deleteDoc(doc(db, "friendRequests", reqId));
      showToast && showToast(t.requestDeclined, "error");
    } catch (err) {
      console.error(err);
    }
  };

  const removeFriend = async (friendUser) => {
    if (!user || !window.confirm(`${friendUser.displayName || friendUser.uid}${t.removeFriendConfirm}`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "friends", friendUser.uid || friendUser.id));
      await deleteDoc(doc(db, "users", friendUser.uid || friendUser.id, "friends", user.uid));
      showToast && showToast(t.friendRemoved, "error");
    } catch (err) {
      console.error(err);
    }
  };

  const goToMessage = () => {
    navigate("/dm");
  };

  // в†ђ YANGI: profilga o'tish
  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Referral functions
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const ref  = doc(db, "referrals", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          if (!cancelled) {
            setReferralCode(data.code || "");
            setTotalEarned(data.totalEarned || 0);
            setAlreadyUsed(!!data.usedCode);
          }
        } else {
          const code = `UZP-${user.uid.slice(0, 6).toUpperCase()}`;
          await setDoc(ref, {
            uid:         user.uid,
            code,
            totalEarned: 0,
            usedCode:    null,
            createdAt:   serverTimestamp(),
          });
          if (!cancelled) setReferralCode(code);
        }
      } catch (err) {
        console.error("Referral load error:", err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!referralCode) return;
    let cancelled = false;

    const loadReferred = async () => {
      try {
        const q    = query(collection(db, "referrals"), where("usedCode", "==", referralCode));
        const snap = await getDocs(q);
        if (!cancelled) {
          setReferredUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Referred users load error:", err);
      }
    };

    loadReferred();
    return () => { cancelled = true; };
  }, [referralCode]);

  const applyCode = async () => {
    if (!user || !inputCode.trim()) return;
    const code = inputCode.trim().toUpperCase();

    if (code === referralCode) {
      showToast?.(t.cannotUseOwnCode, "error");
      return;
    }
    if (alreadyUsed) {
      showToast?.(t.alreadyUsedCode, "error");
      return;
    }

    setApplying(true);
    try {
      const q    = query(collection(db, "referrals"), where("code", "==", code));
      const snap = await getDocs(q);

      if (snap.empty) {
        showToast?.(t.codeNotFound, "error");
        setApplying(false);
        return;
      }

      const ownerDoc  = snap.docs[0];
      const ownerData = ownerDoc.data();

      await giveReward(ownerData.uid, REFERRAL_XP, "xp", t.referralReward);

      await updateDoc(doc(db, "referrals", ownerData.uid), {
        totalEarned: increment(REFERRAL_XP),
      });

      await giveReward(user.uid, REFERRED_XP, "xp", t.referredReward);

      await updateDoc(doc(db, "referrals", user.uid), {
        usedCode: code,
        usedAt:   serverTimestamp(),
      });

      await setDoc(
        doc(db, "users", ownerData.uid, "notifications", `ref_${Date.now()}`),
        {
          title:     t.referralNotification,
          message:   `${t.referralNotificationMessage} +${REFERRAL_XP} XP`,
          type:      "success",
          read:      false,
          createdAt: serverTimestamp(),
        }
      );

      setAlreadyUsed(true);
      setInputCode("");
      showToast?.(`${REFERRED_XP} ${t.xpAddedBoth}`, "success");

    } catch (err) {
      console.error("applyCode error:", err);
      showToast?.(t.error, "error");
    }
    setApplying(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    showToast?.(t.codeCopied, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    const text = `${t.shareTitle} ${t.shareTextLine1}\n${t.shareTextLine2} ${referralCode}\n+${REFERRED_XP} ${t.shareTextLine3}\nhttps://uzbekas.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: t.shareTitle, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      showToast?.(t.linkCopied, "success");
    }
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
    { id: "friends",  label: t.friendsTab,   count: friendsList.length },
    { id: "requests", label: t.requestsTab,  count: requests.received.length },
    { id: "search",   label: t.searchTab,   count: null },
    { id: "referral", label: t.referralTab || "Referral", count: referredUsers.length || null },
  ];

  return (
    <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", padding: "40px 16px 80px" }}>
      <div direction="up">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ display: "inline-block", background: "#eff6ff", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 8, border: "1px solid #bfdbfe" }}>
            <LuUsers size={14} className="inline mr-2" /> {t.socialLabel}
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: darkMode ? "#f1f5f9" : "#111" }}>
            {t.friendsTitle}
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
      </div>

      {/* в”Ђв”Ђ Do'stlar tab в”Ђв”Ђ */}
      {tab === "friends" && (
        <div direction="up" delay={100}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>{t.loading}</div>
          ) : friendsList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <LuUsers size={48} className="mx-auto mb-4 opacity-20" />
              <p style={{ color: darkMode ? "#94a3b8" : "#6b7280", marginBottom: 16 }}>{t.noFriendsYet}</p>
              <button onClick={() => setTab("search")} style={{ padding: "10px 24px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {t.searchFriend}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{friendsList.length} {t.friendsCount}</p>
              {friendsList.map((u) => (
                <UserCard key={u.id} u={u} status="friends"
                  onRemove={removeFriend} onMessage={goToMessage}
                  onViewProfile={goToProfile}
                  darkMode={darkMode} t={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* в”Ђв”Ђ So'rovlar tab в”Ђв”Ђ */}
      {tab === "requests" && (
        <div direction="up" delay={100}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {receivedUsers.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280" }}>
                  {t.receivedRequests} ({receivedUsers.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {receivedUsers.map((u) => (
                    <UserCard key={u.id} u={u} status="pending_received"
                      onAccept={acceptRequest} onDecline={declineRequest}
                      onViewProfile={goToProfile}
                      darkMode={darkMode} t={t} />
                  ))}
                </div>
              </div>
            )}

            {requests.sent.length > 0 && (
              <div>
                <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: darkMode ? "#94a3b8" : "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                  <LuSend size={14} /> {t.sentRequests} ({requests.sent.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {requests.sent.map((r) => {
                    const toUser = allUsers.find((u) => u.id === r.toId) || { id: r.toId, displayName: r.toName };
                    return (
                      <UserCard key={r.id} u={toUser} status="pending_sent"
                        onViewProfile={goToProfile}
                        darkMode={darkMode} t={t} />
                    );
                  })}
                </div>
              </div>
            )}

            {receivedUsers.length === 0 && requests.sent.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <LuBellOff size={48} className="mx-auto mb-4 opacity-20" />
                <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>{t.noRequestsYet}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ Qidirish tab в”Ђв”Ђ */}
      {tab === "search" && (
        <div direction="up" delay={100}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <LuSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 16 }} />
            <input
              type="text"
              placeholder={t.searchByNameOrEmail}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: `1px solid ${darkMode ? "#334155" : "#e5e7eb"}`, background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#f1f5f9" : "#111", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {search.length < 2 ? (
            <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <LuSearch style={{ fontSize: 48, color: darkMode ? "#475569" : "#cbd5e1", marginBottom: 12 }} />
              <p style={{ marginTop: 10, color: darkMode ? "#94a3b8" : "#6b7280" }}>{t.minCharsRequired}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <LuUser style={{ fontSize: 48, color: darkMode ? "#475569" : "#cbd5e1", marginBottom: 12 }} />
              <p style={{ color: darkMode ? "#94a3b8" : "#6b7280" }}>{t.userNotFound}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{searchResults.length} {t.results}</p>
              {searchResults.map((u) => (
                <UserCard key={u.id} u={u} status={getStatus(u)}
                  onAdd={sendRequest} onAccept={acceptRequest}
                  onDecline={declineRequest} onRemove={removeFriend}
                  onMessage={goToMessage}
                  onViewProfile={goToProfile}
                  darkMode={darkMode} t={t} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* в”Ђв”Ђ Referral tab в”Ђв”Ђ */}
      {tab === "referral" && (
        <div direction="up" delay={100}>
          {/* Statistika */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
            {[
              { icon:<LuUsers size={20}/>,  color:"#3b82f6", value:referredUsers.length, label:t.referredCount || "Taklif qilingan" },
              { icon:<LuStar size={20}/>,   color:"#f59e0b", value:`+${totalEarned}`,    label:t.totalXP || "Jami XP" },
              { icon:<LuTrophy size={20}/>, color:"#10b981", value:REFERRAL_XP,          label:t.perReferral || "Har biriga" },
            ].map((s,i) => (
              <div key={i} style={{ padding:"16px", borderRadius:14, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, textAlign:"center" }}>
                <div style={{ color:s.color, display:"flex", justifyContent:"center", marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Referral kod */}
          <div style={{ padding:"24px", borderRadius:16, background:"linear-gradient(135deg,#3b82f611,#8b5cf611)", border:"2px solid #3b82f644", marginBottom:20 }}>
            <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#6b7280", display:"flex", alignItems:"center", gap:6 }}>
              <LuGift size={14}/> {t.yourReferralCode || "Sizning referral kodingiz"}
            </p>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ flex:1, padding:"14px 20px", borderRadius:12, background:darkMode?"#0f172a":"#fff", border:"2px dashed #3b82f6", textAlign:"center" }}>
                <span style={{ fontSize:24, fontWeight:800, color:"#3b82f6", letterSpacing:3, fontFamily:"monospace" }}>
                  {referralCode || t.loading}
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <button onClick={copyCode}
                  style={{ padding:"10px 16px", borderRadius:10, border:"none", background:copied?"#10b981":"#3b82f6", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }}>
                  {copied ? <><LuCheck size={16}/> {t.copied || "Nusxa olindi"}</> : <><LuCopy size={16}/> {t.copy || "Nusxa olish"}</>}
                </button>
                <button onClick={shareCode}
                  style={{ padding:"10px 16px", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:"transparent", color:darkMode?"#f1f5f9":"#374151", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                  <LuShare2 size={16}/> {t.share || "Ulashish"}
                </button>
              </div>
            </div>

            <div style={{ display:"flex", gap:16, marginTop:16, flexWrap:"wrap" }}>
              {[
                { step:"1", text:t.referralStep1 || "Do'stlaringizga kodingizni yuboring" },
                { step:"2", text:t.referralStep2 || "Ular ro'yxatdan o'tganda kodni kiritsin" },
                { step:"3", text:t.referralStep3 || "Ikkalangiz ham XP yutib oling" },
              ].map((s,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:140 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#3b82f6", color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {s.step}
                  </div>
                  <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kod kiritish */}
          <div style={{ padding:"24px", borderRadius:16, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, marginBottom:24 }}>
            <p style={{ margin:"0 0 12px", fontSize:14, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:6 }}>
              <LuZap size={16} style={{ color:"#f59e0b" }}/> {t.enterFriendCode || "Do'stingiz kodi"}
            </p>

            {alreadyUsed ? (
              <div style={{ padding:"14px 16px", borderRadius:10, background:"#d1fae5", border:"1px solid #10b981", display:"flex", alignItems:"center", gap:10 }}>
                <LuCheck size={18} style={{ color:"#10b981", flexShrink:0 }}/>
                <p style={{ margin:0, fontSize:14, color:"#065f46", fontWeight:600 }}>
                  {t.alreadyUsedReferral || "Siz allaqachon kod ishlatdingiz"} +{REFERRED_XP} XP {t.earned || "yutdingiz"}
                </p>
              </div>
            ) : (
              <div style={{ display:"flex", gap:10 }}>
                <input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && applyCode()}
                  placeholder={t.referralCodePlaceholder || "Kodni kiriting"}
                  style={{ flex:1, padding:"12px 16px", borderRadius:10, border:`1px solid ${darkMode?"#334155":"#e5e7eb"}`, background:darkMode?"#0f172a":"#f8fafc", color:darkMode?"#f1f5f9":"#111", fontSize:14, outline:"none", fontFamily:"monospace", letterSpacing:2 }}
                />
                <button onClick={applyCode} disabled={applying || !inputCode.trim()}
                  style={{ padding:"12px 20px", borderRadius:10, border:"none", background:applying||!inputCode.trim()?"#94a3b8":"#10b981", color:"#fff", fontSize:14, fontWeight:700, cursor:applying||!inputCode.trim()?"default":"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                  {applying
                    ? <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
                    : <><LuCheck size={16}/> {t.apply || "Qo'llash"}</>
                  }
                </button>
              </div>
            )}

            <p style={{ margin:"10px 0 0", fontSize:12, color:"#6b7280", display: 'flex', alignItems: 'center', gap: 6 }}>
              <LuLightbulb size={14} /> {t.referralOnceInfo || "Faqat bir marta ishlatish mumkin"} +{REFERRED_XP} XP {t.youGet || "sizga"}, {t.friendGets || "do'stingizga"} +{REFERRAL_XP} XP.
            </p>
          </div>

          {/* Taklif qilinganlar */}
          {referredUsers.length > 0 && (
            <div>
              <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:darkMode?"#f1f5f9":"#111", display:"flex", alignItems:"center", gap:8 }}>
                <LuUsers size={18} style={{ color:"#3b82f6" }}/> {t.referredUsersTitle || "Taklif qilinganlar"} ({referredUsers.length})
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {referredUsers.map((u) => (
                  <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:12, background:darkMode?"#1e293b":"#fff", border:`1px solid ${darkMode?"#334155":"#e5e7eb"}` }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                      {(u.displayName || u.uid || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:13, fontWeight:600, color:darkMode?"#f1f5f9":"#111" }}>
                        {u.displayName || t.user || "Foydalanuvchi"}
                      </p>
                      <p style={{ margin:0, fontSize:11, color:"#6b7280" }}>
                        {u.usedAt?.toDate?.()?.toLocaleDateString("uz") || "вЂ”вЂќ"}
                      </p>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"#10b981", background:"#d1fae5", padding:"3px 10px", borderRadius:20 }}>
                      +{REFERRAL_XP} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
};

export default Friends;
