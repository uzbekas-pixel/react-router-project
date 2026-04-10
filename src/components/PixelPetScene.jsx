import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import { useLocation } from 'react-router-dom';

// ── 1. Kod orqali yasalgan 3D Tuxum (Procedural Egg) ──────────────
function EggModel({ isHatching }) {
  const eggRef = useRef();

  useFrame((state) => {
    if (eggRef.current) {
      if (isHatching) {
        // Yorilayotganda kuchli qaltirash[cite: 2]
        eggRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.05;
        eggRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 40) * 0.1;
      } else {
        // Oddiy holatda sokin turish[cite: 2]
        eggRef.current.position.x = 0;
        eggRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <mesh ref={eggRef} position={[0, 0.5, 0]} scale={[0.8, 1.1, 0.8]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#fdf2f8" roughness={0.2} metalness={0.1} />
      {/* Tuxumdagi dog'lar (dizayn uchun)[cite: 2] */}
      <mesh position={[0.4, 0.3, 0.8]} scale={[0.2, 0.3, 0.1]}>
         <sphereGeometry args={[1, 16, 16]} />
         <meshStandardMaterial color="#fbcfe8" />
      </mesh>
      <mesh position={[-0.5, -0.2, 0.7]} scale={[0.3, 0.2, 0.1]}>
         <sphereGeometry args={[1, 16, 16]} />
         <meshStandardMaterial color="#f9a8d4" />
      </mesh>
    </mesh>
  );
}

// ── 2. Kod orqali yasalgan 3D Robot Pet ───────────────────────────
function PetModel({ level, isDizzy }) {
  const groupRef = useRef();
  const headRef = useRef();

  useFrame((state) => {
    if (headRef.current) {
      if (isDizzy) {
        // Boshi aylanganda tez aylanadi[cite: 2]
        headRef.current.rotation.y += 0.2;
      } else {
        // Oddiy holatda atrofga qarab turadi[cite: 2]
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      }
    }
  });

  // Levelga qarab kattalashish (1.5 baravargacha)[cite: 2]
  const scale = Math.min(1.5, 0.7 + (level / 100) * 0.8);

  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} scale={scale} position={[0, 0.8, 0]}>
        
        {/* Tana[cite: 2] */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 32]} />
          <meshStandardMaterial color={level >= 100 ? "#f59e0b" : "#3b82f6"} roughness={0.3} metalness={0.5} />
        </mesh>
        
        {/* Bosh[cite: 2] */}
        <group ref={headRef}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.7, 0.6, 0.7]} radius={0.1} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.6} />
          </mesh>
          
          {/* Ko'zlar[cite: 2] */}
          <mesh position={[-0.18, 0.3, 0.36]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={isDizzy ? "#ef4444" : "#10b981"} emissive={isDizzy ? "#ef4444" : "#10b981"} emissiveIntensity={2} />
          </mesh>
          <mesh position={[0.18, 0.3, 0.36]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={isDizzy ? "#ef4444" : "#10b981"} emissive={isDizzy ? "#ef4444" : "#10b981"} emissiveIntensity={2} />
          </mesh>

          {/* Level 50+: Aqlli Ko'zoynak[cite: 2] */}
          {level >= 50 && (
             <group position={[0, 0.3, 0.38]}>
                <mesh position={[-0.18, 0, 0]}>
                  <torusGeometry args={[0.12, 0.03, 16, 32]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.18, 0, 0]}>
                  <torusGeometry args={[0.12, 0.03, 16, 32]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                   <boxGeometry args={[0.12, 0.02, 0.02]} />
                   <meshBasicMaterial color="#0f172a" />
                </mesh>
             </group>
          )}

          {/* Level 100+: Bitiruvchi Shlyapasi (AI Assistant)[cite: 2] */}
          {level >= 100 && (
            <group position={[0, 0.55, 0]} rotation={[0.1, 0, 0]}>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.8, 0.05, 0.8]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0.3, 0.05, 0.3]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </Float>
  );
}

// ── 3. Asosiy Sahna Komponenti ──────────────────────────────────────
const PixelPetScene = ({ petData, darkMode, onHatch }) => {
    const [clicks, setClicks] = useState(0);
    const [isDizzy, setIsDizzy] = useState(false);
    const [isHatching, setIsHatching] = useState(false);
    const location = useLocation();
    const allowedPaths = ['/shop', '/leaderboard', '/daily'];
    const level = petData?.petLevel || 1;
    const isEgg = level < 10; 
    if (!allowedPaths.includes(location.pathname)) {
        return null; 
    }

    const handlePetClick = (e) => {
        // Chatga yozayotganda kutilmagan bosilishlarni oldini olish uchun[cite: 2]
        e.stopPropagation(); 

        if (isEgg) {
            setIsHatching(true);
            setTimeout(() => setIsHatching(false), 400);
            
            const newClicks = clicks + 1;
            setClicks(newClicks);
            
            if (newClicks >= 10) {
                onHatch && onHatch(); 
            }
        } else {
            const newClicks = clicks + 1;
            setClicks(newClicks);
            
            // Boshi aylanish mantiqi tugma bosilgan paytga ko'chirildi[cite: 2]
            if (newClicks >= 4 && !isDizzy) {
                setIsDizzy(true);
                setTimeout(() => {
                    setIsDizzy(false);
                    setClicks(0); // 3 soniyadan keyin o'ziga keladi[cite: 2]
                }, 3000);
            }
        }
    };

    return (
        <div 
            onClick={handlePetClick}
            // O'ZGARISH: pointer-events-auto qo'shildi. 
            // Endi bu div o'z ustiga tushgan bosishlarni ushlab qoladi, 
            // lekin uning tashqarisidagi maydon orqadagi elementlarga bosishni o'tkazib yuborishi kerak 
            // (agar chatda to'g'ri joylashtirilgan bo'lsa).
            className={`relative w-16 h-16 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer transition-transform duration-200 hover:scale-110 flex items-center justify-center pointer-events-auto z-50 ${darkMode ? 'bg-slate-800/80 backdrop-blur-md border border-slate-700' : 'bg-white/80 backdrop-blur-md border border-slate-200'}`}
            title={isEgg ? "Tuxumni yorish uchun tez-tez bosing!" : `Level ${level} AI Pet`}
        >
            <Canvas   
                shadows 
                camera={{ position: [0, 1.5, 4], fov: 45 }} 
                gl={{ antialias: true, alpha: true }} 
                className="w-full h-full rounded-full"
            >
                <Suspense fallback={null}>
                    <Environment preset="city" />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
                    
                    <ContactShadows position={[0, -0.2, 0]} opacity={0.5} scale={5} blur={2} far={2} color="#000" />
                    
                    {isEgg ? (
                        <EggModel isHatching={isHatching} />
                    ) : (
                        <PetModel level={level} isDizzy={isDizzy} />
                    )}
                </Suspense>
            </Canvas>
            
            {/* Level Nishoni[cite: 2] */}
            <span className="absolute -bottom-2 -right-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-lg z-10">
                Lv{level}
            </span>
        </div>
    );
};

export default PixelPetScene;