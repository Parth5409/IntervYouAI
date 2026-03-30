import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const InterviewTypeCard = ({ 
  title, 
  description, 
  icon, 
  isSelected, 
  onClick,
  features = []
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      className={cn(
        "relative p-8 border cursor-pointer transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-1 focus:ring-emerald-500",
        isSelected
          ? "border-emerald-500 bg-emerald-500/5"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
      )}
    >
      {/* Background Accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-opacity duration-500",
        isSelected ? "bg-emerald-500/10 opacity-100" : "bg-emerald-500/5 opacity-0 group-hover:opacity-100"
      )} />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-2">
          <div className="bg-emerald-500 text-slate-950 px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase">
            SELECTED
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 border flex items-center justify-center mb-6 transition-colors duration-300",
          isSelected ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-slate-700 text-slate-500 group-hover:border-slate-600"
        )}>
          <Icon name={icon} size={24} />
        </div>

        {/* Content */}
        <h3 className={cn(
          "text-sm font-mono font-bold mb-3 tracking-widest uppercase",
          isSelected ? "text-emerald-500" : "text-slate-200"
        )}>
          {title.replace(' Interview', '')}
        </h3>
        <p className="text-slate-400 font-mono text-[10px] mb-6 leading-relaxed tracking-tight">
          {description}
        </p>

        {/* Features */}
        {features?.length > 0 && (
          <div className="space-y-2 border-t border-slate-800/50 pt-4">
            {features?.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="mt-1 w-1 h-1 bg-emerald-500/50 shrink-0" />
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter leading-tight group-hover:text-slate-400 transition-colors">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Industrial corner accents */}
      <div className={cn(
        "absolute bottom-0 right-0 w-4 h-4 border-b border-r transition-colors",
        isSelected ? "border-emerald-500" : "border-transparent group-hover:border-slate-700"
      )} />
    </div>
  );
};

export default InterviewTypeCard;