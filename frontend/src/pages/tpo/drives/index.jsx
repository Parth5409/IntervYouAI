import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import api from '../../../utils/api';
import { cn } from '../../../utils/cn';

const DriveManagementPage = () => {
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    minCgpa: ''
  });
  const [error, setError] = useState('');

  const fetchDrives = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/drives/all');
      setDrives(res.data.data || res.data);
    } catch (error) {
      console.error("Failed to fetch drives", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsImporting(true);
      setError('');
      
      const payload = {
        ...formData,
        minCgpa: parseFloat(formData.minCgpa) || 0
      };

      await api.post('/drives', payload);
      setIsSheetOpen(false);
      fetchDrives();
      setFormData({ companyName: '', jobDescription: '', minCgpa: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleAssign = async (driveId) => {
    try {
      await api.post(`/drives/${driveId}/assign`);
      // Update status or show success toast
      alert('DRIVE_ASSIGNED_TO_ELIGIBLE_CANDIDATES');
    } catch (error) {
      console.error("Failed to assign drive", error);
      alert('ASSIGNMENT_FAILED');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-mono font-bold text-slate-100 uppercase tracking-tighter">
              Placement_Drive_Registry
            </h1>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
              Active recruitment nodes and campaign management
            </p>
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                <Icon name="Plus" size={16} className="mr-2" />
                INITIALIZE_NEW_DRIVE
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-950 border-l border-slate-800 text-slate-50 w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle className="text-slate-100 font-mono text-xl uppercase tracking-tighter">
                  Define_Placement_Parameters
                </SheetTitle>
              </SheetHeader>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <Input
                  label="Corporation Name"
                  name="companyName"
                  placeholder="e.g. MICROSOFT"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                    Job_Description (JD)
                  </label>
                  <textarea
                    name="jobDescription"
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Paste full JD text here for AI skill extraction..."
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Input
                  label="Minimum CGPA Threshold"
                  name="minCgpa"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 7.50"
                  value={formData.minCgpa}
                  onChange={handleInputChange}
                  required
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20">
                    <p className="text-[10px] font-mono text-red-500 uppercase">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 text-slate-950 font-bold"
                  >
                    {isSubmitting ? 'ANALYZING_JD_AND_SAVING...' : 'COMMIT_PLACEMENT_DRIVE'}
                  </Button>
                  <p className="text-[8px] font-mono text-slate-500 mt-4 text-center uppercase leading-relaxed">
                    * AI engine will automatically extract technical skill vectors from the provided JD 
                    to customize interview context for each candidate.
                  </p>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500 animate-pulse font-mono uppercase tracking-widest">
              Syncing_Drive_Data...
            </div>
          ) : drives.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-mono uppercase tracking-widest border border-dashed border-slate-800">
              No_Active_Drives_Found
            </div>
          ) : (
            drives.map((drive) => (
              <div key={drive.id} className="bg-slate-900/50 border border-slate-800 p-6 space-y-4 hover:border-slate-700 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-tighter">
                      {drive.companyName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">
                      Created: {new Date(drive.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-500/5 border border-sky-500/20 text-sky-500 text-[8px] font-bold uppercase">
                    CGPA {'>'}= {drive.minCgpa}
                  </span>
                </div>

                <div className="h-24 overflow-hidden relative">
                  <p className="text-xs text-slate-400 font-mono line-clamp-4 leading-relaxed">
                    {drive.jobDescription}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900/90 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {drive.skillsRequired?.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-mono uppercase border border-slate-700">
                      {skill}
                    </span>
                  ))}
                  {drive.skillsRequired?.length > 4 && (
                    <span className="text-[8px] font-mono text-slate-600">+{drive.skillsRequired.length - 4} MORE</span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleAssign(drive.id)}
                    className="flex-1 text-[10px] border-slate-800 text-slate-300 hover:bg-sky-500/5 hover:text-sky-400 hover:border-sky-500/30"
                  >
                    ASSIGN_TO_STUDENTS <Icon name="Users" size={12} className="ml-2" />
                  </Button>
                  <Button 
                    variant="ghost"
                    className="text-[10px] text-slate-500 hover:text-red-400"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriveManagementPage;
