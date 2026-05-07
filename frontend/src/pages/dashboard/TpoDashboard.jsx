import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import api from '../../utils/api';

const TpoDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setStats] = useState(null);
  const [recentDrives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, drivesRes] = await Promise.all([
          api.get('analytics/tpo-overview'),
          api.get('drives/all')
        ]);
        
        setStats(statsRes.data.data);
        setDrives(drivesRes.data.data || drivesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Students', value: dashboardStats?.totalStudents || '0', icon: 'ms:group', trend: 'Connected' },
    { label: 'Placement Rate', value: dashboardStats?.placedPercentage || '0%', icon: 'ms:verified_user', trend: 'In Progress' },
    { label: 'Active Drives', value: dashboardStats?.activeDrives || '0', icon: 'ms:business_center', trend: 'Active' },
    { label: 'Readiness Score', value: dashboardStats?.readinessIndex || '0.0', icon: 'ms:analytics', trend: 'Average' },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5 relative">
        <div className="noise opacity-5" />
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5 relative">
          <div className="space-y-8 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-primary to-transparent"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Placement Dashboard</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-white leading-[0.85]">
              Good {getTimeOfDay()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Placement Team.</span>
            </h1>
            <p className="text-on-surface-variant/80 font-body text-xl leading-relaxed max-w-2xl">
              Connected to campus network for <span className="text-white font-bold">{user?.organizationName}</span>. Tracking <span className="text-white font-bold">{dashboardStats?.activeDrives || 0} active drives</span>.
            </p>
          </div>
          <div className="flex gap-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/tpo/students')}
              className="h-16 px-10 rounded-2xl group border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
            >
              <span className="flex items-center gap-4 font-headline text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Registry
                <Icon name="ms:group" size={20} className="group-hover:translate-y-[-2px] transition-transform" />
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/tpo/drives')}
              className="bg-white text-black rounded-2xl font-black text-[10px] px-8 py-5 shadow-2xl shadow-primary/20 hover:bg-primary hover:text-white transition-all duration-500 h-16 uppercase tracking-[0.1em]"
            >
              <span className="flex items-center gap-4 font-headline">
                NEW DRIVE
                <Icon name="ms:add" size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-secondary/20 transition-all duration-700 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all" />
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-secondary group-hover:text-black transition-all duration-500 border border-white/5 shadow-inner">
                  <Icon name={stat.icon} size={32} />
                </div>
                <span className="text-[10px] font-black text-secondary px-4 py-1.5 bg-secondary/10 rounded-full border border-secondary/20 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 group-hover:text-secondary transition-colors">{stat.label}</p>
                <p className="text-6xl font-headline font-black text-white italic tracking-tighter group-hover:translate-x-2 transition-transform duration-700">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-20 pt-10">
          {/* Performance Registry */}
          <div className="xl:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
                <div className="w-2 h-10 bg-primary rounded-full" />
                ACTIVE DRIVES
              </h2>
              <button 
                onClick={() => navigate('/tpo/drives')}
                className="text-[10px] font-black text-on-surface-variant hover:text-primary transition-all flex items-center gap-3 group px-6 py-3 rounded-2xl bg-white/5 border border-white/5 uppercase tracking-[0.2em]"
              >
                VIEW ALL
                <Icon name="ms:arrow_forward" size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            
            <div className="bg-white/[0.01] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
              {isLoading ? (
                <div className="p-40 text-center">
                  <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-10"></div>
                  <p className="font-headline text-sm font-black text-on-surface-variant/40 animate-pulse italic uppercase tracking-[0.3em]">Loading drives...</p>
                </div>
              ) : recentDrives.length === 0 ? (
                <div className="p-40 text-center space-y-8">
                  <div className="w-24 h-24 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                    <Icon name="ms:layers_clear" size={48} className="text-on-surface-variant/20" />
                  </div>
                  <p className="font-headline text-xl font-black text-on-surface-variant/40 italic uppercase tracking-[0.3em]">No drives found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="pl-12 pr-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Company</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Status</th>
                        <th className="px-6 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Eligibility</th>
                        <th className="pl-6 pr-12 py-8 text-right text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {recentDrives.slice(0, 5).map((drive, i) => (
                        <motion.tr 
                          key={drive.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 1 }}
                          className="hover:bg-white/[0.02] transition-all duration-500 group"
                        >
                          <td className="pl-12 pr-6 py-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 group-hover:border-primary/40 transition-all duration-700">
                                <span className="text-2xl font-headline font-black text-primary italic">{drive.companyName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-xl font-headline font-black text-white leading-none tracking-tight">{drive.companyName}</p>
                                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-2 italic">Ref: {drive.id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-10">
                            <span className={cn(
                              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 shadow-xl",
                              drive.status === 'ACTIVE' ? "bg-secondary/10 text-secondary border-secondary/20" :
                              drive.status === 'DRAFT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-white/5 text-white/40 border-white/5"
                            )}>
                              {drive.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-10">
                            <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary/20 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
                              <span className="text-xs text-white font-black tracking-widest uppercase italic">
                                CGPA {'>'} {drive.minCgpa}
                              </span>
                            </div>
                          </td>
                          <td className="pl-6 pr-12 py-10 text-right text-xs text-on-surface-variant/40 font-bold italic font-mono uppercase">
                            {drive.createdAt ? new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Placement Analytics */}
          <div className="space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              PLACEMENT_OVERVIEW
            </h2>
            <div className="bg-white/[0.02] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl relative overflow-hidden group/pulse">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/pulse:bg-secondary/10 transition-all duration-1000" />
              
              <div className="space-y-10">
                {[
                  { dept: 'Computer Science', val: 88, color: 'bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]' },
                  { dept: 'IT Engineering', val: 72, color: 'bg-secondary shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
                  { dept: 'Electronics', val: 45, color: 'bg-tertiary shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
                  { dept: 'Mechanical', val: 32, color: 'bg-white/20' },
                ].map((d, i) => (
                  <div key={d.dept} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.3em] italic">{d.dept}</span>
                      <span className="text-lg font-headline font-black text-white italic">{d.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full ${d.color} rounded-full relative`}
                      >
                         <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-white/5 mt-10 relative z-10">
                <div className="flex gap-6 items-start p-6 rounded-2xl bg-white/5 border border-white/5">
                  <Icon name="ms:info" size={24} className="text-secondary mt-1 opacity-80" />
                  <p className="text-[10px] font-black text-on-surface-variant/60 leading-relaxed italic uppercase tracking-[0.05em]">
                    THE READINESS SCORE IS CALCULATED BASED ON PERFORMANCE IN TECHNICAL, COMMUNICATION, AND BEHAVIORAL ROUNDS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TpoDashboard;