import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const StudentHistoryPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('../../engine/session/history');
        if (data.success) {
          setHistory(data.data || []);
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
    if (!score) return 'text-slate-500';
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-sky-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const filteredHistory = selectedFilter === 'ALL' 
    ? history 
    : history.filter(h => h.session_type === selectedFilter);

  const handleViewReport = (session) => {
    const basePath = session.session_type === 'GD' ? '/gd/feedback' : '/interview/feedback';
    navigate(`${basePath}/${session.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase flex items-center gap-3">
            <span className="text-slate-500">{'>'}</span> MISSION_LOGS
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
            Historical data of previous engagements // Performance records
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-6">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase transition-all ${
                selectedFilter === filter 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'text-slate-500 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center font-mono text-xs text-slate-500 animate-pulse uppercase tracking-[0.2em]">
              Retrieving_Historical_Data...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors">
                        <Icon 
                          name={session.session_type === 'TECHNICAL' ? 'Code' : session.session_type === 'HR' ? 'User' : 'MessageSquare'} 
                          size={20} 
                          className="text-slate-500 group-hover:text-emerald-500 transition-colors"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-emerald-500 font-bold tracking-widest">{session.session_type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="font-mono text-[10px] text-slate-500">{session.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-lg font-mono font-bold text-slate-200 mt-1 uppercase">{session.context?.company_name || 'GENERAL'}_INTERVIEW_ALPHA</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                            <Icon name="Calendar" size={12} />
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                            <Icon name="Clock" size={12} />
                            {session.duration_minutes}m
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Score</p>
                        <p className={`text-2xl font-mono font-bold ${getScoreColor(session.overall_score)}`}>
                          {session.overall_score > 0 ? `${session.overall_score}%` : 'PENDING'}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleViewReport(session)}
                          className="bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold tracking-widest hover:bg-emerald-400 transition-all uppercase px-6 h-10"
                        >
                          VIEW_REPORT
                        </Button>
                        <Button 
                          className="bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] tracking-widest hover:border-emerald-500 hover:text-emerald-500 transition-all uppercase px-4 h-10"
                        >
                          <Icon name="Download" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) }

          {!isLoading && filteredHistory.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-800">
              <Icon name="SearchX" size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">No matching logs found in database</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentHistoryPage;