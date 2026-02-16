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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-950 font-mono", className)}>
      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {transcript.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              "flex flex-col gap-2",
              message.type === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[9px] font-bold tracking-widest px-2 py-0.5 border",
                message.type === 'user' ? "border-sky-500/30 text-sky-500 bg-sky-500/5" : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
              )}>
                {message.speaker.toUpperCase()}
              </span>
              <span className="text-[8px] text-slate-600">
                [{formatTime(message.timestamp)}]
              </span>
            </div>
            
            <div className={cn(
              "max-w-[90%] p-4 border relative group transition-all duration-300",
              message.type === 'user' 
                ? 'bg-sky-500/5 border-sky-500/20 text-sky-50 shadow-[4px_4px_0px_rgba(56,189,248,0.1)]' 
                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-50 shadow-[-4px_4px_0px_rgba(16,185,129,0.1)]'
            )}>
              <p className="text-[11px] leading-relaxed tracking-tight">
                {message.text}
              </p>
              
              {/* Message status bit */}
              <div className={cn(
                "absolute -bottom-1 w-1 h-1",
                message.type === 'user' ? "right-0 bg-sky-500" : "left-0 bg-emerald-500"
              )} />
            </div>
          </div>
        ))}

        {/* Loading Indicator - Terminal Style */}
        {isLoading && (
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 border border-emerald-500/30 text-emerald-500 bg-emerald-500/5 animate-pulse">
                AI_ANALYST
              </span>
              <span className="text-[8px] text-slate-600 animate-pulse">
                [PROCESSING_RESPONSE...]
              </span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 w-24">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[8px] text-slate-500 uppercase">Token_Count</p>
            <p className="text-[10px] text-slate-300 font-bold tracking-widest">
              {transcript.reduce((acc, msg) => acc + msg.text.split(' ').length, 0)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] text-slate-500 uppercase">Stream_Integrity</p>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">100%</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTranscript;