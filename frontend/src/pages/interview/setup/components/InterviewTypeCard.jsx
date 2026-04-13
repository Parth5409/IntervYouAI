import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        "relative p-10 rounded-[2.5rem] cursor-pointer transition-all duration-700 group overflow-hidden border focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected
          ? "bg-surface-container-highest/60 border-primary shadow-[0_20px_60px_rgba(255,145,90,0.15)] ring-1 ring-primary/20"
          : "bg-surface-container-high/40 border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-high/60 shadow-xl"
      )}
    >
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 blur-[80px] transition-all duration-1000",
        isSelected ? "bg-primary/20 opacity-100" : "bg-primary/5 opacity-0 group-hover:opacity-100"
      )} />

      {/* Selection Badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-6 right-8 z-20"
          >
            <div className="bg-primary text-on-primary px-3 py-1 rounded-full font-headline text-[9px] font-extrabold tracking-[0.2em] uppercase shadow-lg">
              Selected
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Icon Frame */}
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-700 shadow-lg border",
          isSelected 
            ? "bg-primary text-on-primary border-primary/20 scale-110 rotate-3" 
            : "bg-surface-container-highest text-on-surface-variant border-outline-variant/10 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
        )}>
          <Icon name={icon} size={32} />
        </div>

        {/* Typography */}
        <h3 className={cn(
          "text-xl font-headline font-extrabold mb-4 tracking-tight uppercase leading-none transition-colors duration-500",
          isSelected ? "text-white" : "text-white/80 group-hover:text-white"
        )}>
          {title.replace(' Interview', '')}
        </h3>
        <p className="text-on-surface-variant font-body text-xs mb-8 leading-relaxed opacity-60 group-hover:opacity-80 transition-opacity duration-500 max-w-[240px]">
          {description}
        </p>

        {/* Feature List */}
        {features?.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-outline-variant/10">
            {features?.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4 group/item">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  isSelected ? "bg-primary scale-110 shadow-[0_0_8px_rgba(255,145,90,1)]" : "bg-outline-variant/40 group-hover:bg-primary/40"
                )} />
                <span className={cn(
                  "text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest transition-colors duration-500",
                  isSelected ? "text-white/80" : "group-hover/item:text-white/60"
                )}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geometric Decoration */}
      <div className={cn(
        "absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-primary/5 -mr-12 -mb-12 rounded-full blur-2xl transition-opacity duration-700",
        isSelected ? "opacity-100" : "opacity-0"
      )} />
    </div>
  );
};

export default InterviewTypeCard;