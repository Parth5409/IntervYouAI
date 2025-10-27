import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';

const InterviewProgressNav = ({ currentStep = 1, totalSteps = 3 }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-between w-full max-w-4xl">
      {/* Back Button - Left Side */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-slate-700 px-4 py-2"
      >
        <Icon name="ArrowLeft" size={16} />
        <span className="text-sm font-medium">Back</span>
      </Button>

      {/* Progress Steps - Center */}
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index + 1}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index + 1 <= currentStep
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                  : index + 1 === currentStep + 1
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
              }`}
            >
              {index + 1 < currentStep ? (
                <Icon name="Check" size={16} />
              ) : (
                index + 1
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  index + 1 < currentStep
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-300 dark:bg-slate-600'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Home Button - Right Side */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleHome}
        className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-slate-700 px-4 py-2"
      >
        <Icon name="Home" size={16} />
        <span className="text-sm font-medium">Home</span>
      </Button>
    </div>
  );
};

export default InterviewProgressNav;
