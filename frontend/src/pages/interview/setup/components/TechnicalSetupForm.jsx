import React, { useState, useEffect } from 'react';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const TechnicalSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const jobRoles = [
    { value: "frontend-developer", label: "FRONTEND_DEVELOPER" },
    { value: "backend-developer", label: "BACKEND_DEVELOPER" },
    { value: "fullstack-developer", label: "FULLSTACK_DEVELOPER" },
    { value: "mobile-developer", label: "MOBILE_DEVELOPER" },
    { value: "devops-engineer", label: "DEVOPS_ENGINEER" },
    { value: "data-scientist", label: "DATA_SCIENTIST" },
    { value: "machine-learning-engineer", label: "ML_ENGINEER" }
  ];

  const difficultyLevels = [
    { value: "Easy", label: "EASY_MODE" },
    { value: "Medium", label: "BALANCED_MODE" },
    { value: "Hard", label: "COMBAT_MODE (HARD)" }
  ];

  const questionCounts = [
    { value: 5, label: "05_QUESTIONS (QUICK)" },
    { value: 8, label: "08_QUESTIONS (STD)" },
    { value: 10, label: "10_QUESTIONS (DEEP)" },
    { value: 15, label: "15_QUESTIONS (STRESS_TEST)" }
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await api.get('/drives/all');
        const uniqueCompanies = Array.from(new Set(response.data.data.map(d => d.companyName)))
          .map(name => ({ value: name, label: name.toUpperCase() }));
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
    <div className="space-y-8">
      <div className="border-l-2 border-emerald-500 pl-4">
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-[0.2em]">
          TECHNICAL_PROTOCOL_CONFIGURATION
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Establish simulation parameters for technical assessment
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Select
            label="Simulation_Target (Role)"
            placeholder="SELECT_JOB_ROLE"
            options={jobRoles}
            value={formData?.jobRole}
            onChange={handleFieldChange('jobRole')}
            error={errors?.jobRole}
            required
          />
          <Select
            label="Entity_Database (Company)"
            placeholder={loadingCompanies ? "FETCHING_DATA..." : "SELECT_TARGET_ENTITY"}
            options={companies}
            value={formData?.company}
            onChange={handleFieldChange('company')}
            error={errors?.company}
            required
          />
        </div>

        <div className="space-y-6">
          <Select
            label="Complexity_Index (Difficulty)"
            placeholder="SELECT_DIFFICULTY"
            options={difficultyLevels}
            value={formData?.difficulty}
            onChange={handleFieldChange('difficulty')}
            error={errors?.difficulty}
            required
          />
          <Select
            label="Sequence_Length (Questions)"
            placeholder="SELECT_ITERATIONS"
            options={questionCounts}
            value={formData?.max_questions}
            onChange={handleFieldChange('max_questions')}
            error={errors?.max_questions}
            required
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon name="Cpu" size={64} className="text-emerald-500" />
        </div>
        <h4 className="text-[10px] font-mono font-bold text-emerald-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500" />
          SIMULATION_MODULES_LOADED
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'ALGORITHMIC_COMPLEXITY_ANALYSIS',
            'SYSTEM_ARCHITECTURAL_DESIGN',
            'DYNAMIC_FOLLOW_UP_LOGIC',
            'REAL_TIME_VOCAL_PROCESSING'
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

export default TechnicalSetupForm;
