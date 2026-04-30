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
    if (isAIPlaying) return "AI Vocal Active";
    if (disabled) return "AI Synthesis...";
    if (isMuted) return "Input Muted";
    if (isTranscribing) return "Syncing Stream...";
    if (isRecording) return "Capturing Audio";
    return "Ready to Speak";
  };

  return (
    <div className="flex flex-col items-center gap-12 py-10">
      {/* Main Interaction Node */}
      <div className="relative group">
        {/* Advanced Glow Rings */}
        <div className={cn(
          "absolute -inset-10 rounded-full blur-[100px] transition-all duration-1000 opacity-0",
          isRecording ? "bg-error opacity-20" : isAIPlaying ? "bg-primary opacity-20" : "bg-primary/5 opacity-10 group-hover:opacity-20"
        )} />

        <AnimatePresence>
          {(isRecording || isAIPlaying) && (
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

        <button
          onClick={onToggleRecording}
          disabled={disabled || isMuted || isAIPlaying}
          className={cn(
            "w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-700 relative z-10 overflow-hidden shadow-2xl",
            isRecording
              ? "bg-error/10 border-error text-error scale-110 shadow-md"
              : (disabled || isAIPlaying)
                ? "bg-surface-container-high/40 border-outline-variant/30 text-outline-variant cursor-not-allowed backdrop-blur-xl"
                : "bg-surface-container-high/40 border-outline-variant text-on-surface hover:text-primary hover:border-primary hover:bg-primary/5 hover:scale-105 backdrop-blur-xl group-hover:shadow-sm"
          )}
        >
          {isTranscribing || isAIPlaying ? (
            <div className="flex gap-1.5 items-end h-10">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [8, 16 + Math.random() * 24, 8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.1,
                  }}
                  className={cn(
                    "w-[3px] rounded-full",
                    isAIPlaying ? "bg-primary" : "bg-sky-500"
                  )}
                />
              ))}
            </div>
          ) : (
            <>
              <Icon name={isRecording ? "ms:stop_circle" : "ms:mic"} size={44} className="mb-1" />
              <span className="text-[9px] font-bold font-headline font-label font-medium text-on-surface-variant">{isRecording ? "Stop" : "Speak"}</span>
            </>
          )}

          {/* Liquid Mask Effect */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/20 to-transparent pointer-events-none opacity-50" />
        </button>
      </div>

      {/* High-End Status Badge */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-surface-container-highest/50 backdrop-blur-2xl border border-outline-variant/10 rounded-2xl px-8 py-3 flex items-center gap-4 shadow-2xl">
          <div className={cn(
            "w-2 h-2 rounded-full shadow-md",
            isRecording ? "bg-error animate-pulse text-error" : isTranscribing ? "bg-sky-500 animate-bounce text-sky-500" : isAIPlaying ? "bg-primary animate-pulse text-primary" : "bg-emerald-500 text-emerald-500"
          )} />
          <span className={cn(
            "font-headline text-[11px] font-extrabold tracking-[0.25em] uppercase transition-colors",
            isRecording ? "text-error" : isAIPlaying ? "text-primary" : "text-on-surface"
          )}>
            {getStatusText()}
          </span>
        </div>

        {/* Interaction Hint */}
        {!disabled && !isTranscribing && !isAIPlaying && (
          <p className="font-body text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] opacity-40 animate-in fade-in duration-1000 slide-in-from-top-1">
            {isRecording ? "Terminate stream anytime" : "Begin transmission sequence"}
          </p>
        )}
      </div>

      {/* Audio Utility bar */}
      <div className="flex items-center gap-4 p-2 bg-surface-container-low/40 rounded-3xl border border-outline-variant/10 backdrop-blur-xl">
        <button
          onClick={onToggleMute}
          className={cn(
            "h-12 px-6 rounded-2xl font-headline text-[10px] font-bold tracking-[0.1em] uppercase transition-all flex items-center gap-3 border",
            isMuted
              ? "bg-error/10 border-error/20 text-error"
              : "bg-surface-container-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
          )}
        >
          <Icon name={isMuted ? "ms:mic_off" : "ms:mic"} size={16} />
          {isMuted ? "Unmute" : "Mute"}
        </button>
        
        <div className="w-[1px] h-6 bg-outline-variant/10" />
        
        <button
          onClick={onReplayLastMessage}
          disabled={isAIPlaying || conversationHistory?.length === 0}
          className="h-12 px-6 rounded-2xl border border-outline-variant/10 bg-surface-container-high/40 font-headline text-[10px] font-bold text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3 font-label font-medium"
        >
          <Icon name="ms:replay" size={16} />
          Replay
        </button>
      </div>
    </div>
  );
};

export default VoiceControls;