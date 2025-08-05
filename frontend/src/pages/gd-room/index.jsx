import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionControls from '../../components/ui/SessionControls';
import ParticipantsGrid from './components/ParticipantsGrid';
import DiscussionTopic from './components/DiscussionTopic';
import GDTranscript from './components/GDTranscript';
import Icon from '../../components/AppIcon';
import VoiceControls from '../interview-room/components/VoiceControls';

const GDRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionConfig = location.state?.configuration || {
    topic: "The Future of Remote Work",
    duration: 20,
    num_bots: 4
  };

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState('moderator');
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [turnIndex, setTurnIndex] = useState(0);

  const botPersonalities = {
    supportive: { name: 'Alex' },
    assertive: { name: 'Sam' },
    factual: { name: 'Jordan' },
    analytical: { name: 'Casey' },
    creative: { name: 'Morgan' }
  };

  const initializeSession = useCallback(() => {
    const botKeys = Object.keys(botPersonalities).sort(() => 0.5 - Math.random()).slice(0, sessionConfig.num_bots || 4);
    const bots = botKeys.map(key => ({ id: `bot_${key}`, name: botPersonalities[key].name, personality: key, is_human: false }));
    const allParticipants = [{ id: 'human_user', name: 'You', personality: 'human', is_human: true }, ...bots];
    setParticipants(allParticipants);

    const openingMessage = {
      speaker_id: 'moderator',
      message: `Welcome everyone to today's group discussion on: "${sessionConfig.topic}". We have ${bots.map(b => b.name).join(', ')} and yourself participating today. Let's begin with opening thoughts. Who would like to start?`,
    };

    setMessages([openingMessage]);
    setIsLoading(false);
    setIsSessionActive(true);
    setTimeout(() => setActiveSpeakerId('human_user'), 3000);
  }, [sessionConfig.topic, sessionConfig.num_bots]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    let interval;
    if (isListening && !isMuted) {
      interval = setInterval(() => {
        setMicrophoneLevel(Math.random() * 100);
      }, 100);
    } else {
      setMicrophoneLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening, isMuted]);

  const handleUserMessage = (messageText) => {
    const userMessage = { speaker_id: 'human_user', message: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsListening(false);
    setActiveSpeakerId(null);
    
    const bots = participants.filter(p => !p.is_human);
    if (bots.length > 0) {
        const nextBot = bots[turnIndex % bots.length];
        setTurnIndex(prev => prev + 1);
        setActiveSpeakerId(nextBot.id);

        setTimeout(() => {
            const botMessage = {
                speaker_id: nextBot.id,
                message: `That's an interesting point. I also think we should consider the impact on company culture.`
            };
            setMessages(prev => [...prev, botMessage]);
            setActiveSpeakerId('human_user');
        }, 2000);
    }
  };

  const handleToggleListening = () => {
    if (!isMuted) {
      if (isListening) {
        handleUserMessage("This is a sample user response, demonstrating the flow of conversation.");
      } else {
        setIsListening(true);
      }
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) setIsListening(false);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    navigate('/dashboard');
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
        {/* Main Content Panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
            <DiscussionTopic topic={sessionConfig.topic} />
            <ParticipantsGrid participants={participants} activeSpeakerId={activeSpeakerId} />
            <VoiceControls 
                isListening={isListening}
                isMuted={isMuted}
                microphoneLevel={microphoneLevel}
                onToggleListening={handleToggleListening}
                onToggleMute={handleToggleMute}
            />
        </div>

        {/* Transcript Panel */}
        <div className="w-full lg:w-2/5 border-l border-border flex flex-col">
            <GDTranscript messages={messages} isLoading={activeSpeakerId && activeSpeakerId !== 'human_user'} participants={participants} />
        </div>
      </div>

      <SessionControls
        isRecording={isListening}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={handleToggleListening}
        onToggleMute={handleToggleMute}
        onEndSession={handleEndSession}
        microphoneLevel={microphoneLevel}
        showTimer={false}
      />
    </div>
  );
};

export default GDRoom;