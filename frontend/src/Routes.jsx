import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentDrivesPage from './pages/student/StudentDrivesPage';
import TpoDashboard from './pages/dashboard/TpoDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import InterviewSetupWizard from './pages/interview/setup';
import MissionBrief from './pages/interview/setup/MissionBrief';
import InterviewRoom from './pages/interview/room';
import GDRoom from './pages/gd/room';
import NotFound from './pages/NotFound';
import useAuth from './hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import InterviewFeedback from './pages/interview/feedback';
import GDFeedback from './pages/gd/feedback';
import LandingPage from './pages/LandingPage';
import OnboardingScreen from './pages/onboarding';

import TpoManagementPage from './pages/admin/tpo-management';
import SystemConfigPage from './pages/admin/system-config';
import StudentDirectoryPage from './pages/tpo/students';
import DriveManagementPage from './pages/tpo/drives';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user needs onboarding (Student role only for now)
  // If user is a student and has no skills listed, redirect to onboarding
  const needsOnboarding = user.role === 'ROLE_STUDENT' && (!user.skills || user.skills.length === 0);
  
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Role-based dashboard redirection logic
  if (location.pathname === '/dashboard') {
    if (user.role === 'ROLE_STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'ROLE_TPO') return <Navigate to="/tpo/dashboard" replace />;
    if (user.role === 'ROLE_ORG_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    
    // Fallback for unrecognized roles
    return <Navigate to="/login" replace />;
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
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/history"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/drives"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentDrivesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tpo/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_TPO']}>
              <TpoDashboard /> 
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetupWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/mission/:driveId"
          element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <MissionBrief />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/room/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gd/room/:sessionId"
          element={
            <ProtectedRoute>
              <GDRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/feedback/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gd/feedback/:sessionId"
          element={
            <ProtectedRoute>
              <GDFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tpo"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
              <TpoManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/system"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
              <SystemConfigPage />
            </ProtectedRoute>
          }
        />

        {/* TPO Specific Routes */}
        <Route
          path="/tpo/students"
          element={
            <ProtectedRoute allowedRoles={['ROLE_TPO']}>
              <StudentDirectoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tpo/drives"
          element={
            <ProtectedRoute allowedRoles={['ROLE_TPO']}>
              <DriveManagementPage />
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