import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import api from '../../utils/api';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { motion } from 'framer-motion';

const StudentProfilePage = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    careerGoal: '',
    phone: '',
    skills: []
  });
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        careerGoal: user.careerGoal || '',
        phone: user.phone || '',
        skills: user.skills || []
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatePayload = {
        fullName: formData.fullName,
        careerGoal: formData.careerGoal,
        phone: formData.phone,
        skills: formData.skills,
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
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase flex items-center gap-3">
              <span className="text-slate-500">{'>'}</span> PROFILE_DECRYPTED
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Authorized Personnel Only // Biometric data secure
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            >
              EDIT_PROTOCOL <Icon name="Edit" size={16} className="ml-2" />
            </Button>
          ) : (
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsEditing(false)}
                className="bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
              >
                ABORT
              </Button>
              <Button 
                onClick={handleSave}
                loading={isSaving}
                className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
              >
                COMMIT_CHANGES
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="relative group">
              <div className="w-full aspect-square border-2 border-slate-800 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Icon name="User" size={80} className="text-slate-700" />
                )}
                <div className="absolute inset-0 border-[1px] border-emerald-500/20 pointer-events-none" />
              </div>
              {isEditing && (
                <div className="mt-4">
                  <label className="block w-full text-center py-2 border border-emerald-500/30 text-emerald-500 font-mono text-[10px] tracking-widest uppercase cursor-pointer hover:bg-emerald-500/5 transition-colors">
                    UPDATE_IMAGE
                    <input type="file" className="hidden" />
                  </label>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 space-y-4">
              <h3 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Status_Report</h3>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-500">CLEARANCE:</span>
                  <span className="text-emerald-500">LEVEL_01_STUDENT</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-500">IDENTITY:</span>
                  <span className="text-slate-300">VERIFIED</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] gap-2">
                  <span className="text-slate-500 shrink-0">ORGANIZATION:</span>
                  <span className="text-sky-500 text-right">{user?.organizationName || 'GLOBAL'}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-500">ORG_CODE:</span>
                  <span className="text-emerald-500">{user?.organizationCode || 'GLOBAL_ACCESS'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Full_Name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-950 border border-slate-800 p-3 font-mono text-sm focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Career_Goal</label>
                  <input 
                    name="careerGoal"
                    value={formData.careerGoal}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-950 border border-slate-800 p-3 font-mono text-sm focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Email_Endpoint</label>
                    <input 
                      value={user?.email}
                      disabled
                      className="w-full bg-slate-950/50 border border-slate-800 p-3 font-mono text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Comm_Link (Phone)</label>
                    <input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-slate-950 border border-slate-800 p-3 font-mono text-sm focus:border-emerald-500 outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 space-y-4">
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-sky-500" />
                Resource_Attachment (Resume)
              </h3>
              
              {resumeInfo ? (
                <div className="flex items-center justify-between border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <Icon name="FileText" size={20} className="text-sky-500" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-slate-200">{resumeInfo.name}</p>
                      <p className="font-mono text-[10px] text-slate-500 uppercase">Linked_to_profile</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="h-8 px-3 text-[10px] font-mono bg-slate-800 hover:bg-slate-700">VIEW</Button>
                    {isEditing && <Button className="h-8 px-3 text-[10px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20">REPLACE</Button>}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 p-12 text-center space-y-4">
                  <Icon name="UploadCloud" size={40} className="mx-auto text-slate-700" />
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">No assets detected // Upload required</p>
                  <Button className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 font-mono text-[10px] tracking-widest uppercase">INITIALIZE_UPLOAD</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfilePage;