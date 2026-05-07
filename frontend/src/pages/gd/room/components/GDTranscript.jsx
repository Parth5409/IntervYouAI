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
      return { id: 'moderator', name: 'Moderator', personality: 'moderator' };
    }
    return participants.find(p => p.id === speakerId) || { name: speakerId.toUpperCase(), personality: 'unknown' };
  };

  const personalityStyles = {
    supportive: { text: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/20' },
    assertive: { text: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/20' },
    factual: { text: 'text-sky-500', bg: 'bg-sky-500/5', border: 'border-sky-500/20' },
    analytical: { text: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
    creative: { text: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    human: { text: 'text-secondary', bg: 'bg-secondary/5', border: 'border-secondary/20' },
    moderator: { text: 'text-on-surface-variant', bg: 'bg-surface-container-low', border: 'border-outline-variant/30' }
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-low font-headline">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => {
          const speaker = getSpeakerInfo(msg.speaker_id);
          const isUser = msg.speaker_id === 'human_user';
          const isMod = speaker.id === 'moderator';
          const style = personalityStyles[speaker.personality] || personalityStyles.moderator;

          if (isMod) {
            return (
              <div key={index} className="flex justify-center py-1">
                <div className="bg-white/5 border border-white/5 px-3 py-1 flex items-center gap-2 rounded-lg">
                  <Icon name="ms:security" size={10} className="text-on-surface-variant/60" />
                  <p className="text-[8px] text-on-surface-variant/60 uppercase tracking-[0.2em]">{msg.message}</p>
                </div>
              </div>
            )
          }

          return (
            <div key={index} className={cn("flex flex-col gap-1.5", isUser ? "items-end ml-6" : "items-start mr-6")}>
              <div className="flex items-center gap-2">
                {!isUser && (
                  <div className={cn("w-1 h-1", isUser ? "bg-sky-500" : "bg-secondary")} />
                )}
                <span className={cn(
                  "text-[8px] font-black tracking-widest px-2 py-0.5 border rounded-md uppercase",
                  isUser ? "border-sky-500/30 text-sky-500 bg-sky-500/5" : "border-secondary/30 text-secondary bg-secondary/5"
                )}>
                  {speaker.name.toUpperCase()}
                </span>
                {isUser && (
                  <div className="w-1 h-1 bg-sky-500" />
                )}
              </div>

              <div className={cn(
                "max-w-[95%] p-3 border rounded-xl relative transition-all duration-300 shadow-lg",
                isUser 
                  ? 'bg-sky-500/5 border-sky-500/20 text-sky-50 rounded-tr-none' 
                  : 'bg-white/[0.02] border-white/5 text-slate-300 rounded-tl-none backdrop-blur-xl'
              )}>
                <p className="text-[11px] leading-relaxed tracking-tight font-medium">{msg.message}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex flex-col gap-1.5 items-start">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black tracking-widest px-2 py-0.5 border border-secondary/30 text-secondary bg-secondary/5 animate-pulse rounded-md">
                Thinking...
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3 w-16 rounded-xl rounded-tl-none">
              <div className="flex gap-1 items-end h-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1 h-2 bg-secondary/40 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[7px] text-on-surface-variant/40 uppercase font-black tracking-widest">Connection</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-secondary font-black uppercase tracking-widest">Stable</span>
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-on-surface-variant/40 uppercase font-black tracking-widest">Participants</p>
            <p className="text-[10px] text-white font-black tracking-widest">{participants.length + 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDTranscript;