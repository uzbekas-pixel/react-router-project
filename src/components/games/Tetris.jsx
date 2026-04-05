import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "../../context/useLang";
import { FaPlay, FaRedo, FaPause, FaGamepad, FaArrowUp, FaArrowDown, FaArrowsAltH, FaHandPointer } from "react-icons/fa";

const COLS = 10, ROWS = 20, CELL = 28;

const PIECES = [
  { shape: [[1,1,1,1]], color: "#06b6d4" },
  { shape: [[1,1],[1,1]], color: "#eab308" },
  { shape: [[0,1,0],[1,1,1]], color: "#a855f7" },
  { shape: [[1,0,0],[1,1,1]], color: "#3b82f6" },
  { shape: [[0,0,1],[1,1,1]], color: "#f97316" },
  { shape: [[0,1,1],[1,1,0]], color: "#22c55e" },
  { shape: [[1,1,0],[0,1,1]], color: "#ef4444" },
];

const emptyBoard  = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const randomPiece = () => {
  const p = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: p.shape, color: p.color, x: Math.floor(COLS/2) - Math.floor(p.shape[0].length/2), y: 0 };
};
const rotate    = (s) => { const r=s.length, c=s[0].length; return Array.from({length:c},(_,i)=>Array.from({length:r},(_,j)=>s[r-1-j][i])); };
const isValid   = (b, s, x, y) => { for(let r=0;r<s.length;r++) for(let c=0;c<s[r].length;c++) { if(!s[r][c])continue; const nr=y+r,nc=x+c; if(nr<0||nr>=ROWS||nc<0||nc>=COLS||b[nr][nc])return false; } return true; };
const place     = (b, p) => { const nb=b.map(r=>[...r]); p.shape.forEach((row,r)=>row.forEach((cell,c)=>{if(cell)nb[p.y+r][p.x+c]=p.color;})); return nb; };
const clearRows = (b) => { const cl=b.filter(r=>r.some(c=>!c)); const n=ROWS-cl.length; return {board:[...Array.from({length:n},()=>Array(COLS).fill(null)),...cl],lines:n}; };
const SCORES    = [0,100,300,500,800];

