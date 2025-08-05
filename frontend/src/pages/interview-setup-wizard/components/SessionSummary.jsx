import React from 'react';
import Icon from '../../../components/AppIcon';

const SessionSummary = ({ interviewType, formData }) => {
  const getInterviewTypeDetails = () => {
    switch (interviewType) {
      case 'technical':
        return {
          title: 'Technical Interview',
          icon: 'Code',
          duration: '45-60 minutes',
          details: [
            { label: 'Job Role', value: formData?.jobRole },
            { label: 'Company', value: formData?.company },
            { label: 'Focus', value: 'Coding & System Design' }
          ]
        };
      case 'hr':
        return {
          title: 'HR Interview',
          icon: 'Users',
          duration: '30-45 minutes',
          details: [
            { label: 'Job Role', value: formData?.jobRole },
            { label: 'Experience Level', value: formData?.experienceLevel },
            { label: 'Industry', value: formData?.industry },
            { label: 'Focus', value: 'Behavioral & Cultural Fit' }
          ]
        };
      case 'group-discussion':
        return {
          title: 'Group Discussion',
          icon: 'MessageSquare',
          duration: `${formData?.duration} minutes`,
          details: [
            { label: 'Topic', value: formData?.topic },
            { label: 'Group Size', value: formData?.groupSize },
            { label: 'Duration', value: `${formData?.duration} minutes` },
            { label: 'Focus', value: 'Communication & Leadership' }
          ]
        };
      case 'salary-negotiation':
        return {
          title: 'Salary Negotiation',
          icon: 'DollarSign',
          duration: '20-30 minutes',
          details: [
            { label: 'Job Role', value: formData?.jobRole },
            { label: 'Experience Level', value: formData?.experienceLevel },
            { label: 'Salary Range', value: formData?.salaryRange },
            { label: 'Style', value: formData?.negotiationStyle },
            { label: 'Focus', value: 'Compensation Discussion' }
          ]
        };
      default:
        return {
          title: 'Interview Session',
          icon: 'Play',
          duration: '30-45 minutes',
          details: []
        };
    }
  };

  const interviewDetails = getInterviewTypeDetails();

  const formatLabel = (key) => {
    const labelMap = {
      jobRole: 'Job Role',
      company: 'Company',
      experienceLevel: 'Experience Level',
      industry: 'Industry',
      topic: 'Topic',
      groupSize: 'Group Size',
      duration: 'Duration',
      salaryRange: 'Salary Range',
      negotiationStyle: 'Negotiation Style'
    };
    return labelMap?.[key] || key;
  };

  const formatValue = (key, value) => {
    const valueMap = {
      'entry': 'Entry Level (0-2 years)',
      'mid': 'Mid Level (3-5 years)',
      'senior': 'Senior Level (6-10 years)',
      'lead': 'Lead/Principal (10+ years)',
      'small': 'Small Group (4-6 participants)',
      'medium': 'Medium Group (7-10 participants)',
      'large': 'Large Group (11-15 participants)',
      'collaborative': 'Collaborative',
      'assertive': 'Assertive',
      'analytical': 'Analytical',
      'technology': 'Technology',
      'finance': 'Finance & Banking',
      'healthcare': 'Healthcare',
      'retail': 'Retail & E-commerce',
      'consulting': 'Consulting',
      'manufacturing': 'Manufacturing',
      'education': 'Education',
      'media': 'Media & Entertainment',
      'automotive': 'Automotive',
      'real-estate': 'Real Estate'
    };
    return valueMap?.[value] || value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Session Summary
        </h3>
        <p className="text-muted-foreground text-sm">
          Review your interview configuration before starting the session.
        </p>
      </div>
      {/* Interview Type Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Icon name={interviewDetails?.icon} size={24} color="var(--color-primary-foreground)" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-foreground">
              {interviewDetails?.title}
            </h4>
            <p className="text-muted-foreground text-sm">
              Estimated Duration: {interviewDetails?.duration}
            </p>
          </div>
        </div>
      </div>
      {/* Configuration Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="text-sm font-medium text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Settings" size={16} />
          <span>Configuration Details</span>
        </h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(formData)?.map(([key, value]) => {
            if (!value || key === 'type') return null;
            
            return (
              <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="text-sm text-muted-foreground">
                  {formatLabel(key)}:
                </span>
                <span className="text-sm font-medium text-foreground text-right">
                  {formatValue(key, value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* What to Expect */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Info" size={16} />
          <span>What to Expect</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Icon name="Mic" size={16} color="var(--color-success)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Voice Interaction</p>
              <p className="text-xs text-muted-foreground">
                Speak naturally with our AI interviewer using your microphone
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="Brain" size={16} color="var(--color-primary)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">AI-Powered Questions</p>
              <p className="text-xs text-muted-foreground">
                Dynamic questions tailored to your role and experience level
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="BarChart3" size={16} color="var(--color-accent)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Real-time Feedback</p>
              <p className="text-xs text-muted-foreground">
                Get instant analysis and improvement suggestions
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Technical Requirements */}
      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
          <span>Before You Start</span>
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Ensure your microphone is working properly</li>
          <li>• Find a quiet environment for the interview</li>
          <li>• Have a stable internet connection</li>
          <li>• Close unnecessary applications to avoid distractions</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionSummary;