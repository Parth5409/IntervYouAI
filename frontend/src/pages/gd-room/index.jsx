import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import io from 'socket.io-client';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import useAuth from '../../hooks/useAuth';

import SessionControls from '../../components/ui/SessionControls';
import ParticipantsGrid from './components/ParticipantsGrid';
import DiscussionTopic from './components/DiscussionTopic';
import GDTranscript from './components/GDTranscript';
import Icon from '../../components/AppIcon';
import VoiceControls from '../interview-room/components/VoiceControls';

const TimerDisplay = ({ time }) => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-black/50 p-4 rounded-lg">
    <p className="text-white text-6xl font-bold">{time}</p>
    <p className="text-white/80 text-lg">Seconds to speak</p>
  </div>
);

const GDRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);

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
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [turnTimer, setTurnTimer] = useState(0);

  // Speech Recognition
  const { transcript: sttTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Effects
  useEffect(() => {
    socketRef.current = io('http://localhost:8000', { path: '/socket.io' });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      if (user?.id) {
        socketRef.current.emit('start_discussion', { session_id: sessionId, user_id: user.id });
      }
    });

    socketRef.current.on('session_started', ({ topic, participants }) => {
      setSessionDetails({ context: { topic } });
      setParticipants(participants);
      setIsLoading(false);
      setIsSessionActive(true);
    });

    socketRef.current.on('new_message', (message) => {
      setMessages(prev => [...prev, { ...message, timestamp: new Date() }]);
    });

    socketRef.current.on('speaker_change', ({ speaker_id }) => {
      setActiveSpeakerId(speaker_id);
      setIsAISpeaking(speaker_id !== 'human_user');
    });

    socketRef.current.on('start_turn_window', () => {
      setTurnTimer(5); // 5-second window
    });

    socketRef.current.on('discussion_ended', ({ feedback }) => {
      navigate('/interview-feedback', { state: { sessionData: { feedback } } });
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket Error:', error.message);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!listening && sttTranscript) {
      handleSendMessage(sttTranscript);
    }
  }, [listening]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (turnTimer > 0) {
      const timer = setTimeout(() => setTurnTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (turnTimer === 0 && isSessionActive && !listening) {
      socketRef.current.emit('pass_turn', { session_id: sessionId });
    }
  }, [turnTimer, isSessionActive, listening, sessionId]);

  // Handlers
  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return;
    socketRef.current.emit('user_message', { session_id: sessionId, message: messageText });
    resetTranscript();
  };

  const handleToggleListening = () => {
    if (isMuted) return;

    if (isAISpeaking) {
      // Interrupt logic
      setIsInterrupting(true);
      if (listening) {
        SpeechRecognition.stopListening();
      } else {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      }
    } else {
      // Normal recording logic
      if (listening) {
        SpeechRecognition.stopListening();
      } else {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      }
    }
  };

  const handleEndSession = () => {
    socketRef.current.emit('end_discussion', { session_id: sessionId });
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition. Please use Google Chrome.</span>;
  }

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
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <DiscussionTopic topic={sessionDetails?.context?.topic || 'Loading...'} />
            <ParticipantsGrid participants={participants} activeSpeakerId={activeSpeakerId} />
            {turnTimer > 0 && <TimerDisplay time={turnTimer} />}
            <VoiceControls 
                isListening={listening}
                isMuted={isMuted}
                onToggleListening={handleToggleListening}
                onToggleMute={() => setIsMuted(!isMuted)}
                disabled={isAISpeaking}
            />
        </div>

        <div className="w-full lg:w-2/5 border-l border-border flex flex-col">
            <GDTranscript messages={messages} isLoading={isAISpeaking} participants={participants} />
        </div>
      </div>

      <SessionControls
        isRecording={listening}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={handleToggleListening}
        onToggleMute={() => setIsMuted(!isMuted)}
        onEndSession={handleEndSession}
        showTimer={false}
      />
    </div>
  );
};

export default GDRoom;