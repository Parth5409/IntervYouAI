import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const SessionControls = ({
  isRecording = false,
  isMuted = false,
  sessionTime = 0,
  onToggleRecording,
  onToggleMute,
  onEndSession,
  isConnected = true,
  microphoneLevel = 0,
  showTimer = true,
  showMicLevel = true
}) => {
  const navigate = useNavigate();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (onEndSession) {
      onEndSession();
    } else {
      navigate('/interview-feedback');
    }
    setShowEndConfirm(false);
  };

  const handleEmergencyExit = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {/* Main Session Controls - Fixed Position */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-card border border-border rounded-full shadow-elevated px-6 py-4 flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-success animate-pulse-gentle' : 'bg-error'
              }`}
            />
            <span className="text-xs text-muted-foreground hidden sm:block">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Microphone Level Indicator */}
          {showMicLevel && (
            <div className="flex items-center space-x-2">
              <Icon 
                name={isMuted ? "MicOff" : "Mic"} 
                size={16} 
                color={isMuted ? "var(--color-error)" : "var(--color-success)"}
              />
              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-success transition-all duration-100"
                  style={{ width: `${microphoneLevel}%` }}
                />
              </div>
            </div>
          )}

          {/* Recording Button */}
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={onToggleRecording}
            iconName={isRecording ? "Square" : "Play"}
            iconSize={20}
            className="rounded-full w-12 h-12 p-0"
          />

          {/* Mute Button */}
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            onClick={onToggleMute}
            iconName={isMuted ? "MicOff" : "Mic"}
            iconSize={18}
            className="rounded-full w-10 h-10 p-0"
          />

          {/* Session Timer */}
          {showTimer && (
            <div className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded-full">
              {formatTime(sessionTime)}
            </div>
          )}

          {/* End Session Button */}
          <Button
            variant="outline"
            onClick={() => setShowEndConfirm(true)}
            iconName="Square"
            iconSize={16}
            className="hidden sm:flex"
          >
            End
          </Button>
        </div>
      </div>

      {/* Mobile Controls - Bottom Sheet Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 sm:hidden z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-success animate-pulse-gentle' : 'bg-error'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {showTimer && (
              <div className="text-sm font-mono text-foreground">
                {formatTime(sessionTime)}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowEndConfirm(true)}
            iconName="Square"
            iconSize={16}
            className="text-destructive"
          >
            End
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-6">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            onClick={onToggleMute}
            iconName={isMuted ? "MicOff" : "Mic"}
            iconSize={20}
            className="rounded-full w-14 h-14 p-0"
          />

          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={onToggleRecording}
            iconName={isRecording ? "Square" : "Play"}
            iconSize={24}
            className="rounded-full w-16 h-16 p-0"
          />

          {showMicLevel && (
            <div className="flex flex-col items-center space-y-1">
              <Icon 
                name="Volume2" 
                size={16} 
                color="var(--color-muted-foreground)"
              />
              <div className="w-2 h-12 bg-muted rounded-full overflow-hidden">
                <div
                  className="w-full bg-success transition-all duration-100"
                  style={{ 
                    height: `${microphoneLevel}%`,
                    transform: 'translateY(100%)',
                    transformOrigin: 'bottom'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Exit Button - Top Corner */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          onClick={handleEmergencyExit}
          iconName="X"
          iconSize={20}
          className="rounded-full w-10 h-10 p-0 bg-card/80 backdrop-blur-sm border border-border"
        />
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEndConfirm(false)} />
          <div className="bg-card rounded-lg shadow-elevated border border-border p-6 w-full max-w-md relative">
            <div className="text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertTriangle" size={24} color="var(--color-warning)" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                End Interview Session?
              </h3>
              
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to end this interview session? Your progress will be saved and you'll receive feedback.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEndConfirm(false)}
                  fullWidth
                >
                  Continue
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleEndSession}
                  fullWidth
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionControls;