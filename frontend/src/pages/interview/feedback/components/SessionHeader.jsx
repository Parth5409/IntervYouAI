import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const SessionHeader = ({ sessionData }) => {
  const feedback = sessionData?.feedback;
  const overallScore = sessionData?.overall_score || feedback?.overall_score || 0;
  const sessionType = sessionData?.session_type || 'Interview';
  const companyName = sessionData?.context?.company_name || 'GENERAL';
  const jobRole = sessionData?.context?.job_role || 'UNDEFINED_ROLE';
  const sessionDate = sessionData?.created_at || new Date().toISOString();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-sky-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBorderColor = (score) => {
    if (score >= 90) return 'border-emerald-500/30';
    if (score >= 80) return 'border-sky-500/30';
    if (score >= 70) return 'border-amber-500/30';
    return 'border-red-500/30';
  };

  const performanceMetrics = [
    { key: 'technical', label: 'TECHNICAL', score: feedback?.technical_score },
    { key: 'communication', label: 'COMMUNICATION', score: feedback?.communication_score },
    { key: 'confidence', label: 'CONFIDENCE', score: feedback?.confidence_score },
    { key: 'overall', label: 'OVERALL_INDEX', score: overallScore },
  ].filter(metric => metric.score !== null && metric.score !== undefined);

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 relative overflow-hidden group font-mono">
      {/* Decorative Blueprint Lines */}
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-emerald-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent" />

      <div className="flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Main Score Vector */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className={cn(
            "w-32 h-32 border-2 flex flex-col items-center justify-center bg-slate-950 relative",
            getScoreBorderColor(overallScore)
          )}>
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-current opacity-50" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-current opacity-50" />
            
            <span className={cn("text-4xl font-bold tracking-tighter", getScoreColor(overallScore))}>
              {overallScore}%
            </span>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">READINESS_LVL</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-3 h-1", 
                  i < Math.round(overallScore/20) ? "bg-emerald-500" : "bg-slate-800"
                )} 
              />
            ))}
          </div>
        </div>

        {/* Identity Matrix */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 text-[9px] font-bold tracking-widest">
                {sessionType.toUpperCase()}
              </div>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tighter uppercase">
              {companyName}_SIMULATION_RESULT
            </h2>
            <p className="text-slate-400 text-sm tracking-tight">
              VECTOR_PATH: {jobRole.toUpperCase()} // AUTH_NODE_01
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <Icon name="Calendar" size={14} className="text-slate-600" />
              <span>TIMESTAMP: {new Date(sessionDate).toISOString().split('T')[0]}</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Cpu" size={14} className="text-slate-600" />
              <span>PROCESSOR: AI_ANALYST_CORE_V2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-800">
        {performanceMetrics.map((metric) => (
          <div key={metric.key} className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">{metric.label}</span>
              <span className={cn("text-xs font-bold", getScoreColor(metric.score))}>{metric.score}%</span>
            </div>
            <div className="h-1 w-full bg-slate-800 flex">
              <div
                className={cn("h-full transition-all duration-1000", getScoreColor(metric.score).replace('text', 'bg'))}
                style={{ width: `${metric.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHeader;
