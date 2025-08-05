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
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AuthLayout>
        <WelcomeHeader />
        <LoginForm />
        <SecurityBadges />
      </AuthLayout>
    </div>
  );
};

export default LoginScreen;