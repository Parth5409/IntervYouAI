import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavigation from '../../components/ui/DashboardNavigation';
import WelcomeSection from './components/WelcomeSection';
import QuickActionCards from './components/QuickActionCards';
import ProfileTab from './components/ProfileTab';
import InterviewHistoryTab from './components/InterviewHistoryTab';
import ProgressWidgets from './components/ProgressWidgets';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';


const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { user: currentUser, loading: isLoading, setUser } = useAuth();

  const handleStartInterview = (type = null) => {
    if (type) {
      navigate('/interview-setup-wizard', { state: { selectedType: type } });
    } else {
      navigate('/interview-setup-wizard');
    }
  };

  const handleViewHistory = () => {
    setActiveTab('history');
  };

  const handleViewFeedback = (sessionId) => {
    navigate('/interview-feedback', { state: { sessionId } });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavigation currentUser={currentUser} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation
        currentUser={currentUser}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <WelcomeSection
          user={currentUser}
          onStartInterview={handleStartInterview}
        />

        {activeTab === 'profile' && (
          <QuickActionCards
            onStartInterview={handleStartInterview}
            onViewHistory={handleViewHistory}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <ProfileTab
                user={currentUser}
                onProfileUpdate={handleProfileUpdate}
              />
            )}

            {activeTab === 'history' && (
              <InterviewHistoryTab
                onViewFeedback={handleViewFeedback}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <ProgressWidgets />
          </div>
        </div>

        <div className="fixed bottom-20 right-4 md:hidden z-40">
          <Button
            variant="default"
            onClick={() => handleStartInterview()}
            iconName="Plus"
            className="rounded-full w-14 h-14 p-0 shadow-elevated"
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;