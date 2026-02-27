import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import api, { engineApi } from '../../../utils/api';
import { cn } from '../../../utils/cn';

const MissionBrief = () => {
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
        setError('CRITICAL_ERROR: Failed to fetch mission parameters.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriveDetails();
  }, [location.state, navigate]);

  const handleStartMission = async () => {
    if (!selectedRound || !drive) return;
    
    setIsStarting(true);
    try {
      // Determine session parameters based on drive config
      const config = drive.configJson ? JSON.parse(drive.configJson) : {};
      const roundConfig = config[selectedRound.toLowerCase()] || {};
      
      const payload = {
        drive_id: drive.id,
        company_name: drive.companyName,
        job_role: drive.companyName + " Candidate", // JD parsing could be better here
        jd_text: drive.jobDescription,
        min_lpa: drive.minLpa,
        max_lpa: drive.maxLpa,
        round_type: selectedRound,
        difficulty: roundConfig.difficulty || 'Medium',
        max_questions: roundConfig.questions || 8,
        negotiation_style: roundConfig.negotiation_style || 'assertive'
      };

      // Use engineApi for cross-service calls to avoid path resolution issues
      const { data } = await engineApi.post('session/mission', payload);

      if (data.success) {
        navigate(`/interview/room/${data.data.id}`, {
          state: {
            interviewType: selectedRound.toLowerCase(),
            sessionId: data.data.id,
            missionMode: true
          }
        });
      }
    } catch (err) {
      console.error('Failed to start mission:', err);
      setError('UPLINK_FAILURE: AI engine rejected the mission request.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono">
        <div className="w-64 h-1 bg-slate-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-emerald-500 animate-[loading_2s_infinite]" />
        </div>
        <p className="mt-4 text-emerald-500/60 text-[10px] tracking-[0.3em] uppercase">Decrypting_Mission_Brief...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono p-4">
        <div className="border border-red-500/50 bg-red-500/10 p-8 max-w-md text-center space-y-4">
          <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto" />
          <h2 className="text-red-500 font-bold uppercase tracking-tighter">System_Failure</h2>
          <p className="text-slate-400 text-xs">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-red-500 text-white w-full">RETURN_TO_BASE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />
      
      <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-slate-950" />
          </div>
          <span className="font-bold tracking-tighter text-lg uppercase">Mission_Briefing // {drive.companyName}</span>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="text-slate-500 hover:text-white">ABORT_MISSION</Button>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 overflow-y-auto">
        <div className="lg:col-span-2 space-y-8">
          {/* Mission Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-4">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Entity</p>
              <p className="text-emerald-500 font-bold">{drive.companyName}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Salary_Bracket</p>
              <p className="text-sky-500 font-bold">{drive.minLpa} - {drive.maxLpa} LPA</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Rounds</p>
              <p className="text-amber-500 font-bold">{drive.activeModules?.length || 0} SECTIONS</p>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-slate-900/50 border border-slate-800 flex flex-col h-[400px]">
            <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">MISSION_PARAMETERS.TXT</span>
              <Icon name="FileText" size={14} className="text-slate-500" />
            </div>
            <div className="p-6 overflow-y-auto text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
              {drive.jobDescription}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 space-y-6">
            <h3 className="text-sm font-bold tracking-widest uppercase border-b border-slate-800 pb-4 flex items-center gap-2">
              <Icon name="List" size={16} className="text-emerald-500" />
              Mission_Pipeline
            </h3>
            
            <div className="space-y-4">
              {drive.activeModules?.map((module, idx) => (
                <div 
                  key={module}
                  onClick={() => setSelectedRound(module)}
                  className={cn(
                    "p-4 border cursor-pointer transition-all flex items-center justify-between",
                    selectedRound === module 
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] opacity-50">0{idx + 1}</span>
                    <span className="text-xs font-bold uppercase">{module.replace('_', ' ')}</span>
                  </div>
                  {selectedRound === module && <Icon name="Target" size={16} />}
                </div>
              ))}
            </div>

            <div className="pt-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 leading-loose">
                Warning: Once initialized, the AI environment will calibrate to your profile. Communication protocols must remain active for the duration of the round.
              </p>
              <Button 
                onClick={handleStartMission}
                loading={isStarting}
                className="w-full bg-emerald-500 text-slate-950 font-bold py-6 hover:bg-emerald-400"
              >
                INITIALIZE_ROUND <Icon name="Zap" size={16} className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-emerald-500/60 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Uplink_Status: Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] text-sky-500/60 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              AI_Core: Online
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MissionBrief;
