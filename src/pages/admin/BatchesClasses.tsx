import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Users, Calendar, Plus, Edit2, Trash2, 
  ChevronDown, ChevronRight, Search, Filter, BookOpen,
  Clock, Building2, ShieldAlert
} from 'lucide-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [editClassLabel, setEditClassLabel] = useState('');

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');

  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [editSectionName, setEditSectionName] = useState('');

  useEffect(() => {
    refreshData();
    // Initialize keys if they don't exist
    if (!localStorage.getItem(BATCHES_KEY)) saveData(BATCHES_KEY, []);
    if (!localStorage.getItem(CLASSES_KEY)) saveData(CLASSES_KEY, []);
    if (!localStorage.getItem(SECTIONS_KEY)) saveData(SECTIONS_KEY) || saveData(SECTIONS_KEY, []);
  }, []);

  const refreshData = () => {
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
    if (isNaN(year)) {
      toast.error('Please enter a valid start year');
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
      name: label,
      startYear: year,
      endYear,
      label
    });

    // 2. Automatically generate 4 classes (1st to 4th year)
    const yearLabels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    yearLabels.forEach((yLabel, index) => {
      addItem<ClassData>(CLASSES_KEY, {
        batchId: batch.id,
        yearNumber: index + 1,
        yearLabel: yLabel
      });
    });

    toast.success(`Batch ${label} created with 4 academic years`);
    setIsAddBatchOpen(false);
    refreshData();
  };

  const handleDeleteBatch = (batchId: string) => {
    const relatedClasses = classes.filter(c => c.batchId === batchId);
    const hasSections = relatedClasses.some(c => sections.some(s => s.classId === c.id));
    
    if (hasSections) {
      toast.error('Cannot delete batch: It has classes with existing sections');
      return;
    }

    // Delete classes first then batch
    const allClassIds = relatedClasses.map(c => c.id);
    const updatedClasses = classes.filter(c => !allClassIds.includes(c.id));
    saveData(CLASSES_KEY, updatedClasses);
    
    deleteItem(BATCHES_KEY, batchId);
    toast.success('Batch and its years deleted');
    refreshData();
  };

  const handleEditClass = () => {
    if (!editingClass) return;
    updateItem(CLASSES_KEY, editingClass.id, { yearLabel: editClassLabel });
    toast.success('Class label updated');
    setIsEditClassOpen(false);
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

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    
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

    updateItem(SECTIONS_KEY, editingSection.id, { sectionName: editSectionName.trim().toUpperCase() });
    toast.success('Section updated');
    setIsEditSectionOpen(false);
    refreshData();
  };

  const handleDeleteSection = (sectionId: string) => {
    // Check for students
    const students = getData<Student>('college_portal_students');
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const targetClass = classes.find(c => c.id === section.classId);
    const targetBatch = batches.find(b => b.id === targetClass?.batchId);

    const hasStudents = students.some(s => s.section === section.sectionName && s.batch === targetBatch?.name);
    
    if (hasStudents) {
      toast.error('Cannot delete section: It has associated students');
      return;
    }

    deleteItem(SECTIONS_KEY, sectionId);
    toast.success('Section deleted');
    refreshData();
  };

  const filteredBatches = batches.filter(batch => 
    batch.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            Academic Structure
          </h1>
          <p className="text-muted-foreground mt-1 italic">Manage batches, years, and sections</p>
        </div>
        <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 italic">
              <Plus className="w-4 h-4" />
              Create New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="italic">Create Academic Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="italic">Start Year (e.g., 2024)</Label>
                <Input 
                  type="number" 
                  placeholder="2024"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="italic"
                />
                <p className="text-xs text-muted-foreground italic">
                  End year will be automatically set to {parseInt(startYear || '0') + 4}
                </p>
              </div>
              <Button onClick={handleAddBatch} className="w-full italic">Generate Batch & 4 Years</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search batches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 italic"
        />
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredBatches.map((batch) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Collapsible 
                open={expandedBatches.includes(batch.id)}
                onOpenChange={(isOpen) => {
                  setExpandedBatches(prev => 
                    isOpen ? [...prev, batch.id] : prev.filter(id => id !== batch.id)
                  );
                }}
              >
                <Card className="glass-card border-white/10 overflow-hidden hover:border-primary/20 transition-all">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg italic flex items-center gap-3">
                              Batch {batch.label}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground italic">
                              {classes.filter(c => c.batchId === batch.id).length} Academic Years
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-destructive/20 text-destructive h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBatch(batch.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedBatches.includes(batch.id) 
                            ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            : <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 space-y-4">
                      {classes
                        .filter(c => c.batchId === batch.id)
                        .sort((a, b) => a.yearNumber - b.yearNumber)
                        .map((cls) => (
                          <div key={cls.id} className="pl-4 border-l border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold flex items-center gap-2 italic text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {cls.yearLabel}
                              </h4>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setEditingClass(cls);
                                    setEditClassLabel(cls.yearLabel);
                                    setIsEditClassOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 hover:text-destructive"
                                  onClick={() => handleDeleteClass(cls.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 gap-1 text-xs italic"
                                  onClick={() => {
                                    setTargetClassId(cls.id);
                                    setIsAddSectionOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3" /> Add Section
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                              {sections
                                .filter(s => s.classId === cls.id)
                                .map((section) => (
                                  <div 
                                    key={section.id}
                                    className="group relative p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-all text-center"
                                  >
                                    <span className="text-sm font-bold italic">{section.sectionName}</span>
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                      <button 
                                        className="p-1 hover:text-primary transition-colors"
                                        onClick={() => {
                                          setEditingSection(section);
                                          setEditSectionName(section.sectionName);
                                          setIsEditSectionOpen(true);
                                        }}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button 
                                        className="p-1 hover:text-destructive transition-colors"
                                        onClick={() => handleDeleteSection(section.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Edit Class Label</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="italic">Year Label</Label>
              <Input 
                value={editClassLabel} 
                onChange={(e) => setEditClassLabel(e.target.value)} 
                className="italic"
              />
            </div>
            <Button onClick={handleEditClass} className="w-full italic">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Add New Section</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="italic">Section Name (e.g., A, B, C)</Label>
              <Input 
                value={newSectionName} 
                onChange={(e) => setNewSectionName(e.target.value)} 
                placeholder="A"
                className="italic"
                maxLength={2}
              />
            </div>
            <Button onClick={handleAddSection} className="w-full italic">Add Section</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionOpen} onOpenChange={setIsEditSectionOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader><DialogTitle className="italic">Edit Section Name</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="italic">Section Name</Label>
              <Input 
                value={editSectionName} 
                onChange={(e) => setEditSectionName(e.target.value)} 
                className="italic"
                maxLength={2}
              />
            </div>
            <Button onClick={handleEditSection} className="w-full italic">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
