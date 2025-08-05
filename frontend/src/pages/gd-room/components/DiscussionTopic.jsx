import React from 'react';
import Icon from '../../../components/AppIcon';

const DiscussionTopic = ({ topic }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">Discussion Topic</h2>
      <div className="flex items-center justify-center space-x-3">
        <Icon name="MessageSquare" size={24} className="text-primary flex-shrink-0" />
        <p className="text-xl font-bold text-foreground">{topic}</p>
      </div>
    </div>
  );
};

export default DiscussionTopic;