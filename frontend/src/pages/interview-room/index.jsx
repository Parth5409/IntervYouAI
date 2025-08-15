import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import InterviewProgressNav from '../../components/ui/InterviewProgressNav';
import SessionControls from '../../components/ui/SessionControls';
import AIAvatar from './components/AIAvatar';
import ConversationTranscript from './components/ConversationTranscript';
import VoiceControls from './components/VoiceControls';
import SessionProgress from './components/SessionProgress';
import EmergencyExit from './components/EmergencyExit';
import api from '../../utils/api';
import io from 'socket.io-client';

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [socket, setSocket] = useState(null);

  // Voice and session states
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Interview progress states
  const [currentPhase, setCurrentPhase] = useState('Introduction');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(1);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(8);

  // Transcript state
  const [transcript, setTranscript] = useState([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const { data } = await api.get(`/session/${sessionId}`);
        if (data.success) {
          setSessionDetails(data.data);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Failed to fetch session details:", error);
        navigate('/dashboard');
      }
    };

    fetchSessionDetails();

    const newSocket = io('http://localhost:8000', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!socket || !sessionDetails) return;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('start_interview', { session_id: sessionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('ai_speech', (data) => {
      setTranscript(prev => [...prev, { speaker: 'AI', text: data.message, type: 'ai', timestamp: new Date() }]);
      setIsSpeaking(false);
      setIsTranscriptLoading(false);
    });

    socket.on('session_started', () => {
      setIsSessionActive(true);
    });

    socket.on('session_ended', (data) => {
      setIsSessionActive(false);
      navigate('/interview-feedback', { state: { sessionData: data } });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

  }, [socket, sessionDetails, sessionId, navigate]);

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

  const handleToggleListening = () => {
    if (!isMuted && socket) {
      setIsListening(!isListening);
      if (!isListening) {
        const message = "This is a sample user response."; // In a real app, this would come from speech-to-text
        socket.emit('send_message', { session_id: sessionId, message });
        setTranscript(prev => [...prev, { speaker: 'You', text: message, type: 'user', timestamp: new Date() }]);
        setIsTranscriptLoading(true);
      }
    }
  };

  const handleEndSession = () => {
    if (socket) {
      socket.emit('end_interview_session', { session_id: sessionId });
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

  const handleEmergencyExit = async () => {
    setIsSessionActive(false);
    if (socket) {
        socket.disconnect();
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <InterviewProgressNav
        currentStep={2}
        totalSteps={3}
        stepLabels={['Setup', 'Interview', 'Feedback']}
        showProgress={true}
        showBackButton={false}
        isInterviewActive={isSessionActive}
      />
      <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-64px)]">
        <div className="flex-1 lg:w-3/5 flex flex-col">
          <div className="lg:hidden bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {sessionDetails?.context?.interviewType} Interview
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sessionDetails?.context?.jobRole}
                  {sessionDetails?.context?.company && ` • ${sessionDetails?.context?.company}`}
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

          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            <div className="flex-shrink-0">
              <AIAvatar
                isActive={activeSpeakerId === 'ai'}
                isSpeaking={isSpeaking}
                avatarType="professional"
                size="xlarge"
              />
            </div>

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

            <div className="lg:hidden w-full max-w-md">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Recent Messages
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {transcript?.slice(-2)?.map((message, index) => (
                    <div key={index} className="text-sm">
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

        <div className="hidden lg:flex lg:w-2/5 flex-col border-l border-border">
          <div className="flex-shrink-0 p-4 border-b border-border">
            <SessionProgress
              currentPhase={currentPhase}
              totalPhases={4}
              currentPhaseIndex={currentPhaseIndex}
              sessionTime={sessionTime}
              estimatedDuration={sessionDetails?.duration_minutes * 60}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>

          <div className="flex-1">
            <ConversationTranscript
              transcript={transcript}
              isLoading={isTranscriptLoading}
            />
          </div>
        </div>
      </div>
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
      <EmergencyExit
        onExit={handleEmergencyExit}
        sessionData={{
          sessionTime,
          questionsAnswered,
          currentPhase,
          ...sessionDetails?.context
        }}
      />
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default InterviewRoom;