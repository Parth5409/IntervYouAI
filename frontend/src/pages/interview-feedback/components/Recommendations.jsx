import React from 'react';
import Icon from '../../../components/AppIcon';

const Recommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon name="ListChecks" size={20} />
        <span>Actionable Recommendations</span>
      </h3>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-foreground">
            <Icon name="ArrowRight" size={16} className="text-primary mt-1 flex-shrink-0" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
