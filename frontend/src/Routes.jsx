import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import Dashboard from './pages/dashboard';
import InterviewSetupWizard from './pages/interview-setup-wizard';
import InterviewRoom from './pages/interview-room';
import GDRoom from './pages/gd-room';
import NotFound from './pages/NotFound';
import useAuth from './hooks/useAuth';
import LoadingSpinner from 'components/LoadingSpinner';
import InterviewFeedback from 'pages/interview-feedback';
import GDFredback from 'pages/gd-feedback';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Or a more sophisticated loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Or a more sophisticated loading spinner
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />

        {/* Protected Routes */}
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
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
