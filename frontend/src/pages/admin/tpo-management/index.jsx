import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
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
            <h1 className="text-2xl font-mono font-bold text-slate-100">TPO_REGISTRY</h1>
            <p className="text-xs font-mono text-slate-400">Manage institutional access nodes</p>
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                <Icon name="Plus" size={16} className="mr-2" />
                ADD_NEW_TPO
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-950 border-l border-slate-800 text-slate-50">
              <SheetHeader>
                <SheetTitle className="text-slate-100 font-mono text-xl">INITIALIZE_TPO_NODE</SheetTitle>
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
                <Button type="submit" className="w-full bg-emerald-500 text-slate-950 font-bold">
                  PROVISION_ACCOUNT
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-none overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase">Identity</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase">Contact_Point</th>
                <th className="px-6 py-4 text-slate-500 font-bold uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">LOADING_DATA...</td></tr>
              ) : tpos.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">NO_RECORDS_FOUND</td></tr>
              ) : (
                tpos.map((tpo) => (
                  <tr key={tpo.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-xs text-slate-400">{tpo.fullName.charAt(0)}</span>
                      </div>
                      {tpo.fullName}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{tpo.email}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
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