import React from 'react';
import Icon from '../../../components/AppIcon';

const GDSummary = ({ formData }) => {
  const formatValue = (key, value) => {
    const valueMap = {
      'small': 'Small Group (4-6 participants)',
      'medium': 'Medium Group (7-10 participants)',
      'large': 'Large Group (11-15 participants)',
    };
    return valueMap[value] || value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Session Summary
        </h3>
        <p className="text-muted-foreground text-sm">
          Review your group discussion configuration before starting.
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Settings" size={16} />
          <span>Configuration Details</span>
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Topic:</span>
            <span className="text-sm font-medium text-foreground text-right">{formData.topic}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Group Size:</span>
            <span className="text-sm font-medium text-foreground text-right">{formatValue('groupSize', formData.groupSize)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Duration:</span>
            <span className="text-sm font-medium text-foreground text-right">{formData.duration} minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDSummary;