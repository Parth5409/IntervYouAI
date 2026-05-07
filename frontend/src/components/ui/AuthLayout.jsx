import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 selection:bg-primary/30 selection:text-on-surface overflow-hidden relative bg-background">
      <div className="noise" />
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <main className="relative w-full max-w-[520px] flex flex-col gap-16 z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="mb-10 flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 transition-all duration-500 shadow-2xl relative overflow-hidden group-hover:border-primary/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="material-symbols-outlined text-primary text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 20" }}>bolt</span>
          </motion.div>
          <h1 className="font-headline text-4xl font-black text-white italic tracking-tighter">IntervYou<span className="text-primary">.AI</span></h1>
          <p className="font-headline text-[10px] text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 font-black">AUTHENTICATION PORTAL</p>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-[3rem] p-12 md:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group/card border border-white/5"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          <div className="relative z-10">
            <header className="mb-14 text-center space-y-5">
              <h2 className="font-headline text-5xl font-black text-white leading-none italic tracking-tighter">
                {title || 'Welcome back'}
              </h2>
              <div className="flex items-center justify-center gap-4">
                 <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-white/10" />
                 <p className="font-headline text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
                  {subtitle || 'Log in to continue'}
                </p>
                 <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-white/10" />
              </div>
            </header>

            {children}
          </div>
        </motion.div>

        {/* Technical Metadata Footer */}
        <footer className="mt-4 flex justify-between items-end px-6 opacity-30 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-on-surface-variant font-black uppercase tracking-[0.3em]">System Status</span>
              <span className="text-[10px] text-white font-black flex items-center gap-3 uppercase tracking-widest italic">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-on-surface-variant font-black uppercase tracking-[0.3em]">Version</span>
              <span className="text-[10px] text-white font-black uppercase tracking-widest italic">2.5.0</span>
            </div>
          </div>
          <div className="text-[9px] text-on-surface-variant font-black tracking-[0.4em] uppercase">
            © 2026 IntervYou.AI
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;