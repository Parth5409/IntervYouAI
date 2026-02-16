import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { cn } from '../../utils/cn';

const SessionControls = ({
  isRecording = false,
  isMuted = false,
  sessionTime = 0,
  onToggleRecording,
  onToggleMute,
  onEndSession,
  isConnected = true,
  microphoneLevel = 0,
  showTimer = true,
  showMicLevel = true,
  className
}) => {
  const navigate = useNavigate();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Main Session Controls - Industrial Bar */}
      <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50", className)}>
        <div className="bg-slate-950 border border-slate-800 p-2 flex items-center gap-4 shadow-2xl backdrop-blur-md">
          {/* Status Segment */}
          <div className="flex items-center gap-3 px-4 border-r border-slate-800">
            <div className={cn(
              "w-2 h-2",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest hidden sm:block">
              {isConnected ? 'Uplink_Active' : 'Uplink_Lost'}
            </span>
          </div>

          {/* Controls Segment */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRecording}
              className={cn(
                "w-10 h-10 border flex items-center justify-center transition-all",
                isRecording 
                  ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                  : "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 hover:border-emerald-500"
              )}
            >
              <Icon name={isRecording ? "Square" : "Mic"} size={18} />
            </button>

            <button
              onClick={onToggleMute}
              className={cn(
                "w-10 h-10 border flex items-center justify-center transition-all",
                isMuted 
                  ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                  : "border-slate-800 text-slate-400 hover:border-slate-600"
              )}
            >
              <Icon name={isMuted ? "MicOff" : "Volume2"} size={18} />
            </button>
          </div>

          {/* Timer Segment */}
          {showTimer && (
            <div className="px-4 border-l border-slate-800">
              <div className="font-mono text-xs font-bold text-slate-300 tracking-widest">
                {formatTime(sessionTime)}
              </div>
            </div>
          )}

          {/* Termination Segment */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="ml-2 bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:text-red-500 text-slate-500 font-mono text-[10px] font-bold tracking-widest uppercase h-10 px-4 transition-all"
          >
            Terminate
          </button>
        </div>
      </div>

      {/* End Session Confirmation Modal - Industrial Style */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="fixed inset-0 bg-slate-950/80" onClick={() => setShowEndConfirm(false)} />
          <div className="bg-slate-900 border border-slate-800 p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-500/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-500/30" />

            <div className="text-center space-y-6">
              <div className="w-12 h-12 border border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto">
                <Icon name="AlertTriangle" size={24} className="text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-mono font-bold text-slate-100 uppercase tracking-widest">
                  TERMINATE_MISSION_LOG?
                </h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase leading-relaxed">
                  Confirmation required to end current simulation. 
                  All captured data will be processed for analysis.
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-mono text-[10px] font-bold py-3 uppercase tracking-widest hover:bg-slate-750 transition-colors"
                >
                  Aborted
                </button>
                <button
                  onClick={onEndSession}
                  className="flex-1 bg-red-500 text-slate-950 font-mono text-[10px] font-bold py-3 uppercase tracking-widest hover:bg-red-400 transition-colors"
                >
                  Confirm_End
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionControls;