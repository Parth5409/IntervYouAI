import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const EmergencyExit = ({ 
  onExit,
  sessionData = {},
  className = "" 
}) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = async () => {
    setIsExiting(true);
    try {
      if (onExit) {
        await onExit();
      }
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 800);
    } catch (error) {
      console.error('Error during exit:', error);
      setIsExiting(false);
    }
  };

  const handleEmergencyExit = () => {
    navigate('/student/dashboard');
  };

  return (
    <>
      {/* Emergency Exit Button */}
      <div className={cn("fixed top-4 right-4 z-50", className)}>
        <button
          onClick={() => setShowConfirmation(true)}
          className="w-10 h-10 border border-slate-800 bg-slate-950/80 backdrop-blur-md text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center group"
        >
          <Icon name="X" size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div 
            className="fixed inset-0 bg-slate-950/80" 
            onClick={() => !isExiting && setShowConfirmation(false)} 
          />
          
          <div className="bg-slate-900 border border-slate-800 p-8 w-full max-w-md relative font-mono animate-in zoom-in-95 duration-200">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-red-500/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-red-500/30" />

            {isExiting ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-100 uppercase tracking-widest">SAVING_MISSION_LOG</h3>
                  <p className="text-[10px] text-slate-500 uppercase">Synchronizing with global database...</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8">
                <div className="w-12 h-12 border border-red-500/30 bg-red-500/5 flex items-center justify-center mx-auto">
                  <Icon name="AlertTriangle" size={24} className="text-red-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-100 uppercase tracking-widest">TERMINATE_SIMULATION?</h3>
                  <p className="text-[10px] text-slate-500 uppercase leading-relaxed">
                    Confirming termination will end the current session. 
                    Partial progress will be committed to history.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleExit}
                    className="w-full bg-red-500 text-slate-950 font-bold py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-red-400 transition-colors"
                  >
                    Confirm_Termination
                  </button>
                  
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="w-full bg-slate-800 text-slate-300 font-bold py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-slate-700 transition-colors"
                  >
                    Abort_Action
                  </button>

                  <button
                    onClick={handleEmergencyExit}
                    className="text-[8px] text-slate-600 hover:text-red-500 uppercase tracking-widest pt-2 transition-colors"
                  >
                    FORCE_EXIT_WITHOUT_SYNC
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyExit;