import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';


const TechnicalSetupForm = ({ formData, onChange, errors }) => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Mock companies data
  const mockCompanies = [
    { value: "google", label: "Google", description: "Search & Cloud Technology" },
    { value: "microsoft", label: "Microsoft", description: "Software & Cloud Services" },
    { value: "amazon", label: "Amazon", description: "E-commerce & AWS" },
    { value: "apple", label: "Apple", description: "Consumer Electronics" },
    { value: "meta", label: "Meta", description: "Social Media & VR" },
    { value: "netflix", label: "Netflix", description: "Streaming & Entertainment" },
    { value: "tesla", label: "Tesla", description: "Electric Vehicles & Energy" },
    { value: "uber", label: "Uber", description: "Transportation & Delivery" },
    { value: "airbnb", label: "Airbnb", description: "Travel & Hospitality" },
    { value: "spotify", label: "Spotify", description: "Music Streaming" },
    { value: "salesforce", label: "Salesforce", description: "CRM & Cloud Solutions" },
    { value: "adobe", label: "Adobe", description: "Creative Software" },
    { value: "nvidia", label: "NVIDIA", description: "Graphics & AI Computing" },
    { value: "intel", label: "Intel", description: "Semiconductors & Processors" },
    { value: "ibm", label: "IBM", description: "Enterprise Technology" }
  ];

  const jobRoles = [
    { value: "frontend-developer", label: "Frontend Developer" },
    { value: "backend-developer", label: "Backend Developer" },
    { value: "fullstack-developer", label: "Full Stack Developer" },
    { value: "mobile-developer", label: "Mobile Developer" },
    { value: "devops-engineer", label: "DevOps Engineer" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "machine-learning-engineer", label: "ML Engineer" },
    { value: "software-architect", label: "Software Architect" },
    { value: "qa-engineer", label: "QA Engineer" },
    { value: "product-manager", label: "Product Manager" },
    { value: "ui-ux-designer", label: "UI/UX Designer" },
    { value: "cloud-engineer", label: "Cloud Engineer" },
    { value: "security-engineer", label: "Security Engineer" },
    { value: "database-administrator", label: "Database Administrator" },
    { value: "system-administrator", label: "System Administrator" }
  ];

  useEffect(() => {
    // Simulate API call to fetch companies
    setLoadingCompanies(true);
    setTimeout(() => {
      setCompanies(mockCompanies);
      setLoadingCompanies(false);
    }, 800);
  }, []);

  const handleJobRoleChange = (value) => {
    onChange({
      ...formData,
      jobRole: value
    });
  };

  const handleCompanyChange = (value) => {
    onChange({
      ...formData,
      company: value
    });
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
          onChange={handleJobRoleChange}
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
          onChange={handleCompanyChange}
          error={errors?.company}
          loading={loadingCompanies}
          required
          searchable
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