import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 selection:bg-primary/30 selection:text-on-surface overflow-hidden relative bg-[#0e0e0e]">
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <main className="relative w-full max-w-[480px] flex flex-col gap-14 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center group">
          <div className="mb-8 flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant transition-all hover:scale-105 duration-500 shadow-2xl relative">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>psychology</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface italic tracking-tight">IntervYou.AI</h1>
          <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-[0.25em] mt-3">KINETIC INTELLIGENCE</p>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] relative overflow-hidden group/card"
        >
          <div className="relative z-10">
            <header className="mb-12 text-center space-y-4">
              <h2 className="font-headline text-4xl font-extrabold text-on-surface leading-none italic">
                {title || 'Welcome back'}
              </h2>
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-8 bg-outline-variant/20" />
                 <p className="font-headline text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">
                  {subtitle || 'Identification Required'}
                </p>
                 <div className="h-px w-8 bg-outline-variant/20" />
              </div>
            </header>

            {children}
          </div>
        </motion.div>

        {/* Technical Metadata Footer */}
        <footer className="mt-2 flex justify-between items-end px-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Neural Status</span>
              <span className="text-[11px] text-on-surface font-extrabold flex items-center gap-3 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Core Version</span>
              <span className="text-[11px] text-on-surface font-extrabold uppercase tracking-wider">V2.5.Refined</span>
            </div>
          </div>
          <div className="text-[10px] text-on-surface-variant font-bold tracking-[0.2em] uppercase">
            © 2026 IVY_LABS
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;