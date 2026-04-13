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
      newErrors.email = 'Secure identification required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Invalid identity protocol format';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Authentication key required';
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
        general: error.response?.data?.detail || 'Invalid identification. Access denied by system core.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <AnimatePresence>
        {errors?.general && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-error/10 border border-error/20 p-5 rounded-2xl flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-error/20 flex items-center justify-center text-error animate-pulse shrink-0">
               <Icon name="ms:security" size={18} />
            </div>
            <div>
              <p className="text-[10px] text-error font-extrabold uppercase tracking-[0.2em] font-headline">Access Interrupted</p>
              <p className="text-xs text-error/70 mt-1 font-body leading-relaxed">{errors?.general}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <Input
          label="Identity Protocol"
          type="email"
          name="email"
          placeholder="Identification email..."
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
          disabled={isLoading}
          leftElement={<Icon name="ms:alternate_email" size={20} className="text-on-surface-variant/40" />}
        />

        <Input
          label="Access Key"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Secure authentication key..."
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
          disabled={isLoading}
          leftElement={<Icon name="ms:key" size={20} className="text-on-surface-variant/40" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-on-surface-variant/40 hover:text-primary transition-colors focus:outline-none"
              disabled={isLoading}
            >
              <Icon name={showPassword ? "ms:visibility_off" : "ms:visibility"} size={20} />
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex items-center h-5">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData?.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container-highest/20 text-primary focus:ring-primary/20 transition-all cursor-pointer"
            />
          </div>
          <label htmlFor="rememberMe" className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer opacity-40 group-hover:opacity-100">
            Persistent Link
          </label>
        </div>
        
        <button
          type="button"
          onClick={() => toast.info('Initiating clearance recovery.')}
          className="text-[10px] font-extrabold text-primary hover:text-white transition-all uppercase tracking-[0.3em] font-headline group/link"
          disabled={isLoading}
        >
          Lost Access?
          <div className="h-px w-0 group-hover/link:w-full bg-primary transition-all duration-300" />
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full h-16 group"
        disabled={isLoading}
      >
        <span className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-[0.4em]">
          {isLoading ? 'Decrypting Clearance...' : 'Enter the Ether'}
          {!isLoading && <Icon name="ms:arrow_forward" size={18} className="group-hover:translate-x-2 transition-transform duration-500" />}
        </span>
      </Button>

      <div className="text-center pt-10 border-t border-outline-variant/10 flex flex-col gap-6">
        <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
          New to the Nexus?
        </p>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="h-14 w-full border border-outline-variant/10 rounded-2xl hover:border-primary/40 hover:bg-primary/5 text-white font-extrabold transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group/reg"
          disabled={isLoading}
        >
           Formulate Identity
           <Icon name="ms:add_circle" size={18} className="text-primary group-hover/reg:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </form>
  );
};

export default LoginForm;