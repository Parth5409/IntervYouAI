import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 selection:bg-primary/30 selection:text-on-surface overflow-hidden relative bg-black">
      {/* Background Elements */}
      <div className="fixed inset-0 glow-mesh pointer-events-none opacity-40" />
      <div className="fixed inset-0 subtle-grid pointer-events-none opacity-20" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <main className="relative w-full max-w-[480px] flex flex-col gap-14 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center group">
          <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-[2rem] bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/10 transition-all group-hover:scale-110 duration-700 shadow-2xl relative">
            <div className="absolute inset-[-8px] border border-primary/20 rounded-[2.5rem] pointer-events-none animate-pulse" />
            <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-[-0.05em] text-white uppercase italic">IntervYou.AI</h1>
          <p className="font-body text-[10px] text-primary mt-3 tracking-[0.5em] uppercase font-extrabold opacity-60">The Luminescent Void</p>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface-container-high/40 backdrop-blur-3xl rounded-[3rem] p-12 md:p-14 border border-outline-variant/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group/card"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover/card:bg-primary/10 transition-all duration-1000" />
          
          <div className="relative z-10">
            <header className="mb-12 text-center space-y-4">
              <h2 className="font-headline text-4xl font-extrabold text-white tracking-tighter uppercase leading-none">
                {title || 'Welcome back'}
              </h2>
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px w-8 bg-outline-variant/20" />
                 <p className="font-body text-on-surface-variant font-extrabold text-[10px] uppercase tracking-[0.3em] opacity-40">
                  {subtitle || 'Neural Link Established'}
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
              <span className="text-[10px] text-on-surface-variant font-extrabold uppercase tracking-[0.3em]">Neural Status</span>
              <span className="text-[11px] text-white font-extrabold flex items-center gap-3 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,145,90,0.4)] animate-pulse" />
                Active
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-on-surface-variant font-extrabold uppercase tracking-[0.3em]">Loom-Core</span>
              <span className="text-[11px] text-white font-extrabold uppercase tracking-wider">V2.0.Lum</span>
            </div>
          </div>
          <div className="text-[10px] text-on-surface-variant font-extrabold tracking-[0.2em] uppercase">
            © 2026 IVY_LABS
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;