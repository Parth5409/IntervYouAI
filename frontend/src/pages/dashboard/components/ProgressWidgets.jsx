import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgressWidgets = ({ user, interviewHistory }) => {
  const progressData = {
    weeklyGoal: {
      current: 3,
      target: 5,
      label: 'Weekly Sessions'
    },
    skillProgress: [
      { skill: 'Technical Skills', progress: 85, color: 'bg-blue-500' },
      { skill: 'Communication', progress: 92, color: 'bg-green-500' },
      { skill: 'Problem Solving', progress: 78, color: 'bg-purple-500' },
      { skill: 'Leadership', progress: 65, color: 'bg-orange-500' }
    ],
    recentAchievements: [
      { title: 'Perfect Score', description: 'Scored 100% in HR interview', icon: 'Trophy', date: '2 days ago' },
      { title: 'Consistency', description: '7-day practice streak', icon: 'Flame', date: 'Today' },
      { title: 'Improvement', description: '15% score increase this month', icon: 'TrendingUp', date: '1 week ago' }
    ]
  };

  const upcomingGoals = [
    { title: 'Complete 5 technical interviews', progress: 60, dueDate: 'This week' },
    { title: 'Practice salary negotiation', progress: 0, dueDate: 'Next week' },
    { title: 'Improve communication score to 95%', progress: 80, dueDate: 'This month' }
  ];

  return (
    <div className="space-y-6">
      {/* Skill Progress */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Skill Progress</h3>
          <Button
            variant="ghost"
            iconName="BarChart3"
            iconSize={16}
            className="text-xs"
          >
            View Details
          </Button>
        </div>
        
        <div className="space-y-4">
          {progressData?.skillProgress?.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{skill?.skill}</span>
                <span className="text-sm text-muted-foreground">{skill?.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${skill?.color}`}
                  style={{ width: `${skill?.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Upcoming Goals */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Upcoming Goals</h3>
          <Button
            variant="ghost"
            iconName="Target"
            iconSize={16}
            className="text-xs"
          >
            Set Goal
          </Button>
        </div>
        
        <div className="space-y-4">
          {upcomingGoals?.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{goal?.title}</h4>
                  <p className="text-xs text-muted-foreground">{goal?.dueDate}</p>
                </div>
                <span className="text-xs text-muted-foreground">{goal?.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${goal?.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressWidgets;