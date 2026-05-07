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
    { label: 'Dashboard', path: '/student/dashboard', icon: 'ms:grid_view' },
    { label: 'Interview Hub', path: '/interview/setup', icon: 'ms:psychology' },
    { label: 'Interview Drives', path: '/student/drives', icon: 'ms:rocket' },
    { label: 'Student History', path: '/student/history', icon: 'ms:analytics' },
    { label: 'Profile Settings', path: '/student/profile', icon: 'ms:monitoring' },
  ];

  const tpoMenu = [
    { label: 'Analytics', path: '/tpo/dashboard', icon: 'ms:bar_chart' },
    { label: 'Drive Management', path: '/tpo/drives', icon: 'ms:business_center' },
    { label: 'Student Directory', path: '/tpo/students', icon: 'ms:group' },
    { label: 'System Reports', path: '/tpo/reports', icon: 'ms:description' },
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
      <div className="noise" />
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full flex flex-col p-6 bg-surface/40 backdrop-blur-3xl border-r border-white/5 z-50 font-headline text-sm transition-all duration-500",
          isSidebarOpen ? "w-72" : "w-24"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700", fontSize: '20px' }}>bolt</span>
          </motion.div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-black tracking-tighter text-white font-headline"
            >
              IntervYou<span className="text-primary">.AI</span>
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 space-y-1.5">
          {getMenu().map((item, index) => {
            const active = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden",
                  active 
                    ? "text-primary bg-primary/10 font-bold" 
                    : "text-on-surface-variant/60 hover:text-white hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                  />
                )}
                <Icon name={item.icon} size={22} className={cn("transition-all duration-500 group-hover:scale-110 group-hover:text-primary", active && "text-primary")} />
                {isSidebarOpen && <span className="font-headline text-[14px] tracking-tight">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
          <button 
            className={cn(
              "w-full bg-gradient-to-r from-primary to-secondary text-white font-black rounded-2xl hover:brightness-110 transition-all text-xs tracking-widest font-headline shadow-xl shadow-primary/20 flex items-center justify-center gap-2",
              isSidebarOpen ? "h-14 py-4 px-6" : "h-14 w-14"
            )}
            onClick={() => navigate('/interview/setup')}
          >
            <Icon name="ms:add" size={20} />
            {isSidebarOpen && "NEW SESSION"}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary transition-all border border-white/5 rounded-xl mt-4"
          >
            <Icon name={isSidebarOpen ? "ms:keyboard_double_arrow_left" : "ms:keyboard_double_arrow_right"} size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col relative z-20 overflow-hidden transition-all duration-500",
        isSidebarOpen ? "ml-72" : "ml-24"
      )}>
        {/* Top Header */}
        <header className="fixed top-0 right-0 z-40 h-20 flex justify-between items-center px-12 bg-background/40 backdrop-blur-3xl border-b border-white/5 font-headline" style={{ left: isSidebarOpen ? '288px' : '96px' }}>
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/30 text-xl group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Search resources or drives..." 
                className="bg-white/5 border border-white/5 focus:border-primary/40 focus:ring-0 rounded-2xl pl-12 pr-6 py-3 text-xs text-on-surface w-full transition-all placeholder:text-on-surface-variant/30 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <nav className="hidden xl:flex gap-10 items-center text-on-surface-variant/60 uppercase tracking-[0.2em] text-[10px] font-bold">
            </nav>
            <div className="flex items-center gap-6 border-l border-white/5 pl-10">
              <button className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary transition-all text-2xl relative">
                notifications
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              </button>
              <div className="relative group cursor-pointer p-1 rounded-full border border-white/10 hover:border-primary/40 transition-all">
                <img 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover" 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
                />
                <div className="absolute right-0 top-full mt-3 w-56 bg-surface-container-high/90 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 z-50">
                  <div className="p-3 mb-2 border-b border-white/5">
                    <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{user?.role?.replace('ROLE_', '')}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant/60 hover:text-error hover:bg-error/5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest">
                    <Icon name="ms:logout" size={18} />
                    Log Out
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