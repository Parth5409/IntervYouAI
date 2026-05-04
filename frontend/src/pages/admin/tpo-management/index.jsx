import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/Input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import api from '../../../utils/api';

const TpoManagementPage = () => {
  const [tpos, setTpos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [submitError, setSubmitError] = useState('');

  const fetchTPOs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('admin/tpo');
      setTpos(res.data.data || res.data); // Handle GenericResponse wrapper if present
    } catch (error) {
      console.error("Failed to fetch TPOs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTPOs();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('admin/tpo/create', { ...formData, role: 'TPO' });
      setIsSheetOpen(false);
      fetchTPOs();
      setFormData({ fullName: '', email: '', password: '' });
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to create TPO');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-mono font-bold text-on-surface">TPO_REGISTRY</h1>
            <p className="text-xs font-mono text-on-surface-variant">Manage institutional access points</p>
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-secondary text-slate-950 font-bold hover:bg-secondary-fixed">
                <Icon name="Plus" size={16} className="mr-2" />
                ADD_NEW_TPO
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface">
              <SheetHeader>
                <SheetTitle className="text-on-surface font-mono text-xl">ADD TPO ACCOUNT</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Prof. Sharma"
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="tpo@college.edu"
                />
                <Input
                  label="Default Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Create secure password"
                />
                {submitError && <p className="text-red-500 text-xs font-mono">{submitError}</p>}
                <Button type="submit" className="w-full bg-secondary text-slate-950 font-bold">
                  PROVISION_ACCOUNT
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-surface-container-low/50 border border-outline-variant/30 rounded-none overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 text-on-surface-variant font-bold uppercase">Identity</th>
                <th className="px-6 py-4 text-on-surface-variant font-bold uppercase">Contact_Point</th>
                <th className="px-6 py-4 text-on-surface-variant font-bold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-on-surface-variant">LOADING_DATA...</td></tr>
              ) : tpos.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-on-surface-variant">NO_RECORDS_FOUND</td></tr>
              ) : (
                tpos.map((tpo) => (
                  <tr key={tpo.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span className="text-xs text-on-surface-variant">{tpo.fullName.charAt(0)}</span>
                      </div>
                      {tpo.fullName}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{tpo.email}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-primary/10 text-secondary border border-secondary/20 text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TpoManagementPage;