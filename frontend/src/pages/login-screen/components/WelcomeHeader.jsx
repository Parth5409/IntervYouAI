import React from 'react';

const WelcomeHeader = () => {
  return (
    <div className="text-left mb-8 border-l-2 border-emerald-500 pl-4">
      <h2 className="text-2xl font-mono font-bold text-slate-50 uppercase tracking-tighter">
        Welcome Back
      </h2>
      <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] mt-1">
        Sign in to continue your session
      </p>
    </div>
  );
};

export default WelcomeHeader;