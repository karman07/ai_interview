import React from 'react';

interface AvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

// Custom CSS animation for sound wave bars since custom tailwind arbitrary values aren't always parsed
const animationStyles = `
  @keyframes soundPulse {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(2); opacity: 0; }
  }
`;

export const ThreeAvatar = ({ isSpeaking = false, isListening = false, label }: AvatarProps & { label?: string }) => {
  const bars = [0.4, 0.7, 1.0, 0.7, 0.5, 0.9, 0.6, 1.0, 0.5, 0.8, 0.4, 0.7, 1.0, 0.6, 0.5];
  const active = isSpeaking || isListening;
  
  // Theme variants
  const activeColor = isListening ? 'emerald' : 'blue';
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 rounded-[2rem] relative overflow-hidden shadow-2xl border border-slate-800">
      <style>{animationStyles}</style>

      {/* Top Left Status */}
      <div className="absolute top-5 left-5 z-20">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 bg-black/40 backdrop-blur-md border border-white/5 ${isSpeaking ? 'text-blue-400 border-blue-500/20' : isListening ? 'text-emerald-400 border-emerald-500/20' : 'text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]' : isListening ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700'}`} />
          {isSpeaking ? 'AI Speaking' : isListening ? 'Listening' : 'AI Ready'}
        </div>
      </div>

      {/* Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{ 
          background: active ? `radial-gradient(circle at center, rgba(${isListening ? '16,185,129' : '59,130,246'}, 0.15) 0%, transparent 60%)` : 'none',
          opacity: active ? 1 : 0
        }}
      />

      {/* Main Bot Visualization */}
      <div className="relative flex flex-col items-center justify-center translate-y-[-10px]">
        {/* Animated Ripples */}
        {active && (
          <>
            <div className={`absolute w-40 h-40 rounded-full border border-${activeColor}-500/30 blur-[2px]`} style={{ animation: 'ripple 3s infinite linear' }} />
            <div className={`absolute w-32 h-32 rounded-full border border-${activeColor}-500/20`} style={{ animation: 'ripple 3s infinite linear 1.5s' }} />
          </>
        )}

        {/* Bot Core */}
        <div className={`relative z-10 w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 shadow-2xl ${
          active 
            ? `border-${activeColor}-500/60 bg-${activeColor}-950/40 shadow-${activeColor}-500/20` 
            : 'border-slate-800 bg-slate-900/80 shadow-none'
        }`}>
          
          {/* Eyes */}
          <div className="flex gap-4 items-center justify-center mt-[-10px] z-10">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              active ? `bg-${activeColor}-400 shadow-[0_0_12px_rgba(var(--tw-colors-${activeColor}-400),0.8)]` : 'bg-slate-700'
            }`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              active ? `bg-${activeColor}-400 shadow-[0_0_12px_rgba(var(--tw-colors-${activeColor}-400),0.8)]` : 'bg-slate-700'
            }`} />
          </div>

          {/* Internal Mouth Wave */}
          <div className="absolute bottom-5 flex items-end gap-[3px] opacity-80">
            {(isSpeaking ? bars.slice(3, 12) : [0.2, 0.4, 0.2, 0.4, 0.2]).map((h, i) => (
              <div 
                key={i} 
                className={`w-[4px] rounded-full transition-all duration-300 ${isSpeaking ? 'bg-blue-400' : isListening ? 'bg-emerald-400' : 'bg-slate-700'}`}
                style={{ 
                  height: `${h * 16}px`, 
                  transformOrigin: 'bottom',
                  animation: active ? `soundPulse ${500 + i * 50}ms ease-in-out infinite alternate` : 'none',
                  animationDelay: `${i * 70}ms`
                }} 
              />
            ))}
          </div>
        </div>

        {/* Action Label */}
        <div className="mt-8 relative z-10">
          <p className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
            isSpeaking ? 'text-blue-400' : isListening ? 'text-emerald-400' : 'text-slate-600'
          }`}>
            {label ?? (isSpeaking ? 'AI Speaking' : isListening ? 'Listening…' : 'System Ready')}
          </p>
        </div>
      </div>

      {/* Broad Scale Sound Wave Decorator (Bottom) */}
      <div className={`absolute bottom-6 flex items-end justify-center gap-[4px] w-full px-12 transition-opacity duration-700 ${active ? 'opacity-30' : 'opacity-10'}`}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-[4px] rounded-t-full rounded-b-[1px] ${isSpeaking ? 'bg-blue-500' : isListening ? 'bg-emerald-500' : 'bg-slate-700'}`}
            style={{
              height: `${h * (active ? 45 : 10)}px`,
              transformOrigin: 'bottom',
              animation: active ? `soundPulse ${800 + i * 40}ms ease-in-out infinite alternate` : 'none',
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};
