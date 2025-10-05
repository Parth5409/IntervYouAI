import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import io from 'socket.io-client';
import useAuth from '../../hooks/useAuth';

import SessionControls from '../../components/ui/SessionControls';
import ParticipantsGrid from './components/ParticipantsGrid';
import DiscussionTopic from './components/DiscussionTopic';
import GDTranscript from './components/GDTranscript';
import Icon from '../../components/AppIcon';
import VoiceControls from '../interview-room/components/VoiceControls';
import api from '../../utils/api';

import { playAudioFromBase64 } from '../../utils/audioPlayer';

const TimerDisplay = ({ time }) => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black/50 p-4 rounded-lg backdrop-blur-sm">
    <p className="text-white text-6xl font-bold">{time}</p>
    <p className="text-white/80 text-lg">Seconds to interrupt</p>
  </div>
);

const GDRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // State
  const [sessionDetails, setSessionDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interruptionTimer, setInterruptionTimer] = useState(0);
  const [isInterruptionWindow, setIsInterruptionWindow] = useState(false);

  const { isRecording, audioBlob, startRecording, stopRecording, resetAudio } = useAudioRecorder();

  const startInterruption = useCallback(() => {
    setInterruptionTimer(5);
    setIsInterruptionWindow(true);
    setIsAISpeaking(false);
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io('http://localhost:8000', { path: '/socket.io' });
    const socket = socketRef.current;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, { ...message, timestamp: new Date() }]);
      if (message.audio) {
        setIsAIPlaying(true);
        playAudioFromBase64(message.audio, () => {
          setIsAIPlaying(false);
          // Start interruption window only for bot messages after audio ends
          if (message.speaker_id !== 'moderator' && message.speaker_id !== 'human_user') {
            startInterruption();
          }
        });
      }
      setIsAISpeaking(false);
    };

    const handleSpeakerChange = ({ speaker_id }) => {
      setActiveSpeakerId(speaker_id);
      setIsAISpeaking(speaker_id !== 'human_user');
    };

    const handleStartTurnWindow = () => {
      setInterruptionTimer(0);
      setIsInterruptionWindow(false);
      setIsAISpeaking(false);
    };

    const handleDiscussionEnded = ({ session_id }) => {
      navigate(`/gd-feedback/${session_id}`);
    };

    socket.on('connect', () => {
      socket.emit('start_discussion', { session_id: sessionId, user_id: user.id });
    });

    socket.on('session_started', ({ topic, participants }) => {
      setSessionDetails({ context: { topic } });
      setParticipants(participants);
      setIsLoading(false);
      setIsSessionActive(true);
    });

    socket.on('new_message', handleNewMessage);
    socket.on('speaker_change', handleSpeakerChange);
    socket.on('start_turn_window', handleStartTurnWindow);
    socket.on('discussion_ended', handleDiscussionEnded);
    socket.on('error', (error) => console.error('Socket Error:', error.message));

    const handleUserMessageProcessed = ({ transcript }) => {
      const userMessage = {
        speaker_id: 'human_user',
        speaker_name: 'You',
        message: transcript,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTranscribing(false);
      setIsAISpeaking(true); // Wait for bot response
    };

    socket.on('user_message_processed', handleUserMessageProcessed);

    return () => {
      socket.disconnect();
    };
  }, [sessionId, navigate, user?.id]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (interruptionTimer > 0) {
      const timer = setTimeout(() => setInterruptionTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (interruptionTimer === 0 && isInterruptionWindow) {
      setIsInterruptionWindow(false);
      if (socketRef.current && !isRecording) {
        socketRef.current.emit('pass_turn', { session_id: sessionId });
        setIsAISpeaking(true);
      }
    }
  }, [interruptionTimer, isInterruptionWindow, isRecording, sessionId]);

  useEffect(() => {
    if (isRecording && isInterruptionWindow) {
      setInterruptionTimer(0);
      setIsInterruptionWindow(false);
    }
  }, [isRecording, isInterruptionWindow]);

  useEffect(() => {
    if (audioBlob && socketRef.current) {
      setIsTranscribing(true);
      socketRef.current.emit('gd_audio_chunk', {
        session_id: sessionId,
        audio_blob: audioBlob,
      });
      resetAudio();
    }
  }, [audioBlob, sessionId, resetAudio]);

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
      socketRef.current.emit('end_discussion', { session_id: sessionId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Group Discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Icon name="MessageSquare" size={16} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Group Discussion</h1>
        </div>
        <div className="text-sm font-mono text-foreground bg-muted px-3 py-1 rounded-full">
          {new Date(sessionTime * 1000).toISOString().substr(14, 5)}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:flex-1 flex flex-col items-center justify-center p-6 space-y-6 relative">
          <DiscussionTopic topic={sessionDetails?.context?.topic || 'Loading...'} />
          <ParticipantsGrid participants={participants} activeSpeakerId={activeSpeakerId} />
          {isInterruptionWindow && interruptionTimer > 0 && <TimerDisplay time={interruptionTimer} />}
          <VoiceControls
            isRecording={isRecording}
            isMuted={isMuted}
            onToggleRecording={handleToggleRecording}
            onToggleMute={() => setIsMuted(!isMuted)}
            disabled={isAISpeaking || isAIPlaying || isTranscribing}
            isTranscribing={isTranscribing}
          />
        </div>

        {/* Updated transcript container */}
        <div className="flex-1 lg:flex-initial w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-border flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
          <GDTranscript messages={messages} isLoading={isAISpeaking && activeSpeakerId !== 'human_user'} participants={participants} />
        </div>
      </div>

      <SessionControls
        isRecording={isRecording}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={handleToggleRecording}
        onToggleMute={() => setIsMuted(!isMuted)}
        onEndSession={handleEndSession}
        showTimer={false}
      />
    </div>
  );
};

export default GDRoom;