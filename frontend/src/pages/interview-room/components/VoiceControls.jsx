import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const VoiceControls = ({
  isRecording = false,
  isMuted = false,
  onToggleRecording,
  onToggleMute,
  disabled = false,
  isTranscribing = false,
}) => {

  const getMicrophoneIcon = () => {
    if (isMuted) return 'MicOff';
    if (isRecording) return 'Square'; // Use a square icon to indicate "Stop"
    return 'Mic';
  };

  const getMicrophoneVariant = () => {
    if (disabled) return 'secondary';
    if (isMuted) return 'destructive';
    if (isRecording) return 'destructive'; // Red to indicate recording/stop
    return 'default';
  };

  const getStatusText = () => {
    if (disabled) return "AI is Speaking...";
    if (isMuted) return "Microphone Muted";
    if (isTranscribing) return "Transcribing...";
    if (isRecording) return "Recording... Click to Stop";
    return "Click to Record";
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Microphone Button */}
      <div className="relative">
        <Button
          variant={getMicrophoneVariant()}
          onClick={onToggleRecording}
          disabled={disabled || isMuted}
          className={`w-20 h-20 rounded-full p-0 transition-all duration-200 ${
            isRecording ? 'animate-pulse shadow-lg shadow-destructive/25' : ''
          }`}
          iconName={getMicrophoneIcon()}
          iconSize={28}
        />
      </div>
      {/* Status Text */}
      <div className="text-center h-10">
        <p className="text-lg font-medium text-foreground">
          {getStatusText()}
        </p>
        {(isRecording || isTranscribing) && (
          <div className="flex justify-center items-center mt-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="ml-2 text-sm text-muted-foreground">In Progress</span>
          </div>
        )}
      </div>
      {/* Secondary Controls */}
      <div className="flex items-center space-x-4">
        <Button
          variant={isMuted ? 'destructive' : 'ghost'}
          onClick={onToggleMute}
          disabled={disabled}
          className="w-10 h-10 rounded-full p-0"
          iconName={isMuted ? 'MicOff' : 'Mic'}
          iconSize={16}
        />
        <Button
          variant="ghost"
          className="w-10 h-10 rounded-full p-0"
          iconName="Settings"
          iconSize={16}
        />
      </div>
    </div>
  );
};

export default VoiceControls;