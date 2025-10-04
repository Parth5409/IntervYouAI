import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const ConversationTranscript = ({ 
  transcript = [], 
  isLoading = false,
  className = "" 
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollRef?.current?.scrollHeight;
    }
  }, [transcript]);

  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Conversation
        </h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="MessageSquare" size={16} />
          <span>{transcript?.length} messages</span>
        </div>
      </div>
      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
      >
        {transcript?.map((message) => (
          <div
            key={message?.id}
            className={`flex ${
              message?.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message?.type === 'user' ?'bg-primary text-primary-foreground' :'bg-card border border-border text-card-foreground'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium opacity-80">
                  {message?.speaker}
                </span>
                <span className="text-xs opacity-60">
                  {formatTime(message?.timestamp)}
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {message?.text}
              </p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  AI
                </span>
                <span className="text-xs text-muted-foreground">
                  typing...
                </span>
              </div>
              <div className="flex space-x-1">
                {[...Array(3)]?.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Session active</span>
          <div className="flex items-center space-x-4">
            <span>Words spoken: {transcript?.reduce((acc, msg) => acc + msg?.text?.split(' ')?.length, 0)}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationTranscript;