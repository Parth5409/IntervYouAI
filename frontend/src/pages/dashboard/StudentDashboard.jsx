import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-10 border-b border-outline-variant/10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-12 h-[2px] bg-primary rounded-full"></span>
            <span className="text-[11px] font-extrabold tracking-[0.4em] text-primary uppercase">Candidate Node</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-headline font-extrabold tracking-tight text-white leading-[1.1]">
            Good {getTimeOfDay()}, <br />
            <span className="text-primary italic font-light">{user?.fullName?.split(' ')[0]}.</span>
          </h1>
          <p className="text-on-surface-variant font-body text-base max-w-xl leading-relaxed opacity-60">
            Neural interface synchronized. You have <span className="text-white font-bold">{activeDrives.length} active protocols</span> awaiting your intervention. Ready for deployment?
          </p>
        </div>
        <div className="flex gap-6">
          <Button 
            onClick={() => navigate('/interview/setup')}
            variant="primary"
            className="h-20 px-10 rounded-3xl group shadow-[0_20px_40px_rgba(255,145,90,0.3)] hover:shadow-[0_25px_50px_rgba(255,145,90,0.4)] transition-all duration-500"
          >
            <span className="flex items-center gap-4 font-headline text-xs font-extrabold uppercase tracking-widest">
              Launch Practice Hub
              <Icon name="ms:psychology_alt" size={24} className="group-hover:rotate-12 transition-transform" />
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
        {/* Active Drives Table */}
        <div className="xl:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white flex items-center gap-4 uppercase">
              <Icon name="ms:rocket_launch" size={24} className="text-primary" />
              Active Placement Missions
            </h2>
            <button 
              onClick={() => navigate('/student/drives')}
              className="text-[11px] font-extrabold text-primary hover:text-white transition-all uppercase tracking-[0.22em] flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-primary/5"
            >
              Access Satellite Feed
              <Icon name="ms:arrow_forward" size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="bg-surface-container-high/40 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/10">
            {isLoading ? (
              <div className="p-32 text-center">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-[0_0_20px_rgba(255,145,90,0.2)]"></div>
                <p className="font-headline text-xs font-extrabold text-on-surface-variant uppercase tracking-[0.4em] animate-pulse">Syncing Mission Log...</p>
              </div>
            ) : activeDrives.length > 0 ? (
              <div className="overflow-x-auto px-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/5">
                      <th className="pl-12 pr-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Target Entity</th>
                      <th className="px-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Entry Criteria</th>
                      <th className="px-6 py-8 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Established</th>
                      <th className="pl-6 pr-12 py-8 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {activeDrives.map((drive) => (
                      <tr key={drive.id} className="hover:bg-primary/5 transition-all duration-700 group">
                        <td className="pl-12 pr-6 py-10">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-white border border-outline-variant/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                              <span className="text-xl font-headline font-extrabold text-primary">{drive.companyName.charAt(0)}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-base font-headline font-extrabold text-white tracking-tight leading-none">{drive.companyName}</p>
                              <p className="text-[10px] text-on-surface-variant font-bold tracking-widest opacity-40 uppercase">Class-S Deployment</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-10">
                          <span className="px-4 py-2 rounded-xl bg-surface-container-highest/60 border border-outline-variant/10 text-[11px] font-extrabold text-white tracking-wider">
                            CGPA {'>'} {drive.minCgpa}
                          </span>
                        </td>
                        <td className="px-6 py-10">
                          <p className="text-[13px] text-on-surface-variant font-medium tabular-nums opacity-60 italic">
                            {new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="pl-6 pr-12 py-10 text-right">
                          <Button 
                            onClick={() => handleInitializeMock(drive.id)}
                            variant="primary"
                            className="h-12 px-8 rounded-xl text-[10px] font-extrabold uppercase tracking-widest group-hover:shadow-[0_0_20px_rgba(255,145,90,0.3)]"
                          >
                            Execute Mission
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-32 text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center mx-auto border border-outline-variant/10">
                  <Icon name="ms:nearby_error" size={40} className="text-on-surface-variant opacity-20" />
                </div>
                <p className="font-headline text-sm font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">No Signal Detected</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status / Log */}
        <div className="space-y-10">
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-white flex items-center gap-4 uppercase">
            <Icon name="ms:terminal" size={20} className="text-primary" />
            Neural Status
          </h2>
          <div className="bg-surface-container-high/40 backdrop-blur-2xl rounded-[3rem] p-10 space-y-10 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-surface-container-highest/40 border border-outline-variant/5 shadow-inner">
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-extrabold text-white uppercase tracking-[0.2em]">Neural Link Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-on-surface-variant font-medium opacity-60 tabular-nums">Signal Integrity 98.4%</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Process Feed</p>
                <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" />
              </div>
              <div className="space-y-5">
                {[
                  { time: '04:22', tag: 'SYNC', msg: 'Profile metadata updated', color: 'text-primary' },
                  { time: '12:05', tag: 'DATA', msg: `${activeDrives.length} entities tracked`, color: 'text-white' },
                  { time: '22:15', tag: 'AUTH', msg: 'Neural key refreshed', color: 'text-on-surface-variant' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 font-body text-[11px] items-start group">
                    <span className="text-on-surface-variant/20 tabular-nums font-bold group-hover:text-primary/40 transition-colors">{item.time}</span>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <span className={`${item.color} font-headline font-extrabold text-[9px] uppercase tracking-widest leading-none`}>[{item.tag}]</span>
                      <span className="text-on-surface-variant leading-relaxed font-medium group-hover:text-white transition-colors">{item.msg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <div className="h-32 rounded-3xl bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop')] bg-cover opacity-10 grayscale brightness-150 rounded-[2.5rem] border border-outline-variant/10 shadow-inner group cursor-crosshair overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <span className="text-[10px] font-extrabold text-white uppercase tracking-[0.5em] animate-pulse">Scanning Neural Pattern...</span>
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