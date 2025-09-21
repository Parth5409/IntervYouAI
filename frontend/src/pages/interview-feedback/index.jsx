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
  const [sessionData, setSessionData] = useState(location.state?.sessionData || null);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (location.state?.sessionData) {
      setSessionData(location.state.sessionData);
      setIsLoading(false);
    } else {
      // Handle case where sessionData is not passed in state
      // Maybe fetch it from an API using a session ID from params
      // For now, we'll just log an error and show a not found state
      console.error("No session data provided to feedback page");
      setIsLoading(false);
    }
  }, [location.state]);

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