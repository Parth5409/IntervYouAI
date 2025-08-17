import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';

import SessionControls from '../../components/ui/SessionControls';
import ParticipantsGrid from './components/ParticipantsGrid';
import DiscussionTopic from './components/DiscussionTopic';
import GDTranscript from './components/GDTranscript';
import Icon from '../../components/AppIcon';
import VoiceControls from '../interview-room/components/VoiceControls';
import api from '../../utils/api';

const GDRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

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
  const [isSending, setIsSending] = useState(false); // Lock

  // Speech Recognition
  const { transcript: sttTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Effects
  useEffect(() => {
    const startGDSession = async () => {
      try {
        const detailsRes = await api.get(`/session/${sessionId}`);
        setSessionDetails(detailsRes.data.data);

        const startRes = await api.post(`/gd/${sessionId}/start`);
        const { participants, opening_message } = startRes.data.data;
        
        setParticipants(participants || []);
        setMessages([{ speaker_id: 'moderator', message: opening_message, timestamp: new Date() }]);
        setIsSessionActive(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to start GD session:", error);
        navigate('/dashboard');
      }
    };
    startGDSession();
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

  // Handlers
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    const userMessage = { speaker_id: 'human_user', message: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    resetTranscript();
    setIsAISpeaking(true);

    try {
      const { data } = await api.post(`/gd/${sessionId}/message`, { message: messageText });
      const botResponses = data.data.bot_responses || [];
      
      for (const res of botResponses) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        setActiveSpeakerId(res.speaker_id);
        const botMessage = { speaker_id: res.speaker_id, speaker_name: res.speaker_name, message: res.message, timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error("Failed to send GD message:", error);
    } finally {
      setActiveSpeakerId(null);
      setIsAISpeaking(false);
      setIsSending(false);
    }
  };

  const handleToggleListening = () => {
    if (isMuted || isAISpeaking) return;
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleEndSession = async () => {
    setIsSessionActive(false);
    try {
      const { data } = await api.post(`/gd/${sessionId}/end`);
      navigate('/interview-feedback', { state: { sessionData: data.data } });
    } catch (error) {
      console.error("Failed to end GD session:", error);
      navigate('/dashboard');
    }
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