const Tetris = ({ darkMode }) => {
  const { t } = useLang();
  const [board,setBoard]     = useState(emptyBoard());
  const [piece,setPiece]     = useState(null);
  const [next,setNext]       = useState(null);
  const [score,setScore]     = useState(0);
  const [lines,setLines]     = useState(0);
  const [level,setLevel]     = useState(1);
  const [running,setRunning] = useState(false);
  const [gameOver,setGameOver]=useState(false);
  const [paused,setPaused]   = useState(false);

  const canvasRef=useRef(null), nextRef=useRef(null);
  const bR=useRef(board), pR=useRef(piece), rR=useRef(running), pauseR=useRef(paused);
  const iRef=useRef(null), tRef=useRef(null);
  bR.current=board; pR.current=piece; rR.current=running; pauseR.current=paused;

  const draw = useCallback(()=>{
    const cv=canvasRef.current; if(!cv)return;
    const ctx=cv.getContext("2d");
    ctx.fillStyle=darkMode?"#0f172a":"#f1f5f9"; ctx.fillRect(0,0,COLS*CELL,ROWS*CELL);
    ctx.strokeStyle=darkMode?"#1e293b":"#e2e8f0"; ctx.lineWidth=0.5;
    for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*CELL);ctx.lineTo(COLS*CELL,r*CELL);ctx.stroke();}
    for(let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,ROWS*CELL);ctx.stroke();}
    bR.current.forEach((row,r)=>row.forEach((cell,c)=>{
      if(cell){ctx.fillStyle=cell;ctx.fillRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2);ctx.fillStyle="rgba(255,255,255,0.2)";ctx.fillRect(c*CELL+1,r*CELL+1,CELL-2,4);}
    }));
    const p=pR.current; if(p){
      let gy=p.y; while(isValid(bR.current,p.shape,p.x,gy+1))gy++;
      p.shape.forEach((row,r)=>row.forEach((cell,c)=>{if(cell){ctx.fillStyle="rgba(255,255,255,0.1)";ctx.fillRect((p.x+c)*CELL+1,(gy+r)*CELL+1,CELL-2,CELL-2);}}));
      p.shape.forEach((row,r)=>row.forEach((cell,c)=>{if(cell){ctx.fillStyle=p.color;ctx.fillRect((p.x+c)*CELL+1,(p.y+r)*CELL+1,CELL-2,CELL-2);ctx.fillStyle="rgba(255,255,255,0.25)";ctx.fillRect((p.x+c)*CELL+1,(p.y+r)*CELL+1,CELL-2,4);}}));
    }
  },[darkMode]);

  const drawNext = useCallback(()=>{
    const cv=nextRef.current; if(!cv||!next)return;
    const ctx=cv.getContext("2d"), sz=24;
    ctx.fillStyle=darkMode?"#1e293b":"#f8fafc"; ctx.fillRect(0,0,cv.width,cv.height);
    const ox=Math.floor((4-next.shape[0].length)/2), oy=Math.floor((4-next.shape.length)/2);
    next.shape.forEach((row,r)=>row.forEach((cell,c)=>{
      if(cell){ctx.fillStyle=next.color;ctx.fillRect((ox+c)*sz+1,(oy+r)*sz+1,sz-2,sz-2);ctx.fillStyle="rgba(255,255,255,0.25)";ctx.fillRect((ox+c)*sz+1,(oy+r)*sz+1,sz-2,4);}
    }));
  },[next,darkMode]);

  useEffect(()=>{draw();},[board,piece,draw]);
  useEffect(()=>{drawNext();},[next,drawNext]);

  const spawn = useCallback((b, np)=>{
    const p=np||randomPiece(), nn=randomPiece();
    if(!isValid(b,p.shape,p.x,p.y)){setRunning(false);setGameOver(true);return;}
    setPiece(p); setNext(nn);
  },[]);

  const lock = useCallback(()=>{
    const p=pR.current, b=bR.current; if(!p)return;
    const nb=place(b,p); const {board:cb,lines:cl}=clearRows(nb);
    setBoard(cb); setScore(s=>s+SCORES[cl]*level);
    setLines(l=>{const nl=l+cl; setLevel(Math.floor(nl/10)+1); return nl;});
    spawn(cb,null);
  },[level,spawn]);

  const tick = useCallback(()=>{
    if(!rR.current||pauseR.current)return;
    const p=pR.current; if(!p)return;
    if(isValid(bR.current,p.shape,p.x,p.y+1)) setPiece(prev=>({...prev,y:prev.y+1}));
    else lock();
  },[lock]);

  useEffect(()=>{
    if(running&&!paused){const sp=Math.max(100,600-(level-1)*50); iRef.current=setInterval(tick,sp);}
    return()=>clearInterval(iRef.current);
  },[running,paused,level,tick]);

  const reset = useCallback(()=>{
    clearInterval(iRef.current);
    const nb=emptyBoard(),fp=randomPiece(),fn=randomPiece();
    setBoard(nb);setPiece(fp);setNext(fn);setScore(0);setLines(0);setLevel(1);setGameOver(false);setPaused(false);setRunning(true);
  },[]);

  useEffect(()=>{
    const hk=(e)=>{
      if(!rR.current||pauseR.current)return;
      const p=pR.current; if(!p)return;
      if(e.key==="ArrowLeft"){e.preventDefault();if(isValid(bR.current,p.shape,p.x-1,p.y))setPiece(prev=>({...prev,x:prev.x-1}));}
      else if(e.key==="ArrowRight"){e.preventDefault();if(isValid(bR.current,p.shape,p.x+1,p.y))setPiece(prev=>({...prev,x:prev.x+1}));}
      else if(e.key==="ArrowDown"){e.preventDefault();if(isValid(bR.current,p.shape,p.x,p.y+1))setPiece(prev=>({...prev,y:prev.y+1}));else lock();}
      else if(e.key==="ArrowUp"||e.key==="x"){e.preventDefault();const rot=rotate(p.shape);if(isValid(bR.current,rot,p.x,p.y))setPiece(prev=>({...prev,shape:rot}));}
      else if(e.key===" "){e.preventDefault();let ny=p.y;while(isValid(bR.current,p.shape,p.x,ny+1))ny++;setPiece(prev=>({...prev,y:ny}));setTimeout(lock,0);}
      else if(e.key==="p"||e.key==="Escape")setPaused(prev=>!prev);
    };
    window.addEventListener("keydown",hk);
    return()=>window.removeEventListener("keydown",hk);
  },[lock]);

  // Touch — faqat canvas div da
  const onTS=(e)=>{e.preventDefault();tRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY,time:Date.now()};};
  const onTM=(e)=>{e.preventDefault();};
  const onTE=(e)=>{
    e.preventDefault();
    if(!tRef.current||!rR.current||pauseR.current)return;
    const dx=e.changedTouches[0].clientX-tRef.current.x, dy=e.changedTouches[0].clientY-tRef.current.y, dt=Date.now()-tRef.current.time;
    const p=pR.current; if(!p)return;
    if(dt<200&&Math.abs(dx)<10&&Math.abs(dy)<10){const rot=rotate(p.shape);if(isValid(bR.current,rot,p.x,p.y))setPiece(prev=>({...prev,shape:rot}));}
    else if(Math.abs(dx)>Math.abs(dy)){const st=Math.round(dx/CELL);let nx=p.x;for(let i=0;i<Math.abs(st);i++){const nxx=nx+(st>0?1:-1);if(isValid(bR.current,p.shape,nxx,p.y))nx=nxx;}if(nx!==p.x)setPiece(prev=>({...prev,x:nx}));}
    else if(dy>40){let ny=p.y;while(isValid(bR.current,p.shape,p.x,ny+1))ny++;setPiece(prev=>({...prev,y:ny}));setTimeout(lock,0);}
    else if(dy<-40)setPaused(prev=>!prev);
    tRef.current=null;
  };

  return (
    <div className={`flex flex-col items-center px-2 py-4 pb-10 ${darkMode?"bg-gray-900":"bg-gray-50"}`}>
      <h2 className={`text-xl font-extrabold mb-4 flex items-center justify-center gap-2 ${darkMode?"text-white":"text-gray-900"}`}>
        <FaGamepad className="text-blue-500" /> Tetris
      </h2>

      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
        {/* Canvas — touch faqat shu div da */}
        <div className="relative border-2 border-blue-500 rounded-xl overflow-hidden shadow-xl"
          onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
          style={{ touchAction:"none" }}>
          <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} />

          {!running&&!gameOver&&(
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-xl font-extrabold flex items-center gap-2">
                <FaGamepad /> Tetris
              </p>
              <p className="text-gray-400 text-xs text-center px-4">{t.pcTetris}</p>
              <p className="text-gray-400 text-xs text-center px-4">{t.mobileTetris}</p>
             <button onClick={reset} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center gap-2">
  <FaPlay /> {t.start}
</button>
            </div>
          )}
          {paused&&running&&(
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-2xl font-extrabold flex items-center gap-2"><FaPause /> {t.gamePaused}</p>
             <button onClick={() => setPaused(false)} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center gap-2">
  <FaPlay /> {t.resume}
</button>
            </div>
          )}
          {gameOver&&(
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <p className="text-white text-2xl font-extrabold">{t.gameOver}</p>
              <p className="text-yellow-400 text-lg font-bold">{t.score}: {score}</p>
              <button onClick={reset} className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center gap-2">
  <FaRedo /> {t.again}
</button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full md:w-40 justify-center flex-wrap md:flex-nowrap">
          <div className={`rounded-xl p-2 md:p-4 ${darkMode?"bg-slate-800":"bg-white"} shadow flex flex-col items-center`}>
            <p className={`text-[10px] md:text-xs font-semibold mb-1 ${darkMode?"text-gray-400":"text-gray-500"}`}>{t.next}</p>
            <canvas ref={nextRef} width={72} height={72} className="rounded-lg" />
          </div>
          <div className="flex flex-row md:flex-col gap-2 md:gap-3">
            {[{label:t.score,value:score,color:"text-blue-400"},{label:t.lines,value:lines,color:"text-green-400"},{label:t.level,value:level,color:"text-yellow-400"}].map((s,i)=>(
              <div key={i} className={`rounded-xl p-2 md:p-3 ${darkMode?"bg-slate-800":"bg-white"} shadow min-w-[60px]`}>
                <p className={`text-[10px] font-semibold ${darkMode?"text-gray-400":"text-gray-500"}`}>{s.label}</p>
                <p className={`${s.color} font-extrabold text-sm md:text-lg`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-row md:flex-col gap-2">
           {running && (
  <button onClick={() => setPaused(p => !p)}
    className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${darkMode ? "bg-slate-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
    {paused ? <><FaPlay /> {t.resume || "Davom"}</> : <><FaPause /> {t.pause || "Pauza"}</>}
  </button>
)}
            <button onClick={reset}
  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${darkMode ? "bg-slate-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
  <FaRedo /> {t.again}
</button>
          </div>
          <div className={`md:hidden rounded-xl p-3 ${darkMode?"bg-slate-800":"bg-white"} shadow text-center`}>
            <div className={`text-[10px] flex flex-col gap-1 items-center justify-center ${darkMode?"text-gray-400":"text-gray-500"}`}>
              <span className="flex items-center gap-1"><FaHandPointer /> Tap → burish • <FaArrowsAltH /> Swipe → harakat</span>
              <span className="flex items-center gap-1"><FaArrowDown /> Swipe → tushirish • <FaArrowUp /> Yuqori → pauza</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;