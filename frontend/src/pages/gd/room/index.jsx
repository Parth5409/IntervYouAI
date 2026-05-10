import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { useCamera } from '../../../hooks/useCamera';
import io from 'socket.io-client';
import useAuth from '../../../hooks/useAuth';

import { toast } from 'sonner';

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
  const { stream, isActive: isCameraActive, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera();

  const startInterruption = useCallback(() => {
    setInterruptionTimer(5);
    setIsInterruptionWindow(true);
    setIsAISpeaking(false);
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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
    socket.on('proctoring_alert', (data) => {
      toast.warning(data.message, {
        description: data.type === 'multi_face' ? 'Please ensure you are alone.' : 'Please stay visible to the camera.',
        duration: 4000,
      });
    });
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

  // Video Frame Sampling
  useEffect(() => {
    let interval;
    if (isSessionActive && socketRef.current && isCameraActive) {
      interval = setInterval(async () => {
        try {
          const frame = await captureFrame(0.4);
          if (frame && socketRef.current) {
            socketRef.current.emit('video_frame', {
              session_id: sessionId,
              image_blob: frame
            });
          }
        } catch (err) {
          console.error("Frame capture failed:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isCameraActive, captureFrame, sessionId]);

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
    if (audioBlob && socketRef.current?.connected) {
      setIsTranscribing(true);
      try {
        socketRef.current.emit('gd_audio_chunk', {
          session_id: sessionId,
          audio_blob: audioBlob,
        });
        resetAudio();
      } catch (error) {
        console.error('Error emitting audio chunk:', error);
        setIsTranscribing(false);
        // Optionally keep audioBlob for retry, but for now we follow CodeRabbit suggestion
      }
    } else if (audioBlob && socketRef.current && !socketRef.current.connected) {
      console.warn('Socket disconnected, cannot send audio chunk');
      setIsTranscribing(false);
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
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-secondary/20 border-t-secondary animate-spin" />
          <p className="font-mono text-[10px] text-secondary animate-pulse font-label font-medium text-on-surface-variant">
            Setting up discussion room...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-container-low text-on-surface flex flex-col relative overflow-hidden font-headline">
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b,1px,transparent_1px),linear-gradient(to_bottom,#1e293b,1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,70%,transparent_100%)] opacity-20 pointer-events-none" />

      <header className="h-16 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-10 relative z-30 shrink-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Icon name="ms:groups" size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-base text-white tracking-tight leading-none">
              INTERVYOU.AI <span className="text-primary">//</span> DISCUSSION ROOM
            </span>
            <span className="font-headline text-[9px] text-on-surface-variant font-black uppercase tracking-[0.2em] mt-1 opacity-60">Group Discussion Active</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-8"
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-headline text-on-surface-variant/40 font-black uppercase tracking-widest italic">Time Elapsed</span>
            <span className="text-sm font-headline font-black text-primary tabular-nums">
              {new Date(sessionTime * 1000).toISOString().substr(14, 5)}
            </span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            <span className="text-[10px] font-headline font-black text-white uppercase tracking-widest">Live</span>
          </div>
        </motion.div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Left: Collective Zone */}
        <div className="flex-1 relative flex flex-col items-center justify-between p-8 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center gap-12 overflow-hidden"
          >
            <div className="shrink-0 flex justify-center">
              <DiscussionTopic topic={sessionDetails?.context?.topic || 'Loading...'} />
            </div>
            
            <div className="w-full relative py-4 overflow-hidden flex items-center justify-center min-h-0">
              <div className="w-full max-h-full overflow-y-auto custom-scrollbar-hide pb-20">
                <ParticipantsGrid 
                  participants={participants} 
                  activeSpeakerId={activeSpeakerId} 
                  localStream={stream}
                  isCameraActive={isCameraActive}
                  cameraError={cameraError}
                />
              </div>
              
              {/* Interruption Overlay */}
              {isInterruptionWindow && interruptionTimer > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 border border-primary/20 p-8 rounded-[2.5rem] backdrop-blur-3xl flex flex-col items-center gap-6 shadow-2xl min-w-[280px]"
                  >
                    <span className="font-headline text-[10px] text-primary font-black uppercase tracking-[0.3em]">Your Turn to Speak</span>
                    <div className="text-7xl font-headline font-black text-white animate-pulse italic tracking-tighter">
                      0{interruptionTimer}
                    </div>
                    <p className="font-headline text-[9px] text-on-surface-variant font-black uppercase tracking-widest">Activate Mic to Speak</p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 py-8 w-full flex justify-center relative z-20"
          >
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
          </motion.div>
        </div>

        {/* Right: Transcription Zone */}
        <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] flex-col border-l border-white/5 bg-white/[0.02] backdrop-blur-3xl shrink-0 h-full shadow-2xl">
          <div className="px-6 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <span className="font-headline text-[9px] text-white font-black uppercase tracking-widest">Discussion Transcript</span>
            </div>
            <span className="font-headline text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest italic">Live Feed</span>
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