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
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48 md:w-56 md:h-56',
    xlarge: 'w-64 h-64 md:w-72 md:h-72'
  };

  return (
    <div className="flex flex-col items-center space-y-10">
      {/* Avatar Container */}
      <div className="relative group">
        {/* Glow Effects */}
        <div className={cn(
          "absolute -inset-4 rounded-full blur-2xl transition-all duration-1000 opacity-20",
          isSpeaking ? "bg-primary scale-110 opacity-40" : "bg-white/10"
        )} />
        
        <div
          className={cn(
            "relative z-10 overflow-hidden rounded-full border-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            sizeClasses[size],
            isSpeaking 
              ? "border-primary shadow-[0_0_80px_rgba(255,145,90,0.3)] scale-105" 
              : "border-outline-variant/30 opacity-80"
          )}
        >
          <Image
            src={avatarImages[avatarType]}
            alt="AI_SYSTEM_CORE"
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              isSpeaking ? "scale-110 grayscale-0" : "grayscale opacity-40"
            )}
          />
          
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40" />
        </div>

        {/* Orbitals */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.div 
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-full border border-primary/20 border-dashed pointer-events-none"
              />
              <motion.div 
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: -180, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-12 rounded-full border border-primary/10 pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Identity Segment */}
      <div className="text-center space-y-3 z-10">
        <div className="flex items-center justify-center gap-3">
          <span className="w-6 h-[1px] bg-outline-variant/50"></span>
          <h3 className="font-headline font-extrabold text-white tracking-[0.3em] uppercase text-[10px]">
            AI Analyst Node
          </h3>
          <span className="w-6 h-[1px] bg-outline-variant/50"></span>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-surface-container-high/40 px-5 py-2 rounded-full border border-outline-variant/10 backdrop-blur-md shadow-xl">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSpeaking ? "bg-primary animate-pulse" : isActive ? "bg-white" : "bg-outline"
            )} />
            <p className="font-body text-[11px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">
              {isSpeaking ? 'Transmitting Data' : isActive ? 'Listening Protocol' : 'Neural Link Idle'}
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-end justify-center gap-1.5 h-10 min-w-[200px]">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 4 }}
                animate={{ 
                  height: isSpeaking ? [4, 10 + Math.random() * 30, 4] : 4,
                  opacity: isSpeaking ? 1 : 0.2
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.03,
                  ease: "easeInOut"
                }}
                className={cn(
                  "w-[2px] rounded-full",
                  isSpeaking ? "bg-primary" : "bg-outline"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAvatar;