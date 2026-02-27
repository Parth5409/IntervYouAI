import React, { useState, useEffect } from 'react';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const GroupDiscussionSetupForm = ({ formData, onChange, errors }) => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const durations = [
    { value: "15", label: "15_MINUTES (BLITZ)" },
    { value: "20", label: "20_MINUTES (STANDARD)" },
    { value: "30", label: "30_MINUTES (EXTENDED)" },
    { value: "45", label: "45_MINUTES (MARATHON)" }
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        // Fallback topics if API fails
        const mockTopics = [
          { value: 'ai-ethics', label: 'ETHICAL_IMPLICATIONS_OF_AI', description: 'Discuss the impact of AI on privacy, employment, and societal structures.' },
          { value: 'remote-work', label: 'REMOTE_VS_OFFICE_PARADIGM', description: 'Analyze the long-term efficiency and cultural impacts of remote work models.' },
          { value: 'green-tech', label: 'SUSTAINABLE_TECHNOLOGY_FUTURE', description: 'Evaluating the transition to green energy and circular economy models.' }
        ];
        
        // We could use an actual endpoint here if available
        // const response = await api.get('setup/gd-topics');
        // setTopics(response.data.data || mockTopics);
        setTopics(mockTopics);
      } catch (error) {
        console.error("Failed to fetch GD topics:", error);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  const selectedTopic = topics?.find(topic => topic?.value === formData?.topic);

  return (
    <div className="space-y-8">
      <div className="border-l-2 border-amber-500 pl-4">
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-[0.2em]">
          COLLECTIVE_DISCOURSE_CONFIGURATION
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Establish simulation parameters for multi-agent interaction
        </p>
      </div>

      <div className="space-y-6">
        <Select
          label="Discussion_Topic (Vector)"
          placeholder={loadingTopics ? "SYNCING_TOPICS..." : "SELECT_TOPIC"}
          options={topics}
          value={formData?.topic}
          onChange={handleFieldChange('topic')}
          error={errors?.topic}
          required
        />

        {selectedTopic && (
          <div className="bg-slate-900 border border-slate-800 p-4 font-mono">
            <div className="flex items-start gap-4">
              <Icon name="Info" size={16} className="text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">DEBRIEF_SUMMARY</p>
                <p className="text-[11px] text-slate-300 leading-relaxed">{selectedTopic?.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <Select
            label="Temporal_Window (Duration)"
            placeholder="SELECT_DURATION"
            options={durations}
            value={formData?.duration}
            onChange={handleFieldChange('duration')}
            error={errors?.duration}
            required
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon name="MessageSquare" size={64} className="text-amber-500" />
        </div>
        <h4 className="text-[10px] font-mono font-bold text-amber-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500" />
          DISCOURSE_EVALUATION_METRICS
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'MULTI_AGENT_SYNCHRONIZATION',
            'ARGUMENTATIVE_STRUCTURE_ANALYSIS',
            'COOPERATIVE_LOGIC_TRACKING',
            'FACILITATIVE_INFLUENCE_SCORING'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-slate-700 font-mono text-[10px]">0{i+1}</span>
              <span className="text-slate-400 font-mono text-[9px] uppercase tracking-tighter">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionSetupForm;