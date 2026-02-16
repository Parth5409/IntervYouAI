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
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      // Store the token
      const token = response.data.access_token || response.data.data?.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }

      await refetchUser();
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: error.response?.data?.detail || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors?.general && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start space-x-3">
          <Icon name="AlertCircle" size={16} color="var(--color-error)" className="mt-0.5" />
          <div>
            <p className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-widest">Authentication Failed</p>
            <p className="text-xs text-red-500/80 mt-1">{errors?.general}</p>
          </div>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="student@university.edu"
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
        disabled={isLoading}
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Enter your password"
        value={formData?.password}
        onChange={handleInputChange}
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
          onClick={() => alert('Recovery process initialized.')}
          className="text-xs font-mono text-slate-300 hover:text-emerald-500 transition-colors uppercase tracking-tight"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>

      <Button
        type="submit"
        variant="default"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'SIGN IN'}
      </Button>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono">
          <span className="bg-slate-900 px-2 text-slate-300 tracking-widest">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => alert('Google authentication module not loaded.')}
          disabled={isLoading}
          className="h-10 text-xs text-slate-200 hover:text-emerald-500"
        >
          Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => alert('LinkedIn authentication module not loaded.')}
          disabled={isLoading}
          className="h-10 text-xs text-slate-200 hover:text-emerald-500"
        >
          LinkedIn
        </Button>
      </div>

      <div className="text-center pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-300">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors uppercase tracking-wide text-[10px]"
            disabled={isLoading}
          >
            Create Account
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;