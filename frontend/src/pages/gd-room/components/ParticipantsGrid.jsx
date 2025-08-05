import React from 'react';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const ParticipantCard = ({ participant, isSpeaking }) => {
  const isHuman = participant.is_human;
  const personalityStyles = {
    supportive: { icon: 'Heart', color: 'text-green-600', ring: 'ring-green-500' },
    assertive: { icon: 'Megaphone', color: 'text-red-600', ring: 'ring-red-500' },
    factual: { icon: 'BookOpen', color: 'text-blue-600', ring: 'ring-blue-500' },
    analytical: { icon: 'BarChart2', color: 'text-purple-600', ring: 'ring-purple-500' },
    creative: { icon: 'Paintbrush', color: 'text-yellow-600', ring: 'ring-yellow-500' },
    human: { icon: 'User', color: 'text-primary', ring: 'ring-primary' }
  };

  const style = personalityStyles[participant.personality] || { icon: 'Bot', color: 'text-muted-foreground', ring: 'ring-gray-400' };

  return (
    <div className="flex flex-col items-center space-y-2">
        <div className={cn(
            "w-20 h-20 rounded-full bg-card flex items-center justify-center transition-all duration-300 relative ring-4 ring-offset-2 ring-offset-background",
            isSpeaking ? style.ring : 'ring-transparent'
        )}>
            <Icon name={style.icon} size={40} className={style.color} />
            {isSpeaking && (
                <div className="absolute -bottom-2 w-full flex justify-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            )}
        </div>
        <div className="text-center">
            <p className="text-base font-semibold text-foreground">{participant.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{isHuman ? 'You' : participant.personality}</p>
        </div>
    </div>
  );
};

const ParticipantsGrid = ({ participants = [], activeSpeakerId }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
        {participants.map(p => (
          <ParticipantCard key={p.id} participant={p} isSpeaking={p.id === activeSpeakerId} />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsGrid;
