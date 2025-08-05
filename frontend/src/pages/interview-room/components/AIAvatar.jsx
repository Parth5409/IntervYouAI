import React from 'react';
import Image from '../../../components/AppImage';


const AIAvatar = ({ 
  isActive = false, 
  isSpeaking = false, 
  avatarType = 'professional',
  size = 'large' 
}) => {
  const avatarImages = {
    professional: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    friendly: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=400&h=400&fit=crop&crop=face",
    technical: "https://images.pixabay.com/photo/2016/11/29/09/38/adult-1868750_960_720.jpg"
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32 md:w-40 md:h-40',
    xlarge: 'w-48 h-48 md:w-56 md:h-56'
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Container */}
      <div className="relative">
        <div
          className={`${sizeClasses?.[size]} rounded-full overflow-hidden border-4 transition-all duration-300 ${
            isSpeaking
              ? 'border-primary shadow-lg shadow-primary/25 scale-105'
              : isActive
              ? 'border-accent shadow-md'
              : 'border-border'
          }`}
        >
          <Image
            src={avatarImages?.[avatarType]}
            alt="AI Interview Assistant"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(3)]?.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div
          className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-card transition-colors ${
            isActive ? 'bg-success' : 'bg-muted'
          }`}
        />
      </div>
      {/* Avatar Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          AI Assistant
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSpeaking ? 'Speaking...' : isActive ? 'Listening' : 'Ready'}
        </p>
      </div>
      {/* Voice Visualization */}
      {isSpeaking && (
        <div className="flex items-center space-x-1">
          {[...Array(5)]?.map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAvatar;