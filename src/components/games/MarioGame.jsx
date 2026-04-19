import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useLang } from "../../context/useLang";
import { saveScore } from "./Gameutils";
import Leaderboard from "./Leaderboard";
import { 
  LuStar, LuCoins, LuHeart, LuGlobe, LuGamepad, LuSkull, 
  LuTrophy, LuArrowLeft, LuArrowRight, LuArrowUp, LuPlay, LuRotateCcw 
} from "react-icons/lu";

const W = 800, H = 400;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 4;
const GROUND_Y = H - 60;

const C = {
  sky:"#5c94fc", ground:"#8b4513", groundTop:"#4caf50",
  coin:"#ffd700", coinShine:"#fff8dc",
  goomba:"#8b4513", goombaFeet:"#5d2e0c",
  brick:"#c84b00", brickLine:"#a03800",
  question:"#e8a020", block:"#c8a060",
  pipe:"#4caf50", pipeDark:"#388e3c",
  mushroom:"#ff0000", marioSkin:"#ffcc99",
};

const generateLevel = (levelNum) => {
  const platforms    = [{ x:0, y:GROUND_Y, w:W*20, h:60, type:"ground" }];
  const levelCoins   = [];
  const enemies      = [];
  const questionBlocks = [];
  const pipes        = [];
  const bricks       = [];
  const totalW       = W * 8;
  const spacing      = 180 + levelNum * 15;

  for (let x = 300; x < totalW; x += spacing + Math.random() * 80) {
    if (Math.random() > 0.3) {
      const pw = 80 + Math.random() * 100;
      const py = GROUND_Y - 90 - Math.random() * 70;
      platforms.push({ x, y:py, w:pw, h:20, type:"platform" });
      for (let cx = x+10; cx < x+pw-10; cx += 30)
        levelCoins.push({ x:cx, y:py-30, collected:false, anim:0 });
    }
    if (Math.random() > 0.4)
      questionBlocks.push({ x:x+60, y:GROUND_Y-110-Math.random()*50, hit:false, anim:0, item:Math.random()>0.5?"coin":"mushroom" });
    if (Math.random() > 0.5) {
      const count = 2 + Math.floor(Math.random() * 4);
      for (let bx=0; bx<count; bx++)
        bricks.push({ x:x+150+bx*32, y:GROUND_Y-110, broken:false, anim:0 });
    }
    if (Math.random() > 0.3)
      enemies.push({ x:x+100, y:GROUND_Y-36, vx:-(0.8+Math.random()*0.8+levelNum*0.2), vy:0, dead:false, dying:false, dyingTimer:0 });
    if (Math.random() > 0.6) {
      const ph = 60 + Math.floor(Math.random()*40);
      pipes.push({ x:x+200, y:GROUND_Y-ph, w:48, h:ph });
    }
  }
  for (let x=200; x<totalW; x += 80+Math.random()*60)
    if (Math.random()>0.4)
      levelCoins.push({ x, y:GROUND_Y-40, collected:false, anim:0 });

  // "coins" emas, "levelCoins" nomida qaytaramiz — nom to'qnashuvi yo'q
  return { platforms, levelCoins, enemies, questionBlocks, pipes, bricks, totalW, flagX:totalW-100 };
};

// ── Draw functions ────────────────────────────────────────────────────────────
const drawGround = (ctx, platforms, cam) => {
  for (const p of platforms) {
    const rx = p.x - cam;
    if (rx + p.w < 0 || rx > W) continue;
    ctx.fillStyle = C.ground;
    ctx.fillRect(rx, p.y+16, p.w, p.h-16);
    ctx.fillStyle = C.groundTop;
    ctx.fillRect(rx, p.y, p.w, 16);
  }
};

const drawPipe = (ctx, x, y, w, h) => {
  ctx.fillStyle = C.pipe;
  ctx.fillRect(x+4, y+16, w-8, h-16);
  ctx.fillStyle = C.pipeDark;
  ctx.fillRect(x, y, w, 20);
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(x+4, y+16, 6, h-16);
};

const drawBrick = (ctx, x, y) => {
  ctx.fillStyle = C.brick;
  ctx.fillRect(x, y, 32, 32);
  ctx.fillStyle = C.brickLine;
  ctx.fillRect(x, y+10, 32, 3);
  ctx.fillRect(x, y+23, 32, 3);
  ctx.fillRect(x+8, y, 3, 10);
  ctx.fillRect(x+24, y+13, 3, 10);
};

