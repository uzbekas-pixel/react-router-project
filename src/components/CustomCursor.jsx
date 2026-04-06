/**
 * CustomCursor.jsx — "Kinetic Zen"
 * ─────────────────────────────────────────────────────────────
 * Bolakay kitob o'qiydi (idle) yoki yuguradi (moving).
 *
 * Tuzatilgan xatolar:
 *  ✓ bookCover ishlatilmagan edi → Book komponentida cover stroke sifatida ishlatildi
 *  ✓ RunBody komponenti e'lon qilingan lekin ishlatilmagan edi → butunlay o'chirildi
 *  ✓ stroke="#aaa" hardcoded edi → pageLineClr konstantasiga ajratildi
 *  ✓ stroke="#1a1008" hardcoded edi → strokeBase konstantasiga ajratildi
 *  ✓ Barcha path/line elementlarida fill="none" to'g'ri berildi
 *  ✓ SF() helper to'g'ri ishlaydi
 */

import { useEffect, useRef } from 'react';

/* ─── Sozlamalar ─────────────────────────────────────────── */
const CURSOR_SIZE     = 72;
const IDLE_TIMEOUT_MS = 120;
const LERP_FACTOR     = 0.18;
const USE_LERP        = true;

/* ─── Ranglar ────────────────────────────────────────────── */
const skin        = '#F5CFA0';
const hair        = '#2C1810';
const shirt       = '#E8E0D4';
const pants       = '#4A6FA5';
const book1       = '#F0EAD6';
const book2       = '#E8DFC8';
const bookCover   = '#C0392B';
const pageLineClr = '#aaaaaa';
const strokeBase  = '#1a1008';

const sz = CURSOR_SIZE;

/* ─── CSS ────────────────────────────────────────────────── */
const CURSOR_CSS = `
  *, *::before, *::after { cursor: none !important; }
  #kinetic-cursor {
    position: fixed;
    top: 0; left: 0;
    width: ${sz}px;
    height: ${sz}px;
    pointer-events: none;
    z-index: 2147483647;
    will-change: transform;
    transform: translate3d(0px,0px,0) scaleX(1);
  }
  #kinetic-cursor .sprite-wrap {
    width: ${sz}px;
    height: ${sz}px;
    overflow: hidden;
  }
  #kinetic-cursor .sprite-inner {
    display: flex;
    animation-timing-function: steps(1);
    animation-fill-mode: both;
    animation-iteration-count: infinite;
  }
  #kinetic-cursor.idle .sprite-inner {
    animation-name: cursor-idle;
    animation-duration: 900ms;
  }
  #kinetic-cursor.running .sprite-inner {
    animation-name: cursor-run;
    animation-duration: 480ms;
  }
  @keyframes cursor-idle {
    0%   { transform: translateX(0px); }
    50%  { transform: translateX(-${sz}px); }
    100% { transform: translateX(0px); }
  }
  @keyframes cursor-run {
    0%   { transform: translateX(-${sz * 2}px); }
    25%  { transform: translateX(-${sz * 3}px); }
    50%  { transform: translateX(-${sz * 4}px); }
    75%  { transform: translateX(-${sz * 5}px); }
    100% { transform: translateX(-${sz * 2}px); }
  }
`;

/* ─── Style helperlar ────────────────────────────────────── */
const S = {
  stroke: strokeBase,
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};
const SF = (fillColor) => ({ ...S, fill: fillColor });

/* ─── Head ───────────────────────────────────────────────── */
const Head = ({ cx, cy, r = 10 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} {...SF(skin)} />
    <path
      d={`M${cx-r} ${cy-2} Q${cx-r+1} ${cy-r-5} ${cx} ${cy-r-4} Q${cx+r-1} ${cy-r-5} ${cx+r} ${cy-2}`}
      {...SF(hair)}
    />
    <circle cx={cx+3} cy={cy+1} r={1.2} fill={hair} stroke="none" />
    <path d={`M${cx+1} ${cy+4} Q${cx+4} ${cy+6} ${cx+6} ${cy+4}`} {...S} strokeWidth={1.2} />
  </g>
);

/* ─── Book ───────────────────────────────────────────────── */
const Book = ({ x, y, angle = 0, scale = 1 }) => {
  const hw = 14 * scale;
  const hh = 9 * scale;
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <path d={`M0,0 L-${hw},-2 L-${hw},${hh} L0,${hh-1} Z`} {...SF(book1)} />
      <path d={`M0,0 L${hw},-2 L${hw},${hh} L0,${hh-1} Z`} {...SF(book2)} />
      <line x1={0} y1={-2} x2={0} y2={hh-1} {...S} strokeWidth={1.2} />
      <line x1={-hw+4} y1={3} x2={-3} y2={3}
        stroke={pageLineClr} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <line x1={-hw+4} y1={6} x2={-3} y2={6}
        stroke={pageLineClr} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <line x1={3} y1={3} x2={hw-4} y2={3}
        stroke={pageLineClr} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <line x1={3} y1={6} x2={hw-4} y2={6}
        stroke={pageLineClr} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      {/* Muqova — bookCover ishlatildi */}
      <rect
        x={-hw} y={-2} width={hw*2} height={hh+2} rx={1}
        stroke={bookCover} strokeWidth={1.4} fill="none"
      />
    </g>
  );
};

