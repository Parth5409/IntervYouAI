import React, { useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

const CameraPreview = ({ 
  stream, 
  isActive, 
  error, 
  className,
  overlayLabel = "LOCAL_FEED",
  showStatus = true
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream && isActive) {
      video.srcObject = stream;
      video.play().catch(err => {
        console.warn("Video auto-play failed:", err);
      });
    }

    return () => {
      if (video) {
        video.pause();
        video.srcObject = null;
        video.load(); // Force browser to release resources
      }
    };
  }, [stream, isActive]);

  return (
    <div className={cn(
      "relative bg-slate-900 border border-outline-variant/30 overflow-hidden flex items-center justify-center transition-all duration-500 group min-h-[120px]",
      isActive && !error ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "opacity-80",
      className
    )}>
      {/* Corner Brackets - Blueprint Aesthetic */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/60 z-30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/60 z-30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/60 z-30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/60 z-30" />

      {isActive && !error ? (
        <div className="w-full h-full relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transition-all duration-700 bg-black block"
            style={{ minWidth: '100%', minHeight: '100%', transform: 'scaleX(-1)' }}
          />
          
          {/* Scanning Line Overlay */}
          <div className="absolute inset-0 bg-emerald-500/5 overflow-hidden pointer-events-none z-10">
            <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" />
          </div>

          {showStatus && (
            <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[8px] font-mono text-emerald-500 font-bold tracking-tighter uppercase bg-slate-950/80 px-1.5 py-0.5 border border-emerald-500/20 rounded-sm">
                {overlayLabel}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <div className="w-12 h-12 rounded-full border border-dashed border-outline-variant/50 flex items-center justify-center">
            <Icon 
              name={error ? "AlertTriangle" : "CameraOff"} 
              size={24} 
              className={error ? "text-amber-500" : "text-on-surface-variant/40"} 
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">
              {error ? "DEVICE_ERROR" : "CAMERA_OFFLINE"}
            </p>
            <p className="text-[8px] font-mono text-on-surface-variant/60 uppercase">
              {error ? error : "Telemetry_Disconnected"}
            </p>
          </div>
        </div>
      )}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-10 pointer-events-none" />
    </div>
  );
};

export default CameraPreview;
