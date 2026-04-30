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
    { label: 'Active TPOs', value: dashboardStats?.activeTpos || '0', icon: 'ms:hub', trend: 'Nodes Online' },
    { label: 'Total Storage', value: dashboardStats?.totalData || '0GB', icon: 'ms:database', trend: 'Verified' },
    { label: 'System Uptime', value: dashboardStats?.uptime || '0%', icon: 'ms:memory', trend: 'Stable' },
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-outline/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-[2px] bg-primary rounded-full"></span>
              <span className="text-xs font-label font-bold text-primary italic">Admin Console</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-on-surface leading-tight italic">
              Good {getTimeOfDay()}, <br />
              <span className="text-primary italic">Administrator.</span>
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">
              Administrative access granted. You are operating from <span className="text-on-surface font-semibold">{user?.organizationName || 'Root Console'}</span>. All systems are functioning correctly.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/tpo')}
              className="h-16 px-8 rounded-xl group border-outline-variant/30"
            >
              <span className="flex items-center gap-3 font-headline font-semibold text-sm">
                Manage TPOs
                <Icon name="ms:account_tree" size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button 
              onClick={() => navigate('/admin/system')}
              className="h-16 px-8 rounded-xl group shadow-sm"
            >
              <span className="flex items-center gap-3 font-headline font-semibold text-sm">
                System Config
                <Icon name="ms:settings_suggest" size={20} className="group-hover:rotate-45 transition-transform" />
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
              className="bg-surface-container-low/30 border border-outline-variant/30 rounded-2xl p-8 group hover:bg-surface-bright transition-all duration-500 relative overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-outline/10">
                  <Icon name={stat.icon} size={24} />
                </div>
                <span className="text-xs font-label font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{stat.trend}</span>
              </div>
              <div>
                <p className="text-xs font-label font-semibold text-on-surface-variant mb-2 opacity-70">{stat.label}</p>
                <p className="text-4xl font-headline font-bold text-on-surface italic">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
          {/* Recent Activity */}
          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <Icon name="ms:history" size={24} className="text-primary" />
              Activity Logs
            </h2>
            <div className="bg-surface-container-low/30 border border-outline-variant/30 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center border border-outline/20">
                <Icon name="ms:search" size={32} className="text-on-surface-variant opacity-30" />
              </div>
              <div>
                <p className="font-headline text-lg font-bold text-on-surface">No Recent Activity</p>
                <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-xs mx-auto leading-relaxed italic opacity-60">System is idle. Activity metrics will appear here as they occur on the network.</p>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary hover:bg-primary/10 h-11 px-8 rounded-xl border border-primary/20 text-xs font-headline font-bold"
              >
                Refresh Feed
              </Button>
            </div>
          </div>

          {/* System Integrity */}
          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <Icon name="ms:health_metrics" size={24} className="text-primary" />
              Live Pulse
            </h2>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 space-y-6 shadow-sm">
              {[
                { service: 'Authentication Gateway', status: 'OPERATIONAL', latency: '12ms' },
                { service: 'Intelligence Engine', status: 'OPERATIONAL', latency: '840ms' },
                { service: 'Data Analytics', status: 'SYNCING', latency: '2ms' },
                { service: 'Frontend Interface', status: 'OPERATIONAL', latency: '5ms' },
              ].map((s) => (
                <div key={s.service} className="flex items-center justify-between p-5 rounded-2xl bg-surface-container-low/50 border border-outline/20 hover:bg-surface-container-low transition-all">
                  <div className="flex flex-col">
                    <span className="text-sm font-headline font-bold text-on-surface">{s.service}</span>
                    <span className="text-xs text-on-surface-variant font-medium mt-1 opacity-60">Latency: {s.latency}</span>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider",
                    s.status === 'OPERATIONAL' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
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