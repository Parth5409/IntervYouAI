import React, { useEffect, useRef } from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const ConversationTranscript = ({ 
  transcript = [], 
  isLoading = false,
  className = "" 
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, isLoading]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-background font-body", className)}>
      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar scroll-smooth"
      >
        {transcript.map((message, index) => {
          if (!message) return null;
          const isUser = message.type === 'user';
          return (
            <div
              key={message.id || index}
              className={cn(
                "flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-500",
                isUser ? 'items-end ml-12' : 'items-start mr-12'
              )}
            >
              <div className={cn(
                "flex items-center gap-3 px-1",
                isUser ? "flex-row-reverse" : "flex-row"
              )}>
                <span className={cn(
                  "text-[9px] font-bold tracking-[0.2em] uppercase",
                  isUser ? "text-primary" : "text-on-surface"
                )}>
                  {isUser ? 'Candidate Response' : 'AI Analysis Agent'}
                </span>
                <span className="text-[9px] text-on-surface-variant font-medium opacity-40">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className={cn(
                "p-5 rounded-2xl relative transition-all duration-500 shadow-xl",
                isUser 
                  ? 'bg-primary/5 border border-primary/20 text-on-surface rounded-tr-none' 
                  : 'bg-surface-container-high/40 border border-outline-variant/10 text-on-surface rounded-tl-none backdrop-blur-md'
              )}>
                <p className="text-[13px] leading-relaxed tracking-tight font-medium">
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col gap-3 items-start animate-pulse">
            <div className="flex items-center gap-3 px-1">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary">
                AI Synthesis
              </span>
              <span className="text-[9px] text-on-surface-variant font-medium opacity-40">
                Live Feed
              </span>
            </div>
            <div className="bg-surface-container-high/40 border border-outline-variant/10 p-5 rounded-2xl rounded-tl-none backdrop-blur-md min-w-[80px]">
              <div className="flex gap-1.5 items-end h-3">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                    className="w-[3px] bg-primary/40 rounded-full" 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Footer */}
      <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low/30 backdrop-blur-lg">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="ms:description" size={14} className="text-on-surface-variant opacity-40" />
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Context Weight</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-headline font-extrabold text-on-surface leading-none">
                {transcript.reduce((acc, msg) => acc + (msg?.text ? msg.text.split(' ').length : 0), 0)}
              </p>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Tokens</span>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Feed Fidelity</p>
              <Icon name="ms:graphic_eq" size={14} className="text-primary opacity-60" />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs font-headline font-extrabold text-on-surface leading-none font-label font-medium text-on-surface-variant">Synchronized</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTranscript;