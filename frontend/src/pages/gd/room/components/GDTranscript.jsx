import React, { useEffect, useRef } from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const GDTranscript = ({ messages = [], isLoading = false, participants = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getSpeakerInfo = (speakerId) => {
    if (speakerId === 'moderator') {
      return { id: 'moderator', name: 'SYSTEM_MODERATOR', personality: 'moderator' };
    }
    return participants.find(p => p.id === speakerId) || { name: speakerId.toUpperCase(), personality: 'unknown' };
  };

  const personalityStyles = {
    supportive: { text: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    assertive: { text: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/20' },
    factual: { text: 'text-sky-500', bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
    analytical: { text: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
    creative: { text: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    human: { text: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    moderator: { text: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-800' }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, index) => {
          const speaker = getSpeakerInfo(msg.speaker_id);
          const isUser = msg.speaker_id === 'human_user';
          const isMod = speaker.id === 'moderator';
          const style = personalityStyles[speaker.personality] || personalityStyles.moderator;

          if (isMod) {
            return (
              <div key={index} className="flex justify-center py-2">
                <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 flex items-center gap-3">
                  <Icon name="Shield" size={12} className="text-slate-500" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">{msg.message}</p>
                </div>
              </div>
            )
          }

          return (
            <div key={index} className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
              <div className="flex items-center gap-3">
                {!isUser && (
                  <div className={cn("w-1.5 h-1.5", isUser ? "bg-sky-500" : "bg-emerald-500")} />
                )}
                <span className={cn(
                  "text-[9px] font-bold tracking-widest px-2 py-0.5 border",
                  isUser ? "border-sky-500/30 text-sky-500 bg-sky-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                )}>
                  {speaker.name.toUpperCase()}
                </span>
                {isUser && (
                  <div className="w-1.5 h-1.5 bg-sky-500" />
                )}
              </div>

              <div className={cn(
                "max-w-[90%] p-4 border relative transition-all duration-300",
                isUser 
                  ? 'bg-sky-500/5 border-sky-500/20 text-sky-50' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-300'
              )}>
                <p className="text-[11px] leading-relaxed tracking-tight">{msg.message}</p>
                
                {/* Visual bit */}
                <div className={cn(
                  "absolute -bottom-1 w-1 h-1",
                  isUser ? "right-0 bg-sky-500" : "left-0 bg-slate-700"
                )} />
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 border border-emerald-500/30 text-emerald-500 bg-emerald-500/5 animate-pulse">
                AGENT_PROCESSING
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 w-20">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1 h-3 bg-emerald-500/40 animate-waveform" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[8px] text-slate-500 uppercase">Discussion_Integrity</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">STABLE</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-500 uppercase">Active_Agents</p>
            <p className="text-[10px] text-slate-300 font-bold tracking-widest">{participants.length + 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDTranscript;