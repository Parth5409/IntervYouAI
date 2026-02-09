import React from 'react';
import AuthLayout from '../../components/ui/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import LoginPrompt from './components/LoginPrompt';

const RegistrationScreen = () => {
  return (
    <AuthLayout 
      title="Entity_Registration" 
      subtitle="Initialize new profile in the system"
    >
      <RegistrationForm />
      <TrustSignals />
      <LoginPrompt />
    </AuthLayout>
  );
};

export default RegistrationScreen;