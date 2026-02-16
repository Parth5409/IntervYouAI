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
          title: 'TECHNICAL_SIMULATION',
          icon: 'Code',
          color: 'text-emerald-500',
          borderColor: 'border-emerald-500/30',
          duration: '45-60_MIN'
        };
      case 'hr':
        return {
          title: 'BEHAVIORAL_SIMULATION',
          icon: 'Users',
          color: 'text-sky-500',
          borderColor: 'border-sky-500/30',
          duration: '30-45_MIN'
        };
      case 'salary-negotiation':
        return {
          title: 'COMPENSATION_NEGOTIATION',
          icon: 'DollarSign',
          color: 'text-emerald-500',
          borderColor: 'border-emerald-500/30',
          duration: '20-30_MIN'
        };
      default:
        return {
          title: 'STANDARD_INTERVIEW',
          icon: 'Play',
          color: 'text-slate-400',
          borderColor: 'border-slate-800',
          duration: '30-45_MIN'
        };
    }
  };

  const details = getInterviewTypeDetails();

  const formatLabel = (key) => {
    const labelMap = {
      jobRole: 'TARGET_ROLE',
      company: 'TARGET_ENTITY',
      experienceLevel: 'EXPERIENCE_TIER',
      industry: 'SECTOR_CLASS',
      difficulty: 'COMPLEXITY_INDEX',
      max_questions: 'SEQUENCE_LENGTH',
      salaryRange: 'SALARY_VECTOR',
      negotiationStyle: 'TACTICAL_STYLE'
    };
    return labelMap?.[key] || key.toUpperCase();
  };

  const formatValue = (key, value) => {
    if (!value) return 'N/A';
    return value.toString().toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-l-2 border-slate-700 pl-4">
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-[0.2em]">
          SESSION_DEBRIEF_&_PRE_FLIGHT_CHECK
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Verify configuration parameters before mission initialization
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Status */}
        <div className={cn(
          "lg:col-span-2 border bg-slate-900/50 p-8 relative overflow-hidden",
          details.borderColor
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon name={details.icon} size={80} className={details.color} />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className={cn("w-16 h-16 border flex items-center justify-center bg-slate-950", details.borderColor)}>
                <Icon name={details.icon} size={32} className={details.color} />
              </div>
              <div>
                <h4 className="text-xl font-mono font-bold text-slate-100 tracking-tighter uppercase">
                  {details.title}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Est_Duration:</span>
                  <span className="font-mono text-[10px] text-emerald-500 font-bold tracking-widest">{details.duration}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2 pt-8 border-t border-slate-800/50">
              {Object.entries(formData).map(([key, value]) => {
                if (!value || key === 'type' || key === 'driveId') return null;
                return (
                  <div key={key} className="space-y-1">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{formatLabel(key)}</p>
                    <p className="text-xs font-mono font-bold text-slate-300 uppercase tracking-tight truncate">
                      {formatValue(key, value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-sky-500" />
              SYSTEM_REQUIREMENTS
            </h4>
            <div className="space-y-3">
              {[
                { icon: 'Mic', label: 'AUDIO_INPUT_ACTIVE', status: 'VERIFIED', color: 'text-emerald-500' },
                { icon: 'Wifi', label: 'NETWORK_LATENCY', status: '84MS', color: 'text-emerald-500' },
                { icon: 'Brain', label: 'AI_CORE_LINK', status: 'READY', color: 'text-emerald-500' }
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Icon name={req.icon} size={14} className="text-slate-500" />
                    <span className="text-[9px] font-mono text-slate-400">{req.label}</span>
                  </div>
                  <span className={cn("text-[9px] font-mono font-bold", req.color)}>{req.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-6 space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Icon name="AlertTriangle" size={14} />
              PRE_FLIGHT_PROTOCOL
            </h4>
            <ul className="space-y-2">
              {[
                'ESTABLISH_SILENT_PERIMETER',
                'VERIFY_VOCAL_CLARITY',
                'TERMINATE_BACKGROUND_NODES',
                'MAINTAIN_STABLE_UPLINK'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-amber-500/50 mt-1 shrink-0">::</span>
                  <span className="text-[9px] font-mono text-amber-200/70 uppercase leading-tight">{item}</span>
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