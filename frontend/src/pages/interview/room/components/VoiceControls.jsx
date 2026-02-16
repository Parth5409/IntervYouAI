import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const VoiceControls = ({
  isRecording = false,
  isMuted = false,
  onToggleRecording,
  onToggleMute,
  disabled = false,
  isTranscribing = false,
}) => {

  const getStatusText = () => {
    if (disabled) return "AI_VOCAL_TRANSMISSION_ACTIVE";
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

        <button
          onClick={onToggleRecording}
          disabled={disabled || isMuted}
          className={cn(
            "w-24 h-24 border-2 flex items-center justify-center transition-all duration-500 relative z-10",
            isRecording 
              ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
              : disabled 
              ? "bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed"
              : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          )}
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
          
          {isTranscribing ? (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-4 bg-emerald-500 animate-waveform" style={{ animationDelay: `${i * 0.2}s` }} />
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
            isRecording ? "bg-red-500 animate-pulse" : isTranscribing ? "bg-sky-500 animate-bounce" : "bg-emerald-500"
          )} />
          <span className={cn(
            "font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
            isRecording ? "text-red-500" : "text-slate-300"
          )}>
            {getStatusText()}
          </span>
        </div>
        
        {/* Interaction Hint */}
        {!disabled && !isTranscribing && (
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
        <button className="text-slate-600 hover:text-emerald-500 transition-colors">
          <Icon name="Settings" size={14} />
        </button>
      </div>
    </div>
  );
};

export default VoiceControls;