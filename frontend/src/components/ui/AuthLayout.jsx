import React from 'react';


const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            IntervYou.AI
          </h1>
          <p className="text-muted-foreground text-sm">
            AI-Powered Interview Preparation Platform
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-lg shadow-soft border border-border p-6">
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-muted-foreground text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 IntervYou.AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;