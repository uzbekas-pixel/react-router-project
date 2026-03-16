import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import {
  doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc
} from "firebase/firestore";

const WORDS_EN = [
  "hi", "hello", "good", "bad", "day", "night", "sun", "moon", "star", "sky",
"water", "food", "bread", "tea", "book", "pen", "table", "chair", "house", "school",
"friend", "boy", "girl", "city", "road", "tree", "flower", "green", "blue", "red",
"happy", "sad", "fast", "slow", "big", "small", "new", "old", "clean", "open",
"close", "start", "finish", "learn", "write", "read", "think", "dream", "walk", "run",
"play", "work", "rest", "laugh", "smile", "light", "dark", "sweet", "fresh", "warm",
"cool", "river", "mountain", "valley", "field", "forest", "cloud", "rain", "snow", "wind",
"storm", "summer", "winter", "spring", "autumn", "morning", "evening", "minute", "second", "future",
"past", "present", "energy", "power", "voice", "sound", "music", "story", "idea", "magic",
];

const WORDS_UZ = [
 "salom", "uka", "opa", "aka", "ota", "ona", "bobo", "buvi", "dost", "yigit",
"qiz", "bola", "odam", "inson", "xalq", "shahar", "qishloq", "kocha", "yo‘l", "uy",
"hovli", "deraza", "eshik", "stol", "stul", "divan", "kitob", "daftar", "qalam", "ruchka",
"sumka", "telefon", "kompyuter", "ekran", "klaviatura", "sichqoncha", "internet", "dastur", "oyna", "soat",
"vaqt", "tong", "ertalab", "tush", "kech", "kecha", "bugun", "ertaga", "hafta", "oy",
"yil", "bahor", "yoz", "kuz", "qish", "quyosh", "oy", "yulduz", "osmon", "bulut",
"yomgir", "qor", "shamol", "issiq", "sovuq", "iliq", "salqin", "non", "ovqat", "suv",
"choy", "sho'rva", "osh", "palov", "meva", "sabzi", "kartoshka", "piyoz", "guruch", "go'sht",
"tovuq", "baliq", "shakar", "tuz", "asal", "bog'", "daraxt", "gul", "barg", "mehnat",
"ish", "dam", "uyqu", "kulgi", "baxt", "quvonch", "sevgi", "do'stlik", "yordam", "rahmat",
"iltimos", "uzr", "haqiqat", "orzu", "maqsad", "yo'l", "tez", "sekin", "katta", "kichik",
"uzun", "qisqa", "yangi", "eski", "toza", "iflos", "och", "yopiq", "yaxshi", "yomon",
"oq", "qora", "qizil", "ko'k", "yashil", "sariq", "jigarrang", "kulrang", "oddiy", "qiziq",
];

const generateWords = (count = 40, lang = "en") => {
  const list = lang === "uz" ? WORDS_UZ : WORDS_EN;
  return Array.from({ length: count }, () =>
    list[Math.floor(Math.random() * list.length)]
  );
};

