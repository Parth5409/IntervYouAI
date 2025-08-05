import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

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
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error during exit:', error);
      setIsExiting(false);
    }
  };

  const handleEmergencyExit = () => {
    // Immediate exit without confirmation for true emergencies
    navigate('/dashboard');
  };

  return (
    <>
      {/* Emergency Exit Button */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          variant="ghost"
          onClick={() => setShowConfirmation(true)}
          className="w-10 h-10 rounded-full p-0 bg-card/90 backdrop-blur-sm border border-border shadow-soft hover:bg-destructive hover:text-destructive-foreground transition-colors"
          iconName="X"
          iconSize={20}
        />
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => !isExiting && setShowConfirmation(false)} 
          />
          
          <div className="bg-card rounded-lg shadow-elevated border border-border p-6 w-full max-w-md relative animate-fade-in">
            {isExiting ? (
              // Exiting State
              (<div className="text-center py-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Saving Progress...
                </h3>
                <p className="text-muted-foreground text-sm">
                  Please wait while we save your interview session.
                </p>
              </div>)
            ) : (
              // Confirmation State
              (<>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="AlertTriangle" size={24} color="var(--color-warning)" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Exit Interview Session?
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-6">
                    Are you sure you want to exit? Your progress will be saved, but the current session will end immediately.
                  </p>

                  {/* Session Info */}
                  {sessionData?.sessionTime && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-6 text-left">
                      <div className="text-xs text-muted-foreground mb-2">Session Summary:</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {Math.floor(sessionData?.sessionTime / 60)}:{(sessionData?.sessionTime % 60)?.toString()?.padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Questions:</span>
                          <span className="font-medium">
                            {sessionData?.questionsAnswered || 0} answered
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phase:</span>
                          <span className="font-medium">
                            {sessionData?.currentPhase || 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-3">
                    <Button
                      variant="destructive"
                      onClick={handleExit}
                      fullWidth
                      iconName="LogOut"
                      iconPosition="left"
                    >
                      Exit & Save Progress
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      fullWidth
                    >
                      Continue Session
                    </Button>

                    {/* Emergency Exit - Small button */}
                    <button
                      onClick={handleEmergencyExit}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors py-2"
                    >
                      Emergency Exit (No Save)
                    </button>
                  </div>
                </div>
              </>)
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyExit;