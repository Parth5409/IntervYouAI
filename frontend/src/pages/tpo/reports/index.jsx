import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import { cn } from '../../../utils/cn';
import api from '../../../utils/api';

const TpoReportsPage = () => {
  const [activeReport, setActiveReport] = useState('performance');
  const [performanceData, setPerformanceData] = useState([]);
  const [driveData, setDriveData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [overallAnalytics, setOverallAnalytics] = useState({ readiness: 0, vocal: 0, technical: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('analytics/tpo-reports');
      const data = res.data.data;
      setPerformanceData(data.performanceData || []);
      setDriveData(data.driveData || []);
      setDepartmentData(data.departmentData || []);
      setActivityData(data.activityData || []);
      setOverallAnalytics(data.overallAnalytics || { readiness: 0, vocal: 0, technical: 0 });
    } catch (error) {
      console.error("Failed to fetch report data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const reportTypes = [
    { id: 'performance', label: 'Student Performance', icon: 'ms:psychology' },
    { id: 'drives', label: 'Drive Analytics', icon: 'ms:business_center' },
    { id: 'department', label: 'Departmental Sync', icon: 'ms:hub' },
    { id: 'activity', label: 'System Activity', icon: 'ms:history' },
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-20">
          <div className="xl:col-span-8 space-y-12 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
                <div className="w-2 h-10 bg-primary rounded-full" />
                {reportTypes.find(r => r.id === activeReport)?.label.toUpperCase()}
              </h2>
              <Button className="h-14 px-8 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 w-fit">
                EXPORT REPORT
                <Icon name="ms:download" size={18} className="ml-2" />
              </Button>
            </div>

            <div className="bg-white/[0.01] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                {isLoading ? (
                  <div className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] animate-pulse">Synthesizing Data...</span>
                    </div>
                  </div>
                ) : activeReport === 'performance' ? (
                  <table className="w-full text-left min-w-[900px]">
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
                      {performanceData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-20 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">No Performance Data Found</td>
                        </tr>
                      ) : (
                        performanceData.map((student, i) => (
                          <motion.tr key={student.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="hover:bg-white/[0.02] transition-all duration-500 group">
                            <td className="pl-12 pr-6 py-10">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/10 shadow-inner">
                                  <span className="text-xl font-headline font-black text-primary italic">{student.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="text-lg font-headline font-black text-white leading-none tracking-tight">{student.name}</p>
                                  <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-2 italic">COMPLETED</p>
                                </div>
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
                              )}>{student.status}</span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : activeReport === 'drives' ? (
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="pl-12 pr-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Company</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Target Skills</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Total Sessions</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Avg Score</th>
                        <th className="pl-6 pr-12 py-8 text-right text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {driveData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-20 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">No Drive Analytics Found</td>
                        </tr>
                      ) : (
                        driveData.map((drive, i) => (
                          <motion.tr key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="hover:bg-white/[0.02] transition-all duration-500 group">
                            <td className="pl-12 pr-6 py-10 font-headline font-black text-white italic tracking-tight">{drive.companyName}</td>
                            <td className="px-6 py-10">
                              <div className="flex flex-wrap gap-2">
                                {drive.targetSkills?.slice(0, 3).map(skill => (
                                  <span key={skill} className="px-2 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[8px] font-black uppercase tracking-widest rounded-lg">{skill}</span>
                                ))}
                                {drive.targetSkills?.length > 3 && <span className="text-[8px] font-black text-white/40 italic">+{drive.targetSkills.length - 3} MORE</span>}
                              </div>
                            </td>
                            <td className="px-6 py-10 text-xs font-black text-white tracking-widest italic">{drive.totalSessions}</td>
                            <td className="px-6 py-10 font-headline font-black text-primary italic">{drive.averageScore}%</td>
                            <td className="pl-6 pr-12 py-10 text-right">
                              <span className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest">{drive.status}</span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : activeReport === 'department' ? (
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="pl-12 pr-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Department</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Students</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Avg Readiness</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Technical Core</th>
                        <th className="pl-6 pr-12 py-8 text-right text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Vocal Fidelity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {departmentData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-20 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">No Departmental Data Found</td>
                        </tr>
                      ) : (
                        departmentData.map((dept, i) => (
                          <motion.tr key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="hover:bg-white/[0.02] transition-all duration-500 group">
                            <td className="pl-12 pr-6 py-10 font-headline font-black text-white italic tracking-tight">{dept.branchName}</td>
                            <td className="px-6 py-10 text-xs font-black text-white/40 tracking-widest italic">{dept.totalStudents} ACTIVE</td>
                            <td className="px-6 py-10 font-headline font-black text-primary italic text-lg">{dept.averageOverallScore}%</td>
                            <td className="px-6 py-10 font-headline font-black text-secondary italic">{dept.averageTechnicalScore}%</td>
                            <td className="pl-6 pr-12 py-10 text-right font-headline font-black text-tertiary italic">{dept.averageCommunicationScore}%</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 space-y-8">
                    {activityData.length === 0 ? (
                      <div className="py-12 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">No System Activity Logged</div>
                    ) : (
                      activityData.map((activity, i) => (
                        <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-6 items-start p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl shrink-0",
                            activity.eventType === 'INTERVIEW_COMPLETED' ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary/10 border-secondary/20 text-secondary"
                          )}>
                            <Icon name={activity.eventType === 'INTERVIEW_COMPLETED' ? "ms:assignment_turned_in" : "ms:add_business"} size={24} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{new Date(activity.timestamp).toLocaleString()}</span>
                              <div className="w-1 h-1 bg-white/20 rounded-full" />
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{activity.actorName}</span>
                            </div>
                            <p className="text-white font-headline font-black text-lg tracking-tight italic leading-snug">{activity.description}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>

        <div className="xl:col-span-4 space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              OVERALL ANALYTICS
            </h2>
            <div className="bg-white/[0.02] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl relative overflow-hidden group/pulse">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/pulse:bg-secondary/10 transition-all duration-1000" />
              
              <div className="space-y-10">
                {[
                  { label: 'Overall Readiness', val: overallAnalytics.readiness, color: 'bg-primary' },
                  { label: 'Vocal Fidelity', val: overallAnalytics.vocal, color: 'bg-secondary' },
                  { label: 'Technical Core', val: overallAnalytics.technical, color: 'bg-tertiary' },
                ].map((m, i) => (
                  <div key={m.label} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.3em] italic">{m.label}</span>
                      <span className="text-lg font-headline font-black text-white italic">{m.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.val}%` }}
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