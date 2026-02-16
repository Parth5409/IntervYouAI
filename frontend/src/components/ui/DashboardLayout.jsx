import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import useAuth from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const DashboardLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const studentMenu = [
    { label: 'OVERVIEW', path: '/dashboard/student', icon: 'LayoutDashboard' },
    { label: 'INTERVIEWS', path: '/interview-setup-wizard', icon: 'Play' },
    { label: 'FEEDBACK', path: '/results', icon: 'FileText' },
    { label: 'SETTINGS', path: '/settings', icon: 'Settings' },
  ];

  const tpoMenu = [
    { label: 'ANALYTICS', path: '/dashboard/tpo', icon: 'BarChart' },
    { label: 'DRIVE_MGMT', path: '/tpo/drives', icon: 'Briefcase' },
    { label: 'STUDENTS', path: '/tpo/students', icon: 'Users' },
    { label: 'REPORTS', path: '/tpo/reports', icon: 'Clipboard' },
  ];

  const adminMenu = [
    { label: 'ORG_STATS', path: '/dashboard/admin', icon: 'Building' },
    { label: 'TPO_MGMT', path: '/admin/tpo', icon: 'UserPlus' },
    { label: 'SYSTEM', path: '/admin/system', icon: 'Cpu' },
  ];

  const getMenu = () => {
    if (user?.role === 'ROLE_STUDENT') return studentMenu;
    if (user?.role === 'ROLE_TPO') return tpoMenu;
    if (user?.role === 'ROLE_ORG_ADMIN') return adminMenu;
    return [];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500 selection:text-slate-950 flex overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Sidebar */}
      <aside 
        className={cn(
          "relative z-20 border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center shrink-0">
            <Icon name="Brain" size={20} className="text-slate-950" />
          </div>
          {isSidebarOpen && (
            <span className="font-mono font-bold tracking-tighter text-lg overflow-hidden whitespace-nowrap">
              INTERVYOU.AI
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {getMenu().map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-3 py-3 font-mono text-xs tracking-widest transition-all duration-200 group relative",
                location.pathname === item.path 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
              )}
            >
              <Icon name={item.icon} size={18} />
              {isSidebarOpen && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Icon name="User" size={14} className="text-slate-400" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-[10px] font-mono font-bold truncate">{user?.fullName}</p>
                <p className="text-[8px] font-mono text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors font-mono text-[10px] tracking-widest",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Icon name="LogOut" size={16} />
            {isSidebarOpen && <span>TERMINATE_SESSION</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              <Icon name={isSidebarOpen ? "ChevronLeft" : "Menu"} size={20} />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest">System_Live // Node_01</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Organization</span>
              <span className="text-xs font-mono font-bold">{user?.organizationName || 'GLOBAL_ACCESS'}</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-emerald-500 transition-colors">
              <Icon name="Bell" size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </button>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;