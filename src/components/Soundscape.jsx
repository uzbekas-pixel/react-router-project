import React, { useState } from "react";
import { useSound } from "../context/SoundContext";

const Soundscape = ({ darkMode }) => {
  const {
    activeSounds,
    toggleSound,
    volume,
    updateVolume,
    isMuted,
    toggleMute,
  } = useSound();
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[100px] left-[20px] z-100 flex flex-col items-start">
      
      {/* Panel ochilganda ko'rinadigan qism */}
      {isOpen && (
        <div
          className={`mb-3 p-4 rounded-2xl border-2 shadow-2xl w-64 transition-all duration-200 ${
            darkMode 
              ? "bg-slate-900 border-blue-500 text-white" 
              : "bg-white border-blue-200 text-slate-800"
          }`}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Developer Ambience
          </h3>

          <div className="space-y-3">
            {/* Ovozlar ro'yxati */}
            {[
              { id: "rain", label: "Rain", icon: "🌧️", color: "bg-blue-500" },
              { id: "lofi", label: "Lofi Beats", icon: "🎧", color: "bg-purple-500" },
              { id: "keyboard", label: "Mechanical", icon: "⌨️", color: "bg-orange-500" }
            ].map((sound) => (
              <div key={sound.id} className="flex items-center justify-between">
                <span className="text-sm">{sound.icon} {sound.label}</span>
                <button
                  onClick={() => toggleSound(sound.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                    activeSounds[sound.id] 
                      ? `${sound.color} text-white shadow-md` 
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {activeSounds[sound.id] ? "ON" : "OFF"}
                </button>
              </div>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="mt-5 pt-4 border-t border-slate-700/20">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute} 
                className="text-xl hover:scale-110 active:scale-90 transition-transform"
              >
                {isMuted || volume === 0 ? "🔇" : "🔊"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => updateVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Asosiy Tugma */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 transition-all active:scale-95 ${
          isOpen
            ? "bg-blue-500 border-white text-white rotate-90"
            : "bg-white border-blue-500 text-blue-500 hover:shadow-blue-200"
        }`}
      >
        {isOpen ? "✕" : "🎵"}
      </button>
    </div>
  );
};

export default Soundscape;