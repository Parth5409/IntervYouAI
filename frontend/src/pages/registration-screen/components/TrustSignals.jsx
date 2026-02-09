import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    { icon: 'Shield', title: 'ENCRYPTED_DATA' },
    { icon: 'Users', title: '50K_ENTITIES' },
    { icon: 'Award', title: 'AI_OPTIMIZED' },
    { icon: 'Clock', title: '24/7_AVAIL' }
  ];

  return (
    <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 mt-8">
      {trustFeatures.map((feature, index) => (
        <div key={index} className="bg-slate-900/50 p-4 flex flex-col items-center justify-center group hover:bg-slate-900 transition-colors">
          <Icon name={feature.icon} size={14} className="text-emerald-500 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="text-[8px] font-mono text-slate-500 group-hover:text-slate-300 uppercase tracking-[0.2em]">{feature.title}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustSignals;