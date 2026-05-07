import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const SalaryNegotiationSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "Early Career (0-2 Years)" },
    { value: "mid", label: "Experienced (3-5 Years)" },
    { value: "expert", label: "Senior Level (5+ Years)" }
  ];

  const industries = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance & Banking" },
    { value: "healthcare", label: "Healthcare" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "consulting", label: "Consulting" },
    { value: "manufacturing", label: "Manufacturing" }
  ];

  const salaryRanges = [
    { value: "30-50k", label: "30,000 - 50,000 INR" },
    { value: "50-75k", label: "50,000 - 75,000 INR" },
    { value: "75-100k", label: "75,000 - 100,000 INR" },
    { value: "100-150k", label: "100,000 - 150,000 INR" },
    { value: "150k+", label: "150,000+ INR" }
  ];

  const negotiationStyles = [
    { value: "collaborative", label: "Collaborative (Win-Win)" },
    { value: "assertive", label: "Assertive (Direct)" },
    { value: "analytical", label: "Analytical (Data-Driven)" }
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
        <h3 className="text-2xl font-extrabold text-on-surface uppercase tracking-tight flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-sm" />
          Salary Negotiation Setup
        </h3>
        <p className="text-on-surface-variant font-extrabold text-[10px] ml-6 uppercase tracking-[0.4em] opacity-40">
          Configure your negotiation practice session
        </p>
      </div>

      <div className="space-y-12">
        <div className="grid gap-12 md:grid-cols-2">
          <Input
            label="Target Job Role"
            placeholder="e.g. Senior Developer"
            value={formData?.jobRole || ''}
            onChange={(e) => handleFieldChange('jobRole')(e.target.value)}
            error={errors?.jobRole}
            required
            leftElement={<Icon name="ms:payments" size={20} />}
          />

          <Select
            label="Company"
            placeholder={loadingCompanies ? "Loading..." : "Select Company"}
            options={companies}
            value={formData?.company}
            onChange={handleFieldChange('company')}
            error={errors?.company}
          />
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Experience Level"
              placeholder="Select Level"
              options={experienceLevels}
              value={formData?.experienceLevel}
              onChange={handleFieldChange('experienceLevel')}
              error={errors?.experienceLevel}
              required
            />
          </div>

          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Industry"
              placeholder="Select Industry"
              options={industries}
              value={formData?.industry}
              onChange={handleFieldChange('industry')}
              error={errors?.industry}
              required
            />
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Expected Salary Range"
              placeholder="Select Range"
              options={salaryRanges}
              value={formData?.salaryRange}
              onChange={handleFieldChange('salaryRange')}
              error={errors?.salaryRange}
              required
            />
          </div>

          <div className="p-10 bg-surface-container-high/40 rounded-[2.5rem] border border-outline-variant/10 shadow-xl backdrop-blur-3xl">
            <Select
              label="Negotiation Style"
              placeholder="Select Style"
              options={negotiationStyles}
              value={formData?.negotiationStyle}
              onChange={handleFieldChange('negotiationStyle')}
              error={errors?.negotiationStyle}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-primary/5 rounded-[3rem] border border-primary/20 p-12 relative overflow-hidden group shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-12 transform group-hover:scale-110">
          <Icon name="ms:account_balance" size={120} className="text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="space-y-4 max-w-md">
            <h4 className="text-[11px] font-extrabold text-primary uppercase tracking-[0.5em] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Strategic Modules Loaded
            </h4>
            <p className="font-body text-base text-on-surface-variant opacity-70 leading-relaxed">
              Our AI calibrates market value benchmarks against real-time industry leverage indices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1">
            {[
              { text: 'Market Value Calibration', icon: 'ms:chart_bar' },
              { text: 'Total Package Optimization', icon: 'ms:inventory' },
              { text: 'Rebuttal Logic Processing', icon: 'ms:forum' },
              { text: 'Leverage Index Scoring', icon: 'ms:trending_up' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/10 group-hover/item:bg-primary group-hover/item:text-on-surface transition-all duration-500 shadow-md">
                  <Icon name={item.icon} size={22} />
                </div>
                <span className="text-on-surface font-extrabold text-[10px] uppercase tracking-widest leading-tight transition-colors group-hover/item:text-primary">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryNegotiationSetupForm;