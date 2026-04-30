import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { cn } from '@/lib/utils';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeDrives, setActiveDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const { data } = await api.get('drives/all');
        setActiveDrives(data.data || []);
      } catch (error) {
        console.error('Failed to fetch drives:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const stats = [
    { label: 'Interviews Completed', value: '12', icon: 'ms:task_alt', trend: '+2 this week' },
    { label: 'Readiness Score', value: '84%', icon: 'ms:bolt', trend: 'Top 5%' },
    { label: 'Pending Drives', value: activeDrives.length.toString().padStart(2, '0'), icon: 'ms:rocket_launch', trend: '3 expiring soon' },
    { label: 'Global Ranking', value: '#124', icon: 'ms:trophy', trend: 'Up 12 places' },
  ];

  const handleInitializeMock = (driveId) => {
    navigate(`/interview/mission/${driveId}`, { state: { driveId } });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-10 border-b border-outline/20">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-10 h-[2px] bg-primary rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary italic">Student Workspace</span>
          </div>
          <h1 className="text-5xl font-headline font-bold tracking-tight text-white leading-[1.1]">
            Good {getTimeOfDay()}, <br />
            <span className="text-primary italic">{user?.fullName?.split(' ')[0]}.</span>
          </h1>
          <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">
            Your intelligence sync is complete. You have <span className="text-on-surface font-semibold">{activeDrives.length} active placement drives</span> awaiting your preparation. Ready to begin?
          </p>
        </div>
        <div className="flex gap-6">
          <Button 
            onClick={() => navigate('/interview/setup')}
            className="h-16 px-10 rounded-xl group shadow-sm transition-all duration-300 bg-primary text-black hover:bg-primary/90 font-bold"
          >
            <span className="flex items-center gap-3 font-headline font-semibold text-sm">
              Practice Hub
              <Icon name="ms:psychology_alt" size={20} />
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
            className="bg-surface-container-low glass-border p-8 rounded-2xl group hover:bg-surface-bright transition-all duration-500 relative overflow-hidden shadow-sm"
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-outline/10">
                <Icon name={stat.icon} size={28} />
              </div>
              <span className="text-xs font-label font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{stat.trend}</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{stat.label}</p>
              <p className="text-5xl font-headline font-bold text-on-surface italic">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 pt-6">
        {/* Active Drives Table */}
        <div className="xl:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-4">
              <Icon name="ms:rocket_launch" size={28} className="text-primary" />
              Active Placement Drives
            </h2>
            <button 
              onClick={() => navigate('/student/drives')}
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
                <p className="font-headline text-sm font-medium text-on-surface-variant animate-pulse italic">Loading your sessions...</p>
              </div>
            ) : activeDrives.length > 0 ? (
              <div className="overflow-x-auto px-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline/20">
                      <th className="pl-12 pr-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Company</th>
                      <th className="px-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Eligibility</th>
                      <th className="px-6 py-6 text-xs font-label font-bold text-on-surface-variant italic opacity-60">Created</th>
                      <th className="pl-6 pr-12 py-6 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/10">
                    {activeDrives.map((drive) => (
                      <tr key={drive.id} className="hover:bg-surface-bright transition-all duration-300 group">
                        <td className="pl-12 pr-6 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface border border-outline/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
                              <span className="text-xl font-headline font-bold text-primary">{drive.companyName.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-lg font-headline font-bold text-on-surface leading-tight">{drive.companyName}</p>
                              <p className="text-xs text-on-surface-variant font-medium mt-1">Full-time Opportunity</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8">
                          <span className="px-4 py-1.5 rounded-full bg-surface-container-high border border-outline/20 text-xs font-label font-bold text-on-surface">
                            CGPA {'>'} {drive.minCgpa}
                          </span>
                        </td>
                        <td className="px-6 py-8">
                          <p className="text-sm text-on-surface-variant font-medium italic opacity-60">
                            {new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="pl-6 pr-12 py-8 text-right">
                          <Button 
                            onClick={() => handleInitializeMock(drive.id)}
                            className="h-11 px-8 rounded-xl text-xs font-headline font-bold"
                          >
                            Start Session
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-32 text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mx-auto border border-outline/20">
                  <Icon name="ms:nearby_error" size={40} className="text-on-surface-variant opacity-20" />
                </div>
                <p className="font-headline text-lg font-medium text-on-surface-variant opacity-60 italic">No active drives detected</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status / Log */}
        <div className="space-y-10">
          <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-4">
            <Icon name="ms:terminal" size={24} className="text-primary" />
            Session Status
          </h2>
          <div className="bg-surface-container-low rounded-3xl p-10 space-y-10 border border-outline-variant/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-container-low border border-outline/20">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-sm"></div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-label font-bold text-on-surface italic">Connectivity Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-on-surface-variant font-medium italic opacity-60">Session Integrity 98.4%</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-label font-bold text-on-surface-variant italic opacity-60">Recent Activity</p>
                <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" />
              </div>
              <div className="space-y-5">
                {[
                  { time: '04:22', tag: 'SYNC', msg: 'Profile updated', color: 'text-primary' },
                  { time: '12:05', tag: 'DRIVE', msg: `${activeDrives.length} drives tracked`, color: 'text-on-surface' },
                  { time: '22:15', tag: 'AUTH', msg: 'Session refreshed', color: 'text-on-surface-variant' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 font-body text-xs items-start group">
                    <span className="text-on-surface-variant/30 font-bold group-hover:text-primary/60 transition-colors">{item.time}</span>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className={`${item.color} font-headline font-bold text-[10px] italic leading-none`}>[{item.tag}]</span>
                      <span className="text-on-surface-variant leading-relaxed font-medium group-hover:text-on-surface transition-colors">{item.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <div className="h-32 rounded-3xl bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop')] bg-cover opacity-5 grayscale brightness-110 rounded-2xl border border-outline/10 shadow-inner group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <span className="text-sm font-headline italic text-on-surface animate-pulse">Analyzing session data...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;