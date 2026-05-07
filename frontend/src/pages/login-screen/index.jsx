import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/ui/AuthLayout';
import WelcomeHeader from './components/WelcomeHeader';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import useAuth from '../../hooks/useAuth';

const LoginScreen = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="font-mono text-secondary animate-pulse text-xs font-label font-medium text-on-surface-variant">
          Loading_System_Resources...
        </div>
      </div>
    );
  }

  return (
    <AuthLayout title="User_Login" subtitle="Identification required for access">
      <WelcomeHeader />
      <LoginForm />
      <SecurityBadges />
    </AuthLayout>
  );
};

export default LoginScreen;