import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import InterviewProgressNav from '../../../components/ui/InterviewProgressNav';
import Button from '../../../components/ui/button';
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
        setSelectedType('technical');
        setCurrentStep(2);
        const fetchDriveDetails = async () => {
           try {
             const { data } = await api.get(`/drives/${location.state.driveId}/details`);
             const drive = data.data;
             if (drive) {
               setFormData(prev => ({ ...prev, company: drive.companyName, driveId: drive.id }));
             }
           } catch (e) { console.error(e); }
        };
        fetchDriveDetails();
      }
    }
  }, [location.state]);

  const stepLabels = ['Selection', 'Parameters', 'Deployment'];
  const totalSteps = 3;

  const interviewTypes = [
    {
      type: 'technical',
      title: 'Technical Protocol',
      description: 'Practice coding challenges, system design, and technical problem-solving with AI-powered scenarios.',
      icon: 'ms:code',
      features: [
        'Data Structure Analysis',
        'Architecture Review',
        'Logic Verification'
      ]
    },
    {
      type: 'hr',
      title: 'Cultural Alignment',
      description: 'Master behavioral questions, company culture discussions, and professional communication skills.',
      icon: 'ms:groups',
      features: [
        'Behavioral Profiling',
        'Values Assessment',
        'Vision Discussion'
      ]
    },
    {
      type: 'group-discussion',
      title: 'Collective Logic',
      description: 'Enhance communication, leadership, and collaborative problem-solving in simulated group settings.',
      icon: 'ms:forum',
      features: [
        'Priority Conflict Resolution',
        'Collaborative Reasoning',
        'Dynamic Interaction'
      ]
    },
    {
      type: 'salary-negotiation',
      title: 'Value Negotiation',
      description: 'Learn effective negotiation strategies for compensation, benefits, and contract terms.',
      icon: 'ms:payments',
      features: [
        'Parity Assessment',
        'Benefits Structuring',
        'Closing Protocols'
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
          newErrors.type = 'Protocol selection required';
        }
        break;

      case 2:
        if (selectedType === 'technical') {
          if (!formData?.jobRole) newErrors.jobRole = 'Job role is required';
          if (!formData?.company) newErrors.company = 'Company designation is required';
          if (!formData?.difficulty) newErrors.difficulty = 'Difficulty calibration is required';
          if (!formData?.max_questions) newErrors.max_questions = 'Question count is required';
        } else if (selectedType === 'hr') {
          if (!formData?.jobRole) newErrors.jobRole = 'Target role is required';
          if (!formData?.company) newErrors.company = 'Designation is required';
          if (!formData?.experienceLevel) newErrors.experienceLevel = 'Seniority level is required';
          if (!formData?.industry) newErrors.industry = 'Sector selection is required';
        } else if (selectedType === 'group-discussion') {
          if (!formData?.topic) newErrors.topic = 'Discussion subject is required';
          if (!formData?.duration) newErrors.duration = 'Timeline constraints required';
        } else if (selectedType === 'salary-negotiation') {
          if (!formData?.jobRole) newErrors.jobRole = 'Role designation is required';
          if (!formData?.company) newErrors.company = 'Entity designation is required';
          if (!formData?.experienceLevel) newErrors.experienceLevel = 'Experience depth is required';
          if (!formData?.industry) newErrors.industry = 'Industry segment is required';
          if (!formData?.salaryRange) newErrors.salaryRange = 'Target bracket is required';
          if (!formData?.negotiationStyle) newErrors.negotiationStyle = 'Negotiation strategy required';
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
          state: { interviewType: selectedType, configuration: formData, sessionId: sessionId }
        });
      }
    } catch (error) {
      console.error("Failed to start interview session:", error);
      setErrors({ api: error.response?.data?.detail || "SYNTAX_ERROR: AI Core rejected the parameters." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="w-12 h-[2px] bg-primary rounded-full"></span>
                <span className="text-[11px] font-extrabold tracking-[0.4em] text-primary uppercase">Protocol Selection</span>
                <span className="w-12 h-[2px] bg-primary rounded-full"></span>
              </div>
              <h2 className="text-5xl font-headline font-extrabold text-on-surface italic">
                Initialize System
              </h2>
              <p className="text-on-surface-variant font-body text-base max-w-2xl mx-auto opacity-60 leading-relaxed">
                Choose the behavioral or technical paradigm for this practice session. Each protocol features specialized AI personas.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
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
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <Icon name="ms:error" size={18} className="text-red-500" />
                  <p className="text-red-500 font-headline text-[10px] font-extrabold font-label font-medium text-on-surface-variant">
                    {errors?.type}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-10 duration-700">
            {selectedType === 'technical' && (
              <TechnicalSetupForm formData={formData} onChange={handleFormDataChange} errors={errors} />
            )}
            {selectedType === 'hr' && (
              <HRSetupForm formData={formData} onChange={handleFormDataChange} errors={errors} />
            )}
            {selectedType === 'group-discussion' && (
              <GroupDiscussionSetupForm formData={formData} onChange={handleFormDataChange} errors={errors} />
            )}
            {selectedType === 'salary-negotiation' && (
              <SalaryNegotiationSetupForm formData={formData} onChange={handleFormDataChange} errors={errors} />
            )}
          </div>
        );

      case 3:
        return (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <SessionSummary interviewType={selectedType} formData={formData} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          {/* Progress Indicator */}
          <div className="mb-20 max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6 px-1">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.4em]">Current Status</span>
                <h3 className="font-headline text-lg font-extrabold text-on-surface">
                  Phase {currentStep} <span className="text-on-surface-variant opacity-40 ml-2">//</span> <span className="italic text-primary ml-2">{stepLabels[currentStep - 1]}</span>
                </h3>
              </div>
              <span className="font-headline font-extrabold text-on-surface-variant tabular-nums opacity-60 text-xs font-label font-medium text-on-surface-variant">
                L_VECTOR_{currentStep.toString().padStart(2, '0')}.{totalSteps}
              </span>
            </div>
            <div className="h-3 w-full bg-surface-container-high/40 rounded-full p-1 border border-outline-variant/5">
              <div className="h-full w-full flex gap-2">
                {stepLabels.map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className={cn(
                      "h-full flex-1 rounded-full transition-all duration-1000",
                      i + 1 <= currentStep ? "bg-primary shadow-sm" : "bg-outline-variant/10"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>

          <main className="min-h-[500px]">
            {renderStepContent()}
          </main>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-16 border-t border-outline-variant/10 mt-20">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="h-16 px-10 rounded-2xl group border-outline-variant/20 transition-all duration-500"
                >
                  <span className="flex items-center gap-4 font-headline text-[10px] font-extrabold font-label font-medium text-on-surface-variant">
                    <Icon name="ms:arrow_back" size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Decrement Phase
                  </span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !selectedType}
                  variant="primary"
                  className="h-16 px-10 rounded-2xl group shadow-[0_15px_30px_rgba(255,145,90,0.2)] transition-all duration-500"
                >
                  <span className="flex items-center gap-4 font-headline text-[10px] font-extrabold font-label font-medium text-on-surface-variant">
                    Next Operation
                    <Icon name="ms:arrow_forward" size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={handleStartInterview}
                  loading={isLoading}
                  variant="primary"
                  className="h-20 px-12 rounded-[2rem] group shadow-[0_20px_40px_rgba(255,145,90,0.3)] transition-all duration-500"
                >
                  <span className="flex items-center gap-4 font-headline text-[11px] font-extrabold">
                    {isLoading ? 'Calibrating...' : 'Initialize Mission'}
                    <Icon name="ms:rocket_launch" size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewSetupWizard;