import React from 'react';
import { motion } from 'framer-motion';
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
    <div className="space-y-4 font-body">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-[1px] bg-primary"></span>
          <p className="text-[7px] text-primary uppercase font-bold tracking-[0.2em]">Status</p>
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-headline font-extrabold text-on-surface leading-tight">
              {currentPhase.replace(/_/g, ' ').replace('PROTOCOL', 'Interview')}
            </h3>
            <p className="text-[8px] text-on-surface-variant font-medium uppercase tracking-widest opacity-40">Connected</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-headline font-extrabold text-on-surface tabular-nums leading-none">
              {formatTime(sessionTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="space-y-4">
        {/* Time Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Time</span>
            <span className="text-[9px] text-on-surface font-extrabold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
            />
          </div>
        </div>

        {/* Iteration Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Questions</span>
            <span className="text-[9px] text-on-surface font-extrabold">{questionsAnswered} <span className="text-on-surface-variant opacity-30">/ {totalQuestions}</span></span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${questionProgress}%` }}
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
            />
          </div>
        </div>
      </div>

      {/* Tonal Stats Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'ELAPSED', val: Math.floor(sessionTime / 60), unit: 'm' },
          { label: 'COMPLETED', val: questionsAnswered, unit: 'ans' },
          { label: 'REMAINING', val: Math.max(0, totalQuestions - questionsAnswered), unit: 'q' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
            <p className="text-[6px] text-on-surface-variant uppercase font-bold tracking-widest mb-0.5 opacity-40">{stat.label}</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <p className="text-lg font-headline font-extrabold text-on-surface tabular-nums">{stat.val.toString().padStart(2, '0')}</p>
              <span className="text-[6px] font-bold text-on-surface-variant uppercase opacity-20">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
);
};

export default SessionProgress;