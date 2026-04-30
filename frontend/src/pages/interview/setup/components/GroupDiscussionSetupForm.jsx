import React, { useState, useEffect } from 'react';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const GroupDiscussionSetupForm = ({ formData, onChange, errors }) => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const durations = [
    { value: "15", label: "15 Minutes (Blitz)" },
    { value: "20", label: "20 Minutes (Standard)" },
    { value: "30", label: "30 Minutes (Extended)" },
    { value: "45", label: "45 Minutes (Marathon)" }
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const mockTopics = [
          { value: 'ai-ethics', label: 'Ethical Implications of AI', description: 'Discuss the impact of AI on privacy, employment, and societal structures.' },
          { value: 'remote-work', label: 'Remote vs Office Paradigm', description: 'Analyze the long-term efficiency and cultural impacts of remote work models.' },
          { value: 'green-tech', label: 'Sustainable Technology Future', description: 'Evaluating the transition to green energy and circular economy models.' }
        ];
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
    <div className="space-y-12">
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-on-surface uppercase tracking-tight flex items-center gap-4">
          <div className="w-1.5 h-8 bg-amber-500 rounded-full shadow-sm" />
          Collective Discourse
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Simulating Multi-Agent Interaction Dynamics
        </p>
      </div>

      <div className="space-y-12">
        <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl space-y-8">
          <Select
            label="Discourse Topic (Vector)"
            placeholder={loadingTopics ? "Syncing Modules..." : "Select Subject"}
            options={topics}
            value={formData?.topic}
            onChange={handleFieldChange('topic')}
            error={errors?.topic}
            required
          />

          <AnimatePresence>
            {selectedTopic && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-8"
              >
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Icon name="ms:info" size={20} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-[0.3em] opacity-60">Mission Parameters</p>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed opacity-80">{selectedTopic?.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Temporal Window"
              placeholder="Select Duration"
              options={durations}
              value={formData?.duration}
              onChange={handleFieldChange('duration')}
              error={errors?.duration}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-500/5 rounded-[3rem] border border-amber-500/20 p-12 relative overflow-hidden group shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-6 transform group-hover:scale-110">
          <Icon name="ms:forum" size={120} className="text-amber-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="space-y-4 max-w-md">
            <h4 className="text-[11px] font-extrabold text-amber-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Evaluation Matrix
            </h4>
            <p className="font-body text-base text-on-surface-variant opacity-70 leading-relaxed">
              Discourse metrics are captured across multi-agent synchronization and argumentative structure analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
            {[
              { text: 'Multi-Agent Synchronization', icon: 'ms:sync' },
              { text: 'Argumentative Structure Root', icon: 'ms:account_tree' },
              { text: 'Cooperative Logic Tracking', icon: 'ms:hub' },
              { text: 'Facilitative Influence Score', icon: 'ms:stars' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-amber-500 border border-outline-variant/10 group-hover/item:bg-amber-500 group-hover/item:text-on-surface transition-all duration-500 shadow-md">
                  <Icon name={item.icon} size={22} />
                </div>
                <span className="text-on-surface font-extrabold text-[10px] uppercase tracking-widest leading-tight transition-colors group-hover/item:text-amber-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionSetupForm;