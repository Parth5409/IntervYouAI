import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import api from '../../../utils/api';

const SalaryNegotiationSetupForm = ({ formData, onChange, errors }) => {
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

  const salaryRanges = [
    { value: "30-50k", label: "$30,000 - $50,000" },
    { value: "50-75k", label: "$50,000 - $75,000" },
    { value: "75-100k", label: "$75,000 - $100,000" },
    { value: "100-150k", label: "$100,000 - $150,000" },
    { value: "150-200k", label: "$150,000 - $200,000" },
    { value: "200k+", label: "$200,000+" }
  ];

  const negotiationStyles = [
    { value: "collaborative", label: "Collaborative", description: "Win-win approach" },
    { value: "assertive", label: "Assertive", description: "Direct and confident" },
    { value: "analytical", label: "Analytical", description: "Data-driven approach" }
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
          Salary Negotiation Setup
        </h3>
        <p className="text-muted-foreground text-sm">
          Practice negotiating compensation packages and benefits effectively.
        </p>
      </div>
      <div className="space-y-4">
        <Input
          label="Job Role"
          type="text"
          placeholder="e.g., Software Engineer, Product Manager"
          description="Position you're negotiating for"
          value={formData?.jobRole || ''}
          onChange={(e) => handleFieldChange('jobRole')(e.target.value)}
          error={errors?.jobRole}
          required
        />

        <Select
          label="Target Company"
          description="Select the company you are negotiating with"
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
            description="Target industry for this role"
            placeholder="Choose industry"
            options={industries}
            value={formData?.industry}
            onChange={handleFieldChange('industry')}
            error={errors?.industry}
            required
            searchable
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Target Salary Range"
            description="Expected compensation range"
            placeholder="Choose salary range"
            options={salaryRanges}
            value={formData?.salaryRange}
            onChange={handleFieldChange('salaryRange')}
            error={errors?.salaryRange}
            required
          />
          
          <Select
            label="Negotiation Style"
            description="Your preferred negotiation approach"
            placeholder="Select negotiation style"
            options={negotiationStyles}
            value={formData?.negotiationStyle}
            onChange={handleFieldChange('negotiationStyle')}
            error={errors?.negotiationStyle}
            required
          />
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Negotiation Topics Covered:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>• Base salary discussion</div>
          <div>• Benefits and perks</div>
          <div>• Stock options/equity</div>
          <div>• Vacation time</div>
          <div>• Remote work flexibility</div>
          <div>• Professional development</div>
          <div>• Performance bonuses</div>
          <div>• Start date negotiation</div>
        </div>
      </div>
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">
          💡 Pro Tips:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Research market rates beforehand</li>
          <li>• Focus on total compensation package</li>
          <li>• Be prepared to justify your value</li>
          <li>• Practice active listening</li>
        </ul>
      </div>
    </div>
  );
};

export default SalaryNegotiationSetupForm;