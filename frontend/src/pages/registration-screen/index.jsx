import React from 'react';
import AuthLayout from '../../components/ui/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import LoginPrompt from './components/LoginPrompt';

const RegistrationScreen = () => {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join IntervYou.AI and start your journey"
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegistrationScreen;