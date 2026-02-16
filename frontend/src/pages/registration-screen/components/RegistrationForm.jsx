import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';
import RoleSelection from './RoleSelection';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('ROLE_STUDENT'); // Default role
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName: '',
    organizationCode: '', // This will be collegeCode for students
    careerGoal: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpperCase = /[A-Z]/?.test(password);
    const hasLowerCase = /[a-z]/?.test(password);
    const hasNumbers = /\d/?.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.fullName?.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData?.email?.trim() || !validateEmail(formData?.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData?.password || !validatePassword(formData?.password)) newErrors.password = 'Password must be 8+ chars with uppercase & numbers';
    
    if (role === 'ROLE_ORG_ADMIN') {
      if (!formData?.organizationName?.trim()) newErrors.organizationName = 'Organization Name is required';
      if (!formData?.organizationCode?.trim()) newErrors.organizationCode = 'Organization Code is required';
    } else {
      if (!formData?.organizationCode?.trim()) newErrors.organizationCode = 'College Code is required';
    }

    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms of Service';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: role.replace('ROLE_', ''), // Strip prefix for backend enum if needed, or keep if backend handles it.
        // Actually, backend UserRole enum matches the name without prefix.
        organizationCode: formData.organizationCode,
        organizationName: role === 'ROLE_ORG_ADMIN' ? formData.organizationName : undefined,
        careerGoal: role === 'ROLE_STUDENT' ? formData.careerGoal : undefined
      };
      await api.post('/auth/signup', payload);
      navigate('/login');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <RoleSelection selectedRole={role} onSelect={setRole} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={formData?.fullName}
            onChange={(e) => handleInputChange('fullName', e?.target?.value)}
            error={errors?.fullName}
            required
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="student@university.edu"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
            disabled={isLoading}
          />
        </div>

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
          value={formData?.password}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
          error={errors?.password}
          required
          disabled={isLoading}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-emerald-500 transition-colors focus:outline-none"
              disabled={isLoading}
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={14} />
            </button>
          }
        />

        {role === 'ROLE_ORG_ADMIN' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              type="text"
              placeholder="e.g. Indian Institute of Technology"
              value={formData?.organizationName}
              onChange={(e) => handleInputChange('organizationName', e?.target?.value)}
              error={errors?.organizationName}
              required
              disabled={isLoading}
            />
            <Input
              label="Organization Code"
              type="text"
              placeholder="e.g. IITB"
              value={formData?.organizationCode}
              onChange={(e) => handleInputChange('organizationCode', e?.target?.value)}
              error={errors?.organizationCode}
              required
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="College Code"
              type="text"
              placeholder="e.g. IITB"
              value={formData?.organizationCode}
              onChange={(e) => handleInputChange('organizationCode', e?.target?.value)}
              error={errors?.organizationCode}
              required
              disabled={isLoading}
            />
            <Input
              label="Career Goal (Optional)"
              type="text"
              placeholder="e.g. Software Engineer"
              value={formData?.careerGoal}
              onChange={(e) => handleInputChange('careerGoal', e.target.value)}
              error={errors?.careerGoal}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-3">
          <Checkbox
            label="I agree to the Terms & Privacy Policy"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e?.target?.checked)}
            disabled={isLoading}
          />
          {errors?.terms && (
            <p className="text-[10px] font-mono text-red-500 uppercase">{errors.terms}</p>
          )}
        </div>

        {errors?.submit && (
          <div className="p-3 bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] font-mono text-red-500 uppercase">{errors?.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? 'INITIALIZING_SYSTEM...' : 'CREATE_ACCOUNT'}
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
