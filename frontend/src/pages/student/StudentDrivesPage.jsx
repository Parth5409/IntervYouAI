import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const StudentDrivesPage = () => {
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

  const handleInitializeMock = (driveId) => {
    navigate(`/interview/mission/${driveId}`, { state: { driveId } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3 text-on-surface">
              <span className="text-emerald-500">{'>'}</span> PLACEMENT_DRIVES
            </h1>
            <p className="text-on-surface-variant font-mono mt-2 text-xs font-label font-medium text-on-surface-variant">
              Scan detected active recruitment cycles // Eligible protocols only
            </p>
          </div>
          <Button 
            onClick={() => navigate('/interview/setup')}
            className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 font-mono text-[10px] h-10 px-6 font-label font-medium text-on-surface-variant"
          >
            START_NEW_INTERVIEW <Icon name="Plus" size={14} className="ml-2" />
          </Button>
        </div>

        {/* Drives List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] font-bold text-on-surface-variant flex items-center gap-2 font-label font-medium text-on-surface-variant">
              <div className="w-1.5 h-1.5 bg-emerald-500" />
              AVAILABLE_MISSIONS
            </h2>
            <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-1 border border-outline-variant/30">
              COUNT: {activeDrives.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="p-20 text-center border border-outline-variant/30 bg-surface-container-low/20">
                <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-[10px] text-on-surface-variant animate-pulse font-label font-medium text-on-surface-variant">
                  Decrypting_Drive_Metadata...
                </p>
              </div>
            ) : activeDrives.length > 0 ? (
              activeDrives.map((drive, index) => (
                <motion.div
                  key={drive.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-surface-container-low/40 border border-outline-variant/30 hover:border-emerald-500/30 transition-all p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-surface-container-low border border-outline-variant/30 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                        <Icon name="Briefcase" size={24} className="text-on-surface-variant group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-mono font-bold text-on-surface group-hover:text-emerald-400 transition-colors">
                          {drive.companyName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-label font-medium text-on-surface-variant">
                            <Icon name="User" size={10} /> {drive.jobRole || 'SDE_PROTOCOL'}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 font-label font-medium text-on-surface-variant">
                            <Icon name="Target" size={10} /> CGPA_ELIGIBILITY: {drive.minCgpa}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-mono text-on-surface-variant mb-1 font-label font-medium text-on-surface-variant">DATE_PUBLISHED</p>
                        <p className="text-[10px] font-mono text-on-surface-variant">{new Date(drive.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button
                        onClick={() => handleInitializeMock(drive.id)}
                        className="bg-surface-container-low border border-outline-variant/30 hover:border-emerald-500 text-emerald-500 font-mono text-[10px] h-10 px-6 font-label font-medium text-on-surface-variant"
                      >
                        INITIALIZE_MOCK
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low/10">
                <Icon name="Search" size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="font-mono text-[10px] text-on-surface-variant font-label font-medium text-on-surface-variant">
                  No_Active_Drives_Detected // Perimeter_Secure
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDrivesPage;
