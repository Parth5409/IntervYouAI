import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionCards = ({ onStartInterview, onViewHistory }) => {
  const actionCards = [
    {
      id: 'technical',
      title: 'Technical Interview',
      description: 'Practice coding problems and system design questions',
      icon: 'Code',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      action: () => onStartInterview('technical')
    },
    {
      id: 'hr',
      title: 'HR Interview',
      description: 'Behavioral questions and company culture fit',
      icon: 'Users',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      action: () => onStartInterview('hr')
    },
    {
      id: 'group',
      title: 'Group Discussion',
      description: 'Practice group dynamics and communication skills',
      icon: 'MessageCircle',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      action: () => onStartInterview('group')
    },
    {
      id: 'salary',
      title: 'Salary Negotiation',
      description: 'Learn to negotiate compensation effectively',
      icon: 'DollarSign',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      action: () => onStartInterview('salary')
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Button
          variant="ghost"
          onClick={onViewHistory}
          iconName="History"
          iconPosition="left"
          iconSize={16}
          className="text-sm"
        >
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actionCards?.map((card) => (
          <div
            key={card?.id}
            className={`${card?.color} rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md hover:scale-105`}
            onClick={card?.action}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${card?.iconColor}`}>
                <Icon name={card?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground text-sm">{card?.title}</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {card?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionCards;