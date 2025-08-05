import React from 'react';

const WelcomeHeader = () => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Welcome Back
      </h2>
      <p className="text-muted-foreground text-sm">
        Sign in to continue your interview preparation journey
      </p>
    </div>
  );
};

export default WelcomeHeader;