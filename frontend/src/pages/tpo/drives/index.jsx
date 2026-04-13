import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import api from '../../../utils/api';
import { cn } from '../../../utils/cn';
import { toast } from 'sonner';

const DriveManagementPage = () => {
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    minCgpa: '',
    minLpa: '',
    maxLpa: '',
    activeModules: ['TECHNICAL'],
    config: {
      technical: { difficulty: 'MEDIUM', questions: 8 },
      hr_salary: { difficulty: 'MEDIUM', questions: 10, negotiation_style: 'ASSERTIVE' },
      gd: { topics: [''] }
    }
  });
  const [error, setError] = useState('');

  const difficultyOptions = [
    { label: 'EASY', value: 'EASY' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'HARD', value: 'HARD' },
  ];

  const negotiationOptions = [
    { label: 'ASSERTIVE', value: 'ASSERTIVE' },
    { label: 'FLEXIBLE', value: 'FLEXIBLE' },
    { label: 'COLLABORATIVE', value: 'COLLABORATIVE' },
  ];

  const fetchDrives = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('drives/all');
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

  const handleModuleToggle = (module) => {
    setFormData(prev => {
      const active = prev.activeModules.includes(module)
        ? prev.activeModules.filter(m => m !== module)
        : [...prev.activeModules, module];
      return { ...prev, activeModules: active };
    });
  };

  const handleConfigChange = (module, field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [module]: {
          ...prev.config[module],
          [field]: value
        }
      }
    }));
  };

  const handleGDTopicChange = (index, value) => {
    setFormData(prev => {
      const newTopics = [...prev.config.gd.topics];
      newTopics[index] = value;
      return {
        ...prev,
        config: {
          ...prev.config,
          gd: { ...prev.config.gd, topics: newTopics }
        }
      };
    });
  };

  const handleAddGDTopic = () => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        gd: { ...prev.config.gd, topics: [...prev.config.gd.topics, ''] }
      }
    }));
  };

  const handleRemoveGDTopic = (index) => {
    setFormData(prev => {
      const newTopics = prev.config.gd.topics.filter((_, i) => i !== index);
      // Ensure there's always at least one input if possible, or leave empty
      return {
        ...prev,
        config: {
          ...prev.config,
          gd: { ...prev.config.gd, topics: newTopics.length > 0 ? newTopics : [''] }
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      
      const configForPayload = { ...formData.config };
      if (formData.activeModules.includes('GD')) {
        configForPayload.gd.topics = configForPayload.gd.topics
          .map(t => t.trim())
          .filter(Boolean);
      }

      const payload = {
        ...formData,
        minCgpa: parseFloat(formData.minCgpa) || 0,
        minLpa: parseFloat(formData.minLpa) || 0,
        maxLpa: parseFloat(formData.maxLpa) || 0,
        activeModules: formData.activeModules,
        configJson: JSON.stringify(configForPayload)
      };

      await api.post('drives', payload);
      setIsSheetOpen(false);
      fetchDrives();
      setFormData({ 
        companyName: '', 
        jobDescription: '', 
        minCgpa: '',
        minLpa: '',
        maxLpa: '',
        activeModules: ['TECHNICAL'],
        config: {
          technical: { difficulty: 'MEDIUM', questions: 8 },
          hr_salary: { difficulty: 'MEDIUM', questions: 10, negotiation_style: 'ASSERTIVE' },
          gd: { topics: [''] }
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (driveId) => {
    try {
      await api.post(`/drives/${driveId}/assign`);
      toast.success('DRIVE_ASSIGNED_TO_ELIGIBLE_CANDIDATES');
    } catch (error) {
      console.error("Failed to assign drive", error);
      toast.error('ASSIGNMENT_FAILED');
    }
  };

  const handleDelete = async (driveId) => {
    try {
      await api.delete(`/drives/${driveId}`);
      toast.success('PLACEMENT_DRIVE_DELETED_SUCCESSFULLY');
      fetchDrives();
    } catch (error) {
      console.error("Failed to delete drive", error);
      toast.error('DELETION_FAILED');
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
            <SheetContent className="bg-slate-950 border-l border-slate-800 text-slate-50 w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-slate-100 font-mono text-xl uppercase tracking-tighter">
                  Define_Placement_Parameters
                </SheetTitle>
              </SheetHeader>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6 pb-12">
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

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min LPA"
                    name="minLpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10.0"
                    value={formData.minLpa}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Max LPA"
                    name="maxLpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.0"
                    value={formData.maxLpa}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-4">
                  <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                    Active_Pipeline_Modules
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['TECHNICAL', 'HR_SALARY', 'GD'].map(module => (
                      <button
                        key={module}
                        type="button"
                        onClick={() => handleModuleToggle(module)}
                        className={cn(
                          "px-4 py-2 font-mono text-[10px] border transition-colors",
                          formData.activeModules.includes(module)
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                            : "border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                        {module.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical Module Settings */}
                {formData.activeModules.includes('TECHNICAL') && (
                  <div className="p-4 border border-slate-800 bg-slate-900/30 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                      [TECHNICAL_MODULE_CONFIG]
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Complexity Level"
                        value={formData.config.technical.difficulty}
                        onChange={(val) => handleConfigChange('technical', 'difficulty', val)}
                        options={difficultyOptions}
                      />
                      <Input
                        label="Question Count"
                        type="number"
                        value={formData.config.technical.questions}
                        onChange={(e) => handleConfigChange('technical', 'questions', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                {/* HR & Salary Module Settings */}
                {formData.activeModules.includes('HR_SALARY') && (
                  <div className="p-4 border border-slate-800 bg-slate-900/30 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-sky-500 uppercase tracking-widest">
                      [HR_SALARY_MODULE_CONFIG]
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Interviewer Persona"
                        value={formData.config.hr_salary.difficulty}
                        onChange={(val) => handleConfigChange('hr_salary', 'difficulty', val)}
                        options={difficultyOptions}
                      />
                      <Select
                        label="Negotiation Style"
                        value={formData.config.hr_salary.negotiation_style}
                        onChange={(val) => handleConfigChange('hr_salary', 'negotiation_style', val)}
                        options={negotiationOptions}
                      />
                    </div>
                    <Input
                      label="Max Round Questions"
                      type="number"
                      value={formData.config.hr_salary.questions}
                      onChange={(e) => handleConfigChange('hr_salary', 'questions', parseInt(e.target.value))}
                    />
                  </div>
                )}

                {/* GD Module Settings */}
                {formData.activeModules.includes('GD') && (
                  <div className="p-4 border border-slate-800 bg-slate-900/30 space-y-4">
                    <h3 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
                      [GD_MODULE_CONFIG]
                    </h3>
                    <div className="space-y-3">
                      <label className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                        DISCUSSION_TOPIC_POOL
                      </label>
                      
                      {formData.config.gd.topics.map((topic, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              className="w-full bg-slate-950 border border-slate-800 p-2 font-mono text-xs text-slate-200 focus:border-amber-500 outline-none transition-colors"
                              placeholder={`Enter topic ${index + 1}...`}
                              value={topic}
                              onChange={(e) => handleGDTopicChange(index, e.target.value)}
                            />
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGDTopic(index)}
                            className="p-2 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddGDTopic}
                        className="w-full py-2 border border-dashed border-slate-800 text-[10px] font-mono text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Icon name="Plus" size={12} />
                        ADD_NEW_TOPIC_NODE
                      </button>

                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                        * ONE_TOPIC_WILL_BE_SELECTED_RANDOMLY_FOR_EACH_SESSION
                      </p>
                    </div>
                  </div>
                )}

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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="text-[10px] text-slate-500 hover:text-red-400"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the placement drive
                          for {drive.companyName} and remove all associated candidate data from the registry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>CANCEL_OPERATION</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(drive.id)}>
                          CONFIRM_DELETION
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
