import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
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
    { label: 'TOTAL_STUDENTS', value: dashboardStats?.totalStudents || '0', icon: 'Users', color: 'text-sky-500' },
    { label: 'PLACED_PERCENTAGE', value: dashboardStats?.placedPercentage || '0%', icon: 'Trophy', color: 'text-emerald-500' },
    { label: 'ACTIVE_DRIVES', value: dashboardStats?.activeDrives || '0', icon: 'Briefcase', color: 'text-amber-500' },
    { label: 'READINESS_INDEX', value: dashboardStats?.readinessIndex || '0.0', icon: 'Activity', color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> TPO_MANAGEMENT_CONSOLE
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Institutional Access // {user?.organizationName} // Secure Node 01
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/tpo/students')}
              className="border-slate-700 text-slate-200"
            >
              BULK_IMPORT_STUDENTS <Icon name="Upload" size={16} className="ml-2" />
            </Button>
            <Button 
              onClick={() => navigate('/tpo/drives')}
              className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            >
              CREATE_NEW_DRIVE <Icon name="Plus" size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <Icon name={stat.icon} size={16} className="text-slate-600" />
              </div>
              <p className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Placement Management */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="BarChart3" size={16} className="text-emerald-500" />
              Placement_Performance_Registry
            </h2>
            <div className="bg-slate-900/50 border border-slate-800">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Corporation</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Status</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Eligibility</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter text-right">Created_At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {isLoading ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 animate-pulse">SYNCING_REGISTRY...</td></tr>
                  ) : recentDrives.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">NO_ACTIVE_DRIVES</td></tr>
                  ) : (
                    recentDrives.slice(0, 5).map((drive) => (
                      <tr key={drive.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">{drive.companyName}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 border text-[10px] font-bold uppercase",
                            drive.status === 'ACTIVE' ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" :
                            drive.status === 'DRAFT' ? "border-amber-500/50 text-amber-500 bg-amber-500/5" :
                            "border-slate-700 text-slate-500 bg-slate-800/50"
                          )}>
                            {drive.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{drive.minCgpa} MIN_CGPA</td>
                        <td className="px-6 py-4 text-right font-bold text-sky-400">
                          {new Date(drive.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departmental Readiness */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="PieChart" size={16} className="text-sky-500" />
              Departmental_Heatmap
            </h2>
            <div className="bg-slate-900/50 border border-slate-800 p-6 space-y-6">
              {[
                { dept: 'CS_ENGINEERING', val: 88, color: 'bg-emerald-500' },
                { dept: 'IT_ENGINEERING', val: 72, color: 'bg-sky-500' },
                { dept: 'ENTC_ENGINEERING', val: 45, color: 'bg-amber-500' },
                { dept: 'MECHANICAL', val: 32, color: 'bg-slate-700' },
              ].map((d) => (
                <div key={d.dept} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{d.dept}</span>
                    <span className="text-slate-200">{d.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${d.val}%` }}
                      className={`h-full ${d.color}`}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed italic">
                  * Readiness index calculated based on technical accuracy, mock interview frequency, and communication metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TpoDashboard;