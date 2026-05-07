import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../../components/AppIcon';
import CameraPreview from '../../../../components/ui/CameraPreview';
import Image from '../../../../components/AppImage';
import { cn } from '../../../../utils/cn';

const ParticipantCard = ({ 
  participant, 
  isSpeaking, 
  localStream, 
  isCameraActive, 
  cameraError,
  index
}) => {
  const isHuman = participant.is_human || participant.id === 'human_user';
  
  const botAvatars = {
    SAM: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    MORGAN: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200&h=200&fit=crop&crop=face",
    CASEY: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=200&h=200&fit=crop&crop=face",
    JORDAN: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    ALEX: "https://images.unsplash.com/photo-1544005313-94ff8a218df5?w=200&h=200&fit=crop&crop=face"
  };

  const avatarUrl = botAvatars[participant.name.toUpperCase()] || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + participant.name;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col items-center gap-4 transition-all duration-500"
    >
        <div className={cn(
            "w-24 h-24 rounded-2xl border-2 bg-white/[0.02] flex items-center justify-center transition-all duration-500 relative group overflow-hidden shadow-xl",
            isSpeaking 
              ? "border-primary shadow-primary/20 scale-110 z-10 opacity-100" 
              : isHuman 
                ? "border-white/20 opacity-100" 
                : "border-white/5 opacity-60"
        )}>
            {isHuman ? (
              <CameraPreview 
                stream={localStream}
                isActive={isCameraActive}
                error={cameraError}
                showStatus={false}
                className="w-full h-full border-none object-cover"
              />
            ) : (
              <div className="w-full h-full relative">
                <Image 
                  src={avatarUrl} 
                  alt={participant.name}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    isSpeaking ? "grayscale-0 scale-110" : "grayscale opacity-50"
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            
            {isSpeaking && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white font-headline text-[8px] font-black text-center py-1 z-20 uppercase tracking-widest">
                    SPEAKING
                </div>
            )}

            {/* Scanning line for active speaker */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-primary/5 overflow-hidden pointer-events-none z-10">
                <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-[scan_2s_linear_infinite]" />
              </div>
            )}
        </div>
        
        <div className="text-center space-y-1">
            <p className={cn(
              "text-[10px] font-headline font-black tracking-widest uppercase truncate max-w-[100px] italic",
              isSpeaking ? "text-primary" : "text-white/60"
            )}>
              {participant.name}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className={cn("w-1 h-1 rounded-full", isSpeaking ? "bg-primary animate-pulse" : "bg-white/10")} />
              <p className="text-[8px] font-headline font-black text-white/20 uppercase tracking-widest">
                {isHuman ? 'YOU' : `${participant.personality.substring(0, 4).toUpperCase()}_AI`}
              </p>
            </div>
        </div>
    </motion.div>
  );
};

const ParticipantsGrid = ({ 
  participants = [], 
  activeSpeakerId, 
  localStream, 
  isCameraActive, 
  cameraError 
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-10">
        {participants.map((p, i) => (
          <ParticipantCard 
            key={p.id} 
            participant={p} 
            isSpeaking={p.id === activeSpeakerId} 
            localStream={localStream}
            isCameraActive={isCameraActive}
            cameraError={cameraError}
            index={i}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantsGrid;

