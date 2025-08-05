import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InterviewHistoryTab = ({ onViewFeedback }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedSession, setExpandedSession] = useState(null);

  

  const filterOptions = [
    { value: 'all', label: 'All Sessions', count: mockInterviewHistory?.length },
    { value: 'technical', label: 'Technical', count: mockInterviewHistory?.filter(s => s?.type === 'Technical')?.length },
    { value: 'hr', label: 'HR', count: mockInterviewHistory?.filter(s => s?.type === 'HR')?.length },
    { value: 'group', label: 'Group Discussion', count: mockInterviewHistory?.filter(s => s?.type === 'Group Discussion')?.length },
    { value: 'salary', label: 'Salary', count: mockInterviewHistory?.filter(s => s?.type === 'Salary Negotiation')?.length }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 75) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Technical': return 'Code';
      case 'HR': return 'Users';
      case 'Group Discussion': return 'MessageCircle';
      case 'Salary Negotiation': return 'DollarSign';
      default: return 'FileText';
    }
  };

  const filteredHistory = selectedFilter === 'all' 
    ? mockInterviewHistory 
    : mockInterviewHistory?.filter(session => 
        session?.type?.toLowerCase()?.includes(selectedFilter?.toLowerCase())
      );

  const toggleExpanded = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions?.map((option) => (
            <button
              key={option?.value}
              onClick={() => setSelectedFilter(option?.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === option?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option?.label} ({option?.count})
            </button>
          ))}
        </div>
      </div>
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">
            {filteredHistory?.length}
          </div>
          <div className="text-xs text-muted-foreground">Total Sessions</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-success mb-1">
            {Math.round(filteredHistory?.reduce((acc, session) => acc + session?.score, 0) / filteredHistory?.length) || 0}%
          </div>
          <div className="text-xs text-muted-foreground">Average Score</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-accent mb-1">
            {filteredHistory?.reduce((acc, session) => acc + parseInt(session?.duration), 0)}m
          </div>
          <div className="text-xs text-muted-foreground">Total Time</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {Math.max(...filteredHistory?.map(s => s?.score))}%
          </div>
          <div className="text-xs text-muted-foreground">Best Score</div>
        </div>
      </div>
      {/* Interview History List */}
      <div className="space-y-4">
        {filteredHistory?.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <Icon name="Calendar" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No interviews found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedFilter === 'all' ? "You haven't completed any interviews yet." 
                : `No ${selectedFilter} interviews found.`}
            </p>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
            >
              Start Your First Interview
            </Button>
          </div>
        ) : (
          filteredHistory?.map((session) => (
            <div key={session?.id} className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${getScoreBgColor(session?.score)} flex items-center justify-center`}>
                      <Icon 
                        name={getTypeIcon(session?.type)} 
                        size={20} 
                        color={`var(--color-${session?.score >= 90 ? 'success' : session?.score >= 75 ? 'warning' : 'error'})`}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{session?.type} Interview</h3>
                      <p className="text-sm text-muted-foreground">
                        {session?.company} • {session?.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(session?.score)} ${getScoreColor(session?.score)}`}>
                      {session?.score}%
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => toggleExpanded(session?.id)}
                      iconName={expandedSession === session?.id ? "ChevronUp" : "ChevronDown"}
                      iconSize={16}
                      className="p-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{new Date(session.date)?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{session?.duration}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={() => onViewFeedback && onViewFeedback(session?.id)}
                    iconName="Eye"
                    iconPosition="left"
                    iconSize={14}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSession === session?.id && (
                <div className="border-t border-border p-4 bg-muted/30">
                  <div className="space-y-4">
                    {/* Feedback */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">AI Feedback</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {session?.feedback}
                      </p>
                    </div>

                    {/* Questions */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Questions Asked</h4>
                      <ul className="space-y-1">
                        {session?.questions?.map((question, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        iconName="RotateCcw"
                        iconPosition="left"
                        iconSize={14}
                        className="text-xs"
                      >
                        Retry Similar
                      </Button>
                      <Button
                        variant="ghost"
                        iconName="Share"
                        iconPosition="left"
                        iconSize={14}
                        className="text-xs"
                      >
                        Share Results
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InterviewHistoryTab;