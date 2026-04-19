import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "../../context/useLang";
import { useAuth } from "../../context/useAuth";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeft, 
  Heart, 
  Zap, 
  Smile, 
  Trophy,
  Cat,
  Drumstick,
  Gamepad2,
  Moon,
  Sun,
  Cloud,
  Cookie,
  Volume2,
  VolumeX,
} from "lucide-react";

const PetGame = ({ darkMode, onBack, showToast }) => {
  const { t } = useLang();
  const { user } = useAuth();
  
  const [pet, setPet] = useState({
    x: 50,
    y: 50,
    targetX: 50,
    targetY: 50,
    isMoving: false,
    isSleeping: false,
    energy: 100,
    happiness: 80,
    hunger: 30,
    score: 0,
    level: 1,
  });

  const [items, setItems] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Interactive states
  const catRef = useRef(null);
  const audioContextRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPurring, setIsPurring] = useState(false);
  const [isMeowing, setIsMeowing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tailSpeed, setTailSpeed] = useState(1);

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
    
    const createPurrCycle = () => {
      if (!isHovering) {
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
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      lfo.frequency.setValueAtTime(4, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
      lfo.stop(ctx.currentTime + 0.25);
      
      if (isHovering) {
        setTimeout(createPurrCycle, 250);
      } else {
        setIsPurring(false);
      }
    };
    
    createPurrCycle();
  }, [soundEnabled, isHovering, isPurring]);

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

  // Mouse tracking for eye movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!catRef.current || !gameStarted) return;
      
      const rect = catRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - catCenterY, e.clientX - catCenterX);
      const distance = Math.min(6, Math.hypot(e.clientX - catCenterX, e.clientY - catCenterY) / 15);
      
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      setEyeOffset({ x: offsetX, y: offsetY });
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Increase tail wag when mouse is near
      const distToCat = Math.hypot(e.clientX - catCenterX, e.clientY - catCenterY);
      if (distToCat < 120) {
        setTailSpeed(2);
      } else {
        setTailSpeed(1);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameStarted]);

  // Load pet data from Firebase
  useEffect(() => {
    if (!user) return;
    
    const petRef = doc(db, "users", user.uid, "data", "pet");
    const unsubscribe = onSnapshot(petRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPet(prev => ({
          ...prev,
          energy: data.energy ?? 100,
          happiness: data.happiness ?? 80,
          hunger: data.hunger ?? 30,
        }));
      }
    });
    
    return () => unsubscribe();
  }, [user]);

  // Save pet data to Firebase
  const savePetData = async (updates) => {
    if (!user) return;
    
    const petRef = doc(db, "users", user.uid, "data", "pet");
    await setDoc(petRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  // Pet movement
  useEffect(() => {
    if (!gameStarted || pet.isSleeping) return;
    
    const interval = setInterval(() => {
      setPet(prev => {
        if (prev.isMoving) return prev;
        
        // Random movement
        const newTargetX = Math.max(10, Math.min(90, prev.targetX + (Math.random() - 0.5) * 20));
        const newTargetY = Math.max(20, Math.min(80, prev.targetY + (Math.random() - 0.5) * 20));
        
        return {
          ...prev,
          targetX: newTargetX,
          targetY: newTargetY,
          isMoving: true,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [gameStarted, pet.isSleeping]);

  // Smooth movement
  useEffect(() => {
    if (!pet.isMoving) return;
    
    const dx = pet.targetX - pet.x;
    const dy = pet.targetY - pet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 1) {
      setPet(prev => ({ ...prev, isMoving: false }));
      return;
    }

    const speed = 2;
    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;

    const interval = setInterval(() => {
      setPet(prev => {
        const newX = prev.x + moveX;
        const newY = prev.y + moveY;
        const newDistance = Math.sqrt(
          Math.pow(prev.targetX - newX, 2) + Math.pow(prev.targetY - newY, 2)
        );
        
        if (newDistance < 1) {
          return { ...prev, x: prev.targetX, y: prev.targetY, isMoving: false };
        }
        return { ...prev, x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [pet.isMoving, pet.targetX, pet.targetY, pet.x, pet.y]);

  // Stats decay - save to Firebase
  useEffect(() => {
    if (!gameStarted || !user) return;
    
    const interval = setInterval(async () => {
      const newStats = {
        energy: Math.max(0, pet.energy - (pet.isSleeping ? -5 : 2)),
        hunger: Math.min(100, pet.hunger + 3),
        happiness: Math.max(0, pet.happiness - 1),
      };
      setPet(prev => ({ ...prev, ...newStats }));
      await savePetData(newStats);
    }, 3000);

    return () => clearInterval(interval);
  }, [gameStarted, pet.isSleeping, user, pet.energy, pet.hunger, pet.happiness]);

  // Spawn items with Lucide icons
  useEffect(() => {
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      const types = ["food", "toy", "energy"];
      const type = types[Math.floor(Math.random() * types.length)];
      const newItem = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        type,
        iconType: type,
      };
      setItems(prev => [...prev.slice(-4), newItem]);
    }, 4000);

    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleItemClick = useCallback(async (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    
    let updates = {};
    let points = 10;
    
    if (item.type === "food") {
      updates = { 
        hunger: Math.max(0, pet.hunger - 30), 
        happiness: Math.min(100, pet.happiness + 5) 
      };
      showToast?.(t.petAte || "Yam-yam!", "success");
    } else if (item.type === "toy") {
      updates = { 
        happiness: Math.min(100, pet.happiness + 20), 
        energy: Math.max(0, pet.energy - 10) 
      };
      points = 20;
      showToast?.(t.petPlayed || "Kulgi!", "success");
    } else if (item.type === "energy") {
      updates = { energy: Math.min(100, pet.energy + 30) };
      showToast?.(t.petEnergized || "Energiya!", "success");
    }
    
    const newState = {
      ...pet,
      ...updates,
      score: pet.score + points,
      targetX: item.x,
      targetY: item.y,
      isMoving: true,
    };
    
    setPet(newState);
    await savePetData(updates);
  }, [showToast, t, pet]);

  const handleSleep = useCallback(async () => {
    const newSleepState = !pet.isSleeping;
    setPet(prev => ({ ...prev, isSleeping: newSleepState }));
    await savePetData({ isSleeping: newSleepState });
    showToast?.(pet.isSleeping ? t.petWokeUp || "Uyqidan uyg'ondi!" : t.petSleeping || "Pet uxlayapti...", "info");
  }, [pet.isSleeping, showToast, t]);

  if (!gameStarted) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
        <button onClick={onBack} className="fixed top-20 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-700 text-white hover:bg-slate-600">
          <ArrowLeft size={16} /> {t.back}
        </button>
        
        {/* CSS Animations for start screen */}
        <style>{`
          @keyframes startBreathe {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.04) translateY(-3px); }
          }
          @keyframes startBlink {
            0%, 92%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }
          @keyframes startEarWiggle {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(-20deg); }
          }
          @keyframes startEarWiggleRight {
            0%, 100% { transform: rotate(15deg); }
            50% { transform: rotate(20deg); }
          }
          @keyframes startTailWag {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
          }
          @keyframes startWhiskerTwitch {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes startShadow {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(0.9); opacity: 0.2; }
          }
          @keyframes earTuftWiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(5deg); }
          }
          @keyframes furShimmer {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .start-cat-breathe { animation: startBreathe 2s ease-in-out infinite; }
          .start-cat-blink { animation: startBlink 3s infinite; }
          .start-cat-ear-left { animation: startEarWiggle 3s ease-in-out infinite; transform-origin: bottom center; }
          .start-cat-ear-right { animation: startEarWiggleRight 3s ease-in-out infinite; transform-origin: bottom center; }
          .start-cat-tail { animation: startTailWag 1s ease-in-out infinite; }
          .start-cat-whisker { animation: startWhiskerTwitch 2s ease-in-out infinite; }
          .start-shadow { animation: startShadow 2s ease-in-out infinite; }
          .ear-tuft { animation: earTuftWiggle 2s ease-in-out infinite; }
          .fur-shimmer { animation: furShimmer 4s ease-in-out infinite; }
        `}</style>
        
        <div className="text-center">
          {/* Shadow under cat */}
          <div 
            className="mx-auto mb-2 start-shadow rounded-full"
            style={{ 
              width: "100px",
              height: "16px",
              background: "rgba(0,0,0,0.25)",
              filter: "blur(6px)",
            }}
          />
          
          {/* Super Realistic Animated 3D Cat */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-36 h-36 start-cat-breathe">
              {/* Animated Tail */}
              <div 
                className="absolute -bottom-2 left-1/2 start-cat-tail"
                style={{
                  width: "24px",
                  height: "60px",
                  background: "linear-gradient(to bottom, #f9a8d4, #ec4899)",
                  borderRadius: "12px",
                  transformOrigin: "top center",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  marginLeft: "28px",
                  zIndex: -1,
                }}
              />

              {/* Cat Body - 3D Sphere with breathing animation */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #fce7f3, #fbcfe8, #f9a8d4, #ec4899, #be185d)",
                  boxShadow: "0 25px 60px rgba(236, 72, 153, 0.4), inset -10px -10px 25px rgba(0,0,0,0.2), inset 10px 10px 25px rgba(255,255,255,0.35)",
                }}
              >
                {/* Fur spots pattern */}
                <div className="absolute top-4 left-5 w-2.5 h-2.5 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute top-8 right-6 w-2 h-2 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute bottom-10 left-7 w-2 h-2 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute top-12 left-4 w-1.5 h-1.5 rounded-full opacity-15" style={{ background: "#831843" }} />
              </div>
              
              {/* Cat Ears with wiggle animation */}
              <div 
                className="absolute -top-4 left-5 w-0 h-0 start-cat-ear-left"
                style={{
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderBottom: "32px solid #ec4899",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                }}
              />
              <div 
                className="absolute -top-4 right-5 w-0 h-0 start-cat-ear-right"
                style={{
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderBottom: "32px solid #ec4899",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                }}
              />
              
              {/* Inner Ears */}
              <div 
                className="absolute -top-1 left-7 w-0 h-0"
                style={{
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderBottom: "18px solid #fce7f3",
                  transform: "rotate(-15deg)",
                }}
              />
              <div 
                className="absolute -top-1 right-7 w-0 h-0"
                style={{
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderBottom: "18px solid #fce7f3",
                  transform: "rotate(15deg)",
                }}
              />

              {/* Ear Tufts */}
              <div 
                className="absolute -top-4 left-5 ear-tuft"
                style={{
                  width: "4px",
                  height: "8px",
                  background: "linear-gradient(to bottom, #ec4899, #be185d)",
                  borderRadius: "50% 50% 0 0",
                  transform: "rotate(-20deg)",
                }}
              />
              <div 
                className="absolute -top-4 right-5 ear-tuft"
                style={{
                  width: "4px",
                  height: "8px",
                  background: "linear-gradient(to bottom, #ec4899, #be185d)",
                  borderRadius: "50% 50% 0 0",
                  transform: "rotate(20deg)",
                }}
              />

              {/* Eyebrows */}
              <div 
                className="absolute top-6 left-1/2 transform -translate-x-1/2"
                style={{ display: "flex", gap: "14px" }}
              >
                <div 
                  style={{
                    width: "12px",
                    height: "4px",
                    borderTop: "2px solid #831843",
                    borderRadius: "50% 50% 0 0",
                    opacity: 0.7,
                  }}
                />
                <div 
                  style={{
                    width: "12px",
                    height: "4px",
                    borderTop: "2px solid #831843",
                    borderRadius: "50% 50% 0 0",
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Eyes Container with blinking and mouse tracking */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
                {/* Left Eye */}
                <div 
                  className="w-9 h-11 rounded-full bg-white relative overflow-hidden"
                  style={{ 
                    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Eye shine highlight - moves with mouse */}
                  <div 
                    className="absolute w-2.5 h-2.5 rounded-full bg-white opacity-90 transition-all duration-75"
                    style={{ 
                      top: `${2 + eyeOffset.y * 0.5}px`,
                      left: `${2 + eyeOffset.x * 0.5}px`,
                    }}
                  />
                  
                  {/* Pupil with blinking and mouse tracking */}
                  <div 
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 w-5 h-6 rounded-full start-cat-blink"
                    style={{ 
                      background: "linear-gradient(180deg, #10b981, #059669)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                      transform: `translateX(${eyeOffset.x * 0.8}px) translateY(${eyeOffset.y * 0.5}px)`,
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-white opacity-80 transition-all duration-75"
                      style={{
                        top: `${1 + eyeOffset.y * 0.3}px`,
                        right: `${1 - eyeOffset.x * 0.3}px`,
                      }}
                    />
                  </div>
                </div>
                
                {/* Right Eye */}
                <div 
                  className="w-9 h-11 rounded-full bg-white relative overflow-hidden"
                  style={{ 
                    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Eye shine highlight - moves with mouse */}
                  <div 
                    className="absolute w-2.5 h-2.5 rounded-full bg-white opacity-90 transition-all duration-75"
                    style={{ 
                      top: `${2 + eyeOffset.y * 0.5}px`,
                      left: `${2 + eyeOffset.x * 0.5}px`,
                    }}
                  />
                  
                  {/* Pupil with blinking and mouse tracking */}
                  <div 
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 w-5 h-6 rounded-full start-cat-blink"
                    style={{ 
                      background: "linear-gradient(180deg, #10b981, #059669)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                      transform: `translateX(${eyeOffset.x * 0.8}px) translateY(${eyeOffset.y * 0.5}px)`,
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-white opacity-80 transition-all duration-75"
                      style={{
                        top: `${1 + eyeOffset.y * 0.3}px`,
                        right: `${1 - eyeOffset.x * 0.3}px`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Nose - 3D realistic */}
              <div 
                className="absolute top-20 left-1/2 transform -translate-x-1/2"
                style={{ 
                  width: "12px",
                  height: "8px",
                  background: "linear-gradient(135deg, #fca5a5, #f9a8d4)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)",
                }}
              />

              {/* Mouth - realistic 3D */}
              <div className="absolute top-[88px] left-1/2 transform -translate-x-1/2 flex">
                <div 
                  className="w-4 h-4 border-b-2 border-r-2 rounded-br-full"
                  style={{ 
                    borderColor: "#be185d",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <div 
                  className="w-4 h-4 border-b-2 border-l-2 rounded-bl-full"
                  style={{ 
                    borderColor: "#be185d",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              {/* Animated Whiskers */}
              <div className="absolute top-16 left-1 start-cat-whisker">
                <div className="w-6 h-0.5 bg-slate-300 rounded transform -rotate-6 mb-1.5 shadow-sm" />
                <div className="w-5 h-0.5 bg-slate-300 rounded mb-1.5 shadow-sm" />
                <div className="w-5.5 h-0.5 bg-slate-300 rounded transform rotate-4 shadow-sm" />
              </div>
              <div className="absolute top-16 right-1 start-cat-whisker" style={{ animationDelay: "1s" }}>
                <div className="w-6 h-0.5 bg-slate-300 rounded transform rotate-6 mb-1.5 shadow-sm" />
                <div className="w-5 h-0.5 bg-slate-300 rounded mb-1.5 shadow-sm" />
                <div className="w-5.5 h-0.5 bg-slate-300 rounded transform -rotate-4 shadow-sm" />
              </div>

              {/* Cheeks Blush - glowing */}
              <div 
                className="absolute top-20 left-3 w-5 h-3 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, #fbcfe8, transparent)",
                  opacity: 0.5,
                  filter: "blur(2px)",
                }}
              />
              <div 
                className="absolute top-20 right-3 w-5 h-3 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, #fbcfe8, transparent)",
                  opacity: 0.5,
                  filter: "blur(2px)",
                }}
              />

              {/* Front Paws */}
              <div 
                className="absolute -bottom-1 left-6 w-6 h-5 rounded-full"
                style={{ 
                  background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              />
              <div 
                className="absolute -bottom-1 right-6 w-6 h-5 rounded-full"
                style={{ 
                  background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
            {t.petGameTitle || "Mushukcha O'yini"}
          </h1>
          <p className={`mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            {t.petGameDesc || "Mushukchaga qaram, oziqlantir va o'yna!"}
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Gamepad2 size={20} />
            {t.start || "Boshlash"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      <button onClick={onBack} className="fixed top-20 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-700 text-white hover:bg-slate-600">
        <ArrowLeft size={16} /> {t.back}
      </button>

      {/* Stats */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-800" : "bg-white"} shadow-lg`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Cat size={24} className="text-pink-500" />
              <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Level {pet.level} • {pet.score} {t.points || "ochko"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
                title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={handleSleep}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  pet.isSleeping 
                    ? "bg-yellow-500 text-white" 
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                {pet.isSleeping ? <><Sun size={16} /> {t.wakeUp || "Uyg'otish"}</> : <><Moon size={16} /> {t.sleep || "Uxlash"}</>}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                <Heart size={16} /> {pet.hunger}%
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${100 - pet.hunger}%` }} />
              </div>
              <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.hunger || "Ochlik"}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <Zap size={16} /> {pet.energy}%
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${pet.energy}%` }} />
              </div>
              <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.energy || "Energiya"}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-pink-500 mb-1">
                <Smile size={16} /> {pet.happiness}%
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-pink-500 transition-all" style={{ width: `${pet.happiness}%` }} />
              </div>
              <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{t.happiness || "Baxt"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gameBreathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-1px); }
        }
        @keyframes gameBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes gameEarWiggle {
          0%, 100% { transform: rotate(-15deg); }
          25% { transform: rotate(-18deg); }
          75% { transform: rotate(-12deg); }
        }
        @keyframes gameEarWiggleRight {
          0%, 100% { transform: rotate(15deg); }
          25% { transform: rotate(12deg); }
          75% { transform: rotate(18deg); }
        }
        @keyframes gameTailWag {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes gameWhiskerTwitch {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          50% { transform: rotate(1deg) translateX(1px); }
        }
        @keyframes gameFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes gameShadow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(0.95); opacity: 0.2; }
        }
        @keyframes gamePurr {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-0.5px); }
          75% { transform: translateX(0.5px); }
        }
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-20px) scale(1); opacity: 0; }
        }
        .game-cat-breathe {
          animation: gameBreathe 2.5s ease-in-out infinite;
        }
        .game-cat-purr {
          animation: gamePurr 0.1s ease-in-out infinite;
        }
        .heart-particle {
          animation: heartFloat 1s ease-out forwards;
        }
        .game-cat-blink {
          animation: gameBlink 3.5s infinite;
        }
        .game-cat-ear-left {
          animation: gameEarWiggle 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .game-cat-ear-right {
          animation: gameEarWiggleRight 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .game-cat-tail {
          animation: gameTailWag 1.5s ease-in-out infinite;
        }
        .game-cat-whisker {
          animation: gameWhiskerTwitch 2s ease-in-out infinite;
        }
        .game-cat-float {
          animation: gameFloat 3s ease-in-out infinite;
        }
        .game-shadow {
          animation: gameShadow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Game Area */}
      <div className="max-w-2xl mx-auto">
        <div 
          className={`relative rounded-3xl overflow-hidden ${darkMode ? "bg-slate-800" : "bg-white"} shadow-2xl`}
          style={{ height: "400px" }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-200 dark:from-slate-700 dark:to-slate-800" />
          
          {/* Clouds - SVG icons */}
          <div className="absolute top-4 left-10 opacity-60 animate-pulse">
            <Cloud size={40} className="text-white" />
          </div>
          <div className="absolute top-8 right-20 opacity-50 animate-pulse" style={{ animationDelay: "1s" }}>
            <Cloud size={32} className="text-white" />
          </div>
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-400 to-green-300 dark:from-slate-600 dark:to-slate-700" />
          
          {/* Items - Lucide Icons */}
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="absolute hover:scale-125 transition-transform animate-bounce p-2 rounded-full shadow-lg"
              style={{ left: `${item.x}%`, top: `${item.y}%`, background: item.type === 'food' ? '#f97316' : item.type === 'toy' ? '#ec4899' : '#3b82f6' }}
            >
              {item.type === 'food' && <Drumstick size={28} className="text-white" />}
              {item.type === 'toy' && <Gamepad2 size={28} className="text-white" />}
              {item.type === 'energy' && <Zap size={28} className="text-white" />}
            </button>
          ))}
          
          {/* Shadow under cat */}
          <div 
            className="absolute game-shadow rounded-full"
            style={{ 
              left: `${pet.x}%`, 
              top: `${pet.y + 18}%`,
              width: "60px",
              height: "12px",
              background: "rgba(0,0,0,0.3)",
              filter: "blur(4px)",
            }}
          />
          
          {/* Super Realistic Animated 3D Cat - Interactive */}
          <div
            ref={catRef}
            className={`absolute transition-all duration-300 cursor-pointer select-none ${
              pet.isSleeping ? "opacity-80" : ""
            } ${isHovering ? "scale-110" : ""} ${isMeowing ? "animate-bounce" : ""}`}
            style={{ 
              left: `${pet.x}%`, 
              top: `${pet.y}%`,
              transform: pet.isMoving ? "scaleX(-1)" : "scaleX(1)",
              filter: isHovering ? "brightness(1.1)" : "brightness(1)",
            }}
            onMouseEnter={() => {
              setIsHovering(true);
              playPurr();
              playHappySound();
            }}
            onMouseLeave={() => setIsHovering(false)}
            onClick={playMeow}
          >
            {/* Meow bubble */}
            {isMeowing && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
                <span className="text-xs font-bold text-pink-500">Meow! 🎵</span>
              </div>
            )}
            
            {/* Heart particles when hovering */}
            {isHovering && !pet.isSleeping && (
              <>
                <div className="absolute -top-2 left-1/4 heart-particle text-pink-500 text-sm">💗</div>
                <div className="absolute -top-4 right-1/4 heart-particle text-pink-400 text-xs" style={{ animationDelay: '0.3s' }}>💖</div>
              </>
            )}
            
            <div className={`relative w-24 h-24 game-cat-float ${isHovering ? 'game-cat-purr' : ''}`}>
              {/* Animated Tail */}
              <div 
                className="absolute -bottom-3 left-1/2 game-cat-tail"
                style={{
                  width: "20px",
                  height: "50px",
                  background: pet.isSleeping 
                    ? "linear-gradient(to bottom, #fbbf24, #f59e0b)"
                    : pet.energy < 30 
                      ? "linear-gradient(to bottom, #fca5a5, #ef4444)"
                      : pet.hunger > 70 
                        ? "linear-gradient(to bottom, #fdba74, #f97316)"
                        : "linear-gradient(to bottom, #f9a8d4, #ec4899)",
                  borderRadius: "10px",
                  transformOrigin: "top center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  marginLeft: "22px",
                  zIndex: -1,
                }}
              />

              {/* Cat Body - 3D Sphere with fur texture */}
              <div 
                className="absolute inset-0 rounded-full game-cat-breathe"
                style={{
                  background: pet.isSleeping 
                    ? "radial-gradient(circle at 30% 30%, #fef3c7, #fcd34d, #fbbf24, #f59e0b)"
                    : pet.energy < 30 
                      ? "radial-gradient(circle at 30% 30%, #fee2e2, #fca5a5, #f87171, #ef4444)"
                      : pet.hunger > 70 
                        ? "radial-gradient(circle at 30% 30%, #ffedd5, #fdba74, #fb923c, #f97316)"
                        : "radial-gradient(circle at 30% 30%, #fce7f3, #fbcfe8, #f9a8d4, #ec4899, #be185d)",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.25), inset -8px -8px 20px rgba(0,0,0,0.2), inset 8px 8px 20px rgba(255,255,255,0.35)",
                }}
              >
                {/* Fur spots pattern */}
                <div className="absolute top-3 left-4 w-2 h-2 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute top-6 right-5 w-1.5 h-1.5 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute bottom-8 left-6 w-1.5 h-1.5 rounded-full opacity-15" style={{ background: "#831843" }} />
                <div className="absolute top-10 left-3 w-1 h-1 rounded-full opacity-15" style={{ background: "#831843" }} />
              </div>
              
              {/* Cat Ears with wiggle animation */}
              <div 
                className="absolute -top-4 left-4 w-0 h-0 game-cat-ear-left"
                style={{
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderBottom: pet.isSleeping ? "28px solid #fbbf24" : pet.energy < 30 ? "28px solid #f87171" : pet.hunger > 70 ? "28px solid #fb923c" : "28px solid #ec4899",
                  filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.25))",
                }}
              />
              <div 
                className="absolute -top-4 right-4 w-0 h-0 game-cat-ear-right"
                style={{
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderBottom: pet.isSleeping ? "28px solid #fbbf24" : pet.energy < 30 ? "28px solid #f87171" : pet.hunger > 70 ? "28px solid #fb923c" : "28px solid #ec4899",
                  filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.25))",
                }}
              />
              
              {/* Inner Ears */}
              <div 
                className="absolute -top-1 left-6 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "16px solid #fce7f3",
                  transform: "rotate(-15deg)",
                }}
              />
              <div 
                className="absolute -top-1 right-6 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "16px solid #fce7f3",
                  transform: "rotate(15deg)",
                }}
              />

              {/* Ear Tufts */}
              <div 
                className="absolute -top-5 left-4 ear-tuft"
                style={{
                  width: "3px",
                  height: "6px",
                  background: pet.isSleeping 
                    ? "linear-gradient(to bottom, #fbbf24, #f59e0b)"
                    : "linear-gradient(to bottom, #ec4899, #be185d)",
                  borderRadius: "50% 50% 0 0",
                  transform: "rotate(-20deg)",
                }}
              />
              <div 
                className="absolute -top-5 right-4 ear-tuft"
                style={{
                  width: "3px",
                  height: "6px",
                  background: pet.isSleeping 
                    ? "linear-gradient(to bottom, #fbbf24, #f59e0b)"
                    : "linear-gradient(to bottom, #ec4899, #be185d)",
                  borderRadius: "50% 50% 0 0",
                  transform: "rotate(20deg)",
                }}
              />

              {/* Eyebrows */}
              <div 
                className="absolute top-4 left-1/2 transform -translate-x-1/2"
                style={{ display: "flex", gap: "10px" }}
              >
                <div 
                  style={{
                    width: "8px",
                    height: "3px",
                    borderTop: "2px solid #831843",
                    borderRadius: "50% 50% 0 0",
                    opacity: 0.7,
                  }}
                />
                <div 
                  style={{
                    width: "8px",
                    height: "3px",
                    borderTop: "2px solid #831843",
                    borderRadius: "50% 50% 0 0",
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Eyes Container with blinking and mouse tracking */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                {/* Left Eye */}
                <div 
                  className="w-7 h-9 rounded-full bg-white relative overflow-hidden"
                  style={{ 
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Eye shine highlight - moves with mouse */}
                  <div 
                    className="absolute w-2 h-2 rounded-full bg-white opacity-90 transition-all duration-75"
                    style={{ 
                      top: `${1.5 + eyeOffset.y * 0.4}px`,
                      left: `${1.5 + eyeOffset.x * 0.4}px`,
                    }}
                  />
                  
                  {/* Pupil with blinking and mouse tracking */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-5 rounded-full ${!pet.isSleeping ? 'game-cat-blink' : ''}`}
                    style={{ 
                      background: pet.isSleeping 
                        ? "#4b5563" 
                        : pet.energy < 30 
                          ? "linear-gradient(180deg, #ef4444, #dc2626)" 
                          : "linear-gradient(180deg, #10b981, #059669)",
                      height: pet.isSleeping ? "2px" : "20px",
                      top: pet.isSleeping ? "16px" : `${6 + eyeOffset.y}px`,
                      boxShadow: pet.isSleeping ? "none" : "inset 0 2px 3px rgba(0,0,0,0.2)",
                      transform: `translateX(${eyeOffset.x}px)`,
                      transition: "transform 0.05s ease-out",
                    }}
                  >
                    <div 
                      className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-80 transition-all duration-75"
                      style={{
                        top: `${1 + eyeOffset.y * 0.3}px`,
                        right: `${1 - eyeOffset.x * 0.3}px`,
                      }}
                    />
                  </div>
                </div>
                
                {/* Right Eye */}
                <div 
                  className="w-7 h-9 rounded-full bg-white relative overflow-hidden"
                  style={{ 
                    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Eye shine highlight - moves with mouse */}
                  <div 
                    className="absolute w-2 h-2 rounded-full bg-white opacity-90 transition-all duration-75"
                    style={{ 
                      top: `${1.5 + eyeOffset.y * 0.4}px`,
                      left: `${1.5 + eyeOffset.x * 0.4}px`,
                    }}
                  />
                  
                  {/* Pupil with blinking and mouse tracking */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-5 rounded-full ${!pet.isSleeping ? 'game-cat-blink' : ''}`}
                    style={{ 
                      background: pet.isSleeping 
                        ? "#4b5563" 
                        : pet.energy < 30 
                          ? "linear-gradient(180deg, #ef4444, #dc2626)" 
                          : "linear-gradient(180deg, #10b981, #059669)",
                      height: pet.isSleeping ? "2px" : "20px",
                      top: pet.isSleeping ? "16px" : `${6 + eyeOffset.y}px`,
                      boxShadow: pet.isSleeping ? "none" : "inset 0 2px 3px rgba(0,0,0,0.2)",
                      transform: `translateX(${eyeOffset.x}px)`,
                      transition: "transform 0.05s ease-out",
                    }}
                  >
                    <div 
                      className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-80 transition-all duration-75"
                      style={{
                        top: `${1 + eyeOffset.y * 0.3}px`,
                        right: `${1 - eyeOffset.x * 0.3}px`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Nose Spots */}
              <div className="absolute top-14 left-1/2 transform -translate-x-1/2 flex gap-2">
                <div 
                  className="w-1 h-1 rounded-full opacity-40 fur-shimmer"
                  style={{ background: "#be185d" }}
                />
                <div 
                  className="w-0.5 h-0.5 rounded-full opacity-30 fur-shimmer"
                  style={{ background: "#be185d", animationDelay: "1s" }}
                />
              </div>

              {/* Nose - 3D realistic */}
              <div 
                className="absolute top-16 left-1/2 transform -translate-x-1/2"
                style={{ 
                  width: "10px",
                  height: "7px",
                  background: "linear-gradient(135deg, #fca5a5, #f9a8d4)",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.3)",
                }}
              />

              {/* Enhanced Whiskers with dynamic movement */}
              <div className="absolute top-14 left-0">
                <div 
                  className="w-5 h-0.5 bg-slate-300 rounded mb-1" 
                  style={{ 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    transform: `rotate(${-6 + eyeOffset.x * 0.3}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                />
                <div 
                  className="w-4 h-0.5 bg-slate-300 rounded mb-1" 
                  style={{ 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    transform: `rotate(${eyeOffset.x * 0.2}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>
              <div className="absolute top-14 right-0">
                <div 
                  className="w-5 h-0.5 bg-slate-300 rounded mb-1" 
                  style={{ 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    transform: `rotate(${6 - eyeOffset.x * 0.3}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                />
                <div 
                  className="w-4 h-0.5 bg-slate-300 rounded mb-1" 
                  style={{ 
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    transform: `rotate(${-eyeOffset.x * 0.2}deg)`,
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>

              {/* Mouth - realistic 3D */}
              <div className="absolute top-[72px] left-1/2 transform -translate-x-1/2 flex">
                <div 
                  className="w-3.5 h-3 border-b-2 border-r-2 rounded-br-full"
                  style={{ 
                    borderColor: "#be185d",
                    boxShadow: "0 2px 3px rgba(0,0,0,0.1)",
                  }}
                />
                <div 
                  className="w-3.5 h-3 border-b-2 border-l-2 rounded-bl-full"
                  style={{ 
                    borderColor: "#be185d",
                    boxShadow: "0 2px 3px rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              {/* Animated Whiskers */}
              <div className="absolute top-14 left-0.5 game-cat-whisker">
                <div className="w-5 h-0.5 bg-slate-300 rounded transform -rotate-6 mb-1 shadow-sm" />
                <div className="w-4 h-0.5 bg-slate-300 rounded mb-1 shadow-sm" />
                <div className="w-4.5 h-0.5 bg-slate-300 rounded transform rotate-4 shadow-sm" />
              </div>
              <div className="absolute top-14 right-0.5 game-cat-whisker" style={{ animationDelay: "1s" }}>
                <div className="w-5 h-0.5 bg-slate-300 rounded transform rotate-6 mb-1 shadow-sm" />
                <div className="w-4 h-0.5 bg-slate-300 rounded mb-1 shadow-sm" />
                <div className="w-4.5 h-0.5 bg-slate-300 rounded transform -rotate-4 shadow-sm" />
              </div>

              {/* Cheeks Blush - glowing */}
              <div 
                className="absolute top-16 left-2 w-4 h-2.5 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, #fbcfe8, transparent)",
                  opacity: 0.5,
                  filter: "blur(1px)",
                }}
              />
              <div 
                className="absolute top-16 right-2 w-4 h-2.5 rounded-full"
                style={{ 
                  background: "radial-gradient(circle, #fbcfe8, transparent)",
                  opacity: 0.5,
                  filter: "blur(1px)",
                }}
              />

              {/* Front Paws */}
              <div 
                className="absolute -bottom-1 left-5 w-5 h-4 rounded-full"
                style={{ 
                  background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                }}
              />
              <div 
                className="absolute -bottom-1 right-5 w-5 h-4 rounded-full"
                style={{ 
                  background: "radial-gradient(circle at 30% 30%, #fce7f3, #f9a8d4)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
          
          {/* Sleep bubble */}
          {pet.isSleeping && (
            <div 
              className="absolute flex items-center gap-1 animate-pulse"
              style={{ left: `${pet.x + 8}%`, top: `${pet.y - 12}%` }}
            >
              <span className="text-yellow-300 font-bold text-sm">z</span>
              <span className="text-yellow-300 font-bold text-lg">Z</span>
              <span className="text-yellow-300 font-bold text-2xl">Z</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className={`max-w-2xl mx-auto mt-4 text-center text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
        {t.petGameInstructions || "Ekrandagi oziq-ovqat va o'yinchoqlarni bosib, petga yordam bering. Energiya tugasa, uxlatib qo'ying!"}
      </div>
    </div>
  );
};

export default PetGame;
