import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const InterviewProgressNav = ({ 
  currentStep = 1, 
  totalSteps = 3, 
  stepLabels = ['Setup', 'Interview', 'Feedback'],
  showProgress = true,
  showBackButton = true,
  onBack,
  title,
  isInterviewActive = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  // Hide navigation during active interview
  if (isInterviewActive) {
    return null;
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left Section - Back Button */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              iconName="ArrowLeft"
              iconSize={20}
              onClick={handleBack}
              className="p-2"
            />
          )}
          
          {/* Logo - Mobile */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">
              IntervYou.AI
            </span>
          </div>
        </div>

        {/* Center Section - Progress or Title */}
        <div className="flex-1 flex items-center justify-center">
          {showProgress ? (
            <div className="flex items-center space-x-4 max-w-md w-full">
              {/* Progress Steps */}
              <div className="flex items-center space-x-2 flex-1">
                {stepLabels?.map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;
                  
                  return (
                    <React.Fragment key={stepNumber}>
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                            isCompleted
                              ? 'bg-success text-success-foreground'
                              : isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <Icon name="Check" size={14} />
                          ) : (
                            stepNumber
                          )}
                        </div>
                        <span
                          className={`ml-2 text-sm font-medium hidden sm:block ${
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {index < stepLabels?.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 transition-colors ${
                            stepNumber < currentStep
                              ? 'bg-success' :'bg-muted'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : title ? (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          ) : null}
        </div>

        {/* Right Section - Home Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            iconName="Home"
            iconSize={20}
            onClick={handleHome}
            className="p-2"
          />
        </div>
      </div>
      {/* Mobile Progress Bar */}
      {showProgress && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default InterviewProgressNav;