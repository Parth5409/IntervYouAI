import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';

const GroupDiscussionSetupForm = ({ formData, onChange, errors }) => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const durations = [
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" }
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const response = await api.get('/setup/topics');
        setTopics(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch GD topics:", error);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicChange = (value) => {
    onChange({
      ...formData,
      topic: value
    });
  };

  const handleDurationChange = (value) => {
    onChange({
      ...formData,
      duration: value
    });
  };

  const selectedTopic = topics?.find(topic => topic?.value === formData?.topic);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Group Discussion Setup
        </h3>
        <p className="text-muted-foreground text-sm">
          Practice your communication and leadership skills in a group setting.
        </p>
      </div>
      <div className="space-y-4">
        <Select
          label="Discussion Topic"
          description="Choose a topic for group discussion"
          placeholder="Select a topic"
          options={topics}
          value={formData?.topic}
          onChange={handleTopicChange}
          error={errors?.topic}
          loading={loadingTopics}
          required
          searchable
        />

        {selectedTopic && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="MessageSquare" size={16} color="var(--color-primary)" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {selectedTopic?.label}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {selectedTopic?.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Duration"
            description="Discussion duration"
            placeholder="Select duration"
            options={durations}
            value={formData?.duration}
            onChange={handleDurationChange}
            error={errors?.duration}
            required
          />
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Skills Evaluated:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} color="var(--color-success)" />
            <span>Communication Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} color="var(--color-success)" />
            <span>Leadership Qualities</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} color="var(--color-success)" />
            <span>Team Collaboration</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Check" size={14} color="var(--color-success)" />
            <span>Critical Thinking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionSetupForm;