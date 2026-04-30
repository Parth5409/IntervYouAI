import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import useAuth from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
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
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col p-6 bg-surface border-r border-outline-variant/30 z-50 font-headline text-sm transition-all duration-500",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700", fontSize: '18px' }}>bolt</span>
          </span>
          {isSidebarOpen && (
            <h1 className="text-lg font-extrabold tracking-tight text-white font-headline animate-in fade-in slide-in-from-left-2">
              IntervYou.AI
            </h1>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {getMenu().map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative",
                  active 
                    ? "text-primary bg-primary/5 font-semibold" 
                    : "text-on-surface-variant hover:text-white hover:bg-surface-container"
                )}
              >
                <Icon name={item.icon} size={20} className={cn("transition-transform group-hover:scale-110", active && "text-primary")} />
                {isSidebarOpen && <span className="font-headline text-[13px] font-semibold tracking-tight">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-3">
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:text-white hover:bg-surface-container transition-all rounded-lg",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Icon name="ms:settings" size={20} className="group-hover:rotate-45 transition-transform" />
            {isSidebarOpen && <span className="font-headline text-[13px] font-semibold tracking-tight">Settings</span>}
          </button>
          
          {isSidebarOpen ? (
            <button 
              className="w-full py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all text-xs tracking-tight font-headline shadow-lg shadow-primary/10"
              onClick={() => navigate('/interview/setup')}
            >
              Start New Session
            </button>
          ) : (
             <button 
              className="w-full h-10 flex items-center justify-center bg-primary text-black rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
              onClick={() => navigate('/interview/setup')}
            >
               <Icon name="ms:add" size={20} />
            </button>
          )}

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all border border-outline-variant/20 rounded-lg mt-2"
          >
            <Icon name={isSidebarOpen ? "ms:keyboard_double_arrow_left" : "ms:keyboard_double_arrow_right"} size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col relative z-20 overflow-hidden transition-all duration-500",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Top Header */}
        <header className="fixed top-0 right-0 left-64 z-40 h-16 flex justify-between items-center px-10 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 font-headline text-xs font-semibold" style={{ left: isSidebarOpen ? '256px' : '80px' }}>
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-sm group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-lg">search</span>
              <input 
                type="text" 
                placeholder="Search opportunities..." 
                className="bg-surface-container border border-outline-variant/30 focus:border-primary/50 focus:ring-0 rounded-lg pl-10 pr-4 py-2 text-xs text-on-surface w-full transition-all placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden xl:flex gap-8 items-center text-on-surface-variant uppercase tracking-[0.1em] text-[11px]">
              <a className="hover:text-white transition-all" href="#">Network</a>
              <a className="hover:text-white transition-all" href="#">Resources</a>
              <a className="hover:text-white transition-all" href="#">Help</a>
            </nav>
            <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
              {user?.role === 'ROLE_ORG_ADMIN' && (
                <div className="flex flex-col items-end px-3">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Administrator</span>
                  <span className="text-[9px] text-on-surface-variant/40 uppercase tracking-widest font-mono">NODE 0X1A4</span>
                </div>
              )}
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl">notifications</button>
              <div className="relative group cursor-pointer">
                <img 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-outline-variant grayscale hover:grayscale-0 transition-all" 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider">
                    <Icon name="ms:logout" size={16} />
                    Terminal Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto pt-24 px-10 pb-20 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
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