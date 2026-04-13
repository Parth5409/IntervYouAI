import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const HRSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "Early Career (0-2Y)" },
    { value: "mid", label: "Professional Tier (3-5Y)" },
    { value: "expert", label: "Executive Level (5Y+)" }
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
          <div className="w-1.5 h-8 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
          Behavioral Protocol
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Defining Cultural & Soft Skill Alignment
        </p>
      </div>

      <div className="space-y-12">
        <div className="grid gap-12 md:grid-cols-2">
          <Input
            label="Vector Target (Role)"
            placeholder="E.G. PROJECT MANAGER"
            value={formData?.jobRole || ''}
            onChange={(e) => handleFieldChange('jobRole')(e.target.value)}
            error={errors?.jobRole}
            required
            leftElement={<Icon name="ms:work" size={20} />}
          />

          <Select
            label="Target Entity"
            placeholder={loadingCompanies ? "Syncing..." : "Select Corporate Database"}
            options={companies}
            value={formData?.company}
            onChange={handleFieldChange('company')}
            error={errors?.company}
          />
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Experience Tier"
              placeholder="Select Seniority"
              options={experienceLevels}
              value={formData?.experienceLevel}
              onChange={handleFieldChange('experienceLevel')}
              error={errors?.experienceLevel}
              required
            />
          </div>

          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Sector Classification"
              placeholder="Select Industry"
              options={industries}
              value={formData?.industry}
              onChange={handleFieldChange('industry')}
              error={errors?.industry}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-sky-500/5 rounded-[3rem] border border-sky-500/20 p-12 relative overflow-hidden group shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-700 rotate-12 transform group-hover:scale-110">
          <Icon name="ms:groups" size={120} className="text-sky-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="space-y-4 max-w-md">
            <h4 className="text-[11px] font-extrabold text-sky-500 uppercase tracking-[0.5em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Psychometric Focus Modules
            </h4>
            <p className="font-body text-base text-on-surface-variant opacity-70 leading-relaxed">
              Our AI evaluates non-deterministic patterns in communication, situational leadership, and cultural vector alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
            {[
              { text: 'Situational Reaction Mapping', icon: 'ms:psychology' },
              { text: 'Core Value Alignment', icon: 'ms:verified_user' },
              { text: 'Leadership Vector Analysis', icon: 'ms:leaderboard' },
              { text: 'Conflict Resolution Logic', icon: 'ms:handshake' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-sky-500 border border-outline-variant/10 group-hover/item:bg-sky-500 group-hover/item:text-white transition-all duration-500 shadow-md">
                  <Icon name={item.icon} size={22} />
                </div>
                <span className="text-white font-extrabold text-[10px] uppercase tracking-widest leading-tight transition-colors group-hover/item:text-sky-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRSetupForm;