import React from 'react';
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
    if (isAIPlaying) return "AI_VOCAL_TRANSMISSION_ACTIVE";
    if (disabled) return "AI_THINKING_IN_PROGRESS";
    if (isMuted) return "INPUT_HARDWARE_MUTED";
    if (isTranscribing) return "PROCESSING_TRANSCRIPT...";
    if (isRecording) return "CAPTURING_AUDIO_FEED...";
    return "READY_FOR_INPUT";
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Main Interaction Node */}
      <div className="relative group">
        {/* Animated Rings for Recording */}
        {isRecording && (
          <div className="absolute inset-0 -m-4">
            <div className="absolute inset-0 border border-red-500/20 animate-ping" />
            <div className="absolute inset-0 border border-red-500/10 animate-pulse scale-110" />
          </div>
        )}

        {/* Animated Rings for AI Speaking */}
        {isAIPlaying && (
          <div className="absolute inset-0 -m-4">
            <div className="absolute inset-0 border border-emerald-500/20 animate-ping" />
            <div className="absolute inset-0 border border-emerald-500/10 animate-pulse scale-110" />
          </div>
        )}

        <button
          onClick={onToggleRecording}
          disabled={disabled || isMuted || isAIPlaying}
          className={cn(
            "w-24 h-24 border-2 flex items-center justify-center transition-all duration-500 relative z-10",
            isRecording
              ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : (disabled || isAIPlaying)
                ? "bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed"
                : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          )}
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />

          {isTranscribing || isAIPlaying ? (
            <div className="flex gap-1 items-end h-8">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-emerald-500 animate-waveform",
                    isAIPlaying ? "bg-emerald-400" : "bg-sky-500"
                  )}
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.5s'
                  }}
                />
              ))}
            </div>
          ) : (
            <Icon name={isRecording ? "Square" : "Mic"} size={32} />
          )}
        </button>
      </div>

      {/* Terminal Status Display */}
      <div className="flex flex-col items-center gap-2">
        <div className="bg-slate-900 border border-slate-800 px-6 py-2 flex items-center gap-3">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isRecording ? "bg-red-500 animate-pulse" : isTranscribing ? "bg-sky-500 animate-bounce" : isAIPlaying ? "bg-emerald-400 animate-pulse" : "bg-emerald-500"
          )} />
          <span className={cn(
            "font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
            isRecording ? "text-red-500" : isAIPlaying ? "text-emerald-400" : "text-slate-300"
          )}>
            {getStatusText()}
          </span>
        </div>

        {/* Interaction Hint */}
        {!disabled && !isTranscribing && !isAIPlaying && (
          <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest animate-in fade-in duration-1000">
            {isRecording ? "Press_to_Terminate_Input" : "Activate_Vocal_Node_to_Speak"}
          </p>
        )}
      </div>

      {/* Hardware Settings Bypass */}
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleMute}
          className={cn(
            "px-4 py-2 border font-mono text-[9px] font-bold tracking-widest uppercase transition-all",
            isMuted
              ? "bg-amber-500/10 border-amber-500 text-amber-500"
              : "border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
          )}
        >
          {isMuted ? "Unmute_Mic" : "Mute_Input"}
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button
          onClick={onReplayLastMessage}
          disabled={isAIPlaying || conversationHistory?.length === 0}
          className="px-4 py-2 border border-slate-800 font-mono text-[9px] font-bold tracking-widest uppercase text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Replay_Audio
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button className="text-slate-600 hover:text-emerald-500 transition-colors">
          <Icon name="Settings" size={14} />
        </button>
      </div>
    </div>
  );
};

export default VoiceControls;