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
    navigate(`/interview/details/${driveId}`, { state: { driveId } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3 text-on-surface">
              <span className="text-secondary">{'>'}</span> INTERVIEW DRIVES
            </h1>
            <p className="text-on-surface-variant font-mono mt-2 text-xs font-label font-medium text-on-surface-variant">
              Active recruitment drives you are eligible for
            </p>
          </div>
          <Button 
            onClick={() => navigate('/interview/setup')}
            className="bg-primary text-white font-bold hover:bg-primary/80 font-headline text-xs h-12 px-8 rounded-xl shadow-lg"
          >
            START PRACTICE <Icon name="Plus" size={16} className="ml-2" />
          </Button>
        </div>

        {/* Drives List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xs font-black text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-primary" />
              AVAILABLE DRIVES
            </h2>
            <span className="font-headline text-[10px] text-on-surface-variant bg-white/5 px-3 py-1 border border-white/5 rounded-full uppercase tracking-widest font-bold">
              COUNT: {activeDrives.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="p-20 text-center border border-white/5 bg-white/[0.02] rounded-3xl">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="font-headline text-[10px] text-on-surface-variant animate-pulse uppercase tracking-widest font-black">
                  Loading drives...
                </p>
              </div>
            ) : activeDrives.length > 0 ? (
              activeDrives.map((drive, index) => (
                <motion.div
                  key={drive.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all p-8 rounded-3xl relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 rounded-2xl group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 shadow-inner">
                        <Icon name="Briefcase" size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-xl font-headline font-black text-white group-hover:text-primary transition-colors italic tracking-tight">
                          {drive.companyName}
                        </h3>
                        <div className="flex items-center gap-6 mt-3">
                          <span className="text-[10px] font-headline text-on-surface-variant flex items-center gap-2 uppercase tracking-widest font-black">
                            <Icon name="User" size={12} className="text-primary" /> {drive.jobRole || 'Software Engineer'}
                          </span>
                          <span className="text-[10px] font-headline text-on-surface-variant flex items-center gap-2 uppercase tracking-widest font-black">
                            <Icon name="Target" size={12} className="text-secondary" /> MIN CGPA: {drive.minCgpa}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-headline text-on-surface-variant/40 mb-1 uppercase tracking-widest font-black italic">DATE</p>
                        <p className="text-[10px] font-headline text-white font-black">{new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <Button
                        onClick={() => handleInitializeMock(drive.id)}
                        className="bg-white text-black hover:bg-primary hover:text-white font-headline text-[10px] font-black h-12 px-8 rounded-xl uppercase tracking-widest transition-all duration-500 shadow-lg"
                      >
                        PREPARE
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low/10">
                <Icon name="Search" size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="font-mono text-[10px] text-on-surface-variant font-label font-medium text-on-surface-variant">
                  No active drives found at this time
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
