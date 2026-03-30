import React from 'react';
import Image from '../../../../components/AppImage';
import { cn } from '../../../../utils/cn';

const AIAvatar = ({ 
  isActive = false, 
  isSpeaking = false, 
  avatarType = 'professional',
  size = 'large' 
}) => {
  const avatarImages = {
    professional: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    friendly: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=400&h=400&fit=crop&crop=face",
    technical: "https://images.pixabay.com/photo/2016/11/29/09/38/adult-1868750_960_720.jpg"
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32 md:w-40 md:h-40',
    xlarge: 'w-48 h-48 md:w-56 md:h-56'
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Avatar Container - Industrial Frame */}
      <div className="relative group">
        <div
          className={cn(
            "relative z-10 overflow-hidden border transition-all duration-500",
            sizeClasses[size],
            isSpeaking 
              ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] scale-105" 
              : "border-slate-800"
          )}
        >
          <Image
            src={avatarImages[avatarType]}
            alt="AI_SYSTEM_CORE"
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isSpeaking ? "opacity-100 grayscale-0" : "opacity-60 grayscale"
            )}
          />
          
          {/* Scanline Effect during speech */}
          {isSpeaking && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0),rgba(0,255,0,0),rgba(0,0,255,0))] bg-[length:100%_2px,3px_100%] animate-pulse" />
          )}
        </div>

        {/* Decorative Corner Brackets */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-slate-700" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-slate-700" />

        {/* Status Protocol Label */}
        <div className="absolute -right-4 top-4 rotate-90 origin-left">
          <span className={cn(
            "font-mono text-[8px] tracking-[0.2em] uppercase",
            isSpeaking ? "text-emerald-500" : "text-slate-600"
          )}>
            {isSpeaking ? 'AI_VOCAL_ACTIVE' : 'SYSTEM_IDLE'}
          </span>
        </div>
      </div>

      {/* Identity Segment */}
      <div className="text-center space-y-1">
        <h3 className="font-mono font-bold text-slate-200 tracking-widest uppercase">
          AI_ANALYST_NODE
        </h3>
        <div className="flex items-center justify-center gap-3">
          <div className={cn(
            "w-1.5 h-1.5",
            isSpeaking ? "bg-emerald-500 animate-pulse" : isActive ? "bg-sky-500" : "bg-slate-700"
          )} />
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-tighter">
            {isSpeaking ? 'TRANSMITTING_DATA' : isActive ? 'LISTENING_PROTOCOL' : 'READY_FOR_UPLINK'}
          </p>
        </div>
      </div>

      {/* Waveform Visualization */}
      {isSpeaking && (
        <div className="flex items-end justify-center gap-1 h-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-emerald-500 animate-waveform"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAvatar;