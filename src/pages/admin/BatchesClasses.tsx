import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Users, Calendar, Plus, Edit2, Trash2, 
  ChevronDown, ChevronRight, Search, BookOpen,
  Clock, ShieldAlert, ArrowUpCircle, History, Settings2,
  MoreHorizontal
} from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { 
  getData, saveData, addItem, updateItem, deleteItem,
  BATCHES_KEY, CLASSES_KEY, SECTIONS_KEY,
  BatchData, ClassData, SectionData, Student
} from '@/lib/data-store';
import { toast } from 'sonner';

export default function BatchesClasses() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBatches, setExpandedBatches] = useState<string[]>([]);
  
  // Dialog States
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [startYear, setStartYear] = useState<string>(new Date().getFullYear().toString());
  const [maxSections, setMaxSections] = useState<string>('1');
  
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');

  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [editSectionName, setEditSectionName] = useState('');

  // Batch Edit State
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchData | null>(null);
  const [editBatchSemester, setEditBatchSemester] = useState<"Odd"| "Even">('Odd');
  const [editBatchStartDate, setEditBatchStartDate] = useState('');
  const [editBatchEndDate, setEditBatchEndDate] = useState('');

  // Sections Management Sheet
  const [isManageSectionsOpen, setIsManageSectionsOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    // Ensure keys exist
    if (!localStorage.getItem(BATCHES_KEY)) saveData(BATCHES_KEY, []);
    if (!localStorage.getItem(CLASSES_KEY)) saveData(CLASSES_KEY, []);
    if (!localStorage.getItem(SECTIONS_KEY)) saveData(SECTIONS_KEY, []);

    setBatches(getData<BatchData>(BATCHES_KEY));
    setClasses(getData<ClassData>(CLASSES_KEY));
    setSections(getData<SectionData>(SECTIONS_KEY));
  };

  const isAdmin = () => user?.role === 'admin';

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold italic">Access Denied</h2>
        <p className="text-muted-foreground italic">Only administrators can manage batches, classes, and sections.</p>
      </div>
    );
  }

  const handleAddBatch = () => {
    const year = parseInt(startYear);
    const sectionsCount = parseInt(maxSections);

    if (isNaN(year)) {
      toast.error('Please enter a valid start year');
      return;
    }

    if (isNaN(sectionsCount) || sectionsCount < 1) {
      toast.error('Please enter a valid number of sections (at least 1)');
      return;
    }

    const existing = batches.find(b => b.startYear === year);
    if (existing) {
      toast.error('A batch with this start year already exists');
      return;
    }

    const endYear = year + 4;
    const label = `${year}–${endYear}`;
    
    // 1. Create Batch
    const batch = addItem<BatchData>(BATCHES_KEY, {
      startYear: year,
      endYear,
      label
    });

    // 2. Determine Correct Active Year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    let theoreticalYear = currentYear - year;
    if (currentMonth >= 5) { // June or later
      theoreticalYear += 1;
    }
    if (theoreticalYear <= 0) theoreticalYear = 1;
    if (theoreticalYear > 4) theoreticalYear = 4; // Cap at 4 for initial creation if user creates very old batch, or let logic handle graduation later. 
    // Actually if it creates >4, it might be weird. Let's assume standard creation. 

    const labels = ["", "1st Year", "2nd Year", "3rd Year", "4th Year"];
    const activeYearLabel = labels[theoreticalYear] || `${theoreticalYear}th Year`;

    // 2. Create Initial Active Class
    const newClass = addItem<ClassData>(CLASSES_KEY, {
      batchId: batch.id,
      yearNumber: theoreticalYear,
      yearLabel: activeYearLabel,
      isActive: true
    });

    // 3. Auto-generate sections
    for (let i = 0; i < sectionsCount; i++) {
        const sectionName = String.fromCharCode(65 + i); // 65 is 'A'
        addItem<SectionData>(SECTIONS_KEY, {
            classId: newClass.id,
            sectionName: sectionName
        });
    }

    toast.success(`Batch ${label} created at ${activeYearLabel} with ${sectionsCount} sections`);
    setIsAddBatchOpen(false);
    refreshData();
  };

  const promoteClass = (batchId: string) => {
    const batchClasses = classes.filter(c => c.batchId === batchId);
    const activeClass = batchClasses.find(c => c.isActive);
    
    if (!activeClass) {
      toast.error('No active class found for this batch');
      return;
    }

    if (activeClass.yearNumber >= 4) {
      toast.error('Batch has already reached 4th Year. Process as Graduation instead.');
      return;
    }

    const nextYear = activeClass.yearNumber + 1;
    const labels = ["", "1st Year", "2nd Year", "3rd Year", "4th Year"];
    
    // 1. Deactivate current
    updateItem<ClassData>(CLASSES_KEY, activeClass.id, { isActive: false });
    
    // 2. Create next active class
    addItem<ClassData>(CLASSES_KEY, {
      batchId,
      yearNumber: nextYear,
      yearLabel: labels[nextYear],
      isActive: true
    });

    toast.success(`Batch promoted to ${labels[nextYear]}`);
    refreshData();
  };

  const handleDeleteBatch = (batchId: string) => {
    const relatedClasses = classes.filter(c => c.batchId === batchId);
    const relatedSections = sections.filter(s => relatedClasses.some(c => c.id === s.classId));
    
    // Cascading Delete
    // 1. Delete all related sections
    relatedSections.forEach(s => deleteItem(SECTIONS_KEY, s.id));

    // 2. Delete all related classes
    relatedClasses.forEach(c => deleteItem(CLASSES_KEY, c.id));

    // 3. Delete the batch
    deleteItem(BATCHES_KEY, batchId);
    
    toast.success('Batch and all associated data deleted');
    refreshData();
  };

  const handleDeleteClass = (classId: string) => {
    const hasSections = sections.some(s => s.classId === classId);
    if (hasSections) {
      toast.error('Cannot delete class: It has existing sections');
      return;
    }

    deleteItem(CLASSES_KEY, classId);
    toast.success('Class deleted');
    refreshData();
  };

  const toggleClassActiveStatus = (id: string, newStatus: boolean) => {
    const hasSections = sections.some(s => s.classId === id);
    if (hasSections) {
      toast.error('Cannot delete class: It has existing sections');
      return;
    }

    updateItem<ClassData>(CLASSES_KEY, id, { isActive: newStatus });
    toast.success(`Active year ${newStatus ? 'enabled' : 'disabled'}`);
    refreshData();
  };

  const updateSection = (id: string, newName: string) => {
    if (!newName.trim()) return;
    updateItem<SectionData>(SECTIONS_KEY, id, { sectionName: newName });
    toast.success('Section updated');
    refreshData();
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    
    const cls = classes.find(c => c.id === targetClassId);
    if (!cls?.isActive) {
      toast.error('Can only add sections to active classes');
      return;
    }

    const existing = sections.some(s => s.classId === targetClassId && s.sectionName.toLowerCase() === newSectionName.trim().toLowerCase());
    if (existing) {
      toast.error('Section name already exists in this class');
      return;
    }

    addItem<SectionData>(SECTIONS_KEY, {
      classId: targetClassId,
      sectionName: newSectionName.trim().toUpperCase()
    });

    toast.success('Section created');
    setIsAddSectionOpen(false);
    setNewSectionName('');
    refreshData();
  };

  const handleEditSection = () => {
    if (!editingSection) return;
    const existing = sections.some(s => 
      s.classId === editingSection.classId && 
      s.id !== editingSection.id && 
      s.sectionName.toLowerCase() === editSectionName.trim().toLowerCase()
    );

    if (existing) {
      toast.error('Section name already exists in this class');
      return;
    }

    updateItem<SectionData>(SECTIONS_KEY, editingSection.id, { sectionName: editSectionName.trim().toUpperCase() });
    toast.success('Section updated');
    setIsEditSectionOpen(false);
    refreshData();
  };

  const handleDeleteSection = (sectionId: string) => {
    // Check for students (placeholder logic as requested)
    const students = getData<Student>('college_portal_students');
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const targetClass = classes.find(c => c.id === section.classId);
    const targetBatch = batches.find(b => b.id === targetClass?.batchId);

    const hasStudents = students.some(s => s.section === section.sectionName && s.batch === targetBatch?.label);
    
    if (hasStudents) {
      toast.error('Cannot delete section: It has associated students');
      return;
    }

    deleteItem(SECTIONS_KEY, sectionId);
    toast.success('Section deleted');
    refreshData();
  };

  const openBatchEdit = (batch: BatchData) => {
    setEditingBatch(batch);
    setEditBatchSemester(batch.currentSemester || 'Odd');
    setEditBatchStartDate(batch.semesterStartDate || '');
    setEditBatchEndDate(batch.semesterEndDate || '');
    setIsEditBatchOpen(true);
  };

  const handleUpdateBatch = () => {
    if (!editingBatch) return;

    updateItem<BatchData>(BATCHES_KEY, editingBatch.id, {
        currentSemester: editBatchSemester,
        semesterStartDate: editBatchStartDate,
        semesterEndDate: editBatchEndDate
    });

    toast.success('Batch academic settings updated');
    setIsEditBatchOpen(false);
    refreshData();
  };

  const filteredBatches = batches.filter(batch => 
    (batch.label || batch.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            Academic Management
          </h1>
          <p className="text-muted-foreground mt-1 italic">Configure batches, active years, and sections</p>
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
                  placeholder="2024"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="italic"
                />
              </div>

              <div className="space-y-2">
                <Label className="italic">Number of Sections</Label>
                <Input 
                  type="number" 
                  placeholder="1"
                  min="1"
                  value={maxSections}
                  onChange={(e) => setMaxSections(e.target.value)}
                  className="italic"
                />
                <p className="text-xs text-muted-foreground italic">
                  Will auto-create sections (A, B, C...) for the 1st Year.
                </p>
              </div>
              
              <div className="pt-1">
                <p className="text-xs text-muted-foreground italic">
                  End year will be {parseInt(startYear || '0') + 4}. This creates a 1st Year active class.
                </p>
              </div>
              <Button onClick={handleAddBatch} className="w-full italic font-bold">Create Batch & Start Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
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

      {/* Batches Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-[180px] italic">Batch</TableHead>
              <TableHead className="italic">Current Status</TableHead>
              <TableHead className="italic">Total Sections</TableHead>
              <TableHead className="italic">Current Semester</TableHead>
              <TableHead className="italic">Academic Cycle</TableHead>
              <TableHead className="text-right italic">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => {
                const activeClass = classes.find(c => c.batchId === batch.id && c.isActive);
                const activeSectionsCount = activeClass 
                  ? sections.filter(s => s.classId === activeClass.id).length 
                  : 0;
                
                return (
                  <TableRow key={batch.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold italic text-lg">{batch.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeClass ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 italic">
                          {activeClass.yearLabel}
                        </Badge>
                      ) : (
                         <Badge variant="outline" className="italic">Completed / Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{activeSectionsCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="italic">
                        {batch.currentSemester || 'Odd'} Sem
                      </Badge>
                    </TableCell>
                    <TableCell>
                       {batch.semesterStartDate && batch.semesterEndDate ? (
                         <div className="text-xs text-muted-foreground italic">
                            {new Date(batch.semesterStartDate).toLocaleDateString()} — {new Date(batch.semesterEndDate).toLocaleDateString()}
                         </div>
                       ) : (
                         <span className="text-xs text-muted-foreground italic">Not Set</span>
                       )}
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
                           <DropdownMenuItem onClick={() => {
                             setSelectedBatchId(batch.id);
                             setIsManageSectionsOpen(true);
                           }}>
                             <BookOpen className="w-4 h-4 mr-2" />
                             Manage Sections
                           </DropdownMenuItem>
                           {activeClass && activeClass.yearNumber < 4 && (
                             <DropdownMenuItem onClick={() => promoteClass(batch.id)}>
                               <ArrowUpCircle className="w-4 h-4 mr-2" />
                               Promote
                             </DropdownMenuItem>
                           )}
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                   <div className="flex flex-col items-center justify-center text-muted-foreground italic">
                      <Search className="w-8 h-8 mb-2 opacity-20" />
                      <p>No batches found</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Manage Sections Sheet */}
      <Sheet open={isManageSectionsOpen} onOpenChange={setIsManageSectionsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/10 glass-card">
           <SheetHeader>
             <SheetTitle className="italic text-2xl">Manage Sections</SheetTitle>
             <SheetDescription className="italic">
               Add, edit, or remove sections for {selectedBatchId && batches.find(b => b.id === selectedBatchId)?.label}
             </SheetDescription>
           </SheetHeader>
           
           <div className="mt-6 scroll-smooth h-[calc(100vh-120px)] overflow-y-auto pr-4">
             {selectedBatchId && (() => {
               const batch = batches.find(b => b.id === selectedBatchId);
               const activeClass = classes.find(c => c.batchId === batch?.id && c.isActive);
               
               if (!activeClass) return <p className="text-muted-foreground italic text-center">No active class found for this batch.</p>;

               const currentSections = sections.filter(s => s.classId === activeClass.id);

               return (
                 <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                       <h3 className="font-bold italic text-primary mb-1">{activeClass.yearLabel}</h3>
                       <p className="text-xs text-muted-foreground italic mb-4">Current Active Academic Year</p>
                       
                       <Button 
                         size="sm"
                         className="w-full gap-2 italic bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                         onClick={() => {
                           setTargetClassId(activeClass.id);
                           setIsAddSectionOpen(true);
                         }}
                       >
                         <Plus className="w-4 h-4" /> Add New Section
                       </Button>
                    </div>

                    <div className="space-y-3">
                       {currentSections.map(section => (
                         <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group hover:border-white/20 transition-colors">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-white/10">
                               <span className="font-bold italic">{section.sectionName}</span>
                             </div>
                             <div>
                               <p className="font-medium text-sm italic">Section {section.sectionName}</p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                setEditingSection(section);
                                setEditSectionName(section.sectionName);
                                setIsEditSectionOpen(true);
                              }}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSection(section.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                           </div>
                         </div>
                       ))}
                       {currentSections.length === 0 && (
                         <p className="text-center text-sm text-muted-foreground italic py-4">No sections yet.</p>
                       )}
                    </div>
                 </div>
               );
             })()}
           </div>
        </SheetContent>
      </Sheet>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Define New Section</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="italic">Section Designation (e.g., A, B, C)</Label>
              <Input 
                value={newSectionName} 
                onChange={(e) => setNewSectionName(e.target.value)} 
                placeholder="A"
                className="italic uppercase font-bold"
                maxLength={2}
              />
              <p className="text-xs text-muted-foreground italic">This will belong to the current active year.</p>
            </div>
            <Button onClick={handleAddSection} className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6 text-lg italic font-black">CONFIRM SECTION</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Modify Section Identity</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="italic">Section Name</Label>
              <Input 
                value={editSectionName} 
                onChange={(e) => setEditSectionName(e.target.value)} 
                className="italic uppercase font-bold"
                maxLength={2}
              />
            </div>
            <Button onClick={handleEditSection} className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6 italic font-black">UPDATE SECTION</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditBatchOpen} onOpenChange={setIsEditBatchOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Batch Academic Settings</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label className="italic">Current Semester Type</Label>
                <Select 
                  value={editBatchSemester} 
                  onValueChange={(value: "Odd" | "Even") => setEditBatchSemester(value)}
                >
                  <SelectTrigger className="italic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Odd">Odd Semester</SelectItem>
                    <SelectItem value="Even">Even Semester</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="italic">Semester Start Date</Label>
                    <Input 
                        type="date"
                        value={editBatchStartDate}
                        onChange={(e) => setEditBatchStartDate(e.target.value)}
                        className="italic"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="italic">Semester End Date</Label>
                    <Input 
                        type="date"
                        value={editBatchEndDate}
                        onChange={(e) => setEditBatchEndDate(e.target.value)}
                        className="italic"
                    />
                 </div>
             </div>

            <Button onClick={handleUpdateBatch} className="w-full bg-primary hover:bg-primary/90 rounded-xl py-6 italic font-black">SAVE SETTINGS</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