const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const MultiTyping = ({ darkMode, showToast }) => {
  const { user } = useAuth();
  const [screen, setScreen] = useState("lobby");
  const [roomId, setRoomId] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [input, setInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [lang, setLang] = useState("en");
  const inputRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const activeWordRef = useRef(null);
  const unsubRef = useRef(null);
  const countdownStarted = useRef(false);
  const startTimeRef = useRef(null);

  const isHost = roomData?.host?.uid === user?.uid;
  const myKey = isHost ? "host" : "guest";
  const opponentKey = isHost ? "guest" : "host";
  const myProgress = roomData?.[myKey]?.progress || 0;
  const opponentProgress = roomData?.[opponentKey]?.progress || 0;
  const myWpm = roomData?.[myKey]?.wpm || 0;
  const opponentWpm = roomData?.[opponentKey]?.wpm || 0;
  const opponentName = roomData?.[opponentKey]?.name || "Raqib";

  // Active word scroll
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current;
      const word = activeWordRef.current;
      if (word.offsetTop > container.scrollTop + container.clientHeight - 60) {
        container.scrollTo({ top: word.offsetTop - 60, behavior: "smooth" });
      }
    }
  }, [currentIndex]);

  const startCountdown = useCallback(() => {
    if (countdownStarted.current) return;
    countdownStarted.current = true;
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setGameStarted(true);
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, []);

  // Room listen
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "multiTyping", roomId), (snap) => {
      if (!snap.exists()) {
        setScreen("lobby");
        setRoomId("");
        showToast("Room o'chirildi!", "error");
        return;
      }
      const data = snap.data();
      setRoomData(data);

      if ((data.status === "countdown" || data.status === "playing") && screen !== "playing" && screen !== "finished") {
        setScreen("playing");
        setWords(data.words || []);
        startCountdown();
      }

      if (data.status === "finished" && screen !== "finished") {
        setScreen("finished");
        setGameStarted(false);
      }
    });
    unsubRef.current = unsub;
    return () => unsub();
  }, [roomId, screen, showToast, startCountdown]);

  // Room yaratish
  const createRoom = async () => {
    const id = generateRoomId();
    const wordsArr = generateWords(40, lang);
    await setDoc(doc(db, "multiTyping", id), {
      words: wordsArr,
      lang,
      status: "waiting",
      host: { uid: user.uid, name: user.displayName || user.email, progress: 0, wpm: 0, finished: false },
      guest: null,
      createdAt: new Date().toISOString(),
    });
    setRoomId(id);
    setScreen("waiting");
    showToast(`Room yaratildi: ${id}`, "success");
  };

  // Roomga qo'shilish
  const joinRoom = async () => {
    if (!joinInput.trim()) return;
    const id = joinInput.toUpperCase().trim();
    const snap = await getDoc(doc(db, "multiTyping", id));
    if (!snap.exists()) { showToast("Room topilmadi!", "error"); return; }
    const data = snap.data();
    if (data.guest) { showToast("Room to'liq!", "error"); return; }
    if (data.host?.uid === user.uid) { showToast("O'z roomingizga kira olmaysiz!", "error"); return; }

    await updateDoc(doc(db, "multiTyping", id), {
      guest: { uid: user.uid, name: user.displayName || user.email, progress: 0, wpm: 0, finished: false },
      status: "countdown",
    });
    setRoomId(id);
    setWords(data.words || []);
    setScreen("playing");
    startCountdown();
    showToast("Roomga qo'shildingiz!", "success");
  };

  // Typing
  const handleInput = async (e) => {
    if (!gameStarted || countdown !== null) return;
    if (screen !== "playing") return;

    const val = e.target.value;

    if (val.endsWith(" ")) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setInput("");

      const progress = Math.round((newIndex / words.length) * 100);
      const elapsed = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 60000
        : 1;
      const wpm = Math.round(newIndex / Math.max(elapsed, 0.01));

      await updateDoc(doc(db, "multiTyping", roomId), {
        [`${myKey}.progress`]: progress,
        [`${myKey}.wpm`]: wpm,
      });

      if (newIndex >= words.length) {
        await updateDoc(doc(db, "multiTyping", roomId), {
          [`${myKey}.finished`]: true,
          status: "finished",
        });
      }
    } else {
      setInput(val);
    }
  };

  // Chiqish
  const leaveRoom = async () => {
    if (roomId && isHost) {
      await deleteDoc(doc(db, "multiTyping", roomId));
    } else if (roomId) {
      await updateDoc(doc(db, "multiTyping", roomId), {
        status: "finished",
      }).catch(() => {});
    }
    if (unsubRef.current) unsubRef.current();
    countdownStarted.current = false;
    setScreen("lobby");
    setRoomId("");
    setRoomData(null);
    setInput("");
    setCurrentIndex(0);
    setGameStarted(false);
    setCountdown(null);
    setWords([]);
  };

  const getLetterClass = (wordIndex, letterIndex) => {
    if (wordIndex < currentIndex) return darkMode ? "text-gray-400" : "text-gray-400";
    if (wordIndex === currentIndex) {
      const typedLetter = input[letterIndex];
      if (typedLetter === undefined) return darkMode ? "text-white" : "text-gray-900";
      return typedLetter === words[wordIndex][letterIndex] ? "text-green-400" : "text-red-400";
    }
    return darkMode ? "text-gray-500" : "text-gray-400";
  };

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="w-full max-w-3xl">

        {/* LOBBY */}
        {screen === "lobby" && (
          <div className={`rounded-2xl p-8 shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <h1 className={`text-2xl font-extrabold mb-2 text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
              👥 Multiplayer Typing
            </h1>
            <p className={`text-sm text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Do'stingiz bilan raqobatlashing!
            </p>

            {/* Til tanlash */}
            <div className="flex justify-center gap-2 mb-6">
              {["en", "uz"].map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                    lang === l
                      ? "bg-blue-500 text-white"
                      : darkMode ? "bg-slate-700 text-gray-400 hover:bg-slate-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {l === "en" ? "🇬🇧 English" : "🇺🇿 O'zbek"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={createRoom}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition text-lg">
                🏠 Yangi room yaratish
              </button>
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
                <span className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>yoki</span>
                <div className={`flex-1 h-px ${darkMode ? "bg-slate-600" : "bg-gray-200"}`} />
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Room ID kiriting (masalan: ABC123)"
                  value={joinInput} onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()} maxLength={6}
                  className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition ${
                    darkMode ? "bg-slate-700 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
                  }`} />
                <button onClick={joinRoom}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition">
                  Kirish
                </button>
              </div>
              <p className={`text-xs text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                💡 Til faqat room yaratuvchi tanlaydi
              </p>
            </div>
          </div>
        )}

        {/* WAITING */}
        {screen === "waiting" && (
          <div className={`rounded-2xl p-8 shadow-xl text-center ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Raqib kutilmoqda...
            </h2>
            <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Do'stingizga shu kodni yuboring:
            </p>
            <p className={`text-xs mb-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {lang === "en" ? "🇬🇧 English" : "🇺🇿 O'zbek"} tili tanlangan
            </p>
            <div className={`text-4xl font-extrabold tracking-widest mb-6 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>
              {roomId}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(roomId); showToast("Nusxalandi!", "success"); }}
              className={`px-6 py-2 rounded-xl text-sm font-semibold mb-4 transition ${darkMode ? "bg-slate-700 text-gray-300 hover:bg-slate-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              📋 Nusxalash
            </button>
            <br />
            <button onClick={leaveRoom} className="text-red-400 text-sm hover:underline mt-2">
              Bekor qilish
            </button>
          </div>
        )}

        {/* PLAYING */}
        {screen === "playing" && words.length > 0 && (
          <>
            {countdown !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="text-8xl font-extrabold text-white animate-ping">{countdown}</div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                👥 Raqobat • {roomData?.lang === "uz" ? "🇺🇿" : "🇬🇧"}
              </h2>
              <button onClick={leaveRoom} className="text-red-400 text-sm hover:underline">Chiqish</button>
            </div>

            {/* Progress barlar */}
            <div className={`rounded-2xl p-4 mb-4 shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>👤 Siz</span>
                  <span className="text-blue-400">{myWpm} WPM • {myProgress}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${myProgress}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>👤 {opponentName}</span>
                  <span className="text-green-400">{opponentWpm} WPM • {opponentProgress}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-gray-100"}`}>
                  <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${opponentProgress}%` }} />
                </div>
              </div>
            </div>

            {/* So'zlar */}
            <div ref={wordsContainerRef} onClick={() => inputRef.current?.focus()}
              className={`relative h-36 overflow-hidden rounded-2xl p-4 mb-4 cursor-text select-none shadow ${darkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className="flex flex-wrap gap-2">
                {words.map((word, wi) => (
                  <span key={wi} ref={wi === currentIndex ? activeWordRef : null}
                    className={`relative text-lg font-mono px-0.5 rounded ${
                      wi === currentIndex ? darkMode ? "bg-slate-700" : "bg-blue-50 ring-2 ring-blue-400" : ""
                    }`}>
                    {word.split("").map((letter, li) => (
                      <span key={li} className={`transition-colors ${getLetterClass(wi, li)}`}>
                        {wi === currentIndex && li === input.length && (
                          <span className="absolute inline-block w-0.5 h-5 bg-blue-400 animate-pulse -ml-0.5" />
                        )}
                        {letter}
                      </span>
                    ))}
                    {wi === currentIndex && input.length > word.length && (
                      <span className="text-red-400">{input.slice(word.length)}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <input ref={inputRef} value={input} onChange={handleInput}
              autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
              className="opacity-0 absolute pointer-events-none" />
          </>
        )}

        {/* FINISHED */}
        {screen === "finished" && (
          <div className={`rounded-2xl p-8 shadow-xl text-center ${darkMode ? "bg-slate-800" : "bg-white"}`}>
            {(() => {
              const iWon = myProgress >= opponentProgress;
              return (
                <>
                  <div className="text-5xl mb-4">{iWon ? "🏆" : "😢"}</div>
                  <h2 className={`text-2xl font-extrabold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {iWon ? "G'olib bo'ldingiz!" : "Yutqazdingiz!"}
                  </h2>
                  <p className={`text-sm mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {iWon ? "Ajoyib! Siz tezroq yozdingiz!" : "Keyingi safar omad!"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                      <div className="text-3xl font-extrabold text-blue-400">{myWpm}</div>
                      <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Sizning WPM</div>
                    </div>
                    <div className={`rounded-xl p-4 ${darkMode ? "bg-slate-700" : "bg-gray-50"}`}>
                      <div className="text-3xl font-extrabold text-green-400">{opponentWpm}</div>
                      <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{opponentName} WPM</div>
                    </div>
                  </div>
                  <button onClick={leaveRoom}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition">
                    🔄 Qayta o'ynash
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiTyping;