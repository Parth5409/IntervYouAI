import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InterviewProgressNav from '../../../components/ui/InterviewProgressNav';
import Button from '../../../components/ui/Button';
import InterviewTypeCard from './components/InterviewTypeCard';
import TechnicalSetupForm from './components/TechnicalSetupForm';
import HRSetupForm from './components/HRSetupForm';
import GroupDiscussionSetupForm from './components/GroupDiscussionSetupForm';
import SalaryNegotiationSetupForm from './components/SalaryNegotiationSetupForm';
import SessionSummary from './components/SessionSummary';
import Icon from '../../../components/AppIcon';
import api, { engineApi } from '../../../utils/api';
import { cn } from '../../../utils/cn';

const InterviewSetupWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have state from navigation (e.g. from Dashboard)
    if (location.state) {
      if (location.state.selectedType) {
        setSelectedType(location.state.selectedType);
        setCurrentStep(2);
      }
      if (location.state.driveId) {
        // If it's a specific drive, we usually want Technical
        setSelectedType('technical');
        setCurrentStep(2);
        // We could fetch drive details here to pre-fill company name
        const fetchDriveDetails = async () => {
           try {
             const { data } = await api.get(`/api/core/v1/drives/all`); // Ideally a single drive endpoint
             const drive = data.data.find(d => d.id === location.state.driveId);
             if (drive) {
               setFormData(prev => ({ ...prev, company: drive.companyName, driveId: drive.id }));
             }
           } catch (e) { console.error(e); }
        };
        fetchDriveDetails();
      }
    }
  }, [location.state]);

  const stepLabels = ['Type', 'Setup', 'Summary'];
  const totalSteps = 3;

  const interviewTypes = [
    {
      type: 'technical',
      title: 'Technical Interview',
      description: 'Practice coding challenges, system design, and technical problem-solving with AI-powered scenarios.',
      icon: 'Code',
      features: [
        'Algorithm & Data Structure Questions',
        'System Design Discussions',
        'Code Review Sessions'
      ]
    },
    {
      type: 'hr',
      title: 'HR Interview',
      description: 'Master behavioral questions, company culture discussions, and professional communication skills.',
      icon: 'Users',
      features: [
        'Behavioral Question Practice',
        'Culture Fit Assessment',
        'Career Goal Discussions'
      ]
    },
    {
      type: 'group-discussion',
      title: 'Group Discussion',
      description: 'Enhance communication, leadership, and collaborative problem-solving in simulated group settings.',
      icon: 'MessageSquare',
      features: [
        'Leadership Skills Development',
        'Team Collaboration Practice',
        'Critical Thinking Exercises'
      ]
    },
    {
      type: 'salary-negotiation',
      title: 'Salary Negotiation',
      description: 'Learn effective negotiation strategies for compensation, benefits, and contract terms.',
      icon: 'DollarSign',
      features: [
        'Compensation Discussion Tactics',
        'Benefits Negotiation',
        'Contract Terms Review'
      ]
    }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('interviewSetupData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSelectedType(parsed?.type || '');
        setFormData(parsed?.formData || {});
        setCurrentStep(parsed?.currentStep || 1);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      type: selectedType,
      formData,
      currentStep
    };
    localStorage.setItem('interviewSetupData', JSON.stringify(dataToSave));
  }, [selectedType, formData, currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedType) {
          newErrors.type = 'Please select an interview type';
        }
        break;

      case 2:
        if (selectedType === 'technical') {
          if (!formData?.jobRole) newErrors.jobRole = 'Job role is required';
          if (!formData?.company) newErrors.company = 'Company selection is required';
          if (!formData?.difficulty) newErrors.difficulty = 'Difficulty level is required';
          if (!formData?.max_questions) newErrors.max_questions = 'Number of questions is required';
        } else if (selectedType === 'hr') {
          if (!formData?.jobRole) newErrors.jobRole = 'Job role is required';
          if (!formData?.company) newErrors.company = 'Company is required';
          if (!formData?.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
          if (!formData?.industry) newErrors.industry = 'Industry selection is required';
        } else if (selectedType === 'group-discussion') {
          if (!formData?.topic) newErrors.topic = 'Discussion topic is required';
          if (!formData?.duration) newErrors.duration = 'Duration is required';
        } else if (selectedType === 'salary-negotiation') {
          if (!formData?.jobRole) newErrors.jobRole = 'Job role is required';
          if (!formData?.company) newErrors.company = 'Company is required';
          if (!formData?.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
          if (!formData?.industry) newErrors.industry = 'Industry is required';
          if (!formData?.salaryRange) newErrors.salaryRange = 'Salary range is required';
          if (!formData?.negotiationStyle) newErrors.negotiationStyle = 'Negotiation style is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setFormData({ 
      type, 
      difficulty: 'Medium', 
      max_questions: 5
    });
    setErrors({});
  };

  const handleFormDataChange = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setErrors({});
  };

  const handleStartInterview = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    
    try {
      let sessionPayload = {
        session_type: selectedType.toUpperCase(),
        difficulty: formData.difficulty || 'Medium',
        max_questions: formData.max_questions || 5,
      };

      if (selectedType === 'technical') {
        sessionPayload.company_name = formData.company;
        sessionPayload.job_role = formData.jobRole;
        sessionPayload.topics = formData.topics || [];
      } else if (selectedType === 'hr') {
        sessionPayload.company_name = formData.company || null;
        sessionPayload.job_role = formData.jobRole;
        sessionPayload.experience_level = formData.experienceLevel || 'mid';
        sessionPayload.industry = formData.industry || null;
      } else if (selectedType === 'salary-negotiation') {
        sessionPayload.session_type = 'SALARY';
        sessionPayload.company_name = formData.company || null;
        sessionPayload.job_role = formData.jobRole;
        sessionPayload.experience_level = formData.experienceLevel || 'mid';
        sessionPayload.industry = formData.industry || null;
        sessionPayload.negotiation_style = formData.negotiationStyle || 'collaborative';
        sessionPayload.salary_range = formData.salaryRange || null;
      } else if (selectedType === 'group-discussion') {
        sessionPayload.session_type = 'GD';
        sessionPayload.topic = formData.topic;
        sessionPayload.duration_minutes = parseInt(formData.duration, 10) || 20;
      }

      const { data } = await engineApi.post('session/', sessionPayload);

      if (data.success) {
        const sessionId = data.data.id;
        localStorage.removeItem('interviewSetupData');
        
        const roomPath = selectedType === 'group-discussion' ? `/gd/room/${sessionId}` : `/interview/room/${sessionId}`;

        navigate(roomPath, {
          state: {
            interviewType: selectedType,
            configuration: formData,
            sessionId: sessionId
          }
        });
      } else {
        setErrors({ api: data.message || "Failed to create session." });
      }
    } catch (error) {
      console.error("Failed to start interview session:", error);
      setErrors({ api: error.response?.data?.detail || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-mono font-bold text-slate-100 tracking-tighter uppercase">
                SELECT_SIMULATION_VECTOR
              </h2>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em]">
                Choose the behavioral or technical paradigm for this session
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {interviewTypes?.map((interview) => (
                <InterviewTypeCard
                  key={interview?.type}
                  type={interview?.type}
                  title={interview?.title}
                  description={interview?.description}
                  icon={interview?.icon}
                  features={interview?.features}
                  isSelected={selectedType === interview?.type}
                  onClick={() => handleTypeSelection(interview?.type)}
                />
              ))}
            </div>
            {errors?.type && (
              <div className="text-center">
                <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest bg-red-500/10 border border-red-500/20 py-2 inline-block px-4">
                  {errors?.type}
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            {selectedType === 'technical' && (
              <TechnicalSetupForm
                formData={formData}
                onChange={handleFormDataChange}
                errors={errors}
              />
            )}
            {selectedType === 'hr' && (
              <HRSetupForm
                formData={formData}
                onChange={handleFormDataChange}
                errors={errors}
              />
            )}
            {selectedType === 'group-discussion' && (
              <GroupDiscussionSetupForm
                formData={formData}
                onChange={handleFormDataChange}
                errors={errors}
              />
            )}
            {selectedType === 'salary-negotiation' && (
              <SalaryNegotiationSetupForm
                formData={formData}
                onChange={handleFormDataChange}
                errors={errors}
              />
            )}
          </div>
        );

      case 3:
        return (
          <SessionSummary
            interviewType={selectedType}
            formData={formData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center shrink-0">
            <Icon name="Brain" size={20} className="text-slate-950" />
          </div>
          <span className="font-mono font-bold tracking-tighter text-lg">
            INTERVYOU.AI // MISSION_PREP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest hidden sm:inline">Secure_Environment_Active</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                PHASE_{currentStep.toString().padStart(2, '0')} // {stepLabels[currentStep - 1].toUpperCase()}
              </h2>
              <span className="font-mono text-[10px] text-emerald-500/60 uppercase">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-900 border border-slate-800 flex gap-1 p-[1px]">
              {stepLabels.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-full flex-1 transition-colors duration-500",
                    i + 1 <= currentStep ? "bg-emerald-500" : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>

          <main className="min-h-[400px]">
            {renderStepContent()}
          </main>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-800 mt-12">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  className="bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] tracking-widest hover:text-slate-100 uppercase h-10 px-6"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-2" />
                  PREVIOUS_PHASE
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !selectedType}
                  className="bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] tracking-widest hover:bg-emerald-400 uppercase h-10 px-8"
                >
                  NEXT_PHASE
                  <Icon name="ArrowRight" size={14} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleStartInterview}
                  loading={isLoading}
                  className="bg-emerald-500 text-slate-950 font-mono font-bold text-[10px] tracking-widest hover:bg-emerald-400 uppercase h-10 px-10"
                >
                  {isLoading ? 'INITIALIZING...' : 'START_MISSION'}
                  <Icon name="Play" size={14} className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupWizard;