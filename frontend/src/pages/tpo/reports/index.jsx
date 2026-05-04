import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import { cn } from '../../../utils/cn';

const TpoReportsPage = () => {
  const [activeReport, setActiveReport] = useState('performance');

  const reportTypes = [
    { id: 'performance', label: 'Student Performance', icon: 'ms:psychology' },
    { id: 'drives', label: 'Drive Analytics', icon: 'ms:business_center' },
    { id: 'department', label: 'Departmental Sync', icon: 'ms:hub' },
    { id: 'activity', label: 'System Activity', icon: 'ms:history' },
  ];

  const performanceData = [
    { name: 'Aditya Sharma', dept: 'CSE', score: 94, sessions: 12, status: 'EXCELLENT' },
    { name: 'Priya Patel', dept: 'IT', score: 88, sessions: 8, status: 'NOMINAL' },
    { name: 'Rahul Verma', dept: 'ECE', score: 76, sessions: 15, status: 'IMPROVING' },
    { name: 'Sneha Gupta', dept: 'CSE', score: 91, sessions: 10, status: 'EXCELLENT' },
    { name: 'Vikram Singh', dept: 'MECH', score: 64, sessions: 5, status: 'CRITICAL' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5 relative">
        <div className="noise opacity-5" />
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5 relative">
          <div className="space-y-8 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-primary to-transparent"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Intelligence Reports_V2</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-white leading-[0.85]">
              Data <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Synthesis.</span>
            </h1>
            <p className="text-on-surface-variant/80 font-body text-xl leading-relaxed max-w-2xl">
              Access deep-layer analytics and student performance vectors across the institutional network.
            </p>
          </div>
          
          <div className="flex gap-4 p-2 bg-white/[0.02] rounded-3xl border border-white/5 backdrop-blur-3xl">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveReport(type.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 font-headline text-[10px] font-black uppercase tracking-[0.2em]",
                  activeReport === type.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon name={type.icon} size={18} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-20">
          <div className="xl:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
                <div className="w-2 h-10 bg-primary rounded-full" />
                {reportTypes.find(r => r.id === activeReport)?.label.toUpperCase()}
              </h2>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20">
                EXPORT REPORT
                <Icon name="ms:download" size={18} className="ml-2" />
              </Button>
            </div>

            <div className="bg-white/[0.01] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="pl-12 pr-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Student Name</th>
                    <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Branch / Dept</th>
                    <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Performance Score</th>
                    <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Sessions</th>
                    <th className="pl-6 pr-12 py-8 text-right text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {performanceData.map((student, i) => (
                    <motion.tr 
                      key={student.name} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="hover:bg-white/[0.02] transition-all duration-500 group"
                    >
                      <td className="pl-12 pr-6 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/10 shadow-inner">
                            <span className="text-xl font-headline font-black text-primary italic">{student.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-lg font-headline font-black text-white leading-none tracking-tight">{student.name}</p>
                            <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-2 italic">COMPLETED</p>                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-10 text-xs font-black text-white/60 tracking-widest uppercase italic">{student.dept}</td>
                      <td className="px-6 py-10">
                         <div className="flex items-center gap-4">
                            <span className="text-lg font-headline font-black text-white italic">{student.score}%</span>
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${student.score}%` }} />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-10 text-xs font-black text-white tracking-widest italic">{student.sessions}</td>
                      <td className="pl-6 pr-12 py-10 text-right">
                        <span className={cn(
                          "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-500 shadow-xl",
                          student.status === 'EXCELLENT' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          student.status === 'NOMINAL' ? "bg-secondary/10 text-secondary border-secondary/20" :
                          student.status === 'IMPROVING' ? "bg-tertiary/10 text-tertiary border-tertiary/20" :
                          "bg-error/10 text-error border-error/20"
                        )}>
                          {student.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              OVERALL ANALYTICS
            </h2>
            <div className="bg-white/[0.02] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl relative overflow-hidden group/pulse">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/pulse:bg-secondary/10 transition-all duration-1000" />
              
              <div className="space-y-10">
                {[
                  { label: 'Overall Readiness', val: 78, color: 'bg-primary' },
                  { label: 'Vocal Fidelity', val: 92, color: 'bg-secondary' },
                  { label: 'Technical Core', val: 64, color: 'bg-tertiary' },
                ].map((m, i) => (
                  <div key={m.label} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.3em] italic">{m.label}</span>
                      <span className="text-lg font-headline font-black text-white italic">{m.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full ${m.color} rounded-full relative`}
                      >
                         <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-white/5 mt-10">
                <div className="h-44 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner overflow-hidden relative flex flex-col items-center justify-center gap-6">
                   <div className="flex gap-2 items-end h-16">
                      {[1,3,2,4,3,5,4,6,5,4,3,2,1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [h*6, h*12, h*6] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="w-2 bg-secondary/20 rounded-full"
                        />
                      ))}
                   </div>
                   <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.5em]">SYSTEM SCAN ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TpoReportsPage;