import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
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
    if (!agreedToTerms) newErrors.terms = 'You must agree to the Terms of Service';

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
        career_goal: formData.careerGoal || 'General SDE'
      });
      navigate('/login');
    } catch (error) {
      setErrors({ submit: error.response?.data?.detail || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="absolute right-3 top-9 text-slate-500 hover:text-emerald-500 transition-colors"
          disabled={isLoading}
        >
          <Icon name={showPassword ? "EyeOff" : "Eye"} size={14} />
        </button>
      </div>

      <Input
        label="Career Goal (Optional)"
        type="text"
        placeholder="e.g. Software Engineer, Data Scientist"
        value={formData?.careerGoal}
        onChange={(e) => handleInputChange('careerGoal', e.target.value)}
        error={errors?.careerGoal}
        disabled={isLoading}
      />

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
        {isLoading ? 'Creating Account...' : 'CREATE ACCOUNT'}
      </Button>
    </form>
  );
};

export default RegistrationForm;