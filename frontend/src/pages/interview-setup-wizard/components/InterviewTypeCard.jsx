import React from 'react';
import Icon from '../../../components/AppIcon';

const InterviewTypeCard = ({ 
  type, 
  title, 
  description, 
  icon, 
  isSelected, 
  onClick,
  features = []
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-elevated ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-soft'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Icon name="Check" size={14} color="var(--color-primary-foreground)" />
        </div>
      )}
      {/* Icon */}
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon name={icon} size={24} />
      </div>
      {/* Content */}
      <h3 className={`text-lg font-semibold mb-2 ${
        isSelected ? 'text-primary' : 'text-foreground'
      }`}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {description}
      </p>
      {/* Features */}
      {features?.length > 0 && (
        <div className="space-y-2">
          {features?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon name="Check" size={14} color="var(--color-success)" />
              <span className="text-xs text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewTypeCard;