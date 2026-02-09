import React from 'react';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-10 w-10 text-emerald-500" />
              <span className="font-mono text-2xl font-bold tracking-tighter text-slate-50 uppercase">IntervYou.AI</span>
            </div>
          </div>
          <div className="inline-block px-3 py-1 border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-mono text-[10px] tracking-[0.2em] uppercase">
            Platform_Access // v2.0
          </div>
        </motion.div>

        {/* Content Card - Industrial Style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 p-8 shadow-2xl relative"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500" />

          {title && (
            <div className="mb-8 border-b border-slate-800 pb-6">
              <h2 className="text-xl font-mono font-bold text-slate-50 uppercase tracking-tight mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-8 font-mono text-[9px] text-slate-600 uppercase tracking-[0.2em]"
        >
          © 2026 IntervYou.AI // REDESIGN_V2.0 // SYSTEM_AUTH
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;