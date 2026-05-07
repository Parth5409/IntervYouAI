import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import useAuth from '../../../hooks/useAuth';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { useCamera } from '../../../hooks/useCamera';
import api, { engineApi, getAiEngineDirectURL } from '../../../utils/api';

import { playAudioFromBase64 } from '../../../utils/audioPlayer';

// Import Components
import InterviewProgressNav from '../../../components/ui/InterviewProgressNav';
import SessionControls from '../../../components/ui/SessionControls';
import CameraPreview from '../../../components/ui/CameraPreview';
import Icon from '../../../components/AppIcon';
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

  // Custom hooks
  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useAudioRecorder();
  const { stream, isActive: isCameraActive, error: cameraError, startCamera, stopCamera } = useCamera();

  // --- EFFECTS ---

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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
      
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden pt-16">
        {/* Left: Main Interaction Zone */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden">
          {/* Active Status Badge */}
          <div className="absolute top-6 left-10 flex items-center gap-3 z-20 bg-white/[0.03] backdrop-blur-3xl px-4 py-2 rounded-xl border border-white/5 shadow-xl">
            <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            <span className="font-headline text-[9px] font-black text-white uppercase tracking-widest">Interview in Progress</span>
          </div>

          {/* Local Camera Feed - Tactical Floating Window */}
          <div className="absolute top-6 right-10 z-20 w-40 aspect-video sm:w-56">
             <CameraPreview 
               stream={stream}
               isActive={isCameraActive}
               error={cameraError}
               className="rounded-2xl shadow-2xl border-white/10"
               overlayLabel="Your Feed"
             />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-4xl w-full overflow-hidden">
            <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
              {/* Orbital Avatar Nesting */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[100%] aspect-square border border-primary/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="w-[110%] aspect-square border border-dashed border-primary/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
              </div>
              
              <AIAvatar isSpeaking={isAIPlaying} size="large" isActive={isSessionActive && !isAIPlaying} />
            </div>
            
            <div className="shrink-0 w-full flex justify-center py-4">
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
        <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] flex-col border-l border-white/5 bg-white/[0.02] backdrop-blur-3xl shrink-0 h-full shadow-2xl">
          <div className="p-4 sm:p-6 border-b border-white/5 bg-white/[0.01]">
            <SessionProgress
              currentPhase={sessionDetails?.session_type || 'TECHNICAL_PROTOCOL'}
              sessionTime={sessionTime}
              questionsAnswered={questionsAnswered}
              totalQuestions={totalQuestions}
            />
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <Icon name="ms:history" size={14} className="text-primary" />
                <span className="font-headline text-[10px] text-white font-black uppercase tracking-widest">Transcript stream</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-[8px] text-secondary font-black uppercase tracking-widest">Live Sync</span>
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
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