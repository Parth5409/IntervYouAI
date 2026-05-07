import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const VoiceControls = ({
  isRecording = false,
  isMuted = false,
  onToggleRecording,
  onToggleMute,
  onReplayLastMessage,
  disabled = false,
  isTranscribing = false,
  isAIPlaying = false,
  conversationHistory = [],
}) => {

  const getStatusText = () => {
    if (isAIPlaying) return "AI IS SPEAKING";
    if (disabled) return "AI IS THINKING";
    if (isMuted) return "MICROPHONE MUTED";
    if (isTranscribing) return "PROCESSING...";
    if (isRecording) return "LISTENING...";
    return "READY";
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Main Interaction Button */}
      <div className="relative group">
        {/* Advanced Aurora Glow Rings */}
        <div className={cn(
          "absolute -inset-10 rounded-full blur-[80px] transition-all duration-1000 opacity-0",
          isRecording ? "bg-error opacity-30" : isAIPlaying ? "bg-primary opacity-30" : "bg-secondary/10 opacity-10 group-hover:opacity-30"
        )} />

        <AnimatePresence>
          {(isRecording || isAIPlaying || isTranscribing) && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "absolute -inset-6 rounded-full border border-dashed pointer-events-none opacity-40",
                isRecording ? "border-error" : "border-primary"
              )}
            />
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleRecording}
          disabled={disabled || isMuted || isAIPlaying}
          className={cn(
            "w-32 h-32 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-10 overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)]",
            isRecording
              ? "bg-error/20 border-error text-error scale-110 shadow-error/20"
              : (disabled || isAIPlaying)
                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed backdrop-blur-3xl"
                : "bg-white/[0.02] border-white/10 text-white hover:text-primary hover:border-primary/40 hover:bg-primary/5 backdrop-blur-3xl group-hover:shadow-primary/10"
          )}
        >
          {isTranscribing || isAIPlaying ? (
            <div className="flex gap-1.5 items-end h-10">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [8, 20 + Math.random() * 24, 8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                    delay: i * 0.08,
                  }}
                  className={cn(
                    "w-[3px] rounded-full",
                    isAIPlaying ? "bg-primary" : "bg-secondary"
                  )}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
              <Icon name={isRecording ? "ms:stop_circle" : "ms:mic"} size={44} className="mb-2 relative z-10" />
              <span className="text-[9px] font-black font-headline uppercase tracking-[0.3em] relative z-10">{isRecording ? "STOP" : "START"}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* High-End Status Badge */}
      <div className="flex flex-col items-center gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-xl px-8 py-3 flex items-center gap-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-[scan_4s_linear_infinite]" />
          <div className={cn(
            "w-2 h-2 rounded-full shadow-lg relative z-10",
            isRecording ? "bg-error animate-pulse shadow-error/50" : isTranscribing ? "bg-secondary animate-bounce shadow-secondary/50" : isAIPlaying ? "bg-primary animate-pulse shadow-primary/50" : "bg-secondary shadow-secondary/50"
          )} />
          <span className={cn(
            "font-headline text-[9px] font-black tracking-[0.3em] uppercase transition-colors relative z-10",
            isRecording ? "text-error" : isAIPlaying ? "text-primary" : "text-white"
          )}>
            {getStatusText()}
          </span>
        </motion.div>

        {/* Interaction Hint */}
        {!disabled && !isTranscribing && !isAIPlaying && (
          <p className="font-body text-[8px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] animate-pulse">
            {isRecording ? "STOP SPEAKING" : "CLICK TO SPEAK"}
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceControls;