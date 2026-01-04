import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { BookOpen, Plus, Search, Edit2, Trash2, Users, MoreHorizontal, X, Check, Upload, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  semester: number;
  type: 'theory' | 'lab' | 'integrated';
  faculties: { id: number; name: string; avatar?: string }[];
}

interface Faculty {
  id: number;
  name: string;
  department: string;
}

export default function ManageSubjects() {
  const token = localStorage.getItem('token');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allFaculties, setAllFaculties] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [tempSelectedFaculties, setTempSelectedFaculties] = useState<number[]>([]);
  
  // Form States
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '3',
    semester: '1',
    type: 'theory'
  });

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Subjects
      const subjectsRes = await fetch(`${API_BASE_URL}/academic/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data);
      }

      // Fetch All Faculties
      const facultyRes = await fetch(`${API_BASE_URL}/admin/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (facultyRes.ok) {
        const data = await facultyRes.json();
        setAllFaculties(data);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddClick = () => {
    setFormData({ code: '', name: '', credits: '3', semester: '1', type: 'theory' });
    setIsAddOpen(true);
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits.toString(),
      semester: subject.semester.toString(),
      type: subject.type || 'theory'
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const handleFacultyClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setTempSelectedFaculties(subject.faculties.map(f => f.id));
    setIsFacultyOpen(true);
  };

  const handleClose = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setIsFacultyOpen(false);
    setSelectedSubject(null);
    setTempSelectedFaculties([]);
    setIsSaving(false);
  };

  const handleSaveSubject = async () => {
    setIsSaving(true);
    try {
        const url = isEditOpen && selectedSubject 
            ? `${API_BASE_URL}/academic/subjects/${selectedSubject.id}`
            : `${API_BASE_URL}/academic/subjects`;
            
        const method = isEditOpen ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                code: formData.code,
                name: formData.name,
                credits: parseInt(formData.credits),
                semester: parseInt(formData.semester),
                type: formData.type
            })
        });

        if (res.ok) {
            toast.success(isEditOpen ? "Subject updated" : "Subject created");
            fetchData();
            handleClose();
        } else {
            const err = await res.json();
            toast.error(err.message || "Operation failed");
        }
    } catch (error) {
        toast.error("Network error");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
     if (!selectedSubject) return;
     setIsSaving(true);
     try {
         const res = await fetch(`${API_BASE_URL}/academic/subjects/${selectedSubject.id}`, {
             method: 'DELETE',
             headers: { Authorization: `Bearer ${token}` }
         });
         
         if (res.ok) {
             toast.success("Subject deleted");
             fetchData();
             handleClose();
         } else {
             toast.error("Failed to delete subject");
         }
     } catch (error) {
         toast.error("Network error");
     } finally {
         setIsSaving(false);
     }
  };
  
  const toggleFacultyInTemp = (facultyId: number) => {
      setTempSelectedFaculties(prev => 
        prev.includes(facultyId) 
            ? prev.filter(id => id !== facultyId)
            : [...prev, facultyId]
      );
  };

  const handleSaveFaculties = async () => {
      if (!selectedSubject) return;
      setIsSaving(true);
      try {
          const res = await fetch(`${API_BASE_URL}/academic/subjects/${selectedSubject.id}/faculties`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ facultyIds: tempSelectedFaculties })
          });

          if (res.ok) {
              toast.success("Faculties assigned successfully");
              fetchData();
              handleClose();
          } else {
              toast.error("Failed to update faculties");
          }
      } catch (error) {
           toast.error("Network error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Subject Code': 'CS101',
        'Subject Name': 'Introduction to Computer Science',
        'Credits': 4,
        'Semester': 1,
        'Type': 'theory'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subject_upload_template.xlsx");
    toast.info("Template downloaded");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let addedCount = 0;
        let errorCount = 0;

        for (const row of data as any[]) {
          // Validation
          if (!row['Subject Code'] || !row['Subject Name']) {
            errorCount++;
            continue;
          }

          try {
            const res = await fetch(`${API_BASE_URL}/academic/subjects`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                code: row['Subject Code'].toString(),
                name: row['Subject Name'],
                credits: parseInt(row['Credits']) || 3,
                semester: parseInt(row['Semester']) || 1,
                type: row['Type']?.toLowerCase() || 'theory'
              })
            });

            if (res.ok) addedCount++;
            else errorCount++;
          } catch (e) {
            errorCount++;
          }
        }

        toast.success(`Upload complete. Added: ${addedCount}, Failed: ${errorCount}`);
        fetchData();
        setIsBulkUploadModalOpen(false);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Failed to parse file");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Manage Subjects
          </h1>
          <p className="text-muted-foreground mt-1">Add and manage course curriculum</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="gap-2 border-primary/20 hover:border-primary/50"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleAddClick} className="gap-2 bg-gradient-to-r from-primary to-accent">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">S.No</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject Code</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Faculties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading subjects...
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject, index) => (
                <TableRow key={subject.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <Badge variant={
                      subject.type === 'lab' ? 'secondary' : 
                      subject.type === 'integrated' ? 'default' : 'outline'
                    } className="text-[10px] uppercase tracking-wider">
                      {subject.type || 'theory'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {subject.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    {subject.faculties.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                         <div className="flex -space-x-2">
                           {subject.faculties.slice(0, 3).map((faculty) => (
                             <div key={faculty.id} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary" title={faculty.name}>
                                {faculty.name.substring(0, 1)}
                             </div>
                           ))}
                           {subject.faculties.length > 3 && (
                             <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                               +{subject.faculties.length - 3}
                             </div>
                           )}
                         </div>
                         <span className="text-xs text-muted-foreground hidden sm:inline-block">
                           {subject.faculties.map(f => f.name).join(', ')}
                         </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">No faculties assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleFacultyClick(subject)}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Faculties
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(subject)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Subject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(subject)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Subject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                   <div className="flex flex-col items-center justify-center gap-2">
                     <BookOpen className="w-8 h-8 opacity-20" />
                     <p>No subjects found. Add a new subject to get started.</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update the details below.' : 'Enter the details for the new subject.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Subject Code
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
                placeholder="e.g. CS101"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="integrated">Integrated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="e.g. Data Structures"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">
                Credits
              </Label>
              <Select value={formData.credits} onValueChange={(val) => setFormData({ ...formData, credits: val })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select credits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="semester" className="text-right">
                Semester
              </Label>
              <Select value={formData.semester} onValueChange={(val) => setFormData({ ...formData, semester: val })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>{sem}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveSubject} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the subject 
              <span className="font-bold text-foreground mx-1">{selectedSubject?.name}</span>
               and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSaving}>
                {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Faculties Dialog */}
      <Dialog open={isFacultyOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Faculties</DialogTitle>
            <DialogDescription>
              Assign faculties to <span className="font-semibold">{selectedSubject?.name}</span> ({selectedSubject?.code})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Available Faculties</h4>
            <ScrollArea className="h-60 rounded-md border p-4">
              <div className="space-y-4">
                {allFaculties.length > 0 ? ( allFaculties.map((faculty) => {
                  const isAssigned = tempSelectedFaculties.includes(faculty.id);
                  return (
                    <div key={faculty.id} className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                           {faculty.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{faculty.name}</p>
                          <p className="text-xs text-muted-foreground">{faculty.department || 'N/A'}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isAssigned ? "secondary" : "outline"}
                        className={isAssigned ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                        onClick={() => toggleFacultyInTemp(faculty.id)}
                      >
                         {isAssigned ? <Check className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                         {isAssigned ? "Assigned" : "Assign"}
                      </Button>
                    </div>
                  );
                })) : (
                  <p className="text-sm text-muted-foreground text-center">No faculties found.</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cancel</Button>
             <Button onClick={handleSaveFaculties} disabled={isSaving}>
                 {isSaving ? 'Saving...' : 'Save Changes'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload Subjects</DialogTitle>
            <DialogDescription>
              Upload multiple subjects using an Excel file. Download the template to ensure correct formatting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/25 bg-muted/50 gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">XLSX or CSV files only</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                variant="secondary"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Select File'
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Instructions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Use the provided template for best results.</li>
                <li><strong>Subject Code</strong> and <strong>Subject Name</strong> are mandatory.</li>
                <li>Credits should be a number (default: 3).</li>
                <li>Semester should be between 1-8 (default: 1).</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2" 
                onClick={handleDownloadTemplate}
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBulkUploadModalOpen(false)} disabled={isUploading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
