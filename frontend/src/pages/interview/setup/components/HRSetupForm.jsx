import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const HRSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "ENTRY_LEVEL (0-2Y)" },
    { value: "mid", label: "MID_LEVEL (3-5Y)" },
    { value: "expert", label: "EXPERT_LEVEL (5Y+)" }
  ];

  const industries = [
    { value: "technology", label: "TECHNOLOGY" },
    { value: "finance", label: "FINANCE_BANKING" },
    { value: "healthcare", label: "HEALTHCARE" },
    { value: "retail", label: "RETAIL_ECOMMERCE" },
    { value: "consulting", label: "CONSULTING" },
    { value: "manufacturing", label: "MANUFACTURING" },
    { value: "education", label: "EDUCATION" },
    { value: "media", label: "MEDIA_ENTERTAINMENT" },
    { value: "automotive", label: "AUTOMOTIVE" },
    { value: "real-estate", label: "REAL_ESTATE" }
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
      <div className="border-l-2 border-sky-500 pl-4">
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-[0.2em]">
          BEHAVIORAL_PROTOCOL_CONFIGURATION
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Define parameters for HR and cultural fit assessment
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Input
            label="Vector_Target (Role)"
            placeholder="E.G. PROJECT_MANAGER"
            value={formData?.jobRole || ''}
            onChange={(e) => handleFieldChange('jobRole')(e.target.value.toUpperCase())}
            error={errors?.jobRole}
            required
          />

          <Select
            label="Entity_Database (Company)"
            placeholder={loadingCompanies ? "FETCHING..." : "SELECT_TARGET_ENTITY"}
            options={companies}
            value={formData?.company}
            onChange={handleFieldChange('company')}
            error={errors?.company}
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Select
            label="Experience_Tier"
            placeholder="SELECT_EXPERIENCE"
            options={experienceLevels}
            value={formData?.experienceLevel}
            onChange={handleFieldChange('experienceLevel')}
            error={errors?.experienceLevel}
            required
          />

          <Select
            label="Sector_Classification"
            placeholder="SELECT_INDUSTRY"
            options={industries}
            value={formData?.industry}
            onChange={handleFieldChange('industry')}
            error={errors?.industry}
            required
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon name="Users" size={64} className="text-sky-500" />
        </div>
        <h4 className="text-[10px] font-mono font-bold text-sky-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-sky-500" />
          BEHAVIORAL_FOCUS_MODULES
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'SITUATIONAL_REACTION_MAPPING',
            'CORE_VALUE_ALIGNMENT',
            'LEADERSHIP_VECTOR_ANALYSIS',
            'CONFLICT_RESOLUTION_LOGIC'
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

export default HRSetupForm;