const drawQuestion = (ctx, x, y, hit) => {
  ctx.fillStyle = hit ? C.block : C.question;
  ctx.fillRect(x, y, 32, 32);
  ctx.strokeStyle = "#8b6020";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 32, 32);
  if (!hit) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px serif";
    ctx.textAlign = "center";
    ctx.fillText("?", x+16, y+22);
  }
};

const drawCoin = (ctx, x, y, anim) => {
  const scale = 0.8 + Math.sin(anim*0.1)*0.2;
  ctx.save();
  ctx.translate(x+8, y+8);
  ctx.scale(scale, 1);
  ctx.fillStyle = C.coin;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = C.coinShine;
  ctx.beginPath();
  ctx.arc(-2, -2, 3, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
};

const drawGoomba = (ctx, x, y, dying) => {
  ctx.fillStyle = C.goomba;
  if (dying) {
    ctx.fillRect(x, y+22, 32, 10);
    return;
  }
  ctx.beginPath();
  ctx.ellipse(x+16, y+16, 16, 14, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = C.goombaFeet;
  ctx.fillRect(x+2, y+24, 10, 8);
  ctx.fillRect(x+20, y+24, 10, 8);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x+6, y+8, 8, 8);
  ctx.fillRect(x+18, y+8, 8, 8);
  ctx.fillStyle = "#000";
  ctx.fillRect(x+8, y+10, 4, 5);
  ctx.fillRect(x+20, y+10, 4, 5);
  ctx.fillStyle = "#000";
  ctx.fillRect(x+5, y+6, 10, 3);
  ctx.fillRect(x+17, y+6, 10, 3);
};

const drawMario = (ctx, x, y, w, h, dir, running, frame, big, invincible) => {
  if (invincible > 0 && Math.floor(invincible/4) % 2 === 0) return;
  ctx.save();
  if (dir === -1) {
    ctx.translate(x + w/2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + w/2), 0);
  }
  const sc = big ? 1.5 : 1;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x+4*sc, y, 20*sc, 8*sc);
  ctx.fillRect(x, y+8*sc, 28*sc, 4*sc);
  ctx.fillStyle = C.marioSkin;
  ctx.fillRect(x+4*sc, y+12*sc, 20*sc, 12*sc);
  ctx.fillStyle = "#000";
  ctx.fillRect(x+16*sc, y+14*sc, 4*sc, 4*sc);
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x+8*sc, y+20*sc, 16*sc, 4*sc);
  ctx.fillRect(x+2*sc, y+24*sc, 24*sc, 12*sc);
  ctx.fillStyle = "#0000cc";
  ctx.fillRect(x, y+36*sc, 28*sc, 8*sc);
  ctx.fillStyle = "#4a2800";
  const lo = running ? Math.sin(frame*0.3)*4 : 0;
  ctx.fillRect(x, y+44*sc+lo, 10*sc, 8*sc);
  ctx.fillRect(x+18*sc, y+44*sc-lo, 10*sc, 8*sc);
  ctx.restore();
};

const drawMushroom = (ctx, x, y) => {
  ctx.fillStyle = "#ff0000";
  ctx.beginPath();
  ctx.arc(x+12, y+12, 12, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x+8, y+8, 4, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x+18, y+6, 3, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = C.marioSkin;
  ctx.fillRect(x+4, y+14, 16, 10);
};

const drawCloud = (ctx, x, y) => {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x+20, y+20, 20, 0, Math.PI*2);
  ctx.arc(x+40, y+15, 25, 0, Math.PI*2);
  ctx.arc(x+65, y+20, 20, 0, Math.PI*2);
  ctx.fill();
  ctx.fillRect(x, y+20, 85, 20);
};

const drawBush = (ctx, x, y) => {
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.arc(x+15, y+15, 15, 0, Math.PI*2);
  ctx.arc(x+30, y+10, 20, 0, Math.PI*2);
  ctx.arc(x+50, y+15, 15, 0, Math.PI*2);
  ctx.fill();
};

const drawFlag = (ctx, x) => {
  ctx.fillStyle = "#888";
  ctx.fillRect(x, GROUND_Y-160, 4, 160);
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.moveTo(x+4, GROUND_Y-160);
  ctx.lineTo(x+44, GROUND_Y-140);
  ctx.lineTo(x+4, GROUND_Y-120);
  ctx.fill();
};

