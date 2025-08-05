import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import api from '../../../utils/api';

const ProfileTab = ({ user, onProfileUpdate }) => {
  // console.log('User in ProfileTab:', user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    careerGoal: user?.career_goal || '',
    phone: user?.phone || ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        careerGoal: user.career_goal || '',
        phone: user.phone || ''
      });
      setProfileImageUrl(user.profile_image_url || '');
      setResumeFile(user.resume_url || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setProfileImageUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSave = async () => {
    const submissionData = new FormData();
        if (formData.fullName) {
      submissionData.append('full_name', formData.fullName);
    }
    if (formData.careerGoal) {
      submissionData.append('career_goal', formData.careerGoal);
    }
    if (formData.phone) {
      submissionData.append('phone', formData.phone);
    }

    try {
      const { data } = await api.put('/user/profile', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (onProfileUpdate) {
        onProfileUpdate(data.data.user);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    if (user) {
        setFormData({
            fullName: user.full_name || '',
            email: user.email || '',
            careerGoal: user.career_goal || '',
                        phone: user.phone || ''
        });
        setProfileImageUrl(user.profile_image_url || '');
        setResumeFile(user.resume_url || null);
        setProfileImageFile(null);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} iconName="Edit" iconPosition="left" iconSize={16}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel} iconName="X" iconSize={16}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleSave} iconName="Check" iconSize={16}>
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                {profileImageUrl ? (
                  <Image src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="User" size={32} color="var(--color-muted-foreground)" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label htmlFor="profile-image-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Icon name="Camera" size={16} color="var(--color-primary-foreground)" />
                  <input id="profile-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} required />
              <Input label="Email Address" name="email" type="email" value={formData.email} disabled={true} required />
            </div>
            <Input label="Career Goal" name="careerGoal" value={formData.careerGoal} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Software Engineer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="+1 (555) 123-4567" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Resume</h3>
          {isEditing && (
            <label htmlFor="resume-upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
              <Icon name="Upload" className="mr-2 h-4 w-4" />
              <span>Upload Resume</span>
              <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
            </label>
          )}
        </div>

        {resumeFile ? (
          <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} color="var(--color-primary)" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{resumeFile.resume_filename || 'resume.pdf'}</p>
              <p className="text-xs text-muted-foreground">
                {resumeFile.updated_at ? `Uploaded on ${new Date(resumeFile.updated_at).toLocaleDateString()}` : 'New file selected'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No resume uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;