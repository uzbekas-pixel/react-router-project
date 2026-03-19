import { useState } from "react";
import TypingGame from "./TypingGame";
import MultiTyping from "./MultiTyping";
import SnakeGame from "../components/games/SnakeGame";
import FlappyBird from "../components/games/FlappyBird";
import TicTacToe from "../components/games/TicTacToe";
import Tetris from "../components/games/Tetris";
import Game2048 from "../components/games/Game2048";
import Wordle from "../components/games/Wordle";
import MemoryCard from "../components/games/MemoryCard";
import { useLang } from "../context/useLang";

const BackButton = ({ onClick, darkMode, t }) => (
  <button onClick={onClick}
    className={`fixed top-8 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition mt-2 ${
      darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-white text-gray-700 hover:bg-gray-100 shadow"
    }`}>
    {t.back}
  </button>
);

// ─── SVG illyustratsiyalar ────────────────────────────────────────────────────
const SnakeSVG = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect width="200" height="130" fill="#052e16"/>
    {[20,40,60,80,100,120,140,160,180].map(x=>[20,40,60,80,100,120].map(y=>(
      <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#166534" opacity="0.5"/>
    )))}
    {/* Snake */}
    {[[60,50],[80,50],[100,50],[120,50],[120,70],[100,70],[80,70]].map(([x,y],i)=>(
      <rect key={i} x={x+1} y={y+1} width="17" height="17" rx="3" fill="#22c55e"/>
    ))}
    {/* Head */}
    <rect x="41" y="51" width="17" height="17" rx="4" fill="#4ade80"/>
    <circle cx="47" cy="57" r="2" fill="#052e16"/>
    <circle cx="54" cy="57" r="2" fill="#052e16"/>
    <ellipse cx="49" cy="64" rx="4" ry="2" fill="#16a34a"/>
    {/* Apple */}
    <circle cx="165" cy="35" r="9" fill="#ef4444"/>
    <path d="M165 25 Q168 20 172 22" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="165" cy="35" r="4" fill="#fca5a5" opacity="0.4"/>
    {/* Score */}
    <rect x="5" y="110" width="190" height="16" rx="4" fill="#14532d"/>
    <text x="100" y="122" textAnchor="middle" fontSize="9" fill="#86efac" fontWeight="700">SCORE: 240</text>
  </svg>
);

const FlappySVG = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0ea5e9"/>
        <stop offset="100%" stopColor="#38bdf8"/>
      </linearGradient>
    </defs>
    <rect width="200" height="130" fill="url(#sky)"/>
    <ellipse cx="50" cy="28" rx="28" ry="12" fill="white" opacity="0.85"/>
    <ellipse cx="63" cy="23" rx="18" ry="10" fill="white" opacity="0.85"/>
    <ellipse cx="155" cy="35" rx="22" ry="10" fill="white" opacity="0.7"/>
    <rect x="0" y="110" width="200" height="20" fill="#65a30d"/>
    <rect x="0" y="110" width="200" height="5" fill="#4d7c0f"/>
    {/* Pipes */}
    <rect x="125" y="0" width="22" height="58" rx="2" fill="#16a34a"/>
    <rect x="121" y="51" width="30" height="9" rx="2" fill="#15803d"/>
    <rect x="125" y="78" width="22" height="50" rx="2" fill="#16a34a"/>
    <rect x="121" y="75" width="30" height="9" rx="2" fill="#15803d"/>
    {/* Bird */}
    <circle cx="70" cy="58" r="13" fill="#fbbf24"/>
    <ellipse cx="70" cy="58" rx="13" ry="10" fill="#fbbf24"/>
    <circle cx="77" cy="53" r="5" fill="white"/>
    <circle cx="79" cy="53" r="3" fill="#1e293b"/>
    <circle cx="80" cy="52" r="1" fill="white"/>
    <polygon points="83,59 94,56 83,62" fill="#f97316"/>
    <ellipse cx="62" cy="63" rx="9" ry="5" fill="#f59e0b" transform="rotate(-15 62 63)"/>
    {/* Score */}
    <text x="100" y="20" textAnchor="middle" fontSize="14" fill="white" fontWeight="800" opacity="0.9">3</text>
  </svg>
);

