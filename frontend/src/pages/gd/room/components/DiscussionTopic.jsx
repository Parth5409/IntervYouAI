import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/AppIcon';

const DiscussionTopic = ({ topic }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white/[0.02] border border-white/5 p-6 sm:p-10 w-full max-w-4xl rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
    >
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br-2xl" />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-3">
          <Icon name="ms:target" size={18} className="text-primary" />
          <h2 className="font-headline text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.4em] italic">
            Active_Discussion_Vector
          </h2>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-center">
          <p className="text-2xl sm:text-3xl font-headline font-black text-white leading-tight max-w-3xl italic tracking-tighter">
            "{topic}"
          </p>
        </div>
      </div>

      {/* Blueprint Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />
    </motion.div>
  );
};

export default DiscussionTopic;
