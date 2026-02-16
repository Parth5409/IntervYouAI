import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'INTERVIEWS_COMPLETED', value: '12', icon: 'CheckCircle', color: 'text-emerald-500' },
    { label: 'AVG_READINESS_SCORE', value: '84%', icon: 'Activity', color: 'text-sky-500' },
    { label: 'PENDING_DRIVES', value: '03', icon: 'Clock', color: 'text-amber-500' },
    { label: 'GLOBAL_RANKING', value: '#124', icon: 'Trophy', color: 'text-purple-500' },
  ];

  const activeDrives = [
    { id: 1, company: 'GOOGLE', role: 'SDE_INTERN', date: '2026-02-20', eligibility: 'CGPA > 8.5' },
    { id: 2, company: 'TCS', role: 'DIGITAL_NINJA', date: '2026-02-22', eligibility: 'ALL_ELIGIBLE' },
    { id: 3, company: 'ACCENTURE', role: 'ASE', date: '2026-02-25', eligibility: 'CGPA > 7.0' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> COMMAND_CENTER
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Welcome back, agent {user?.fullName?.split(' ')[0]} // Identification verified
            </p>
          </div>
          <Button 
            onClick={() => navigate('/interview-setup-wizard')}
            className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
          >
            START_NEW_INTERVIEW <Icon name="Play" size={16} className="ml-2" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 group hover:border-slate-700 transition-colors relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon name={stat.icon} size={48} />
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
              <div className="mt-4 h-1 w-full bg-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  className={`h-full ${stat.color.replace('text', 'bg')}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Drives Table */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="Briefcase" size={16} className="text-emerald-500" />
              Active_Placement_Drives
            </h2>
            <div className="bg-slate-900/50 border border-slate-800 overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Entity</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Designation</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Deadline</th>
                    <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {activeDrives.map((drive) => (
                    <tr key={drive.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-200">{drive.company}</td>
                      <td className="px-6 py-4 text-slate-400">{drive.role}</td>
                      <td className="px-6 py-4 text-slate-500">{drive.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4">
                          INITIALIZE_MOCK
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Log / Recent Activity */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Icon name="Terminal" size={16} className="text-sky-500" />
              System_Log
            </h2>
            <div className="bg-slate-950 border border-slate-800 p-4 font-mono text-[10px] space-y-3 h-[300px] overflow-y-auto custom-scrollbar">
              <div className="flex gap-2">
                <span className="text-slate-600">[2026-02-15 22:14:01]</span>
                <span className="text-emerald-500">SUCCESS:</span>
                <span className="text-slate-400">Profile synchronized with Organization_DB</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-600">[2026-02-15 22:15:45]</span>
                <span className="text-sky-500">INFO:</span>
                <span className="text-slate-400">New placement drive assigned: GOOGLE_SDE</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-600">[2026-02-15 22:30:12]</span>
                <span className="text-amber-500">WARN:</span>
                <span className="text-slate-400">Readiness score for PYTHON below threshold (65%)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-600">[2026-02-15 23:05:00]</span>
                <span className="text-purple-500">EVENT:</span>
                <span className="text-slate-400">Interview feedback generated for TCS_MOCK_01</span>
              </div>
              <div className="flex gap-2 animate-pulse">
                <span className="text-slate-600">[{'>'}]</span>
                <span className="text-slate-400">Waiting for system input...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;