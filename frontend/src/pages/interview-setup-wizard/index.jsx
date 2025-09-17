import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InterviewProgressNav from '../../components/ui/InterviewProgressNav';
import Button from '../../components/ui/Button';
import InterviewTypeCard from './components/InterviewTypeCard';
import TechnicalSetupForm from './components/TechnicalSetupForm';
import HRSetupForm from './components/HRSetupForm';
import GroupDiscussionSetupForm from './components/GroupDiscussionSetupForm';
import SalaryNegotiationSetupForm from './components/SalaryNegotiationSetupForm';
import SessionSummary from './components/SessionSummary';
import api from '../../utils/api';

const InterviewSetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
          if (!formData?.groupSize) newErrors.groupSize = 'Group size is required';
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
      const sessionPayload = {
        session_type: selectedType.toUpperCase(),
        company_name: formData.company || null,
        job_role: formData.jobRole || null,
        experience_level: formData.experienceLevel || 'mid',
        industry: formData.industry || null,
        topics: formData.topics || [],
        duration_minutes: parseInt(formData.duration, 10) || 30,
        difficulty: formData.difficulty || 'Medium',
        max_questions: formData.max_questions || 5,
        negotiation_style: formData.negotiationStyle || 'collaborative'
      };

      const { data } = await api.post('/session/', sessionPayload);

      if (data.success) {
        const sessionId = data.data.id;
        localStorage.removeItem('interviewSetupData');
        
        const roomPath = selectedType === 'group-discussion' ? `/gd-room/${sessionId}` : `/interview-room/${sessionId}`;

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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose Interview Type
              </h2>
              <p className="text-muted-foreground">
                Select the type of interview you'd like to practice
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                <p className="text-error text-sm">{errors?.type}</p>
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
    <div className="min-h-screen bg-background">
      <InterviewProgressNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
        showProgress={true}
        showBackButton={currentStep > 1}
        onBack={handleBack}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <div>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < totalSteps ? (
              <Button
                variant="default"
                onClick={handleNext}
                iconName="ArrowRight"
                iconPosition="right"
                disabled={currentStep === 1 && !selectedType}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleStartInterview}
                loading={isLoading}
                iconName="Play"
                iconPosition="left"
                className="px-8"
              >
                {isLoading ? 'Starting Session...' : 'Start Interview'}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="mt-6 md:hidden">
          <div className="text-center text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupWizard;