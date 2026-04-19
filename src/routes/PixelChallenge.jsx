import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import {
  collection, getDocs, addDoc, doc,
  serverTimestamp, runTransaction, query, orderBy, where
} from "firebase/firestore";
import { 
  LuAward, LuCoins, LuClock3, LuLink2, 
  LuFileCode2, LuUser, LuHeart, LuSend, LuCheck, LuInfo,
  LuClock
} from "react-icons/lu";

const formatCountdown = (ms, t) => {
  if (ms <= 0) return "00:00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const pad = (num) => String(num).padStart(2, '0');

  if (days > 0) return `${days} ${t.days} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const PixelChallenge = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("task"); 

  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);

  const [subForm, setSubForm] = useState({ title: "", repoUrl: "", demoUrl: "" });

  const fetchChallengeData = useCallback(async () => {
    try {
      const qC = query(collection(db, "challenges"), where("status", "==", "active"), orderBy("createdAt", "desc"));
      const snapC = await getDocs(qC);
      
      if (!snapC.empty) {
        const cData = { id: snapC.docs[0].id, ...snapC.docs[0].data() };
        setCurrentChallenge(cData);
        
        if (cData.endDate) {
          const endMs = cData.endDate.toMillis();
          setEndTime(endMs);
          setTimeLeft(endMs - Date.now());
        }

        const qS = query(collection(db, "challenge_submissions"), 
          where("challengeId", "==", cData.id), 
          orderBy("votesCount", "desc"), 
          orderBy("submittedAt", "asc")
        );
        const snapS = await getDocs(qS);
        const fetchedSubs = snapS.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubmissions(fetchedSubs);

        if (user) {
          const mySub = fetchedSubs.find(s => s.userId === user.uid);
          setMySubmission(mySub || null);
        }
      } else {
        setCurrentChallenge(null);
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Challenge yuklash xatosi:", err);
      showToast?.(t.challengeLoadError, "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  useEffect(() => {
    if (!endTime) return;
    
    const intervalId = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(intervalId);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [endTime]);

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!user || !currentChallenge) return;
    if (timeLeft <= 0) return showToast?.(t.timeExpired, "warning");
    if (!subForm.title || !subForm.repoUrl) return showToast?.(t.titleRepoRequired, "warning");

    setActionLoading("submit");
    try {
      const newSubData = {
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        userId: user.uid,
        userName: user.displayName || t.unknownStudent,
        title: subForm.title,
        repoUrl: subForm.repoUrl,
        demoUrl: subForm.demoUrl,
        votes: [], 
        votesCount: 0,
        submittedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "challenge_submissions"), newSubData);
      setMySubmission({ id: docRef.id, ...newSubData });
      showToast?.(t.submissionSuccess, "success");
      fetchChallengeData(); 
    } catch (err) {
        console.error("Topshirish xatosi:", err);
      showToast?.(t.submissionError, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVote = async (subId) => {
    if (!user) return showToast?.(t.loginToVote, "warning");
    if (timeLeft <= 0) return showToast?.(t.challengeEndedVote, "warning");

    const targetSub = submissions.find(s => s.id === subId);
    if (!targetSub) return;
    if (targetSub.userId === user.uid) return showToast?.(t.cantVoteOwn, "warning");
    if (targetSub.votes && targetSub.votes.includes(user.uid)) return showToast?.(t.alreadyVoted, "warning");

    setActionLoading(`vote_${subId}`);
    try {
      await runTransaction(db, async (transaction) => {
        const subRef = doc(db, "challenge_submissions", subId);
        const subSnap = await transaction.get(subRef);
        if (!subSnap.exists()) throw new Error("SUB_NOT_FOUND");
        
        const currentVotes = subSnap.data().votes || [];
        const currentCount = subSnap.data().votesCount || 0;

        const adminUid = "SIZNING_ADMIN_UID_INGIZ_SHU_YERGA"; 
        const pointsToAdd = (user.uid === adminUid) ? 100 : 1;

        transaction.update(subRef, { 
          votes: [...currentVotes, user.uid],
          votesCount: currentCount + pointsToAdd
        });
      });
      showToast?.(t.voteAccepted, "success");
      fetchChallengeData(); 
    } catch (err) {
        console.error("Ovoz berish xatosi:", err);
      showToast?.(t.voteError, "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32 gap-4">
       <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
       <p className="text-slate-500 text-sm md:text-base font-bold tracking-widest uppercase">{t.challengeLoading}</p>
    </div>
  );

  if (!currentChallenge) return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-16 text-center ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        <LuAward className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 opacity-20" />
        <h2 className="text-xl md:text-2xl font-black mb-2">{t.noChallenges}</h2>
        <p className="text-sm md:text-base">{t.newHackathonsSoon}</p>
    </div>
  );

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 transition-colors duration-300 ${darkMode ? "text-white" : "text-slate-900"}`}>
      
      {/* в”Ђв”Ђ HEADER (Responsive) в”Ђв”Ђ */}
      <div direction="up">
        <div className="flex flex-col md:flex-row gap-5 md:gap-6 justify-between items-start md:items-center mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-purple-100"} shrink-0`}>
                <LuAward className="text-purple-600 w-8 h-8 md:w-9 md:h-9"/>
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2 md:gap-3">
                    Pixel <span className="text-purple-600">Challenge</span>
                </h2>
                <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">{t.challengeSubtitle}</p>
            </div>
          </div>
          <div className={`w-full md:w-auto px-4 md:px-5 py-3 md:py-3.5 rounded-2xl border flex items-center gap-3 shadow-lg transition-colors duration-300 ${
            darkMode ? "bg-slate-900/50 border-purple-600/30" : "bg-purple-50 border-purple-200"
          }`}>
            <LuCoins className="text-amber-500 shrink-0 w-6 h-6 md:w-7 md:h-7"/>
            <div>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{t.prizePool}</p>
              <p className="text-lg md:text-xl font-black text-amber-500 leading-none">{currentChallenge.prize} <span className="text-xs md:text-sm">{t.coins}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* в”Ђв”Ђ VAZIFA DETALLARI (Responsive) в”Ђв”Ђ */}
      <div direction="up" delay={100}>
        <div className={`p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] border mb-8 md:mb-10 transition-colors duration-300 ${
            darkMode ? "bg-slate-900/60 border-white/10 shadow-2xl shadow-black/50" : "bg-white border-slate-100 shadow-2xl shadow-purple-200/20"
        }`}>
            <div className={`flex flex-col lg:flex-row gap-6 md:gap-8 justify-between items-start lg:items-center mb-6 md:mb-8 pb-6 md:pb-8 border-b transition-colors ${darkMode ? "border-white/10" : "border-slate-100"}`}>
                <div className="flex-1">
                    <span className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[9px] md:text-[10px] font-black uppercase flex items-center gap-1.5 w-max mb-3 md:mb-4">
                        <LuFileCode2 size={14} /> {t.hackathon}
                    </span>
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-2 md:mb-3 leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>{currentChallenge.title}</h1>
                    <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">{currentChallenge.desc}</p>
                </div>
                
                <div className={`w-full lg:w-auto px-6 md:px-8 py-5 md:py-6 rounded-2xl border text-center min-w-0 md:min-w-[200px] shrink-0 transition-colors duration-300 ${
                    timeLeft <= 0 ? "border-red-500 bg-red-500/10 text-red-500" : (darkMode ? "bg-slate-800 border-white/5" : "bg-slate-50 border-slate-100")
                }`}>
                    <LuClock3 className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50"/>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-wider opacity-70 mb-1">{t.timeRemaining}</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-black font-mono leading-none">
                        {timeLeft <= 0 ? t.ended : formatCountdown(timeLeft, t)}
                    </p>
                </div>
            </div>

            {/* TABLAR (Mobil uchun moslashgan) */}
            <div className={`flex flex-col sm:flex-row gap-2 mb-6 md:mb-8 p-1.5 rounded-2xl border backdrop-blur-md transition-colors duration-300 ${
              darkMode ? "bg-slate-900 border-white/5" : "bg-slate-100 border-slate-200"
            }`}>
              <button onClick={() => setActiveTab("task")} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 md:px-6 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${ activeTab === "task" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-500 hover:text-purple-600 hover:bg-slate-800/5" }`}>
                 <LuAward size={16} className="md:w-5 md:h-5"/> {t.taskAndSubmit}
              </button>
              <button onClick={() => setActiveTab("submissions")} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 md:px-6 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${ activeTab === "submissions" ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" : "text-slate-500 hover:text-purple-600 hover:bg-slate-800/5" }`}>
                 <LuFileCode2 size={16} className="md:w-5 md:h-5"/> {t.studentWorks} ({submissions.length})
              </button>
            </div>

            {/* VAZIFA TAB (Responsive Grid) */}
            {activeTab === "task" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    <div className={`prose prose-sm md:prose-base max-w-none transition-colors duration-300 ${darkMode ? "prose-invert text-slate-300" : "text-slate-700"}`}>
                        <h4 className={`text-lg md:text-xl font-black mb-3 md:mb-4 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{t.challengeRules}</h4>
                        <ul className="space-y-2.5 md:space-y-3 list-decimal list-inside font-medium text-sm md:text-base">
                            <li>{t.rule1a} <span className="font-bold text-purple-500">Tailwind CSS</span> {t.rule1b}</li>
                            <li>{t.rule2a} <span className="font-bold text-blue-500">React/JS</span> {t.rule2b}</li>
                            <li>{t.rule3}</li>
                            <li>{t.rule4}</li>
                            <li>{t.rule5a} <span className="font-bold">{t.rule5b}</span> {t.rule5c}</li>
                        </ul>
                    </div>
                    
                    {/* TOPSHIRISH FORMASI (Responsive) */}
                    <div>
                    {timeLeft <= 0 ? (
                        <div className={`p-6 md:p-8 text-center rounded-2xl border font-bold text-red-500 text-sm md:text-base ${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"}`}>
                            <LuClock className="inline mr-2" size={20} /> {t.challengeEndedWait}
                        </div>
                    ) : mySubmission ? (
                        <div className={`p-6 md:p-8 rounded-2xl md:rounded-3xl border text-center transition-colors duration-300 ${ darkMode ? "bg-emerald-950/30 border-emerald-500/40" : "bg-emerald-50 border-emerald-200 shadow-xl" }`}>
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-4 md:mb-5 border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                                <LuCheck className="w-8 h-8 md:w-9 md:h-9" />
                            </div>
                            <h4 className="text-lg md:text-xl font-black mb-1 md:mb-2 text-emerald-500">{t.submissionReceived}</h4>
                            <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6 px-2">{t.projectName}: "{mySubmission.title}"</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3">
                                <a href={mySubmission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 text-xs md:text-sm font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-lg w-full sm:w-auto"><LuFileCode2 size={16}/> {t.viewRepo}</a>
                                {mySubmission.demoUrl && <a href={mySubmission.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 text-xs md:text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg w-full sm:w-auto"><LuLink2 size={16}/> {t.viewDemo}</a>}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitWork} className={`p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-colors duration-300 ${darkMode ? "bg-slate-900 border-white/5 shadow-2xl shadow-black/50" : "bg-slate-50 border-slate-100 shadow-xl"}`}>
                            <h4 className={`text-lg md:text-xl font-black mb-5 md:mb-6 transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{t.submitYourWork}</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">{t.appName} *</label>
                                    <input required type="text" value={subForm.title} onChange={e => setSubForm({...subForm, title: e.target.value})} placeholder={t.appNamePlaceholder} className={`w-full p-3 md:p-4 rounded-xl border text-sm outline-none transition-all duration-300 ${darkMode ? "bg-slate-800 border-white/10 text-white focus:border-purple-600" : "bg-white border-slate-200 focus:border-purple-600 text-slate-900"}`} />
                                </div>
                                <div>
                                    <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">{t.codeLink} *</label>
                                    <div className="relative">
                                        <LuFileCode2 className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input required type="url" value={subForm.repoUrl} onChange={e => setSubForm({...subForm, repoUrl: e.target.value})} placeholder={t.codeLinkPlaceholder} className={`w-full pl-10 md:pl-12 p-3 md:p-4 rounded-xl border text-sm outline-none transition-all duration-300 ${darkMode ? "bg-slate-800 border-white/10 text-white focus:border-purple-600" : "bg-white border-slate-200 focus:border-purple-600 text-slate-900"}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5 md:mb-2 block">{t.liveDemo}</label>
                                    <div className="relative">
                                        <LuLink2 className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="url" value={subForm.demoUrl} onChange={e => setSubForm({...subForm, demoUrl: e.target.value})} placeholder={t.liveDemoPlaceholder} className={`w-full pl-10 md:pl-12 p-3 md:p-4 rounded-xl border text-sm outline-none transition-all duration-300 ${darkMode ? "bg-slate-800 border-white/10 text-white focus:border-purple-600" : "bg-white border-slate-200 focus:border-purple-600 text-slate-900"}`} />
                                    </div>
                                </div>
                                <button type="submit" disabled={actionLoading === "submit"} className="w-full py-3.5 md:py-4 mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-purple-600/30 transition-all text-sm flex items-center justify-center gap-2 active:scale-95">
                                    {actionLoading === "submit" ? <LuInfo className="animate-spin" size={18} /> : <><LuSend size={18} /> {t.submitTask}</>}
                                </button>
                            </div>
                        </form>
                    )}
                    </div>
                </div>
            )}
            {/* SUBMISSIONS TAB (Responsive Grid) */}
            {activeTab === "submissions" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {submissions.length === 0 && (
                        <div className="col-span-full py-12 md:py-16 text-center text-slate-500 text-sm md:text-base">
                            {t.noSubmissionsYet}
                        </div>
                    )}
                    {submissions.map((sub, index) => {
                        const hasVoted = sub.votes && sub.votes.includes(user?.uid);
                        const isOwner = sub.userId === user?.uid;

                        return (
                        <div key={sub.id} className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full ${
                          darkMode ? "bg-slate-900 border-white/5 hover:border-purple-600/50" : "bg-white border-slate-100 hover:border-purple-400"
                        }`}>
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase flex items-center gap-1 md:gap-1.5 transition-colors ${
                                    index === 0 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                                    index === 1 ? "bg-slate-300/20 text-slate-400 border border-slate-400/20" :
                                    index === 2 ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                    (darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-500")
                                }`}>
                                    {index === 0 ? <LuAward size={12} className="md:w-[14px] md:h-[14px]"/> : ""}{index + 1}{t.placeSuffix}
                                </span>
                                <div className="flex items-center gap-1 md:gap-1.5 font-black text-red-500 bg-red-500/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm border border-red-500/20">
                                    <LuHeart size={14} className={`md:w-4 md:h-4 ${hasVoted ? "fill-red-500" : ""}`}/> {sub.votesCount || 0}
                                </div>
                            </div>
                            <h3 className={`text-base md:text-lg font-black leading-tight mb-3 md:mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>{sub.title}</h3>
                            <div className="flex items-center gap-2 mb-5 md:mb-6">
                               <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                                   <LuUser className="text-slate-500" size={12} md:size={14}/>
                               </div>
                               <span className="text-[11px] md:text-xs font-bold text-slate-500 line-clamp-1">{sub.userName} {isOwner ? `(${t.you})` : ""}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-5 md:mb-6 mt-auto">
                                <a href={sub.repoUrl} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-bold py-2.5 md:py-3 rounded-xl transition-colors ${darkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                                    <LuFileCode2 size={14} className="md:w-4 md:h-4"/> {t.repo}
                                </a>
                                {sub.demoUrl && (
                                    <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-bold py-2.5 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                                        <LuLink2 size={14} className="md:w-4 md:h-4"/> {t.demo}
                                    </a>
                                )}
                            </div>

                            {!isOwner && timeLeft > 0 && (
                                <button onClick={() => handleVote(sub.id)} disabled={actionLoading === `vote_${sub.id}` || hasVoted} className={`w-full py-2.5 md:py-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 border transition-all active:scale-95 disabled:opacity-100 ${hasVoted ? "bg-red-500/10 text-red-500 border-red-500/30 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/25"}`}>
                                    {actionLoading === `vote_${sub.id}` ? <LuInfo className="animate-spin" size={16} /> : hasVoted ? <><LuCheck size={16} /> {t.voted}</> : <><LuHeart size={16} /> {t.vote}</>}
                                </button>
                            )}
                        </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PixelChallenge;
