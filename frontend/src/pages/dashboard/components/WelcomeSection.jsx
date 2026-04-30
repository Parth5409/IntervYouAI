import React from 'react';
import Button from '../../../components/ui/button';
import Icon from '../../../components/AppIcon';

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
    <div className="bg-surface-container-low glass-border rounded-2xl p-10 relative overflow-hidden mb-8 group hover:border-primary/20 transition-all duration-500 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest">Active_Preparation_Node</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">
            {getGreeting()}, <span className="text-primary italic">{user?.full_name?.split(' ')[0] || 'User'}.</span>
          </h1>
          <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">
            {getMotivationalMessage()} Your current readiness quotient is at <span className="text-white font-bold">85%</span>. Ready for optimization?
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onStartInterview}
            className="h-14 px-10 bg-primary text-black font-headline font-bold rounded-xl shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3"
          >
            <Icon name="ms:play_circle" size={20} />
            Start Session
          </Button>
          <Button
            variant="outline"
            className="h-14 px-10 border-outline-variant hover:border-white rounded-xl font-headline font-bold text-sm transition-all"
          >
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
