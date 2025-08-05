import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    careerGoal: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const careerGoalOptions = [
    { value: 'entry-level', label: 'Entry Level Position' },
    { value: 'mid-level', label: 'Mid-Level Role' },
    { value: 'senior-level', label: 'Senior Position' },
    { value: 'management', label: 'Management Role' },
    { value: 'executive', label: 'Executive Position' },
    { value: 'career-change', label: 'Career Change' },
    { value: 'freelance', label: 'Freelance/Contract Work' },
    { value: 'startup', label: 'Startup Environment' }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpperCase = /[A-Z]/?.test(password);
    const hasLowerCase = /[a-z]/?.test(password);
    const hasNumbers = /\d/?.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      strength: [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]?.filter(Boolean)?.length
    };
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: '', color: '', width: '0%' };
    
    const validation = validatePassword(password);
    const strength = validation?.strength;
    
    if (strength <= 2) return { label: 'Weak', color: 'bg-error', width: '33%' };
    if (strength <= 3) return { label: 'Fair', color: 'bg-warning', width: '66%' };
    if (strength <= 4) return { label: 'Good', color: 'bg-accent', width: '85%' };
    return { label: 'Strong', color: 'bg-success', width: '100%' };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData?.password);
      if (!passwordValidation?.isValid) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
      }
    }

    if (!formData?.careerGoal) {
      newErrors.careerGoal = 'Please select your career goal';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        career_goal: formData.careerGoal
      });

      // Redirect to login screen
      navigate('/login-screen');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setErrors({ submit: error.response.data.detail });
      } else {
        setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData?.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        value={formData?.fullName}
        onChange={(e) => handleInputChange('fullName', e?.target?.value)}
        error={errors?.fullName}
        required
        disabled={isLoading}
      />
      {/* Email */}
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      {/* Password */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData?.password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength?.label === 'Strong' ? 'text-success' :
                passwordStrength?.label === 'Good' ? 'text-accent' :
                passwordStrength?.label === 'Fair' ? 'text-warning' : 'text-error'
              }`}>
                {passwordStrength?.label}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength?.color}`}
                style={{ width: passwordStrength?.width }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Career Goal */}
      <Select
        label="Career Goal"
        placeholder="Select your career goal"
        options={careerGoalOptions}
        value={formData?.careerGoal}
        onChange={(value) => handleInputChange('careerGoal', value)}
        error={errors?.careerGoal}
        required
        disabled={isLoading}
      />
      {/* Terms Agreement */}
      <div className="space-y-2">
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e?.target?.checked)}
          error={errors?.terms}
          disabled={isLoading}
        />
        <div className="text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <button type="button" className="text-primary hover:underline">
            Terms of Service
          </button>{' '}
          and{' '}
          <button type="button" className="text-primary hover:underline">
            Privacy Policy
          </button>
        </div>
      </div>
      {/* Submit Error */}
      {errors?.submit && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors?.submit}</p>
        </div>
      )}
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        iconName={isLoading ? undefined : "UserPlus"}
        iconPosition="left"
        className="h-12"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegistrationForm;