import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import api from '../../../utils/api';

const TechnicalSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const jobRoles = [
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Full Stack Developer" },
    { value: "mobile-developer", label: "Mobile Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "machine-learning-engineer", label: "ML Engineer" }
  ];

  const difficultyLevels = [
    { value: "Easy", label: "Easy" },
    { value: "Medium", label: "Medium" },
    { value: "Hard", label: "Hard" }
  ];

  const questionCounts = [
    { value: 5, label: "5 Questions (Quick)" },
    { value: 8, label: "8 Questions (Standard)" },
    { value: 10, label: "10 Questions (In-depth)" },
    { value: 15, label: "15 Questions (Marathon)" }
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
          Technical Interview Setup
        </h3>
        <p className="text-muted-foreground text-sm">
          Configure your technical interview session with specific role and company focus.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Select
          label="Job Role"
          description="Select the position you're preparing for"
          placeholder="Choose a job role"
          options={jobRoles}
          value={formData?.jobRole}
          onChange={handleFieldChange('jobRole')}
          error={errors?.jobRole}
          required
          searchable
        />
        <Select
          label="Target Company"
          description="Select company for interview simulation"
          placeholder="Choose a company"
          options={companies}
          value={formData?.company}
          onChange={handleFieldChange('company')}
          error={errors?.company}
          loading={loadingCompanies}
          required
          searchable
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Select
          label="Difficulty Level"
          description="Select the difficulty of the interview questions"
          placeholder="Choose a difficulty level"
          options={difficultyLevels}
          value={formData?.difficulty}
          onChange={handleFieldChange('difficulty')}
          error={errors?.difficulty}
          required
        />
        <Select
          label="Number of Questions"
          description="Select the length of the interview"
          placeholder="Choose number of questions"
          options={questionCounts}
          value={formData?.max_questions}
          onChange={handleFieldChange('max_questions')}
          error={errors?.max_questions}
          required
        />
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          What to expect:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Coding challenges and algorithm questions</li>
          <li>• System design discussions</li>
          <li>• Technical problem-solving scenarios</li>
          <li>• Company-specific technology stack questions</li>
        </ul>
      </div>
    </div>
  );
};

export default TechnicalSetupForm;
