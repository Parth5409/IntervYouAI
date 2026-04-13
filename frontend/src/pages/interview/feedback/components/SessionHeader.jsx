import React from 'react';
import { motion } from 'framer-motion';
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
    if (score >= 90) return 'text-primary';
    if (score >= 80) return 'text-sky-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-error';
  };

  const performanceMetrics = [
    { key: 'technical', label: 'Technical Accuracy', score: feedback?.technical_score, icon: 'ms:code' },
    { key: 'communication', label: 'Communication Reach', score: feedback?.communication_score, icon: 'ms:record_voice_over' },
    { key: 'confidence', label: 'Confidence Vector', score: feedback?.confidence_score, icon: 'ms:psychology' },
  ].filter(metric => metric.score !== null && metric.score !== undefined);

  return (
    <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 p-12 rounded-[3.5rem] relative overflow-hidden group shadow-2xl">
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
      
      <div className="flex flex-col lg:flex-row gap-16 relative z-10 items-center">
        {/* Main Score Orbital */}
        <div className="relative shrink-0 flex flex-col items-center group/score">
          <div className="w-48 h-48 relative flex items-center justify-center">
            {/* Background Rings */}
            <div className="absolute inset-0 border-4 border-outline-variant/10 rounded-full" />
            <div className="absolute inset-4 border border-outline-variant/5 rounded-full" />
            
            {/* Animated Orbitals */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-[-8px] border-t-2 border-primary/20 rounded-full"
            />
            <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute inset-[-16px] border-b-2 border-sky-500/10 rounded-full"
            />

            {/* Main Score Value */}
            <div className="bg-surface-container-highest w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-outline-variant/10">
              <span className={cn("text-5xl font-extrabold tracking-tighter leading-none mb-1", getScoreColor(overallScore))}>
                {overallScore}
              </span>
              <span className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Score Index</span>
            </div>
            
            {/* Glowing Dot on Progress */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(255,145,90,1)] z-20"
              style={{ transform: `rotate(${(overallScore / 100) * 360}deg) translateY(-88px)` }}
            />
          </div>

          <div className="mt-8 flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "w-10 h-1.5 rounded-full",
                  i < Math.round(overallScore/20) ? "bg-primary shadow-[0_0_8px_rgba(255,145,90,0.5)]" : "bg-outline-variant/20"
                )} 
              />
            ))}
          </div>
        </div>

        {/* Identity & Context Panel */}
        <div className="flex-1 space-y-10 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-[0.3em] uppercase">
                {sessionType} PROTOCOL
              </span>
              <div className="h-0.5 w-12 bg-outline-variant/20 hidden md:block" />
              <div className="flex items-center gap-3 text-on-surface-variant opacity-40">
                 <Icon name="ms:event" size={16} />
                 <span className="text-[10px] font-extrabold tracking-widest uppercase">{new Date(sessionDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold text-white tracking-tighter uppercase leading-none">
                {companyName} SIMULATION
              </h2>
              <p className="text-xl font-body text-on-surface-variant/70 italic tracking-tight">
                Evaluating path for <span className="text-white font-extrabold not-italic uppercase tracking-normal">{jobRole}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-center gap-5 justify-center lg:justify-start group/meta transition-all hover:translate-x-1">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant/40 group-hover/meta:text-primary transition-colors">
                <Icon name="ms:shield_with_heart" size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">Security Clearance</p>
                <p className="text-sm font-extrabold text-white tracking-widest uppercase">LEVEL_ALPHA_4</p>
              </div>
            </div>

            <div className="flex items-center gap-5 justify-center lg:justify-start group/meta transition-all hover:translate-x-1">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant/40 group-hover/meta:text-sky-500 transition-colors">
                <Icon name="ms:bolt" size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">Neural Processing</p>
                <p className="text-sm font-extrabold text-white tracking-widest uppercase">REAL_TIME_AUDIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-outline-variant/10">
        {performanceMetrics.map((metric, idx) => (
          <motion.div 
            key={metric.key} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (idx * 0.1) }}
            className="space-y-4 group/metric"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon name={metric.icon} size={18} className="text-on-surface-variant/40 group-hover/metric:text-primary transition-colors" />
                <span className="text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-[0.3em] group-hover/metric:text-on-surface-variant transition-colors">{metric.label}</span>
              </div>
              <span className={cn("text-sm font-extrabold tracking-widest", getScoreColor(metric.score))}>{metric.score}%</span>
            </div>
            <div className="h-2 w-full bg-outline-variant/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                className={cn("h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.2)]", getScoreColor(metric.score).replace('text', 'bg'))}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SessionHeader;
