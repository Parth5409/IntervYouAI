import React, { useState, useEffect } from 'react';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const TechnicalSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const jobRoles = [
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Fullstack Developer" },
    { value: "mobile-developer", label: "Mobile Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "machine-learning-engineer", label: "ML Engineer" }
  ];

  const difficultyLevels = [
    { value: "Easy", label: "Standard Mode" },
    { value: "Medium", label: "Advanced Protocol" },
    { value: "Hard", label: "Extreme Stress Test" }
  ];

  const questionCounts = [
    { value: 5, label: "05 Questions (Fast)" },
    { value: 8, label: "08 Questions (Normal)" },
    { value: 10, label: "10 Questions (Dense)" },
    { value: 15, label: "15 Questions (Exhaustive)" }
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await api.get('drives/all');
        const uniqueCompanies = Array.from(new Set(response.data.data.map(d => d.companyName)))
          .map(name => ({ value: name, label: name }));
        setCompanies(uniqueCompanies);
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
    <div className="space-y-12">
      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(255,145,90,0.5)]" />
          Protocol Configuration
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Calibrating Technical Execution Parameters
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-8 p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
          <Select
            label="Target Specialization"
            placeholder="Select Role"
            options={jobRoles}
            value={formData?.jobRole}
            onChange={handleFieldChange('jobRole')}
            error={errors?.jobRole}
            required
          />
          <Select
            label="Corporate Alignment"
            placeholder={loadingCompanies ? "Syncing Repositories..." : "Select Entity"}
            options={companies}
            value={formData?.company}
            onChange={handleFieldChange('company')}
            error={errors?.company}
            required
          />
        </div>

        <div className="space-y-8 p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
          <Select
            label="Complexity Matrix"
            placeholder="Select Level"
            options={difficultyLevels}
            value={formData?.difficulty}
            onChange={handleFieldChange('difficulty')}
            error={errors?.difficulty}
            required
          />
          <Select
            label="Instructional Density"
            placeholder="Select Iterations"
            options={questionCounts}
            value={formData?.max_questions}
            onChange={handleFieldChange('max_questions')}
            error={errors?.max_questions}
            required
          />
        </div>
      </div>

      <div className="bg-primary/5 rounded-[3rem] border border-primary/20 p-12 relative overflow-hidden group shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-12 transform group-hover:scale-110">
          <Icon name="ms:memorybolt" size={120} className="text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="space-y-4 max-w-md">
            <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-[0.5em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Engine Subsystems Loaded
            </h4>
            <p className="font-body text-base text-on-surface-variant opacity-70 leading-relaxed">
              Our advanced neural engine combines multiple assessment frameworks to provide an exhaustive technical audit of your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
            {[
              { text: 'Algorithmic Complexity Path', icon: 'ms:account_tree' },
              { text: 'Architectural Blueprint Audit', icon: 'ms:architecture' },
              { text: 'Dynamic Follow-up Heuristics', icon: 'ms:analytics' },
              { text: 'Real-time Semantic Mapping', icon: 'ms:psychology' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500 shadow-md">
                  <Icon name={item.icon} size={22} />
                </div>
                <span className="text-white font-extrabold text-[10px] uppercase tracking-widest leading-tight transition-colors group-hover/item:text-primary">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSetupForm;
