import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const RoleSelection = ({ selectedRole, onSelect }) => {
  const roles = [
    {
      id: 'ROLE_STUDENT',
      title: 'CANDIDATE',
      description: 'I want to practice interviews and improve my placement readiness.',
      icon: 'User',
      accent: 'emerald'
    },
    {
      id: 'ROLE_ORG_ADMIN',
      title: 'ORGANIZATION',
      description: 'I want to manage placement drives and track student performance.',
      icon: 'Building',
      accent: 'sky'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {roles.map((role) => (
        <motion.div
          key={role.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(role.id)}
          className={cn(
            "cursor-pointer border p-6 transition-all duration-300 relative overflow-hidden group",
            selectedRole === role.id 
              ? "border-emerald-500 bg-emerald-500/5" 
              : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
          )}
        >
          {/* Accent Glow */}
          {selectedRole === role.id && (
            <div className="absolute top-0 right-0 p-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          <div className="relative z-10 flex flex-col space-y-4">
            <div className={cn(
              "w-12 h-12 flex items-center justify-center border transition-colors",
              selectedRole === role.id 
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                : "border-slate-800 bg-slate-950 text-slate-500 group-hover:text-slate-300 group-hover:border-slate-700"
            )}>
              <Icon name={role.icon} size={24} />
            </div>
            
            <div>
              <h3 className={cn(
                "font-mono text-sm font-bold tracking-widest uppercase",
                selectedRole === role.id ? "text-emerald-500" : "text-slate-200"
              )}>
                {role.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
                {role.description}
              </p>
            </div>
          </div>

          {/* Industrial Grid Pattern (Subtle) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem]" />
        </motion.div>
      ))}
    </div>
  );
};

export default RoleSelection;