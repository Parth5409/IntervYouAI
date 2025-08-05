import React from 'react';

import Button from '../../../components/ui/Button';

const WelcomeSection = ({ user, onStartInterview }) => {
  const getGreeting = () => {
    const hour = new Date()?.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to ace your next interview?",
      "Let's practice and build your confidence!",
      "Your dream job is just practice away!",
      "Time to sharpen your interview skills!",
      "Practice makes perfect - let's get started!"
    ];
    return messages?.[Math.floor(Math.random() * messages?.length)];
  };

  return (
    <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.full_name || 'User'}!
          </h1>
          <p className="text-primary-foreground/80 mb-1">
            {getMotivationalMessage()}
          </p>
          {user?.careerGoal && (
            <p className="text-sm text-primary-foreground/70">
              Goal: {user?.careerGoal}
            </p>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-primary-foreground/70">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-xs text-primary-foreground/70">Avg Score</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={onStartInterview}
          iconName="Play"
          iconPosition="left"
          className="bg-white text-primary hover:bg-white/90"
        >
          Start New Interview
        </Button>
        <Button
          variant="ghost"
          iconName="TrendingUp"
          iconPosition="left"
          className="text-white border-white/20 hover:bg-white/10"
        >
          View Progress
        </Button>
      </div>
    </div>
  );
};

export default WelcomeSection;
