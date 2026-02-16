import React from 'react';
import { cn } from '../../../../utils/cn';

const SessionProgress = ({
  currentPhase = 'TECHNICAL_PROTOCOL',
  sessionTime = 0,
  estimatedDuration = 1800,
  questionsAnswered = 0,
  totalQuestions = 8
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((sessionTime / estimatedDuration) * 100, 100);
  const questionProgress = Math.min((questionsAnswered / totalQuestions) * 100, 100);

  return (
    <div className="space-y-6 font-mono">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Active_Phase</p>
          <h3 className="text-sm font-bold text-slate-100 tracking-tighter uppercase">
            {currentPhase}
          </h3>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Temporal_Marker</p>
          <div className="text-sm font-bold text-emerald-500 tracking-widest">
            {formatTime(sessionTime)}
          </div>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="space-y-4">
        {/* Temporal Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] uppercase tracking-tighter">
            <span className="text-slate-500">Temporal_Coverage</span>
            <span className="text-slate-300 font-bold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1 w-full bg-slate-800 border border-slate-800/50 flex p-[1px]">
            <div
              className="bg-emerald-500/80 transition-all duration-1000 ease-out h-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Iteration Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] uppercase tracking-tighter">
            <span className="text-slate-500">Iteration_Count</span>
            <span className="text-slate-300 font-bold">{questionsAnswered} / {totalQuestions}</span>
          </div>
          <div className="h-1 w-full bg-slate-800 border border-slate-800/50 flex p-[1px]">
            <div
              className="bg-sky-500/80 transition-all duration-1000 ease-out h-full shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              style={{ width: `${questionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tactical Stats Grid */}
      <div className="grid grid-cols-3 border border-slate-800 bg-slate-950/50">
        {[
          { label: 'MINS', val: Math.floor(sessionTime / 60) },
          { label: 'SENT', val: questionsAnswered },
          { label: 'REMN', val: Math.max(0, totalQuestions - questionsAnswered) }
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-3 text-center space-y-1",
            i < 2 && "border-r border-slate-800"
          )}>
            <p className="text-[7px] text-slate-600 uppercase font-bold tracking-widest">{stat.label}</p>
            <p className="text-xs font-bold text-slate-300">{stat.val.toString().padStart(2, '0')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionProgress;