import React from 'react';
import Icon from '../../../../components/AppIcon';
import CameraPreview from '../../../../components/ui/CameraPreview';
import { cn } from '../../../../utils/cn';

const ParticipantCard = ({ 
  participant, 
  isSpeaking, 
  localStream, 
  isCameraActive, 
  cameraError 
}) => {
  const isHuman = participant.is_human || participant.id === 'human_user';
  const personalityStyles = {
    supportive: { icon: 'Heart', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
    assertive: { icon: 'Zap', color: 'text-red-500', borderColor: 'border-red-500/30' },
    factual: { icon: 'FileText', color: 'text-sky-500', borderColor: 'border-sky-500/30' },
    analytical: { icon: 'Activity', color: 'text-purple-500', borderColor: 'border-purple-500/30' },
    creative: { icon: 'Cpu', color: 'text-amber-500', borderColor: 'border-amber-500/30' },
    human: { icon: 'User', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' }
  };

  const style = personalityStyles[participant.personality] || { icon: 'Monitor', color: 'text-on-surface-variant', borderColor: 'border-outline-variant/30' };

  return (
    <div className="flex flex-col items-center gap-3 transition-all duration-500">
        <div className={cn(
            "w-20 h-20 border bg-surface-container-low flex items-center justify-center transition-all duration-500 relative group overflow-hidden",
            isSpeaking 
              ? "border-emerald-500 shadow-md scale-110 z-10 opacity-100" 
              : isHuman 
                ? "border-outline-variant/50 opacity-100" // Always full opacity for local user
                : "border-outline-variant/30 opacity-60"
        )}>
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-30 z-20" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-30 z-20" />

            {isHuman ? (
              <CameraPreview 
                stream={localStream}
                isActive={isCameraActive}
                error={cameraError}
                showStatus={false}
                className="w-full h-full border-none"
              />
            ) : (
              <Icon name={style.icon} size={24} className={cn("transition-colors duration-500", isSpeaking ? "text-emerald-500" : style.color)} />
            )}
            
            {isSpeaking && (
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-1.5 bg-emerald-500 text-slate-950 font-mono text-[7px] font-bold font-label font-medium text-on-surface-variant z-20">
                    SPEAKING
                </div>
            )}

            {/* Scanning line for active speaker */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-emerald-500/5 overflow-hidden pointer-events-none z-10">
                <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" />
              </div>
            )}
        </div>
        
        <div className="text-center space-y-0.5">
            <p className={cn(
              "text-[9px] font-mono font-bold tracking-widest uppercase truncate max-w-[80px]",
              isSpeaking ? "text-on-surface" : "text-on-surface-variant"
            )}>
              {participant.name}
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <div className={cn("w-1 h-1 rounded-full", isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-surface-container-low")} />
              <p className="text-[7px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">
                {isHuman ? 'LOCAL' : `${participant.personality.substring(0, 4).toUpperCase()}`}
              </p>
            </div>
        </div>
    </div>
  );
};

const ParticipantsGrid = ({ 
  participants = [], 
  activeSpeakerId, 
  localStream, 
  isCameraActive, 
  cameraError 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 lg:gap-x-10">
        {participants.map(p => (
          <ParticipantCard 
            key={p.id} 
            participant={p} 
            isSpeaking={p.id === activeSpeakerId} 
            localStream={localStream}
            isCameraActive={isCameraActive}
            cameraError={cameraError}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsGrid;

