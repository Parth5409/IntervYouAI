import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardNavigation from '../../components/ui/DashboardNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import GDFeedbackScores from './components/GDFeedbackScores';

const GDFredback = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const fetchSessionData = async () => {
      setIsLoading(true);
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

    fetchSessionData();
  }, [sessionId]);

  const handleReturnToDashboard = () => {
    navigate('/dashboard', { state: { activeTab: 'history' } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavigation currentUser={user} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-foreground font-medium">Analyzing Your Discussion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData || !sessionData.feedback) {
    return (
        <div className="min-h-screen bg-background">
            <DashboardNavigation currentUser={user} />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center space-y-4">
                    <Icon name="ServerCrash" size={48} className="mx-auto text-destructive" />
                    <h2 className="text-xl font-semibold text-foreground">Feedback Not Available</h2>
                    <p className="text-muted-foreground">Could not retrieve feedback for this session.</p>
                    <Button onClick={handleReturnToDashboard} variant="outline">
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  const { feedback, context } = sessionData;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation currentUser={user} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleReturnToDashboard} iconName="ArrowLeft">
            Back to Dashboard
          </Button>
        </div>

        <header className="bg-card rounded-lg border border-border p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Group Discussion Feedback</h1>
          <p className="text-muted-foreground">Topic: <span className='font-semibold text-foreground'>{context.topic}</span></p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GDFeedbackScores feedback={feedback} />
            
            <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center"><Icon name="Sparkles" className="mr-2 text-accent"/> Key Contributions</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    {feedback.key_contributions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center"><Icon name="ThumbsUp" className="mr-2 text-success"/> Strengths</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    {feedback.strengths.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center"><Icon name="TrendingUp" className="mr-2 text-warning"/> Improvement Suggestions</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                    {feedback.improvement_suggestions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center"><Icon name="FileText" className="mr-2 text-primary"/> Overall Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{feedback.overall_feedback}</p>
        </div>

      </main>
    </div>
  );
};

export default GDFredback;
