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
    <div className="space-y-10 font-body">
      {/* Header Info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-4 h-[1px] bg-primary"></span>
          <p className="text-[9px] text-primary uppercase font-bold tracking-[0.3em]">Session metrics</p>
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-extrabold text-white tracking-tight uppercase">
              {currentPhase.replace(/_/g, ' ')}
            </h3>
            <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">System Synchronized</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-headline font-extrabold text-white tracking-tighter tabular-nums leading-none">
              {formatTime(sessionTime)}
            </div>
            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mt-2 opacity-40">Elapsed Time</p>
          </div>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="space-y-8">
        {/* Temporal Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Temporal Progress</span>
            <span className="text-[11px] text-white font-extrabold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high/30 rounded-full overflow-hidden border border-outline-variant/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,145,90,0.4)]"
            />
          </div>
        </div>

        {/* Iteration Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Question Matrix</span>
            <span className="text-[11px] text-white font-extrabold">{questionsAnswered} <span className="text-on-surface-variant opacity-40">/ {totalQuestions}</span></span>
          </div>
          <div className="h-2 w-full bg-surface-container-high/30 rounded-full overflow-hidden border border-outline-variant/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${questionProgress}%` }}
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
          </div>
        </div>
      </div>

      {/* Tonal Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Elapsed', val: Math.floor(sessionTime / 60), unit: 'm' },
          { label: 'Verified', val: questionsAnswered, unit: 'ans' },
          { label: 'Remaining', val: Math.max(0, totalQuestions - questionsAnswered), unit: 'q' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-high/40 border border-outline-variant/10 rounded-2xl p-4 text-center group hover:bg-surface-container-high transition-all">
            <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-widest mb-1 opacity-60">{stat.label}</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <p className="text-2xl font-headline font-extrabold text-white tabular-nums">{stat.val.toString().padStart(2, '0')}</p>
              <span className="text-[8px] font-bold text-on-surface-variant uppercase opacity-40">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
);
};

export default SessionProgress;