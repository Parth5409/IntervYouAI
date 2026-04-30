import React from 'react';
import Icon from '../../../../components/AppIcon';

const Recommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container-high/20 backdrop-blur-3xl border border-outline-variant/10 p-10 rounded-[3rem] relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
      
      <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-6 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-outline-variant/10 flex items-center justify-center text-primary">
          <Icon name="ms:target" size={20} />
        </div>
        <h3 className="text-[11px] font-extrabold text-on-surface uppercase tracking-[0.4em]">
          Strategic Neural Roadmap
        </h3>
      </div>

      <div className="space-y-6 relative z-10">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-5 group/item transition-all hover:translate-x-1">
            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary/20 group-hover/item:bg-primary group-hover/item:shadow-sm transition-all shrink-0" />
            <p className="text-sm font-body text-on-surface-variant leading-relaxed tracking-tight group-hover/item:text-on-surface transition-colors uppercase italic font-medium opacity-70 group-hover/item:opacity-100">
              {rec}
            </p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Recommendations;
