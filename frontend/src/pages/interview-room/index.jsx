import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';

import { playAudioFromBase64 } from '../../utils/audioPlayer';

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
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  // Custom hook for audio recording
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useAudioRecorder();

  // --- EFFECTS ---

  useEffect(() => {
    if (!sessionId || !user?.id) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', { path: '/socket.io' });
    const socket = socketRef.current;

    const handleSessionStarted = (data) => {
      const { text, audio } = data;
      setConversationHistory([
        {
          id: Date.now(),
          speaker: 'AI',
          text: text,
          type: 'ai',
          timestamp: new Date(),
        },
      ]);
      setIsSessionActive(true);
      setIsAISpeaking(false);
      if (audio) {
        setIsAIPlaying(true);
        playAudioFromBase64(audio, () => setIsAIPlaying(false));
      }
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

    const handleNewAIMessage = ({ text, audio }) => {
      const aiMessage = {
        id: Date.now() + 1,
        speaker: 'AI',
        text: text,
        type: 'ai',
        timestamp: new Date(),
      };
      setConversationHistory((prev) => [...prev, aiMessage]);
      setIsAISpeaking(false);
      if (audio) {
        setIsAIPlaying(true);
        playAudioFromBase64(audio, () => setIsAIPlaying(false));
      }
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

  const sessionTitle = useMemo(() => {
    if (!sessionDetails) {
      return 'Loading Interview...';
    }
    const type = sessionDetails.session_type || '';
    const company = sessionDetails.context?.company_name || '';
    const jobRole = sessionDetails.context?.job_role || '';

    // Format the type: "TECHNICAL" -> "Technical Interview"
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' ') + ' Interview';

    let title = formattedType;
    if (jobRole) {
      title += ` for ${jobRole}`;
    }
    if (company) {
      title += ` at ${company}`;
    }
    return title;
  }, [sessionDetails]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InterviewProgressNav currentStep={2} totalSteps={3} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-hidden">
        <div className="flex-1 lg:w-3/5 relative flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-6 space-y-8">
            <AIAvatar isSpeaking={isAIPlaying} size="xlarge" />
            <VoiceControls
              isRecording={isRecording}
              isMuted={isMuted}
              onToggleRecording={handleToggleRecording}
              onToggleMute={() => setIsMuted(!isMuted)}
              disabled={isAISpeaking || isTranscribing || isAIPlaying}
              isTranscribing={isTranscribing}
            />
          </div>
        </div>
        <div className="hidden lg:flex lg:w-2/5 flex-col border-l border-border">
          <div className="flex-shrink-0 p-4 border-b border-border">
            <SessionProgress
              currentPhase={sessionTitle.toUpperCase()}
              sessionTime={sessionTime}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>
          <div className="flex-1  style={{ height: 'calc(100vh - 380px)' }}">
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