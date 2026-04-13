import React from 'react';
import Icon from '../../../../components/AppIcon';
import GDSummary from './GDSummary';
import { cn } from '../../../../utils/cn';

const SessionSummary = ({ interviewType, formData }) => {
  if (interviewType === 'group-discussion') {
    return <GDSummary formData={formData} />;
  }

  const getInterviewTypeDetails = () => {
    switch (interviewType) {
      case 'technical':
        return {
          title: 'Technical Simulation',
          icon: 'ms:code',
          color: 'text-primary',
          borderColor: 'border-primary/20',
          duration: '45-60 MIN',
          desc: 'Full-stack technical competencies & logic audit.'
        };
      case 'hr':
        return {
          title: 'Behavioral Simulation',
          icon: 'ms:groups',
          color: 'text-sky-500',
          borderColor: 'border-sky-500/20',
          duration: '30-45 MIN',
          desc: 'Cultural alignment & soft-skill vector analysis.'
        };
      case 'salary-negotiation':
        return {
          title: 'Compensation Negotiation',
          icon: 'ms:payments',
          color: 'text-primary',
          borderColor: 'border-primary/20',
          duration: '20-30 MIN',
          desc: 'Tactical financial lever & leverage optimization.'
        };
      default:
        return {
          title: 'Standard Interview',
          icon: 'ms:play_arrow',
          color: 'text-white',
          borderColor: 'border-outline-variant/10',
          duration: '30-45 MIN',
          desc: 'General assessment protocol.'
        };
    }
  };

  const details = getInterviewTypeDetails();

  const formatLabel = (key) => {
    const labelMap = {
      jobRole: 'Target Specialization',
      company: 'Corporate Alignment',
      experienceLevel: 'Experience Tier',
      industry: 'Sector Classification',
      difficulty: 'Complexity Matrix',
      max_questions: 'Instructional Density',
      salaryRange: 'Valuation Window',
      negotiationStyle: 'Tactical Style'
    };
    return labelMap?.[key] || key.toUpperCase();
  };

  const formatValue = (key, value) => {
    if (!value) return 'N/A';
    return value.toString();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(255,145,90,0.5)]" />
          Pre-Flight Check
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Verifying Simulation Parameters for Initialization
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Status */}
        <div className={cn(
          "lg:col-span-2 bg-surface-container-high/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border shadow-2xl relative overflow-hidden group transition-all duration-700 hover:border-primary/30",
          details.borderColor
        )}>
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-8">
              <div className={cn("w-20 h-20 rounded-3xl border flex items-center justify-center bg-surface-container-highest shadow-xl transition-transform duration-700 group-hover:scale-110", details.borderColor)}>
                <Icon name={details.icon} size={36} className={details.color} />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-extrabold text-white tracking-tighter uppercase leading-none">
                  {details.title}
                </h4>
                <p className="text-on-surface-variant text-sm font-body opacity-60 italic">{details.desc}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="font-extrabold text-[9px] text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Est. Runtime:</span>
                  <span className="font-extrabold text-[10px] text-primary tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full">{details.duration}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-x-16 gap-y-10 md:grid-cols-2 pt-12 border-t border-outline-variant/10">
              {Object.entries(formData).map(([key, value]) => {
                if (!value || key === 'type' || key === 'driveId') return null;
                return (
                  <div key={key} className="space-y-2 group/item">
                    <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40 group-hover/item:opacity-70 transition-opacity">
                      {formatLabel(key)}
                    </p>
                    <p className="text-base font-extrabold text-white tracking-tight truncate border-b border-white/5 pb-2 group-hover/item:border-primary/30 transition-all">
                      {formatValue(key, value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="space-y-10 flex flex-col">
          <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 p-10 rounded-[3rem] space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-[80px]" />
            <h4 className="text-[11px] font-extrabold text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Environment Status
            </h4>
            <div className="space-y-6">
              {[
                { icon: 'ms:mic', label: 'Audio Stream', status: 'VERIFIED', color: 'text-primary' },
                { icon: 'ms:wifi', label: 'Neural Link', status: '84ms LATENCY', color: 'text-primary' },
                { icon: 'ms:memory', label: 'AI Core Uplink', status: 'SYNCHRONIZED', color: 'text-primary' }
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between border-b border-outline-variant/5 pb-4 last:border-0 last:pb-0 group/req">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant/40 group-hover/req:text-sky-500 transition-colors">
                       <Icon name={req.icon} size={18} />
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest opacity-60 group-hover/req:opacity-100 transition-opacity">{req.label}</span>
                  </div>
                  <span className={cn("text-[10px] font-extrabold tracking-widest", req.color)}>{req.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-10 rounded-[3rem] space-y-8 shadow-2xl flex-1 backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
            <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-[0.4em] flex items-center gap-3">
              <Icon name="ms:security" size={20} className="group-hover:rotate-12 transition-transform duration-700" />
              Safety Protocols
            </h4>
            <ul className="space-y-6">
              {[
                'Silent Perimeter Established',
                'Vocal Clarity Auto-Verified',
                'Background Node Termination',
                'Stable Uplink Maintenance'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 group/li">
                  <span className="text-primary font-extrabold text-xs mt-0.5 group-hover/li:translate-x-1 transition-transform">»</span>
                  <span className="text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-widest leading-relaxed group-hover/li:text-white transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;