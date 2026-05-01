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
    { label: 'Total Students', value: dashboardStats?.totalStudents || '0', icon: 'ms:group', trend: 'Sync active' },
    { label: 'Placement Rate', value: dashboardStats?.placedPercentage || '0%', icon: 'ms:verified_user', trend: 'Institutional peak' },
    { label: 'Active Drives', value: dashboardStats?.activeDrives || '0', icon: 'ms:business_center', trend: 'Live monitoring' },
    { label: 'Readiness Score', value: dashboardStats?.readinessIndex || '0.0', icon: 'ms:analytics', trend: 'Critical metric' },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-10 border-b border-outline/20">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="w-10 h-[2px] bg-primary rounded-full"></span>
              <span className="text-xs font-label font-bold text-primary italic">TPO Dashboard</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-headline font-bold text-on-surface leading-[1.1]">
              Good {getTimeOfDay()}, <br />
              <span className="text-primary italic">Coordinator.</span>
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">
              Institutional access verified for <span className="text-on-surface font-semibold">{user?.organizationName}</span>. Monitoring <span className="text-on-surface font-semibold">{dashboardStats?.activeDrives || 0} placement drives</span> in real-time.
            </p>
          </div>
          <div className="flex gap-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/tpo/students')}
              className="h-11 px-6 rounded-lg group border-outline-variant/30 hover:border-primary/50 transition-all duration-300"
            >
              <span className="flex items-center gap-3 font-headline font-semibold text-[10px] uppercase tracking-wider">
                Student Directory
                <Icon name="ms:group_add" size={16} className="group-hover:translate-y-[-2px] transition-transform" />
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/tpo/drives')}
              className="bg-primary text-black rounded-lg font-bold text-xs px-5 py-2.5 shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all duration-300 h-11"
            >
              <span className="flex items-center gap-3 font-headline font-semibold">
                Create New Drive
                <Icon name="ms:add_circle" size={16} className="group-hover:rotate-90 transition-transform" />
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-surface-container-low p-8 rounded-2xl glass-border group hover:bg-surface-bright transition-all duration-500 relative overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-outline/10">
                  <Icon name={stat.icon} size={28} />
                </div>
                <span className="text-xs font-label font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{stat.trend}</span>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-label font-semibold text-on-surface-variant mb-2 opacity-70">{stat.label}</p>
                <p className="text-5xl font-headline font-bold text-on-surface italic">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 pt-6">
          {/* Performance Registry */}
          <div className="xl:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-4">
                <Icon name="ms:account_tree" size={28} className="text-primary" />
                Active Placement Drives
              </h2>
              <button 
                onClick={() => navigate('/tpo/drives')}
                className="text-sm font-headline font-semibold text-primary hover:text-on-surface transition-all flex items-center gap-2 group px-4 py-2 rounded-xl hover:bg-primary/5"
              >
                View All Drives
                <Icon name="ms:arrow_forward" size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="bg-surface-container-low rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30">
              {isLoading ? (
                <div className="p-32 text-center">
                  <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6 shadow-sm"></div>
                  <p className="font-headline text-sm font-medium text-on-surface-variant animate-pulse italic">Syncing drive data...</p>
                </div>
              ) : recentDrives.length === 0 ? (
                <div className="p-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mx-auto border border-outline/20">
                    <Icon name="ms:layers_clear" size={40} className="text-on-surface-variant opacity-20" />
                  </div>
                  <p className="font-headline text-lg font-medium text-on-surface-variant opacity-60 italic">No active drives detected</p>
                </div>
              ) : (
                <div className="overflow-x-auto px-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline/20">
                        <th className="pl-12 pr-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Company</th>
                        <th className="px-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Status</th>
                        <th className="px-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Eligibility</th>
                        <th className="pl-6 pr-12 py-6 text-right text-xs font-label font-bold text-on-surface-variant italic opacity-60">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10">
                      {recentDrives.slice(0, 5).map((drive) => (
                        <tr key={drive.id} className="hover:bg-surface-bright transition-all duration-300 group">
                          <td className="pl-12 pr-6 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface border border-outline/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <span className="text-xl font-headline font-bold text-primary">{drive.companyName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-lg font-headline font-bold text-on-surface leading-tight">{drive.companyName}</p>
                                <p className="text-xs text-on-surface-variant font-medium mt-1">Ref: {drive.id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-8">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-300",
                              drive.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" :
                              drive.status === 'DRAFT' ? "bg-amber-100 text-amber-700 border-amber-200" :
                              "bg-surface-container-high text-on-surface-variant border-outline/20"
                            )}>
                              {drive.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-8">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                              <span className="text-sm text-on-surface font-semibold tracking-tight">
                                CGPA {'>'} {drive.minCgpa}
                              </span>
                            </div>
                          </td>
                          <td className="pl-6 pr-12 py-8 text-right text-sm text-on-surface-variant font-medium italic opacity-60">
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

          {/* Placement Analytics */}
          <div className="space-y-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-4">
              <Icon name="ms:pie_chart" size={28} className="text-primary" />
              Institutional Pulse
            </h2>
            <div className="bg-surface-container-low rounded-3xl p-10 space-y-10 border border-outline-variant/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-8">
                {[
                  { dept: 'Computer Science', val: 88, color: 'bg-primary shadow-sm' },
                  { dept: 'IT Engineering', val: 72, color: 'bg-primary/60 shadow-sm' },
                  { dept: 'Electronics', val: 45, color: 'bg-on-surface-variant/40' },
                  { dept: 'Mechanical', val: 32, color: 'bg-on-surface-variant/20' },
                ].map((d, i) => (
                  <div key={d.dept} className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-headline font-bold text-on-surface-variant opacity-70 italic">{d.dept}</span>
                      <span className="text-base font-headline font-bold text-on-surface">{d.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden border border-outline/10 p-[1px]">
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

              <div className="pt-8 border-t border-outline/20 mt-6">
                <div className="flex gap-4 items-start">
                  <Icon name="ms:info" size={20} className="text-primary mt-0.5 opacity-60" />
                  <p className="text-xs font-medium text-on-surface-variant leading-relaxed italic opacity-60">
                    Readiness score is calculated based on technical accuracy, communication quality, and behavioral assessment during mock sessions.
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