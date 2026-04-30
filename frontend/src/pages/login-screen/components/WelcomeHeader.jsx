import React from 'react';

const WelcomeHeader = () => {
  return (
    <div className="text-left mb-10 space-y-3">
      <div className="flex items-center gap-3">
         <div className="w-2 h-2 rounded-full bg-primary shadow-sm animate-pulse" />
         <h2 className="text-3xl font-extrabold text-on-surface tracking-tighter uppercase leading-none">
          Welcome Back
        </h2>
      </div>
      <p className="text-on-surface-variant font-extrabold text-[10px] uppercase tracking-[0.4em] opacity-40 ml-5">
        Establishing Secure Uplink...
      </p>
    </div>
  );
};

export default WelcomeHeader;