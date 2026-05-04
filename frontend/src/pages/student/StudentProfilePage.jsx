import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/button';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { motion } from 'framer-motion';

const StudentProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    careerGoal: '',
    phone: '',
    skills: [],
    prn: '',
    branch: '',
    currentSemester: '',
    currentCgpa: '',
    passingYear: ''
  });
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [resumeInfo, setResumeInfo] = useState(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        careerGoal: user.careerGoal || '',
        phone: user.phone || '',
        skills: user.skills || [],
        prn: user.prn || '',
        branch: user.branch || '',
        currentSemester: user.currentSemester || '',
        currentCgpa: user.currentCgpa || '',
        passingYear: user.passingYear || ''
      });
      setProfileImageUrl(user.profileImageUrl || '');
      if (user.resumeUrl) {
        setResumeInfo({
          name: user.resumeFilename || 'resume.pdf',
          url: user.resumeUrl
        });
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Invalid format: Only PDF files are allowed');
      return;
    }

    setIsUploadingResume(true);
    try {
      // 1. Upload to Cloudinary
      const cloudinaryRes = await uploadToCloudinary(file);
      const resumeUrl = cloudinaryRes.secure_url;
      const resumeFilename = file.name;

      // 2. Update Backend
      await api.post('students/resume', { resumeUrl, resumeFilename });

      // 3. Update local state
      setResumeInfo({
        name: resumeFilename,
        url: resumeUrl
      });
      
      // Update user context if necessary
      if (setUser && user) {
        setUser({
          ...user,
          resumeUrl,
          resumeFilename
        });
      }

      console.log('Resume processed successfully');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Upload failed: Could not link resume to profile');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatePayload = {
        fullName: formData.fullName,
        careerGoal: formData.careerGoal,
        phone: formData.phone,
        skills: formData.skills,
        prn: formData.prn,
        branch: formData.branch,
        currentSemester: formData.currentSemester,
        currentCgpa: formData.currentCgpa ? parseFloat(formData.currentCgpa) : null,
        passingYear: formData.passingYear ? parseInt(formData.passingYear) : null,
        profileImageUrl,
        resumeUrl: resumeInfo?.url,
        resumeFilename: resumeInfo?.name
      };

      const { data } = await api.post('students/profile', updatePayload);
      setUser({ ...user, ...data.data });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
              <span className="text-on-surface-variant">{'>'}</span> YOUR PROFILE
            </h1>
            <p className="text-on-surface-variant font-headline mt-2 text-xs font-bold uppercase tracking-widest opacity-60">
              Manage your personal information and credentials
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white font-black hover:bg-primary/80 px-8 h-12 rounded-xl shadow-lg uppercase tracking-widest text-xs"
            >
              EDIT PROFILE <Icon name="ms:edit" size={18} className="ml-2" />
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsEditing(false)}
                className="bg-white/5 text-white font-black hover:bg-white/10 px-8 h-12 rounded-xl border border-white/5 uppercase tracking-widest text-xs"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSave}
                loading={isSaving}
                className="bg-primary text-white font-black hover:bg-primary/80 px-8 h-12 rounded-xl shadow-lg uppercase tracking-widest text-xs"
              >
                SAVE CHANGES
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Avatar Section */}
          <div className="md:col-span-1 space-y-8">
            <div className="relative group">
              <div className="w-full aspect-square border-2 border-white/5 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden shadow-2xl transition-all hover:border-primary/40">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Icon name="ms:person" size={80} className="text-on-surface-variant/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isEditing && (
                <div className="mt-6">
                  <label className="block w-full text-center py-3 border border-primary/30 text-primary font-headline text-[10px] font-black cursor-pointer hover:bg-primary/5 transition-all rounded-xl uppercase tracking-widest">
                    CHANGE IMAGE
                    <input type="file" className="hidden" />
                  </label>
                </div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
              <h3 className="font-headline font-black text-on-surface-variant border-b border-white/5 pb-4 text-[10px] uppercase tracking-widest italic opacity-40">Account Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between font-headline text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface-variant/40">ROLE:</span>
                  <span className="text-primary">STUDENT</span>
                </div>
                <div className="flex justify-between font-headline text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface-variant/40">STATUS:</span>
                  <span className="text-secondary">VERIFIED</span>
                </div>
                <div className="flex justify-between font-headline text-[10px] font-black uppercase tracking-widest gap-4">
                  <span className="text-on-surface-variant/40 shrink-0">ORGANIZATION:</span>
                  <span className="text-white text-right truncate">{user?.organizationName || 'GLOBAL'}</span>
                </div>
                <div className="flex justify-between font-headline text-[10px] font-black uppercase tracking-widest">
                  <span className="text-on-surface-variant/40">ORG_CODE:</span>
                  <span className="text-secondary">{user?.organizationCode || 'GLOBAL_ACCESS'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] rounded-full -mr-24 -mt-24 pointer-events-none" />
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Full Name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                  />
                </div>

                <div className="space-y-3">
                  <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Career Goal</label>
                  <input 
                    name="careerGoal"
                    value={formData.careerGoal}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">PRN (Registration No)</label>
                    <input 
                      name="prn"
                      value={formData.prn}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. 2021000123"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Branch / Dept</label>
                    <input 
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Semester</label>
                    <input 
                      name="currentSemester"
                      value={formData.currentSemester}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. 6th"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Current CGPA</label>
                    <input 
                      name="currentCgpa"
                      type="number"
                      step="0.01"
                      value={formData.currentCgpa}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. 8.5"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Passing Year</label>
                    <input 
                      name="passingYear"
                      type="number"
                      value={formData.passingYear}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. 2025"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Email Address</label>
                    <input 
                      value={user?.email}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white/40 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="font-headline text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Phone Number</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 font-headline text-sm text-white focus:border-primary/40 focus:ring-0 outline-none transition-all disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              <h3 className="font-headline font-black text-white flex items-center gap-3 text-sm uppercase tracking-widest">
                <Icon name="ms:psychology" size={24} className="text-secondary" />
                Skill Set
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {formData.skills && formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-white font-headline text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-secondary/40 hover:bg-secondary/5 transition-all group relative"
                    >
                      {skill}
                      {isEditing && (
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))}
                          className="ml-2 text-red-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="font-headline text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest italic">
                    No skills identified yet. Upload a resume to auto-extract your skills.
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 flex gap-3">
                  <input 
                    type="text"
                    placeholder="Add a skill..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:border-secondary/40 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && !formData.skills.includes(val)) {
                          setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <p className="text-[8px] font-black text-on-surface-variant/30 uppercase tracking-widest flex items-center">Press Enter to add</p>
                </div>
              )}
            </div>

            {/* Resume Section */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-6 shadow-2xl">
              <h3 className="font-headline font-black text-white flex items-center gap-3 text-sm uppercase tracking-widest">
                <Icon name="ms:description" size={24} className="text-primary" />
                Resume Attachment
              </h3>
              
              {resumeInfo ? (
                <div className="flex items-center justify-between border border-white/5 bg-white/5 rounded-2xl p-6 transition-all hover:bg-white/[0.08]">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded-xl border border-primary/20 shadow-inner">
                      <Icon name="ms:picture_as_pdf" size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-headline text-sm font-black text-white italic tracking-tight">{resumeInfo.name}</p>
                      <p className="font-headline text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1">Linked to profile</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="h-10 px-6 text-[10px] font-headline font-black uppercase tracking-widest bg-white text-black hover:bg-primary hover:text-white rounded-xl transition-all shadow-lg" onClick={() => window.open(resumeInfo.url, '_blank')}>VIEW</Button>
                    {isEditing && (
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 px-6 text-[10px] font-headline font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all"
                        loading={isUploadingResume}
                      >
                        REPLACE
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/10 p-16 text-center space-y-6 rounded-[2.5rem] bg-white/[0.01]">
                  <Icon name="ms:cloud_upload" size={60} className="mx-auto text-on-surface-variant/20" />
                  <p className="font-headline text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest">No resume uploaded</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-headline text-[10px] font-black px-8 h-12 rounded-xl uppercase tracking-widest transition-all"
                    loading={isUploadingResume}
                  >
                    {isUploadingResume ? 'UPLOADING...' : 'UPLOAD RESUME'}
                  </Button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf" 
                onChange={handleResumeUpload} 
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;