import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InterviewRoom from './pages/interview-room';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import Dashboard from './pages/dashboard';
import InterviewSetupWizard from './pages/interview-setup-wizard';
import GDRoom from './pages/gd-room';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/interview-room" element={<InterviewRoom />} />
        <Route path="/login-screen" element={<LoginScreen />} />
        <Route path="/registration-screen" element={<RegistrationScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview-setup-wizard" element={<InterviewSetupWizard />} />
        <Route path="/gd-room" element={<GDRoom />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
