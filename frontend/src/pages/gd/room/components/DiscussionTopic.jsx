import React from 'react';
import Icon from '../../../../components/AppIcon';

const DiscussionTopic = ({ topic }) => {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-8 w-full max-w-3xl relative overflow-hidden group">
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/50" />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-3">
          <Icon name="Target" size={14} className="text-amber-500" />
          <h2 className="font-mono text-[10px] font-bold text-on-surface-variant font-label font-medium text-on-surface-variant">
            ACTIVE_DISCUSSION_VECTOR
          </h2>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-center">
          <div className="hidden sm:block w-12 h-[1px] bg-surface-container-low" />
          <p className="text-xl sm:text-2xl font-headline font-bold text-on-surface leading-tight max-w-lg">
            {topic}
          </p>
          <div className="hidden sm:block w-12 h-[1px] bg-surface-container-low" />
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
    </div>
  );
};

export default DiscussionTopic;