import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { cn } from '../../utils/cn';

const StudentHistoryPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDrives, setExpandedDrives] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('session/history');
        if (data) {
          setHistory(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filters = ['ALL', 'TECHNICAL', 'HR', 'GD', 'SALARY'];

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-on-surface-variant';
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-sky-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const filteredHistory = useMemo(() => {
    return selectedFilter === 'ALL' 
      ? history 
      : history.filter(h => h.sessionType === selectedFilter || (selectedFilter === 'HR' && h.sessionType === 'HR_SALARY'));
  }, [history, selectedFilter]);

  const groupedHistory = useMemo(() => {
    const grouped = filteredHistory.reduce((acc, session) => {
      const driveId = session.driveId || 'unlinked';
      const companyName = session.companyName || 'General Practice';
      
      if (!acc[driveId]) {
        acc[driveId] = {
          id: driveId,
          companyName: companyName,
          sessions: [],
          lastActivity: session.createdAt
        };
      }
      acc[driveId].sessions.push(session);
      
      // Update last activity if this session is newer
      if (new Date(session.createdAt) > new Date(acc[driveId].lastActivity)) {
        acc[driveId].lastActivity = session.createdAt;
      }
      
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }, [filteredHistory]);

  const toggleDrive = (driveId) => {
    setExpandedDrives(prev => ({
      ...prev,
      [driveId]: !prev[driveId]
    }));
  };

  const handleViewReport = (session) => {
    const basePath = session.sessionType === 'GD' ? '/gd/feedback' : '/interview/feedback';
    navigate(`${basePath}/${session.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <span className="text-on-surface-variant">{'>'}</span> MISSION_ARCHIVE
            </h1>
            <p className="text-on-surface-variant font-mono mt-2 text-xs font-label font-medium text-on-surface-variant">
              Historical performance data // Organized by deployment sector
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  "px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase transition-all border",
                  selectedFilter === filter 
                    ? "bg-primary/10 border-emerald-500 text-emerald-500" 
                    : "text-on-surface-variant hover:text-slate-300 bg-surface-container-low border-outline-variant/30"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped History List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              <p className="font-mono text-[10px] text-on-surface-variant animate-pulse font-label font-medium text-on-surface-variant">
                Decrypting_Historical_Archives...
              </p>
            </div>
          ) : groupedHistory.length > 0 ? (
            groupedHistory.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="bg-surface-container-low/20 border border-outline-variant/30 overflow-hidden"
              >
                {/* Group Header */}
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-container-low/30 transition-colors"
                  onClick={() => toggleDrive(group.id)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-surface-container-low border border-outline-variant/30 flex items-center justify-center">
                      <Icon name="Briefcase" size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-on-surface">{group.companyName}</h3>
                      <p className="font-mono text-[9px] text-on-surface-variant mt-0.5 font-label font-medium text-on-surface-variant">
                        {group.sessions.length} DEPLOYMENT{group.sessions.length > 1 ? 'S' : ''} // LAST_ACT: {new Date(group.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[8px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">Mean_Score</p>
                      <p className="text-xs font-mono font-bold text-slate-300">
                        {Math.round(group.sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / group.sessions.length)}%
                      </p>
                    </div>
                    <Icon 
                      name={expandedDrives[group.id] ? "ChevronUp" : "ChevronDown"} 
                      size={16} 
                      className="text-on-surface-variant" 
                    />
                  </div>
                </div>

                {/* Group Sessions (Expandable) */}
                <AnimatePresence>
                  {expandedDrives[group.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-outline-variant/30/50 bg-surface-container-low/30"
                    >
                      <div className="divide-y divide-slate-800/30">
                        {group.sessions.map((session) => (
                          <div key={session.id} className="p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-full border flex items-center justify-center shrink-0",
                                session.sessionType === 'TECHNICAL' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
                                session.sessionType === 'GD' ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                                "border-sky-500/20 text-sky-500 bg-sky-500/5"
                              )}>
                                <Icon 
                                  name={session.sessionType === 'TECHNICAL' ? 'Code' : session.sessionType === 'GD' ? 'Users' : 'User'} 
                                  size={14} 
                                />
                              </div>
                              <div>
                                <p className="font-mono text-[10px] font-bold text-slate-300 font-label font-medium text-on-surface-variant">{session.sessionType.replace('_', ' ')}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="font-mono text-[8px] text-on-surface-variant">ID: {session.id.slice(0, 8)}</span>
                                  <span className="w-0.5 h-0.5 rounded-full bg-surface-container-low" />
                                  <span className="font-mono text-[8px] text-on-surface-variant">{new Date(session.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-8">
                              <div className="text-right">
                                <p className="text-[8px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">Score</p>
                                <p className={cn("text-lg font-mono font-bold", getScoreColor(session.overallScore))}>
                                  {session.status === 'completed' ? `${session.overallScore}%` : 'PENDING'}
                                </p>
                              </div>
                              <Button 
                                onClick={() => handleViewReport(session)}
                                className="h-8 px-4 text-[9px] font-mono bg-surface-container-low border border-outline-variant/30 hover:border-emerald-500/50 hover:text-emerald-400 transition-all font-label font-medium text-on-surface-variant"
                              >
                                ANALYSIS_LOG
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-outline-variant/30 bg-surface-container-low/10">
              <Icon name="SearchX" size={40} className="mx-auto text-slate-700 mb-4" />
              <p className="font-mono text-[10px] text-on-surface-variant font-label font-medium text-on-surface-variant">No matching mission logs detected in database</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentHistoryPage;
