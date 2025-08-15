import React from 'react';
import Button from '../../../components/ui/Button';

const SessionHeader = ({ sessionData }) => {
  const feedback = sessionData?.feedback;
  const overallScore = feedback?.overall_score || 0;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-accent';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 80) return 'bg-accent';
    if (score >= 70) return 'bg-warning';
    return 'bg-error';
  };

  const getScoreBorderBgColor = (score) => {
    if (score >= 90) return 'bg-success/10 border-success/20';
    if (score >= 80) return 'bg-accent/10 border-accent/20';
    if (score >= 70) return 'bg-warning/10 border-warning/20';
    return 'bg-error/10 border-error/20';
  };

  const renderStars = (score) => {
    const rating = Math.max(0, Math.min(5, Math.round(score / 20)));
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-accent' : 'text-muted'
        }`}
      >
        ★
      </span>
    ));
  };

  const performanceMetrics = [
    { key: 'technical', label: 'Technical', score: feedback?.technical_score },
    { key: 'communication', label: 'Communication', score: feedback?.communication_score },
    { key: 'confidence', label: 'Confidence', score: feedback?.confidence_score },
    { key: 'overall', label: 'Overall', score: overallScore },
  ].filter(metric => metric.score !== null && metric.score !== undefined);

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div className="flex items-start gap-6 w-full">
          {/* Score Circle */}
          <div className={`flex items-center justify-center w-24 h-24 rounded-full border-2 flex-shrink-0 ${getScoreBorderBgColor(overallScore)}`}>
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
          </div>

          {/* Session Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{sessionData?.type}</h1>
              <div className="flex">
                {renderStars(overallScore)}
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground">
              {sessionData?.company} • {sessionData?.position}
            </p>
            
            <div className="flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span>📅</span>
                {new Date(sessionData.date)?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <span>⏱️</span>
                Duration: {sessionData?.duration}
              </span>
              <span className="flex items-center gap-2">
                <span>🤖</span>
                Interviewer: {sessionData?.interviewer}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" iconName="Download">
            Export Report
          </Button>
          <Button variant="outline" size="sm" iconName="Share">
            Share Results
          </Button>
        </div>
      </div>
      
      {/* Performance Summary Bar */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Performance Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.key} className="text-center">
              <div className="text-lg font-semibold text-foreground">{metric.score}%</div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(metric.score)}`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;
