import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const GroupDiscussionSetupForm = ({ formData, onChange, errors }) => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Mock GD topics data
  const mockTopics = [
    { 
      value: "remote-work-future", 
      label: "The Future of Remote Work",
      description: "Impact on productivity and work-life balance"
    },
    { 
      value: "ai-job-displacement", 
      label: "AI and Job Displacement",
      description: "Technology\'s impact on employment"
    },
    { 
      value: "social-media-society", 
      label: "Social Media\'s Impact on Society",
      description: "Benefits vs. negative effects"
    },
    { 
      value: "climate-change-business", 
      label: "Climate Change and Business Responsibility",
      description: "Corporate environmental obligations"
    },
    { 
      value: "education-system-reform", 
      label: "Education System Reform",
      description: "Traditional vs. modern learning approaches"
    },
    { 
      value: "startup-vs-corporate", 
      label: "Startup vs. Corporate Career",
      description: "Pros and cons of different work environments"
    },
    { 
      value: "digital-privacy", 
      label: "Digital Privacy in Modern Age",
      description: "Balancing convenience with privacy"
    },
    { 
      value: "work-life-balance", 
      label: "Work-Life Balance in Competitive World",
      description: "Achieving personal and professional success"
    },
    { 
      value: "entrepreneurship-youth", 
      label: "Entrepreneurship Among Youth",
      description: "Encouraging innovation and risk-taking"
    },
    { 
      value: "globalization-impact", 
      label: "Globalization and Cultural Identity",
      description: "Preserving culture in connected world"
    }
  ];

  const groupSizes = [
    { value: "small", label: "Small Group (4-6 participants)" },
    { value: "medium", label: "Medium Group (7-10 participants)" },
    { value: "large", label: "Large Group (11-15 participants)" }
  ];

  const durations = [
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" }
  ];

  useEffect(() => {
    // Simulate API call to fetch GD topics
    setLoadingTopics(true);
    setTimeout(() => {
      setTopics(mockTopics);
      setLoadingTopics(false);
    }, 600);
  }, []);

  const handleTopicChange = (value) => {
    onChange({
      ...formData,
      topic: value
    });
  };

  const handleGroupSizeChange = (value) => {
    onChange({
      ...formData,
      groupSize: value
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
            label="Group Size"
            description="Simulated group size"
            placeholder="Choose group size"
            options={groupSizes}
            value={formData?.groupSize}
            onChange={handleGroupSizeChange}
            error={errors?.groupSize}
            required
          />

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