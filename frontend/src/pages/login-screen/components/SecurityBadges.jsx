import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      text: 'SECURE_SSL'
    },
    {
      icon: 'Lock',
      text: 'DATA_ENCRYPTED'
    },
    {
      icon: 'CheckCircle',
      text: 'PLATFORM_VERIFIED'
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-slate-800 mt-8">
      {securityFeatures?.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <Icon 
            name={feature?.icon} 
            size={12} 
            color="var(--color-primary)" 
          />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            {feature?.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;