const TicSVG = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
    <rect width="200" height="130" fill="#1e1b4b"/>
    {/* Stars bg */}
    {[[15,10],[45,20],[80,8],[130,15],[170,25],[20,50],[160,60],[100,5]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.4"/>
    ))}
    {/* Grid */}
    <line x1="80" y1="18" x2="80" y2="112" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
    <line x1="120" y1="18" x2="120" y2="112" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
    <line x1="30" y1="50" x2="170" y2="50" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
    <line x1="30" y1="80" x2="170" y2="80" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
    {/* X */}
    <line x1="40" y1="25" x2="68" y2="45" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="68" y1="25" x2="40" y2="45" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="130" y1="57" x2="158" y2="75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="158" y1="57" x2="130" y2="75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="40" y1="87" x2="68" y2="107" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    <line x1="68" y1="87" x2="40" y2="107" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round"/>
    {/* O */}
    <circle cx="100" cy="35" r="13" fill="none" stroke="#a78bfa" strokeWidth="3.5"/>
    <circle cx="55" cy="65" r="13" fill="none" stroke="#a78bfa" strokeWidth="3.5"/>
    <circle cx="145" cy="96" r="13" fill="none" stroke="#a78bfa" strokeWidth="3.5"/>
    {/* Win */}
    <line x1="30" y1="65" x2="170" y2="65" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.5" strokeDasharray="5,3"/>
  </svg>
);

const TetrisSVG = () => {
  const blocks = [
    {x:5,y:90,c:"#06b6d4"},{x:25,y:90,c:"#06b6d4"},{x:45,y:90,c:"#22c55e"},{x:65,y:90,c:"#22c55e"},
    {x:85,y:90,c:"#eab308"},{x:105,y:90,c:"#eab308"},{x:125,y:90,c:"#ef4444"},{x:145,y:90,c:"#ef4444"},{x:165,y:90,c:"#a855f7"},
    {x:5,y:70,c:"#a855f7"},{x:25,y:70,c:"#a855f7"},{x:45,y:70,c:"#06b6d4"},{x:65,y:70,c:"#f97316"},{x:85,y:70,c:"#22c55e"},
    {x:5,y:50,c:"#3b82f6"},{x:25,y:50,c:"#3b82f6"},{x:45,y:50,c:"#ef4444"},
    {x:5,y:110,c:"#06b6d4"},{x:25,y:110,c:"#22c55e"},{x:45,y:110,c:"#22c55e"},{x:65,y:110,c:"#eab308"},
    {x:85,y:110,c:"#eab308"},{x:105,y:110,c:"#a855f7"},{x:125,y:110,c:"#3b82f6"},{x:145,y:110,c:"#3b82f6"},{x:165,y:110,c:"#06b6d4"},
  ];
  return (
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <rect width="200" height="130" fill="#0f172a"/>
      {blocks.map((b,i)=>(
        <g key={i}>
          <rect x={b.x+1} y={b.y+1} width="18" height="18" rx="2" fill={b.c}/>
          <rect x={b.x+1} y={b.y+1} width="18" height="4" rx="1" fill="rgba(255,255,255,0.2)"/>
        </g>
      ))}
      {/* Falling I-piece */}
      {[0,1,2].map(i=>(
        <g key={`f${i}`}>
          <rect x="156" y={i*20+5} width="18" height="18" rx="2" fill="#06b6d4" opacity="0.85"/>
          <rect x="156" y={i*20+5} width="18" height="4" rx="1" fill="rgba(255,255,255,0.25)"/>
        </g>
      ))}
      <rect x="156" y="65" width="18" height="18" rx="2" fill="#06b6d4" opacity="0.3" strokeDasharray="3,2" stroke="#06b6d4" strokeWidth="1"/>
    </svg>
  );
};

