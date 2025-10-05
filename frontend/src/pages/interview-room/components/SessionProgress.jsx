import React from 'react';
import Icon from '../../../components/AppIcon';

const SessionProgress = ({
  currentPhase = 'Technical',
  totalPhases = 4,
  currentPhaseIndex = 1,
  sessionTime = 0,
  estimatedDuration = 1800, // 30 minutes in seconds
  questionsAnswered = 0,
  totalQuestions = 8
}) => {
  const phases = [];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((sessionTime / estimatedDuration) * 100, 100);
  const questionProgress = Math.min((questionsAnswered / totalQuestions) * 100, 100);

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Current Phase */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {currentPhase}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-semibold text-foreground">
            {formatTime(sessionTime)}
          </div>
        </div>
      </div>
      {/* Phase Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Session Progress</span>
          <span className="text-foreground font-medium">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Questions Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Questions</span>
          <span className="text-foreground font-medium">
            {questionsAnswered} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
      </div>
      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {Math.floor(sessionTime / 60)}
          </div>
          <div className="text-xs text-muted-foreground">
            Minutes
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {questionsAnswered}
          </div>
          <div className="text-xs text-muted-foreground">
            Answered
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {totalQuestions - questionsAnswered}
          </div>
          <div className="text-xs text-muted-foreground">
            Remaining
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionProgress;