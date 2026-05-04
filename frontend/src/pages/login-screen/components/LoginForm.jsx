import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { toast } from 'sonner';

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
    const { name, value, type, checked } = e?.target || e;
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
      newErrors.email = 'Email address is required';
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
      const response = await api.post('auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      const token = response.data.access_token || response.data.data?.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }

      await refetchUser();
      navigate('/dashboard');
    } catch (error) {
      setErrors({
        general: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <form onSubmit={handleSubmit} className="space-y-12">
    <AnimatePresence>
      {errors?.general && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-error/5 border border-error/20 p-6 rounded-[2rem] flex items-start gap-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-error/5 animate-pulse" />
          <div className="w-10 h-10 rounded-2xl bg-error/20 flex items-center justify-center text-error shrink-0 relative z-10">
             <Icon name="ms:security" size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-error font-black font-headline uppercase tracking-widest">Login Error</p>
            <p className="text-xs text-error/70 mt-1.5 font-bold leading-relaxed">{errors?.general}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
      <div className="space-y-10">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email..."
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
          disabled={isLoading}
          className="bg-white/[0.02] border-white/5 focus:border-primary/40 focus:bg-white/[0.04] transition-all duration-500 rounded-2xl h-14"
          leftElement={<Icon name="ms:alternate_email" size={22} className="text-on-surface-variant/20" />}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password..."
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
          className="bg-white/[0.02] border-white/5 focus:border-secondary/40 focus:bg-white/[0.04] transition-all duration-500 rounded-2xl h-14"
          leftElement={<Icon name="ms:key" size={22} className="text-on-surface-variant/20" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-on-surface-variant/20 hover:text-primary transition-colors focus:outline-none pr-4"
              disabled={isLoading}
            >
              <Icon name={showPassword ? "ms:visibility_off" : "ms:visibility"} size={20} />
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData?.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-5 h-5 rounded-lg border-white/10 bg-white/[0.02] text-primary focus:ring-primary/20 transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="rememberMe" className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors cursor-pointer">
            Remember Me
          </label>
        </div>
        
        <button
          type="button"
          onClick={() => toast.info('Password recovery process started.')}
          className="text-[10px] font-black text-primary hover:text-white transition-all font-headline group/link uppercase tracking-[0.2em]"
          disabled={isLoading}
        >
          Forgot Password?
          <div className="h-[1px] w-0 group-hover/link:w-full bg-primary transition-all duration-500 mt-0.5" />
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full h-20 rounded-[2rem] group relative overflow-hidden shadow-2xl shadow-primary/20 transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary group-hover:opacity-100 transition-opacity" />
        <span className="flex items-center justify-center gap-6 text-[11px] font-black uppercase tracking-[0.5em] text-white relative z-10">
          {isLoading ? 'Verifying...' : 'LOGIN'}
          {!isLoading && <Icon name="ms:arrow_forward" size={22} className="group-hover:translate-x-3 transition-transform duration-700" />}
        </span>
      </Button>

      <div className="text-center pt-12 border-t border-white/5 flex flex-col gap-8">
        <p className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[0.4em]">
          New to IntervYou.AI?
        </p>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="h-16 w-full border border-white/5 rounded-2xl hover:border-secondary/40 hover:bg-secondary/5 text-white font-black transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-5 group/reg"
          disabled={isLoading}
        >
           Create Account
           <div className="p-1.5 rounded-lg bg-secondary/10 group-hover/reg:bg-secondary group-hover/reg:rotate-90 transition-all duration-500">
            <Icon name="ms:add" size={18} className="text-secondary group-hover/reg:text-black" />
           </div>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;