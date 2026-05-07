import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
    <div className={cn("flex flex-col h-full bg-transparent font-body", className)}>
      <div className="noise opacity-5" />
      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth"
      >
        {transcript.map((message, index) => {
          if (!message) return null;
          const isUser = message.type === 'user';
          return (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, x: isUser ? 20 : -20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col gap-2 group",
                isUser ? 'items-end ml-8' : 'items-start mr-8'
              )}
            >
              <div className={cn(
                "flex items-center gap-3 px-1",
                isUser ? "flex-row-reverse" : "flex-row"
              )}>
                <span className={cn(
                  "text-[8px] font-black tracking-[0.2em] uppercase",
                  isUser ? "text-primary" : "text-white"
                )}>
                  {isUser ? 'USER_INPUT' : 'AI_RESPONSE'}
                </span>
                <span className="text-[8px] text-white/10 font-black uppercase tracking-widest">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl relative transition-all duration-700 shadow-xl overflow-hidden",
                isUser 
                  ? 'bg-primary/5 border border-primary/20 text-white rounded-tr-none' 
                  : 'bg-white/[0.02] border border-white/5 text-white rounded-tl-none backdrop-blur-2xl'
              )}>
                <div className={cn(
                  "absolute top-0 w-8 h-0.5",
                  isUser ? "right-0 bg-primary" : "left-0 bg-secondary"
                )} />
                <p className="text-xs leading-relaxed tracking-tight font-medium">
                  {message.text}
                </p>
              </div>
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 items-start"
          >
            <div className="flex items-center gap-3 px-1">
              <span className="text-[8px] font-black tracking-[0.2em] uppercase text-primary animate-pulse">
                AI_SYNTH
              </span>
              <span className="text-[8px] text-white/10 font-black uppercase tracking-widest">
                LIVE_FEED
              </span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl rounded-tl-none backdrop-blur-2xl min-w-[80px] shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse" />
              <div className="flex gap-1 items-end h-3 relative z-10">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [3, 12, 3] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-[3px] bg-primary/40 rounded-full" 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analytics Footer */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01] backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="ms:description" size={14} className="text-white/20" />
              <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">WEIGHT</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-headline font-black text-white leading-none tracking-tighter">
                {transcript.reduce((acc, msg) => acc + (msg?.text ? msg.text.split(' ').length : 0), 0)}
              </p>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.1em] italic">TKNS</span>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end gap-2">
              <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">FIDELITY</p>
              <Icon name="ms:graphic_eq" size={14} className="text-secondary opacity-60" />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-[10px] font-headline font-black text-white leading-none uppercase tracking-widest italic">SYNC</span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTranscript;