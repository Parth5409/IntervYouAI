import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import useAuth from '../../../hooks/useAuth';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import api, { engineApi, getAiEngineDirectURL } from '../../../utils/api';

import { playAudioFromBase64 } from '../../../utils/audioPlayer';

// Import Components
import InterviewProgressNav from '../../../components/ui/InterviewProgressNav';
import SessionControls from '../../../components/ui/SessionControls';
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
  const lastAudioRef = useRef(null);

  // Custom hook for audio recording
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useAudioRecorder();

  // --- EFFECTS ---

  useEffect(() => {
    if (!sessionId || !user?.id) return;

    socketRef.current = io(getAiEngineDirectURL(), { 
      path: '/api/engine/socket.io',
      transports: ['websocket']
    });
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
        lastAudioRef.current = audio;
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
        lastAudioRef.current = audio;
        setIsAIPlaying(true);
        playAudioFromBase64(audio, () => setIsAIPlaying(false));
      }
    };

    const handleInterviewEnded = ({ sessionData }) => {
      navigate(`/interview/feedback/${sessionData.id}`, { state: { sessionData } });
    };

    socket.on('connect', () => {
      engineApi.get(`session/${sessionId}`)
        .then((res) => {
          setSessionDetails(res.data.data);
          socket.emit('start_interview', { session_id: sessionId, user_id: user.id });
        })
        .catch((err) => {
          console.error('Failed to get session details from engine:', err);
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

  const handleReplayLastMessage = () => {
    if (lastAudioRef.current && !isAIPlaying) {
      setIsAIPlaying(true);
      playAudioFromBase64(lastAudioRef.current, () => setIsAIPlaying(false));
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
    <div className="h-screen bg-background text-on-surface flex flex-col relative overflow-hidden font-body">
      {/* Luminescent Mesh Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <InterviewProgressNav currentStep={2} totalSteps={3} isInterviewActive={true} />
      
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Left: Main Interaction Zone */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-8 overflow-hidden">
          {/* Active Status Badge */}
          <div className="absolute top-10 left-10 flex items-center gap-4 z-20 bg-surface-container-high/40 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-outline-variant/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-md" />
            <span className="font-headline text-[10px] font-extrabold text-on-surface font-label font-medium text-on-surface-variant">Neural Link Active</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-3xl w-full overflow-hidden">
            <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
              {/* Orbital Avatar Nesting */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[120%] aspect-square border-2 border-primary/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="w-[140%] aspect-square border border-dashed border-primary/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
              </div>
              
              <AIAvatar isSpeaking={isAIPlaying} size="xlarge" isActive={isSessionActive && !isAIPlaying} />
            </div>
            
            <div className="shrink-0 w-full flex justify-center py-6">
              <VoiceControls
                isRecording={isRecording}
                isMuted={isMuted}
                onToggleRecording={handleToggleRecording}
                onToggleMute={() => setIsMuted(!isMuted)}
                onReplayLastMessage={handleReplayLastMessage}
                disabled={isAISpeaking || isTranscribing}
                isAIPlaying={isAIPlaying}
                isTranscribing={isTranscribing}
                conversationHistory={conversationHistory}
              />
            </div>
          </div>
        </div>

        {/* Right: Tactical Sidebar */}
        <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col border-l border-outline-variant/10 bg-surface-container-high/30 backdrop-blur-3xl shrink-0 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.3)]">
          <div className="p-10 border-b border-outline-variant/10">
            <SessionProgress
              currentPhase={sessionDetails?.session_type || 'TECHNICAL_PROTOCOL'}
              sessionTime={sessionTime}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-10 py-5 flex items-center justify-between border-b border-outline-variant/5">
              <div className="flex items-center gap-3">
                <Icon name="ms:history" size={16} className="text-primary" />
                <span className="font-headline text-[11px] text-on-surface font-extrabold">Transcript stream</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Live Sync</span>
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden px-4">
              <ConversationTranscript 
                transcript={conversationHistory} 
                isLoading={isAISpeaking || isTranscribing} 
              />
            </div>
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
      />

      <EmergencyExit onExit={handleEndSession} />
    </div>
  );
};

export default InterviewRoom;