import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';

import InterviewProgressNav from '../../components/ui/InterviewProgressNav';
import SessionControls from '../../components/ui/SessionControls';
import AIAvatar from './components/AIAvatar';
import ConversationTranscript from './components/ConversationTranscript';
import VoiceControls from './components/VoiceControls';
import SessionProgress from './components/SessionProgress';
import EmergencyExit from './components/EmergencyExit';
import api from '../../utils/api';

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [sessionDetails, setSessionDetails] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { transcript: sttTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    const startInterview = async () => {
      try {
        const detailsRes = await api.get(`/session/${sessionId}`);
        setSessionDetails(detailsRes.data.data);

        const startRes = await api.post(`/interview/${sessionId}/start`);
        const firstMessage = startRes.data.data.message;

        setConversationHistory([{
          id: Date.now(),
          speaker: 'AI',
          text: firstMessage,
          type: 'ai',
          timestamp: new Date()
        }]);
        setIsSessionActive(true);
        setIsAISpeaking(false);
      } catch (error) {
        console.error("Failed to start interview:", error);
        navigate('/dashboard');
      }
    };
    startInterview();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (!listening && sttTranscript) {
      sendMessage(sttTranscript);
    }
  }, [listening]);

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);

    const userMessage = {
      id: Date.now(),
      speaker: 'You',
      text: messageText,
      type: 'user',
      timestamp: new Date(),
    };
    setConversationHistory(prev => [...prev, userMessage]);
    resetTranscript();
    setIsAISpeaking(true);

    try {
      const { data } = await api.post(`/interview/${sessionId}/message`, { message: messageText });
      const aiMessage = {
        id: Date.now() + 1,
        speaker: 'AI',
        text: data.data.message,
        type: 'ai',
        timestamp: new Date(),
      };
      setConversationHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errMessage = {
        id: Date.now() + 1,
        speaker: 'AI',
        text: "I'm sorry, I encountered an error. Could you please repeat that?",
        type: 'ai',
        timestamp: new Date(),
      };
      setConversationHistory(prev => [...prev, errMessage]);
    } finally {
      setIsAISpeaking(false);
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    setIsSessionActive(false);
    try {
      const { data } = await api.post(`/interview/${sessionId}/end`);
      navigate('/interview-feedback', { state: { sessionData: data.data } });
    } catch (error) {
      console.error("Failed to end session:", error);
      navigate('/dashboard');
    }
  };

  const questionsAnswered = useMemo(() => {
    return conversationHistory.filter(msg => msg.type === 'user').length;
  }, [conversationHistory]);

  const totalQuestions = useMemo(() => {
    return sessionDetails?.context?.max_questions || 8;
  }, [sessionDetails]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition. Please use Google Chrome.</span>;
  }

  return (
    <div className="min-h-screen bg-background">
      <InterviewProgressNav currentStep={2} totalSteps={3} />
      <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-64px)]">
        <div className="flex-1 lg:w-3/5 flex flex-col items-center justify-center p-6 space-y-8">
          <AIAvatar isSpeaking={isAISpeaking} size="xlarge" />
          <VoiceControls
            isListening={listening}
            isMuted={isMuted}
            onToggleListening={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true })}
            onToggleMute={() => setIsMuted(!isMuted)}
            disabled={isAISpeaking}
          />
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
            <ConversationTranscript transcript={conversationHistory} isLoading={isAISpeaking} />
          </div>
        </div>
      </div>
      <SessionControls
        isRecording={listening}
        isMuted={isMuted}
        sessionTime={sessionTime}
        onToggleRecording={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true })}
        onToggleMute={() => setIsMuted(!isMuted)}
        onEndSession={handleEndSession}
      />
      <EmergencyExit onExit={handleEndSession} />
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default InterviewRoom;