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
    { label: 'Network Nodes', value: dashboardStats?.activeTpos || '0', icon: 'ms:hub', trend: 'Nodes Online' },
    { label: 'Data Aggregate', value: dashboardStats?.totalData || '0GB', icon: 'ms:database', trend: 'Encrypted' },
    { label: 'Process Uptime', value: dashboardStats?.uptime || '0%', icon: 'ms:memory', trend: 'Stable' },
    { label: 'Active Licenses', value: dashboardStats?.activeLicenses || '0', icon: 'ms:verified', trend: 'Verified' },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-outline-variant/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-[1px] bg-sky-500"></span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-sky-500 uppercase">Root Repository</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight text-white leading-tight">
              Good {getTimeOfDay()}, <br />
              <span className="text-sky-400 italic">Architect.</span>
            </h1>
            <p className="text-on-surface-variant font-body text-sm max-w-xl leading-relaxed">
              Global sector access verified. You are operating from <span className="text-white font-bold">{user?.organizationName || 'Root Node'}</span>. All subsystems are currently <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Operational</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/tpo')}
              className="h-16 px-8 rounded-2xl group border-outline-variant"
            >
              <span className="flex items-center gap-3 uppercase tracking-widest text-[10px] font-bold">
                Nodes Management
                <Icon name="ms:account_tree" size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/system')}
              variant="primary"
              className="h-16 px-8 rounded-2xl group bg-sky-600 hover:bg-sky-500 text-white"
            >
              <span className="flex items-center gap-3 uppercase tracking-widest text-[10px] font-bold">
                System Config
                <Icon name="ms:settings_suggest" size={20} className="group-hover:rotate-45 transition-transform" />
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card p-8 rounded-[2rem] group hover:bg-surface-container-high transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-sm border border-outline-variant/10">
                  <Icon name={stat.icon} size={24} />
                </div>
                <span className="text-[9px] font-bold text-sky-400 px-2 py-1 bg-sky-400/10 rounded-full">{stat.trend}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-4xl font-headline font-extrabold text-white tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
          {/* Recent Activity / Table Placeholder */}
          <div className="space-y-8">
            <h2 className="font-headline text-xl font-bold tracking-tight text-white flex items-center gap-3 uppercase">
              <Icon name="ms:history" size={20} className="text-sky-500" />
              Recent Activity Logs
            </h2>
            <div className="glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
                <Icon name="ms:search" size={32} className="text-on-surface-variant opacity-40" />
              </div>
              <div>
                <p className="font-headline text-sm font-bold text-white uppercase tracking-[0.2em]">Activity Registry Idle</p>
                <p className="text-[11px] text-on-surface-variant font-medium mt-2 max-w-xs mx-auto leading-relaxed">Execute a fetch command to retrieve real-time activity metrics from the network.</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-sky-500 hover:bg-sky-500/10 h-10 px-6 rounded-xl border border-sky-500/20 text-[10px] font-bold tracking-[0.2em]"
              >
                EXECUTE_FETCH_CMD
              </Button>
            </div>
          </div>

          {/* System Integrity */}
          <div className="space-y-8">
            <h2 className="font-headline text-xl font-bold tracking-tight text-white flex items-center gap-3 uppercase">
              <Icon name="ms:health_metrics" size={20} className="text-emerald-500" />
              Subsystem Integrity
            </h2>
            <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
              {[
                { service: 'AUTH_GATEWAY', status: 'OPERATIONAL', latency: '12ms' },
                { service: 'NEURAL_ENGINE', status: 'OPERATIONAL', latency: '840ms' },
                { service: 'DATA_WAREHOUSE', status: 'SYNCING', latency: '2ms' },
                { service: 'UI_RENDER_NODE', status: 'OPERATIONAL', latency: '5ms' },
              ].map((s) => (
                <div key={s.service} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/30 border border-outline-variant/10 hover:bg-surface-container-high transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">{s.service}</span>
                    <span className="text-[11px] text-on-surface-variant font-medium mt-1">Latency: {s.latency}</span>
                  </div>
                  <span className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest",
                    s.status === 'OPERATIONAL' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  )}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;