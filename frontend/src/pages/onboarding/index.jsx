import React from 'react';
import AuthLayout from '../../components/ui/AuthLayout';
import OnboardingForm from './components/OnboardingForm';

const OnboardingScreen = () => {
  return (
    <AuthLayout 
      title="Profile_Initialization" 
      subtitle="Complete your profile to access the system"
    >
      <OnboardingForm />
    </AuthLayout>
  );
};

export default OnboardingScreen;