import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Button from '../../../components/ui/Button';
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
        const { data } = await api.get(`../../engine/session/${sessionId}`);
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
          <p className="font-mono text-[10px] text-amber-500 uppercase tracking-[0.3em] animate-pulse">
            ANALYZING_COLLECTIVE_LOGS...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionData || !sessionData.feedback) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed border-slate-800">
          <Icon name="ServerCrash" size={48} className="text-slate-700" />
          <div className="text-center space-y-2">
            <h2 className="font-mono font-bold text-slate-100 uppercase">FEEDBACK_STREAM_UNAVAILABLE</h2>
            <p className="font-mono text-[10px] text-slate-500 uppercase">Could not retrieve analytics for this session</p>
          </div>
          <Button onClick={handleReturnToDashboard} className="bg-slate-800 text-slate-300 font-mono text-[10px] h-10 px-6 uppercase tracking-widest">
            Return_to_Dashboard
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
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> DISCOURSE_ANALYSIS
            </h1>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">
              Multi-agent interaction debrief // Node_{sessionId?.slice(0, 8)}
            </p>
          </div>
          <Button
            onClick={handleReturnToDashboard}
            className="bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] tracking-widest hover:text-slate-100 uppercase h-10 px-6"
          >
            <Icon name="ArrowLeft" size={14} className="mr-2" />
            BACK_TO_CENTER
          </Button>
        </div>

        {/* Topic Banner */}
        <div className="bg-slate-900 border border-slate-800 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Icon name="MessageSquare" size={64} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.3em]">DISCUSSION_TOPIC_VECTOR</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tighter uppercase max-w-3xl leading-tight">
              {context.topic}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Scores & Contributions */}
          <div className="lg:col-span-2 space-y-12">
            <GDFeedbackScores feedback={feedback} />
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Icon name="Zap" size={18} className="text-sky-500" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">KEY_CONTRIBUTIONS_LOG</h3>
              </div>
              <div className="grid gap-4">
                {feedback.key_contributions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-slate-900/50 border border-slate-800 p-4 hover:border-sky-500/30 transition-colors group">
                    <span className="text-sky-500/50 text-[10px] mt-0.5">0{i + 1}</span>
                    <p className="text-[11px] text-slate-300 uppercase leading-relaxed tracking-tight group-hover:text-slate-100 transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Strengths & Improvements */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Icon name="ThumbsUp" size={18} className="text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">TACTICAL_STRENGTHS</h3>
              </div>
              <div className="space-y-3">
                {feedback.strengths.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/20 p-3">
                    <div className="w-1 h-1 bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-[10px] text-emerald-100/80 uppercase leading-relaxed tracking-tighter">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Icon name="TrendingUp" size={18} className="text-amber-500" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">OPTIMIZATION_TARGETS</h3>
              </div>
              <div className="space-y-3">
                {feedback.improvement_suggestions.map((item, i) => (
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
        <div className="space-y-6 pt-12 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 bg-emerald-500" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">MISSION_SUMMARY_LOG</h3>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Icon name="FileText" size={80} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 leading-loose uppercase tracking-tight relative z-10 max-w-4xl">
              {feedback.overall_feedback}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GDFredback;
