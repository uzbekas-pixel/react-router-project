import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LuPlay, LuRotateCcw, LuHeart, LuTarget, LuZap, LuShield, LuCrosshair } from 'react-icons/lu';

export default function Counter2D({ darkMode }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);
  const animationRef = useRef(null);
  const gameStateRef = useRef({
    keys: { w: false, a: false, s: false, d: false },
    mouse: { x: 400, y: 300 },
    bullets: [],
    enemies: [],
    particles: [],
    stars: [],
    player: { x: 400, y: 300, angle: 0 },
    lastShot: 0,
    enemySpawnTimer: 0,
    waveTimer: 0
  });

  // Initialize stars for background
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
    gameStateRef.current.stars = stars;
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setHealth(3);
    setLevel(1);
    setWave(1);
    setGameOver(false);
    setIsPlaying(true);
    
    gameStateRef.current = {
      keys: { w: false, a: false, s: false, d: false },
      mouse: { x: 400, y: 300 },
      bullets: [],
      enemies: [],
      particles: [],
      stars: gameStateRef.current.stars,
      player: { x: 400, y: 300, angle: 0 },
      lastShot: 0,
      enemySpawnTimer: 0,
      waveTimer: 0
    };
  }, []);

  const createExplosion = useCallback((x, y, color, count = 15) => {
    const particles = gameStateRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 4 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
  }, []);

  const spawnEnemy = useCallback(() => {
    const state = gameStateRef.current;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 50;
    
    switch(side) {
      case 0: x = Math.random() * 800; y = -margin; break;
      case 1: x = 800 + margin; y = Math.random() * 600; break;
      case 2: x = Math.random() * 800; y = 600 + margin; break;
      default: x = -margin; y = Math.random() * 600;
    }
    
    const types = [
      { color: '#ef4444', radius: 12, speed: 2, health: 1, score: 10 }, // Red - basic
      { color: '#f97316', radius: 15, speed: 2.5, health: 2, score: 20 }, // Orange - fast
      { color: '#a855f7', radius: 18, speed: 1.5, health: 3, score: 30 }, // Purple - tank
      { color: '#22c55e', radius: 10, speed: 3, health: 1, score: 15 }, // Green - speedy
    ];
    
    const type = types[Math.min(Math.floor(Math.random() * (1 + level / 3)), types.length - 1)];
    
    state.enemies.push({
      x, y,
      ...type,
      maxHealth: type.health,
      angle: 0,
      pulse: 0
    });
  }, [level]);

  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (score > highScore) setHighScore(score);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const state = gameStateRef.current;

    // Input handlers
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (state.keys.hasOwnProperty(key)) state.keys[key] = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (state.keys.hasOwnProperty(key)) state.keys[key] = false;
    };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
    };
    const handleMouseDown = () => {
      const now = Date.now();
      if (now - state.lastShot < 150) return; // Fire rate limit
      state.lastShot = now;
      
      const player = state.player;
      const angle = Math.atan2(state.mouse.y - player.y, state.mouse.x - player.x);
      
      // Triple shot at level 5+
      const shotCount = level >= 5 ? 3 : 1;
      const spread = level >= 5 ? 0.3 : 0;
      
      for (let i = 0; i < shotCount; i++) {
        const shotAngle = angle + (i - 1) * spread;
        state.bullets.push({
          x: player.x + Math.cos(shotAngle) * 20,
          y: player.y + Math.sin(shotAngle) * 20,
          vx: Math.cos(shotAngle) * 12,
          vy: Math.sin(shotAngle) * 12,
          damage: level >= 3 ? 2 : 1
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    // Game loop
    const gameLoop = () => {
      const { keys, player, bullets, enemies, particles, stars, mouse } = state;
      
      // Clear canvas with trail effect
      ctx.fillStyle = darkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.3)';
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw background stars
      ctx.fillStyle = darkMode ? '#ffffff' : '#64748b';
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > 600) star.y = 0;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Player movement
      const speed = keys.shift ? 6 : 4;
      if (keys.w && player.y > 20) player.y -= speed;
      if (keys.s && player.y < 580) player.y += speed;
      if (keys.a && player.x > 20) player.x -= speed;
      if (keys.d && player.x < 780) player.x += speed;
      
      // Player angle toward mouse
      player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

      // Draw player (spaceship style)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      
      // Ship body
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, 12);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, -12);
      ctx.closePath();
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Engine glow
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-25, 0);
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + Math.random() * 0.5})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Cockpit
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af';
      ctx.fill();
      
      ctx.restore();

      // Draw aim line (raketa qayerga otishini ko'rsatuvchi chiziq)
      const aimLength = 60;
      const aimEndX = player.x + Math.cos(player.angle) * aimLength;
      const aimEndY = player.y + Math.sin(player.angle) * aimLength;
      
      // Main aim line
      ctx.beginPath();
      ctx.moveTo(player.x + Math.cos(player.angle) * 25, player.y + Math.sin(player.angle) * 25);
      ctx.lineTo(aimEndX, aimEndY);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'; // Amber color
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]); // Dashed line
      ctx.stroke();
      ctx.setLineDash([]); // Reset
      
      // Aim point marker
      ctx.beginPath();
      ctx.arc(aimEndX, aimEndY, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner aim point
      ctx.beginPath();
      ctx.arc(aimEndX, aimEndY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      // Spawn enemies
      state.enemySpawnTimer++;
      const spawnRate = Math.max(30, 100 - level * 5);
      if (state.enemySpawnTimer > spawnRate) {
        state.enemySpawnTimer = 0;
        spawnEnemy();
      }

      // Update and draw bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        
        // Bullet trail
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Bullet head
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        
        // Remove off-screen bullets
        if (b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
          bullets.splice(i, 1);
        }
      }

      // Update and draw enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        
        // Move toward player
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;
        e.angle = angle;
        e.pulse += 0.1;
        
        // Draw enemy with health bar
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        
        // Enemy body
        const pulseSize = Math.sin(e.pulse) * 2;
        ctx.beginPath();
        ctx.moveTo(e.radius + pulseSize, 0);
        ctx.lineTo(-e.radius/2, e.radius/2);
        ctx.lineTo(-e.radius/3, 0);
        ctx.lineTo(-e.radius/2, -e.radius/2);
        ctx.closePath();
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Enemy core
        ctx.beginPath();
        ctx.arc(0, 0, e.radius/3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
        
        ctx.restore();
        
        // Health bar
        if (e.health < e.maxHealth) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30 * (e.health / e.maxHealth), 4);
        }
        
        // Collision with player
        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        if (distToPlayer < 30) {
          enemies.splice(i, 1);
          createExplosion(e.x, e.y, e.color);
          setHealth(h => {
            if (h <= 1) {
              setGameOver(true);
              setIsPlaying(false);
            }
            return h - 1;
          });
          continue;
        }
        
        // Collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          const distToBullet = Math.hypot(b.x - e.x, b.y - e.y);
          if (distToBullet < e.radius + 5) {
            bullets.splice(j, 1);
            e.health -= b.damage;
            
            // Hit effect
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (e.health <= 0) {
              enemies.splice(i, 1);
              createExplosion(e.x, e.y, e.color, 20);
              setScore(s => s + e.score);
              
              // Level up every 100 points
              setLevel(l => Math.floor((score + e.score) / 100) + 1);
            }
            break;
          }
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.025;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw grid lines for sci-fi effect
      ctx.strokeStyle = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 800; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 0; y <= 600; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isPlaying, gameOver, darkMode, level, score, highScore, spawnEnemy, createExplosion]);

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4`}>
      {/* Solid background - no gradients or particles */}

      {/* Game Container */}
      <div className={`relative z-10 rounded-2xl overflow-hidden shadow-2xl ${darkMode 
        ? 'shadow-blue-500/30 border border-slate-700/50' 
        : 'shadow-slate-400/30 border border-slate-300'
      }`}>
        
        {/* HUD */}
        {isPlaying && !gameOver && (
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
            {/* Score Panel */}
            <div className={`flex flex-col gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md border ${darkMode 
                ? 'bg-slate-800/80 border-slate-600/50' 
                : 'bg-white/80 border-slate-300/50'
              }`}>
                <LuTarget className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs opacity-70 font-medium">HISOB</p>
                  <p className="text-2xl font-black text-amber-400 leading-none">{score}</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md border ${darkMode 
                ? 'bg-slate-800/80 border-slate-600/50' 
                : 'bg-white/80 border-slate-300/50'
              }`}>
                <LuZap className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs opacity-70 font-medium">DARAJA</p>
                  <p className="text-xl font-black text-blue-400 leading-none">{level}</p>
                </div>
              </div>
            </div>

            {/* Health Panel */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md border ${darkMode 
              ? 'bg-slate-800/80 border-slate-600/50' 
              : 'bg-white/80 border-slate-300/50'
            }`}>
              <LuShield className="w-5 h-5 text-emerald-400" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <LuHeart 
                    key={i} 
                    className={`w-6 h-6 transition-all ${i < health 
                      ? 'text-red-500 fill-red-500 scale-100' 
                      : 'text-slate-600 scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas 
          ref={canvasRef} 
          className="block cursor-crosshair bg-slate-900"
          style={{ width: '800px', height: '600px', maxWidth: '100%', maxHeight: '70vh' }}
        />

        {/* Menu / Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className={`absolute inset-0 z-30 flex items-center justify-center backdrop-blur-xl ${darkMode 
            ? 'bg-slate-950/80' 
            : 'bg-slate-100/80'
          }`}>
            <div className={`relative p-8 md:p-12 rounded-3xl text-center max-w-md w-full mx-4 ${darkMode 
              ? 'bg-slate-900/90 border border-slate-700/50 shadow-2xl shadow-blue-500/10' 
              : 'bg-white/90 border border-slate-300/50 shadow-2xl shadow-slate-400/20'
            }`}>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-3xl opacity-20 blur-xl" />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-2xl ${darkMode 
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    {gameOver ? (
                      <LuCrosshair className="w-12 h-12 text-red-400" />
                    ) : (
                      <LuTarget className="w-12 h-12 text-blue-400" />
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className={`text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent`}>
                  {gameOver ? "O'YIN TUGADI" : "COUNTER 2D"}
                </h1>
                
                <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {gameOver ? "Yaxshi urinish!" : "Kosmik jangchiga aylaning"}
                </p>

                {/* Stats */}
                {gameOver && (
                  <div className={`grid grid-cols-2 gap-4 mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <p className="text-xs opacity-60 mb-1">YAKUNIY HISOB</p>
                      <p className="text-3xl font-black text-amber-400">{score}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <p className="text-xs opacity-60 mb-1">ENG YUQORI</p>
                      <p className="text-3xl font-black text-emerald-400">{Math.max(score, highScore)}</p>
                    </div>
                  </div>
                )}

                {/* Controls hint */}
                {!gameOver && (
                  <div className={`flex justify-center gap-6 mb-8 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`flex gap-1 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        <kbd className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>W</kbd>
                        <kbd className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>A</kbd>
                        <kbd className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>S</kbd>
                        <kbd className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>D</kbd>
                      </div>
                      <span>Harakatlanish</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <LuCrosshair className="w-6 h-6" />
                      <span>Otish</span>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                <button 
                  onClick={startGame}
                  className="group relative w-full py-4 text-lg font-bold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    {gameOver ? (
                      <><LuRotateCcw className="w-5 h-5" /> Qayta boshlash</>
                    ) : (
                      <><LuPlay className="w-5 h-5" /> O'yinni boshlash</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Corner decorations */}
      <div className={`absolute bottom-4 left-4 text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        v2.0 • Kosmik Rejim
      </div>
    </div>
  );
}
