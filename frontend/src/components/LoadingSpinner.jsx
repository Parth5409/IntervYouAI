import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "INITIALIZING_SYSTEM" }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-low relative overflow-hidden">
      {/* Industrial Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Modern Industrial Spinner */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-emerald-500 rounded-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-b-2 border-sky-500 rounded-none opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-emerald-500"
            />
          </div>
        </div>

        {/* Text Element */}
        <div className="space-y-2 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-500 font-mono text-sm font-bold"
          >
            {message}
          </motion.p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [4, 12, 4],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="w-1 bg-emerald-500/50"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-emerald-500/20" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-emerald-500/20" />
    </div>
  );
};

export default LoadingSpinner;