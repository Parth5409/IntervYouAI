import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import SessionHeader from './components/SessionHeader';
import FeedbackSections from './components/FeedbackSections';
import SocialSharing from './components/SocialSharing';
import useAuth from '../../../hooks/useAuth';
import Recommendations from './components/Recommendations';
import api, { engineApi } from '../../../utils/api';
import { cn } from '../../../utils/cn';

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
        return;
      }
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

    if (location.state?.sessionData) {
      setSessionData(location.state.sessionData);
      setIsLoading(false);
    } else {
      fetchSession();
    }
  }, [sessionId, location.state]);

  const handleReturnToDashboard = () => {
    navigate('/student/dashboard');
  };

  const handleStartNewSession = () => {
    navigate('/interview/setup');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="font-mono text-[10px] text-emerald-500 uppercase tracking-[0.3em] animate-pulse">
            GENERATING_INTELLIGENCE_REPORT...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-6 border-2 border-dashed border-slate-800">
          <Icon name="SearchX" size={48} className="text-slate-700" />
          <div className="text-center space-y-2">
            <h2 className="font-mono font-bold text-slate-100 uppercase">SESSION_DATA_NOT_FOUND</h2>
            <p className="font-mono text-[10px] text-slate-500 uppercase">The requested mission log is unavailable</p>
          </div>
          <Button onClick={handleReturnToDashboard} className="bg-slate-800 text-slate-300 font-mono text-[10px] h-10 px-6 uppercase tracking-widest">
            Return_to_Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> MISSION_DEBRIEF
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Performance analysis // Node_{sessionId?.slice(0, 8)}
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

        {/* Main Content Grid */}
        <div className="space-y-12">
          {/* Summary Header */}
          <SessionHeader sessionData={sessionData} />

          {/* Analysis Sections */}
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              <FeedbackSections
                feedback={sessionData?.feedback}
                expandedSections={expandedSections}
                onToggleSection={(s) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))}
              />
              
              <Recommendations recommendations={sessionData?.feedback?.recommendations} />
            </div>

            <div className="space-y-8">
              <SocialSharing
                sessionData={sessionData}
                achievements={sessionData?.overall_score >= 80}
              />
              
              <div className="bg-slate-900 border border-slate-800 p-6 space-y-4">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-500" />
                  POST_MISSION_ACTIONS
                </h4>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleStartNewSession}
                    className="w-full bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] h-10 uppercase tracking-widest"
                  >
                    INIT_NEW_SIMULATION
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="w-full bg-slate-800 text-slate-300 font-mono text-[10px] h-10 uppercase tracking-widest"
                  >
                    DOWNLOAD_PDF_LOG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewFeedback;