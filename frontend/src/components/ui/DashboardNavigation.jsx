import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const DashboardNavigation = ({ currentUser, onTabChange, activeTab = 'profile' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    },
    {
      label: 'Practice History',
      path: '/interview-feedback',
      icon: 'History'
    }
  ];

  const dashboardTabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User'
    },
    {
      id: 'history',
      label: 'Interview History',
      icon: 'Clock'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    // Optionally, make an API call to invalidate the token on the backend
    // try {
    //   await api.post('/auth/logout');
    // } catch (error) {
    //   console.error('Error logging out on backend:', error);
    // }
    navigate('/login-screen');
  };

  const isActive = (path) => location.pathname === path;
  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
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
            <span className="text-lg font-semibold text-foreground">
              IntervYou.AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <Button
                key={item?.path}
                variant={isActive(item?.path) ? 'default' : 'ghost'}
                onClick={() => handleNavigation(item?.path)}
                iconName={item?.icon}
                iconPosition="left"
                iconSize={16}
                className="px-4"
              >
                {item?.label}
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="var(--color-accent-foreground)" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {currentUser?.full_name || 'User'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              iconName="LogOut"
              iconSize={16}
              onClick={handleLogout}
              className="hidden md:flex"
            >
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              iconName="Menu"
              iconSize={20}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            />
          </div>
        </div>

        {/* Dashboard Tabs - Desktop */}
        {isDashboard && (
          <div className="hidden md:block border-t border-border">
            <div className="px-6">
              <nav className="flex space-x-8">
                {dashboardTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => handleTabChange(tab?.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="text-sm font-medium">{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-card border-l border-border shadow-elevated">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  iconName="X"
                  iconSize={20}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg mb-6">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="User" size={18} color="var(--color-accent-foreground)" />
                </div>
                <div>
                                    <p className="text-sm font-medium text-foreground">
                    {currentUser?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.email || 'user@example.com'}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2 mb-6">
                {navigationItems?.map((item) => (
                  <Button
                    key={item?.path}
                    variant={isActive(item?.path) ? 'default' : 'ghost'}
                    onClick={() => handleNavigation(item?.path)}
                    iconName={item?.icon}
                    iconPosition="left"
                    fullWidth
                    className="justify-start"
                  >
                    {item?.label}
                  </Button>
                ))}
              </nav>

              {/* Logout */}
              <Button
                variant="outline"
                onClick={handleLogout}
                iconName="LogOut"
                iconPosition="left"
                fullWidth
                className="justify-start"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Bottom Tabs - Dashboard Only */}
      {isDashboard && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
          <nav className="flex">
            {dashboardTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => handleTabChange(tab?.id)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'text-primary' :'text-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={20} />
                <span className="text-xs font-medium mt-1">{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default DashboardNavigation;