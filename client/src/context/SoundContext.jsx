import React, { createContext, useContext, useState, useRef } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playChime = (freqs = [523, 659, 784]) => {
    if (muted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t + i * 0.11);
        g.gain.linearRampToValueAtTime(0.12, t + i * 0.11 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.4);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t + i * 0.11);
        o.stop(t + i * 0.11 + 0.42);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  return (
    <SoundContext.Provider value={{ muted, toggleMute, playChime }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
