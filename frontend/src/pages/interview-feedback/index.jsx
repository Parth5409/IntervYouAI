import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardNavigation from '../../components/ui/DashboardNavigation';
import Button from '../../components/ui/Button';
import SessionHeader from './components/SessionHeader';
import FeedbackSections from './components/FeedbackSections';
import SocialSharing from './components/SocialSharing';
import useAuth from '../../hooks/useAuth';
import Recommendations from './components/Recommendations';
import api from '../../utils/api';

const InterviewFeedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState(location.state?.sessionData || null);
  const [isLoading, setIsLoading] = useState(!location.state?.sessionData);
  const [expandedSections, setExpandedSections] = useState({
    communication_score: true,
    technical_score: true,
    confidence_score: true,
  });

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setIsLoading(false);
        console.error("No session ID provided.");
        setSessionData(null);
        return;
      }
      try {
        const { data } = await api.get(`/session/${sessionId}`);
        if (data.success) {
          setSessionData(data.data);
        } else {
          setSessionData(null);
        }
      } catch (error) {
        console.error("Failed to fetch session data:", error);
        setSessionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (location.state?.sessionData) {
      setSessionData(location.state.sessionData);
      setIsLoading(false);
    } else {
      fetchSession();
    }
  }, [sessionId, location.state]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
        <DashboardNavigation currentUser={user}/>
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
        <DashboardNavigation currentUser={user}/>
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
      <DashboardNavigation currentUser={user}/>
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 max-w-4xl">
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

        {/* Main Content */}
        <div className="mt-8">
            <FeedbackSections
              feedback={sessionData?.feedback}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />

            <SocialSharing
              sessionData={sessionData}
              achievements={sessionData?.overallScore >= 80}
            />

            <Recommendations recommendations={sessionData?.feedback?.recommendations} />
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