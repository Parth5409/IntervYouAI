import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
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
    { label: 'INTERVIEWS_COMPLETED', value: '12', icon: 'CheckCircle', color: 'text-emerald-500' },
    { label: 'AVG_READINESS_SCORE', value: '84%', icon: 'Activity', color: 'text-sky-500' },
    { label: 'PENDING_DRIVES', value: activeDrives.length.toString().padStart(2, '0'), icon: 'Clock', color: 'text-amber-500' },
    { label: 'GLOBAL_RANKING', value: '#124', icon: 'Trophy', color: 'text-purple-500' },
  ];

  const handleInitializeMock = (driveId) => {
    navigate(`/interview/mission/${driveId}`, { state: { driveId } });
  };

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
              Welcome back, agent {user?.fullName?.split(' ')[0]} // Ident verified // {user?.organizationName || 'GLOBAL_SECTOR'}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/interview/setup')}
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
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-slate-100">
                <Icon name="Briefcase" size={16} className="text-emerald-500" />
                Active_Placement_Drives
              </h2>
              <button 
                onClick={() => navigate('/student/drives')}
                className="text-[10px] font-mono text-slate-500 hover:text-emerald-500 transition-colors uppercase tracking-widest"
              >
                VIEW_ALL_MISSIONS__{'>'}
              </button>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center font-mono text-xs text-slate-500 animate-pulse uppercase tracking-[0.2em]">
                  Scanning_Network_For_Drives...
                </div>
              ) : activeDrives.length > 0 ? (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50">
                      <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Entity</th>
                      <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Eligibility</th>
                      <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter">Created</th>
                      <th className="px-6 py-4 text-slate-500 uppercase tracking-tighter text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {activeDrives.map((drive) => (
                      <tr key={drive.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-200">{drive.companyName}</td>
                        <td className="px-6 py-4 text-slate-400">CGPA {'>'} {drive.minCgpa}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(drive.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleInitializeMock(drive.id)}
                            className="text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4"
                          >
                            INITIALIZE_MOCK
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center font-mono text-xs text-slate-500 uppercase tracking-widest">
                  No_Active_Drives_Found_In_Your_Sector
                </div>
              )}
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
                <span className="text-slate-600">[{new Date().toISOString().slice(0, 19).replace('T', ' ')}]</span>
                <span className="text-emerald-500">SUCCESS:</span>
                <span className="text-slate-400">Session_Token_Validated</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-600">[{new Date(Date.now() - 3600000).toISOString().slice(0, 19).replace('T', ' ')}]</span>
                <span className="text-sky-500">INFO:</span>
                <span className="text-slate-400">Syncing_Organization_Metadata...</span>
              </div>
              {activeDrives.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-slate-600">[{new Date().toISOString().slice(0, 10)}]</span>
                  <span className="text-purple-500">EVENT:</span>
                  <span className="text-slate-400">{activeDrives.length} drives detected in perimeter</span>
                </div>
              )}
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