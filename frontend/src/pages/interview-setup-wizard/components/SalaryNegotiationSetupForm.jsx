import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SalaryNegotiationSetupForm = ({ formData, onChange, errors }) => {
  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior Level (6-10 years)" },
    { value: "lead", label: "Lead/Executive (10+ years)" }
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

  const handleJobRoleChange = (e) => {
    onChange({
      ...formData,
      jobRole: e?.target?.value
    });
  };

  const handleExperienceChange = (value) => {
    onChange({
      ...formData,
      experienceLevel: value
    });
  };

  const handleSalaryRangeChange = (value) => {
    onChange({
      ...formData,
      salaryRange: value
    });
  };

  const handleNegotiationStyleChange = (value) => {
    onChange({
      ...formData,
      negotiationStyle: value
    });
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
          onChange={handleJobRoleChange}
          error={errors?.jobRole}
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Experience Level"
            description="Your professional experience"
            placeholder="Select experience level"
            options={experienceLevels}
            value={formData?.experienceLevel}
            onChange={handleExperienceChange}
            error={errors?.experienceLevel}
            required
          />

          <Select
            label="Target Salary Range"
            description="Expected compensation range"
            placeholder="Choose salary range"
            options={salaryRanges}
            value={formData?.salaryRange}
            onChange={handleSalaryRangeChange}
            error={errors?.salaryRange}
            required
          />
        </div>

        <Select
          label="Negotiation Style"
          description="Your preferred negotiation approach"
          placeholder="Select negotiation style"
          options={negotiationStyles}
          value={formData?.negotiationStyle}
          onChange={handleNegotiationStyleChange}
          error={errors?.negotiationStyle}
          required
        />
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