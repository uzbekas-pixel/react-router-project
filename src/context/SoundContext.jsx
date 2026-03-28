import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// 1. Context yaratish
const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  // BUG #15 FIX — Audio objects created inside useEffect (not inline) so they can be
  // properly cleaned up (paused + src cleared) when SoundProvider unmounts.
  // Previously, audio was created inline which: (a) violated hooks rules, (b) leaked
  // playing audio as a zombie when the component unmounted (e.g. hot reload).
  const rainRef     = useRef(null);
  const lofiRef     = useRef(null);
  const keyboardRef = useRef(null);

  useEffect(() => {
    rainRef.current     = new Audio('/sounds/rain.mp3');
    lofiRef.current     = new Audio('/sounds/lofi.mp3');
    keyboardRef.current = new Audio('/sounds/keyboard.mp3');

    // Cleanup: stop and release audio resources on unmount
    return () => {
      [rainRef, lofiRef, keyboardRef].forEach((r) => {
        if (r.current) {
          r.current.pause();
          r.current.src = '';
          r.current = null;
        }
      });
    };
  }, []);

  const sounds = { rain: rainRef, lofi: lofiRef, keyboard: keyboardRef };

  const [activeSounds, setActiveSounds] = useState({ rain: false, lofi: false, keyboard: false });
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = (name) => {
    const audio = sounds[name]?.current;
    if (!audio) return;
    if (activeSounds[name]) {
      audio.pause();
    } else {
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      audio.play().catch(e => console.log("Ijro xatosi:", e));
    }
    setActiveSounds(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const updateVolume = (val) => {
    setVolume(val);
    Object.values(sounds).forEach(s => {
      if (s.current) s.current.volume = isMuted ? 0 : val;
    });
  };

  const toggleMute = () => {
    const newMuteStatus = !isMuted;
    setIsMuted(newMuteStatus);
    Object.values(sounds).forEach(s => {
      if (s.current) s.current.volume = newMuteStatus ? 0 : volume;
    });
  };

  return (
    <SoundContext.Provider value={{ activeSounds, toggleSound, volume, updateVolume, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

// 2. Hook yaratish
/* eslint-disable react-refresh/only-export-components */
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    console.error("useSound xatosi: SoundProvider ichida bo'lishi kerak");
  }
  return context;
};