/* ─── Frame 0: Idle — tinch o'tiradi ────────────────────── */
const FrameIdle0 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <rect x={26} y={36} width={20} height={18} rx={5} {...SF(shirt)} />
    <path d="M24,54 Q18,58 20,64 Q22,66 26,64 Q30,62 30,58" {...SF(pants)} />
    <path d="M48,54 Q54,58 52,64 Q50,66 46,64 Q42,62 42,58" {...SF(pants)} />
    <path d="M26,40 Q20,48 22,52"
      stroke={shirt} strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M46,40 Q52,48 50,52"
      stroke={shirt} strokeWidth={5} strokeLinecap="round" fill="none" />
    <circle cx={22} cy={53} r={3} {...SF(skin)} />
    <circle cx={50} cy={53} r={3} {...SF(skin)} />
    <Book x={36} y={57} angle={-5} scale={0.95} />
    <Head cx={36} cy={26} r={11} />
    <ellipse cx={36} cy={68} rx={16} ry={3} fill="#00000015" stroke="none" />
  </svg>
);

/* ─── Frame 1: Idle — sal tebranadi ─────────────────────── */
const FrameIdle1 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <rect x={26} y={35} width={20} height={18} rx={5} {...SF(shirt)} />
    <path d="M24,53 Q18,57 20,63 Q22,65 26,63 Q30,61 30,57" {...SF(pants)} />
    <path d="M48,53 Q54,57 52,63 Q50,65 46,63 Q42,61 42,57" {...SF(pants)} />
    <path d="M26,39 Q20,47 22,51"
      stroke={shirt} strokeWidth={5} strokeLinecap="round" fill="none" />
    <path d="M46,39 Q52,47 50,51"
      stroke={shirt} strokeWidth={5} strokeLinecap="round" fill="none" />
    <circle cx={22} cy={52} r={3} {...SF(skin)} />
    <circle cx={50} cy={52} r={3} {...SF(skin)} />
    <Book x={36} y={56} angle={3} scale={0.95} />
    <g transform="translate(36,25) rotate(4) translate(-36,-25)">
      <Head cx={36} cy={25} r={11} />
    </g>
    <ellipse cx={36} cy={67} rx={16} ry={3} fill="#00000015" stroke="none" />
  </svg>
);

/* ─── Frame 2: Run — o'ng oyoq oldinda ──────────────────── */
const FrameRun0 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M33,43 L26,58 L24,65"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={23} cy={65} rx={5} ry={3} fill={hair} stroke="none" transform="rotate(-5,23,65)" />
    <path d="M39,43 L46,52 L50,62"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={51} cy={62} rx={5} ry={3} fill={hair} stroke="none" />
    <rect x={28} y={27} width={16} height={16} rx={4}
      transform="rotate(-6,36,35)" {...SF(shirt)} />
    <path d="M30,32 Q20,36 18,40"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <circle cx={18} cy={40} r={3} {...SF(skin)} />
    <path d="M42,32 Q48,28 50,30"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <Book x={50} y={28} angle={-15} scale={0.65} />
    <Head cx={36} cy={18} r={10} />
    <ellipse cx={36} cy={68} rx={12} ry={2.5} fill="#00000012" stroke="none" />
  </svg>
);

/* ─── Frame 3: Run — havoda (sakrash) ───────────────────── */
const FrameRun1 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M32,42 L24,52 L20,60"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={20} cy={60} rx={5} ry={3} fill={hair} stroke="none" />
    <path d="M40,42 L48,48 L54,55"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={55} cy={55} rx={5} ry={3} fill={hair} stroke="none" />
    <rect x={28} y={24} width={16} height={16} rx={4}
      transform="rotate(-10,36,32)" {...SF(shirt)} />
    <path d="M30,30 Q19,30 16,34"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <circle cx={16} cy={34} r={3} {...SF(skin)} />
    <path d="M42,30 Q50,24 52,22"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <Book x={52} y={20} angle={-20} scale={0.65} />
    <Head cx={36} cy={15} r={10} />
    <ellipse cx={36} cy={68} rx={7} ry={2} fill="#00000008" stroke="none" />
  </svg>
);

