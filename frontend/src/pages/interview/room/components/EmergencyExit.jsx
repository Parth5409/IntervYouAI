import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/button';
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
      <div className={cn("fixed top-8 right-8 z-50", className)}>
        <button
          onClick={() => setShowConfirmation(true)}
          aria-label="Exit interview"
          className="w-14 h-14 rounded-2xl border border-outline-variant/10 bg-surface-container-high/40 backdrop-blur-2xl text-on-surface-variant hover:text-error hover:border-error/20 transition-all flex items-center justify-center group shadow-xl"
        >
          <Icon name="ms:close" size={24} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md" 
              onClick={() => !isExiting && setShowConfirmation(false)} 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-container-high border border-outline-variant/10 p-12 rounded-[2.5rem] w-full max-w-lg relative font-body shadow-2xl overflow-hidden"
            >
              {/* Subtle Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-error/10 rounded-full blur-[60px] pointer-events-none" />

              {isExiting ? (
                <div className="text-center py-12 space-y-8">
                  <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <div className="space-y-3">
                    <h3 className="text-xl font-headline font-extrabold text-on-surface">Saving Session</h3>
                    <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-40">Synchronizing neural bridge data...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-10">
                  <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto">
                    <Icon name="ms:warning" size={40} className="text-error" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-headline font-extrabold text-on-surface">Terminate Session?</h3>
                    <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed max-w-sm mx-auto">
                      Confirming termination will end the current simulation. 
                      Partial progress will be committed to your permanent record.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleExit}
                      variant="destructive"
                      className="h-16 rounded-2xl w-full text-xs uppercase tracking-[0.2em] font-bold"
                    >
                      Confirm Termination
                    </Button>
                    
                    <Button
                      onClick={() => setShowConfirmation(false)}
                      variant="outline"
                      className="h-16 rounded-2xl w-full text-xs uppercase tracking-[0.2em] font-bold"
                    >
                      Return to Session
                    </Button>

                    <button
                      onClick={handleEmergencyExit}
                      className="text-[10px] text-on-surface-variant hover:text-error uppercase tracking-[0.2em] font-bold pt-4 transition-colors opacity-40 hover:opacity-100"
                    >
                      Force Exit (No Sync)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyExit;