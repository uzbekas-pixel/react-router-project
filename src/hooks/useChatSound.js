import { useRef, useCallback, useEffect } from "react";

// Web Audio API orqali ovoz yasaymiz — tashqi fayl kerak emas
const createSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  if (type === "message") {
    // Yumshoq "ding" ovozi
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  if (type === "send") {
    // Yuborish ovozi — qisqa "pop"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  if (type === "notification") {
    // Ikki bosqichli "ding-dong"
    [0, 0.18].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(i === 0 ? 1046 : 784, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  }

  setTimeout(() => ctx.close(), 1000);
};

export const useChatSound = (enabled = true) => {
  const enabledRef = useRef(enabled);
  
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const playMessage = useCallback(() => {
    if (!enabledRef.current) return;
    try { createSound("message"); } catch {console.error}
  }, []);

  const playSend = useCallback(() => {
    if (!enabledRef.current) return;
    try { createSound("send"); } catch {console.error}
  }, []);

  const playNotification = useCallback(() => {
    if (!enabledRef.current) return;
    try { createSound("notification"); } catch {console.error}
  }, []);

  return { playMessage, playSend, playNotification };
};