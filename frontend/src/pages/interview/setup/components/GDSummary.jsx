import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const GDSummary = ({ formData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-l-2 border-amber-500 pl-4">
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-[0.2em]">
          GD_SESSION_DEBRIEF_&_PRE_FLIGHT_CHECK
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Verify collective discourse parameters before multi-agent initialization
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Status */}
        <div className="lg:col-span-2 border border-amber-500/30 bg-slate-900/50 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon name="MessageSquare" size={80} className="text-amber-500" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border border-amber-500/30 flex items-center justify-center bg-slate-950">
                <Icon name="MessageSquare" size={32} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-mono font-bold text-slate-100 tracking-tighter uppercase">
                  COLLECTIVE_DISCOURSE_SIMULATION
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Temporal_Window:</span>
                  <span className="font-mono text-[10px] text-amber-500 font-bold tracking-widest">{formData.duration}_MINUTES</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800/50 space-y-6">
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">DISCUSSION_TOPIC_VECTOR</p>
                <p className="text-sm font-mono font-bold text-slate-300 uppercase tracking-tight leading-relaxed">
                  {formData.topic}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500" />
              SIMULATION_STACK
            </h4>
            <div className="space-y-3">
              {[
                { icon: 'Users', label: 'AGENT_MODELS_LOADED', status: 'ACTIVE', color: 'text-emerald-500' },
                { icon: 'Mic', label: 'VOCAL_UPLINK', status: 'READY', color: 'text-emerald-500' },
                { icon: 'Cpu', label: 'DISCOURSE_ENGINE', status: 'STANDBY', color: 'text-sky-500' }
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
              DISCOURSE_PROTOCOL
            </h4>
            <ul className="space-y-2">
              {[
                'COOPERATIVE_INTERRUPTION_LOGIC',
                'EVIDENTIAL_ARGUMENT_WEIGHTING',
                'FACILITATIVE_ROLE_ADAPTATION',
                'CLARITY_VECTOR_MAINTENANCE'
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

export default GDSummary;