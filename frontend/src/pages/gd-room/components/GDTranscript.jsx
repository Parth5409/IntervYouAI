import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const GDTranscript = ({ messages = [], isLoading = false, participants = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSpeakerInfo = (speakerId) => {
    if (speakerId === 'moderator') {
      return { id: 'moderator', name: 'Moderator', personality: 'moderator' };
    }
    return participants.find(p => p.id === speakerId) || { name: speakerId, personality: 'unknown' };
  };

  const personalityColors = {
    supportive: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    assertive: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    factual: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    analytical: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    creative: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    human: { text: 'text-primary', bg: 'bg-primary', border: 'border-primary' },
    moderator: { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Discussion Transcript</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => {
          const speaker = getSpeakerInfo(msg.speaker_id);
          const isUser = msg.speaker_id === 'human_user';
          const colors = personalityColors[speaker.personality] || personalityColors.moderator;

          if (speaker.id === 'moderator') {
            return (
              <div key={index} className="text-center my-4">
                <p className="text-sm text-muted-foreground italic px-4 py-2 bg-muted/50 rounded-lg">{msg.message}</p>
              </div>
            )
          }

          return (
            <div key={index} className={cn("flex items-start space-x-3", isUser ? "justify-end" : "justify-start")}>
              {!isUser && (
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colors.bg)}>
                  <Icon name={'Bot'} size={20} className={colors.text} />
                </div>
              )}
              <div className={cn("max-w-[85%] rounded-lg p-3", isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border')}>
                <p className={cn("text-sm font-semibold mb-1", isUser ? 'text-primary-foreground/80' : colors.text)}>
                  {speaker.name}
                </p>
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
               {isUser && (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name='User' size={20} className='text-primary' />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start items-center space-x-3">
             <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Icon name='Bot' size={20} className='text-muted-foreground' />
              </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GDTranscript;