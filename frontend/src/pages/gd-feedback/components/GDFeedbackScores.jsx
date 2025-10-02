import React from 'react';
import Icon from '../../../components/AppIcon';

const GDFeedbackScores = ({ feedback }) => {
  const scoreMetrics = [
    { key: 'participation_score', label: 'Participation', icon: 'Users' },
    { key: 'clarity_score', label: 'Clarity', icon: 'Megaphone' },
    { key: 'collaboration_score', label: 'Collaboration', icon: 'Handshake' },
    { key: 'initiative_score', label: 'Initiative', icon: 'Zap' },
    { key: 'topic_understanding', label: 'Topic Knowledge', icon: 'BookOpen' },
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return 'bg-success';
    if (score >= 70) return 'bg-accent';
    return 'bg-warning';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {scoreMetrics.map(metric => {
          const score = feedback?.[metric.key] || 0;
          return (
            <div key={metric.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Icon name={metric.icon} size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{score}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GDFeedbackScores;
