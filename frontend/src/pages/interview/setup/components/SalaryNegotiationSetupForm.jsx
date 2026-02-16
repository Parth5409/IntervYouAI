import React, { useState, useEffect } from 'react';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';
import api from '../../../../utils/api';

const SalaryNegotiationSetupForm = ({ formData, onChange, errors }) => {
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
    { value: "manufacturing", label: "MANUFACTURING" }
  ];

  const salaryRanges = [
    { value: "30-50k", label: "30,000 - 50,000 INR" },
    { value: "50-75k", label: "50,000 - 75,000 INR" },
    { value: "75-100k", label: "75,000 - 100,000 INR" },
    { value: "100-150k", label: "100,000 - 150,000 INR" },
    { value: "150k+", label: "150,000+ INR" }
  ];

  const negotiationStyles = [
    { value: "collaborative", label: "COLLABORATIVE_WIN_WIN" },
    { value: "assertive", label: "ASSERTIVE_DIRECT" },
    { value: "analytical", label: "ANALYTICAL_DATA_DRIVEN" }
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
          COMPENSATION_PROTOCOL_CONFIGURATION
        </h3>
        <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-wider">
          Define financial parameters and negotiation strategy
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Input
            label="Vector_Target (Role)"
            placeholder="E.G. SENIOR_DEVELOPER"
            value={formData?.jobRole || ''}
            onChange={(e) => handleFieldChange('jobRole')(e.target.value.toUpperCase())}
            error={errors?.jobRole}
            required
          />

          <Select
            label="Entity_Database (Company)"
            placeholder={loadingCompanies ? "FETCHING..." : "SELECT_ENTITY"}
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

        <div className="grid gap-8 md:grid-cols-2">
          <Select
            label="Target_Compensation_Range"
            placeholder="SELECT_SALARY_RANGE"
            options={salaryRanges}
            value={formData?.salaryRange}
            onChange={handleFieldChange('salaryRange')}
            error={errors?.salaryRange}
            required
          />
          
          <Select
            label="Negotiation_Tactical_Style"
            placeholder="SELECT_STYLE"
            options={negotiationStyles}
            value={formData?.negotiationStyle}
            onChange={handleFieldChange('negotiationStyle')}
            error={errors?.negotiationStyle}
            required
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon name="DollarSign" size={64} className="text-emerald-500" />
        </div>
        <h4 className="text-[10px] font-mono font-bold text-emerald-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500" />
          NEGOTIATION_LOGIC_MODULES
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            'MARKET_VALUE_CALIBRATION',
            'TOTAL_PACKAGE_OPTIMIZATION',
            'REBUTTAL_ALGORITHM_PROCESSING',
            'LEVERAGE_INDEX_SCORING'
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

export default SalaryNegotiationSetupForm;