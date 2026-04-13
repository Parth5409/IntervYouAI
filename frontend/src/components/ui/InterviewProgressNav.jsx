import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './button';
import { cn } from '../../utils/cn';

const InterviewProgressNav = ({ 
  currentStep = 1, 
  totalSteps = 3, 
  stepLabels = ['SETUP', 'INTERVIEW', 'FEEDBACK'],
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
    <header className="bg-background/80 backdrop-blur-3xl border-b border-outline-variant/10 sticky top-0 z-50 h-20 shrink-0">
      <div className="mx-auto h-full flex items-center justify-between px-10">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          {showBackButton && !isInterviewActive ? (
            <button
              onClick={handleBack}
              className="text-on-surface-variant hover:text-white transition-all p-2 rounded-xl hover:bg-surface-container-high"
            >
              <Icon name="ms:arrow_back" size={20} />
            </button>
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(255,145,90,0.15)]">
              <Icon name="ms:terminal" size={20} className="text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-headline font-extrabold tracking-[0.2em] text-[11px] text-white uppercase">
              IntervYou.AI
            </span>
            <span className="font-body text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
              Session Node 01
            </span>
          </div>
        </div>

        {/* Center: Mission Progress */}
        <div className="hidden md:block flex-1 max-w-2xl mx-12">
          <div className="flex items-center justify-between gap-4">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-4 group">
                    <div className={cn(
                      "w-8 h-8 rounded-full font-headline text-[10px] font-extrabold flex items-center justify-center transition-all duration-700",
                      isCompleted ? "bg-emerald-500 text-background shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                      isActive ? "bg-primary text-white shadow-[0_0_20px_rgba(255,145,90,0.4)]" :
                      "bg-surface-container-high text-on-surface-variant border border-outline-variant/10"
                    )}>
                      {isCompleted ? <Icon name="ms:check" size={14} /> : stepNumber}
                    </div>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-headline text-[10px] font-extrabold tracking-[0.1em] uppercase transition-colors leading-none",
                        isActive ? "text-white" : "text-on-surface-variant opacity-40"
                      )}>
                        {label}
                      </span>
                      {isActive && (
                        <span className="font-body text-[7px] font-bold text-primary uppercase tracking-widest mt-1 animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  {index < stepLabels.length - 1 && (
                    <div className={cn(
                      "flex-1 h-[2px] rounded-full transition-all duration-1000",
                      isCompleted ? "bg-emerald-500/30" : "bg-outline-variant/10"
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
            <span className="text-[8px] font-body text-on-surface-variant font-bold uppercase tracking-widest opacity-40">System State</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-headline font-extrabold text-emerald-500 uppercase tracking-widest leading-none">Operational</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
            </div>
          </div>
          <button 
            onClick={handleHome}
            className="text-on-surface-variant hover:text-white transition-all p-2 rounded-xl hover:bg-surface-container-high"
          >
            <Icon name="ms:home" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default InterviewProgressNav;