import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const FeedbackSections = ({ 
  feedback, 
  expandedSections, 
  onToggleSection
}) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-primary';
    if (score >= 80) return 'text-sky-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-error';
  };

  const sections = [
    { key: 'technical_score', title: 'Technical Integrity', icon: 'ms:code', description: 'Subject matter domain expertise' },
    { key: 'communication_score', title: 'Communication Reach', icon: 'ms:record_voice_over', description: 'Clarity & vocal transmission' },
    { key: 'confidence_score', title: 'Confidence Vector', icon: 'ms:psychology', description: 'Self-assurance & stability' }
  ].filter(section => feedback?.[section.key] !== null && feedback?.[section.key] !== undefined);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
        <h2 className="text-[11px] font-extrabold text-on-surface uppercase tracking-[0.4em] flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Diagnostic Core
        </h2>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const score = feedback?.[section.key] || 0;
          const strengths = feedback?.strengths || [];
          const improvements = feedback?.improvement_areas || [];
          const isExpanded = expandedSections?.[section.key];

          return (
            <div key={section.key} className="bg-surface-container-high/20 backdrop-blur-3xl border border-outline-variant/10 rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all duration-500">
              {/* Section Header */}
              <button
                onClick={() => onToggleSection(section.key)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-surface-container-highest/30 transition-all text-left group/btn"
              >
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-500">
                    <Icon name={section.icon} size={24} className="text-on-surface-variant/40 group-hover/btn:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-on-surface tracking-widest uppercase">{section.title}</h3>
                    <p className="text-[10px] text-on-surface-variant/40 font-extrabold uppercase mt-1 tracking-widest leading-none">{section.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <span className={cn("text-2xl font-extrabold tracking-tighter", getScoreColor(score))}>
                      {score}%
                    </span>
                  </div>
                  <div className={cn("w-10 h-10 rounded-full border border-outline-variant/10 flex items-center justify-center transition-transform duration-500", isExpanded ? "rotate-180" : "rotate-0")}>
                     <Icon 
                        name="ms:keyboard_arrow_down" 
                        size={20} 
                        className="text-on-surface-variant/60" 
                      />
                  </div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-10 pb-10 pt-4 space-y-12">
                      <div className="grid md:grid-cols-2 gap-10">
                        {/* Strengths */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <h4 className="text-[10px] font-extrabold text-primary uppercase tracking-[0.3em]">Strengths Profile</h4>
                          </div>
                          <div className="space-y-3">
                            {strengths.map((strength, index) => (
                              <div key={index} className="flex items-start gap-4 bg-surface-container-highest/20 border border-outline-variant/5 p-5 rounded-[1.5rem] group/item hover:bg-surface-container-highest/40 transition-colors">
                                <span className="text-primary font-extrabold text-[10px] mt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">{String(index + 1).padStart(2, '0')}</span>
                                <p className="text-xs font-body text-on-surface-variant leading-relaxed tracking-tight group-hover:text-on-surface transition-colors">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Improvements */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-sky-500" />
                            <h4 className="text-[10px] font-extrabold text-sky-500 uppercase tracking-[0.3em]">Optimization Nodes</h4>
                          </div>
                          <div className="space-y-3">
                            {improvements.map((improvement, index) => (
                              <div key={index} className="flex items-start gap-4 bg-surface-container-highest/20 border border-outline-variant/5 p-5 rounded-[1.5rem] group/item hover:bg-surface-container-highest/40 transition-colors">
                                <span className="text-sky-500 font-extrabold text-[10px] mt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">{String(index + 1).padStart(2, '0')}</span>
                                <p className="text-xs font-body text-on-surface-variant leading-relaxed tracking-tight group-hover:text-on-surface transition-colors">{improvement}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Log */}
                      {feedback?.detailed_feedback && (
                        <div className="space-y-6 border-t border-outline-variant/10 pt-10">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h4 className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em]">Neural Narrative Audit</h4>
                          </div>
                          <div className="glass-card p-10 rounded-[2rem] border border-outline-variant/10 relative overflow-hidden group/audit">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/audit:opacity-20 transition-opacity duration-1000">
                              <Icon name="ms:terminal" size={64} className="text-primary" />
                            </div>
                            <p className="text-sm font-body text-on-surface-variant leading-relaxed tracking-tight relative z-10 first-letter:text-2xl first-letter:font-extrabold first-letter:text-on-surface first-letter:mr-1">
                              {feedback.detailed_feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedbackSections;