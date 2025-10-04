import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';

// Import Components
import InterviewProgressNav from '../../components/ui/InterviewProgressNav';
import SessionControls from '../../components/ui/SessionControls';
import AIAvatar from './components/AIAvatar';
import ConversationTranscript from './components/ConversationTranscript';
import VoiceControls from './components/VoiceControls';
import SessionProgress from './components/SessionProgress';
import EmergencyExit from './components/EmergencyExit';

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);

  // State Management
  const [sessionDetails, setSessionDetails] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Custom hook for audio recording
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useAudioRecorder();

  // --- EFFECTS ---

  useEffect(() => {
    if (!sessionId || !user?.id) return;

    socketRef.current = io('http://localhost:8000', { path: '/socket.io' });
    const socket = socketRef.current;

    const handleSessionStarted = (data) => {
      const firstMessage = data.message;
      setConversationHistory([
        {
          id: Date.now(),
          speaker: 'AI',
          text: firstMessage,
          type: 'ai',
          timestamp: new Date(),
        },
      ]);
      setIsSessionActive(true);
      setIsAISpeaking(false);
    };

    const handleUserMessageProcessed = ({ transcript }) => {
      const userMessage = {
        id: Date.now(),
        speaker: 'You',
        text: transcript,
        type: 'user',
        timestamp: new Date(),
      };
      setConversationHistory((prev) => [...prev, userMessage]);
      setIsTranscribing(false);
      setIsAISpeaking(true); // Waiting for AI response
    };

    const handleNewAIMessage = ({ message }) => {
      const aiMessage = {
        id: Date.now() + 1,
        speaker: 'AI',
        text: message,
        type: 'ai',
        timestamp: new Date(),
      };
      setConversationHistory((prev) => [...prev, aiMessage]);
      setIsAISpeaking(false);
    };

    const handleInterviewEnded = ({ sessionData }) => {
      navigate(`/interview-feedback/${sessionData.id}`, { state: { sessionData } });
    };

    socket.on('connect', () => {
      api.get(`/session/${sessionId}`)
        .then((res) => {
          setSessionDetails(res.data.data);
          socket.emit('start_interview', { session_id: sessionId, user_id: user.id });
        })
        .catch((err) => {
          console.error('Failed to get session details:', err);
          navigate('/dashboard');
        });
    });

    socket.on('session_started', handleSessionStarted);
    socket.on('user_message_processed', handleUserMessageProcessed);
    socket.on('new_ai_message', handleNewAIMessage);
    socket.on('interview_ended', handleInterviewEnded);
    socket.on('error', (error) => console.error('Socket Error:', error.message));

    return () => {
      socket.disconnect();
    };
  }, [sessionId, user?.id, navigate]);

  useEffect(() => {
    if (audioBlob && socketRef.current) {
      setIsTranscribing(true);
      socketRef.current.emit('audio_chunk', {
        session_id: sessionId,
        audio_blob: audioBlob,
      });
      resetAudio();
    }
  }, [audioBlob, sessionId, resetAudio]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // --- HANDLERS ---

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleEndSession = () => {
    if (socketRef.current) {
      setIsSessionActive(false);
      socketRef.current.emit('end_interview', {
        session_id: sessionId,
        transcript: conversationHistory,
      });
    }
  };

  const questionsAnswered = useMemo(() => {
    return conversationHistory.filter((msg) => msg.type === 'user').length;
  }, [conversationHistory]);

  const totalQuestions = useMemo(() => {
    return sessionDetails?.context?.max_questions || 5;
  }, [sessionDetails]);

  return (
    <div className="min-h-screen bg-background">
      <InterviewProgressNav currentStep={2} totalSteps={3} />
      <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-64px)]">
        <div className="flex-1 lg:w-3/5 relative">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center p-6 space-y-8">
            <AIAvatar isSpeaking={isAISpeaking} size="xlarge" />
            <VoiceControls
              isRecording={isRecording}
              isMuted={isMuted}
              onToggleRecording={handleToggleRecording}
              onToggleMute={() => setIsMuted(!isMuted)}
              disabled={isAISpeaking || isTranscribing}
              isTranscribing={isTranscribing}
            />
          </div>
        </div>
        <div className="hidden lg:flex lg:w-2/5 flex-col border-l border-border">
          <div className="flex-shrink-0 p-4 border-b border-border">
            <SessionProgress
              sessionTime={sessionTime}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>
          <div className="flex-1">
            <ConversationTranscript transcript={conversationHistory} isLoading={isAISpeaking || isTranscribing} />
          </div>
        </div>
      </div>

      <SessionControls
        isRecording={isRecording}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={handleToggleRecording}
        onToggleMute={() => setIsMuted(!isMuted)}
        onEndSession={handleEndSession}
        className='mr-[404px]'
      />

      <EmergencyExit onExit={handleEndSession} />
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default InterviewRoom;