import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';
import RoleSelection from './RoleSelection';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('ROLE_STUDENT');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName: '',
    organizationCode: '',
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
    if (!formData?.fullName?.trim()) newErrors.fullName = 'Full Name required for identification';
    if (!formData?.email?.trim() || !validateEmail(formData?.email)) newErrors.email = 'Invalid identity protocol format';
    if (!formData?.password || !validatePassword(formData?.password)) newErrors.password = 'Key must be 8+ chars (A-z, 0-9)';
    
    if (role === 'ROLE_ORG_ADMIN') {
      if (!formData?.organizationName?.trim()) newErrors.organizationName = 'Entity identification required';
      if (!formData?.organizationCode?.trim()) newErrors.organizationCode = 'Entity access code required';
    } else {
      if (!formData?.organizationCode?.trim()) newErrors.organizationCode = 'Authority reference code required';
    }

    if (!agreedToTerms) newErrors.terms = 'Protocol acknowledgement required';

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
        role: role.replace('ROLE_', ''),
        organizationCode: formData.organizationCode,
        organizationName: role === 'ROLE_ORG_ADMIN' ? formData.organizationName : undefined,
        careerGoal: role === 'ROLE_STUDENT' ? formData.careerGoal : undefined
      };
      await api.post('auth/signup', payload);
      navigate('/login');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Synthesis failed. Neural link rejected.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <RoleSelection selectedRole={role} onSelect={setRole} />

      <form onSubmit={handleSubmit} className="space-y-10">
        <AnimatePresence>
          {errors?.submit && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="p-5 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-error/20 flex items-center justify-center text-error animate-pulse shrink-0">
                 <Icon name="ms:error" size={18} />
              </div>
              <div>
                <p className="text-[10px] text-error font-extrabold font-headline font-label font-medium text-on-surface-variant">Synthesis Rejected</p>
                <p className="text-xs text-error/70 mt-1 font-body leading-relaxed">{errors?.submit}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={formData?.fullName}
            onChange={(e) => handleInputChange('fullName', e?.target?.value)}
            error={errors?.fullName}
            required
            disabled={isLoading}
            leftElement={<Icon name="ms:person" size={20} className="text-on-surface-variant/40" />}
          />

          <Input
            label="Identity Protocol (Email)"
            type="email"
            placeholder="identification@sector.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
            disabled={isLoading}
            leftElement={<Icon name="ms:alternate_email" size={20} className="text-on-surface-variant/40" />}
          />
        </div>

        <Input
          label="Access Credentials"
          type={showPassword ? "text" : "password"}
          placeholder="Manifest a strong authentication key..."
          value={formData?.password}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
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

        {role === 'ROLE_ORG_ADMIN' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Organization Entity"
              type="text"
              placeholder="e.g. Nexus Tech"
              value={formData?.organizationName}
              onChange={(e) => handleInputChange('organizationName', e?.target?.value)}
              error={errors?.organizationName}
              required
              disabled={isLoading}
              leftElement={<Icon name="ms:corporate_fare" size={20} className="text-on-surface-variant/40" />}
            />
            <Input
              label="Entity Access Code"
              type="text"
              placeholder="e.g. UNV2026"
              value={formData?.organizationCode}
              onChange={(e) => handleInputChange('organizationCode', e?.target?.value)}
              error={errors?.organizationCode}
              required
              disabled={isLoading}
              leftElement={<Icon name="ms:qr_code_2" size={20} className="text-on-surface-variant/40" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Authority Reference Code"
              type="text"
              placeholder="e.g. STU123"
              value={formData?.organizationCode}
              onChange={(e) => handleInputChange('organizationCode', e?.target?.value)}
              error={errors?.organizationCode}
              required
              disabled={isLoading}
              leftElement={<Icon name="ms:qr_code_2" size={20} className="text-on-surface-variant/40" />}
            />
            <Input
              label="Archetype / Career Vector"
              type="text"
              placeholder="e.g. Backend Architect"
              value={formData?.careerGoal}
              onChange={(e) => handleInputChange('careerGoal', e.target.value)}
              error={errors?.careerGoal}
              disabled={isLoading}
              leftElement={<Icon name="ms:flag" size={20} className="text-on-surface-variant/40" />}
            />
          </div>
        )}

        <div className="space-y-5 px-1">
          <div className="flex items-start gap-4 group cursor-pointer p-4 rounded-2xl bg-surface-container-highest/10 border border-outline-variant/10 hover:border-primary/20 transition-all">
            <div className="relative flex items-center h-6">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e?.target?.checked)}
                disabled={isLoading}
                className="w-5 h-5 rounded border-outline-variant/30 bg-surface-container-highest/20 text-primary focus:ring-primary/20 transition-all cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest leading-relaxed group-hover:text-on-surface transition-colors cursor-pointer opacity-50 group-hover:opacity-100">
              I acknowledge the <button type="button" className="text-primary hover:underline">Nexus Protocols</button> and <button type="button" className="text-primary hover:underline">Privacy Spheres</button> of IntervYou.AI.
            </label>
          </div>
          <AnimatePresence>
            {errors?.terms && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] text-error font-extrabold uppercase tracking-widest ml-12"
              >
                {errors.terms}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="submit"
          className="w-full h-16 group rounded-xl shadow-sm"
          disabled={isLoading}
        >
          <span className="flex items-center gap-3 font-headline font-semibold text-sm">
            {isLoading ? 'Creating Profile...' : 'Create Account'}
            {!isLoading && <Icon name="ms:rocket_launch" size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />}
          </span>
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
