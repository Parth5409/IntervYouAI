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
    if (score >= 90) return 'text-primary shadow-primary/20';
    if (score >= 80) return 'text-secondary shadow-secondary/20';
    if (score >= 70) return 'text-tertiary shadow-tertiary/20';
    return 'text-error shadow-error/20';
  };

  const performanceMetrics = [
    { key: 'technical', label: 'Technical Accuracy', score: feedback?.technical_score, icon: 'ms:code' },
    { key: 'communication', label: 'Communication Skills', score: feedback?.communication_score, icon: 'ms:record_voice_over' },
    { key: 'confidence', label: 'Confidence Level', score: feedback?.confidence_score, icon: 'ms:psychology' },
  ].filter(metric => metric.score !== null && metric.score !== undefined);

  return (
    <div className="bg-white/[0.01] backdrop-blur-3xl border border-white/5 p-16 rounded-[4rem] relative overflow-hidden group shadow-2xl">
      <div className="noise opacity-5" />
      <div className="absolute -top-48 -right-48 w-full max-w-lg h-96 bg-primary/5 rounded-full blur-[160px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
      <div className="absolute -bottom-48 -left-48 w-full max-w-lg h-96 bg-secondary/5 rounded-full blur-[160px] pointer-events-none group-hover:bg-secondary/10 transition-all duration-1000" />
      
      <div className="flex flex-col lg:flex-row gap-24 relative z-10 items-center">
        {/* Main Score Orbital */}
        <div className="relative shrink-0 flex flex-col items-center group/score">
          <div className="w-64 h-64 relative flex items-center justify-center">
            {/* Background Rings */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-8 border border-white/5 rounded-full" />
            
            {/* Animated Orbitals */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
               className="absolute inset-[-12px] border-t-2 border-primary/40 rounded-full"
            />
            <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-[-24px] border-b-2 border-secondary/20 rounded-full"
            />

            {/* Main Score Value */}
            <div className="bg-background/80 w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl border border-white/10 backdrop-blur-xl">
              <span className={cn("text-7xl font-black tracking-tighter leading-none mb-1 italic", getScoreColor(overallScore).split(' ')[0])}>
                {overallScore}
              </span>
              <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">OVERALL SCORE</span>
            </div>
            
            {/* Glowing Dot on Progress */}
            <motion.div 
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)] z-20"
              style={{ rotate: `${(overallScore / 100) * 360}deg`, transformOrigin: '0 128px' }}
            />
          </div>

          <div className="mt-12 flex gap-3">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "w-12 h-2 rounded-full",
                  i < Math.round(overallScore/20) ? "bg-gradient-to-r from-primary to-secondary shadow-lg" : "bg-white/5"
                )} 
              />
            ))}
          </div>
        </div>

        {/* Identity & Context Panel */}
        <div className="flex-1 space-y-12 text-center lg:text-left">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <span className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">
                {sessionType} INTERVIEW
              </span>
              <div className="h-[1px] w-16 bg-white/5 hidden md:block" />
              <div className="flex items-center gap-4 text-on-surface-variant/40">
                 <Icon name="ms:event" size={18} />
                 <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">{new Date(sessionDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                {companyName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">SESSION</span>
              </h2>
              <p className="text-2xl font-body text-on-surface-variant/60 italic tracking-tight">
                Performance analysis for <span className="text-white font-black not-italic uppercase tracking-normal">{jobRole}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="flex items-center gap-6 justify-center lg:justify-start group/meta transition-all hover:translate-x-2">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/meta:text-primary group-hover/meta:bg-primary/5 transition-all duration-500 border border-white/5 shadow-inner">
                <Icon name="ms:shield_with_heart" size={28} />
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Status</p>
                <p className="text-sm font-black text-white tracking-widest uppercase italic">COMPLETED</p>
              </div>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start group/meta transition-all hover:translate-x-2">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover/meta:text-secondary group-hover/meta:bg-secondary/5 transition-all duration-500 border border-white/5 shadow-inner">
                <Icon name="ms:bolt" size={28} />
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Analysis</p>
                <p className="text-sm font-black text-white tracking-widest uppercase italic">VERIFIED</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-white/5">
        {performanceMetrics.map((metric, idx) => (
          <motion.div 
            key={metric.key} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + (idx * 0.1) }}
            className="space-y-6 group/metric"
          >
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-4">
                <Icon name={metric.icon} size={20} className="text-white/20 group-hover/metric:text-primary transition-colors" />
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] group-hover/metric:text-on-surface-variant transition-colors">{metric.label}</span>
              </div>
              <span className={cn("text-lg font-black tracking-widest italic", getScoreColor(metric.score).split(' ')[0])}>{metric.score}%</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                className={cn("h-full rounded-full shadow-2xl relative", getScoreColor(metric.score).replace('text', 'bg').split(' ')[0])}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SessionHeader;
