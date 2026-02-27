import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import api from '../../../utils/api';

const SystemConfigPage = () => {
  const [orgData, setOrgData] = useState({
    name: '',
    address: '',
    contactEmail: '',
    websiteUrl: '',
    code: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  const fetchOrgDetails = async () => {
    try {
      const res = await api.get('organizations/me');
      setOrgData(res.data.data || res.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch org details", error);
    }
  };

  const handleInputChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/organizations/me', orgData);
      setMessage({ type: 'success', text: 'CONFIGURATION_UPDATED_SUCCESSFULLY' });
    } catch (error) {
      setMessage({ type: 'error', text: 'UPDATE_FAILED: ' + (error.response?.data?.message || 'Unknown Error') });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-mono font-bold text-slate-100">SYSTEM_CONFIGURATION</h1>
          <p className="text-xs font-mono text-slate-400">Organization-wide settings and parameters</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-mono text-sm text-emerald-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
                Identity_Matrix
              </h3>
              <Input
                label="Organization Name"
                name="name"
                value={orgData.name}
                onChange={handleInputChange}
              />
              <Input
                label="Institution Code (Immutable)"
                name="code"
                value={orgData.code}
                disabled
                className="opacity-50 cursor-not-allowed bg-slate-950"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-sm text-sky-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
                Comms_Relay
              </h3>
              <Input
                label="Primary Contact Email"
                name="contactEmail"
                value={orgData.contactEmail || ''}
                onChange={handleInputChange}
              />
              <Input
                label="Public Website URL"
                name="websiteUrl"
                value={orgData.websiteUrl || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-mono text-sm text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">
              Physical_Coordinates
            </h3>
            <Input
              label="Headquarters Address"
              name="address"
              value={orgData.address || ''}
              onChange={handleInputChange}
            />
          </div>

          {message.text && (
            <div className={`p-4 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} font-mono text-xs`}>
              {message.text}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 w-40"
            >
              {isSaving ? 'SAVING...' : 'SAVE_CONFIG'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SystemConfigPage;