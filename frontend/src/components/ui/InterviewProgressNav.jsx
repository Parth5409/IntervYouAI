import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './button';
import { cn } from '../../utils/cn';

const InterviewProgressNav = ({ 
  currentStep = 1, 
  totalSteps = 3, 
  stepLabels = ['Setup', 'Interview', 'Feedback'],
  showProgress = true,
  showBackButton = true,
  onBack,
  title,
  isInterviewActive = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex justify-between items-center px-10 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 font-headline text-xs font-semibold">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          {showBackButton && !isInterviewActive ? (
            <button
              onClick={handleBack}
              className="text-on-surface-variant hover:text-white transition-all p-2 rounded-lg hover:bg-surface-container"
            >
              <Icon name="ms:arrow_back" size={20} />
            </button>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black shadow-lg shadow-primary/10">
              <Icon name="ms:bolt" size={18} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-headline text-sm font-extrabold text-white tracking-tight leading-none">
              IntervYou.AI
            </span>
            <span className="font-headline text-[9px] text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">
              NODE_0X1A4 // ACTIVE_SESSION
            </span>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="hidden md:block flex-1 max-w-xl mx-12">
          <div className="flex items-center justify-between gap-4">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-3 group">
                    <div className={cn(
                      "w-6 h-6 rounded-full font-headline text-[10px] font-bold flex items-center justify-center transition-all duration-500",
                      isCompleted ? "bg-emerald-500 text-black shadow-sm" :
                      isActive ? "bg-primary text-black shadow-lg shadow-primary/20 scale-110" :
                      "bg-surface-container text-on-surface-variant border border-outline-variant/30"
                    )}>
                      {isCompleted ? <Icon name="ms:check" size={14} /> : stepNumber}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-headline text-[10px] font-bold uppercase tracking-widest transition-colors leading-none",
                        isActive ? "text-white" : "text-on-surface-variant opacity-40"
                      )}>
                        {label}
                      </span>
                    </div>
                  </div>
                  {index < stepLabels.length - 1 && (
                    <div className={cn(
                      "flex-1 h-[1px] rounded-full transition-all duration-1000",
                      isCompleted ? "bg-emerald-500/40" : "bg-outline-variant/20"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] font-headline text-on-surface-variant font-bold uppercase tracking-widest opacity-40">System_State</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-headline font-bold text-emerald-500 uppercase tracking-widest leading-none">Operational</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
            </div>
          </div>
          <button 
            onClick={handleHome}
            className="text-on-surface-variant hover:text-white transition-all p-2 rounded-lg hover:bg-surface-container border border-transparent hover:border-outline-variant/20 shadow-sm"
          >
            <Icon name="ms:home" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default InterviewProgressNav;