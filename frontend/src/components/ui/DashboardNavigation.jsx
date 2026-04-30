import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './button';
import { useTheme } from '../../hooks/useTheme';

const DashboardNavigation = ({ currentUser, onTabChange, activeTab = 'profile' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      label: 'Start Interview',
      path: '/interview-setup-wizard',
      icon: 'Play'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    // Optionally, make an API call to invalidate the token on the backend
    // try {
    //   await api.post('auth/logout');
    // } catch (error) {
    //   console.error('Error logging out on backend:', error);
    // }
    navigate('/login-screen');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-on-surface"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-headline italic text-on-surface tracking-tight">
              IntervYou.AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems?.map((item) => (
              <Button
                key={item?.path}
                variant="ghost"
                onClick={() => handleNavigation(item?.path)}
                className={cn(
                  "px-4 h-10 rounded-lg transition-all",
                  isActive(item?.path) 
                    ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20" 
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon name={item?.icon} size={16} />
                  {item?.label}
                </div>
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
            </Button>
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/30">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="User" size={12} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-on-surface">
                {currentUser?.full_name || 'User'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hidden md:flex text-on-surface-variant hover:text-error hover:bg-error/5"
            >
              <div className="flex items-center gap-2">
                <Icon name="LogOut" size={16} />
                Logout
              </div>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-on-surface"
            >
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-surface-container-low border-l border-outline-variant/30 shadow-lg animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-headline italic text-on-surface">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-on-surface-variant"
                >
                  <Icon name="X" size={24} />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 p-4 bg-surface-container rounded-xl mb-8 border border-outline/20">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {currentUser?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {currentUser?.email || 'user@example.com'}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2 mb-8">
                {navigationItems?.map((item) => (
                  <Button
                    key={item?.path}
                    variant="ghost"
                    onClick={() => handleNavigation(item?.path)}
                    className={cn(
                      "w-full justify-start h-12 rounded-xl transition-all",
                      isActive(item?.path) 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={item?.icon} size={20} />
                      <span className="text-base">{item?.label}</span>
                    </div>
                  </Button>
                ))}
              </nav>

              <div className="pt-8 border-t border-outline/20 space-y-3">
                {/* Theme Toggle - Mobile */}
                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full justify-start h-12 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                >
                  <div className="flex items-center gap-3">
                    <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
                    <span className="text-base">Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </div>
                </Button>

                {/* Logout */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start h-12 rounded-xl text-error hover:bg-error/5 hover:border-error/30"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="LogOut" size={20} />
                    <span className="text-base">Logout</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNavigation;