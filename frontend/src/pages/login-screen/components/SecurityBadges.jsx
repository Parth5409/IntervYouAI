import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      text: 'SSL Secured'
    },
    {
      icon: 'Lock',
      text: 'Data Protected'
    },
    {
      icon: 'CheckCircle',
      text: 'Verified Platform'
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-6 py-4">
      {securityFeatures?.map((feature, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Icon 
            name={feature?.icon} 
            size={16} 
            color="var(--color-success)" 
          />
          <span className="text-xs text-muted-foreground font-medium">
            {feature?.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SecurityBadges;