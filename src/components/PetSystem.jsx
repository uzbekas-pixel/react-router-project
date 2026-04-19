import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { useLang } from "../context/useLang";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {
  X,
  Cat,
  Smile,
  Zap,
  Drumstick,
  Gamepad2,
  Cookie,
  Volume2,
  VolumeX,
} from "lucide-react";

const PetSystem = ({ darkMode, showToast, isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLang();
  const catRef = useRef(null);
  const audioContextRef = useRef(null);

  // Pet state
  const [petStats, setPetStats] = useState({
    happiness: 85,
    hunger: 20,
    energy: 90,
    xp: 120,
    level: 1,
    maxXp: 300,
    isEating: false,
    isPlaying: false,
    isSleeping: false,
  });

  // Interactive states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPurring, setIsPurring] = useState(false);
  const [isMeowing, setIsMeowing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [catPosition, setCatPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [tailSpeed, setTailSpeed] = useState(1);
  const [blinkSpeed, setBlinkSpeed] = useState(1);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  // New realistic states
  const [headTilt, setHeadTilt] = useState(0);
  const [isYawning, setIsYawning] = useState(false);
  const [isStretching, setIsStretching] = useState(false);
  const [isKneading, setIsKneading] = useState(false);
  const [eyeWiden, setEyeWiden] = useState(false);
  const [noseTwitch, setNoseTwitch] = useState(false);
  const [isLicking, setIsLicking] = useState(false);
  const [idleTimer, setIdleTimer] = useState(0);
  const [earTwitchLeft, setEarTwitchLeft] = useState(false);
  const [earTwitchRight, setEarTwitchRight] = useState(false);
  const [bodyVibration, setBodyVibration] = useState(false);
  
  // Extra realistic states
  const [sleepBubble, setSleepBubble] = useState(false);
  const [showTears, setShowTears] = useState(false);
  const [showClaws, setShowClaws] = useState(false);
  const [eyeLashes, setEyeLashes] = useState(true);
  const [furTexture, setFurTexture] = useState(true);
  const [isAnnoyed, setIsAnnoyed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  // Ultra realistic states
  const [dreamTwitch, setDreamTwitch] = useState(false);
  const [sweatDrop, setSweatDrop] = useState(false);
  const [isHiccup, setIsHiccup] = useState(false);
  const [isSneeze, setIsSneeze] = useState(false);
  const [bellyBreathing, setBellyBreathing] = useState(0);
  const [eyeShineIntensity, setEyeShineIntensity] = useState(0.8);
  const [tailPosition, setTailPosition] = useState(0);
  const [pawPrints, setPawPrints] = useState([]);
  const [furDirection, setFurDirection] = useState(0);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // Sound generation functions
  const playMeow = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    // Meow sound parameters
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    
    setIsMeowing(true);
    setTimeout(() => setIsMeowing(false), 500);
  }, [soundEnabled]);

  const playPurr = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current || isPurring) return;
    
    const ctx = audioContextRef.current;
    setIsPurring(true);
    
    // Create purring sound using multiple oscillators
    const createPurrCycle = () => {
      if (!isDragging && !isHovering) {
        setIsPurring(false);
        return;
      }
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.type = 'sine';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(25, ctx.currentTime);
      osc2.frequency.setValueAtTime(50, ctx.currentTime);
      
      // Modulate for purr effect
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      lfo.frequency.setValueAtTime(4, ctx.currentTime); // 4Hz purr
      lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
      lfo.stop(ctx.currentTime + 0.25);
      
      // Continue purring while interacting
      if (isDragging || isHovering) {
        setTimeout(createPurrCycle, 250);
      } else {
        setIsPurring(false);
      }
    };
    
    createPurrCycle();
  }, [soundEnabled, isDragging, isHovering, isPurring]);

  const playHappySound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [soundEnabled]);

  // Mouse tracking for eye movement and head tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!catRef.current || !isOpen) return;
      
      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - catCenterY, e.clientX - catCenterX);
      const distance = Math.min(8, Math.hypot(e.clientX - catCenterX, e.clientY - catCenterY) / 20);
      
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      setEyeOffset({ x: offsetX, y: offsetY });
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Head tilt based on mouse X position
      const tilt = Math.max(-15, Math.min(15, (e.clientX - catCenterX) / 20));
      setHeadTilt(tilt);
      
      // Eye widen when mouse approaches quickly or is very close
      const distToCat = Math.hypot(e.clientX - catCenterX, e.clientY - catCenterY);
      setEyeWiden(distToCat < 80);
      
      // Increase tail wag when mouse is near
      if (distToCat < 150) {
        setTailSpeed(2);
        setBlinkSpeed(0.5);
      } else {
        setTailSpeed(1);
        setBlinkSpeed(1);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (!catRef.current) return;
    
    setIsDragging(true);
    setLastInteraction(Date.now());
    playPurr();
    playHappySound();
    
    const rect = catRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    // Increase happiness when petting
    if (petStats.happiness < 100) {
      const newStats = {
        ...petStats,
        happiness: Math.min(100, petStats.happiness + 5),
        xp: petStats.xp + 2,
      };
      setPetStats(newStats);
      savePetData(newStats);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCatPosition({ x: 0, y: 0 });
    playMeow();
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const handleDragMove = (e) => {
      setCatPosition({
        x: e.clientX - dragOffset.x - (catRef.current?.getBoundingClientRect().left || 0),
        y: e.clientY - dragOffset.y - (catRef.current?.getBoundingClientRect().top || 0),
      });
    };
    
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
    };
  }, [isDragging, dragOffset]);

  // Idle behaviors - random animations when not interacting
  useEffect(() => {
    if (!isOpen) return;
    
    const idleInterval = setInterval(() => {
      // Random nose twitch
      if (Math.random() < 0.3) {
        setNoseTwitch(true);
        setTimeout(() => setNoseTwitch(false), 200);
      }
      
      // Random ear twitch
      if (Math.random() < 0.2) {
        const left = Math.random() > 0.5;
        if (left) {
          setEarTwitchLeft(true);
          setTimeout(() => setEarTwitchLeft(false), 300);
        } else {
          setEarTwitchRight(true);
          setTimeout(() => setEarTwitchRight(false), 300);
        }
      }
      
      // Occasional lick when happy
      if (petStats.happiness > 80 && Math.random() < 0.15) {
        setIsLicking(true);
        setTimeout(() => setIsLicking(false), 800);
      }
    }, 2000);
    
    return () => clearInterval(idleInterval);
  }, [isOpen, petStats.happiness]);

  // Long idle behaviors (yawn, stretch)
  useEffect(() => {
    if (!isOpen || isDragging || isHovering) {
      setIdleTimer(0);
      return;
    }
    
    const longIdleInterval = setInterval(() => {
      setIdleTimer(prev => {
        const newTime = prev + 1;
        
        // Yawn after 10 seconds of no interaction
        if (newTime === 10 && !petStats.isSleeping) {
          setIsYawning(true);
          setTimeout(() => setIsYawning(false), 2000);
        }
        
        // Stretch after 20 seconds
        if (newTime === 20 && !petStats.isSleeping) {
          setIsStretching(true);
          setTimeout(() => setIsStretching(false), 1500);
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(longIdleInterval);
  }, [isOpen, isDragging, isHovering, petStats.isSleeping]);

  // Purr vibration effect
  useEffect(() => {
    if (isPurring) {
      setBodyVibration(true);
    } else {
      setBodyVibration(false);
    }
  }, [isPurring]);

  // Kneading when being petted (hover)
  useEffect(() => {
    if (isHovering && !petStats.isSleeping) {
      setIsKneading(true);
      setShowClaws(true); // Show claws when kneading
    } else {
      setIsKneading(false);
      setShowClaws(false);
    }
  }, [isHovering, petStats.isSleeping]);

  // Sleep bubble effect (anime style snot bubble)
  useEffect(() => {
    if (petStats.isSleeping) {
      const bubbleInterval = setInterval(() => {
        setSleepBubble(true);
        setTimeout(() => setSleepBubble(false), 2000);
      }, 4000);
      return () => clearInterval(bubbleInterval);
    } else {
      setSleepBubble(false);
    }
  }, [petStats.isSleeping]);

  // Tears when yawning (watery eyes)
  useEffect(() => {
    if (isYawning) {
      setShowTears(true);
      const timer = setTimeout(() => setShowTears(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isYawning]);

  // Annoyance tracking - too many clicks
  useEffect(() => {
    if (clickCount > 5) {
      setIsAnnoyed(true);
      const timer = setTimeout(() => {
        setIsAnnoyed(false);
        setClickCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  // Ultra realistic effects
  
  // Dream twitches - cat twitches paws/whiskers while dreaming
  useEffect(() => {
    if (petStats.isSleeping) {
      const dreamInterval = setInterval(() => {
        if (Math.random() > 0.6) { // 40% chance to twitch
          setDreamTwitch(true);
          setTimeout(() => setDreamTwitch(false), 800);
        }
      }, 3000);
      return () => clearInterval(dreamInterval);
    } else {
      setDreamTwitch(false);
    }
  }, [petStats.isSleeping]);

  // Sweat drops when nervous or annoyed
  useEffect(() => {
    if (isAnnoyed || petStats.energy < 15) {
      setSweatDrop(true);
      const timer = setTimeout(() => setSweatDrop(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setSweatDrop(false);
    }
  }, [isAnnoyed, petStats.energy]);

  // Random hiccups
  useEffect(() => {
    const hiccupInterval = setInterval(() => {
      if (!petStats.isSleeping && Math.random() > 0.92) { // 8% chance
        setIsHiccup(true);
        setTimeout(() => setIsHiccup(false), 600);
      }
    }, 8000);
    return () => clearInterval(hiccupInterval);
  }, [petStats.isSleeping]);

  // Random sneezes (rare)
  useEffect(() => {
    const sneezeInterval = setInterval(() => {
      if (!petStats.isSleeping && Math.random() > 0.97) { // 3% chance
        setIsSneeze(true);
        setTimeout(() => setIsSneeze(false), 1000);
      }
    }, 15000);
    return () => clearInterval(sneezeInterval);
  }, [petStats.isSleeping]);

  // Belly breathing - visible chest expansion
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBellyBreathing(prev => {
        const newVal = prev === 0 ? 1 : prev === 1 ? 2 : prev === 2 ? 1 : 0;
        return newVal;
      });
    }, 1000);
    return () => clearInterval(breathInterval);
  }, []);

  // Eye shine changes with mood/energy
  useEffect(() => {
    if (petStats.energy < 20) {
      setEyeShineIntensity(0.3); // Dull eyes when tired
    } else if (isDragging || isHovering) {
      setEyeShineIntensity(1); // Bright eyes when excited
    } else {
      setEyeShineIntensity(0.8);
    }
  }, [petStats.energy, isDragging, isHovering]);

  // Tail position changes with mood
  useEffect(() => {
    if (isAnnoyed) {
      setTailPosition(-1); // Tail down when annoyed
    } else if (isDragging || isHovering) {
      setTailPosition(1); // Tail up when happy
    } else {
      setTailPosition(0); // Neutral
    }
  }, [isAnnoyed, isDragging, isHovering]);

  // Load pet data from Firebase
  useEffect(() => {
    if (!user) return;
    
    const petRef = doc(db, "users", user.uid, "data", "pet");
    const unsubscribe = onSnapshot(petRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPetStats(prev => ({
          ...prev,
          happiness: data.happiness ?? 85,
          hunger: data.hunger ?? 20,
          energy: data.energy ?? 90,
          xp: data.xp ?? 120,
          level: data.level ?? 1,
          maxXp: data.maxXp ?? 300,
          isSleeping: data.isSleeping ?? false,
        }));
      }
    });
    
    return () => unsubscribe();
  }, [user]);

  // Save pet data to Firebase
  const savePetData = async (newStats) => {
    if (!user) return;
    
    const petRef = doc(db, "users", user.uid, "data", "pet");
    await setDoc(petRef, {
      ...newStats,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  // Pet actions
  const feedPet = async () => {
    if (petStats.hunger <= 0) {
      showToast?.(t.petFull || "Pet to'ygan!", "info");
      return;
    }
    const newStats = {
      ...petStats,
      hunger: Math.max(0, petStats.hunger - 30),
      happiness: Math.min(100, petStats.happiness + 10),
      xp: petStats.xp + 10,
      isEating: true,
    };
    setPetStats(newStats);
    await savePetData(newStats);
    
    showToast?.(t.petFed || "Pet oziqlandi! +10 XP", "success");
    setTimeout(() => setPetStats(prev => ({ ...prev, isEating: false })), 2000);
  };

  const playWithPet = async () => {
    if (petStats.energy < 20) {
      showToast?.(t.petTired || "Pet charchagan!", "error");
      return;
    }
    const newStats = {
      ...petStats,
      energy: Math.max(0, petStats.energy - 20),
      happiness: Math.min(100, petStats.happiness + 15),
      xp: petStats.xp + 15,
      isPlaying: true,
    };
    setPetStats(newStats);
    await savePetData(newStats);
    
    showToast?.(t.petPlayed || "Pet bilan o'ynaldi! +15 XP", "success");
    setTimeout(() => setPetStats(prev => ({ ...prev, isPlaying: false })), 3000);
  };

  // Level up check and save
  useEffect(() => {
    if (petStats.xp >= petStats.maxXp) {
      const newStats = {
        ...petStats,
        level: petStats.level + 1,
        xp: petStats.xp - petStats.maxXp,
        maxXp: Math.floor(petStats.maxXp * 1.5),
        happiness: 100,
        energy: 100,
        hunger: 0,
      };
      setPetStats(newStats);
      savePetData(newStats);
      showToast?.(`Level Up! Pet Level ${petStats.level + 1} ga ko'tarildi!`, "success");
    }
  }, [petStats.xp, petStats.maxXp, petStats.level]);

  // Decrease stats over time (every minute) - save to Firebase
  useEffect(() => {
    const interval = setInterval(async () => {
      const newStats = {
        ...petStats,
        hunger: Math.min(100, petStats.hunger + 2),
        happiness: Math.max(0, petStats.happiness - 1),
        energy: Math.min(100, petStats.energy + 5),
      };
      setPetStats(newStats);
      await savePetData(newStats);
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [petStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* CSS Animations - Dynamic based on interaction */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes earWiggle {
          0%, 100% { transform: rotate(-15deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes earWiggleRight {
          0%, 100% { transform: rotate(15deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(20deg); }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes tailWagFast {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes whiskerTwitch {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes purr {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          75% { transform: translateX(1px); }
        }
        @keyframes meow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-30px) scale(1); opacity: 0; }
        }
        @keyframes yawn {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes stretch {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(3deg); }
        }
        @keyframes knead {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(0.95); }
        }
        @keyframes noseTwitch {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes earTwitch {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes lick {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        @keyframes vibrate {
          0%, 100% { transform: translate(0); }
          10% { transform: translate(-0.5px, 0.5px); }
          20% { transform: translate(0.5px, -0.5px); }
          30% { transform: translate(-0.5px, -0.5px); }
          40% { transform: translate(0.5px, 0.5px); }
          50% { transform: translate(-0.5px, 0.5px); }
          60% { transform: translate(0.5px, -0.5px); }
          70% { transform: translate(-0.5px, -0.5px); }
          80% { transform: translate(0.5px, 0.5px); }
          90% { transform: translate(-0.5px, 0.5px); }
        }
        @keyframes tonguePop {
          0%, 100% { opacity: 0; transform: translateY(5px); }
          50% { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathSteam {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 0.4; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(1.5); }
        }
        @keyframes earTuftWiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes noseWiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(2deg); }
        }
        @keyframes pawPadPress {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.85); }
        }
        @keyframes furShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes sleepBubble {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes tearDrop {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { transform: translateY(2px) scale(1); opacity: 0.6; }
          80% { transform: translateY(8px) scale(0.8); opacity: 0.4; }
          100% { transform: translateY(12px) scale(0); opacity: 0; }
        }
        @keyframes clawExtend {
          0%, 100% { transform: translateY(0) scaleY(0); opacity: 0; }
          50% { transform: translateY(-3px) scaleY(1); opacity: 1; }
        }
        @keyframes soundWave {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes annoyedShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes eyeLashFlutter {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.3); }
        }
        @keyframes dreamTwitch {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-1px) rotate(-2deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-1px) rotate(2deg); }
        }
        @keyframes sweatDrop {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          30% { transform: translateY(3px) scale(1); opacity: 0.8; }
          70% { transform: translateY(8px) scale(0.9); opacity: 0.6; }
          100% { transform: translateY(12px) scale(0); opacity: 0; }
        }
        @keyframes hiccup {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02) translateY(-2px); }
        }
        @keyframes sneezeShake {
          0%, 90% { transform: translateX(0) translateY(0); }
          92% { transform: translateX(-3px) translateY(-1px); }
          94% { transform: translateX(3px) translateY(-2px); }
          96% { transform: translateX(-2px) translateY(-1px); }
          98% { transform: translateX(2px) translateY(0); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes bellyBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes furWave {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(1deg); }
        }
        @keyframes earFlatten {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg) scaleY(0.8); }
        }
        .cat-breathe {
          animation: breathe ${3 / (petStats.isSleeping ? 0.5 : 1)}s ease-in-out infinite;
        }
        .sleep-bubble {
          animation: sleepBubble 2s ease-in-out;
        }
        .tear-drop {
          animation: tearDrop 2s ease-in-out;
        }
        .claw-extend {
          animation: clawExtend 0.3s ease-out forwards;
        }
        .sound-wave {
          animation: soundWave 1s ease-out infinite;
        }
        .annoyed-shake {
          animation: annoyedShake 0.2s ease-in-out infinite;
        }
        .eye-lash {
          animation: eyeLashFlutter 4s ease-in-out infinite;
        }
        .breath-steam {
          animation: breathSteam 3s ease-out infinite;
        }
        .ear-tuft {
          animation: earTuftWiggle 2s ease-in-out infinite;
        }
        .nose-wiggle {
          animation: noseWiggle 0.3s ease-in-out;
        }
        .paw-press {
          animation: pawPadPress 0.5s ease-in-out infinite;
        }
        .fur-shimmer {
          animation: furShimmer 4s ease-in-out infinite;
        }
        .dream-twitch {
          animation: dreamTwitch 0.8s ease-in-out;
        }
        .sweat-drop {
          animation: sweatDrop 2s ease-in-out;
        }
        .hiccup {
          animation: hiccup 0.6s ease-in-out;
        }
        .sneeze-shake {
          animation: sneezeShake 1s ease-in-out;
        }
        .belly-breath {
          animation: bellyBreath 2s ease-in-out infinite;
        }
        .fur-wave {
          animation: furWave 3s ease-in-out infinite;
        }
        .ear-flatten {
          animation: earFlatten 0.5s ease-in-out forwards;
        }
        .cat-blink {
          animation: blink ${4 * blinkSpeed}s infinite;
        }
        .cat-ear-left {
          animation: earWiggle ${isDragging ? '0.5' : '5'}s ease-in-out infinite;
        }
        .cat-ear-right {
          animation: earWiggleRight ${isDragging ? '0.5' : '5'}s ease-in-out infinite;
        }
        .cat-tail {
          animation: tailWag ${2 / tailSpeed}s ease-in-out infinite;
        }
        .cat-tail-excited {
          animation: tailWagFast ${0.5 / tailSpeed}s ease-in-out infinite;
        }
        .cat-whisker {
          animation: whiskerTwitch ${isDragging ? '0.5' : '3'}s ease-in-out infinite;
        }
        .cat-purr {
          animation: purr 0.1s ease-in-out infinite;
        }
        .cat-meow {
          animation: meow 0.3s ease-in-out;
        }
        .cat-yawn {
          animation: yawn 2s ease-in-out;
        }
        .cat-stretch {
          animation: stretch 1.5s ease-in-out;
        }
        .cat-knead {
          animation: knead 0.5s ease-in-out infinite;
        }
        .cat-nose-twitch {
          animation: noseTwitch 0.2s ease-in-out;
        }
        .cat-ear-twitch {
          animation: earTwitch 0.3s ease-in-out;
        }
        .cat-lick {
          animation: lick 0.8s ease-in-out;
        }
        .cat-vibrate {
          animation: vibrate 0.2s ease-in-out infinite;
        }
        .tongue-pop {
          animation: tonguePop 0.8s ease-in-out;
        }
        .heart-particle {
          animation: heartFloat 1s ease-out forwards;
        }
        .cursor-grab {
          cursor: grab;
        }
        .cursor-grabbing {
          cursor: grabbing;
        }
      `}</style>
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300"
        style={{
          background: darkMode
            ? "rgba(15, 23, 42, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: darkMode
            ? "1px solid rgba(236, 72, 153, 0.3)"
            : "1px solid rgba(236, 72, 153, 0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{
            borderColor: darkMode
              ? "rgba(236, 72, 153, 0.2)"
              : "rgba(236, 72, 153, 0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
              <Cat size={24} />
            </div>
            <div>
              <h3
                className={`font-bold text-lg ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {t.myPet || "Mening Petim"}
              </h3>
              <p
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Level {petStats.level} • {petStats.xp}/{petStats.maxXp} XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition-colors ${
                darkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
              title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                darkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Pet Scene Container */}
        <div className="p-6">
          <div
            className="rounded-2xl p-6 mb-4 relative overflow-hidden"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))"
                : "linear-gradient(135deg, rgba(236,72,153,0.05), rgba(168,85,247,0.05))",
              border: `1px solid ${
                darkMode ? "rgba(236,72,153,0.2)" : "rgba(236,72,153,0.15)"
              }`,
            }}
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-4 left-4 w-2 h-2 bg-pink-400/40 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="absolute top-8 right-8 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute bottom-6 left-8 w-2 h-2 bg-pink-400/30 rounded-full animate-bounce"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Interactive Realistic Animated 3D Cat */}
            <div className="flex flex-col items-center">
              {/* Shadow */}
              <div 
                className={`mb-1 rounded-full ${isKneading ? 'animate-pulse' : ''}`}
                style={{ 
                  width: isDragging ? "80px" : isKneading ? "90px" : "100px",
                  height: isDragging ? "10px" : isKneading ? "12px" : "14px",
                  background: "rgba(0,0,0,0.2)",
                  filter: "blur(8px)",
                  transition: "all 0.3s ease",
                  transform: `scale(${isStretching ? 1.2 : 1})`,
                }}
              />
              
              <div
                ref={catRef}
                className={`relative w-44 h-44 mb-4 cursor-grab select-none ${
                  isDragging ? 'cursor-grabbing cat-purr' : ''
                } ${petStats.isEating ? "scale-110" : ""} ${
                  petStats.isPlaying ? "animate-bounce" : ""
                } ${isMeowing ? 'cat-meow' : ''} ${
                  isYawning ? 'cat-yawn' : ''
                } ${isStretching ? 'cat-stretch' : ''} ${
                  bodyVibration ? 'cat-vibrate' : ''
                } ${isLicking ? 'cat-lick' : ''} ${
                  isHiccup ? 'hiccup' : ''
                } ${isSneeze ? 'sneeze-shake' : ''} ${
                  furTexture ? 'fur-wave' : ''
                }`}
                style={{
                  transform: isDragging 
                    ? `translate(${catPosition.x}px, ${catPosition.y}px) scale(1.05) rotate(${headTilt}deg)` 
                    : petStats.isEating
                    ? "scale(1.1)"
                    : petStats.isPlaying
                    ? "rotate(5deg)"
                    : isHovering
                    ? `scale(1.05) rotate(${headTilt * 0.5}deg)`
                    : `scale(1) rotate(${headTilt * 0.3}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                }}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => {
                  setIsHovering(true);
                  playPurr();
                }}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => {
                  setClickCount(prev => prev + 1);
                  playMeow();
                }}
              >
                {/* Yawn bubble */}
                {isYawning && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl z-50">
                    <span className="text-lg">😮 Haa-a-a-ap...</span>
                  </div>
                )}
                
                {/* Stretch indicator */}
                {isStretching && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl animate-bounce">
                    ✨
                  </div>
                )}

                {/* Annoyed indicator - too many clicks */}
                {isAnnoyed && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-100 px-3 py-1 rounded-full shadow-lg annoyed-shake z-50">
                    <span className="text-lg">😾 Stop it!</span>
                  </div>
                )}

                {/* Sweat drops when nervous or tired */}
                {sweatDrop && (
                  <>
                    <div 
                      className="absolute top-12 left-1/4 sweat-drop"
                      style={{
                        width: "4px",
                        height: "6px",
                        background: "linear-gradient(to bottom, #60a5fa, #3b82f6)",
                        borderRadius: "50%",
                        marginLeft: "-30px",
                      }}
                    />
                    <div 
                      className="absolute top-10 right-1/4 sweat-drop"
                      style={{
                        width: "3px",
                        height: "5px",
                        background: "linear-gradient(to bottom, #60a5fa, #3b82f6)",
                        borderRadius: "50%",
                        marginRight: "-25px",
                        animationDelay: "0.3s",
                      }}
                    />
                  </>
                )}

                {/* Hiccup bubble */}
                {isHiccup && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-50 px-2 py-1 rounded-full shadow-md z-50">
                    <span className="text-sm font-bold text-blue-500">Hic! 💨</span>
                  </div>
                )}

                {/* Sneeze effect */}
                {isSneeze && (
                  <>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 px-3 py-1 rounded-full shadow-lg z-50">
                      <span className="text-lg font-bold text-yellow-600">Achoo! 🤧</span>
                    </div>
                    <div 
                      className="absolute top-20 left-1/2 transform -translate-x-1/2"
                      style={{
                        width: "20px",
                        height: "20px",
                        background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
                        borderRadius: "50%",
                        animation: "soundWave 0.5s ease-out",
                      }}
                    />
                  </>
                )}

                {/* Sleep bubble (anime style) */}
                {sleepBubble && petStats.isSleeping && (
                  <div 
                    className="absolute top-16 right-2 sleep-bubble"
                    style={{
                      width: "12px",
                      height: "12px",
                      background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(200,230,255,0.6))",
                      borderRadius: "50%",
                      boxShadow: "0 0 10px rgba(200,230,255,0.5), inset -2px -2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
                {/* Heart particles when petting */}
                {(isDragging || isHovering) && (
                  <>
                    <div className="absolute -top-4 left-1/4 heart-particle text-pink-500 text-lg">💗</div>
                    <div className="absolute -top-6 right-1/4 heart-particle text-pink-400 text-sm" style={{ animationDelay: '0.3s' }}>💖</div>
                  </>
                )}

                {/* Meow bubble with sound waves */}
                {isMeowing && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg animate-bounce">
                    <span className="text-sm font-bold text-pink-500">Meow! 🎵</span>
                  </div>
                )}
                
                {/* Sound waves when meowing */}
                {isMeowing && (
                  <>
                    <div 
                      className="absolute -top-6 left-1/4 sound-wave"
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid rgba(236, 72, 153, 0.5)",
                        borderRadius: "50%",
                        animationDelay: "0s",
                      }}
                    />
                    <div 
                      className="absolute -top-6 right-1/4 sound-wave"
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid rgba(236, 72, 153, 0.5)",
                        borderRadius: "50%",
                        animationDelay: "0.3s",
                      }}
                    />
                  </>
                )}

                {/* Tail - position changes with mood, speed with excitement */}
                <div 
                  className={`absolute -bottom-4 left-1/2 ${tailSpeed > 1 ? 'cat-tail-excited' : 'cat-tail'}`}
                  style={{
                    width: "18px",
                    height: "50px",
                    background: isDragging 
                      ? "linear-gradient(to bottom, #f9a8d4, #ec4899, #be185d)"
                      : "linear-gradient(to bottom, #ec4899, #be185d)",
                    borderRadius: "9px",
                    transformOrigin: "top center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                    marginLeft: tailPosition === 1 ? "15px" : tailPosition === -1 ? "30px" : "22px",
                    transform: `rotate(${tailPosition === 1 ? '-10deg' : tailPosition === -1 ? '20deg' : '0deg'})`,
                    zIndex: -1,
                    transition: "all 0.5s ease",
                  }}
                />

                {/* Cat Body - 3D Sphere with breathing animation */}
                <div 
                  className="absolute inset-0 rounded-full cat-breathe"
                  style={{
                    background: isDragging
                      ? "radial-gradient(circle at 30% 30%, #fef3f3, #fce7f3, #fbcfe8, #f9a8d4, #ec4899)"
                      : "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4, #ec4899, #be185d)",
                    boxShadow: isDragging
                      ? "0 25px 70px rgba(236, 72, 153, 0.6), inset -10px -10px 30px rgba(0,0,0,0.2), inset 10px 10px 30px rgba(255,255,255,0.4)"
                      : "0 20px 60px rgba(236, 72, 153, 0.5), inset -10px -10px 30px rgba(0,0,0,0.2), inset 10px 10px 30px rgba(255,255,255,0.3)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Belly breathing - chest expansion */}
                  <div 
                    className="absolute top-16 left-1/2 transform -translate-x-1/2 belly-breath"
                    style={{
                      width: "50px",
                      height: "30px",
                      background: "radial-gradient(circle, rgba(252,231,243,0.6), transparent)",
                      borderRadius: "50%",
                      filter: "blur(3px)",
                    }}
                  />
                  
                  {/* Fur texture spots */}
                  <div className="absolute top-8 left-8 w-3 h-3 rounded-full opacity-20" style={{ background: "#be185d" }} />
                  <div className="absolute top-12 right-10 w-2 h-2 rounded-full opacity-20" style={{ background: "#be185d" }} />
                  <div className="absolute bottom-16 left-12 w-2 h-2 rounded-full opacity-20" style={{ background: "#be185d" }} />
                  
                  {/* Fur direction lines */}
                  <div className="absolute top-20 left-6 w-4 h-0.5 bg-pink-300/20 rounded transform rotate-45" />
                  <div className="absolute top-24 right-6 w-4 h-0.5 bg-pink-300/20 rounded transform -rotate-45" />
                  <div className="absolute bottom-20 left-8 w-3 h-0.5 bg-pink-300/20 rounded transform rotate-12" />
                </div>
                
                {/* Cat Ears with wiggle animation and flatten when annoyed */}
                <div 
                  className={`absolute -top-3 left-5 w-0 h-0 cat-ear-left ${isDragging ? 'animate-pulse' : ''} ${earTwitchLeft ? 'cat-ear-twitch' : ''} ${isAnnoyed ? 'ear-flatten' : ''} ${dreamTwitch ? 'dream-twitch' : ''}`}
                  style={{
                    borderLeft: "18px solid transparent",
                    borderRight: "18px solid transparent",
                    borderBottom: isDragging ? "32px solid #f9a8d4" : "32px solid #ec4899",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
                    transformOrigin: "bottom center",
                    transition: "border-color 0.3s ease",
                    transform: isAnnoyed 
                      ? 'rotate(-25deg) scaleY(0.7)' 
                      : `rotate(${earTwitchLeft ? '-25deg' : '-15deg'})`,
                  }}
                />
                <div 
                  className={`absolute -top-3 right-5 w-0 h-0 cat-ear-right ${isDragging ? 'animate-pulse' : ''} ${earTwitchRight ? 'cat-ear-twitch' : ''} ${isAnnoyed ? 'ear-flatten' : ''} ${dreamTwitch ? 'dream-twitch' : ''}`}
                  style={{
                    borderLeft: "18px solid transparent",
                    borderRight: "18px solid transparent",
                    borderBottom: isDragging ? "32px solid #f9a8d4" : "32px solid #ec4899",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
                    transformOrigin: "bottom center",
                    transition: "border-color 0.3 ease",
                    transform: isAnnoyed 
                      ? 'rotate(25deg) scaleY(0.7)' 
                      : `rotate(${earTwitchRight ? '25deg' : '15deg'})`,
                  }}
                />
                
                {/* Inner Ears */}
                <div 
                  className="absolute top-0 left-7 w-0 h-0"
                  style={{
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderBottom: "18px solid #fce7f3",
                    transform: "rotate(-15deg)",
                  }}
                />
                <div 
                  className="absolute top-0 right-7 w-0 h-0"
                  style={{
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderBottom: "18px solid #fce7f3",
                    transform: "rotate(15deg)",
                  }}
                />

                {/* Ear Tufts - hair on top of ears */}
                <div 
                  className="absolute -top-6 left-6 ear-tuft"
                  style={{
                    width: "6px",
                    height: "12px",
                    background: "linear-gradient(to bottom, #ec4899, #be185d)",
                    borderRadius: "50% 50% 0 0",
                    transform: "rotate(-20deg)",
                  }}
                />
                <div 
                  className="absolute -top-6 right-6 ear-tuft"
                  style={{
                    width: "6px",
                    height: "12px",
                    background: "linear-gradient(to bottom, #ec4899, #be185d)",
                    borderRadius: "50% 50% 0 0",
                    transform: "rotate(20deg)",
                  }}
                />

                {/* Eyebrows - curved lines above eyes */}
                <div 
                  className="absolute top-12 left-1/2 transform -translate-x-1/2"
                  style={{ display: "flex", gap: "20px" }}
                >
                  {/* Left eyebrow */}
                  <div 
                    style={{
                      width: "18px",
                      height: "6px",
                      borderTop: "3px solid #831843",
                      borderRadius: "50% 50% 0 0",
                      transform: `rotate(${eyeOffset.x > 2 ? '15deg' : eyeOffset.x < -2 ? '-15deg' : '0deg'})`,
                      transition: "transform 0.2s ease",
                      opacity: 0.7,
                    }}
                  />
                  {/* Right eyebrow */}
                  <div 
                    style={{
                      width: "18px",
                      height: "6px",
                      borderTop: "3px solid #831843",
                      borderRadius: "50% 50% 0 0",
                      transform: `rotate(${eyeOffset.x > 2 ? '-15deg' : eyeOffset.x < -2 ? '15deg' : '0deg'})`,
                      transition: "transform 0.2s ease",
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Eyes Container - with blinking and mouse tracking */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 flex gap-3">
                  {/* Left Eye */}
                  <div 
                    className="w-11 h-14 rounded-full bg-white relative overflow-hidden"
                    style={{ 
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Eye shine - moves with mouse, intensity changes with mood */}
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-white transition-all duration-100"
                      style={{ 
                        top: `${2 + eyeOffset.y * 0.5}px`,
                        left: `${2 + eyeOffset.x * 0.5}px`,
                        opacity: eyeShineIntensity,
                        boxShadow: `0 0 ${4 * eyeShineIntensity}px rgba(255,255,255,${eyeShineIntensity})`,
                      }}
                    />
                    
                    {/* Eye Lashes */}
                    {eyeLashes && !petStats.isSleeping && (
                      <>
                        <div 
                          className="absolute top-0 left-1 eye-lash"
                          style={{
                            width: "2px",
                            height: "4px",
                            background: "#831843",
                            borderRadius: "1px",
                            transform: "rotate(-20deg)",
                            opacity: 0.6,
                          }}
                        />
                        <div 
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 eye-lash"
                          style={{
                            width: "2px",
                            height: "5px",
                            background: "#831843",
                            borderRadius: "1px",
                            opacity: 0.6,
                            animationDelay: "0.1s",
                          }}
                        />
                        <div 
                          className="absolute top-0 right-1 eye-lash"
                          style={{
                            width: "2px",
                            height: "4px",
                            background: "#831843",
                            borderRadius: "1px",
                            transform: "rotate(20deg)",
                            opacity: 0.6,
                            animationDelay: "0.2s",
                          }}
                        />
                      </>
                    )}
                    
                    {/* Pupil with blinking and mouse tracking */}
                    <div 
                      className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-7 h-9 rounded-full ${!petStats.isSleeping ? 'cat-blink' : ''}`}
                      style={{ 
                        background: petStats.isSleeping 
                          ? "#374151" 
                          : petStats.energy < 30 
                            ? "linear-gradient(180deg, #ef4444, #dc2626)" 
                            : "linear-gradient(180deg, #10b981, #059669)",
                        height: petStats.isSleeping ? "2px" : eyeWiden ? "40px" : "36px",
                        top: petStats.isSleeping ? "26px" : `${8 + eyeOffset.y}px`,
                        boxShadow: petStats.isSleeping ? "none" : "inset 0 2px 4px rgba(0,0,0,0.2)",
                        transform: `translateX(${eyeOffset.x}px)`,
                        transition: "transform 0.1s ease-out, height 0.2s ease",
                      }}
                    >
                      {!petStats.isSleeping && (
                        <div 
                          className="absolute w-2 h-2 rounded-full bg-white opacity-70 transition-all duration-100"
                          style={{ 
                            top: `${1 + eyeOffset.y * 0.3}px`,
                            right: `${1.5 - eyeOffset.x * 0.3}px`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Right Eye */}
                  <div 
                    className="w-11 h-14 rounded-full bg-white relative overflow-hidden"
                    style={{ 
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Eye shine - moves with mouse, intensity changes with mood */}
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-white transition-all duration-100"
                      style={{ 
                        top: `${2 + eyeOffset.y * 0.5}px`,
                        left: `${2 + eyeOffset.x * 0.5}px`,
                        opacity: eyeShineIntensity,
                        boxShadow: `0 0 ${4 * eyeShineIntensity}px rgba(255,255,255,${eyeShineIntensity})`,
                      }}
                    />
                    
                    {/* Eye Lashes */}
                    {eyeLashes && !petStats.isSleeping && (
                      <>
                        <div 
                          className="absolute top-0 left-1 eye-lash"
                          style={{
                            width: "2px",
                            height: "4px",
                            background: "#831843",
                            borderRadius: "1px",
                            transform: "rotate(-20deg)",
                            opacity: 0.6,
                          }}
                        />
                        <div 
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 eye-lash"
                          style={{
                            width: "2px",
                            height: "5px",
                            background: "#831843",
                            borderRadius: "1px",
                            opacity: 0.6,
                            animationDelay: "0.1s",
                          }}
                        />
                        <div 
                          className="absolute top-0 right-1 eye-lash"
                          style={{
                            width: "2px",
                            height: "4px",
                            background: "#831843",
                            borderRadius: "1px",
                            transform: "rotate(20deg)",
                            opacity: 0.6,
                            animationDelay: "0.2s",
                          }}
                        />
                      </>
                    )}
                    
                    {/* Pupil with blinking and mouse tracking */}
                    <div 
                      className={`absolute top-3 left-1/2 transform -translate-x-1/2 w-7 h-9 rounded-full ${!petStats.isSleeping ? 'cat-blink' : ''}`}
                      style={{ 
                        background: petStats.isSleeping 
                          ? "#374151" 
                          : petStats.energy < 30 
                            ? "linear-gradient(180deg, #ef4444, #dc2626)" 
                            : "linear-gradient(180deg, #10b981, #059669)",
                        height: petStats.isSleeping ? "2px" : eyeWiden ? "40px" : "36px",
                        top: petStats.isSleeping ? "26px" : `${8 + eyeOffset.y}px`,
                        boxShadow: petStats.isSleeping ? "none" : "inset 0 2px 4px rgba(0,0,0,0.2)",
                        transform: `translateX(${eyeOffset.x}px)`,
                        transition: "transform 0.1s ease-out, height 0.2s ease",
                      }}
                    >
                      {!petStats.isSleeping && (
                        <div 
                          className="absolute w-2 h-2 rounded-full bg-white opacity-70 transition-all duration-100"
                          style={{ 
                            top: `${1 + eyeOffset.y * 0.3}px`,
                            right: `${1.5 - eyeOffset.x * 0.3}px`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Nose Spots - small spots above nose */}
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <div 
                    className="w-1.5 h-1.5 rounded-full opacity-40 fur-shimmer"
                    style={{ background: "#be185d" }}
                  />
                  <div 
                    className="w-1 h-1 rounded-full opacity-30 fur-shimmer"
                    style={{ background: "#be185d", animationDelay: "1s" }}
                  />
                </div>

                {/* Tears when yawning (watery eyes) */}
                {showTears && (
                  <>
                    <div 
                      className="absolute top-28 left-1/4 tear-drop"
                      style={{
                        width: "3px",
                        height: "4px",
                        background: "linear-gradient(to bottom, rgba(200,230,255,0.8), rgba(255,255,255,0.4))",
                        borderRadius: "50%",
                        marginLeft: "-25px",
                      }}
                    />
                    <div 
                      className="absolute top-28 right-1/4 tear-drop"
                      style={{
                        width: "3px",
                        height: "4px",
                        background: "linear-gradient(to bottom, rgba(200,230,255,0.8), rgba(255,255,255,0.4))",
                        borderRadius: "50%",
                        marginRight: "-25px",
                        animationDelay: "0.2s",
                      }}
                    />
                  </>
                )}

                {/* Breathing Steam (from nose when cold or sleeping) */}
                {(petStats.isSleeping || isYawning) && (
                  <div className="absolute top-30 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="breath-steam"
                      style={{
                        width: "4px",
                        height: "8px",
                        background: "linear-gradient(to top, rgba(255,255,255,0.4), transparent)",
                        borderRadius: "50%",
                        marginLeft: "-8px",
                      }}
                    />
                    <div 
                      className="breath-steam"
                      style={{
                        width: "4px",
                        height: "8px",
                        background: "linear-gradient(to top, rgba(255,255,255,0.4), transparent)",
                        borderRadius: "50%",
                        marginLeft: "8px",
                        animationDelay: "0.5s",
                      }}
                    />
                  </div>
                )}

                {/* Nose - 3D effect with twitch */}
                <div 
                  className={`absolute top-28 left-1/2 transform -translate-x-1/2 ${noseTwitch ? 'cat-nose-twitch' : ''}`}
                  style={{ 
                    width: "14px",
                    height: "10px",
                    background: "linear-gradient(135deg, #fca5a5, #f472b6)",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)",
                    transform: `translateX(-50%) ${noseTwitch ? 'scale(1.15)' : 'scale(1)'}`,
                    transition: "transform 0.1s ease",
                  }}
                />

                {/* Mouth - more realistic 3D */}
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 flex">
                  <div 
                    className="w-5 h-4 border-b-2 border-r-2 rounded-br-full"
                    style={{ 
                      borderColor: "#be185d",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div 
                    className="w-5 h-4 border-b-2 border-l-2 rounded-bl-full"
                    style={{ 
                      borderColor: "#be185d",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>

                {/* Tongue - for licking animation */}
                {isLicking && (
                  <div 
                    className="absolute top-34 left-1/2 transform -translate-x-1/2 tongue-pop"
                    style={{
                      width: "10px",
                      height: "12px",
                      background: "linear-gradient(135deg, #fda4af, #f43f5e)",
                      borderRadius: "50%",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                )}

                {/* Teeth - tiny fangs visible when yawning or meowing */}
                {(isYawning || isMeowing) && (
                  <div className="absolute top-34 left-1/2 transform -translate-x-1/2 flex">
                    <div 
                      className="w-1 h-2 bg-white rounded-full"
                      style={{ 
                        marginRight: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    />
                    <div 
                      className="w-1 h-2 bg-white rounded-full"
                      style={{ 
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                )}

                {/* Animated Whiskers Left with dynamic movement */}
                <div className={`absolute top-22 left-1 cat-whisker ${dreamTwitch ? 'dream-twitch' : ''}`}>
                  <div 
                    className="w-10 h-0.5 bg-slate-300 rounded transform -rotate-6 mb-1.5" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${-6 + eyeOffset.x * 0.5}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                  <div 
                    className="w-8 h-0.5 bg-slate-300 rounded mb-1.5" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${eyeOffset.x * 0.3}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                  <div 
                    className="w-9 h-0.5 bg-slate-300 rounded transform rotate-6" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${6 + eyeOffset.x * 0.5}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                </div>
                
                {/* Animated Whiskers Right with dynamic movement */}
                <div className={`absolute top-22 right-1 cat-whisker ${dreamTwitch ? 'dream-twitch' : ''}`} style={{ animationDelay: "1.5s" }}>
                  <div 
                    className="w-10 h-0.5 bg-slate-300 rounded transform rotate-6 mb-1.5" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${6 - eyeOffset.x * 0.5}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                  <div 
                    className="w-8 h-0.5 bg-slate-300 rounded mb-1.5" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${-eyeOffset.x * 0.3}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                  <div 
                    className="w-9 h-0.5 bg-slate-300 rounded transform -rotate-6" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transform: `rotate(${-6 - eyeOffset.x * 0.5}deg)`,
                      transition: "transform 0.2s ease",
                    }} 
                  />
                </div>

                {/* Side Cheek Whiskers - smaller whiskers on cheeks */}
                <div className={`absolute top-26 left-2 ${dreamTwitch ? 'dream-twitch' : ''}`}>
                  <div 
                    className="w-6 h-0.5 bg-slate-300/70 rounded transform -rotate-12 mb-1" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      transform: `rotate(${-12 + eyeOffset.x * 0.3}deg)`,
                    }} 
                  />
                  <div 
                    className="w-5 h-0.5 bg-slate-300/70 rounded transform -rotate-6" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      transform: `rotate(${-6 + eyeOffset.x * 0.2}deg)`,
                    }} 
                  />
                </div>
                <div className={`absolute top-26 right-2 ${dreamTwitch ? 'dream-twitch' : ''}`}>
                  <div 
                    className="w-6 h-0.5 bg-slate-300/70 rounded transform rotate-12 mb-1" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      transform: `rotate(${12 - eyeOffset.x * 0.3}deg)`,
                    }} 
                  />
                  <div 
                    className="w-5 h-0.5 bg-slate-300/70 rounded transform rotate-6" 
                    style={{ 
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      transform: `rotate(${6 - eyeOffset.x * 0.2}deg)`,
                    }} 
                  />
                </div>

                {/* Cheeks Blush - glowing effect */}
                <div 
                  className="absolute top-26 left-4 w-8 h-5 rounded-full"
                  style={{ 
                    background: isDragging 
                      ? "radial-gradient(circle, #f9a8d4, transparent)" 
                      : "radial-gradient(circle, #fbcfe8, transparent)",
                    opacity: isDragging ? 0.8 : 0.6,
                    filter: "blur(2px)",
                    transition: "all 0.3s ease",
                  }}
                />
                <div 
                  className="absolute top-26 right-4 w-8 h-5 rounded-full"
                  style={{ 
                    background: isDragging 
                      ? "radial-gradient(circle, #f9a8d4, transparent)" 
                      : "radial-gradient(circle, #fbcfe8, transparent)",
                    opacity: isDragging ? 0.8 : 0.6,
                    filter: "blur(2px)",
                    transition: "all 0.3s ease",
                  }}
                />

                {/* Small paws at bottom with kneading animation, paw pads, claws, and dream twitch */}
                <div 
                  className={`absolute bottom-2 left-12 w-6 h-5 rounded-full ${isKneading ? 'cat-knead' : ''} ${dreamTwitch ? 'dream-twitch' : ''}`}
                  style={{ 
                    background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    animationDelay: "0s",
                  }}
                >
                  {/* Paw pad */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: "8px",
                      height: "6px",
                      background: "linear-gradient(135deg, #f472b6, #ec4899)",
                      borderRadius: "40%",
                      opacity: 0.6,
                    }}
                  />
                  {/* Claws - extend when kneading */}
                  {showClaws && (
                    <>
                      <div 
                        className="absolute -top-1 left-1 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      />
                      <div 
                        className="absolute -top-1 left-2 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          animationDelay: "0.1s",
                        }}
                      />
                      <div 
                        className="absolute -top-1 left-3 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          animationDelay: "0.2s",
                        }}
                      />
                    </>
                  )}
                </div>
                <div 
                  className={`absolute bottom-2 right-12 w-6 h-5 rounded-full ${isKneading ? 'cat-knead' : ''} ${dreamTwitch ? 'dream-twitch' : ''}`}
                  style={{ 
                    background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    animationDelay: "0.25s",
                  }}
                >
                  {/* Paw pad */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: "8px",
                      height: "6px",
                      background: "linear-gradient(135deg, #f472b6, #ec4899)",
                      borderRadius: "40%",
                      opacity: 0.6,
                    }}
                  />
                  {/* Claws - extend when kneading */}
                  {showClaws && (
                    <>
                      <div 
                        className="absolute -top-1 right-1 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      />
                      <div 
                        className="absolute -top-1 right-2 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          animationDelay: "0.1s",
                        }}
                      />
                      <div 
                        className="absolute -top-1 right-3 claw-extend"
                        style={{
                          width: "2px",
                          height: "4px",
                          background: "linear-gradient(to top, #e5e7eb, #f3f4f6)",
                          borderRadius: "1px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          animationDelay: "0.2s",
                        }}
                      />
                    </>
                  )}
                </div>
                
                {/* Fur collar / neck fluff */}
                <div 
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                  style={{
                    width: "60px",
                    height: "12px",
                    background: "radial-gradient(circle, #fce7f3 30%, transparent 70%)",
                    borderRadius: "50%",
                    opacity: 0.5,
                    filter: "blur(2px)",
                  }}
                />
              </div>

              {/* Interaction hint */}
              <div className="text-center">
                <h4
                  className={`font-bold text-xl mb-1 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {t.myPet || "Mushukcham"}
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Level {petStats.level} • {petStats.xp}/{petStats.maxXp} XP
                </p>
                <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {isDragging 
                    ? "💗 Purring..." 
                    : isHovering 
                    ? "🐱 Pet me!" 
                    : isYawning 
                    ? "😮 Yawning..."
                    : isStretching
                    ? "✨ Stretching..."
                    : isLicking
                    ? "👅 Licking..."
                    : "👆 Drag or hover me!"}
                </p>
              </div>
            </div>

            {/* Dynamic Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div
                className="text-center p-3 rounded-xl"
                style={{
                  background: darkMode
                    ? "rgba(30,41,59,0.5)"
                    : "rgba(255,255,255,0.7)",
                }}
              >
                <div className="text-xl mb-1 flex justify-center">
                  <Smile size={20} style={{ color: "#10b981" }} />
                </div>
                <div className="text-sm font-bold" style={{ color: "#10b981" }}>
                  {petStats.happiness}%
                </div>
                <div className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.happiness || "Baxt"}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${petStats.happiness}%`, backgroundColor: "#10b981" }} />
                </div>
              </div>
              
              <div
                className="text-center p-3 rounded-xl"
                style={{
                  background: darkMode
                    ? "rgba(30,41,59,0.5)"
                    : "rgba(255,255,255,0.7)",
                }}
              >
                <div className="text-xl mb-1 flex justify-center">
                  <Drumstick size={20} style={{ color: "#f59e0b" }} />
                </div>
                <div className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                  {petStats.hunger}%
                </div>
                <div className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.hunger || "Ochlik"}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${petStats.hunger}%`, backgroundColor: "#f59e0b" }} />
                </div>
              </div>
              
              <div
                className="text-center p-3 rounded-xl"
                style={{
                  background: darkMode
                    ? "rgba(30,41,59,0.5)"
                    : "rgba(255,255,255,0.7)",
                }}
              >
                <div className="text-xl mb-1 flex justify-center">
                  <Zap size={20} style={{ color: "#3b82f6" }} />
                </div>
                <div className="text-sm font-bold" style={{ color: "#3b82f6" }}>
                  {petStats.energy}%
                </div>
                <div className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {t.energy || "Energiya"}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${petStats.energy}%`, backgroundColor: "#3b82f6" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Working */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={feedPet}
              disabled={petStats.isEating || petStats.hunger <= 0}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                petStats.isEating ? "animate-pulse" : ""
              }`}
            >
              <span>{petStats.isEating ? <Cookie size={18} /> : <Drumstick size={18} />}</span>
              {petStats.isEating
                ? t.eating || "Yeymoqda..."
                : t.feed || "Oziqlantirish"}
            </button>
            <button
              onClick={playWithPet}
              disabled={petStats.isPlaying || petStats.energy < 20}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                petStats.isPlaying ? "animate-pulse" : ""
              }`}
            >
              <span>{petStats.isPlaying ? <Smile size={18} /> : <Gamepad2 size={18} />}</span>
              {petStats.isPlaying
                ? t.playing || "O'ynamoqda..."
                : t.play || "O'ynash"}
            </button>
          </div>

          {/* XP Progress - Dynamic */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
                Level {petStats.level}
              </span>
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
                {petStats.xp} / {petStats.maxXp} XP
              </span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{
                background: darkMode
                  ? "rgba(30,41,59,0.8)"
                  : "rgba(226,232,240,0.8)",
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(petStats.xp / petStats.maxXp) * 100}%` }}
              />
            </div>
          </div>

          {/* Hint */}
          <p className={`text-xs text-center mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {t.petHint || "Har 1 daqiqada ochlik oshadi. Petni oziqlantiring va o'ynang!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetSystem;
