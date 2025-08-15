import React from 'react';
import Button from '../../../components/ui/Button';

const FeedbackSections = ({ 
  feedback, 
  expandedSections, 
  onToggleSection, 
  onBookmarkInsight,
  bookmarkedInsights 
}) => {
  const sections = [
    {
      key: 'communication',
      title: 'Communication Skills',
      icon: '💬',
      description: 'Verbal and non-verbal communication effectiveness'
    },
    {
      key: 'technical',
      title: 'Technical Knowledge',
      icon: '💻',
      description: 'Domain expertise and problem-solving abilities'
    },
    {
      key: 'confidence',
      title: 'Confidence Level',
      icon: '💪',
      description: 'Self-assurance and professional presence'
    }
  ];

  const isInsightBookmarked = (insightId) => {
    return bookmarkedInsights?.some(item => item?.id === insightId);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-accent';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const renderFeedbackSection = (section) => {
    const sectionData = feedback?.[section?.key];
    const isExpanded = expandedSections?.[section?.key];

    return (
      <div key={section?.key} className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Section Header */}
        <button
          onClick={() => onToggleSection(section?.key)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{section?.icon}</span>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">{section?.title}</h3>
              <p className="text-sm text-muted-foreground">{section?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${getScoreColor(sectionData?.score)}`}>
              {sectionData?.score}%
            </span>
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
        {/* Section Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6 animate-slide-up">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <span>✅</span>
                Strengths
              </h4>
              <ul className="space-y-2">
                {sectionData?.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="text-success mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            {sectionData?.improvements && sectionData?.improvements?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-warning mb-3 flex items-center gap-2">
                  <span>📈</span>
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {sectionData?.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="text-warning mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples from Transcript */}
            {sectionData?.examples && sectionData?.examples?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <span>📝</span>
                  Key Moments
                </h4>
                <div className="space-y-3">
                  {sectionData?.examples?.map((example, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        example?.type === 'positive' ?'bg-success/5 border-success/20' :'bg-warning/5 border-warning/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {example?.timestamp}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          iconName={isInsightBookmarked(`${section?.key}-${index}`) ? "BookmarkCheck" : "Bookmark"}
                          onClick={() => onBookmarkInsight({
                            id: `${section?.key}-${index}`,
                            section: section?.title,
                            content: example?.text,
                            timestamp: example?.timestamp,
                            type: example?.type
                          })}
                          className="text-muted-foreground hover:text-accent"
                        />
                      </div>
                      <p className="text-sm text-foreground">{example?.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Detailed Feedback</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const allExpanded = Object.values(expandedSections)?.every(Boolean);
              const newState = sections?.reduce((acc, section) => ({
                ...acc,
                [section?.key]: !allExpanded
              }), {});
              Object.keys(newState)?.forEach(key => onToggleSection(key));
            }}
          >
            {Object.values(expandedSections)?.every(Boolean) ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {sections?.map(renderFeedbackSection)}
      </div>
    </div>
  );
};

export default FeedbackSections;