/* ─── Frame 4: Run — chap oyoq oldinda ──────────────────── */
const FrameRun2 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M39,43 L46,58 L48,65"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={49} cy={65} rx={5} ry={3} fill={hair} stroke="none" />
    <path d="M33,43 L26,52 L22,62"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={21} cy={62} rx={5} ry={3} fill={hair} stroke="none" />
    <rect x={28} y={27} width={16} height={16} rx={4}
      transform="rotate(-6,36,35)" {...SF(shirt)} />
    <path d="M42,32 Q52,36 54,40"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <circle cx={54} cy={40} r={3} {...SF(skin)} />
    <path d="M30,32 Q24,28 22,30"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <Book x={22} y={28} angle={15} scale={0.65} />
    <Head cx={36} cy={18} r={10} />
    <ellipse cx={36} cy={68} rx={14} ry={2.5} fill="#00000012" stroke="none" />
  </svg>
);

/* ─── Frame 5: Run — tiklanish ───────────────────────────── */
const FrameRun3 = () => (
  <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M32,44 L28,56 L26,64"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={26} cy={64} rx={5} ry={3} fill={hair} stroke="none" />
    <path d="M40,44 L44,56 L46,64"
      stroke={pants} strokeWidth={5} strokeLinecap="round" fill="none" />
    <ellipse cx={46} cy={64} rx={5} ry={3} fill={hair} stroke="none" />
    <rect x={28} y={27} width={16} height={16} rx={4}
      transform="rotate(-3,36,35)" {...SF(shirt)} />
    <path d="M30,33 Q24,40 22,44"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <circle cx={22} cy={44} r={3} {...SF(skin)} />
    <path d="M42,33 Q48,36 50,34"
      stroke={shirt} strokeWidth={4} strokeLinecap="round" fill="none" />
    <Book x={50} y={32} angle={-10} scale={0.65} />
    <Head cx={36} cy={18} r={10} />
    <ellipse cx={36} cy={68} rx={13} ry={2.5} fill="#00000012" stroke="none" />
  </svg>
);

/* ─── Sprite Strip ───────────────────────────────────────── */
const SpriteStrip = () => (
  <div className="sprite-inner" style={{ width: sz * 6, display: 'flex' }}>
    <FrameIdle0 />
    <FrameIdle1 />
    <FrameRun0 />
    <FrameRun1 />
    <FrameRun2 />
    <FrameRun3 />
  </div>
);

/* ─── Asosiy komponent ───────────────────────────────────── */
export default function CustomCursor() {
  const cursorRef   = useRef(null);
  const rafRef      = useRef(null);
  const idleTimer   = useRef(null);
  const currentX    = useRef(0);
  const currentY    = useRef(0);
  const targetX     = useRef(0);
  const targetY     = useRef(0);
  const isRunning   = useRef(false);
  const lastDir     = useRef(1);
  const styleTagRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const el = cursorRef.current;
    if (!el) return;

    if (!document.getElementById('kinetic-cursor-css')) {
      const tag = document.createElement('style');
      tag.id = 'kinetic-cursor-css';
      tag.textContent = CURSOR_CSS;
      document.head.appendChild(tag);
      styleTagRef.current = tag;
    }

    el.classList.add('idle');

    const tick = () => {
      if (USE_LERP) {
        currentX.current += (targetX.current - currentX.current) * LERP_FACTOR;
        currentY.current += (targetY.current - currentY.current) * LERP_FACTOR;
      } else {
        currentX.current = targetX.current;
        currentY.current = targetY.current;
      }
      const ox = -(sz * 0.5);
      const oy = -(sz * 0.75);
      el.style.transform =
        `translate3d(${currentX.current + ox}px,${currentY.current + oy}px,0) scaleX(${lastDir.current})`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onMouseMove = (e) => {
      const dx = e.clientX - targetX.current;
      if (Math.abs(dx) > 1.5) lastDir.current = dx > 0 ? 1 : -1;
      targetX.current = e.clientX;
      targetY.current = e.clientY;

      if (!isRunning.current) {
        isRunning.current = true;
        el.classList.remove('idle');
        el.classList.add('running');
      }

      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        isRunning.current = false;
        el.classList.remove('running');
        el.classList.add('idle');
      }, IDLE_TIMEOUT_MS);
    };

    const onMouseLeave = () => { el.style.opacity = '0'; };
    const onMouseEnter = () => { el.style.opacity = '1'; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimer.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      styleTagRef.current?.remove();
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <div id="kinetic-cursor" ref={cursorRef} aria-hidden="true" style={{ opacity: 0 }}>
      <div className="sprite-wrap">
        <SpriteStrip />
      </div>
    </div>
  );
}

/*
 * Ishlatish:
 *   import CustomCursor from './components/CustomCursor';
 *
 *   export default function App() {
 *     return (
 *       <>
 *         <CustomCursor />
 *         ...
 *       </>
 *     );
 *   }
 */