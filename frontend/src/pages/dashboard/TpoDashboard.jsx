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
    { label: 'Total Candidates', value: dashboardStats?.totalStudents || '0', icon: 'ms:group', trend: 'Sync active' },
    { label: 'Placement Quotient', value: dashboardStats?.placedPercentage || '0%', icon: 'ms:verified_user', trend: 'Institutional peak' },
    { label: 'Active Protocols', value: dashboardStats?.activeDrives || '0', icon: 'ms:business_center', trend: 'Live monitoring' },
    { label: 'Readiness Index', value: dashboardStats?.readinessIndex || '0.0', icon: 'ms:analytics', trend: 'Critical metric' },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-10 border-b border-outline-variant/10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary rounded-full"></span>
            <span className="text-[11px] font-extrabold tracking-[0.4em] text-primary uppercase">Management Console</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-headline font-extrabold tracking-tight text-white leading-[1.1]">
            Good {getTimeOfDay()}, <br />
            <span className="text-primary italic font-light">Controller.</span>
          </h1>
          <p className="text-on-surface-variant font-body text-base max-w-xl leading-relaxed opacity-60">
            Institutional access verified for <span className="text-white font-bold">{user?.organizationName}</span>. Monitoring <span className="text-white font-bold">{dashboardStats?.activeDrives || 0} recruitment protocols</span> in real-time.
          </p>
        </div>
        <div className="flex gap-6">
          <Button 
            variant="outline"
            onClick={() => navigate('/tpo/students')}
            className="h-20 px-10 rounded-3xl group border-outline-variant/20 hover:border-primary/50 transition-all duration-500"
          >
            <span className="flex items-center gap-4 font-headline text-[10px] font-extrabold uppercase tracking-[0.25em]">
              Student Registry
              <Icon name="ms:group_add" size={24} className="group-hover:translate-y-[-4px] transition-transform" />
            </span>
          </Button>
          <Button 
            onClick={() => navigate('/tpo/drives')}
            variant="primary"
            className="h-20 px-10 rounded-3xl group shadow-[0_20px_40px_rgba(255,145,90,0.3)] hover:shadow-[0_25px_50px_rgba(255,145,90,0.4)] transition-all duration-500"
          >
            <span className="flex items-center gap-4 font-headline text-[10px] font-extrabold uppercase tracking-[0.25em]">
              Deploy Drive
              <Icon name="ms:add_circle" size={24} className="group-hover:rotate-90 transition-transform" />
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="bg-surface-container-high/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-outline-variant/10 group hover:bg-surface-container-high transition-all duration-700 relative overflow-hidden shadow-xl"
          >
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-lg border border-outline-variant/5">
                <Icon name={stat.icon} size={28} />
              </div>
              <span className="text-[10px] font-extrabold text-primary px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">{stat.trend}</span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.25em] mb-3 opacity-60">{stat.label}</p>
              <p className="text-5xl font-headline font-extrabold text-white tracking-tighter tabular-nums">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 pt-6">
        {/* Performance Registry */}
        <div className="xl:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white flex items-center gap-4 uppercase">
              <Icon name="ms:account_tree" size={24} className="text-primary" />
              Active Protocol Registry
            </h2>
            <button 
              onClick={() => navigate('/tpo/drives')}
              className="text-[11px] font-extrabold text-primary hover:text-white transition-all uppercase tracking-[0.22em] flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-primary/5"
            >
              Expand All Logs
              <Icon name="ms:arrow_forward" size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="bg-surface-container-high/40 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/10">
            {isLoading ? (
              <div className="p-32 text-center">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-[0_0_20px_rgba(255,145,90,0.2)]"></div>
                <p className="font-headline text-xs font-extrabold text-on-surface-variant uppercase tracking-[0.4em] animate-pulse">Synchronizing Data Node...</p>
              </div>
            ) : recentDrives.length === 0 ? (
              <div className="p-32 text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mx-auto border border-outline-variant/10">
                  <Icon name="ms:layers_clear" size={40} className="text-on-surface-variant opacity-20" />
                </div>
                <p className="font-headline text-sm font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">No Protocols Active</p>
              </div>
            ) : (
              <div className="overflow-x-auto px-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/5">
                      <th className="pl-12 pr-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Corporation</th>
                      <th className="px-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Lifecycle</th>
                      <th className="px-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Entry Limit</th>
                      <th className="pl-6 pr-12 py-8 text-right text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {recentDrives.slice(0, 5).map((drive) => (
                      <tr key={drive.id} className="hover:bg-primary/5 transition-all duration-700 group">
                        <td className="pl-12 pr-6 py-10">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-white border border-outline-variant/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                              <span className="text-xl font-headline font-extrabold text-primary">{drive.companyName.charAt(0)}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-base font-headline font-extrabold text-white tracking-tight leading-none">{drive.companyName}</p>
                              <p className="text-[10px] text-on-surface-variant font-bold tracking-widest opacity-40 uppercase">REF_ID: {drive.id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-10">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-500",
                            drive.status === 'ACTIVE' ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,145,90,0.1)]" :
                            drive.status === 'DRAFT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-on-surface-variant/10 text-on-surface-variant border-outline-variant/10"
                          )}>
                            {drive.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-10">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                            <span className="text-[12px] text-white font-extrabold tracking-wide uppercase tabular-nums">
                              {drive.minCgpa} MIN_TH
                            </span>
                          </div>
                        </td>
                        <td className="pl-6 pr-12 py-10 text-right text-[12px] text-primary font-extrabold tabular-nums opacity-80 italic">
                          {drive.createdAt ? new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Institutional Heatmap */}
        <div className="space-y-10">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white flex items-center gap-4 uppercase">
            <Icon name="ms:pie_chart" size={24} className="text-primary" />
            Institutional Pulse
          </h2>
          <div className="bg-surface-container-high/40 backdrop-blur-2xl rounded-[3rem] p-10 space-y-10 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-10">
              {[
                { dept: 'CS_ENGINEERING', val: 88, color: 'bg-primary shadow-[0_0_15px_rgba(255,145,90,0.4)]' },
                { dept: 'IT_ENGINEERING', val: 72, color: 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' },
                { dept: 'ENTC_ENGINEERING', val: 45, color: 'bg-on-surface-variant/40' },
                { dept: 'MECHANICAL', val: 32, color: 'bg-on-surface-variant/20' },
              ].map((d, i) => (
                <div key={d.dept} className="space-y-5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-extrabold text-on-surface-variant tracking-[0.3em] uppercase opacity-60">{d.dept}</span>
                    <span className="text-sm font-headline font-extrabold text-white tabular-nums">{d.val}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10 p-[1px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                      className={`h-full ${d.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-outline-variant/10 mt-6 translate-y-2">
              <div className="flex gap-4 items-start">
                <Icon name="ms:info" size={18} className="text-primary mt-0.5" />
                <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed italic opacity-50">
                  Readiness index leverages technical accuracy, communication parity, and behavioral response latencies. Cross-referencing against global benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
);
};

export default TpoDashboard;