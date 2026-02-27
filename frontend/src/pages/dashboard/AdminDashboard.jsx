import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
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
    { label: 'ACTIVE_TPO_NODES', value: dashboardStats?.activeTpos || '0', icon: 'UserPlus', color: 'text-sky-500' },
    { label: 'TOTAL_ORGANIZATION_DATA', value: dashboardStats?.totalData || '0GB', icon: 'Database', color: 'text-emerald-500' },
    { label: 'SYSTEM_UPTIME', value: dashboardStats?.uptime || '0%', icon: 'Cpu', color: 'text-amber-500' },
    { label: 'ACTIVE_LICENSES', value: dashboardStats?.activeLicenses || '0', icon: 'ShieldCheck', color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> ROOT_ADMIN_DASHBOARD
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Organization Control // {user?.organizationName} // Level 0 Access
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/admin/tpo')}
              className="border-slate-700 text-slate-200"
            >
              MANAGE_TPO_ACCOUNTS <Icon name="Users" size={16} className="ml-2" />
            </Button>
            <Button 
              onClick={() => navigate('/admin/system')}
              className="bg-sky-500 text-slate-950 font-bold hover:bg-sky-400"
            >
              SYSTEM_CONFIGURATION <Icon name="Settings" size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 group hover:border-sky-500/50 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name={stat.icon} size={48} />
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
              <div className="mt-4 flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 ${i < 7 ? stat.color.replace('text', 'bg') : 'bg-slate-800'}`} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TPO Management Table */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="Users" size={16} className="text-sky-500" />
              TPO_Activity_Registry
            </h2>
            <div className="bg-slate-900/50 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
              <Icon name="Search" size={32} className="text-slate-700 mb-4" />
              <p className="text-xs font-mono text-slate-500 uppercase">Initialize query to view TPO activity logs</p>
              <Button variant="ghost" className="mt-4 text-sky-500 hover:text-sky-400 font-mono text-[10px]">EXECUTE_FETCH_CMD</Button>
            </div>
          </div>

          {/* System Health */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="Activity" size={16} className="text-emerald-500" />
              Global_System_Integrity
            </h2>
            <div className="bg-slate-950 border border-slate-800 p-6 space-y-4">
              {[
                { service: 'AUTH_SERVICE', status: 'OPERATIONAL', latency: '12ms' },
                { service: 'AI_ENGINE_FLASH', status: 'OPERATIONAL', latency: '840ms' },
                { service: 'KAFKA_CLUSTER', status: 'SYNCING', latency: '2ms' },
                { service: 'POSTGRES_DB_NODE', status: 'OPERATIONAL', latency: '5ms' },
              ].map((s) => (
                <div key={s.service} className="flex items-center justify-between border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-200">{s.service}</span>
                    <span className="text-[8px] font-mono text-slate-500">Latency: {s.latency}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 font-mono text-[8px] font-bold border",
                    s.status === 'OPERATIONAL' ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5" : "text-amber-500 border-amber-500/30 bg-amber-500/5"
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