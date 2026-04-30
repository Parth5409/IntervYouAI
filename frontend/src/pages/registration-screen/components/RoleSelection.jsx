import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const RoleSelection = ({ selectedRole, onSelect }) => {
  const roles = [
    {
      id: 'ROLE_STUDENT',
      title: 'Practitioner',
      description: 'Sharpen your neural pathways and master the interview ether.',
      icon: 'ms:psychology',
    },
    {
      id: 'ROLE_ORG_ADMIN',
      title: 'Architect',
      description: 'Design the recruitment nexus and oversee candidate growth.',
      icon: 'ms:corporate_fare',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
      {roles.map((role) => {
        const active = selectedRole === role.id;
        return (
          <motion.div
            key={role.id}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(role.id)}
            className={cn(
              "cursor-pointer p-10 transition-all duration-700 relative overflow-hidden rounded-[2.5rem] group",
              active 
                ? "bg-primary/10 border border-primary/40 shadow-2xl" 
                : "bg-surface-container-high/20 border border-outline-variant/10 hover:border-on-surface/20"
            )}
          >
            {/* Background Glows */}
            <div className={cn(
               "absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full transition-all duration-1000",
               active ? "bg-primary/20 scale-150" : "bg-white/5 opacity-0 group-hover:opacity-100"
            )} />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className={cn(
                "w-20 h-20 flex items-center justify-center rounded-[1.5rem] transition-all duration-700 relative",
                active 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "bg-surface-container-highest text-on-surface-variant group-hover:text-primary group-hover:bg-surface-container-highest/80"
              )}>
                {active && (
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-[-12px] border-2 border-primary/20 rounded-[2rem] pointer-events-none"
                   />
                )}
                <Icon name={role.icon} size={40} />
              </div>
              
              <div className="space-y-3">
                <h3 className={cn(
                  "font-headline text-sm font-extrabold tracking-[0.3em] uppercase transition-colors",
                  active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
                )}>
                  {role.title}
                </h3>
                <p className="text-[11px] text-on-surface-variant/40 font-extrabold uppercase tracking-[0.15em] leading-relaxed max-w-[200px] group-hover:text-on-surface-variant transition-colors">
                  {role.description}
                </p>
              </div>
            </div>

            {/* Selection Tick Indicator */}
            <AnimatePresence>
              {active && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-6 right-6"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                    <Icon name="ms:check" size={18} className="text-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RoleSelection;