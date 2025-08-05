import { useState, useEffect } from 'react';

// Mock bot responses for variety
const botResponses = {
  supportive: [
    "I agree with that point. It's important to consider everyone's perspective.",
    "That's a great idea. Building on that, I think we could also...",
    "I really like how you've framed that. It helps clarify the issue for me.",
  ],
  assertive: [
    "I see your point, but I think we need to be more direct. The core issue is...",
    "I have a strong opinion on this. We must prioritize the most impactful solution.",
    "Let's challenge that assumption. Is there data to support it?",
  ],
  factual: [
    "According to recent studies, the trend shows that...",
    "Let's stick to the data. The numbers indicate that...",
    "From a purely factual standpoint, we have to acknowledge...",
  ],
  analytical: [
    "Let's break this down. What are the pros and cons of that approach?",
    "If we look at this from another angle, we might see...",
    "I think there are a few components to this problem we need to separate.",
  ],
  creative: [
    "What if we thought about this completely differently? For example...",
    "Here's a wild idea, but it might just work. What if we...",
    "That makes me think of an unconventional solution. Let's explore it.",
  ],
};

const useMockGDSocket = () => {
  const [listeners, setListeners] = useState({});
  const [participants, setParticipants] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const on = (eventName, callback) => {
    setListeners(prev => ({ ...prev, [eventName]: [...(prev[eventName] || []), callback] }));
  };

  const trigger = (eventName, data) => {
    if (listeners[eventName]) {
      listeners[eventName].forEach(callback => callback(data));
    }
  };

  const botPersonalities = {
    supportive: { name: 'Alex' },
    assertive: { name: 'Sam' },
    factual: { name: 'Jordan' },
    analytical: { name: 'Casey' },
    creative: { name: 'Morgan' }
  };

  const handleEvent = (eventName, data) => {
    switch (eventName) {
      case 'create_session': {
        const botKeys = Object.keys(botPersonalities).sort(() => 0.5 - Math.random()).slice(0, data.num_bots || 4);
        const bots = botKeys.map(key => ({ id: `bot_${key}`, name: botPersonalities[key].name, personality: key, is_human: false }));
        const allParticipants = [{ id: 'human_user', name: 'You', personality: 'human', is_human: true }, ...bots];
        
        setParticipants(allParticipants);
        
        trigger('session_created', {
          session_id: 'mock_session_123',
          topic: data.topic,
          participants: allParticipants,
        });
        
        trigger('new_message', {
          speaker_id: 'moderator',
          message: `Welcome everyone to today's group discussion on: "${data.topic}". Let's begin with opening thoughts. Who would like to start?`,
        });

        setTimeout(() => {
          trigger('speaker_change', { speaker_id: 'human_user' });
        }, 1500);
        break;
      }
      
      case 'user_message': {
        trigger('new_message', {
          speaker_id: 'human_user',
          message: data.message,
        });

        setTimeout(() => {
          const bots = participants.filter(p => !p.is_human);
          if (bots.length === 0) return;
          const nextBot = bots[turnIndex % bots.length];
          setTurnIndex(prev => prev + 1);

          trigger('speaker_change', { speaker_id: nextBot.id });
          
          setTimeout(() => {
            const responses = botResponses[nextBot.personality] || ["That's an interesting point."];
            const response = responses[Math.floor(Math.random() * responses.length)];

            trigger('new_message', {
              speaker_id: nextBot.id,
              message: response,
            });

            setTimeout(() => {
              trigger('speaker_change', { speaker_id: 'human_user' });
            }, 1500);

          }, 2000 + Math.random() * 1500);

        }, 500);
        break;
      }

      default:
        break;
    }
  };

  useEffect(() => {
    setTimeout(() => {
      trigger('connect');
    }, 500);

    return () => {
      trigger('disconnect');
    };
  }, []);

  return { on, emit: handleEvent };
};

export default useMockGDSocket;
