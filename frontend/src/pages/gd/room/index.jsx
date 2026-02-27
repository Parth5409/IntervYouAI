import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import io from 'socket.io-client';
import useAuth from '../../../hooks/useAuth';

import SessionControls from '../../../components/ui/SessionControls';
import ParticipantsGrid from './components/ParticipantsGrid';
import DiscussionTopic from './components/DiscussionTopic';
import GDTranscript from './components/GDTranscript';
import Icon from '../../../components/AppIcon';
import VoiceControls from '../../interview/room/components/VoiceControls';
import api, { engineApi, getAiEngineDirectURL } from '../../../utils/api';

import { playAudioFromBase64 } from '../../../utils/audioPlayer';

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

    socketRef.current = io(getAiEngineDirectURL(), { 
      path: '/api/engine/socket.io',
      transports: ['websocket']
    });
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
      navigate(`/gd/feedback/${session_id}`);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="font-mono text-[10px] text-emerald-500 uppercase tracking-[0.3em] animate-pulse">
            INITIALIZING_MULTI_AGENT_ENVIRONMENT...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-amber-500 flex items-center justify-center shrink-0">
            <Icon name="Users" size={20} className="text-slate-950" />
          </div>
          <span className="font-mono font-bold tracking-tighter text-lg uppercase truncate max-w-[200px] sm:max-w-none">
            INTERVYOU.AI // COLLECTIVE_NODE
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Temporal_Marker</span>
            <span className="text-xs font-mono font-bold text-amber-500 tracking-widest">
              {new Date(sessionTime * 1000).toISOString().substr(14, 5)}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest hidden sm:inline">Stream_Live</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Left: Collective Zone */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center gap-4 sm:gap-8 overflow-hidden">
            <div className="shrink-0">
              <DiscussionTopic topic={sessionDetails?.context?.topic || 'Loading...'} />
            </div>
            
            <div className="w-full relative py-2 overflow-hidden flex items-center justify-center min-h-0">
              <div className="w-full max-h-full overflow-y-auto custom-scrollbar-hide">
                <ParticipantsGrid participants={participants} activeSpeakerId={activeSpeakerId} />
              </div>
              
              {/* Interruption Overlay */}
              {isInterruptionWindow && interruptionTimer > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                  <div className="bg-slate-950/95 border border-amber-500/50 p-6 backdrop-blur-2xl flex flex-col items-center gap-4 shadow-[0_0_100px_rgba(245,158,11,0.15)] min-w-[220px]">
                    <span className="font-mono text-[10px] text-amber-500 uppercase tracking-[0.3em]">Interruption_Window_Open</span>
                    <div className="text-6xl font-mono font-bold text-slate-100 tracking-tighter animate-pulse">
                      0{interruptionTimer}
                    </div>
                    <p className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">Activate Mic to Interject</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 py-4 w-full flex justify-center bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
            <VoiceControls
              isRecording={isRecording}
              isMuted={isMuted}
              onToggleRecording={handleToggleRecording}
              onToggleMute={() => setIsMuted(!isMuted)}
              onReplayLastMessage={() => {}} // GD doesn't support replay yet
              disabled={isAISpeaking || isAIPlaying || isTranscribing}
              isAIPlaying={isAIPlaying}
              isTranscribing={isTranscribing}
              conversationHistory={messages}
            />
          </div>
        </div>

        {/* Right: Transcription Zone */}
        <div className="hidden lg:flex lg:w-[380px] xl:w-[450px] flex-col border-l border-slate-800 bg-slate-900/50 backdrop-blur-xl shrink-0 h-full">
          <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-emerald-500" />
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">MULTI_AGENT_LOG</span>
            </div>
            <span className="font-mono text-[9px] text-slate-600 uppercase">Buffer_Active</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <GDTranscript 
              messages={messages} 
              isLoading={isAISpeaking && activeSpeakerId !== 'human_user'} 
              participants={participants} 
            />
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
        showTimer={false}
      />
    </div>
  );
};

export default GDRoom;