import React from 'react';
import Icon from '../../../../components/AppIcon';
import { cn } from '../../../../utils/cn';

const GDSummary = ({ formData }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          Collective Debrief
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Verifying Discourse Parameters for Initialization
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Main Status */}
        <div className="lg:col-span-2 bg-surface-container-high/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-amber-500/20 shadow-2xl relative overflow-hidden group transition-all duration-700 hover:border-amber-500/30">
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-3xl border border-amber-500/20 flex items-center justify-center bg-surface-container-highest shadow-xl transition-transform duration-700 group-hover:scale-110">
                <Icon name="ms:forum" size={36} className="text-amber-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-extrabold text-white tracking-tighter uppercase leading-none">
                  Collective Discourse
                </h4>
                <p className="text-on-surface-variant text-sm font-body opacity-60 italic">Multi-agent argumentative simulation.</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="font-extrabold text-[9px] text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Temporal Window:</span>
                  <span className="font-extrabold text-[10px] text-amber-500 tracking-[0.2em] bg-amber-500/10 px-3 py-1 rounded-full">{formData.duration} MINUTES</span>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-outline-variant/10 space-y-4 group/item">
              <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40 group-hover/item:opacity-70 transition-opacity">Discussion Topic Vector</p>
              <p className="text-xl font-extrabold text-white tracking-tight leading-relaxed border-b border-white/5 pb-6 group-hover/item:border-amber-500/30 transition-all">
                {formData.topic}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="space-y-10 flex flex-col">
          <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 p-10 rounded-[3rem] space-y-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[80px]" />
            <h4 className="text-[11px] font-extrabold text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Simulation Stack
            </h4>
            <div className="space-y-6">
              {[
                { icon: 'ms:groups', label: 'Agent Models', status: 'LOADED', color: 'text-primary' },
                { icon: 'ms:mic', label: 'Vocal Uplink', status: 'ACTIVE', color: 'text-primary' },
                { icon: 'ms:memory', label: 'Discourse Engine', status: 'STANDBY', color: 'text-sky-500' }
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between border-b border-outline-variant/5 pb-4 last:border-0 last:pb-0 group/req">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant/40 group-hover/req:text-amber-500 transition-colors">
                       <Icon name={req.icon} size={18} />
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest opacity-60 group-hover/req:opacity-100 transition-opacity">{req.label}</span>
                  </div>
                  <span className={cn("text-[10px] font-extrabold tracking-widest", req.color)}>{req.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-10 rounded-[3rem] space-y-8 shadow-2xl flex-1 backdrop-blur-3xl relative overflow-hidden group">
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px]" />
            <h4 className="text-[11px] font-extrabold text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <Icon name="ms:assignment" size={20} className="group-hover:rotate-12 transition-transform duration-700" />
              Discourse Protocol
            </h4>
            <ul className="space-y-6">
              {[
                'Cooperative Interruption Logic',
                'Evidential Argument Weighting',
                'Facilitative Role Adaptation',
                'Clarity Vector Maintenance'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 group/li">
                  <span className="text-amber-500 font-extrabold text-xs mt-0.5 group-hover/li:translate-x-1 transition-transform">»</span>
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

export default GDSummary;