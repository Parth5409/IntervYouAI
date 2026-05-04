import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
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
  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState(false);
  const [selectedDriveForAssign, setSelectedDriveForAssign] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);
  const [selectedStudentsForAssign, setSelectedStudentsForAssign] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    minCgpa: '',
    minLpa: '',
    maxLpa: '',
    activeModules: ['TECHNICAL'],
    skillsRequired: [],
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

  const handleExtractSkills = async () => {
    if (!formData.jobDescription) {
      toast.error("Please provide a Job Description first");
      return;
    }

    try {
      setIsExtracting(true);
      const res = await api.post('drives/extract-skills', { job_description: formData.jobDescription });
      const extracted = res.data.data || [];
      
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...new Set([...prev.skillsRequired, ...extracted])]
      }));
      toast.success(`${extracted.length} skills suggested`);
    } catch (error) {
      toast.error("Failed to extract skills");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove)
    }));
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
        skillsRequired: [],
        config: {
          technical: { difficulty: 'MEDIUM', questions: 8 },
          hr_salary: { difficulty: 'MEDIUM', questions: 10, negotiation_style: 'ASSERTIVE' },
          gd: { topics: [''] }
        }
      });    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignSheet = async (drive) => {
    setSelectedDriveForAssign(drive);
    setIsAssignSheetOpen(true);
    setIsLoadingEligible(true);
    try {
      const response = await api.get(`/drives/${drive.id}/eligible-students`);
      setEligibleStudents(response.data.data);
      // Auto-select students with >60% match
      setSelectedStudentsForAssign(
        response.data.data
          .filter(s => s.matchPercentage >= 60)
          .map(s => s.userId)
      );
    } catch (error) {
      toast.error("Failed to fetch eligible students");
    } finally {
      setIsLoadingEligible(false);
    }
  };

  const executeAssignment = async () => {
    if (selectedStudentsForAssign.length === 0) {
      toast.error("Select at least one student");
      return;
    }

    try {
      setIsAssigning(true);
      await api.post(`/drives/${selectedDriveForAssign.id}/assign`, selectedStudentsForAssign);
      toast.success(`${selectedStudentsForAssign.length} students assigned successfully`);
      setIsAssignSheetOpen(false);
    } catch (error) {
      console.error("Assignment failed", error);
      toast.error('Assignment failed');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleToggleStudentSelection = (userId) => {
    setSelectedStudentsForAssign(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDelete = async (driveId) => {
    try {
      await api.delete(`/drives/${driveId}`);
      toast.success('Placement drive deleted successfully');
      fetchDrives();
    } catch (error) {
      console.error("Failed to delete drive", error);
      toast.error('Deletion failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">
              Drive Registry
            </h1>
            <p className="font-mono text-on-surface-variant mt-1 text-xs font-label font-medium text-on-surface-variant">
              Active recruitment drives and management
            </p>
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-secondary text-slate-950 font-bold hover:bg-secondary-fixed">
                <Icon name="Plus" size={16} className="mr-2" />
                ADD NEW DRIVE
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-on-surface font-headline text-xl">
                  New Drive Details
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
                  <label className="font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2 block">
                    Job Description
                  </label>
                  <textarea
                    name="jobDescription"
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant rounded-xl p-4 text-on-surface placeholder:text-outline/40 font-body text-sm min-h-[150px] focus:outline-none input-focus-glow transition-all"
                    placeholder="Paste JD here for AI skill extraction..."
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleExtractSkills}
                      disabled={isExtracting}
                      className="flex items-center gap-2 text-[10px] font-black text-secondary hover:text-secondary-fixed transition-colors uppercase tracking-widest bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20"
                    >
                      <Icon name="RefreshCw" size={12} className={cn(isExtracting && "animate-spin")} />
                      {isExtracting ? 'EXTRACTING...' : 'EXTRACT SKILLS'}
                    </button>
                  </div>
                </div>

                {/* Skill Set Management */}
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-4">
                  <h3 className="font-headline font-black text-white flex items-center gap-2 text-[10px] uppercase tracking-widest italic opacity-60">
                    <Icon name="Target" size={14} className="text-secondary" />
                    Target Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skillsRequired.length > 0 ? (
                      formData.skillsRequired.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 group"
                        >
                          {skill}
                          <button 
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest italic">
                        No skills specified. Use extraction or add manually.
                      </p>
                    )}
                  </div>
                  <div className="pt-2">
                    <input 
                      type="text"
                      placeholder="Add manual skill..."
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white focus:border-secondary/40 outline-none uppercase tracking-widest font-black"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !formData.skillsRequired.includes(val)) {
                            setFormData(prev => ({ ...prev, skillsRequired: [...prev.skillsRequired, val] }));
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
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
                  className="bg-white/5 border-white/10 focus:border-primary/50"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Minimum LPA"
                    name="minLpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10.0"
                    value={formData.minLpa}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                  <Input
                    label="Maximum LPA"
                    name="maxLpa"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.0"
                    value={formData.maxLpa}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2 block">
                    Active Interview Modules
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['TECHNICAL', 'HR_SALARY', 'GD'].map(module => (
                      <button
                        key={module}
                        type="button"
                        onClick={() => handleModuleToggle(module)}
                        className={cn(
                          "px-4 py-2 text-[10px] font-black border transition-all rounded-xl uppercase tracking-widest",
                          formData.activeModules.includes(module)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-white/5 border-white/10 text-on-surface-variant hover:border-white/20 hover:bg-white/10"
                        )}
                      >
                        {module.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Technical Module Settings */}
                {formData.activeModules.includes('TECHNICAL') && (
                  <div className="p-6 border border-white/5 bg-white/[0.02] rounded-[2rem] space-y-4 shadow-xl">
                    <h3 className="font-headline font-black text-secondary text-[10px] uppercase tracking-widest italic opacity-60">
                      Technical Config
                    </h3>                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="bg-white/5 border-white/10 focus:border-primary/50"
                      />                    </div>
                  </div>
                )}

                {/* HR & Salary Module Settings */}
                {formData.activeModules.includes('HR_SALARY') && (
                  <div className="p-6 border border-white/5 bg-white/[0.02] rounded-[2rem] space-y-4 shadow-xl">
                    <h3 className="font-headline font-black text-sky-400 text-[10px] uppercase tracking-widest italic opacity-60">
                      HR & Salary Config
                    </h3>                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />                  </div>
                )}

                {/* GD Module Settings */}
                {formData.activeModules.includes('GD') && (
                  <div className="p-6 border border-white/5 bg-white/[0.02] rounded-[2rem] space-y-4 shadow-xl">
                    <h3 className="font-headline font-black text-amber-400 text-[10px] uppercase tracking-widest italic opacity-60">
                      GD Config
                    </h3>                    <div className="space-y-3">
                      <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2 block">
                        Discussion Topic Pool
                      </label>
                      
                      {formData.config.gd.topics.map((topic, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-on-surface focus:border-amber-400/50 outline-none transition-all placeholder:text-white/10"
                              placeholder={`Enter topic ${index + 1}...`}
                              value={topic}
                              onChange={(e) => handleGDTopicChange(index, e.target.value)}
                            />
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
                          </div>                          <button
                            type="button"
                            onClick={() => handleRemoveGDTopic(index)}
                            className="p-2 border border-outline-variant/30 text-on-surface-variant hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddGDTopic}
                        className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[10px] font-black text-on-surface-variant hover:text-secondary hover:border-secondary/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest bg-white/[0.01]"
                      >
                        <Icon name="Plus" size={12} />
                        ADD NEW TOPIC
                      </button>
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">
                        * One topic will be randomly selected for each session
                      </p>                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-slate-950 font-black h-14 rounded-xl shadow-xl shadow-secondary/10 uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? 'ANALYZING JD...' : 'CREATE PLACEMENT DRIVE'}
                  </Button>
                  <p className="text-[8px] font-black text-on-surface-variant/40 mt-6 text-center leading-relaxed uppercase tracking-widest">
                    * AI engine will automatically extract technical skill vectors from the provided JD to customize interview context.
                  </p>
                </div>              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-on-surface-variant animate-pulse font-headline text-xs uppercase tracking-widest">
              Syncing drive data...
            </div>
          ) : drives.length === 0 ? (
            <div className="col-span-full py-12 text-center text-on-surface-variant font-headline text-xs uppercase tracking-widest border border-dashed border-outline-variant/30 rounded-[2rem]">
              No active drives found
            </div>
          ) : (
            drives.map((drive) => (
              <div key={drive.id} className="bg-surface-container-low/50 border border-outline-variant/30 p-6 space-y-4 hover:border-outline-variant/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">
                      {drive.companyName}
                    </h3>
                    <p className="text-[10px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">
                      Created: {new Date(drive.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-500/5 border border-sky-500/20 text-sky-500 text-[8px] font-bold uppercase">
                    CGPA {'>'}= {drive.minCgpa}
                  </span>
                </div>

                <div className="h-24 overflow-hidden relative">
                  <p className="text-xs text-on-surface-variant font-mono line-clamp-4 leading-relaxed">
                    {drive.jobDescription}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900/90 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {drive.skillsRequired?.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant text-[8px] font-mono border border-outline-variant/30 font-label font-medium text-on-surface-variant">
                      {skill}
                    </span>
                  ))}
                  {drive.skillsRequired?.length > 4 && (
                    <span className="text-[8px] font-mono text-on-surface-variant">+{drive.skillsRequired.length - 4} MORE</span>
                  )}
                </div>

                <div className="pt-4 border-t border-outline-variant/30 flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => openAssignSheet(drive)}
                    className="flex-1 text-[10px] border-outline-variant/30 text-slate-300 hover:bg-sky-500/5 hover:text-sky-400 hover:border-sky-500/30 font-black uppercase tracking-widest"
                  >
                    ASSIGN TO STUDENTS <Icon name="Users" size={12} className="ml-2" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="text-[10px] text-on-surface-variant hover:text-red-400"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-surface-container-low border border-white/5 rounded-[2rem] shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-black text-white italic uppercase tracking-tighter text-2xl">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-on-surface-variant">
                          This action will permanently delete the placement drive
                          for {drive.companyName} and remove all associated candidate data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 text-white border-white/5 rounded-xl uppercase tracking-widest text-[10px] font-black">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(drive.id)} className="bg-red-500 text-white rounded-xl uppercase tracking-widest text-[10px] font-black hover:bg-red-600">
                          DELETE
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

      <Sheet open={isAssignSheetOpen} onOpenChange={setIsAssignSheetOpen}>
        <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-on-surface font-headline text-xl flex items-center gap-3">
              Assign Students - {selectedDriveForAssign?.companyName}
              <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-black italic">
                Matching System Active
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {/* Required Skills Summary */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4 opacity-40">Required Skill Set</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDriveForAssign?.skillsRequired?.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 text-white text-[10px] font-headline font-bold uppercase tracking-widest rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Students List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">
                  Eligible Candidates ({eligibleStudents.length})
                </h4>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedStudentsForAssign(eligibleStudents.map(s => s.userId))}
                    className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedStudentsForAssign([])}
                    className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingEligible ? (
                  <div className="py-20 text-center animate-pulse font-headline text-xs uppercase tracking-[0.3em] opacity-30 italic">
                    Matching candidates by skills...
                  </div>
                ) : eligibleStudents.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-[2rem] font-headline text-xs uppercase tracking-widest opacity-30 italic">
                    No students meet CGPA threshold
                  </div>
                ) : (
                  eligibleStudents.map((student) => (
                    <div 
                      key={student.userId}
                      onClick={() => handleToggleStudentSelection(student.userId)}
                      className={cn(
                        "p-4 border rounded-2xl transition-all cursor-pointer flex items-center gap-4 group",
                        selectedStudentsForAssign.includes(student.userId)
                          ? "bg-primary/10 border-primary/30"
                          : "bg-white/[0.01] border-white/5 hover:border-white/20"
                      )}
                    >
                      <Checkbox 
                        checked={selectedStudentsForAssign.includes(student.userId)}
                        onChange={() => {}} // Handled by parent div click
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-headline font-black text-white italic tracking-tight">{student.fullName}</div>
                            <div className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-0.5">{student.branch} • CGPA {student.currentCgpa}</div>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-tighter",
                            student.matchPercentage >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                            student.matchPercentage >= 40 ? "bg-amber-500/20 text-amber-400" :
                            "bg-white/5 text-on-surface-variant/40"
                          )}>
                            {student.matchPercentage}% MATCH
                          </div>
                        </div>
                        
                        {/* Skill Intersection */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {student.matchedSkills.map(skill => (
                            <span key={skill} className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/5 px-1.5 py-0.5 rounded-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-8 border-t border-white/5">
              <Button
              disabled={isAssigning || selectedStudentsForAssign.length === 0}
              onClick={executeAssignment}
              className="w-full h-16 bg-secondary text-slate-950 font-black rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-secondary/10"
              >
              {isAssigning ? 'ASSIGNING STUDENTS...' : `ASSIGN ${selectedStudentsForAssign.length} SELECTED CANDIDATES`}
              </Button>              <p className="text-[8px] font-black text-on-surface-variant/30 text-center mt-6 uppercase tracking-widest leading-relaxed">
                * Selected candidates will receive a system notification and the drive will appear in their interview registry.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default DriveManagementPage;
