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
    { label: 'Command Center', path: '/student/dashboard', icon: 'ms:grid_view' },
    { label: 'Interview Hub', path: '/interview/setup', icon: 'ms:psychology' },
    { label: 'Placement Drives', path: '/student/drives', icon: 'ms:rocket' },
    { label: 'Student History', path: '/student/history', icon: 'ms:analytics' },
    { label: 'Profile Settings', path: '/student/profile', icon: 'ms:monitoring' },
  ];

  const tpoMenu = [
    { label: 'Analytics', path: '/tpo/dashboard', icon: 'ms:bar_chart' },
    { label: 'Drive Management', path: '/tpo/drives', icon: 'ms:business_center' },
    { label: 'Student Directory', path: '/tpo/students', icon: 'ms:group' },
    { label: 'Reports', path: '/tpo/reports', icon: 'ms:description' },
  ];

  const adminMenu = [
    { label: 'Organization Stats', path: '/admin/dashboard', icon: 'ms:domain' },
    { label: 'TPO Management', path: '/admin/tpo', icon: 'ms:person_add' },
    { label: 'System Config', path: '/admin/system', icon: 'ms:settings_suggest' },
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
    <div className="h-screen bg-background text-on-surface font-body flex overflow-hidden selection:bg-primary/30 selection:text-on-surface relative">
      {/* Global Background mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] opacity-30 animate-pulse" />
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "h-full fixed left-0 top-0 flex flex-col p-8 bg-surface-container-low/40 backdrop-blur-3xl border-r border-outline-variant/10 z-[60] transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]",
          isSidebarOpen ? "w-80" : "w-28"
        )}
      >
        <div className="mb-14 flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-4 transition-all duration-500",
            !isSidebarOpen && "translate-x-1"
          )}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-[0_0_25px_rgba(255,145,90,0.4)] transition-transform hover:scale-110">
              <Icon name="ms:bolt" size={26} className="font-extrabold" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col animate-in slide-in-from-left-2">
                <h1 className="text-lg font-headline font-extrabold tracking-[0.1em] text-white uppercase leading-none">
                  IntervYou.AI
                </h1>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1.5 opacity-40">Core Interface</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {getMenu().map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-500 group relative",
                  active 
                    ? "text-white bg-surface-container-highest shadow-xl" 
                    : "text-on-surface-variant hover:text-white hover:bg-surface-container-high/60"
                )}
              >
                <Icon name={item.icon} size={22} className={cn("transition-transform group-hover:scale-110", active && "text-primary")} />
                {isSidebarOpen && <span className="font-headline text-[13px] font-bold tracking-wide uppercase">{item.label}</span>}
                {active && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-outline-variant/10 space-y-3">
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-3.5 text-on-surface-variant hover:text-white hover:bg-surface-container-high/60 transition-all duration-500 rounded-[1.25rem] group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Icon name="ms:settings" size={22} className="group-hover:rotate-45 transition-transform" />
            {isSidebarOpen && <span className="font-headline text-[12px] font-bold tracking-wide uppercase">Settings</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-3.5 text-on-surface-variant hover:text-error transition-all duration-500 rounded-[1.25rem] group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Icon name="ms:logout" size={22} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-headline text-[12px] font-bold tracking-wide uppercase">Logout</span>}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-12 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-500 hover:bg-primary/5 rounded-[1.25rem] border border-outline-variant/10 mt-6"
          >
            <Icon name={isSidebarOpen ? "ms:keyboard_double_arrow_left" : "ms:keyboard_double_arrow_right"} size={22} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col relative z-20 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]",
        isSidebarOpen ? "ml-80" : "ml-28"
      )}>
        {/* Top Header */}
        <header className="fixed top-0 right-0 left-auto z-50 h-24 flex justify-between items-center px-16 bg-background/40 backdrop-blur-3xl border-b border-outline-variant/10 font-headline shadow-sm" style={{ left: isSidebarOpen ? '320px' : '112px' }}>
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <Icon name="ms:search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input 
                className="bg-surface-container-low/40 border-none rounded-2xl pl-12 pr-6 py-3.5 text-xs text-on-surface w-full focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30 font-body" 
                placeholder="Access global protocols..." 
                type="text" 
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <nav className="hidden xl:flex gap-10 items-center font-headline text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.2em]">
              <a className="hover:text-white transition-all cursor-pointer" href="#">Core Hub</a>
              <a className="hover:text-white transition-all cursor-pointer" href="#">Neural Lab</a>
              <a className="hover:text-white transition-all cursor-pointer" href="#">Resources</a>
            </nav>
            <div className="flex items-center gap-8 border-l border-outline-variant/10 pl-10">
              <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors group">
                <Icon name="ms:notifications" size={24} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(255,145,90,1)]" />
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] text-white font-headline font-extrabold tracking-tight uppercase leading-none">{user?.fullName}</p>
                  <p className="text-[9px] text-on-surface-variant font-body font-bold mt-1.5 opacity-40 uppercase tracking-widest">{user?.role?.replace('ROLE_', '')}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-outline-variant/20 p-1 group cursor-pointer hover:border-primary/40 transition-all duration-500">
                  <img 
                    alt="Profile" 
                    className="w-full h-full rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 object-cover" 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto pt-32 px-16 pb-24 custom-scrollbar bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
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