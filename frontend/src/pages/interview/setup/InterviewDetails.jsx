import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Button from '../../../components/ui/button';
import Icon from '../../../components/AppIcon';
import api, { engineApi } from '../../../utils/api';
import { cn } from '../../../utils/cn';

const InterviewDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drive, setDrive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchDriveDetails = async () => {
      const driveId = location.state?.driveId;
      if (!driveId) {
        navigate('/dashboard');
        return;
      }

      try {
        const { data } = await api.get(`/drives/${driveId}/details`);
        setDrive(data.data);
        if (data.data.activeModules && data.data.activeModules.length > 0) {
          setSelectedRound(data.data.activeModules[0]);
        }
      } catch (err) {
        console.error('Failed to fetch drive details:', err);
        setError('Error: Failed to fetch interview details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriveDetails();
  }, [location.state, navigate]);

  const handleStartInterview = async () => {
    if (!selectedRound || !drive) return;
    
    setIsStarting(true);
    try {
      const config = drive.configJson ? JSON.parse(drive.configJson) : {};
      const roundConfig = config[selectedRound.toLowerCase()] || {};
      
      const payload = {
        drive_id: drive.id,
        company_name: drive.companyName,
        job_role: drive.companyName + " Candidate",
        jd_text: drive.jobDescription,
        min_lpa: drive.minLpa,
        max_lpa: drive.maxLpa,
        round_type: selectedRound,
        difficulty: roundConfig.difficulty || 'Medium',
        max_questions: roundConfig.questions || 8,
        negotiation_style: roundConfig.negotiation_style || 'assertive',
        configJson: drive.configJson
      };

      const { data } = await engineApi.post('session/mission', payload);

      if (data.success) {
        const sessionId = data.data.id;
        const roomPath = selectedRound === 'GD' ? `/gd/room/${sessionId}` : `/interview/room/${sessionId}`;
        navigate(roomPath, {
          state: { interviewType: selectedRound.toLowerCase(), sessionId: sessionId, interviewMode: true }
        });
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError('Connection Error: Failed to start the interview session.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-headline relative overflow-hidden">
        {/* Dynamic Background Mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        </div>
        <div className="w-80 h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-primary shadow-sm" 
          />
        </div>
        <p className="mt-10 text-primary font-extrabold text-[10px] tracking-[0.5em] uppercase animate-pulse">Loading Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-headline p-6 relative overflow-hidden">
        <div className="bg-red-500/10 border border-red-500/20 p-16 rounded-[3rem] max-w-xl text-center space-y-10 glass-card backdrop-blur-3xl relative z-10 shadow-2xl">
          <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-[0_15px_30px_rgba(239,68,68,0.3)] animate-bounce">
            <Icon name="ms:report" size={48} className="text-on-surface" />
          </div>
          <div className="space-y-4">
            <h2 className="text-on-surface text-3xl font-extrabold uppercase tracking-tighter">System Error</h2>
            <p className="text-on-surface-variant text-base opacity-60 leading-relaxed font-body">{error}</p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="primary"
            className="w-full h-20 rounded-2xl bg-red-500 hover:bg-red-600 font-extrabold text-[12px] tracking-[0.2em]"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative z-10">
        <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-16 z-10 overflow-hidden">
          <div className="lg:col-span-2 space-y-12 h-full flex flex-col">
            {/* Interview Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: 'Company', val: drive.companyName, icon: 'ms:business', color: 'text-primary' },
                { label: 'Salary Range', val: `${drive.minLpa} - ${drive.maxLpa} LPA`, icon: 'ms:payments', color: 'text-on-surface' },
                { label: 'Interview Rounds', val: `${drive.activeModules?.length || 0} ROUNDS`, icon: 'ms:account_tree', color: 'text-primary' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-high/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-outline-variant/10 group hover:bg-surface-container-highest transition-all duration-500 shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-surface transition-all">
                      <Icon name={stat.icon} size={20} />
                    </div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-extrabold opacity-60">{stat.label}</p>
                  </div>
                  <p className={cn("text-xl font-extrabold tracking-tight", stat.color)}>{stat.val}</p>
                </motion.div>
              ))}
            </div>

            {/* Interview Details Card */}
            <div className="bg-surface-container-high/40 backdrop-blur-3xl rounded-[3rem] border border-outline-variant/10 shadow-2xl overflow-hidden flex-1 flex flex-col relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 group-hover:bg-primary/10" />
              <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between shrink-0 bg-surface-container-high/60">
                <div className="flex items-center gap-4">
                  <Icon name="ms:description" size={24} className="text-primary" />
                  <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-on-surface">Job Description</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="p-12 overflow-y-auto custom-scrollbar font-body text-base leading-relaxed text-on-surface-variant opacity-80 whitespace-pre-wrap selection:bg-primary/20">
                {drive.jobDescription}
              </div>
            </div>
          </div>

          <div className="space-y-10 flex flex-col">
            <div className="bg-surface-container-high/40 backdrop-blur-3xl rounded-[3rem] border border-outline-variant/10 p-10 space-y-10 shadow-2xl relative overflow-hidden flex-1">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px]" />
              
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold tracking-tight uppercase flex items-center gap-4 text-on-surface">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Interview Rounds
                </h3>
                <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40 ml-12">Select Round</p>
              </div>
              
              <div className="space-y-6">
                {drive.activeModules?.map((module, idx) => (
                  <motion.div 
                    key={module}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedRound(module)}
                    className={cn(
                      "p-8 rounded-[2rem] cursor-pointer transition-all duration-700 flex items-center justify-between relative group overflow-hidden border",
                      selectedRound === module 
                        ? "bg-primary text-on-primary border-primary/20 shadow-[0_15px_35px_rgba(255,145,90,0.2)] scale-[1.02]" 
                        : "bg-surface-container-highest/40 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <span className={cn(
                        "text-xs font-extrabold tabular-nums opacity-40 transition-colors",
                        selectedRound === module ? "text-on-primary opacity-60" : "text-on-surface"
                      )}>
                        0{idx + 1}
                      </span>
                      <span className="text-sm font-extrabold uppercase tracking-widest">{module.replace('_', ' ')}</span>
                    </div>
                    {selectedRound === module && (
                       <motion.div layoutId="target-icon" className="relative z-10">
                         <Icon name="ms:target" size={24} className="animate-spin-slow" />
                       </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="pt-10 border-t border-outline-variant/10 space-y-10">
                <div className="flex gap-4 items-start bg-primary/5 p-6 rounded-3xl border border-primary/10">
                  <Icon name="ms:info" size={20} className="text-primary shrink-0" />
                  <p className="text-[11px] font-bold text-on-surface-variant leading-loose uppercase tracking-widest opacity-60 italic">
                    Note: The AI will adjust its questions based on your responses. Good luck!
                  </p>
                </div>
                <Button 
                  onClick={handleStartInterview}
                  loading={isStarting}
                  variant="primary"
                  className="w-full h-24 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,145,90,0.3)] hover:shadow-[0_25px_60px_rgba(255,145,90,0.4)] transition-all duration-700"
                >
                  <span className="flex items-center justify-center gap-4 font-extrabold text-[12px] tracking-[0.4em] uppercase">
                    Start Round
                    <Icon name="ms:bolt" size={24} className="animate-pulse" />
                  </span>
                </Button>
              </div>
            </div>

            <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 rounded-[2.5rem] p-8 space-y-4 shadow-xl">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary opacity-80">Status: Ready</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant opacity-40">Ready to start</span>
               </div>
               <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-primary shadow-sm"
                  />
               </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default InterviewDetails;
