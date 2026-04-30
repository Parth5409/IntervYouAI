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
    <div className="flex flex-col items-center space-y-10">
      {/* Avatar Container */}
      <div className="relative group">
        {/* Warm Glow Effects */}
        <div className={cn(
          "absolute -inset-6 rounded-full blur-3xl transition-all duration-1000 opacity-30",
          isSpeaking ? "bg-primary/20 scale-110" : "bg-primary/5"
        )} />
        
        <div
          className={cn(
            "relative z-10 overflow-hidden rounded-full border-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm",
            sizeClasses[size],
            isSpeaking 
              ? "border-primary scale-105" 
              : "border-white"
          )}
        >
          <Image
            src={avatarImages[avatarType]}
            alt="Interviewer AI"
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              isSpeaking ? "scale-110 grayscale-0" : "grayscale opacity-70"
            )}
          />
          
          {/* Subtle Warm Overlay */}
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
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
                className="absolute -inset-8 rounded-full border border-primary/30 border-dashed pointer-events-none"
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
      <div className="text-center space-y-4 z-10">
        <div className="flex items-center justify-center gap-4">
          <span className="w-8 h-[1px] bg-outline/40"></span>
          <h3 className="font-headline italic text-lg text-on-surface">
            Interviewer AI
          </h3>
          <span className="w-8 h-[1px] bg-outline/40"></span>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 bg-surface-container/80 px-6 py-2 rounded-full border border-outline/20 backdrop-blur-md shadow-sm">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isSpeaking ? "bg-primary animate-pulse" : isActive ? "bg-emerald-500" : "bg-outline"
            )} />
            <p className="font-headline text-xs font-semibold text-on-surface leading-none">
              {isSpeaking ? 'AI is Speaking' : isActive ? 'Listening...' : 'Ready'}
            </p>
          </div>

          {/* Waveform Visualization - Warm Terracotta */}
          <div className="flex items-end justify-center gap-1.5 h-12 min-w-[240px]">
            {[...Array(32)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 4 }}
                animate={{ 
                  height: isSpeaking ? [4, 8 + Math.random() * 36, 4] : 4,
                  opacity: isSpeaking ? 0.8 : 0.2
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.7,
                  delay: i * 0.02,
                  ease: "easeInOut"
                }}
                className={cn(
                  "w-[2px] rounded-full bg-primary"
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