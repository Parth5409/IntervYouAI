import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const ParticipantCard = ({ participant, isSpeaking }) => {
  const isHuman = participant.is_human;
  const personalityStyles = {
    supportive: { icon: 'Heart', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
    assertive: { icon: 'Zap', color: 'text-red-500', borderColor: 'border-red-500/30' },
    factual: { icon: 'FileText', color: 'text-sky-500', borderColor: 'border-sky-500/30' },
    analytical: { icon: 'Activity', color: 'text-purple-500', borderColor: 'border-purple-500/30' },
    creative: { icon: 'Cpu', color: 'text-amber-500', borderColor: 'border-amber-500/30' },
    human: { icon: 'User', color: 'text-emerald-500', borderColor: 'border-emerald-500/30' }
  };

  const style = personalityStyles[participant.personality] || { icon: 'Monitor', color: 'text-slate-500', borderColor: 'border-slate-800' };

  return (
    <div className="flex flex-col items-center gap-4 transition-all duration-500">
        <div className={cn(
            "w-24 h-24 border bg-slate-950 flex items-center justify-center transition-all duration-500 relative group",
            isSpeaking 
              ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-110 z-10" 
              : "border-slate-800 opacity-60"
        )}>
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-30" />

            <Icon name={style.icon} size={32} className={cn("transition-colors duration-500", isSpeaking ? "text-emerald-500" : style.color)} />
            
            {isSpeaking && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 bg-emerald-500 text-slate-950 font-mono text-[8px] font-bold tracking-widest uppercase">
                    SPEAKING
                </div>
            )}

            {/* Scanning line for active speaker */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-emerald-500/5 overflow-hidden pointer-events-none">
                <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan" />
              </div>
            )}
        </div>
        
        <div className="text-center space-y-1">
            <p className={cn(
              "text-[10px] font-mono font-bold tracking-widest uppercase",
              isSpeaking ? "text-slate-100" : "text-slate-500"
            )}>
              {participant.name}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className={cn("w-1 h-1 rounded-full", isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-slate-800")} />
              <p className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
                {isHuman ? 'LOCAL_NODE' : `AGENT_${participant.personality.toUpperCase()}`}
              </p>
            </div>
        </div>
    </div>
  );
};

const ParticipantsGrid = ({ participants = [], activeSpeakerId }) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-8">
        {participants.map(p => (
          <ParticipantCard key={p.id} participant={p} isSpeaking={p.id === activeSpeakerId} />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsGrid;
