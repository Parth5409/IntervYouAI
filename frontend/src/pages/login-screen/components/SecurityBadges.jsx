import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'ms:verified_user',
      text: 'Secure SSL'
    },
    {
      icon: 'ms:admin_panel_settings',
      text: 'Encrypted'
    },
    {
      icon: 'ms:task_alt',
      text: 'Verified'
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 py-8 border-t border-outline-variant/10 mt-10">
      {securityFeatures?.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 group cursor-default transition-all">
          <Icon 
            name={feature?.icon} 
            size={16} 
            className="text-on-surface-variant/20 group-hover:text-primary transition-colors"
          />
          <span className="text-[10px] font-extrabold text-on-surface-variant/40 uppercase tracking-[0.2em] group-hover:text-on-surface transition-colors">
            {feature?.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;