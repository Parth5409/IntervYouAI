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
    { label: 'Active Drives', value: activeDrives.length.toString().padStart(2, '0'), icon: 'ms:rocket_launch', trend: '3 expiring soon' },
    { label: 'Global Ranking', value: '#124', icon: 'ms:trophy', trend: 'Up 12 places' },
  ];

  const handleInitializeMock = (driveId) => {
    navigate(`/interview/details/${driveId}`, { state: { driveId } });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-16 animate-in fade-in duration-1000 slide-in-from-bottom-5 relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-white/5 relative">
          <div className="space-y-8 max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-[1px] bg-gradient-to-r from-primary to-transparent"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Student Portal</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-white leading-[0.85]"
            >
              Good {getTimeOfDay()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic pr-4">{user?.fullName?.split(' ')[0]}.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-on-surface-variant/80 font-body text-xl leading-relaxed max-w-2xl"
            >
              Welcome back. You have <span className="text-white font-bold">{activeDrives.length} active placement drives</span> to explore. Ready to start practicing?
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-6"
          >
            <Button 
              onClick={() => navigate('/interview/setup')}
              className="h-20 px-12 rounded-[2rem] group shadow-2xl transition-all duration-700 bg-white text-black hover:bg-primary hover:text-white font-black overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="flex items-center gap-4 font-headline text-sm relative z-10 uppercase tracking-widest">
                START PRACTICE
                <Icon name="ms:rocket_launch" size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
              </span>
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              className="group relative p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-700 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all duration-500 border border-white/5 shadow-inner">
                  <Icon name={stat.icon} size={32} />
                </div>
                <span className="text-[10px] font-black text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 group-hover:text-primary transition-colors">{stat.label}</p>
                <p className="text-6xl font-headline font-black text-white italic tracking-tighter group-hover:translate-x-2 transition-transform duration-700">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pt-10">
          {/* Active Drives Table */}
          <div className="xl:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
                <div className="w-2 h-10 bg-primary rounded-full" />
                ACTIVE DRIVES
              </h2>
              <button 
                onClick={() => navigate('/student/drives')}
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
              ) : activeDrives.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="pl-8 pr-4 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Company</th>
                        <th className="px-4 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Eligibility</th>
                        <th className="px-4 py-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Date</th>
                        <th className="pl-4 pr-8 py-8 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {activeDrives.map((drive, i) => (
                        <motion.tr 
                          key={drive.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 1 }}
                          className="hover:bg-white/[0.02] transition-all duration-500 group"
                        >
                          <td className="pl-8 pr-4 py-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 group-hover:border-primary/40 transition-all duration-700">
                                <span className="text-2xl font-headline font-black text-primary italic">{drive.companyName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-xl font-headline font-black text-white leading-none tracking-tight">{drive.companyName}</p>
                                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-2 italic">FULL STACK DEVELOPER</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-10">
                            <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest group-hover:border-primary/20 transition-all min-h-[2rem]">
                              CGPA {'>'} {drive.minCgpa}
                            </span>
                          </td>
                          <td className="px-4 py-10">
                            <p className="text-xs text-on-surface-variant/40 font-bold italic font-mono uppercase">
                              {new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="pl-4 pr-6 py-10 text-right">
                            <Button 
                              onClick={() => handleInitializeMock(drive.id)}
                              className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 group/btn"
                            >
                              START PRACTICE
                              <Icon name="ms:bolt" size={16} className="ml-2 group-hover/btn:animate-pulse" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-40 text-center space-y-8">
                  <div className="w-24 h-24 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                    <Icon name="ms:nearby_error" size={48} className="text-on-surface-variant/20" />
                  </div>
                  <p className="font-headline text-xl font-black text-on-surface-variant/40 italic uppercase tracking-[0.3em]">No drives found</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status / Log */}
          <div className="space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              RECENT ACTIVITY
            </h2>
            <div className="bg-white/[0.02] rounded-[3rem] p-12 space-y-12 border border-white/5 shadow-2xl relative overflow-hidden group/log">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/log:bg-secondary/10 transition-all duration-1000" />
              
              <div className="flex items-center gap-8 p-8 rounded-[2rem] bg-white/5 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
                <div className="w-4 h-4 rounded-full bg-secondary animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">SYSTEM STATUS</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-black italic tracking-tight uppercase">ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.4em]">ACTIVITY FEED</p>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce" />
                  </div>
                </div>
                <div className="space-y-8">
                  {[
                    { time: '04:22', tag: 'SYNC', msg: 'Profile updated', color: 'text-primary' },
                    { time: '12:05', tag: 'DRIVE', msg: 'New drive available', color: 'text-white' },
                    { time: '22:15', tag: 'AUTH', msg: 'System ready', color: 'text-secondary' }
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 + 1.5 }}
                      className="flex gap-8 font-body text-xs items-start group"
                    >
                      <span className="text-on-surface-variant/20 font-black tracking-widest group-hover:text-primary transition-colors">{item.time}</span>
                      <div className="flex flex-col gap-2 flex-1">
                        <span className={`${item.color} font-headline font-black text-[10px] italic leading-none tracking-[0.2em]`}>[{item.tag}]</span>
                        <span className="text-on-surface-variant/60 leading-relaxed font-bold tracking-tight group-hover:text-white transition-colors">{item.msg}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-10">
                <div className="h-44 rounded-[2.5rem] bg-white/[0.03] border border-white/5 shadow-inner overflow-hidden relative group/viz">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)] animate-pulse" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="flex gap-1.5 h-12 items-center">
                        {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((h, i) => (
                          <motion.div 
                            key={i}
                            animate={{ height: [h*4, h*8, h*4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1.5 bg-primary/20 rounded-full"
                          />
                        ))}
                     </div>
                   </div>
                   <div className="absolute bottom-4 left-0 w-full text-center">
                      <span className="text-[8px] font-black text-on-surface-variant/20 uppercase tracking-[0.5em]">READY</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;