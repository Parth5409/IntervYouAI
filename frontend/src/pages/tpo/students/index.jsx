import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/Input';
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
import { Checkbox } from '../../../components/ui/Checkbox';
import api from '../../../utils/api';
import { cn } from '../../../utils/cn';
import { toast } from 'sonner';

const StudentDirectoryPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('students/all');
      setStudents(res.data.data || res.data);
      setSelectedStudents([]); // Reset selection on refresh
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id, checked) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, id]);
    } else {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student record deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.delete('/students/bulk-delete', { data: selectedStudents });
      toast.success(`${selectedStudents.length} student records deleted`);
      fetchStudents();
    } catch (error) {
      toast.error('Bulk delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBackfillSkills = async () => {
    try {
      setIsBackfilling(true);
      await api.post('students/backfill-skills');
      toast.success('Skill extraction initiated for existing resumes');
    } catch (error) {
      toast.error('Backfill failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent({
      ...student,
      skills: student.skills ? student.skills.join(', ') : ''
    });
    setIsEditSheetOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const payload = {
        prn: editingStudent.prn,
        branch: editingStudent.branch,
        currentSemester: editingStudent.currentSemester,
        currentCgpa: parseFloat(editingStudent.currentCgpa),
        passingYear: parseInt(editingStudent.passingYear),
        skills: editingStudent.skills.split(',').map(s => s.trim()).filter(Boolean),
        careerGoal: editingStudent.careerGoal
      };
      await api.put(`/students/${editingStudent.id}`, payload);
      toast.success('Student details updated');
      setIsEditSheetOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error('Update failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const obj = {};
      const currentline = lines[i].split(',');

      headers.forEach((header, index) => {
        let value = currentline[index]?.trim();
        if (header === 'currentCgpa') value = parseFloat(value);
        if (header === 'passingYear') value = parseInt(value);
        if (header === 'skills') {
          value = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        obj[header] = value;
      });
      result.push(obj);
    }
    return result;
  };

  const handleBulkImport = async () => {
    if (!csvData) {
      setImportError('Please upload a CSV file first.');
      return;
    }

    try {
      setIsImporting(true);
      setImportError('');
      const parsedData = parseCSV(csvData);

      // Basic validation of required headers
      const requiredHeaders = ['email', 'fullName', 'prn'];
      const firstRecord = parsedData[0];
      const missingHeaders = requiredHeaders.filter(h => !firstRecord || !firstRecord[h]);

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      await api.post('students/bulk-import', parsedData);
      setIsSheetOpen(false);
      fetchStudents();
      setCsvData('');
    } catch (error) {
      setImportError(error.message || 'Failed to import students. Check CSV format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">
              Student Directory
            </h1>
            <p className="font-mono text-on-surface-variant mt-1 text-xs font-label font-medium text-on-surface-variant">
              Manage student records and performance data
            </p>
          </div>

          <div className="flex gap-3">
            {selectedStudents.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                  className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
                  >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  DELETE SELECTED ({selectedStudents.length})
                  </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-surface-container-low border border-white/5 rounded-[2rem] shadow-2xl">
                  <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline font-black text-white italic uppercase tracking-tighter text-2xl">Bulk Delete Confirmation</AlertDialogTitle>
                  <AlertDialogDescription className="font-body text-on-surface-variant">
                    Are you sure you want to delete {selectedStudents.length} selected student records?
                    This action will permanently remove these candidates from the registry.
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 text-white border-white/5 rounded-xl uppercase tracking-widest text-[10px] font-black">CANCEL</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 text-white rounded-xl uppercase tracking-widest text-[10px] font-black hover:bg-red-600">
                    DELETE
                  </AlertDialogAction>
                  </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                  )}

                  <Button 
                    variant="outline"
                    onClick={handleBackfillSkills}
                    disabled={isBackfilling}
                    className="border-white/5 text-on-surface-variant font-black hover:bg-white/5 rounded-xl px-6 uppercase tracking-widest text-xs h-12"
                  >
                    <Icon name="RefreshCw" size={16} className={cn("mr-2", isBackfilling && "animate-spin")} />
                    {isBackfilling ? 'SYNCING...' : 'SYNC SKILLS'}
                  </Button>

                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                  <Button className="bg-secondary text-slate-950 font-black hover:bg-secondary-fixed rounded-xl px-6 uppercase tracking-widest text-xs">
                  <Icon name="Upload" size={16} className="mr-2" />
                  IMPORT STUDENTS (CSV)
                  </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                  <SheetTitle className="text-on-surface font-headline text-xl">
                  Import Student Data
                  </SheetTitle>
                  </SheetHeader>

                  <div className="mt-8 space-y-6">
                  <div className="p-12 border-2 border-dashed border-white/10 bg-white/[0.01] text-center rounded-[2rem] hover:border-primary/40 transition-all group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer space-y-4 block">
                    <Icon name="FileSpreadsheet" size={48} className="mx-auto text-on-surface-variant opacity-20 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                      {csvData ? 'File loaded successfully' : 'Select CSV file for upload'}
                    </p>
                  </label>
                  </div>

                  <div className="bg-white/[0.02] p-6 border border-white/5 rounded-2xl">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 italic">
                      Expected Format
                    </h3>
                    <code className="text-[10px] font-mono text-on-surface-variant/60 block leading-relaxed">
                      email, fullName, prn, branch, currentCgpa, passingYear, skills (optional)
                    </code>
                  </div>
                  {importError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{importError}</p>
                  </div>
                  )}

                  <div className="pt-4 space-y-4">
                  <Button
                    onClick={handleBulkImport}
                    disabled={!csvData || isImporting}
                    className="w-full bg-secondary text-slate-950 font-black h-14 rounded-xl shadow-xl shadow-secondary/10 uppercase tracking-widest text-xs"
                  >
                    {isImporting ? 'PROCESSING DATA...' : 'START IMPORT'}
                  </Button>
                  <p className="text-[8px] font-black text-on-surface-variant/40 text-center leading-relaxed uppercase tracking-widest">
                    * Default passwords will be generated automatically. Students will be required to update credentials on first login.
                  </p>
                  </div>
                  </div>              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-surface-container-low/50 border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <Checkbox
                      checked={students.length > 0 && selectedStudents.length === students.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">Student Name</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">PRN</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">Branch / Dept</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">CGPA</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-on-surface-variant animate-pulse font-headline text-xs uppercase tracking-[0.3em] italic">Scanning institutional records...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-on-surface-variant font-headline text-xs uppercase tracking-[0.3em] italic border border-dashed border-white/5 rounded-[2rem]">No student records found</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className={cn(
                      "hover:bg-white/[0.02] transition-all duration-300 group",
                      selectedStudents.includes(student.id) && "bg-primary/5"
                    )}>
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-headline font-black text-primary italic group-hover:border-primary/40 transition-colors">
                            {student.fullName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-headline font-black text-white italic tracking-tight">{student.fullName || 'Unknown Candidate'}</div>
                            <div className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1 lowercase">{student.email || 'no-email@system.local'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-headline text-[10px] font-black uppercase tracking-widest">{student.prn}</td>
                      <td className="px-6 py-4 text-on-surface-variant font-headline text-[10px] font-black uppercase tracking-widest">{student.branch}</td>
                      <td className="px-6 py-4 font-headline font-black text-sky-400 italic text-sm">{student.currentCgpa || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-lg hover:bg-white/5"
                            title="Edit Student"
                          >
                            <Icon name="Pencil" size={16} />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 text-on-surface-variant hover:text-red-500 transition-colors rounded-lg hover:bg-white/5"
                                title="Delete Student"
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-surface-container-low border border-white/5 rounded-[2rem] shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-headline font-black text-white italic uppercase tracking-tighter text-2xl">Delete Student Record?</AlertDialogTitle>
                                <AlertDialogDescription className="font-body text-on-surface-variant">
                                  Are you sure you want to delete the record for {student.fullName}?
                                  This action will permanently remove all session history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 text-white border-white/5 rounded-xl uppercase tracking-widest text-[10px] font-black">CANCEL</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-red-500 text-white rounded-xl uppercase tracking-widest text-[10px] font-black hover:bg-red-600">
                                  DELETE
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Student Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-on-surface font-headline text-xl">
              Edit Student Details
            </SheetTitle>
          </SheetHeader>

          {editingStudent && (
            <form onSubmit={handleUpdateStudent} className="mt-8 space-y-6">
              <div className="p-4 bg-surface-container-low border border-outline-variant/30 space-y-1 mb-6">
                <p className="text-[10px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">Account Identity</p>
                <p className="text-sm font-mono font-bold text-on-surface">{editingStudent.fullName}</p>
                <p className="text-xs font-mono text-on-surface-variant">{editingStudent.email}</p>
              </div>

              <Input
                label="PRN (Registration Number)"
                value={editingStudent.prn || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, prn: e.target.value })}
                required
              />

              <Input
                label="Branch / Department"
                value={editingStudent.branch || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, branch: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current Semester"
                  value={editingStudent.currentSemester || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, currentSemester: e.target.value })}
                />
                <Input
                  label="Passing Year"
                  type="number"
                  value={editingStudent.passingYear || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, passingYear: e.target.value })}
                />
              </div>

              <Input
                label="Current CGPA"
                type="number"
                step="0.01"
                value={editingStudent.currentCgpa || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, currentCgpa: e.target.value })}
              />

              <div className="space-y-2">
                <label className="font-mono text-[10px] text-on-surface-variant block font-label font-medium text-on-surface-variant">
                  Skills (Comma Separated)
                </label>
                <textarea
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-mono text-xs text-on-surface focus:ring-1 focus:ring-secondary outline-none min-h-[80px]"
                  value={editingStudent.skills || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, skills: e.target.value })}
                />
              </div>

              <Input
                label="Career Goal"
                value={editingStudent.careerGoal || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, careerGoal: e.target.value })}
              />

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditSheetOpen(false)}
                  className="flex-1 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-secondary text-slate-950 font-black h-12 rounded-xl uppercase tracking-widest text-[10px]"
                >
                  {isUpdating ? 'UPDATING...' : 'SAVE CHANGES'}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default StudentDirectoryPage;

