import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Users, Plus, Edit2, Trash2, 
  Search, BookOpen, Settings2, MoreHorizontal, ArrowUpCircle, Calendar
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';
import { calculateCurrentAcademicState } from '@/lib/academic-calendar';
import SemesterDatePopup from '@/components/admin/SemesterDatePopup';

interface Batch {
    id: number;
    name: string; // e.g., "2021-2025"
    start_year: number;
    end_year: number;
    current_semester: number;
    semester_start_date: string | null;
    semester_end_date: string | null;
    department_name: string;
    section_count: number;
}

interface Section {
    id: number;
    name: string; // "A", "B"
    batch_id: number;
    capacity: number;
}

export default function BatchesClasses() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]); // Current loaded sections
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [startYear, setStartYear] = useState<string>(new Date().getFullYear().toString());
  const [numberOfSections, setNumberOfSections] = useState<string>('1');
  
  const [isManageSectionsOpen, setIsManageSectionsOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionName, setEditSectionName] = useState('');

  // Batch Edit State
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editBatchSemester, setEditBatchSemester] = useState<number>(1);
  const [editBatchStartDate, setEditBatchStartDate] = useState('');
  const [editBatchEndDate, setEditBatchEndDate] = useState('');

  // Semester Date Popup State
  const [semesterEditBatch, setSemesterEditBatch] = useState<Batch | null>(null);

  const fetchBatches = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setBatches(data);
          }
      } catch (error) {
          console.error("Failed to fetch batches", error);
      }
  };

  const fetchSections = async (batchId: number) => {
      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setSections(data);
          }
      } catch (error) {
          console.error("Failed to fetch sections", error);
      }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
        fetchSections(selectedBatchId);
    } else {
        setSections([]);
    }
  }, [selectedBatchId]);

  // Auto-prompt for new batch creation on June 1st
  useEffect(() => {
     if (batches.length > 0) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const isPastJune1 = today.getMonth() >= 5; // Month is 0-indexed (0=Jan, 5=June)
        
        // If we are past June 1st, we expect a batch starting in this current year
        if (isPastJune1) {
            const expectedBatchName = `${currentYear}-${currentYear + 4}`;
            const exists = batches.some(b => b.name === expectedBatchName);
            
            if (!exists) {
                // Pre-fill and open dialog
                setStartYear(currentYear.toString());
                setIsAddBatchOpen(true);
                toast.info(`Academic Year ${currentYear} has started! Please initialize the new batch.`);
            }
        }
     }
  }, [batches]);

  const handleAddBatch = async () => {
    const year = parseInt(startYear);
    const secs = parseInt(numberOfSections);

    if (isNaN(year) || isNaN(secs) || secs < 1) {
        toast.error("Invalid input");
        return;
    }

    // Default 1 (CSS) for now as we don't have department selection in UI yet
    // In real app, Admin might select department or it's inferred from Admin's department
    const department_id = 1; 
    const end_year = year + 4;
    const name = `${year}-${end_year}`;

    try {
        const res = await fetch(`${API_BASE_URL}/academic/batches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                department_id,
                name,
                start_year: year,
                end_year
            })
        });

        if (res.ok) {
            const data = await res.json();
            const batchId = data.id;

            // Auto-create sections
            for (let i = 0; i < secs; i++) {
                const sectionName = String.fromCharCode(65 + i);
                await fetch(`${API_BASE_URL}/academic/sections`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        batch_id: batchId,
                        name: sectionName,
                        capacity: 60
                    })
                });
            }

            toast.success("Batch created successfully");
            setIsAddBatchOpen(false);
            fetchBatches();
        } else {
            const err = await res.json();
            toast.error(err.message || "Failed to create batch");
        }
    } catch (error) {
        toast.error("Network error");
    }
  };

  const handleDeleteBatch = async (id: number) => {
      if(!confirm("Are you sure? This will delete all sections and data associated with this batch.")) return;

      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              toast.success("Batch deleted");
              fetchBatches();
          }
      } catch (error) {
          toast.error("Network error");
      }
  };

  const openBatchEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setEditBatchSemester(batch.current_semester);
    setEditBatchStartDate(batch.semester_start_date ? batch.semester_start_date.split('T')[0] : '');
    setEditBatchEndDate(batch.semester_end_date ? batch.semester_end_date.split('T')[0] : '');
    setIsEditBatchOpen(true);
  };

  const handleUpdateBatch = async () => {
      if (!editingBatch) return;
      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches/${editingBatch.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  currentSemester: editBatchSemester % 2 === 0 ? 'Even' : 'Odd', 
                  semesterStartDate: editBatchStartDate,
                  semesterEndDate: editBatchEndDate
              })
          });
          if (res.ok) {
              toast.success("Batch updated");
              setIsEditBatchOpen(false);
              fetchBatches();
          }
      } catch (error) {
           toast.error("Network error");
      }
  };

  const handleAddSection = async () => {
    if (!newSectionName || !selectedBatchId) return;
    try {
        const res = await fetch(`${API_BASE_URL}/academic/sections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                batch_id: selectedBatchId,
                name: newSectionName,
                capacity: 60
            })
        });
        if (res.ok) {
            toast.success("Section created");
            setIsAddSectionOpen(false);
            setNewSectionName('');
            fetchSections(selectedBatchId);
            fetchBatches(); // Update counts
        } else {
             const err = await res.json();
             toast.error(err.message || "Failed");
        }
    } catch (error) {
        toast.error("Network error");
    }
  };

  const handleEditSectionAction = async () => {
      if (!editingSection) return;
      try {
          const res = await fetch(`${API_BASE_URL}/academic/sections/${editingSection.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ name: editSectionName })
          });
          if (res.ok) {
              toast.success("Section updated");
              setIsEditSectionOpen(false);
              if (selectedBatchId) fetchSections(selectedBatchId);
          }
      } catch (error) {
          toast.error("Network error");
      }
  };

  const handleDeleteSection = async (id: number) => {
      if (!confirm("Delete section?")) return;
      try {
           const res = await fetch(`${API_BASE_URL}/academic/sections/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
           });
           if (res.ok) {
               toast.success("Section deleted");
               if (selectedBatchId) fetchSections(selectedBatchId);
               fetchBatches();
           }
      } catch (error) {
          toast.error("Network error");
      }
  };

  // Promote logic: just increment semester? 
  // Ideally backend action, but we can fake it via update if backend allowed number.
  // Since backend is limited (1/2), promote is broken.
  // I will disable Promote button for now or fix backend.

  const filteredBatches = batches.filter(batch => 
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Semester Date Edit Popup */}
      {semesterEditBatch && (
        <SemesterDatePopup 
          batch={{
            id: semesterEditBatch.id,
            name: semesterEditBatch.name,
            current_semester: semesterEditBatch.current_semester,
            department_name: semesterEditBatch.department_name,
            semester_start_date: semesterEditBatch.semester_start_date,
            semester_end_date: semesterEditBatch.semester_end_date
          }}
          onSave={() => {
            setSemesterEditBatch(null);
            fetchBatches();
          }}
          onClose={() => setSemesterEditBatch(null)}
          readOnly={true}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            Academic Management
          </h1>
          <p className="text-muted-foreground mt-1 italic">Configure batches, semesters, and sections</p>
        </div>
        <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 italic">
              <Plus className="w-4 h-4" />
              New Batch (4-Year Program)
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="italic">Initialize New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="italic">Batch Start Year</Label>
                <Input 
                  type="number" 
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="italic"
                />
              </div>
              <div className="space-y-2">
                <Label className="italic">Number of Sections (Sem 1)</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={numberOfSections}
                  onChange={(e) => setNumberOfSections(e.target.value)}
                  className="italic"
                />
              </div>
              <Button onClick={handleAddBatch} className="w-full italic font-bold">Create Batch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search academic batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 italic rounded-xl border-white/10 bg-white/5"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-[180px] italic">Batch</TableHead>
              <TableHead className="italic">Current Status</TableHead>
              <TableHead className="italic">Sections</TableHead>
              <TableHead className="italic">Current Semester</TableHead>
              <TableHead className="italic">Academic Cycle</TableHead>
              <TableHead className="text-right italic">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>



            {filteredBatches.map((batch) => {
                const academicState = calculateCurrentAcademicState(batch.name);
                const yearNum = academicState.year;
                const yearLabel = yearNum > 4 ? "Graduated" : `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'} Year`;
                
                return (
                  <TableRow key={batch.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold italic text-lg">{batch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 italic">
                            {yearLabel}
                         </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{batch.section_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="italic">
                        Sem {academicState.semester}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       {batch.semester_start_date ? (
                         <div className="text-xs text-muted-foreground italic">
                            {new Date(batch.semester_start_date).toLocaleDateString()} — {batch.semester_end_date ? new Date(batch.semester_end_date).toLocaleDateString() : '...'}
                         </div>
                       ) : <span className="text-xs text-muted-foreground italic">Not Set</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="italic">
                           <DropdownMenuItem onClick={() => openBatchEdit(batch)}>
                             <Settings2 className="w-4 h-4 mr-2" />
                             Settings
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => setSemesterEditBatch(batch)}>
                             <Calendar className="w-4 h-4 mr-2" />
                             Edit Semester Dates
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => {
                             setSelectedBatchId(batch.id);
                             setIsManageSectionsOpen(true);
                           }}>
                             <BookOpen className="w-4 h-4 mr-2" />
                             Manage Sections
                           </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleDeleteBatch(batch.id)} className="text-destructive">
                             <Trash2 className="w-4 h-4 mr-2" />
                             Delete Batch
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Manage Sections Sheet */}
      <Sheet open={isManageSectionsOpen} onOpenChange={setIsManageSectionsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/10 glass-card">
           <SheetHeader>
             <SheetTitle className="italic text-2xl">Manage Sections</SheetTitle>
             <SheetDescription className="italic">
               Sections for {batches.find(b => b.id === selectedBatchId)?.name}
             </SheetDescription>
           </SheetHeader>
           
           <div className="mt-6 space-y-4">
              <Button 
                onClick={() => setIsAddSectionOpen(true)}
                className="w-full gap-2 italic bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              >
                  <Plus className="w-4 h-4" /> Add New Section
              </Button>

              <div className="space-y-3">
                 {sections.map(section => (
                   <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group">
                     <span className="font-bold italic text-lg">{section.name}</span>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                            setEditingSection(section);
                            setEditSectionName(section.name);
                            setIsEditSectionOpen(true);
                        }}>
                           <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteSection(section.id)}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                   </div>
                 ))}
                 {sections.length === 0 && <p className="text-center text-muted-foreground italic">No sections found</p>}
              </div>
           </div>
        </SheetContent>
      </Sheet>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
         <DialogContent>
             <DialogHeader><DialogTitle>Add Section</DialogTitle></DialogHeader>
             <div className="space-y-4 py-4">
                 <Label>Section Name</Label>
                 <Input value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="A" maxLength={2} />
                 <Button onClick={handleAddSection} className="w-full">Create</Button>
             </div>
         </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
         <DialogContent>
             <DialogHeader><DialogTitle>Edit Section</DialogTitle></DialogHeader>
             <div className="space-y-4 py-4">
                 <Label>Section Name</Label>
                 <Input value={editSectionName} onChange={e => setEditSectionName(e.target.value)} maxLength={2} />
                 <Button onClick={handleEditSectionAction} className="w-full">Update</Button>
             </div>
         </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditBatchOpen} onOpenChange={setIsEditBatchOpen}>
         <DialogContent>
             <DialogHeader><DialogTitle>Batch Settings</DialogTitle></DialogHeader>
             <div className="space-y-4 py-4">
                 <Label>Semester Dates</Label>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                         <Label className="text-xs">Start</Label>
                         <Input type="date" value={editBatchStartDate} onChange={e => setEditBatchStartDate(e.target.value)} />
                     </div>
                     <div className="space-y-1">
                         <Label className="text-xs">End</Label>
                         <Input type="date" value={editBatchEndDate} onChange={e => setEditBatchEndDate(e.target.value)} />
                     </div>
                 </div>
                 {/* Note: Semester iteration is not fully implemented in UI due to backend logic limitation found in strict 'Even'/'Odd' map.
                     Future task: Enable semester number editing. 
                 */}
                 <Button onClick={handleUpdateBatch} className="w-full">Save Changes</Button>
             </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
