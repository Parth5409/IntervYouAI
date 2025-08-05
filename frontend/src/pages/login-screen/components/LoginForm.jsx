import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';

const LoginForm = () => {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for authentication
  const mockCredentials = {
    email: 'john.doe@example.com',
    password: 'password123'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      // Refetch user data and then navigate to dashboard
      await refetchUser();
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: error.response?.data?.detail || 'Invalid credentials. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // In a real app, this would navigate to forgot password page
    alert('Forgot password functionality would be implemented here');
  };

  const handleSocialLogin = (provider) => {
    // In a real app, this would handle social authentication
    alert(`${provider} login would be implemented here`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {errors?.general && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 flex items-start space-x-3">
          <Icon name="AlertCircle" size={20} color="var(--color-error)" />
          <div>
            <p className="text-sm text-error font-medium">Authentication Failed</p>
            <p className="text-xs text-error/80 mt-1">{errors?.general}</p>
          </div>
        </div>
      )}
      {/* Email Field */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      {/* Password Field */}
      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData?.password}
        onChange={handleInputChange}
        error={errors?.password}
        required
        disabled={isLoading}
      />
      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>
      {/* Sign In Button */}
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="h-12"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      {/* Social Login Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('Google')}
          disabled={isLoading}
          iconName="Chrome"
          iconPosition="left"
          iconSize={18}
        >
          Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('LinkedIn')}
          disabled={isLoading}
          iconName="Linkedin"
          iconPosition="left"
          iconSize={18}
        >
          LinkedIn
        </Button>
      </div>
      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          New to IntervYou.AI?{' '}
          <button
            type="button"
            onClick={() => navigate('/registration-screen')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
            disabled={isLoading}
          >
            Create an account
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;