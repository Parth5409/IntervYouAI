import React from 'react';
import AuthLayout from '../../components/ui/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import LoginPrompt from './components/LoginPrompt';

const RegistrationScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-8">
          {/* Left Side - Trust Signals (Desktop Only) */}
          <div className="hidden lg:block lg:w-1/2 max-w-md">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Master Your Next Interview
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of professionals who've landed their dream jobs with AI-powered interview practice
                </p>
              </div>
              <TrustSignals />
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <AuthLayout
              title="Create Your Account"
              subtitle="Start your interview preparation journey today"
            >
              <div className="space-y-6">
                <RegistrationForm />
                <LoginPrompt />
              </div>
            </AuthLayout>

            {/* Mobile Trust Signals */}
            <div className="lg:hidden mt-8 bg-card rounded-lg shadow-soft border border-border p-6">
              <TrustSignals />
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default RegistrationScreen;