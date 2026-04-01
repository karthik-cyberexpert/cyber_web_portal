import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Calculator, 
  BookOpen, 
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';

interface QuestionPart {
  mark: number;
  count: number;
}

interface CustomExam {
  id: number;
  title: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  total_marks: number;
  created_at: string;
  exam_type_label: string;
}

export default function Examinations() {
  const [exams, setExams] = useState<CustomExam[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [examTitle, setExamTitle] = useState('');
  const [parts, setParts] = useState<QuestionPart[]>([
    { mark: 2, count: 0 },
    { mark: 5, count: 0 },
    { mark: 10, count: 0 }
  ]);

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/custom-exams`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setExams(await res.json());
    } catch (e) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/marks/faculty/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setClasses(await res.json());
    } catch (e) {}
  };

  // Derived filters
  const uniqueBatches = Array.from(new Set(classes.map(c => c.batchName))).filter(Boolean);
  const availableSections = Array.from(new Set(classes.filter(c => c.batchName === selectedBatch).map(c => c.sectionId.toString()))).filter(Boolean);
  const availableSubjects = classes.filter(c => c.batchName === selectedBatch && c.sectionId.toString() === selectedSection);

  const addPart = () => setParts([...parts, { mark: 0, count: 0 }]);
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));
  
  const updatePart = (index: number, field: keyof QuestionPart, value: number) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const totalMarks = parts.reduce((sum, p) => sum + (p.mark * p.count), 0);

  const handleCreate = async () => {
    if (!selectedSubject || !examTitle || totalMarks === 0) {
        toast.error("Please fill all details and ensure marks > 0");
        return;
    }

    const classData = classes.find(c => `${c.subjectCode}-${c.sectionId}` === selectedSubject);
    if (!classData) return;

    setCreating(true);
    try {
        const res = await fetch(`${API_BASE_URL}/custom-exams`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({
                subjectCode: classData.subjectCode,
                sectionId: classData.sectionId,
                title: examTitle,
                questionBreakdown: parts.filter(p => p.count > 0)
            })
        });

        if (res.ok) {
            toast.success("Examination Created Successfully");
            setExamTitle('');
            setSelectedBatch('');
            setSelectedSection('');
            setSelectedSubject('');
            setParts([{ mark: 2, count: 0 }, { mark: 5, count: 0 }, { mark: 10, count: 0 }]);
            setIsModalOpen(false);
            fetchExams();
        } else {
            toast.error("Failed to create examination");
        }
    } catch (e) {
        toast.error("Network error");
    } finally {
        setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this examination? Past marks will remain but entry will be disabled.")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/custom-exams/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            toast.success("Exam deleted");
            fetchExams();
        }
    } catch (e) {}
  };

  const handleActionClick = (action: string) => {
    toast.info(`${action} functionality coming soon!`);
  };

  return (
    <div className="space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground">
            Custom Examinations 🎯
          </h1>
          <p className="text-muted-foreground font-medium">Create and manage your own assessment criteria</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="font-bold italic uppercase h-12 px-6 rounded-xl shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5 mr-2" /> Create Exam
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-none rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-primary/10 border-b border-white/5">
                    <DialogTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                        <Plus className="w-6 h-6" /> Create New Exam
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto w-full overflow-x-hidden">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Batch</label>
                            <Select value={selectedBatch} onValueChange={(val) => { setSelectedBatch(val); setSelectedSection(''); setSelectedSubject(''); }}>
                                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12 font-bold italic uppercase text-xs">
                                    <SelectValue placeholder="CHOOSE BATCH" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    {uniqueBatches.map(b => (
                                        <SelectItem key={b as string} value={b as string} className="font-bold italic uppercase text-xs">
                                            {b as string}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Section</label>
                            <Select value={selectedSection} onValueChange={(val) => { setSelectedSection(val); setSelectedSubject(''); }} disabled={!selectedBatch}>
                                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12 font-bold italic uppercase text-xs">
                                    <SelectValue placeholder="CHOOSE SECTION" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    {availableSections.map(s => (
                                        <SelectItem key={s as string} value={s as string} className="font-bold italic uppercase text-xs">
                                            Section {classes.find(c => c.sectionId.toString() === s)?.sectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Subject</label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedSection}>
                                <SelectTrigger className="rounded-xl border-white/10 bg-white/5 h-12 font-bold italic uppercase text-xs">
                                    <SelectValue placeholder="CHOOSE SUBJECT" />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10">
                                    {availableSubjects.map(c => (
                                        <SelectItem key={`${c.subjectCode}-${c.sectionId}`} value={`${c.subjectCode}-${c.sectionId}`} className="font-bold italic uppercase text-xs">
                                            {c.subjectName} ({c.subjectCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exam Title</label>
                            <Input 
                                placeholder="E.G. SURPRISE TEST - 1"
                                value={examTitle}
                                onChange={(e) => setExamTitle(e.target.value.toUpperCase())}
                                className="rounded-xl border-white/10 bg-white/5 h-12 font-bold italic placeholder:italic"
                            />
                        </div>

                        <div className="space-y-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Question Schema</label>
                                <Button variant="ghost" size="sm" onClick={addPart} className="text-[10px] font-black uppercase text-primary hover:bg-primary/10">
                                    <Plus className="w-3 h-3 mr-1" /> Add Rows
                                </Button>
                            </div>
                            
                            {parts.map((p, i) => (
                                <div key={i} className="grid grid-cols-7 gap-2 items-center">
                                    <div className="col-span-3">
                                        <Input 
                                            type="number"
                                            placeholder="Marks"
                                            value={p.mark || ''}
                                            onChange={(e) => updatePart(i, 'mark', parseInt(e.target.value))}
                                            className="h-10 rounded-lg text-center font-black"
                                        />
                                    </div>
                                    <div className="col-span-1 text-center text-xs opacity-50 font-black">X</div>
                                    <div className="col-span-2">
                                        <Input 
                                            type="number"
                                            placeholder="Count"
                                            value={p.count || ''}
                                            onChange={(e) => updatePart(i, 'count', parseInt(e.target.value))}
                                            className="h-10 rounded-lg text-center font-black"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button onClick={() => removePart(i)} className="text-destructive hover:scale-110 transition-transform">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Marks:</span>
                               <span className="text-2xl font-black italic text-primary">{totalMarks}</span>
                            </div>
                        </div>

                        <Button 
                            onClick={handleCreate} 
                            disabled={creating || !examTitle || !selectedSubject}
                            variant="gradient" 
                            className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest italic"
                        >
                            {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                            Finalize & Create
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </motion.div>

      <Card className="glass-card border-none shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-primary/5 border-b border-white/5 p-6 flex flex-row items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <CardTitle className="text-xl font-black italic uppercase tracking-tight">
                  Recent Custom Assessments
              </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4 opacity-50">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="font-black italic uppercase text-[10px]">Loading your exams...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="p-20 text-center opacity-50 italic">
                        You haven't created any custom exams yet. Start by defining one above!
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="font-black uppercase text-[10px] tracking-widest pl-6">Exam Title</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Subject</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Section</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Marks</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest">Created At</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest text-center pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.map((exam, i) => (
                                <TableRow key={exam.id} className="border-white/5 hover:bg-white/[0.02]">
                                    <TableCell className="pl-6">
                                        <div className="font-black italic uppercase tracking-tight text-md">{exam.title}</div>
                                        <div className="text-[9px] font-black uppercase text-muted-foreground/50">{exam.exam_type_label}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-sm tracking-tight">{exam.subjectName}</div>
                                        <Badge variant="outline" className="text-[10px] mt-1 border-white/10">{exam.subjectCode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-black">{exam.sectionName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-lg font-black italic text-primary">{exam.total_marks}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-bold">
                                        {new Date(exam.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg" onClick={() => handleActionClick('View')}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg" onClick={() => handleActionClick('Edit')}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDelete(exam.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
          </CardContent>
      </Card>
    </div>
  );
}
