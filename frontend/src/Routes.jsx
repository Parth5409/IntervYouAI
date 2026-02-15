import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import Dashboard from './pages/dashboard';
import InterviewSetupWizard from './pages/interview-setup-wizard';
import InterviewRoom from './pages/interview-room';
import GDRoom from './pages/gd-room';
import NotFound from './pages/NotFound';
import useAuth from './hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import InterviewFeedback from '@/pages/interview-feedback';
import GDFredback from '@/pages/gd-feedback';
import LandingPage from './pages/LandingPage';
import OnboardingScreen from './pages/onboarding';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (Student role only for now, assuming simple check)
  // If user is a student and has no skills listed, redirect to onboarding
  // We exclude the onboarding route itself to prevent infinite loops
  const needsOnboarding = user.role === 'STUDENT' && (!user.skills || user.skills.length === 0);
  
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is fully onboarded but tries to access onboarding, redirect to dashboard
  if (!needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />

        {/* Protected Routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-setup-wizard"
          element={
            <ProtectedRoute>
              <InterviewSetupWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-room/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gd-room/:sessionId"
          element={
            <ProtectedRoute>
              <GDRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-feedback/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gd-feedback/:sessionId"
          element={
            <ProtectedRoute>
              <GDFredback />
            </ProtectedRoute>
          }
        />
        {/* Redirect root to dashboard if logged in, otherwise to login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;