// ── Mobile Button — MarioGame dan TASHQARIDA ─────────────────────────────────
const MBtn = ({ keysRef, code, label, style={} }) => (
  <button
    onPointerDown={() => keysRef.current[code]=true}
    onPointerUp={()   => keysRef.current[code]=false}
    onPointerLeave={()=> keysRef.current[code]=false}
    style={{
      width:56, height:56, borderRadius:14,
      background:"rgba(255,255,255,0.15)",
      border:"2px solid rgba(255,255,255,0.35)",
      color:"#fff", fontSize:22, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"center",
      userSelect:"none", touchAction:"none", ...style,
    }}>
    {label}
  </button>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const MarioGame = ({ darkMode }) => {
  const canvasRef = useRef(null);
  const { user }  = useAuth();
  const rafRef    = useRef(null);
  const stateRef  = useRef(null);
  const keysRef   = useRef({});

  const [gameState,     setGameState]     = useState("menu");
  const [displayScore,  setDisplayScore]  = useState(0);
  const [displayLives,  setDisplayLives]  = useState(3);
  const [displayLevel,  setDisplayLevel]  = useState(1);
  const [displayCoins,  setDisplayCoins]  = useState(0);
  const [showLB,        setShowLB]        = useState(false);

  // coinCount — o'yinchi yig'gan tangalar SONI (array emas!)
  // levelCoins — sahnada turgan tangalar ARRAY
  const initState = useCallback((level=1, lives=3, score=0, coinCount=0) => {
    const lvl = generateLevel(level);
    stateRef.current = {
      mario: {
        x:80, y:GROUND_Y-52, w:28, h:52,
        vx:0, vy:0, onGround:false,
        dir:1, running:false, frame:0,
        big:false, invincible:0, dead:false,
      },
      cam: { x:0 },
      level,
      lives,
      score,
      coinCount,          // <-- son: o'yinchi yig'gan tangalar
      particles: [],
      items: [],
      frame: 0,
      won: false,
      ...lvl,             // <-- levelCoins (array), platforms, enemies, ...
    };
  }, []);

  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.code] = true;
      if (["ArrowUp","Space","ArrowLeft","ArrowRight","KeyW","KeyA","KeyD"].includes(e.code))
        e.preventDefault();
    };
    const up = (e) => { keysRef.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  const startGame = useCallback(() => {
    initState(1, 3, 0, 0);
    setGameState("playing");
    setDisplayScore(0);
    setDisplayLives(3);
    setDisplayLevel(1);
    setDisplayCoins(0);
  }, [initState]);

  // ── Game Loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    const spawnParts = (x, y, color, count=8) => {
      const s = stateRef.current;
      if (!s) return;
      for (let i=0; i<count; i++) {
        const a = (Math.PI*2*i)/count;
        s.particles.push({
          x, y,
          vx: Math.cos(a)*(2+Math.random()*3),
          vy: Math.sin(a)*(2+Math.random()*3)-2,
          life: 40, color,
        });
      }
    };

    const draw = (s) => {
      const cam = s.cam.x;
      ctx.fillStyle = C.sky;
      ctx.fillRect(0, 0, W, H);

      [
        [100-cam*0.3, 35],
        [380-cam*0.3, 55],
        [680-cam*0.3, 28],
        [950-cam*0.3, 50],
        [1250-cam*0.3, 38],
      ].forEach(([x,y]) => drawCloud(ctx, x, y));

      [
        [160-cam*0.6, GROUND_Y-18],
        [500-cam*0.6, GROUND_Y-18],
        [850-cam*0.6, GROUND_Y-18],
        [1200-cam*0.6, GROUND_Y-18],
      ].forEach(([x,y]) => drawBush(ctx, x, y));

      drawGround(ctx, s.platforms, cam);

      s.pipes.forEach(p => {
        const rx = p.x-cam;
        if (rx+p.w<0||rx>W) return;
        drawPipe(ctx, rx, p.y, p.w, p.h);
      });

      s.bricks.forEach(b => {
        if (b.broken) return;
        const rx = b.x-cam;
        if (rx+32<0||rx>W) return;
        const off = b.anim>0 ? -Math.sin((8-b.anim)*0.8)*5 : 0;
        if (b.anim>0) b.anim--;
        drawBrick(ctx, rx, b.y+off);
      });

      s.questionBlocks.forEach(q => {
        const rx = q.x-cam;
        if (rx+32<0||rx>W) return;
        const off = q.anim>0 ? -Math.sin((10-q.anim)*0.8)*5 : 0;
        if (q.anim>0) q.anim--;
        drawQuestion(ctx, rx, q.y+off, q.hit);
      });

      // levelCoins — sahnada turgan tangalar array
      s.levelCoins.forEach(c => {
        if (c.collected) return;
        const rx = c.x-cam;
        if (rx<-20||rx>W+20) return;
        c.anim++;
        drawCoin(ctx, rx, c.y, c.anim);
      });

      s.items.forEach(item => {
        if (item.collected) return;
        const rx = item.x-cam;
        if (rx<-30||rx>W+30) return;
        drawMushroom(ctx, rx, item.y);
      });

      s.enemies.forEach(en => {
        if (en.dead && !en.dying) return;
        const rx = en.x-cam;
        if (rx<-40||rx>W+40) return;
        drawGoomba(ctx, rx, en.y, en.dying);
      });

      drawFlag(ctx, s.flagX-cam);

      const m  = s.mario;
      const mx = m.x-cam;
      drawMario(ctx, mx, m.y, m.w, m.h, m.dir, m.running, m.frame, m.big, m.invincible);

      s.particles.forEach(p => {
        ctx.globalAlpha = p.life/40;
        ctx.fillStyle   = p.color;
        ctx.fillRect(p.x-cam, p.y, 6, 6);
      });
      ctx.globalAlpha = 1;

      if (s.won) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        const levelText = t.levelComplete.replace('Level', '').replace('tugadi!', '').trim();
        ctx.fillText(`Level ${s.level} ${levelText}`, W/2, H/2);
      }
    };

    const update = () => {
      const s = stateRef.current;
      if (!s) return;
      s.frame++;
      const m = s.mario;

      if (m.dead) {
        m.vy += GRAVITY;
        m.y  += m.vy;
        if (m.y > H+100) {
          s.lives--;
          setDisplayLives(s.lives);
          if (s.lives <= 0) {
            if (user) saveScore(user, "mario", s.score);
            setGameState("gameover");
          } else {
            // coinCount (son) uzatilmoqda — array emas!
            initState(s.level, s.lives, s.score, s.coinCount);
          }
        }
        return;
      }

      if (keys("ArrowLeft","KeyA")) { m.vx=-MOVE_SPEED; m.dir=-1; m.running=true; }
      else if (keys("ArrowRight","KeyD")) { m.vx=MOVE_SPEED; m.dir=1; m.running=true; }
      else { m.vx*=0.8; m.running=false; }

      if ((keys("ArrowUp","Space","KeyW")) && m.onGround) {
        m.vy = JUMP_FORCE*(m.big?1.05:1);
        m.onGround = false;
      }

      m.vy += GRAVITY;
      m.x  += m.vx;
      m.y  += m.vy;
      m.frame++;
      if (m.invincible>0) m.invincible--;
      if (m.x<0) m.x=0;

      m.onGround = false;
      m.h = m.big ? 52 : 36;

      for (const p of s.platforms) {
        if (m.x+m.w>p.x && m.x<p.x+p.w) {
          if (m.vy>=0 && m.y+m.h>p.y && m.y+m.h<p.y+p.h+Math.abs(m.vy)+2) {
            m.y=p.y-m.h; m.vy=0; m.onGround=true;
          }
        }
      }

      for (const p of s.pipes) {
        if (m.x+m.w>p.x && m.x<p.x+p.w && m.y+m.h>p.y && m.y<p.y+p.h) {
          if (m.vy>=0 && m.y+m.h-m.vy<=p.y+4) {
            m.y=p.y-m.h; m.vy=0; m.onGround=true;
          } else if (m.vx>0) { m.x=p.x-m.w; }
          else if (m.vx<0) { m.x=p.x+p.w; }
        }
      }

      for (const b of s.bricks) {
        if (b.broken) continue;
        if (m.x+m.w>b.x && m.x<b.x+32 && m.y+m.h>b.y && m.y<b.y+32) {
          if (m.vy>=0 && m.y+m.h-m.vy<=b.y+4) {
            m.y=b.y-m.h; m.vy=0; m.onGround=true;
          } else if (m.vy<0 && m.y>=b.y+28) {
            m.y=b.y+32; m.vy=0;
            if (m.big) {
              b.broken=true;
              s.score+=50;
              setDisplayScore(s.score);
              spawnParts(b.x+16, b.y, C.brick, 8);
            } else {
              b.anim=8;
            }
          } else if (m.vx>0) { m.x=b.x-m.w; }
          else { m.x=b.x+32; }
        }
      }

      for (const q of s.questionBlocks) {
        if (m.x+m.w>q.x && m.x<q.x+32 && m.y+m.h>q.y && m.y<q.y+32) {
          if (m.vy>=0 && m.y+m.h-m.vy<=q.y+4) {
            m.y=q.y-m.h; m.vy=0; m.onGround=true;
          } else if (m.vy<0 && m.y>=q.y+28) {
            m.y=q.y+32; m.vy=0;
            if (!q.hit) {
              q.hit=true; q.anim=10;
              if (q.item==="coin") {
                s.score+=200;
                s.coinCount++;                    // <-- son++
                setDisplayScore(s.score);
                setDisplayCoins(s.coinCount);     // <-- son
                spawnParts(q.x+16, q.y, C.coin, 6);
              } else {
                s.items.push({ x:q.x+4, y:q.y-20, vy:-3, collected:false });
              }
            }
          } else if (m.vx>0) { m.x=q.x-m.w; }
          else { m.x=q.x+32; }
        }
      }

      // levelCoins array — sahnada turgan tangalar
      for (const c of s.levelCoins) {
        if (c.collected) continue;
        if (Math.abs(m.x+m.w/2-(c.x+8))<24 && Math.abs(m.y+m.h/2-(c.y+8))<24) {
          c.collected=true;
          s.score+=100;
          s.coinCount++;                          // <-- son++
          setDisplayScore(s.score);
          setDisplayCoins(s.coinCount);           // <-- son
          spawnParts(c.x, c.y, C.coin, 5);
        }
      }

      for (const item of s.items) {
        if (item.collected) continue;
        item.vy += GRAVITY*0.3;
        item.y  += item.vy;
        item.x  += 1.5;
        if (item.y>GROUND_Y-24) { item.y=GROUND_Y-24; item.vy=0; }
        if (Math.abs(m.x-item.x)<28 && Math.abs(m.y-item.y)<36) {
          item.collected=true;
          m.big=true;
          s.score+=1000;
          setDisplayScore(s.score);
          spawnParts(item.x, item.y, "#ff0000", 8);
        }
      }

      for (const en of s.enemies) {
        if (en.dead) {
          if (en.dying) {
            en.dyingTimer++;
            if (en.dyingTimer>30) en.dead=true;
          }
          continue;
        }
        en.x+=en.vx;
        en.vy+=GRAVITY;
        en.y+=en.vy;
        if (en.y>=GROUND_Y-36) { en.y=GROUND_Y-36; en.vy=0; }
        for (const p of s.platforms) {
          if (p.type==="platform" && en.x+32>p.x && en.x<p.x+p.w && en.y+36>p.y && en.y+36<p.y+30) {
            en.y=p.y-36; en.vy=0;
          }
        }
        if (en.x<0||en.x>s.totalW) en.vx*=-1;

        if (!m.dead && m.invincible===0 &&
            m.x+m.w>en.x+4 && m.x<en.x+28 &&
            m.y+m.h>en.y+4 && m.y<en.y+36) {
          if (m.vy>0 && m.y+m.h<en.y+18) {
            en.dying=true; en.dyingTimer=0;
            m.vy=JUMP_FORCE*0.6;
            s.score+=200;
            setDisplayScore(s.score);
            spawnParts(en.x+16, en.y, C.goomba, 6);
          } else {
            if (m.big) {
              m.big=false; m.invincible=120;
            } else {
              m.dead=true;
            }
          }
        }
      }

      s.particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life--;
      });
      s.particles = s.particles.filter(p => p.life>0);

      if (!s.won && m.x+m.w>s.flagX) {
        s.won=true;
        s.score+=5000;
        setDisplayScore(s.score);
        if (user) saveScore(user, "mario", s.score);
        setTimeout(() => {
          if (s.level<3) {
            // coinCount (son) uzatilmoqda
            initState(s.level+1, s.lives, s.score, s.coinCount);
            setDisplayLevel(s.level+1);
          } else {
            setGameState("win");
          }
        }, 2000);
      }

      s.cam.x = Math.max(0, m.x - W/3);

      if (m.y>H+100 && !m.dead) m.dead=true;
    };

    const keys = (...codes) => codes.some(c => keysRef.current[c]);

    const loop = () => {
      update();
      const s = stateRef.current;
      if (s) draw(s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState, initState, user]);

  const { t } = useLang();

  // MBtn endi tashqarida — bu yerda e'lon qilinmaydi

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minHeight:"calc(100vh-130px)", padding:"20px 16px 80px", background:darkMode?"#0f172a":"#1a1a2e" }}>
      <h2 style={{ color:"#ffd700", fontWeight:800, fontSize:24, marginBottom:8, textShadow:"2px 2px 0 #8b0000", display: "flex", alignItems: "center", gap: "8px" }}>
        <LuGamepad style={{ fontSize: "24px" }} /> {t.superMario}
      </h2>

      {gameState==="playing" && (
        <div style={{ display:"flex", gap:20, marginBottom:8, color:"#fff", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LuStar color="#f59e0b" /> {displayScore}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LuCoins color="#eab308" /> ×{displayCoins}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LuHeart color="#ef4444" /> ×{displayLives}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><LuGlobe color="#3b82f6" /> {displayLevel}-1</span>
        </div>
      )}

      <div style={{ position:"relative", borderRadius:8, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ display:"block", maxWidth:"100%", imageRendering:"pixelated" }} />

        {gameState==="menu" && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <LuGamepad style={{ fontSize:64, color: "#fff" }} />
            <h2 style={{ color:"#ffd700", fontSize:32, fontWeight:800, margin:0, textShadow:"2px 2px 0 #8b0000" }}>{t.superMario}</h2>
            <p style={{ color:"#fff", fontSize:13, margin:0, textAlign: "center" }}>{t.marioPcControls}</p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0, textAlign: "center" }}>{t.marioMobileControls}</p>
            <button onClick={startGame}
              style={{ marginTop:8, padding:"14px 44px", background:"#e8a020", color:"#fff", border:"none", borderRadius:12, fontSize:20, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 0 #8b6020", display: "flex", alignItems: "center", gap: "8px" }}>
              <LuPlay /> {t.startGameBtn || "BOSHLASH"}
            </button>
            <button onClick={() => setShowLB(!showLB)}
              style={{ padding:"8px 22px", background:"transparent", color:"#ffd700", border:"2px solid #ffd700", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuTrophy /> {t.leaderboardTitle}
            </button>
          </div>
        )}

        {gameState==="gameover" && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.82)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <LuSkull style={{ fontSize:56, color: "#e5e7eb" }} />
            <h2 style={{ color:"#ef4444", fontSize:30, fontWeight:800, margin:0 }}>{t.gameOverTitle}</h2>
            <p style={{ color:"#ffd700", fontSize:20, margin:0, fontWeight:700 }}>{t.scoreLabel} {displayScore}</p>
            <button onClick={startGame}
              style={{ padding:"12px 32px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:10, fontSize:16, fontWeight:700, cursor:"pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuRotateCcw /> {t.restartBtn}
            </button>
            <button onClick={() => setGameState("menu")}
              style={{ padding:"9px 22px", background:"transparent", color:"#fff", border:"1px solid #fff", borderRadius:10, fontSize:13, cursor:"pointer" }}>
              {t.menuBtn}
            </button>
          </div>
        )}

        {gameState==="win" && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.82)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <LuTrophy style={{ fontSize:64, color: "#eab308" }} />
            <h2 style={{ color:"#ffd700", fontSize:30, fontWeight:800, margin:0 }}>{t.marioWinTitle}</h2>
            <p style={{ color:"#fff", fontSize:16, margin:0 }}>{t.wonAllLevels}</p>
            <p style={{ color:"#ffd700", fontSize:22, fontWeight:700, margin:0 }}>{t.scoreLabel} {displayScore}</p>
            <button onClick={startGame}
              style={{ padding:"12px 32px", background:"#10b981", color:"#fff", border:"none", borderRadius:10, fontSize:16, fontWeight:700, cursor:"pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <LuRotateCcw /> {t.restartBtn}
            </button>
          </div>
        )}
      </div>

      {gameState==="playing" && (
        <div style={{ display:"flex", gap:10, marginTop:10, alignItems:"center" }}>
          <MBtn keysRef={keysRef} code="ArrowLeft"  label={<LuArrowLeft />} />
          <MBtn keysRef={keysRef} code="ArrowRight" label={<LuArrowRight />} />
          <div style={{ width:20 }}/>
          <MBtn keysRef={keysRef} code="Space" label={<LuArrowUp />} style={{ background:"rgba(239,68,68,0.35)", borderColor:"#ef4444" }}/>
        </div>
      )}

      {showLB && (
        <div style={{ marginTop:20, width:"100%", maxWidth:400 }}>
          <Leaderboard darkMode={darkMode} game="mario"/>
        </div>
      )}
    </div>
  );
};

export default MarioGame;