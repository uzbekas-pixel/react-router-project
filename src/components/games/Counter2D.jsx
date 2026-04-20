import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  LuPlay, LuRotateCcw, LuHeart, LuTarget, LuZap,
  LuShield, LuCrosshair, LuStar, LuTrophy, LuSkull
} from 'react-icons/lu';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const W = 800;
const H = 600;
const STAR_LAYERS = [
  { count: 60, speed: 0.3, size: 0.8, opacity: 0.4 },
  { count: 40, speed: 0.7, size: 1.4, opacity: 0.6 },
  { count: 20, speed: 1.4, size: 2.2, opacity: 0.9 },
];
const FIRE_RATE_MS = 140;
const PLAYER_SPEED = 4.5;
const ENEMY_TYPES = [
  { color: '#ff3366', glowColor: '#ff0044', radius: 13, speed: 1.8, health: 1, score: 10, shape: 'dart' },
  { color: '#ff9500', glowColor: '#ff6a00', radius: 15, speed: 2.6, health: 2, score: 20, shape: 'wing' },
  { color: '#bf5fff', glowColor: '#9b00ff', radius: 19, speed: 1.3, health: 4, score: 40, shape: 'tank' },
  { color: '#00ffaa', glowColor: '#00cc88', radius: 10, speed: 3.4, health: 1, score: 15, shape: 'dart' },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function initStars() {
  const stars = [];
  STAR_LAYERS.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: layer.size + Math.random() * 0.6,
        speed: layer.speed + Math.random() * 0.2,
        opacity: layer.opacity * (0.7 + Math.random() * 0.3),
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  });
  return stars;
}

function spawnEnemy(level) {
  const side = Math.floor(Math.random() * 4);
  const margin = 60;
  let x, y;
  switch (side) {
    case 0: x = Math.random() * W; y = -margin; break;
    case 1: x = W + margin; y = Math.random() * H; break;
    case 2: x = Math.random() * W; y = H + margin; break;
    default: x = -margin; y = Math.random() * H;
  }
  const typeIdx = Math.min(Math.floor(Math.random() * (1 + level / 3)), ENEMY_TYPES.length - 1);
  const t = ENEMY_TYPES[typeIdx];
  return { x, y, angle: 0, pulse: Math.random() * Math.PI * 2, ...t, maxHealth: t.health };
}

function createExplosion(particles, x, y, color, glowColor, count = 18) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 5;
    const isShrapnel = Math.random() > 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color: isShrapnel ? '#ffffff' : color,
      glowColor: glowColor || color,
      size: isShrapnel ? 1.5 + Math.random() * 2 : 2.5 + Math.random() * 3.5,
      isShrapnel,
      gravity: 0.04 * Math.random(),
    });
  }
  // Ring flash
  particles.push({
    x, y, vx: 0, vy: 0, life: 1, maxLife: 1,
    color: glowColor || color, glowColor: glowColor || color,
    size: 1, isRing: true, ringR: 0,
  });
}

function createEngineParticle(particles, px, py, angle) {
  const backAngle = angle + Math.PI + (Math.random() - 0.5) * 0.6;
  const speed = 1.5 + Math.random() * 2;
  const hues = ['#ffe566', '#ff9500', '#ff5533'];
  particles.push({
    x: px + Math.cos(angle + Math.PI) * 14,
    y: py + Math.sin(angle + Math.PI) * 14,
    vx: Math.cos(backAngle) * speed,
    vy: Math.sin(backAngle) * speed,
    life: 1,
    maxLife: 1,
    color: hues[Math.floor(Math.random() * hues.length)],
    glowColor: '#ff8800',
    size: 1.5 + Math.random() * 2,
    isEngine: true,
  });
}

