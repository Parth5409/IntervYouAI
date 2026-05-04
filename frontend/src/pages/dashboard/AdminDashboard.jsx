import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import api from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('analytics/admin-overview');
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Active TPOs', value: dashboardStats?.activeTpos || '0', icon: 'ms:hub', trend: 'TPOs Active' },
    { label: 'Total Storage', value: dashboardStats?.totalData || '0GB', icon: 'ms:database', trend: 'Secure' },
    { label: 'System Uptime', value: dashboardStats?.uptime || '0%', icon: 'ms:memory', trend: 'Stable' },
    { label: 'Active Licenses', value: dashboardStats?.activeLicenses || '0', icon: 'ms:verified', trend: 'Active' },
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
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Admin Dashboard</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-headline font-black tracking-tighter text-white leading-[0.85]">
              Good {getTimeOfDay()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic">Administrator.</span>
            </h1>
            <p className="text-on-surface-variant/80 font-body text-xl leading-relaxed max-w-2xl">
              Access granted. Operating from <span className="text-white font-bold">{user?.organizationName || 'Central Network'}</span>. Monitoring system performance and student progress.
            </p>
          </div>
          <div className="flex gap-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/tpo')}
              className="h-16 px-10 rounded-2xl group border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
            >
              <span className="flex items-center gap-4 font-headline text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Manage TPOs
                <Icon name="ms:account_tree" size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/system')}
              className="bg-white text-black rounded-2xl font-black text-[10px] px-10 py-5 shadow-2xl shadow-primary/20 hover:bg-primary hover:text-white transition-all duration-500 h-16 uppercase tracking-[0.2em]"
            >
              <span className="flex items-center gap-4 font-headline">
                SYSTEM CONFIG
                <Icon name="ms:settings_suggest" size={20} className="group-hover:rotate-45 transition-transform duration-700" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 pt-10">
          {/* Recent Activity */}
          <div className="space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-primary rounded-full" />
              ACTIVITY LOG
            </h2>
            <div className="bg-white/[0.01] rounded-[3rem] border border-white/5 p-16 flex flex-col items-center justify-center text-center space-y-10 shadow-2xl relative overflow-hidden group/activity">
              <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[100px] group-hover/activity:bg-primary/10 transition-all duration-1000" />
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] flex items-center justify-center border border-white/5 shadow-inner group-hover/activity:scale-110 transition-transform duration-700">
                <Icon name="ms:search" size={40} className="text-on-surface-variant/20" />
              </div>
              <div className="space-y-4">
                <p className="font-headline text-2xl font-black text-white tracking-tight uppercase">NO ACTIVITY YET</p>
                <p className="text-sm text-on-surface-variant/40 font-bold max-w-xs mx-auto leading-relaxed italic tracking-widest">The system is currently idle. Activity metrics will appear here as they occur on the network.</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary hover:bg-primary/10 h-14 px-10 rounded-2xl border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
              >
                REFRESH LOG
              </Button>
            </div>
          </div>

          {/* System Integrity */}
          <div className="space-y-12">
            <h2 className="font-headline text-4xl font-black text-white tracking-tighter flex items-center gap-6">
              <div className="w-2 h-10 bg-secondary rounded-full" />
              SYSTEM STATUS
            </h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 space-y-8 shadow-2xl relative overflow-hidden group/pulse">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/pulse:bg-secondary/10 transition-all duration-1000" />
              {[
                { service: 'Authentication Service', status: 'OPERATIONAL', latency: '12ms', color: 'bg-secondary shadow-secondary/50' },
                { service: 'Interview Engine', status: 'OPERATIONAL', latency: '840ms', color: 'bg-secondary shadow-secondary/50' },
                { service: 'Data Analytics', status: 'SYNCING', latency: '2ms', color: 'bg-amber-500 shadow-amber-500/50' },
                { service: 'AI Core', status: 'OPERATIONAL', latency: '5ms', color: 'bg-secondary shadow-secondary/50' },
              ].map((s, i) => (
                <motion.div 
                  key={s.service} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 1 }}
                  className="flex items-center justify-between p-7 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-secondary/20 transition-all duration-500 relative overflow-hidden group/item"
                >
                   <div className="absolute top-0 left-0 w-1 h-full bg-secondary/20 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-black text-white uppercase tracking-wider">{s.service}</span>
                    <span className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] italic">LATENCY: {s.latency}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-5 py-2 rounded-xl text-[9px] font-black tracking-[0.2em] border transition-all duration-500 shadow-xl",
                      s.status === 'OPERATIONAL' ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {s.status}
                    </span>
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", s.color)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;