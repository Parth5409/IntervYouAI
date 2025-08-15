import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';

const TranscriptPlayer = ({ transcript, sessionDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAICommentary, setShowAICommentary] = useState(true);
  const scrollContainerRef = useRef(null);

  // Convert timestamp string to seconds
  const timeToSeconds = (timeString) => {
    const parts = timeString?.split(':');
    return parseInt(parts?.[0]) * 60 + parseInt(parts?.[1]);
  };

  // Convert seconds to timestamp string
  const secondsToTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  // Mock playback simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const maxTime = timeToSeconds(transcript?.[transcript?.length - 1]?.timestamp || '00:00');
          if (prev >= maxTime) {
            setIsPlaying(false);
            return prev;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, transcript]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeekToTimestamp = (timestamp) => {
    setCurrentTime(timeToSeconds(timestamp));
    setSelectedEntry(transcript?.find(entry => entry?.timestamp === timestamp));
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds?.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds?.length;
    setPlaybackSpeed(speeds?.[nextIndex]);
  };

  const getCurrentEntry = () => {
    return transcript?.find(entry => {
      const entryTime = timeToSeconds(entry?.timestamp);
      return entryTime <= currentTime && 
        (!transcript?.find(next => timeToSeconds(next?.timestamp) > entryTime && timeToSeconds(next?.timestamp) <= currentTime));
    }) || transcript?.[0];
  };

  const currentEntry = getCurrentEntry();

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Interview Transcript</h3>
        <Button
          variant="ghost"
          size="sm"
          iconName={showAICommentary ? "EyeOff" : "Eye"}
          onClick={() => setShowAICommentary(!showAICommentary)}
          className="text-muted-foreground"
        >
          AI Insights
        </Button>
      </div>
      {/* Playback Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{secondsToTime(currentTime)}</span>
            <span>{sessionDuration}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentTime / timeToSeconds(transcript?.[transcript?.length - 1]?.timestamp || '45:00')) * 100}%`
                }}
              />
            </div>
            <div
              className="absolute top-0 w-3 h-3 bg-primary rounded-full transform -translate-y-0.5 -translate-x-1.5 cursor-pointer"
              style={{
                left: `${(currentTime / timeToSeconds(transcript?.[transcript?.length - 1]?.timestamp || '45:00')) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            iconName="SkipBack"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
          />
          <Button
            variant="default"
            size="sm"
            iconName={isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPause}
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="SkipForward"
            onClick={() => setCurrentTime(currentTime + 10)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeedChange}
            className="text-xs min-w-12"
          >
            {playbackSpeed}x
          </Button>
        </div>
      </div>
      {/* Current Entry Display */}
      {currentEntry && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {currentEntry?.timestamp}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentEntry?.speaker === 'interviewer' ?'bg-primary/10 text-primary' :'bg-accent/10 text-accent'
            }`}>
              {currentEntry?.speaker === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
            </span>
          </div>
          <p className="text-sm text-foreground mb-3">{currentEntry?.text}</p>
          
          {showAICommentary && currentEntry?.aiCommentary && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-accent">💡 AI Insight:</span>
                <p className="text-xs text-muted-foreground">{currentEntry?.aiCommentary}</p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Transcript Timeline */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Timeline</h4>
        <div 
          ref={scrollContainerRef}
          className="max-h-96 overflow-y-auto space-y-2 scrollbar-hide"
        >
          {transcript?.map((entry, index) => {
            const isActive = currentEntry?.id === entry?.id;
            const hasPassed = timeToSeconds(entry?.timestamp) <= currentTime;
            
            return (
              <div
                key={entry?.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5' 
                    : hasPassed
                      ? 'border-border bg-muted/30' :'border-border/50 bg-transparent opacity-60'
                }`}
                onClick={() => handleSeekToTimestamp(entry?.timestamp)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <button className="text-xs font-medium text-primary hover:text-primary/80">
                    {entry?.timestamp}
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    entry?.speaker === 'interviewer' ?'bg-primary/10 text-primary' :'bg-accent/10 text-accent'
                  }`}>
                    {entry?.speaker === 'interviewer' ? '🤖' : '👤'}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">{entry?.text}</p>
                {showAICommentary && entry?.aiCommentary && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-accent">💡 {entry?.aiCommentary}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Transcript Actions */}
      <div className="pt-4 border-t border-border flex gap-2">
        <Button variant="outline" size="sm" iconName="Download" fullWidth>
          Export Transcript
        </Button>
      </div>
    </div>
  );
};

export default TranscriptPlayer;