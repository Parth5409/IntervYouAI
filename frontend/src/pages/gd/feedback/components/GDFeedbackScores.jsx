import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const GDFeedbackScores = ({ feedback }) => {
  const scoreMetrics = [
    { key: 'participation_score', label: 'PARTICIPATION_LEVEL', icon: 'Users' },
    { key: 'clarity_score', label: 'CLARITY_VECTOR', icon: 'Zap' },
    { key: 'collaboration_score', label: 'COOPERATIVE_INDEX', icon: 'Activity' },
    { key: 'initiative_score', label: 'INITIATIVE_MARKER', icon: 'Target' },
    { key: 'topic_understanding', label: 'TOPIC_SYNTHESIS', icon: 'BookOpen' },
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="border border-slate-800 bg-slate-900/30 p-8 font-mono">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-8">
        <div className="w-1.5 h-4 bg-amber-500" />
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-[0.2em]">
          PERFORMANCE_METRICS_MATRIX
        </h3>
      </div>

      <div className="space-y-8">
        {scoreMetrics.map(metric => {
          const score = feedback?.[metric.key] || 0;
          return (
            <div key={metric.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name={metric.icon} size={14} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</span>
                </div>
                <span className={cn("text-xs font-bold tracking-tighter", getScoreColor(score))}>{score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 border border-slate-800 flex p-[1px]">
                <div
                  className={cn("h-full transition-all duration-1000 ease-out", getBarColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GDFeedbackScores;
