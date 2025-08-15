import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardNavigation from '../../components/ui/DashboardNavigation';
import Button from '../../components/ui/Button';
import SessionHeader from './components/SessionHeader';
import FeedbackSections from './components/FeedbackSections';
import TranscriptPlayer from './components/TranscriptPlayer';
import ProgressComparison from './components/ProgressComparison';
import ActionItems from './components/ActionItems';
import SocialSharing from './components/SocialSharing';

const InterviewFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    communication: true,
    technical: false,
    confidence: false,
    improvements: false
  });
  const [bookmarkedInsights, setBookmarkedInsights] = useState([]);

  // Mock current user data
  const mockCurrentUser = {
    id: 'user-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null
  };

  const [activeTab, setActiveTab] = useState('feedback');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Mock session data
  const mockSessionData = {
    id: location?.state?.sessionId || 'session-001',
    type: 'Technical Interview',
    duration: '45 minutes',
    date: '2025-01-12',
    overallScore: 85,
    rating: 4.2,
    company: 'TechCorp',
    position: 'Senior Frontend Developer',
    interviewer: 'AI Assistant',
    feedback: {
      communication: {
        score: 88,
        strengths: [
          'Clear articulation of complex technical concepts',
          'Good eye contact and professional demeanor',
          'Effective use of examples to support answers'
        ],
        improvements: [
          'Could pause more between thoughts',
          'Consider using more structured responses (STAR method)'
        ],
        examples: [
          {
            timestamp: '5:23',
            text: 'Excellent explanation of React component lifecycle',
            type: 'positive'
          },
          {
            timestamp: '12:45',
            text: 'Could have been more concise in API design explanation',
            type: 'improvement'
          }
        ]
      },
      technical: {
        score: 82,
        strengths: [
          'Strong understanding of React hooks and state management',
          'Good knowledge of performance optimization techniques',
          'Solid grasp of modern JavaScript concepts'
        ],
        improvements: [
          'Could demonstrate more experience with testing frameworks',
          'Consider discussing error handling strategies in more detail'
        ],
        examples: [
          {
            timestamp: '18:30',
            text: 'Impressive solution to the algorithm challenge',
            type: 'positive'
          },
          {
            timestamp: '25:10',
            text: 'Missed opportunity to discuss edge cases',
            type: 'improvement'
          }
        ]
      },
      confidence: {
        score: 85,
        strengths: [
          'Maintained composure during challenging questions',
          'Showed enthusiasm for the role and company',
          'Demonstrated willingness to admit knowledge gaps'
        ],
        improvements: [
          'Could show more confidence when discussing achievements',
          'Consider asking more clarifying questions'
        ],
        examples: [
          {
            timestamp: '32:15',
            text: 'Great recovery after initial confusion',
            type: 'positive'
          }
        ]
      },
      improvements: {
        score: 78,
        areas: [
          {
            category: 'Technical Skills',
            priority: 'High',
            recommendation: 'Practice system design problems with real-world constraints',
            resources: ['System Design Interview book', 'LeetCode system design']
          },
          {
            category: 'Communication',
            priority: 'Medium',
            recommendation: 'Practice the STAR method for behavioral questions',
            resources: ['Behavioral interview prep course', 'Mock interview sessions']
          },
          {
            category: 'Problem Solving',
            priority: 'Medium',
            recommendation: 'Work on thinking out loud during coding challenges',
            resources: ['Codewars', 'HackerRank interview preparation']
          }
        ]
      }
    },
    transcript: [
      {
        id: 1,
        timestamp: '00:30',
        speaker: 'interviewer',
        text: 'Can you tell me about your experience with React?',
        aiCommentary: null
      },
      {
        id: 2,
        timestamp: '00:35',
        speaker: 'candidate',
        text: 'I have been working with React for over 3 years, primarily building enterprise applications...',
        aiCommentary: 'Good opening - specific timeframe and context provided'
      },
      {
        id: 3,
        timestamp: '05:23',
        speaker: 'candidate',
        text: 'The component lifecycle in React allows us to hook into different phases...',
        aiCommentary: 'Excellent technical explanation with clear structure'
      }
    ],
    progressHistory: [
      { session: 1, date: '2024-12-15', score: 72, type: 'Technical' },
      { session: 2, date: '2025-01-02', score: 78, type: 'Behavioral' },
      { session: 3, date: '2025-01-12', score: 85, type: 'Technical' }
    ]
  };

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSessionData(mockSessionData);
      } catch (error) {
        console.error('Failed to load session data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [location?.state?.sessionId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleBookmarkInsight = (insight) => {
    setBookmarkedInsights(prev => {
      const exists = prev?.some(item => item?.id === insight?.id);
      if (exists) {
        return prev?.filter(item => item?.id !== insight?.id);
      } else {
        return [...prev, { ...insight, bookmarkedAt: new Date()?.toISOString() }];
      }
    });
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard', { state: { activeTab: 'history' } });
  };

  const handleStartNewSession = () => {
    navigate('/interview-setup-wizard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavigation currentUser={mockCurrentUser} onTabChange={handleTabChange} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <p className="text-foreground font-medium">Analyzing your interview performance...</p>
              <p className="text-muted-foreground text-sm">Generating personalized insights</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavigation currentUser={mockCurrentUser} onTabChange={handleTabChange} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Session Not Found</h2>
              <p className="text-muted-foreground">The interview session you're looking for could not be found.</p>
            </div>
            <Button onClick={handleReturnToDashboard} variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation currentUser={mockCurrentUser} onTabChange={handleTabChange} />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleReturnToDashboard}
            iconName="ArrowLeft"
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Session Header */}
        <SessionHeader sessionData={sessionData} />

        {/* Desktop Two-Column Layout / Mobile Single Column */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Feedback Sections */}
            <FeedbackSections
              feedback={sessionData?.feedback}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              onBookmarkInsight={handleBookmarkInsight}
              bookmarkedInsights={bookmarkedInsights}
            />

            {/* Progress Comparison */}
            <ProgressComparison
              currentScore={sessionData?.overallScore}
              progressHistory={sessionData?.progressHistory}
            />

            {/* Action Items */}
            <ActionItems
              improvements={sessionData?.feedback?.improvements}
              onBookmarkInsight={handleBookmarkInsight}
              bookmarkedInsights={bookmarkedInsights}
            />

            {/* Social Sharing */}
            <SocialSharing
              sessionData={sessionData}
              achievements={sessionData?.overallScore >= 80}
            />
          </div>

          {/* Sidebar - Transcript Player */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <TranscriptPlayer
                transcript={sessionData?.transcript}
                sessionDuration={sessionData?.duration}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartNewSession}
              iconName="Plus"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              Start New Practice Session
            </Button>
            <Button
              onClick={handleReturnToDashboard}
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              View All Sessions
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewFeedback;