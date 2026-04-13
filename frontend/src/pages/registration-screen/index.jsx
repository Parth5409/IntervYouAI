import React from 'react';
import AuthLayout from '../../components/ui/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import LoginPrompt from './components/LoginPrompt';

const RegistrationScreen = () => {
  return (
    <AuthLayout 
      title="Manifest Identity" 
      subtitle="Initialize your presence in the workspace"
    >
      <RegistrationForm />
    </AuthLayout>
  );
};

export default RegistrationScreen;