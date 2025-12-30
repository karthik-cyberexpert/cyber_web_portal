import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, Users, MoreHorizontal, X, Check } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [tempSelectedFaculties, setTempSelectedFaculties] = useState<number[]>([]);
  
  // Form States
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '3',
    semester: '1'
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
    setFormData({ code: '', name: '', credits: '3', semester: '1' });
    setIsAddOpen(true);
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits.toString(),
      semester: subject.semester.toString()
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
                type: 'theory' // Default for now
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
         const res = await fetch(`http://localhost:3007/api/academic/subjects/${selectedSubject.id}`, {
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
        <Button onClick={handleAddClick} className="gap-2 bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
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
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading subjects...
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject, index) => (
                <TableRow key={subject.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
    </div>
  );
}
