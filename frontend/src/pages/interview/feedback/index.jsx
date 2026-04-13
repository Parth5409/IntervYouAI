import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Button from '../../../components/ui/button';
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 relative">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-2 border-2 border-sky-500/20 rounded-full" />
            <div className="absolute inset-2 border-2 border-sky-500 rounded-full border-b-transparent animate-spin-slow" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter">
              Generating Intelligence Report
            </h2>
            <p className="font-extrabold text-[10px] text-primary uppercase tracking-[0.5em] animate-pulse">
               Synthesizing Performance Vectors...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sessionData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center">
          <div className="w-24 h-24 rounded-3xl bg-error/10 flex items-center justify-center text-error border border-error/20">
            <Icon name="ms:error" size={48} />
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl font-extrabold text-white tracking-tighter uppercase leading-none">
              Session Data Unavailable
            </h2>
            <p className="text-on-surface-variant font-extrabold text-[10px] uppercase tracking-[0.4em] opacity-40">
              The requested mission log could not be retrieved from the void
            </p>
          </div>
          <Button onClick={handleReturnToDashboard} variant="default" className="h-12 px-8 uppercase tracking-widest text-[11px] font-extrabold">
            Back to Command Center
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-16 pb-24">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-outline-variant/10 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-primary rounded-full" />
              <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase leading-none">
                Mission Debrief
              </h1>
            </div>
            <p className="text-on-surface-variant font-extrabold text-[11px] uppercase tracking-[0.4em] opacity-40 ml-6">
              Neural Path Analysis // Sequence {sessionId?.slice(0, 8)}
            </p>
          </div>
          <Button
            onClick={handleReturnToDashboard}
            variant="outline"
            className="h-12 px-8 uppercase tracking-widest text-[10px] font-extrabold gap-3 self-start md:self-center"
          >
            <Icon name="ms:arrow_back" size={18} />
            Command Center
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-16">
          {/* Summary Header */}
          <SessionHeader sessionData={sessionData} />

          {/* Analysis Sections */}
          <div className="grid gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-16">
              <FeedbackSections
                feedback={sessionData?.feedback}
                expandedSections={expandedSections}
                onToggleSection={(s) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))}
              />
              
              <Recommendations recommendations={sessionData?.feedback?.recommendations} />
            </div>

            <div className="space-y-10">
              <SocialSharing
                sessionData={sessionData}
                achievements={sessionData?.overall_score >= 80}
              />
              
              <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 p-10 rounded-[3rem] space-y-8 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-[80px]" />
                <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Deployment Suite
                </h4>
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handleStartNewSession}
                    variant="primary"
                    className="w-full h-14 uppercase tracking-widest text-[11px] font-extrabold gap-3"
                  >
                     <Icon name="ms:rocket_launch" size={18} />
                    Initiate New Session
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="w-full h-14 uppercase tracking-widest text-[11px] font-extrabold gap-3"
                  >
                     <Icon name="ms:description" size={18} />
                    Download Intelligence Log
                  </Button>
                </div>
              </div>

              {/* Technical Metadata widget */}
              <div className="bg-surface-container-highest/30 p-8 rounded-[2.5rem] border border-outline-variant/10">
                <div className="space-y-4">
                   <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">System Core Version</p>
                   <p className="text-xs font-extrabold text-white tracking-widest">INTERVYOU-AI-V2.5.0-ALPHA</p>
                   <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                     <span className="text-[9px] font-extrabold text-primary uppercase tracking-[0.2em]">Validated by</span>
                     <div className="flex gap-2">
                        <Icon name="ms:verified" size={16} className="text-primary" />
                        <Icon name="ms:security" size={16} className="text-sky-500" />
                     </div>
                   </div>
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