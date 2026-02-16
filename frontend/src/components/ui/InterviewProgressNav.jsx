import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
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

  // Hide navigation during active interview (Optional, but let's keep it visible for now with tool-like style)
  // if (isInterviewActive) { return null; }

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 h-16 shrink-0">
      <div className="container mx-auto h-full flex items-center justify-between px-6">
        {/* Left: Terminal Style Home/Back */}
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="text-slate-500 hover:text-emerald-500 transition-colors p-2"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
          ) : (
            <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
              <Icon name="Brain" size={20} className="text-slate-950" />
            </div>
          )}
          <span className="font-mono font-bold tracking-tighter text-sm hidden sm:block">
            INTERVYOU.AI // NODE_01
          </span>
        </div>

        {/* Center: Mission Progress */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="flex items-center gap-2">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 border font-mono text-[10px] flex items-center justify-center transition-all duration-500",
                      isCompleted ? "bg-emerald-500 border-emerald-500 text-slate-950" :
                      isActive ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                      "border-slate-800 text-slate-600"
                    )}>
                      {isCompleted ? <Icon name="Check" size={12} /> : `0${stepNumber}`}
                    </div>
                    <span className={cn(
                      "font-mono text-[10px] tracking-widest hidden lg:block transition-colors",
                      isActive ? "text-slate-100 font-bold" : "text-slate-600"
                    )}>
                      {label}
                    </span>
                  </div>
                  {index < stepLabels.length - 1 && (
                    <div className="flex-1 h-[1px] bg-slate-800 min-w-[20px]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Status</span>
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-tighter">Live_Uplink</span>
          </div>
          <button 
            onClick={handleHome}
            className="text-slate-500 hover:text-emerald-500 transition-colors p-2"
          >
            <Icon name="Home" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default InterviewProgressNav;