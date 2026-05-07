import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import { cn } from '../../../utils/cn';

const QuickActionCards = ({ onStartInterview, onViewHistory }) => {
  const actionCards = [
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Practice coding problems and system design questions',
      icon: 'ms:code',
      accent: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/10',
      action: () => onStartInterview('technical')
    },
    {
      id: 'hr',
      title: 'HR Interview',
      description: 'Behavioral questions and company culture fit',
      icon: 'ms:groups',
      accent: 'text-secondary',
      bg: 'bg-secondary/5',
      border: 'border-secondary/10',
      action: () => onStartInterview('hr')
    },
    {
      id: 'group',
      title: 'Group Discussion',
      description: 'Practice group dynamics and communication skills',
      icon: 'ms:forum',
      accent: 'text-amber-500',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/10',
      action: () => onStartInterview('group')
    },
    {
      id: 'salary',
      title: 'Salary Negotiation',
      description: 'Learn to negotiate compensation effectively',
      icon: 'ms:payments',
      accent: 'text-sky-500',
      bg: 'bg-sky-500/5',
      border: 'border-sky-500/10',
      action: () => onStartInterview('salary')
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-headline font-bold text-white tracking-tight">Interview Modes</h2>
        <Button
          variant="ghost"
          onClick={onViewHistory}
          className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant hover:text-white"
        >
          History
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actionCards?.map((card) => (
          <div
            key={card?.id}
            className={cn(
              "bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:border-primary/40 hover:-translate-y-1 shadow-xl group relative overflow-hidden",
            )}
            onClick={card?.action}
          >
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", card.bg)} />
            
            <div className="flex flex-col gap-6 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                "bg-surface-container-highest border-outline-variant/20 group-hover:scale-110",
                card.accent
              )}>
                <Icon name={card?.icon} size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-white text-base mb-2 group-hover:text-primary transition-colors">{card?.title}</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed line-clamp-2">
                  {card?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionCards;