/* ─────────────────────────────────────────────────────────────
   DRAW FUNCTIONS
───────────────────────────────────────────────────────────── */
function drawShip(ctx, x, y, angle, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Body glow
  ctx.shadowColor = '#00aaff';
  ctx.shadowBlur = 18;

  // Main hull
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-6, 6);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-6, -6);
  ctx.lineTo(-10, -14);
  ctx.closePath();
  const hullGrad = ctx.createLinearGradient(-16, -14, 24, 14);
  hullGrad.addColorStop(0, '#0077cc');
  hullGrad.addColorStop(0.5, '#00aaff');
  hullGrad.addColorStop(1, '#003366');
  ctx.fillStyle = hullGrad;
  ctx.fill();
  ctx.strokeStyle = '#55ddff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Wings
  ctx.beginPath();
  ctx.moveTo(4, 6);
  ctx.lineTo(-10, 20);
  ctx.lineTo(-14, 14);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fillStyle = '#005599';
  ctx.fill();
  ctx.strokeStyle = '#33aaff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, -6);
  ctx.lineTo(-10, -20);
  ctx.lineTo(-14, -14);
  ctx.lineTo(-8, -6);
  ctx.closePath();
  ctx.fillStyle = '#005599';
  ctx.fill();
  ctx.stroke();

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(6, 0, 9, 5, 0, 0, Math.PI * 2);
  const cockpitGrad = ctx.createRadialGradient(6, -2, 1, 6, 0, 9);
  cockpitGrad.addColorStop(0, '#aaeeff');
  cockpitGrad.addColorStop(1, '#003377');
  ctx.fillStyle = cockpitGrad;
  ctx.shadowBlur = 0;
  ctx.fill();

  // Engine nozzle
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 14;
  const flicker = 0.6 + Math.sin(t * 0.3) * 0.4;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.lineTo(-14 - flicker * 6, 0);
  ctx.lineTo(-16, 5);
  const engineGrad = ctx.createLinearGradient(-22, 0, -14, 0);
  engineGrad.addColorStop(0, `rgba(255,255,200,${flicker})`);
  engineGrad.addColorStop(1, `rgba(255,140,0,${flicker * 0.5})`);
  ctx.fillStyle = engineGrad;
  ctx.fill();

  ctx.restore();
}

function drawEnemy(ctx, e, t) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.angle + t * 0.04);
  ctx.shadowColor = e.glowColor;
  ctx.shadowBlur = 20;

  const pulse = 1 + Math.sin(e.pulse + t * 0.08) * 0.1;

  if (e.shape === 'dart') {
    ctx.beginPath();
    ctx.moveTo(e.radius * pulse, 0);
    ctx.lineTo(-e.radius * 0.6, e.radius * 0.6);
    ctx.lineTo(-e.radius * 0.3, 0);
    ctx.lineTo(-e.radius * 0.6, -e.radius * 0.6);
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, e.radius);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, e.color);
    g.addColorStop(1, e.glowColor + '44');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (e.shape === 'wing') {
    // Diamond
    ctx.beginPath();
    ctx.moveTo(e.radius * pulse, 0);
    ctx.lineTo(0, e.radius * 0.7);
    ctx.lineTo(-e.radius * 0.8, 0);
    ctx.lineTo(0, -e.radius * 0.7);
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, e.radius);
    g.addColorStop(0, '#ffcc88');
    g.addColorStop(0.4, e.color);
    g.addColorStop(1, e.glowColor + '33');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = e.color + 'aa';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Tank - hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = e.radius * pulse;
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
              : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, e.radius);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, e.color);
    g.addColorStop(1, e.glowColor + '22');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, e.radius * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();

  // Health bar
  if (e.health < e.maxHealth) {
    const bw = e.radius * 2.2;
    const bx = e.x - bw / 2;
    const by = e.y - e.radius - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx, by, bw, 5);
    ctx.fillStyle = e.health / e.maxHealth > 0.5 ? '#22ff88' : '#ff4444';
    ctx.fillRect(bx, by, bw * (e.health / e.maxHealth), 5);
  }
}

function drawBullet(ctx, b, t) {
  ctx.save();
  ctx.shadowColor = '#ffee00';
  ctx.shadowBlur = 18;
  // Trail
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(b.x - b.vx * 3, b.y - b.vy * 3);
  const trailG = ctx.createLinearGradient(b.x - b.vx * 3, b.y - b.vy * 3, b.x, b.y);
  trailG.addColorStop(0, 'rgba(255,200,0,0)');
  trailG.addColorStop(1, 'rgba(255,230,50,0.9)');
  ctx.strokeStyle = trailG;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // Head
  ctx.beginPath();
  ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fffde7';
  ctx.fill();
  ctx.restore();
}

function drawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    if (p.gravity) p.vy += p.gravity;
    p.life -= p.isEngine ? 0.06 : 0.022;

    if (p.life <= 0) { particles.splice(i, 1); continue; }

    const alpha = p.life;
    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.isRing) {
      p.ringR += 4;
      if (p.ringR > 60) { particles.splice(i, 1); ctx.restore(); continue; }
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.ringR, 0, Math.PI * 2);
      ctx.strokeStyle = p.glowColor;
      ctx.lineWidth = 3 * p.life;
      ctx.stroke();
    } else {
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = p.isEngine ? 8 : 14;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStars(ctx, stars, t) {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > H) { star.y = -2; star.x = Math.random() * W; }
    star.twinkle += 0.04;
    const twinkleAlpha = star.opacity * (0.75 + Math.sin(star.twinkle) * 0.25);
    ctx.globalAlpha = twinkleAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawGrid(ctx, t) {
  const scroll = (t * 0.4) % 50;
  ctx.strokeStyle = 'rgba(0,170,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -scroll; y <= H; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawAimLine(ctx, player) {
  const len = 55;
  const ex = player.x + Math.cos(player.angle) * (len + 22);
  const ey = player.y + Math.sin(player.angle) * (len + 22);
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = 'rgba(255,230,50,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(player.x + Math.cos(player.angle) * 26, player.y + Math.sin(player.angle) * 26);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);
  // Crosshair dot
  ctx.shadowColor = '#ffee00';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(ex, ey, 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,230,50,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function Counter2D({ darkMode }) {
  const canvasRef       = useRef(null);
  const animRef         = useRef(null);
  const joystickRef     = useRef({ active: false, dx: 0, dy: 0, originX: 0, originY: 0 });
  const fireRef         = useRef({ active: false });
  const joystickKnobRef = useRef(null);

  // Only these trigger React re-renders (menu, game-over, HUD icons)
  const [phase, setPhase]         = useState('menu'); // 'menu' | 'playing' | 'gameover'
  const [isMobile, setIsMobile]   = useState(false);
  const [hudSnap, setHudSnap]     = useState({ score: 0, health: 3, level: 1 });
  const [highScore, setHighScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  // ALL mutable game state in one ref — never touched by React's diff
  const G = useRef(null);

  function initGameState() {
    return {
      t: 0,
      player: { x: W / 2, y: H / 2, angle: 0, invincible: 0 },
      keys: { w: false, a: false, s: false, d: false, space: false },
      mouse: { x: W / 2, y: H / 2 },
      bullets: [],
      enemies: [],
      particles: [],
      stars: initStars(),
      lastShot: 0,
      spawnTimer: 0,
      // HUD values (updated directly via DOM refs to avoid re-renders)
      score: 0,
      health: 3,
      level: 1,
    };
  }

  // DOM refs for direct HUD updates
  const hudScoreRef = useRef(null);
  const hudLevelRef = useRef(null);
  const hudHealthRef = useRef(null);

  /* ---------- mobile detection ---------- */
  useEffect(() => {
    const check = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch || window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---------- start / restart game ---------- */
  const startGame = useCallback(() => {
    G.current = initGameState();
    setHudSnap({ score: 0, health: 3, level: 1 });
    setPhase('playing');
  }, []);

  /* ---------- HUD direct DOM update ---------- */
  const updateHudDOM = useCallback((score, health, level) => {
    if (hudScoreRef.current) hudScoreRef.current.textContent = score;
    if (hudLevelRef.current) hudLevelRef.current.textContent = level;
    // health hearts handled via hudSnap only on change
  }, []);

  /* ---------- MAIN GAME LOOP ---------- */
  useEffect(() => {
    if (phase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    let prevHealth = 3;
    let prevLevel  = 1;
    let running = true;

    /* --- keyboard --- */
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const g = G.current.keys;
      if (k === 'w' || k === 'arrowup')    g.w = true;
      if (k === 's' || k === 'arrowdown')   g.s = true;
      if (k === 'a' || k === 'arrowleft')   g.a = true;
      if (k === 'd' || k === 'arrowright')  g.d = true;
      if (k === ' ' || k === 'z')           g.space = true;
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      const g = G.current.keys;
      if (k === 'w' || k === 'arrowup')    g.w = false;
      if (k === 's' || k === 'arrowdown')   g.s = false;
      if (k === 'a' || k === 'arrowleft')   g.a = false;
      if (k === 'd' || k === 'arrowright')  g.d = false;
      if (k === ' ' || k === 'z')           g.space = false;
    };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      const sy = H / rect.height;
      G.current.mouse.x = (e.clientX - rect.left) * sx;
      G.current.mouse.y = (e.clientY - rect.top)  * sy;
    };
    const onMouseDown = () => { fireRef.current.active = true; };
    const onMouseUp   = () => { fireRef.current.active = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    /* --- fire helper --- */
    const fireBullet = () => {
      const now = performance.now();
      const g   = G.current;
      if (now - g.lastShot < FIRE_RATE_MS) return;
      g.lastShot = now;
      const { player, level } = g;
      const shotCount = level >= 5 ? 3 : 1;
      const spread    = level >= 5 ? 0.28 : 0;
      for (let i = 0; i < shotCount; i++) {
        const sa = player.angle + (i - Math.floor(shotCount / 2)) * spread;
        g.bullets.push({
          x: player.x + Math.cos(sa) * 22,
          y: player.y + Math.sin(sa) * 22,
          vx: Math.cos(sa) * 13,
          vy: Math.sin(sa) * 13,
          damage: level >= 3 ? 2 : 1,
        });
      }
    };

    /* ===== LOOP ===== */
    const loop = () => {
      if (!running) return;
      const g = G.current;
      g.t++;

      /* fire */
      const firingKb = g.keys.space;
      if (firingKb || fireRef.current.active) fireBullet();

      /* ── BACKGROUND ── */
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, W, H);
      drawGrid(ctx, g.t);
      drawStars(ctx, g.stars, g.t);

      /* ── PLAYER MOVEMENT ── */
      const { player, keys } = g;
      const joystick = joystickRef.current;
      if (joystick.active && joystick.dx !== 0 || joystick.dy !== 0) {
        const joyMag = Math.hypot(joystick.dx, joystick.dy);
        if (joyMag > 4) {
          const joyAngle = Math.atan2(joystick.dy, joystick.dx);
          const spd = Math.min(joyMag / 50, 1) * PLAYER_SPEED;
          const nx = player.x + Math.cos(joyAngle) * spd;
          const ny = player.y + Math.sin(joyAngle) * spd;
          if (nx > 20 && nx < W - 20) player.x = nx;
          if (ny > 20 && ny < H - 20) player.y = ny;
          player.angle = joyAngle;
        }
      } else {
        if (keys.w && player.y > 22) player.y -= PLAYER_SPEED;
        if (keys.s && player.y < H - 22) player.y += PLAYER_SPEED;
        if (keys.a && player.x > 22) player.x -= PLAYER_SPEED;
        if (keys.d && player.x < W - 22) player.x += PLAYER_SPEED;
        if (!isMobile) {
          player.angle = Math.atan2(g.mouse.y - player.y, g.mouse.x - player.x);
        }
      }
      if (player.invincible > 0) player.invincible--;

      /* ── ENGINE PARTICLES ── */
      if (g.t % 2 === 0) createEngineParticle(g.particles, player.x, player.y, player.angle);

      /* ── PARTICLES ── */
      drawParticles(ctx, g.particles);

      /* ── BULLETS ── */
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        b.x += b.vx; b.y += b.vy;
        if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
          g.bullets.splice(i, 1); continue;
        }
        drawBullet(ctx, b, g.t);
      }

      /* ── SPAWN ENEMIES ── */
      g.spawnTimer++;
      const spawnRate = Math.max(28, 100 - g.level * 6);
      if (g.spawnTimer >= spawnRate) {
        g.spawnTimer = 0;
        g.enemies.push(spawnEnemy(g.level));
      }

      /* ── ENEMIES ── */
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        const toPlayer = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(toPlayer) * e.speed;
        e.y += Math.sin(toPlayer) * e.speed;
        e.angle = toPlayer;
        e.pulse += 0.07;

        // Bullet collisions
        let enemyDied = false;
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          const b = g.bullets[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + 5) {
            g.bullets.splice(j, 1);
            e.health -= b.damage;
            // Hit flash
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();

            if (e.health <= 0) {
              createExplosion(g.particles, e.x, e.y, e.color, e.glowColor, 22);
              g.enemies.splice(i, 1);
              g.score += e.score;
              // Direct DOM update (no re-render)
              if (hudScoreRef.current) hudScoreRef.current.textContent = g.score;
              const newLevel = Math.floor(g.score / 120) + 1;
              if (newLevel !== g.level) {
                g.level = newLevel;
                if (hudLevelRef.current) hudLevelRef.current.textContent = newLevel;
                if (newLevel !== prevLevel) {
                  prevLevel = newLevel;
                  setHudSnap(s => ({ ...s, level: newLevel }));
                }
              }
              enemyDied = true;
              break;
            }
          }
        }
        if (enemyDied) continue;

        // Player collision
        if (player.invincible === 0 && Math.hypot(player.x - e.x, player.y - e.y) < 28) {
          g.enemies.splice(i, 1);
          createExplosion(g.particles, e.x, e.y, e.color, e.glowColor, 14);
          g.health--;
          player.invincible = 80;
          if (g.health !== prevHealth) {
            prevHealth = g.health;
            setHudSnap(s => ({ ...s, health: g.health }));
          }
          if (g.health <= 0) {
            running = false;
            cancelAnimationFrame(animRef.current);
            const fs = g.score;
            setFinalScore(fs);
            setHighScore(h => Math.max(h, fs));
            setPhase('gameover');
            return;
          }
          continue;
        }

        drawEnemy(ctx, e, g.t);
      }

      /* ── PLAYER DRAW (blink if invincible) ── */
      const blinkOk = player.invincible === 0 || Math.floor(player.invincible / 6) % 2 === 0;
      if (blinkOk) {
        drawShip(ctx, player.x, player.y, player.angle, g.t);
        drawAimLine(ctx, player);
      }

      /* ── JOYSTICK KNOB CSS (direct DOM) ── */
      if (joystickKnobRef.current && joystickRef.current.active) {
        joystickKnobRef.current.style.transform =
          `translate(calc(-50% + ${joystickRef.current.dx}px), calc(-50% + ${joystickRef.current.dy}px))`;
      } else if (joystickKnobRef.current) {
        joystickKnobRef.current.style.transform = 'translate(-50%, -50%)';
      }

      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('mouseup',    onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
    };
  }, [phase, isMobile]);

  /* ─────────────────── TOUCH HANDLERS ─────────────────── */
  const handleJoystickStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect  = e.currentTarget.getBoundingClientRect();
    joystickRef.current.active  = true;
    joystickRef.current.originX = rect.left + rect.width  / 2;
    joystickRef.current.originY = rect.top  + rect.height / 2;
    joystickRef.current.dx = 0;
    joystickRef.current.dy = 0;
  }, []);

  const handleJoystickMove = useCallback((e) => {
    e.preventDefault();
    if (!joystickRef.current.active) return;
    const touch    = e.touches[0];
    const dx       = touch.clientX - joystickRef.current.originX;
    const dy       = touch.clientY - joystickRef.current.originY;
    const distance = Math.min(Math.hypot(dx, dy), 52);
    const angle    = Math.atan2(dy, dx);
    joystickRef.current.dx = Math.cos(angle) * distance;
    joystickRef.current.dy = Math.sin(angle) * distance;
  }, []);

  const handleJoystickEnd = useCallback((e) => {
    e.preventDefault();
    joystickRef.current.active = false;
    joystickRef.current.dx = 0;
    joystickRef.current.dy = 0;
  }, []);

  const handleFireStart = useCallback((e) => {
    e.preventDefault();
    fireRef.current.active = true;
  }, []);

  const handleFireEnd = useCallback((e) => {
    e.preventDefault();
    fireRef.current.active = false;
  }, []);

  /* ─────────────────── RENDER ─────────────────── */
  const isPlaying = phase === 'playing';
  const isMenu    = phase === 'menu';
  const isOver    = phase === 'gameover';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 "
         style={{ fontFamily: "'Rajdhani', 'Orbitron', sans-serif" }}>

      {/* Ambient BG glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #0055ff, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #aa00ff, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── GAME CONTAINER ── */}
      <div className="relative z-10 flex flex-col items-center"
           style={{
             borderRadius: '20px',
             border: '1px solid rgba(0,150,255,0.25)',
             background: 'rgba(5,12,25,0.85)',
             backdropFilter: 'blur(14px)',
             boxShadow: '0 0 60px rgba(0,100,255,0.15), 0 0 120px rgba(0,50,200,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
             padding: '4px',
           }}>

        {/* Header bar */}
        <div className="w-full flex items-center justify-between px-4 py-2"
             style={{ borderBottom: '1px solid rgba(0,150,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00aaff' }} />
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Counter 2D</span>
          </div>
          <div className="flex gap-1.5">
            {['#ff5f57','#ffbd2e','#28c840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative">
          {/* HUD overlay */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 z-20 p-3 flex justify-between items-start pointer-events-none">
              {/* Left: score + level */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                     style={{ background: 'rgba(0,10,30,0.75)', border: '1px solid rgba(0,200,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <LuTarget className="w-4 h-4 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                  <div>
                    <div className="text-[9px] text-cyan-400/60 font-bold tracking-widest uppercase">Score</div>
                    <div ref={hudScoreRef} className="text-xl font-black text-amber-400 leading-none"
                         style={{ textShadow: '0 0 10px #fbbf2488' }}>0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                     style={{ background: 'rgba(0,10,30,0.75)', border: '1px solid rgba(0,200,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <LuZap className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 4px #60a5fa)' }} />
                  <div>
                    <div className="text-[9px] text-cyan-400/60 font-bold tracking-widest uppercase">Level</div>
                    <div ref={hudLevelRef} className="text-lg font-black text-blue-400 leading-none"
                         style={{ textShadow: '0 0 10px #60a5fa88' }}>1</div>
                  </div>
                </div>
              </div>

              {/* Right: health */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                   style={{ background: 'rgba(0,10,30,0.75)', border: '1px solid rgba(0,200,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <LuShield className="w-4 h-4 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px #34d399)' }} />
                <div className="flex gap-0.5" ref={hudHealthRef}>
                  {[...Array(3)].map((_, i) => (
                    <LuHeart key={i}
                      className={`w-5 h-5 transition-all duration-300 ${i < hudSnap.health ? 'text-red-500' : 'text-slate-700'}`}
                      style={i < hudSnap.health ? { filter: 'drop-shadow(0 0 5px #ef4444)', fill: '#ef4444' } : {}} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="block"
            style={{
              width: '800px', height: '600px',
              maxWidth: '100%',
              maxHeight: isMobile ? '52vh' : '68vh',
              cursor: isMobile ? 'default' : 'crosshair',
              background: '#050a14',
              borderRadius: '0 0 4px 4px',
            }}
          />

          {/* ── OVERLAY: Menu / Game Over ── */}
          {!isPlaying && (
            <div className="absolute inset-0 z-30 flex items-center justify-center"
                 style={{ background: 'rgba(2,8,16,0.82)', backdropFilter: 'blur(16px)', borderRadius: '0 0 4px 4px' }}>

              {/* Scanlines */}
              <div className="absolute inset-0 pointer-events-none opacity-20"
                   style={{
                     backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,255,0.03) 2px, rgba(0,200,255,0.03) 4px)',
                     borderRadius: '0 0 4px 4px',
                   }} />

              <div className="relative text-center max-w-sm w-full mx-4 px-8 py-10 rounded-2xl"
                   style={{
                     background: 'rgba(5,15,35,0.9)',
                     border: '1px solid rgba(0,180,255,0.2)',
                     boxShadow: '0 0 40px rgba(0,100,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                   }}>

                {/* Corner accents */}
                {[['top-0 left-0', 'border-t-2 border-l-2', 'rounded-tl-2xl'],
                  ['top-0 right-0', 'border-t-2 border-r-2', 'rounded-tr-2xl'],
                  ['bottom-0 left-0', 'border-b-2 border-l-2', 'rounded-bl-2xl'],
                  ['bottom-0 right-0', 'border-b-2 border-r-2', 'rounded-br-2xl']].map(([pos, brd, rnd], idx) => (
                  <div key={idx} className={`absolute ${pos} w-5 h-5 ${brd} ${rnd} border-cyan-400/50`} />
                ))}

                {/* Icon */}
                <div className="mb-5 flex justify-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                       style={{
                         background: isOver
                           ? 'linear-gradient(135deg, rgba(255,50,80,0.15), rgba(180,0,255,0.15))'
                           : 'linear-gradient(135deg, rgba(0,150,255,0.15), rgba(0,255,180,0.15))',
                         border: `1px solid ${isOver ? 'rgba(255,80,80,0.3)' : 'rgba(0,200,255,0.3)'}`,
                         boxShadow: `0 0 20px ${isOver ? 'rgba(255,50,80,0.2)' : 'rgba(0,150,255,0.2)'}`,
                       }}>
                    {isOver
                      ? <LuSkull className="w-9 h-9 text-red-400" style={{ filter: 'drop-shadow(0 0 6px #ff3355)' }} />
                      : <LuStar  className="w-9 h-9 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px #00ccff)' }} />}
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black mb-1 tracking-widest uppercase"
                    style={{
                      background: isOver
                        ? 'linear-gradient(90deg, #ff3366, #ff9900)'
                        : 'linear-gradient(90deg, #00ccff, #aa00ff, #00ffaa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.3))',
                    }}>
                  {isOver ? 'GAME OVER' : 'COUNTER 2D'}
                </h1>
                <p className="text-xs tracking-widest text-cyan-400/40 mb-6 uppercase">
                  {isOver ? 'Mission Failed' : 'Neon Space Assault'}
                </p>

                {/* Stats (game over) */}
                {isOver && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: LuTarget, label: 'Final Score', value: finalScore, color: 'text-amber-400', glow: '#fbbf24' },
                      { icon: LuTrophy, label: 'High Score',  value: Math.max(finalScore, highScore), color: 'text-emerald-400', glow: '#34d399' },
                    ].map(({ icon: Icon, label, value, color, glow }) => (
                      <div key={label} className="rounded-xl p-3"
                           style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-1.5 mb-1 justify-center">
                          <Icon className={`w-3.5 h-3.5 ${color}`} style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
                          <span className="text-[9px] tracking-widest uppercase text-white/30">{label}</span>
                        </div>
                        <div className={`text-3xl font-black ${color}`} style={{ textShadow: `0 0 12px ${glow}66` }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Controls hint */}
                {isMenu && (
                  <div className="flex justify-center gap-8 mb-6">
                    {isMobile ? (
                      <>
                        <div className="flex flex-col items-center gap-2 text-[10px] text-cyan-400/50 uppercase tracking-wider">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center"
                               style={{ background: 'rgba(0,150,255,0.1)', border: '1px solid rgba(0,150,255,0.2)' }}>
                            <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 opacity-70" />
                          </div>
                          Move
                        </div>
                        <div className="flex flex-col items-center gap-2 text-[10px] text-cyan-400/50 uppercase tracking-wider">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center"
                               style={{ background: 'rgba(255,50,80,0.1)', border: '1px solid rgba(255,50,80,0.2)' }}>
                            <LuCrosshair className="w-4 h-4 text-red-400" />
                          </div>
                          Fire
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-2 text-[10px] text-cyan-400/50 uppercase tracking-wider">
                          <div className="flex gap-0.5">
                            {['W','A','S','D'].map(k => (
                              <kbd key={k} className="px-1.5 py-1 rounded text-[10px] font-bold text-cyan-300/60"
                                   style={{ background: 'rgba(0,150,255,0.1)', border: '1px solid rgba(0,200,255,0.2)' }}>{k}</kbd>
                            ))}
                          </div>
                          Move
                        </div>
                        <div className="flex flex-col items-center gap-2 text-[10px] text-cyan-400/50 uppercase tracking-wider">
                          <LuCrosshair className="w-5 h-5 text-cyan-400/60" />
                          Mouse — Aim & Shoot
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CTA button */}
                <button
                  onClick={startGame}
                  className="relative w-full py-3.5 rounded-xl font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0055cc, #0099ff, #00ccaa)',
                    boxShadow: '0 0 20px rgba(0,150,255,0.35), 0 4px 15px rgba(0,0,0,0.4)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(0,200,255,0.5), 0 4px 15px rgba(0,0,0,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,150,255,0.35), 0 4px 15px rgba(0,0,0,0.4)'}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isOver
                      ? <><LuRotateCcw className="w-4 h-4" /> Retry Mission</>
                      : <><LuPlay className="w-4 h-4" /> Launch Mission</>}
                  </span>
                </button>

                {/* High score display on menu */}
                {isMenu && highScore > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-400/60">
                    <LuTrophy className="w-3.5 h-3.5" />
                    <span>Best: <strong className="text-amber-400">{highScore}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── MOBILE CONTROLS ── */}
        {isMobile && isPlaying && (
          <div className="w-full flex items-center justify-between px-5 py-3"
               style={{ borderTop: '1px solid rgba(0,150,255,0.12)' }}>

            {/* Virtual Joystick */}
            <div
              className="relative w-28 h-28 select-none"
              style={{ touchAction: 'none' }}
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
              onTouchCancel={handleJoystickEnd}
            >
              {/* Base ring */}
              <div className="absolute inset-0 rounded-full"
                   style={{
                     background: 'rgba(0,150,255,0.06)',
                     border: '2px solid rgba(0,200,255,0.2)',
                     boxShadow: 'inset 0 0 15px rgba(0,100,255,0.1)',
                   }} />
              {/* Tick marks */}
              {[0, 90, 180, 270].map(deg => (
                <div key={deg} className="absolute w-1 h-3 rounded-full"
                     style={{
                       background: 'rgba(0,200,255,0.25)',
                       top: '50%', left: '50%',
                       transform: `rotate(${deg}deg) translate(-50%, -46px)`,
                       transformOrigin: 'center top',
                     }} />
              ))}
              {/* Knob */}
              <div
                ref={joystickKnobRef}
                className="absolute w-11 h-11 rounded-full"
                style={{
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 35% 35%, #55aaff, #0055cc)',
                  boxShadow: '0 0 16px rgba(0,150,255,0.6), 0 4px 10px rgba(0,0,0,0.5)',
                  transition: 'box-shadow 0.1s',
                }}
              />
            </div>

            {/* Fire button */}
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center select-none"
              style={{
                touchAction: 'none',
                background: 'radial-gradient(circle at 35% 35%, #ff5577, #cc0033)',
                border: '2px solid rgba(255,100,120,0.4)',
                boxShadow: '0 0 20px rgba(255,50,80,0.4), 0 4px 15px rgba(0,0,0,0.5)',
              }}
              onTouchStart={handleFireStart}
              onTouchEnd={handleFireEnd}
              onTouchCancel={handleFireEnd}
              onMouseDown={() => (fireRef.current.active = true)}
              onMouseUp={() => (fireRef.current.active = false)}
              onMouseLeave={() => (fireRef.current.active = false)}
            >
              <LuCrosshair className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 6px #ff5577)' }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="w-full flex items-center justify-between px-4 py-1.5"
             style={{ borderTop: '1px solid rgba(0,150,255,0.08)' }}>
          <span className="text-[9px] tracking-widest text-cyan-400/25 uppercase">v3.0 • Neon Assault</span>
          {highScore > 0 && (
            <div className="flex items-center gap-1 text-[9px] text-amber-400/40">
              <LuTrophy className="w-2.5 h-2.5" />
              <span>{highScore}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}