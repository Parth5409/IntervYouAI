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
    if (score >= 90) return 'text-secondary';
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
              <span className="text-on-surface-variant">{'>'}</span> INTERVIEW HISTORY
            </h1>
            <p className="text-on-surface-variant font-headline mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
              Review your past interview performance
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={cn(
                  "px-4 py-2 font-headline text-[10px] tracking-[0.2em] font-black uppercase transition-all border rounded-xl",
                  selectedFilter === filter 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "text-on-surface-variant hover:text-white bg-white/5 border-white/5"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped History List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="font-headline text-[10px] text-on-surface-variant animate-pulse font-black uppercase tracking-widest">
                Loading history...
              </p>
            </div>
          ) : groupedHistory.length > 0 ? (
            groupedHistory.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:bg-white/[0.04]"
              >
                {/* Group Header */}
                <div 
                  className="p-8 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleDrive(group.id)}
                >
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl group-hover:border-primary/40 transition-all shadow-inner">
                      <Icon name="Briefcase" size={28} className="text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-white text-xl italic tracking-tight">{group.companyName}</h3>
                      <p className="font-headline text-[10px] text-on-surface-variant mt-2 font-black uppercase tracking-widest opacity-60">
                        {group.sessions.length} INTERVIEW{group.sessions.length > 1 ? 'S' : ''} // LAST ACTIVITY: {new Date(group.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[9px] font-headline text-on-surface-variant/40 font-black uppercase tracking-widest italic">Average Score</p>
                      <p className="text-xl font-headline font-black text-white italic">
                        {Math.round(group.sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / group.sessions.length)}%
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
                      <Icon 
                        name={expandedDrives[group.id] ? "ms:expand_less" : "ms:expand_more"} 
                        size={24} 
                        className="text-on-surface-variant group-hover:text-primary" 
                      />
                    </div>
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
                      className="overflow-hidden border-t border-white/5 bg-white/[0.01]"
                    >
                      <div className="divide-y divide-white/5">
                        {group.sessions.map((session) => (
                          <div key={session.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner transition-all",
                                session.sessionType === 'TECHNICAL' ? "border-primary/20 text-primary bg-primary/5" :
                                session.sessionType === 'GD' ? "border-secondary/20 text-secondary bg-secondary/5" :
                                "border-sky-500/20 text-sky-500 bg-sky-500/5"
                              )}>
                                <Icon 
                                  name={session.sessionType === 'TECHNICAL' ? 'ms:code' : session.sessionType === 'GD' ? 'ms:groups' : 'ms:person'} 
                                  size={24} 
                                />
                              </div>
                              <div>
                                <p className="font-headline text-xs font-black text-white uppercase tracking-widest">{session.sessionType.replace('_', ' ')}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="font-headline text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">ID: {session.id.slice(0, 8)}</span>
                                  <div className="w-1 h-1 rounded-full bg-white/10" />
                                  <span className="font-headline text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">{new Date(session.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-12">
                              <div className="text-right">
                                <p className="text-[9px] font-headline text-on-surface-variant/40 font-black uppercase tracking-widest italic">Score</p>
                                <p className={cn("text-2xl font-headline font-black italic", getScoreColor(session.overallScore))}>
                                  {session.status === 'completed' ? `${session.overallScore}%` : 'PENDING'}
                                </p>
                              </div>
                              <Button 
                                onClick={() => handleViewReport(session)}
                                className="h-12 px-8 text-[10px] font-headline font-black uppercase tracking-widest bg-white text-black hover:bg-primary hover:text-white rounded-xl transition-all shadow-lg"
                              >
                                VIEW REPORT
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
            <div className="py-20 text-center border border-dashed border-white/10 bg-white/[0.01] rounded-[2.5rem] space-y-6">
              <Icon name="ms:search_off" size={60} className="mx-auto text-on-surface-variant/20" />
              <p className="font-headline text-sm text-on-surface-variant font-black uppercase tracking-[0.3em] opacity-40">No interviews found in your history</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentHistoryPage;
