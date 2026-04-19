/**
 * CustomCursor.jsx —” "Pixel Orb" Premium Edition
 * в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
 * Dizayn falsafasi:
 *   • Kichik (32px) —” saytni to'smaydi, faqat kursor o'rnida ko'rinadi
 *   • 3D shar effekti —” radial gradient + specular highlight
 *   • Follower ring —” cursor atrofida lazy LERP bilan ergashuvchi halqa
 *   • Hover state —” elementlar ustida scale + blend
 *   • Click ripple —” bosganda to'lqin effekti
 *   • Mix-blend-mode: difference —” har qanday fonga moslashadi
 *   • Touch qurilmalarda avtomatik o'chiriladi
 */

import { useEffect, useRef, useCallback } from 'react';

/* в”Ђв”Ђв”Ђ Sozlamalar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
const DOT_SIZE    = 10;   // px —” ichki shar
const RING_SIZE   = 36;   // px —” tashqi halqa
const LERP_DOT    = 1;    // dot tezroq (instant)
const LERP_RING   = 0.10; // ring sekin ergashadi

/* в”Ђв”Ђв”Ђ Global CSS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
const STYLES = `
  *, *::before, *::after { cursor: none !important; }

  /* в”Ђв”Ђ DOT (ichki shar) в”Ђв”Ђ */
  #pc-dot {
    position: fixed;
    top: 0; left: 0;
    width: ${DOT_SIZE}px;
    height: ${DOT_SIZE}px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2147483647;
    will-change: transform;
    transform: translate3d(-50%,-50%,0);
    /* 3D shar gradient */
    background: radial-gradient(
      circle at 35% 30%,
      #ffffff 0%,
      #a8d4ff 20%,
      #4a9eff 50%,
      #1a6fdf 80%,
      #0a3fa0 100%
    );
    box-shadow:
      /* specular highlight */
      inset -2px -2px 4px rgba(0,0,80,0.35),
      inset 1px 1px 3px rgba(255,255,255,0.7),
      /* outer glow */
      0 0 8px rgba(74,158,255,0.6),
      0 0 20px rgba(74,158,255,0.2);
    transition: width 180ms cubic-bezier(.4,0,.2,1),
                height 180ms cubic-bezier(.4,0,.2,1),
                background 180ms ease,
                box-shadow 180ms ease;
  }

  #pc-dot.hovering {
    width: ${DOT_SIZE * 0.5}px;
    height: ${DOT_SIZE * 0.5}px;
    background: radial-gradient(
      circle at 35% 30%,
      #ffffff 0%,
      #ffffff 40%,
      #c0e0ff 100%
    );
    box-shadow:
      inset -1px -1px 2px rgba(0,0,80,0.2),
      0 0 12px rgba(255,255,255,0.9);
  }

  #pc-dot.clicking {
    width: ${DOT_SIZE * 0.3}px;
    height: ${DOT_SIZE * 0.3}px;
  }

  /* в”Ђв”Ђ RING (tashqi halqa) в”Ђв”Ђ */
  #pc-ring {
    position: fixed;
    top: 0; left: 0;
    width: ${RING_SIZE}px;
    height: ${RING_SIZE}px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2147483646;
    will-change: transform;
    transform: translate3d(-50%,-50%,0);
    border: 1.5px solid rgba(74,158,255,0.5);
    background: transparent;
    box-shadow:
      0 0 0 0.5px rgba(74,158,255,0.1),
      inset 0 0 8px rgba(74,158,255,0.05);
    /* backdrop blur —” shisha effekti */
    backdrop-filter: blur(0px);
    transition: width 250ms cubic-bezier(.4,0,.2,1),
                height 250ms cubic-bezier(.4,0,.2,1),
                border-color 250ms ease,
                border-width 250ms ease,
                box-shadow 250ms ease;
  }

  #pc-ring.hovering {
    width: ${RING_SIZE * 1.6}px;
    height: ${RING_SIZE * 1.6}px;
    border-color: rgba(74,158,255,0.25);
    border-width: 1px;
    box-shadow:
      0 0 0 0.5px rgba(74,158,255,0.08),
      inset 0 0 20px rgba(74,158,255,0.06),
      0 0 30px rgba(74,158,255,0.15);
  }

  #pc-ring.clicking {
    width: ${RING_SIZE * 0.8}px;
    height: ${RING_SIZE * 0.8}px;
    border-color: rgba(255,255,255,0.8);
    box-shadow:
      0 0 12px rgba(74,158,255,0.5),
      0 0 30px rgba(74,158,255,0.3);
  }

  /* в”Ђв”Ђ RIPPLE в”Ђв”Ђ */
  .pc-ripple {
    position: fixed;
    top: 0; left: 0;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2147483645;
    border: 1.5px solid rgba(74,158,255,0.6);
    transform: translate3d(-50%,-50%,0) scale(0);
    animation: pc-ripple-anim 0.6s cubic-bezier(0,.5,.5,1) forwards;
  }

  @keyframes pc-ripple-anim {
    0%   { width: 10px; height: 10px; opacity: 0.8; transform: translate3d(-50%,-50%,0) scale(1); }
    100% { width: 80px; height: 80px; opacity: 0;   transform: translate3d(-50%,-50%,0) scale(1); }
  }

  /* в”Ђв”Ђ TRAIL dots в”Ђв”Ђ */
  .pc-trail {
    position: fixed;
    top: 0; left: 0;
    width: 4px; height: 4px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2147483644;
    background: rgba(74,158,255,0.4);
    transform: translate3d(-50%,-50%,0);
    animation: pc-trail-fade 0.5s ease forwards;
  }

  @keyframes pc-trail-fade {
    0%   { opacity: 0.6; transform: translate3d(-50%,-50%,0) scale(1); }
    100% { opacity: 0;   transform: translate3d(-50%,-50%,0) scale(0.2); }
  }
`;

/* в”Ђв”Ђ Hover-ga reaction qiladigan selectorlar в”Ђв”Ђ */
const HOVER_SELECTORS = 'a, button, [role="button"], input, select, textarea, label, [data-cursor-hover]';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const rafRef   = useRef(null);
  const styleRef = useRef(null);

  /* pozitsiyalar */
  const dot  = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const tgt  = useRef({ x: -100, y: -100 });

  /* trail throttle */
  const lastTrail = useRef(0);
  const trailDist = useRef({ x: -100, y: -100 });

  const spawnRipple = useCallback((x, y) => {
    const el = document.createElement('div');
    el.className = 'pc-ripple';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 650);
  }, []);

  const spawnTrail = useCallback((x, y) => {
    const now = performance.now();
    if (now - lastTrail.current < 40) return;        // 25fps trail
    const dx = x - trailDist.current.x;
    const dy = y - trailDist.current.y;
    if (dx*dx + dy*dy < 100) return;                 // min 10px harakat
    lastTrail.current = now;
    trailDist.current = { x, y };
    const el = document.createElement('div');
    el.className = 'pc-trail';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 520);
  }, []);

  useEffect(() => {
    /* touch qurilmalar —” o'chirish */
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const dotEl  = dotRef.current;
    const ringEl = ringRef.current;
    if (!dotEl || !ringEl) return;

    /* CSS inject */
    if (!document.getElementById('pc-cursor-styles')) {
      const tag = document.createElement('style');
      tag.id = 'pc-cursor-styles';
      tag.textContent = STYLES;
      document.head.appendChild(tag);
      styleRef.current = tag;
    }

    /* в”Ђв”Ђ RAF loop: LERP pozitsiyalar в”Ђв”Ђ */
    const tick = () => {
      /* Dot —” deyarli instant */
      dot.current.x += (tgt.current.x - dot.current.x) * LERP_DOT;
      dot.current.y += (tgt.current.y - dot.current.y) * LERP_DOT;
      /* Ring —” sekin */
      ring.current.x += (tgt.current.x - ring.current.x) * LERP_RING;
      ring.current.y += (tgt.current.y - ring.current.y) * LERP_RING;

      dotEl.style.transform  = `translate3d(${dot.current.x}px,${dot.current.y}px,0) translate(-50%,-50%)`;
      ringEl.style.transform = `translate3d(${ring.current.x}px,${ring.current.y}px,0) translate(-50%,-50%)`;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    /* в”Ђв”Ђ Events в”Ђв”Ђ */
    const onMove = (e) => {
      tgt.current.x = e.clientX;
      tgt.current.y = e.clientY;
      spawnTrail(e.clientX, e.clientY);
      dotEl.style.opacity  = '1';
      ringEl.style.opacity = '1';
    };

    const onDown = (e) => {
      dotEl.classList.add('clicking');
      ringEl.classList.add('clicking');
      spawnRipple(e.clientX, e.clientY);
    };

    const onUp = () => {
      dotEl.classList.remove('clicking');
      ringEl.classList.remove('clicking');
    };

    const onOver = (e) => {
      if (e.target.closest(HOVER_SELECTORS)) {
        dotEl.classList.add('hovering');
        ringEl.classList.add('hovering');
      }
    };

    const onOut = (e) => {
      if (e.target.closest(HOVER_SELECTORS)) {
        dotEl.classList.remove('hovering');
        ringEl.classList.remove('hovering');
      }
    };

    const onLeave = () => {
      dotEl.style.opacity  = '0';
      ringEl.style.opacity = '0';
    };

    const onEnter = () => {
      dotEl.style.opacity  = '1';
      ringEl.style.opacity = '1';
    };

    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mousedown',  onDown,  { passive: true });
    window.addEventListener('mouseup',    onUp,    { passive: true });
    window.addEventListener('mouseover',  onOver,  { passive: true });
    window.addEventListener('mouseout',   onOut,   { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('mouseover',  onOver);
      window.removeEventListener('mouseout',   onOut);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      styleRef.current?.remove();
    };
  }, [spawnRipple, spawnTrail]);

  /* Touch qurilmada render ham yo'q */
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* 3D Shar —” DOT */}
      <div
        id="pc-dot"
        ref={dotRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
      {/* Ergashuvchi halqa —” RING */}
      <div
        id="pc-ring"
        ref={ringRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
      />
    </>
  );
}

/*
 * в”Ђв”Ђв”Ђ Ishlatish в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
 *
 *   import CustomCursor from './components/CustomCursor';
 *
 *   export default function App() {
 *     return (
 *       <>
 *         <CustomCursor />
 *         {/* qolgan app... *\/}
 *       </>
 *     );
 *   }
 *
 * в”Ђв”Ђв”Ђ Rangni o'zgartirish в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
 *   Cursor rangi ko'k (#4a9eff). Loyihangiz rangiga moslashtirish uchun
 *   STYLES ichidagi barcha #4a9eff va #a8d4ff ni o'zgartiring.
 *   Masalan, cyberpunk sariq: #ffe04a / #fff0a8
 *
 * в”Ђв”Ђв”Ђ Hover qo'shimcha elementlar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
 *   Biron elementga hover effekt qo'shish uchun:
 *   <div data-cursor-hover>...</div>
 * в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
