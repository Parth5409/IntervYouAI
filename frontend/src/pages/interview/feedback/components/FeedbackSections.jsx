import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const FeedbackSections = ({ 
  feedback, 
  expandedSections, 
  onToggleSection
}) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-sky-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const sections = [
    { key: 'technical_score', title: 'TECHNICAL_DOMAIN', icon: 'Code', description: 'Subject matter expertise & logic' },
    { key: 'communication_score', title: 'COMMUNICATION_UPLINK', icon: 'MessageSquare', description: 'Clarity & vocal transmission' },
    { key: 'confidence_score', title: 'CONFIDENCE_VECTOR', icon: 'Zap', description: 'Self-assurance & stability' }
  ].filter(section => feedback?.[section.key] !== null && feedback?.[section.key] !== undefined);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="w-1.5 h-4 bg-emerald-500" />
          DETAILED_DIAGNOSTICS
        </h2>
      </div>

      <div className="space-y-4">
        {sections.map(section => {
          const score = feedback?.[section.key] || 0;
          const strengths = feedback?.strengths || [];
          const improvements = feedback?.improvement_areas || [];
          const isExpanded = expandedSections?.[section.key];

          return (
            <div key={section.key} className="border border-slate-800 bg-slate-900/30 overflow-hidden group hover:border-slate-700 transition-colors">
              {/* Section Header */}
              <button
                onClick={() => onToggleSection(section.key)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-900 transition-colors text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 border border-slate-800 flex items-center justify-center bg-slate-950 group-hover:border-slate-600 transition-colors">
                    <Icon name={section.icon} size={18} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 tracking-widest">{section.title}</h3>
                    <p className="text-[9px] text-slate-500 uppercase mt-0.5">{section.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className={cn("text-xl font-bold tracking-tighter", getScoreColor(score))}>
                      {score}%
                    </span>
                  </div>
                  <Icon 
                    name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    className="text-slate-600" 
                  />
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-6 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Strengths */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-emerald-500" />
                        <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Strengths_Detected</h4>
                      </div>
                      <div className="space-y-3">
                        {strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3 bg-slate-950/50 border border-slate-800 p-3">
                            <span className="text-emerald-500/50 text-[9px] mt-0.5">0{index + 1}</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed uppercase tracking-tight">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500" />
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Optimization_Required</h4>
                      </div>
                      <div className="space-y-3">
                        {improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-3 bg-slate-950/50 border border-slate-800 p-3">
                            <span className="text-amber-500/50 text-[9px] mt-0.5">0{index + 1}</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed uppercase tracking-tight">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Log */}
                  {feedback?.detailed_feedback && (
                    <div className="space-y-4 border-t border-slate-800 pt-8">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-sky-500" />
                        <h4 className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Detailed_Analysis_Stream</h4>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                          <Icon name="Terminal" size={48} className="text-sky-500" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-tight relative z-10">
                          {feedback.detailed_feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeedbackSections;