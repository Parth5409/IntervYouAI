import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import Dashboard from './pages/dashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TpoDashboard from './pages/dashboard/TpoDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
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

import TpoManagementPage from './pages/admin/tpo-management';
import SystemConfigPage from './pages/admin/system-config';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (Student role only for now)
  // If user is a student and has no skills listed, redirect to onboarding
  const needsOnboarding = user.role === 'ROLE_STUDENT' && (!user.skills || user.skills.length === 0);
  
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Role-based dashboard redirection logic
  if (location.pathname === '/dashboard') {
    if (user.role === 'ROLE_STUDENT') return <Navigate to="/dashboard/student" replace />;
    if (user.role === 'ROLE_TPO') return <Navigate to="/dashboard/tpo" replace />;
    if (user.role === 'ROLE_ORG_ADMIN') return <Navigate to="/dashboard/admin" replace />;
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
        
        {/* Unified dashboard route that redirects via ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div /> 
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/tpo"
          element={
            <ProtectedRoute>
              <TpoDashboard /> 
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
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
        <Route
          path="/admin/tpo"
          element={
            <ProtectedRoute>
              <TpoManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/system"
          element={
            <ProtectedRoute>
              <SystemConfigPage />
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