const G2048SVG = () => {
  const grid = [
    [{n:"2",c:"#f1f5f9"},{n:"32",c:"#fb923c"},{n:"8",c:"#f97316"},{n:"16",c:"#ea580c"}],
    [{n:"64",c:"#dc2626"},{n:"128",c:"#fbbf24"},{n:"256",c:"#f59e0b"},{n:"512",c:"#d97706"}],
    [{n:"4",c:"#fde68a"},{n:"1024",c:"#10b981"},{n:"2048",c:"#6366f1"},{n:"",c:"#334155"}],
    [{n:"",c:"#334155"},{n:"2",c:"#f1f5f9"},{n:"4",c:"#fde68a"},{n:"",c:"#334155"}],
  ];
  return (
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <rect width="200" height="130" fill="#1e293b"/>
      <rect x="8" y="8" width="184" height="114" rx="8" fill="#0f172a"/>
      {grid.map((row,ri)=>row.map((cell,ci)=>(
        <g key={`${ri}-${ci}`}>
          <rect x={ci*44+12} y={ri*26+12} width="40" height="22" rx="4" fill={cell.c}/>
          {cell.n && (
            <text x={ci*44+32} y={ri*26+27} textAnchor="middle"
              fontSize={cell.n.length>3?"7":cell.n.length>2?"8":"10"}
              fontWeight="800"
              fill={["#f1f5f9","#fde68a"].includes(cell.c)?"#1e293b":"#fff"}>
              {cell.n}
            </text>
          )}
        </g>
      )))}
      <rect x="8*3+12" y="2*26+12" width="40" height="22" rx="4" fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.9"/>
    </svg>
  );
};

const WordleSVG = () => {
  const rows = [
    [{l:"C",s:"a"},{l:"R",s:"a"},{l:"A",s:"c"},{l:"N",s:"a"},{l:"E",s:"a"}],
    [{l:"G",s:"a"},{l:"R",s:"p"},{l:"A",s:"c"},{l:"C",s:"a"},{l:"E",s:"a"}],
    [{l:"G",s:"c"},{l:"R",s:"c"},{l:"A",s:"c"},{l:"C",s:"c"},{l:"E",s:"c"}],
    [{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"}],
    [{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"},{l:"",s:"e"}],
  ];
  const sc = {c:"#16a34a",p:"#ca8a04",a:"#4b5563",e:"#1f2937"};
  return (
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <rect width="200" height="130" fill="#111827"/>
      <text x="100" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">WORDLE</text>
      <line x1="20" y1="20" x2="180" y2="20" stroke="#374151" strokeWidth="0.5"/>
      {rows.map((row,ri)=>row.map((cell,ci)=>(
        <g key={`${ri}-${ci}`}>
          <rect x={ci*34+15} y={ri*22+24} width="28" height="20" rx="3" fill={sc[cell.s]}/>
          {cell.l && (
            <text x={ci*34+29} y={ri*22+38} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">{cell.l}</text>
          )}
        </g>
      )))}
    </svg>
  );
};

const MemorySVG = () => {
  const cards = [
    {x:8,y:8,e:"⭐",f:true},{x:58,y:8,e:"🎮",f:false},{x:108,y:8,e:"⭐",f:true},{x:158,y:8,e:"🔥",f:false},
    {x:8,y:65,e:"🎯",f:false},{x:58,y:65,e:"🎮",f:true},{x:108,y:65,e:"🎯",f:true},{x:158,y:65,e:"🔥",f:true},
  ];
  return (
    <svg viewBox="0 0 210 130" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
      <rect width="210" height="130" fill="#1e0a3c"/>
      {cards.map((c,i)=>(
        <g key={i}>
          {c.f ? (
            <>
              <rect x={c.x} y={c.y} width="44" height="52" rx="6" fill="#7c3aed"/>
              <rect x={c.x} y={c.y} width="44" height="52" rx="6" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
              <text x={c.x+22} y={c.y+33} textAnchor="middle" fontSize="20">{c.e}</text>
            </>
          ) : (
            <>
              <rect x={c.x} y={c.y} width="44" height="52" rx="6" fill="#3b0764"/>
              <line x1={c.x+8} y1={c.y+8} x2={c.x+36} y2={c.y+44} stroke="#6d28d9" strokeWidth="2"/>
              <line x1={c.x+36} y1={c.y+8} x2={c.x+8} y2={c.y+44} stroke="#6d28d9" strokeWidth="2"/>
            </>
          )}
        </g>
      ))}
      <text x="105" y="122" textAnchor="middle" fontSize="9" fill="#a78bfa" fontWeight="700">4 juft topildi ✓</text>
    </svg>
  );
};

const SVGS = { snake:<SnakeSVG/>, flappy:<FlappySVG/>, tictactoe:<TicSVG/>, tetris:<TetrisSVG/>, "2048":<G2048SVG/>, wordle:<WordleSVG/>, memory:<MemorySVG/> };
const COLORS = { snake:"#16a34a", flappy:"#d97706", tictactoe:"#7c3aed", tetris:"#dc2626", "2048":"#0891b2", wordle:"#059669", memory:"#9333ea" };

const GameCard = ({ game, onClick, t }) => {
  const [hovered, setHovered] = useState(false);
  const color = COLORS[game.id];
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative", borderRadius:18, overflow:"hidden",
        border:`2px solid ${hovered ? color : "rgba(255,255,255,0.05)"}`,
        boxShadow: hovered ? `0 16px 40px ${color}55` : "0 4px 14px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition:"all 0.25s ease", cursor:"pointer", width:"100%",
        textAlign:"left", display:"block", background:"#0f172a",
      }}>
      <div style={{ width:"100%", height:140, overflow:"hidden", transform: hovered?"scale(1.05)":"scale(1)", transition:"transform 0.35s ease" }}>
        {SVGS[game.id]}
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:90, background:"linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px 14px", display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
            <span style={{ fontSize:15 }}>{game.icon}</span>
            <span style={{ color:"#fff", fontWeight:800, fontSize:14 }}>{game.title}</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:11, margin:0 }}>{game.desc}</p>
        </div>
        <span style={{ background:color, color:"#fff", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:20, whiteSpace:"nowrap", flexShrink:0, marginLeft:8 }}>
          ▶ {t.play}
        </span>
      </div>
    </button>
  );
};

