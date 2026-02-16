import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import api from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { uploadToCloudinary } from '../../../utils/cloudinary';

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    prn: '',
    branch: '',
    currentSemester: '',
    currentCgpa: '',
    passingYear: '',
    skills: '',
    careerGoal: ''
  });
  const [lockedFields, setLockedFields] = useState({});
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      const newFormData = {
        prn: user.prn || '',
        branch: user.branch || '',
        currentSemester: user.currentSemester || '',
        currentCgpa: user.currentCgpa || '',
        passingYear: user.passingYear || '',
        skills: user.skills ? user.skills.join(', ') : '',
        careerGoal: user.careerGoal || ''
      };
      setFormData(newFormData);

      // Lock fields that are already provided (e.g. by TPO bulk import)
      const newLockedFields = {};
      if (user.prn) newLockedFields.prn = true;
      if (user.branch) newLockedFields.branch = true;
      setLockedFields(newLockedFields);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (lockedFields[name]) return; // Prevent editing locked fields
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, resume: 'ERR_INVALID_FORMAT: PDF_REQUIRED' }));
        return;
      }
      setResume(file);
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.prn.trim()) newErrors.prn = 'Permanent Registration Number is required';
    if (!formData.skills.trim()) newErrors.skills = 'Please list at least one skill';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let resumeUrl = '';
      
      // 1. Upload Resume to Cloudinary first
      if (resume) {
        try {
          const cloudinaryRes = await uploadToCloudinary(resume);
          resumeUrl = cloudinaryRes.secure_url;
        } catch (uploadError) {
          console.error("Resume Upload Error:", uploadError);
          setErrors({ submit: 'ERR_RESUME_UPLOAD: CLOUDINARY_FAIL' });
          setIsLoading(false);
          return;
        }
      }

      // 2. Create Profile in Backend
      const profilePayload = {
        prn: formData.prn,
        branch: formData.branch,
        currentSemester: formData.currentSemester,
        currentCgpa: formData.currentCgpa ? parseFloat(formData.currentCgpa) : null,
        passingYear: formData.passingYear ? parseInt(formData.passingYear) : null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        careerGoal: formData.careerGoal,
        resumeUrl: resumeUrl
      };

      await api.post('/students/profile', profilePayload);

      // 3. Refresh user state and navigate
      await refetchUser();
      navigate('/dashboard');

    } catch (error) {
      console.error("Onboarding Error:", error);
      setErrors({
        submit: error.response?.data?.message || 'SYSTEM_ERR: PROFILE_CREATION_FAILED'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="PRN (Registration Number)"
            name="prn"
            placeholder="e.g. 2021000123"
            value={formData.prn}
            onChange={handleInputChange}
            error={errors.prn}
            required
            disabled={isLoading || lockedFields.prn}
          />
          {lockedFields.prn && (
            <div className="absolute right-3 top-9 text-slate-600" title="Verified by Institution">
              <Icon name="Lock" size={14} />
            </div>
          )}
        </div>
        <div className="relative">
          <Input
            label="Branch / Department"
            name="branch"
            placeholder="e.g. Computer Science"
            value={formData.branch}
            onChange={handleInputChange}
            disabled={isLoading || lockedFields.branch}
          />
          {lockedFields.branch && (
            <div className="absolute right-3 top-9 text-slate-600" title="Verified by Institution">
              <Icon name="Lock" size={14} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Current Semester"
          name="currentSemester"
          placeholder="e.g. 6th"
          value={formData.currentSemester}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <Input
          label="Current CGPA"
          name="currentCgpa"
          type="number"
          step="0.01"
          placeholder="e.g. 8.5"
          value={formData.currentCgpa}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <Input
          label="Passing Year"
          name="passingYear"
          type="number"
          placeholder="e.g. 2025"
          value={formData.passingYear}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-2">
          Technical_Capabilities (Comma Separated)
        </label>
        <textarea
          name="skills"
          className="w-full rounded-none border border-slate-800 bg-slate-950 px-4 py-2 text-slate-50 font-mono text-sm ring-offset-background placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors min-h-[80px]"
          placeholder="JAVA, PYTHON, REACT, SPRING_BOOT..."
          value={formData.skills}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {errors.skills && (
          <p className="font-mono text-[10px] text-red-500 uppercase tracking-tight mt-1">{errors.skills}</p>
        )}
      </div>

      <Input
        label="Career Goal"
        name="careerGoal"
        placeholder="e.g. SDE at a FAANG company"
        value={formData.careerGoal}
        onChange={handleInputChange}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          Resume_Upload (PDF)
        </label>
        <div className="relative border border-dashed border-slate-800 bg-slate-900/50 p-6 text-center hover:bg-slate-900 transition-colors group">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Icon name="Upload" size={24} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
              {resume ? resume.name : 'DRAG_DROP OR CLICK_TO_UPLOAD'}
            </span>
          </div>
        </div>
        {errors.resume && (
          <p className="font-mono text-[10px] text-red-500 uppercase tracking-tight mt-1">
            {errors.resume}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] font-mono text-red-500 uppercase">{errors.submit}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        className="w-full h-12"
        disabled={isLoading}
      >
        {isLoading ? 'INITIALIZING_PROFILE...' : 'COMPLETE_SETUP'}
      </Button>
    </form>
  );
};

export default OnboardingForm;