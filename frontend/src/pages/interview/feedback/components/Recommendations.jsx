import React from 'react';
import Icon from '../../../../components/AppIcon';

const Recommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-800 bg-slate-900/30 p-8 font-mono relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
      
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6 relative z-10">
        <Icon name="Target" size={18} className="text-sky-500" />
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-[0.2em]">
          STRATEGIC_ACTION_PLAN
        </h3>
      </div>

      <div className="space-y-4 relative z-10">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-4 group/item">
            <div className="mt-1.5 w-1.5 h-1.5 bg-sky-500/50 group-hover/item:bg-sky-500 transition-colors shrink-0" />
            <p className="text-[11px] text-slate-400 uppercase leading-relaxed tracking-tight group-hover/item:text-slate-200 transition-colors">
              {rec}
            </p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
    </div>
  );
};

export default Recommendations;