const Games = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [screen, setScreen] = useState("home");
  const [tab, setTab] = useState("typing");

  const GAMES = [
    { id:"snake",     icon:"🐍", title:"Snake",       desc:t.snakeDesc  },
    { id:"flappy",    icon:"🐦", title:"Flappy Bird",  desc:t.flappyDesc },
    { id:"tictactoe", icon:"❌", title:"Tic-Tac-Toe",  desc:t.ticDesc    },
    { id:"tetris",    icon:"🧱", title:"Tetris",       desc:t.tetrisDesc },
    { id:"2048",      icon:"🔢", title:"2048",         desc:"Raqamlarni birlashtiring" },
    { id:"wordle",    icon:"🔤", title:"Wordle",       desc:"So'zni toping" },
    { id:"memory",    icon:"🧠", title:"Memory Card",  desc:"Eslab qolish o'yini" },
  ];

  if (screen==="snake")     return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><SnakeGame darkMode={darkMode}/></div></div>;
  if (screen==="flappy")    return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><FlappyBird darkMode={darkMode}/></div></div>;
  if (screen==="tictactoe") return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><TicTacToe darkMode={darkMode}/></div></div>;
  if (screen==="tetris")    return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><Tetris darkMode={darkMode}/></div></div>;
  if (screen==="2048")      return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><Game2048 darkMode={darkMode}/></div></div>;
  if (screen==="wordle")    return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><Wordle darkMode={darkMode}/></div></div>;
  if (screen==="memory")    return <div className="page-transition"><BackButton onClick={()=>setScreen("home")} darkMode={darkMode} t={t}/><div className="pt-12"><MemoryCard darkMode={darkMode}/></div></div>;

  return (
    <div className={`page-transition min-h-[calc(100vh-64px)] px-4 py-6 mt-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <h1 className={`text-2xl font-extrabold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.gamesTitle}</h1>
      <div className={`rounded-2xl overflow-hidden shadow mb-8 ${darkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className={`flex border-b ${darkMode ? "border-slate-700" : "border-gray-200"}`}>
          <button onClick={()=>setTab("typing")} className={`flex-1 py-3 text-sm font-semibold transition ${tab==="typing"?"text-blue-500 border-b-2 border-blue-500":darkMode?"text-gray-500":"text-gray-400"}`}>⌨️ {t.typingTitle}</button>
          <button onClick={()=>setTab("multi")}  className={`flex-1 py-3 text-sm font-semibold transition ${tab==="multi"?"text-blue-500 border-b-2 border-blue-500":darkMode?"text-gray-500":"text-gray-400"}`}>{t.multiTitle}</button>
        </div>
        <div>
          {tab==="typing" && <TypingGame darkMode={darkMode}/>}
          {tab==="multi"  && <MultiTyping darkMode={darkMode} showToast={showToast}/>}
        </div>
      </div>
      <h2 className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t.arcadeGames}</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14 }}>
        {GAMES.map(game => <GameCard key={game.id} game={game} onClick={()=>setScreen(game.id)} t={t}/>)}
      </div>
    </div>
  );
};

export default Games;