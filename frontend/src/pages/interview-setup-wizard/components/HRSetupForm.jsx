import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../utils/api';

const HRSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "expert", label: "Expert (5+ years)" }
  ];

  const industries = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance & Banking" },
    { value: "healthcare", label: "Healthcare" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "consulting", label: "Consulting" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "education", label: "Education" },
    { value: "media", label: "Media & Entertainment" },
    { value: "automotive", label: "Automotive" },
    { value: "real-estate", label: "Real Estate" }
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await api.get('/setup/companies');
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setCompanies([]);
      }
      setLoadingCompanies(false);
    };

    fetchCompanies();
  }, []);

  const handleFieldChange = (field) => (value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          HR Interview Setup
        </h3>
        <p className="text-muted-foreground text-sm">
          Prepare for behavioral questions and company culture discussions.
        </p>
      </div>
      <div className="space-y-4">
        <Input
          label="Job Role"
          type="text"
          placeholder="e.g., Marketing Manager, Sales Executive"
          description="Enter the position you're applying for"
          value={formData?.jobRole || ''}
          onChange={(e) => handleFieldChange('jobRole')(e.target.value)}
          error={errors?.jobRole}
          required
        />

        <Select
          label="Target Company"
          description="Select the company you are interviewing with"
          placeholder="Choose a company"
          options={companies}
          value={formData?.company}
          onChange={handleFieldChange('company')}
          error={errors?.company}
          loading={loadingCompanies}
          searchable
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Experience Level"
            description="Your professional experience"
            placeholder="Select experience level"
            options={experienceLevels}
            value={formData?.experienceLevel}
            onChange={handleFieldChange('experienceLevel')}
            error={errors?.experienceLevel}
            required
          />

          <Select
            label="Industry"
            description="Target industry sector"
            placeholder="Choose industry"
            options={industries}
            value={formData?.industry}
            onChange={handleFieldChange('industry')}
            error={errors?.industry}
            required
            searchable
          />
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Interview Focus Areas:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Behavioral and situational questions</li>
          <li>• Career goals and motivation</li>
          <li>• Company culture fit assessment</li>
          <li>• Strengths and weaknesses discussion</li>
          <li>• Leadership and teamwork scenarios</li>
        </ul>
      </div>
    </div>
  );
};

export default HRSetupForm;