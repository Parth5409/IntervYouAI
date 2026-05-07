import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex flex-col items-center space-y-6">
      <div className="noise opacity-10" />
      {/* Avatar Container */}
      <div className="relative group">
        {/* Advanced Aurora Glow Effects */}
        <div className={cn(
          "absolute -inset-10 rounded-full blur-[80px] transition-all duration-1000 opacity-20",
          isSpeaking ? "bg-primary/40 scale-125" : "bg-primary/10"
        )} />
        <div className={cn(
          "absolute -inset-6 rounded-full blur-[40px] transition-all duration-1000 opacity-10",
          isSpeaking ? "bg-secondary/40 scale-110" : "bg-secondary/5"
        )} />
        
        <motion.div
          animate={isSpeaking ? { 
            scale: [1, 1.02, 1],
            y: [0, -2, 0]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={cn(
            "relative z-10 overflow-hidden rounded-3xl border-2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl",
            sizeClasses[size],
            isSpeaking 
              ? "border-primary/50 shadow-primary/20 scale-105" 
              : "border-white/10"
          )}
        >
          <Image
            src={avatarImages[avatarType]}
            alt="Interviewer AI"
            className={cn(
              "w-full h-full object-cover transition-all duration-1000 contrast-110",
              isSpeaking ? "scale-105 grayscale-0 brightness-110" : "grayscale opacity-60"
            )}
          />
          
          {/* Holographic Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-16 w-full animate-[scan_3s_linear_infinite] opacity-30 pointer-events-none" />
          
          {/* Aurora Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 pointer-events-none mix-blend-overlay" />
        </motion.div>

        {/* Tactical Orbitals */}
        <AnimatePresence>
          {isActive && (
            <>
              <motion.div 
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 rounded-[3.5rem] border border-primary/20 border-dashed pointer-events-none"
              />
              <motion.div 
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: -180, opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-14 rounded-[4.5rem] border border-white/5 pointer-events-none"
              />
              {/* Dynamic Visuals */}
              {[0, 90, 180, 270].map((angle, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, delay: i * 0.5 }
                  }}
                  style={{ rotate: angle }}
                  className="absolute -inset-8 flex items-start justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Identity Segment */}
      <div className="text-center space-y-4 z-10 w-full max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-2xl shadow-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={cn(
              "w-1.5 h-1.5 rounded-full shadow-lg",
              isSpeaking ? "bg-primary animate-pulse shadow-primary/50" : isActive ? "bg-secondary shadow-secondary/50" : "bg-white/20"
            )} />
            <p className="font-headline text-[9px] font-black text-white uppercase tracking-[0.3em] leading-none relative z-10">
              {isSpeaking ? 'AI_VOCAL_SYNTH' : isActive ? 'LISTENING' : 'IDLE'}
            </p>
          </motion.div>

          {/* High-Fidelity Waveform */}
          <div className="flex items-end justify-center gap-1 h-10 w-full">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 3 }}
                animate={{ 
                  height: isSpeaking ? [3, 6 + Math.random() * 32, 3] : 3,
                  opacity: isSpeaking ? 1 : 0.1
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  delay: i * 0.01,
                  ease: "easeInOut"
                }}
                className={cn(
                  "w-[2px] rounded-full bg-gradient-to-t from-primary to-secondary"
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