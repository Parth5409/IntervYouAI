import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InterviewProgressNav from '../../components/ui/InterviewProgressNav';
import SessionControls from '../../components/ui/SessionControls';
import AIAvatar from './components/AIAvatar';
import ConversationTranscript from './components/ConversationTranscript';
import VoiceControls from './components/VoiceControls';
import SessionProgress from './components/SessionProgress';
import EmergencyExit from './components/EmergencyExit';

const InterviewRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Session state from setup wizard
  const sessionConfig = location.state || {
    interviewType: 'Technical',
    jobRole: 'Software Developer',
    company: 'Tech Corp',
    duration: 30
  };

  // Voice and session states
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Interview progress states
  const [currentPhase, setCurrentPhase] = useState('Introduction');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions] = useState(8);

  // Transcript state
  const [transcript, setTranscript] = useState([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  // Mock conversation data
  const mockTranscript = [
    {
      id: 1,
      speaker: 'AI',
      text: `Hello! I'm your AI interview assistant for this ${sessionConfig?.interviewType} interview. I'm excited to help you practice for the ${sessionConfig?.jobRole} position${sessionConfig?.company ? ` at ${sessionConfig?.company}` : ''}. Let's start with a simple question - can you tell me about yourself and your background?`,timestamp: new Date(Date.now() - 180000),type: 'ai'
    },
    {
      id: 2,
      speaker: 'You',text: "Hi! I\'m a software developer with 3 years of experience in React and Node.js. I\'m passionate about creating user-friendly applications and solving complex problems. I\'ve worked on several full-stack projects and I\'m always eager to learn new technologies.",timestamp: new Date(Date.now() - 150000),type: 'user'
    },
    {
      id: 3,
      speaker: 'AI',text: "That\'s excellent! Your experience with React and Node.js is very relevant. Can you walk me through a challenging technical project you\'ve worked on recently? I\'d like to understand your problem-solving approach and the technologies you used.",timestamp: new Date(Date.now() - 120000),type: 'ai'
    },
    {
      id: 4,
      speaker: 'You',
      text: "Sure! I recently built a real-time collaboration platform using React, Socket.IO, and MongoDB. The main challenge was handling concurrent user interactions and maintaining data consistency. I implemented optimistic updates with conflict resolution and used Redis for session management.",
      timestamp: new Date(Date.now() - 90000),
      type: 'user'
    }
  ];

  // Session timer effect
  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Mock microphone level simulation
  useEffect(() => {
    let interval;
    if (isListening && !isMuted) {
      interval = setInterval(() => {
        setMicrophoneLevel(Math.random() * 100);
      }, 100);
    } else {
      setMicrophoneLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening, isMuted]);

  // Mock AI speaking simulation
  useEffect(() => {
    if (isSpeaking) {
      setActiveSpeakerId('ai');
      const timeout = setTimeout(() => {
        setIsSpeaking(false);
        setActiveSpeakerId(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isSpeaking]);

  // Phase progression logic
  useEffect(() => {
    const phases = ['Introduction', 'Technical Questions', 'Behavioral Questions', 'Wrap-up'];
    const phaseIndex = Math.min(Math.floor(questionsAnswered / 2) + 1, phases?.length);
    setCurrentPhaseIndex(phaseIndex);
    setCurrentPhase(phases?.[phaseIndex - 1]);
  }, [questionsAnswered]);

  // Voice control handlers
  const handleToggleListening = () => {
    if (!isMuted) {
      setIsListening(!isListening);
      if (!isListening) {
        setActiveSpeakerId('user');
        // Simulate speech recognition
        setTimeout(() => {
          setIsListening(false);
          setActiveSpeakerId(null);
          setQuestionsAnswered(prev => prev + 1);
          
          // Simulate AI response
          setTimeout(() => {
            setIsSpeaking(true);
          }, 1000);
        }, 4000);
      }
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setIsListening(false);
      setActiveSpeakerId(null);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleVolumeChange = (volume) => {
    console.log('Volume changed to:', volume);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    navigate('/interview-feedback', {
      state: {
        sessionData: {
          ...sessionConfig,
          sessionTime,
          questionsAnswered,
          totalQuestions,
          currentPhase,
          transcript: mockTranscript
        }
      }
    });
  };

  const handleEmergencyExit = async () => {
    setIsSessionActive(false);
    // Simulate saving progress
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Hidden during active session */}
      <InterviewProgressNav
        currentStep={2}
        totalSteps={3}
        stepLabels={['Setup', 'Interview', 'Feedback']}
        showProgress={true}
        showBackButton={false}
        isInterviewActive={isSessionActive}
      />
      {/* Main Interview Interface */}
      <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-64px)]">
        {/* Left Panel - Avatar and Controls (Mobile: Full Screen, Desktop: 60%) */}
        <div className="flex-1 lg:w-3/5 flex flex-col">
          {/* Session Header - Mobile Only */}
          <div className="lg:hidden bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {sessionConfig?.interviewType} Interview
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sessionConfig?.jobRole}
                  {sessionConfig?.company && ` • ${sessionConfig?.company}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-semibold text-foreground">
                  {Math.floor(sessionTime / 60)}:{(sessionTime % 60)?.toString()?.padStart(2, '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentPhase}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            {/* AI Avatar */}
            <div className="flex-shrink-0">
              <AIAvatar
                isActive={activeSpeakerId === 'ai'}
                isSpeaking={isSpeaking}
                avatarType="professional"
                size="xlarge"
              />
            </div>

            {/* Voice Controls */}
            <div className="flex-shrink-0">
              <VoiceControls
                isListening={isListening}
                isMuted={isMuted}
                microphoneLevel={microphoneLevel}
                onToggleListening={handleToggleListening}
                onToggleMute={handleToggleMute}
                onVolumeChange={handleVolumeChange}
                disabled={!isConnected}
              />
            </div>

            {/* Mobile Transcript Preview */}
            <div className="lg:hidden w-full max-w-md">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Recent Messages
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mockTranscript?.slice(-2)?.map((message) => (
                    <div key={message?.id} className="text-sm">
                      <span className="font-medium text-muted-foreground">
                        {message?.speaker}:
                      </span>
                      <span className="ml-2 text-foreground">
                        {message?.text?.length > 80 
                          ? `${message?.text?.substring(0, 80)}...` 
                          : message?.text
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Transcript and Progress (Desktop Only) */}
        <div className="hidden lg:flex lg:w-2/5 flex-col border-l border-border">
          {/* Session Progress */}
          <div className="flex-shrink-0 p-4 border-b border-border">
            <SessionProgress
              currentPhase={currentPhase}
              totalPhases={4}
              currentPhaseIndex={currentPhaseIndex}
              sessionTime={sessionTime}
              estimatedDuration={sessionConfig?.duration * 60}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>

          {/* Conversation Transcript */}
          <div className="flex-1">
            <ConversationTranscript
              transcript={mockTranscript}
              isLoading={isTranscriptLoading}
            />
          </div>
        </div>
      </div>
      {/* Session Controls - Fixed Bottom */}
      <SessionControls
        isRecording={isRecording}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={handleToggleRecording}
        onToggleMute={handleToggleMute}
        onEndSession={handleEndSession}
        isConnected={isConnected}
        microphoneLevel={microphoneLevel}
        showTimer={true}
        showMicLevel={true}
      />
      {/* Emergency Exit */}
      <EmergencyExit
        onExit={handleEmergencyExit}
        sessionData={{
          sessionTime,
          questionsAnswered,
          currentPhase,
          ...sessionConfig
        }}
      />
      {/* Mobile Bottom Padding */}
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default InterviewRoom;