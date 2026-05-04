import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Button from '../../../components/ui/button';
import Icon from '../../../components/AppIcon';
import useAuth from '../../../hooks/useAuth';
import api from '../../../utils/api';
import GDFeedbackScores from './components/GDFeedbackScores';
import { cn } from '../../../utils/cn';

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
        const { data } = await engineApi.get(`session/${sessionId}`);
        if (data.success) {
          setSessionData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch session data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const handleReturnToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-16 h-16 border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="font-mono text-[10px] text-amber-500 animate-pulse font-label font-medium text-on-surface-variant">
            Analyzing session data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionData || !sessionData.feedback || !sessionData.context) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed border-outline-variant/30">
          <Icon name="ServerCrash" size={48} className="text-slate-700" />
          <div className="text-center space-y-2">
            <h2 className="font-mono font-bold text-on-surface">Feedback unavailable</h2>
            <p className="font-mono text-[10px] text-on-surface-variant font-label font-medium text-on-surface-variant">Could not retrieve analytics for this session</p>
          </div>
          <Button onClick={handleReturnToDashboard} className="bg-surface-container-low text-slate-300 font-mono text-[10px] h-10 px-6 font-label font-medium text-on-surface-variant">
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { feedback, context } = sessionData;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12 font-mono">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <span className="text-on-surface-variant">{'>'}</span> Discussion Analysis
            </h1>
            <p className="text-on-surface-variant mt-2 text-xs font-label font-medium text-on-surface-variant">
              Group discussion feedback // Session {sessionId?.slice(0, 8)}
            </p>
          </div>
          <Button
            onClick={handleReturnToDashboard}
            className="bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-mono text-[10px] hover:text-on-surface h-10 px-6 font-label font-medium text-on-surface-variant"
          >
            <Icon name="ArrowLeft" size={14} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Topic Banner */}
        <div className="bg-surface-container-low border border-outline-variant/30 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Icon name="MessageSquare" size={64} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.3em]">Discussion Topic</span>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tighter uppercase max-w-3xl leading-tight">
              {context?.topic || 'N/A'}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Scores & Contributions */}
          <div className="lg:col-span-2 space-y-12">
            <GDFeedbackScores feedback={feedback} />
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <Icon name="Zap" size={18} className="text-sky-500" />
                <h3 className="font-bold text-on-surface text-xs font-label font-medium text-on-surface-variant">Key Contributions</h3>
              </div>
              <div className="grid gap-4">
                {(feedback.key_contributions || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-surface-container-low/50 border border-outline-variant/30 p-4 hover:border-sky-500/30 transition-colors group">
                    <span className="text-sky-500/50 text-[10px] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-[11px] text-slate-300 uppercase leading-relaxed tracking-tight group-hover:text-on-surface transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Strengths & Improvements */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <Icon name="ThumbsUp" size={18} className="text-secondary" />
                <h3 className="font-bold text-on-surface text-xs font-label font-medium text-on-surface-variant">Strengths</h3>
              </div>
              <div className="space-y-3">
                {(feedback.strengths || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-secondary/5 border border-secondary/20 p-3">
                    <div className="w-1 h-1 bg-secondary mt-1.5 shrink-0" />
                    <p className="text-[10px] text-secondary-fixed/80 uppercase leading-relaxed tracking-tighter">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                <Icon name="TrendingUp" size={18} className="text-amber-500" />
                <h3 className="font-bold text-on-surface text-xs font-label font-medium text-on-surface-variant">Areas for Improvement</h3>
              </div>
              <div className="space-y-3">
                {(feedback.improvement_suggestions || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 p-3">
                    <div className="w-1 h-1 bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-[10px] text-amber-100/80 uppercase leading-relaxed tracking-tighter">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="space-y-6 pt-12 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 bg-secondary" />
            <h3 className="font-bold text-on-surface text-xs font-label font-medium text-on-surface-variant">Overall Summary</h3>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Icon name="FileText" size={80} className="text-on-surface-variant" />
            </div>
            <p className="text-xs text-on-surface-variant leading-loose uppercase tracking-tight relative z-10 max-w-4xl">
              {feedback.overall_feedback}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GDFredback;
