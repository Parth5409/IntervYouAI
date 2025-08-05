import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const VoiceControls = ({
  isListening = false,
  isMuted = false,
  microphoneLevel = 0,
  onToggleListening,
  onToggleMute,
  onVolumeChange,
  disabled = false
}) => {
  const [volume, setVolume] = useState(75);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  const getMicrophoneIcon = () => {
    if (isMuted) return 'MicOff';
    if (isListening) return 'Mic';
    return 'Mic';
  };

  const getMicrophoneVariant = () => {
    if (disabled) return 'secondary';
    if (isMuted) return 'destructive';
    if (isListening) return 'default';
    return 'outline';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Microphone Button */}
      <div className="relative">
        <Button
          variant={getMicrophoneVariant()}
          onClick={onToggleListening}
          disabled={disabled || isMuted}
          className={`w-16 h-16 rounded-full p-0 transition-all duration-200 ${
            isListening ? 'animate-pulse shadow-lg shadow-primary/25' : ''
          }`}
          iconName={getMicrophoneIcon()}
          iconSize={24}
        />

        {/* Microphone Level Indicator */}
        {isListening && !isMuted && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
            <div
              className="w-3 h-3 bg-success-foreground rounded-full transition-all duration-100"
              style={{
                transform: `scale(${0.5 + (microphoneLevel / 100) * 0.5})`
              }}
            />
          </div>
        )}
      </div>
      {/* Status Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {disabled
            ? 'Connecting...'
            : isMuted
            ? 'Microphone Muted'
            : isListening
            ? 'Listening...' :'Tap to Speak'
          }
        </p>
        {isListening && !isMuted && (
          <p className="text-xs text-muted-foreground mt-1">
            Speak clearly into your microphone
          </p>
        )}
      </div>
      {/* Secondary Controls */}
      <div className="flex items-center space-x-4">
        {/* Mute Toggle */}
        <Button
          variant={isMuted ? 'destructive' : 'ghost'}
          onClick={onToggleMute}
          disabled={disabled}
          className="w-10 h-10 rounded-full p-0"
          iconName={isMuted ? 'MicOff' : 'Mic'}
          iconSize={16}
        />

        {/* Volume Control */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="w-10 h-10 rounded-full p-0"
            iconName="Volume2"
            iconSize={16}
          />

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-card border border-border rounded-lg p-3 shadow-elevated">
              <div className="flex flex-col items-center space-y-2">
                <Icon name="Volume2" size={14} color="var(--color-muted-foreground)" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e?.target?.value))}
                  className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume}%, var(--color-muted) ${volume}%, var(--color-muted) 100%)`
                  }}
                />
                <span className="text-xs text-muted-foreground">{volume}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Button
          variant="ghost"
          className="w-10 h-10 rounded-full p-0"
          iconName="Settings"
          iconSize={16}
        />
      </div>
      {/* Microphone Level Visualization */}
      {isListening && !isMuted && (
        <div className="flex items-center space-x-1">
          {[...Array(8)]?.map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                microphoneLevel > (i * 12.5) ? 'bg-success' : 'bg-muted'
              }`}
              style={{
                height: `${8 + (microphoneLevel > (i * 12.5) ? Math.random() * 12 : 0)}px`
              }}
            />
          ))}
        </div>
      )}
      {/* Quick Actions */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-success rounded-full" />
          <span>Connected</span>
        </div>
        <span>•</span>
        <span>High Quality Audio</span>
      </div>
    </div>
  );
};

export default VoiceControls;