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
      toast.success('STUDENT_RECORD_DELETED');
      fetchStudents();
    } catch (error) {
      toast.error('DELETE_FAILED: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.delete('/students/bulk-delete', { data: selectedStudents });
      toast.success(`${selectedStudents.length}_RECORDS_PURGED`);
      fetchStudents();
    } catch (error) {
      toast.error('BULK_DELETE_FAILED: ' + (error.response?.data?.message || error.message));
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
      toast.success('STUDENT_DATA_SYNCED');
      setIsEditSheetOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error('UPDATE_FAILED: ' + (error.response?.data?.message || error.message));
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
              Student_Registry
            </h1>
            <p className="font-mono text-on-surface-variant mt-1 text-xs font-label font-medium text-on-surface-variant">
              Active candidates within institutional domain
            </p>
          </div>

          <div className="flex gap-3">
            {selectedStudents.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-on-surface"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    DELETE_SELECTED ({selectedStudents.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bulk Delete Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedStudents.length} selected student records?
                      This action will permanently remove these candidates from the institutional registry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>CANCEL</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      PURGE_RECORDS
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                  <Icon name="Upload" size={16} className="mr-2" />
                  BULK_IMPORT_CSV
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-surface-container-low border-l border-outline-variant/30 text-on-surface w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-on-surface font-headline text-xl">
                    Initialize_Bulk_Import
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                  <div className="p-4 border border-dashed border-outline-variant/30 bg-surface-container-low/50 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer space-y-2 block">
                      <Icon name="FileSpreadsheet" size={32} className="mx-auto text-on-surface-variant" />
                      <p className="text-xs font-mono text-on-surface-variant">
                        {csvData ? 'FILE_LOADED_READY_TO_PROCESS' : 'SELECT_CSV_FILE_FOR_UPLOAD'}
                      </p>
                    </label>
                  </div>

                  <div className="bg-surface-container-low p-4 border border-outline-variant/30">
                    <h3 className="text-[10px] font-mono font-bold text-on-surface-variant mb-3 font-label font-medium text-on-surface-variant">
                      Expected_CSV_Format
                    </h3>
                    <code className="text-[10px] font-mono text-emerald-500 block">
                      email, fullName, prn, branch, currentCgpa, passingYear
                    </code>
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20">
                      <p className="text-[10px] font-mono text-red-500 font-label font-medium text-on-surface-variant">{importError}</p>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={handleBulkImport}
                      disabled={!csvData || isImporting}
                      className="w-full bg-emerald-500 text-slate-950 font-bold"
                    >
                      {isImporting ? 'PROCESSING_DATA...' : 'EXECUTE_IMPORT'}
                    </Button>
                    <p className="text-[8px] font-mono text-on-surface-variant text-center leading-relaxed font-label font-medium text-on-surface-variant">
                      * Default passwords will be generated as ST + INSTITUTION_CODE + PRN (e.g., STMIT20230001).
                      Students will be required to update credentials on first node access.
                    </p>
                  </div>
                </div>
              </SheetContent>
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
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">Candidate_Identity</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">PRN</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">Academic_Unit</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter">CGPA</th>
                  <th className="px-6 py-4 text-on-surface-variant font-bold uppercase tracking-tighter text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant animate-pulse uppercase tracking-widest">Scanning_Records...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant uppercase tracking-widest">Empty_Registry_Zero_Records</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className={cn(
                      "hover:bg-surface-container-low/30 transition-colors group",
                      selectedStudents.includes(student.id) && "bg-emerald-500/5"
                    )}>
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-[10px] text-on-surface-variant group-hover:border-emerald-500/50 transition-colors">
                            {student.fullName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{student.fullName || 'UNKNOWN_CANDIDATE'}</div>
                            <div className="text-[10px] text-on-surface-variant lowercase">{student.email || 'no-email@system.local'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-mono">{student.prn}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{student.branch}</td>
                      <td className="px-6 py-4 font-bold text-sky-400">{student.currentCgpa || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-1.5 text-on-surface-variant hover:text-emerald-500 transition-colors"
                            title="Edit Student"
                          >
                            <Icon name="Pencil" size={14} />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors"
                                title="Delete Student"
                              >
                                <Icon name="Trash2" size={14} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student Record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the record for {student.fullName}?
                                  This operation is irreversible and will remove all session history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ABORT</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)}>
                                  CONFIRM_DELETE
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
              Modify_Student_Node
            </SheetTitle>
          </SheetHeader>

          {editingStudent && (
            <form onSubmit={handleUpdateStudent} className="mt-8 space-y-6">
              <div className="p-4 bg-surface-container-low border border-outline-variant/30 space-y-1 mb-6">
                <p className="text-[10px] font-mono text-on-surface-variant font-label font-medium text-on-surface-variant">Fixed_Identity</p>
                <p className="text-sm font-mono font-bold text-on-surface">{editingStudent.fullName}</p>
                <p className="text-xs font-mono text-on-surface-variant">{editingStudent.email}</p>
              </div>

              <Input
                label="Permanent Registration Number (PRN)"
                value={editingStudent.prn || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, prn: e.target.value })}
                required
              />

              <Input
                label="Academic Unit / Branch"
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
                  Capabilities (Comma Separated)
                </label>
                <textarea
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 font-mono text-xs text-on-surface focus:ring-1 focus:ring-emerald-500 outline-none min-h-[80px]"
                  value={editingStudent.skills || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, skills: e.target.value })}
                />
              </div>

              <Input
                label="Career Vector / Goal"
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
                  className="flex-1 bg-emerald-500 text-slate-950 font-bold"
                >
                  {isUpdating ? 'UPDATING...' : 'SAVE_CHANGES'}
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

