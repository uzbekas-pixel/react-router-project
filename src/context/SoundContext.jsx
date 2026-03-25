import React, { createContext, useContext, useState, useRef } from 'react';

// 1. Context yaratish
const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  // Audio ob'ektlarini yaratish
const sounds = {
  // Fayl yo'llari public papkasidan boshlanadi
  rain: useRef(new Audio('/sounds/rain.mp3')),
  lofi: useRef(new Audio('/sounds/lofi.mp3')),
  keyboard: useRef(new Audio('/sounds/keyboard.mp3')),
};

  const [activeSounds, setActiveSounds] = useState({ rain: false, lofi: false, keyboard: false });
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = (name) => {
    const audio = sounds[name].current;
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
    Object.values(sounds).forEach(s => s.current.volume = isMuted ? 0 : val);
  };

  // 'setIsMuted' ishlatilmayotgani uchun xato bermasligi uchun uni ham qo'shib qo'yamiz
  const toggleMute = () => {
    const newMuteStatus = !isMuted;
    setIsMuted(newMuteStatus);
    Object.values(sounds).forEach(s => s.current.volume = newMuteStatus ? 0 : volume);
  };

  return (
    <SoundContext.Provider value={{ activeSounds, toggleSound, volume, updateVolume, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

// 2. Hook yaratish (Faqat bitta export bo'lishi uchun ehtiyotkorlik bilan)
/* eslint-disable react-refresh/only-export-components */
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    console.error("useSound xatosi: SoundProvider ichida bo'lishi kerak");
  }
  return context;
};