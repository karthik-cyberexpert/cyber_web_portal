import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  FileEdit,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  subject_code: string;
  section_name: string;
  batch_name: string;
  due_date: string;
  max_score: number;
  attachment_url: string | null;
  created_at: string;
  student_count: number;
  submission_count: number;
  graded_count: number;
}

interface SubjectAllocation {
  allocation_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  section_id: number;
  section_name: string;
  batch_id: number;
  batch_name: string;
}

export default function Assignments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allocations, setAllocations] = useState<SubjectAllocation[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Grading state
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // View configuration
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  // Form State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject_id: '',
    batch_id: '',
    section_id: '',
    dueDate: '',
    maxScore: 100,
    description: '',
    enableAlert: false
  });

  const loadAllocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3007/api/assignments/my-allocations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3007/api/assignments/my-assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllocations();
      loadAssignments();
    }
  }, [user]);

  const handleCreate = async () => {
    if (!user || !newAssignment.title || !newAssignment.subject_id || !newAssignment.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Find the subject_allocation_id based on subject, batch, and section
    const allocation = allocations.find(a => 
      a.subject_id === parseInt(newAssignment.subject_id) &&
      (!newAssignment.batch_id || a.batch_id === parseInt(newAssignment.batch_id)) &&
      (!newAssignment.section_id || a.section_id === parseInt(newAssignment.section_id))
    );

    if (!allocation) {
      toast.error('Invalid subject/batch/section combination');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('subject_allocation_id', String(allocation.allocation_id));
      formData.append('due_date', newAssignment.dueDate);
      formData.append('max_score', String(newAssignment.maxScore));
      if (newAssignment.description) {
        formData.append('description', newAssignment.description);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const url = isEditMode && editingId 
        ? `http://localhost:3007/api/assignments/${editingId}`
        : 'http://localhost:3007/api/assignments';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success(`Assignment ${isEditMode ? 'updated' : 'created'} successfully`);
        if (newAssignment.enableAlert && !isEditMode) {
          toast.info('Alert sent to students!');
        }
        setIsCreateOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setSelectedFile(null);
        setNewAssignment({
          title: '',
          subject_id: '',
          batch_id: '',
          section_id: '',
          dueDate: '',
          maxScore: 100,
          description: '',
          enableAlert: false
        });
        loadAssignments();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} assignment`);
      }
    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} assignment error:`, error);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} assignment`);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    // Find the allocation to get subject, batch, section IDs
    // We have: subject_name, batch_name etc in assignment.
    // Ideally we should match names or have IDs. 
    // Luckily we do have allocations list.
    // The assignment usually has subject_allocation_id if we fetched it, but getFacultyAssignments returns it.
    // Wait, getFacultyAssignments returns subject_allocation_id as well!
    // But my current Assignment interface removed it? No, checking interface...
    // Interface check: I removed it? Lines 30-42 don't show subject_allocation_id.
    // But the backend query DOES return it.
    // I should add `subject_allocation_id` to Assignment interface or infer it.
    // Let's assume I find it via matching names/codes from allocations.
    
    // Actually, let's update Assignment interface to include subject_allocation_id because backend sends it.
    // But for now, let's try to reverse lookup.
    
    const allocation = allocations.find(a => 
      a.subject_name === assignment.subject_name &&
      a.batch_name === assignment.batch_name && 
      (assignment.section_name === 'All Sections' ? true : a.section_name === assignment.section_name)
    );

    // If section specific, fine. If not, how do we know?
    // The backend join says: JOIN sections sec ON sa.section_id = sec.id
    // So there IS a section. Assignments are always tied to a section via allocation.
    
    // So we can find allocation by matching subject_name, batch_name, section_name.
    
    // Correct way:
    setNewAssignment({
      title: assignment.title,
      subject_id: allocation ? String(allocation.subject_id) : '',
      batch_id: allocation ? String(allocation.batch_id) : '',
      section_id: allocation ? String(allocation.section_id) : '',
      dueDate: assignment.due_date.split('T')[0], // format date for input
      maxScore: assignment.max_score,
      description: assignment.description,
      enableAlert: false
    });
    setEditingId(assignment.id);
    setIsEditMode(true);
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3007/api/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Assignment deleted');
        loadAssignments();
      } else {
        toast.error('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting assignment');
    }
  };

  const handleEvaluate = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsOpen(true);
    // Fetch submissions
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3007/api/assignments/${assignment.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Fetch submissions error:', error);
    }
  };

  const handleGrade = (submission: any) => {
    setGradingSubmission(submission);
    setGradeScore(submission.score || '');
    setGradeFeedback(submission.feedback || '');
    setIsGradingOpen(true);
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;

    const score = parseFloat(gradeScore);
    if (isNaN(score)) {
      toast.error('Please enter a valid score');
      return;
    }

    setIsGrading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3007/api/grade-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          score: score,
          feedback: gradeFeedback
        })
      });

      if (res.ok) {
        toast.success('Submission graded successfully!');
        setIsGradingOpen(false);
        setGradingSubmission(null);
        setGradeScore('');
        setGradeFeedback('');
        // Refresh submissions
        if (selectedAssignment) {
          handleEvaluate(selectedAssignment);
        }
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Grade error:', error);
      toast.error('Error grading submission');
    } finally {
      setIsGrading(false);
    }
  };

  // Stats
  const totalTasks = assignments.length;
  const activeTasks = assignments.filter(a => new Date(a.due_date) >= new Date()).length;
  
  // Calculate aggregate stats from real data
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submission_count, 0);
  const totalGraded = assignments.reduce((acc, curr) => acc + curr.graded_count, 0);
  const evaluationRate = totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0;
  
  const dueApproaching = assignments.filter(a => {
      const due = new Date(a.due_date);
      const today = new Date();
      const diff = due.getTime() - today.getTime();
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  }).length;

  // Get unique subjects for the faculty
  const uniqueSubjects = Array.from(
    new Map(allocations.map(a => [a.subject_id, a])).values()
  );

  // Get batches for selected subject
  const batchesForSubject = newAssignment.subject_id
    ? Array.from(
        new Map(
          allocations
            .filter(a => a.subject_id === parseInt(newAssignment.subject_id))
            .map(a => [a.batch_id, a])
        ).values()
      )
    : [];

  // Get sections for selected subject and batch
  const sectionsForSubjectBatch = newAssignment.subject_id
    ? allocations.filter(
        a =>
          a.subject_id === parseInt(newAssignment.subject_id) &&
          (!newAssignment.batch_id || a.batch_id === parseInt(newAssignment.batch_id))
      )
    : [];

  // Filter assignments based on search and view mode
  const filteredAssignmentsData = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const dueDate = new Date(a.due_date);
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const isHistory = dueDate < sixMonthsAgo;
    const matchesView = viewMode === 'current' ? !isHistory : isHistory;

    return matchesSearch && matchesView;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssignmentsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignmentsData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or view changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight">Assignment Management 📝</h1>
            <p className="text-muted-foreground mt-1 font-medium">Create, track and evaluate student submissions</p>
          </div>
          
          <div className="flex bg-muted/30 p-1 rounded-xl self-start md:self-auto">
             <button
               onClick={() => setViewMode('current')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'current' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
             >
               Current Semester
             </button>
             <button
               onClick={() => setViewMode('history')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'history' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
             >
               History
             </button>
          </div>
        </motion.div>
      
        <div className="flex justify-end">
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
                    <DialogDescription>{isEditMode ? 'Update assignment details.' : 'Set up a new assignment for your students.'}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="md:col-span-2">
                        <Label>Title</Label>
                        <Input 
                            value={newAssignment.title} 
                            onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
                            placeholder="e.g. Linked List Implementation" 
                        />
                    </div>
                    <div>
                        <Label>Subject</Label>
                        <Select 
                          value={newAssignment.subject_id} 
                          onValueChange={v => setNewAssignment({...newAssignment, subject_id: v, batch_id: '', section_id: ''})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueSubjects.map(sub => (
                              <SelectItem key={sub.subject_id} value={String(sub.subject_id)}>
                                {sub.subject_name} ({sub.subject_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Batch</Label>
                        <Select 
                          value={newAssignment.batch_id} 
                          onValueChange={v => setNewAssignment({...newAssignment, batch_id: v, section_id: ''})}
                          disabled={!newAssignment.subject_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batchesForSubject.map(batch => (
                              <SelectItem key={batch.batch_id} value={String(batch.batch_id)}>
                                {batch.batch_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Section (Optional)</Label>
                        <Select 
                          value={newAssignment.section_id || 'all'} 
                          onValueChange={v => setNewAssignment({...newAssignment, section_id: v === 'all' ? '' : v})}
                          disabled={!newAssignment.subject_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Sections" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {sectionsForSubjectBatch.map(sec => (
                              <SelectItem key={sec.section_id} value={String(sec.section_id)}>
                                {sec.section_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Due Date</Label>
                        <Input 
                            type="date"
                            value={newAssignment.dueDate} 
                            onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} 
                        />
                    </div>
                    <div>
                        <Label>Max Score</Label>
                        <Input 
                            type="number" 
                            value={newAssignment.maxScore} 
                            onChange={e => setNewAssignment({...newAssignment, maxScore: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label>Upload File (Optional)</Label>
                        {selectedFile ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <FileText className="w-8 h-8 text-primary" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Input 
                                type="file" 
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        toast.success(`File selected: ${file.name}`);
                                    }
                                }}
                            />
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                            rows={4}
                            value={newAssignment.description || ''} 
                            onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} 
                            placeholder="Detailed instructions..."
                        />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                        <Checkbox 
                            id="enableAlert" 
                            checked={newAssignment.enableAlert}
                            onCheckedChange={(checked) => setNewAssignment({...newAssignment, enableAlert: checked as boolean})}
                        />
                        <Label htmlFor="enableAlert" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Enable Alert (Notify students immediately)
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>{isEditMode ? 'Update Assignment' : 'Create Assignment'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <FileText className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Tasks</p>
                 <h3 className="text-2xl font-black">{activeTasks} Tasks</h3>
              </div>
           </div>
        </Card>
        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-orange-500/5 to-transparent">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                 <Clock className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Shortly</p>
                 <h3 className="text-2xl font-black text-orange-500">{dueApproaching} Approaching</h3>
              </div>
           </div>
        </Card>
        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-emerald-500/5 to-transparent">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Evaluation Rate</p>
                 <h3 className="text-2xl font-black text-emerald-500">{evaluationRate}%</h3>
              </div>
           </div>
        </Card>
      </div>

      <div className="space-y-4">
         <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input 
                  placeholder="Filter assignments..." 
                  className="pl-10 rounded-2xl bg-white/5 border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <Button variant="outline" className="rounded-2xl border-white/10">Active Only</Button>
         </div>

         <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
             {paginatedAssignments.map((assignment, idx) => {
               const submissionRate = assignment.student_count > 0 
                 ? Math.round((assignment.submission_count / assignment.student_count) * 100) 
                 : 0;

               return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
               >
                  <Card className="glass-card border-none p-6 group hover:shadow-2xl transition-all">
                     <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                           <FileEdit className="w-8 h-8" />
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center lg:text-left">
                           <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/10">{assignment.subject_name}</Badge>
                              <Badge className={'bg-primary/10 text-primary border-none'}>
                                 {assignment.max_score} MARKS
                              </Badge>
                           </div>
                           <h4 className="text-lg font-black group-hover:text-primary transition-colors">{assignment.title}</h4>
                           <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-muted-foreground">
                              <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Users className="w-3.5 h-3.5" /> {assignment.batch_name} - {assignment.section_name}</span>
                              <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Clock className="w-3.5 h-3.5 text-orange-500" /> Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                           </div>
                        </div>
 
                         <div className="w-full lg:w-48 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                               <span>Submission Rate</span>
                               <span>{submissionRate}%</span>
                            </div>
                            <Progress value={submissionRate} className="h-2 bg-muted/50" />
                            <p className="text-[10px] font-bold text-right text-muted-foreground">{assignment.submission_count} / {assignment.student_count} Students</p>
                         </div>

                         <div className="flex items-center gap-2">
                             <Button 
                                className="rounded-xl shadow-lg shadow-primary/20"
                                onClick={() => handleEvaluate(assignment)}
                             >
                                Evaluate
                             </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                                        <FileEdit className="w-4 h-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(assignment.id)}>
                                        <X className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                         </div>
                     </div>
                  </Card>
               </motion.div>
              );
           })}
         </div>
         
         <Pagination 
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={setCurrentPage}
           totalItems={filteredAssignmentsData.length}
         />
       </div>


        {/* Evaluation/Submissions Dialog */}
        <Dialog open={isSubmissionsOpen} onOpenChange={setIsSubmissionsOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submissions for {selectedAssignment?.title}</DialogTitle>
                    <DialogDescription>
                        Review and grade student submissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {submissions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No submissions yet for this assignment.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((sub: any) => (
                                <Card key={sub.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{sub.student_name}</p>
                                        <p className="text-xs text-muted-foreground">{sub.roll_number}</p>
                                        <p className="text-xs text-muted-foreground">Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={sub.status === 'Graded' ? 'default' : 'secondary'}>
                                            {sub.status}
                                        </Badge>
                                        {sub.file_url && (
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => {
                                                const url = sub.file_url.startsWith('http') 
                                                  ? sub.file_url 
                                                  : `http://localhost:3007${sub.file_url}`;
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                              }}
                                            >
                                                View File
                                            </Button>
                                        )}
                                        {/* Grading Button */}
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleGrade(sub)}
                                          disabled={sub.status === 'Graded'}
                                        >
                                          {sub.status === 'Graded' ? 'Graded' : 'Grade'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Grading Dialog */}
        <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Grade Submission</DialogTitle>
                    <DialogDescription>
                        Assign marks and provide feedback for {gradingSubmission?.student_name}'s submission
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="score">Score (out of {selectedAssignment?.max_score})</Label>
                        <Input
                            id="score"
                            type="number"
                            min="0"
                            max={selectedAssignment?.max_score || 100}
                            value={gradeScore}
                            onChange={(e) => setGradeScore(e.target.value)}
                            placeholder="Enter score"
                        />
                    </div>
                    <div>
                        <Label htmlFor="feedback">Feedback (Optional)</Label>
                        <Textarea
                            id="feedback"
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            placeholder="Provide feedback to the student..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGradingOpen(false)} disabled={isGrading}>
                        Cancel
                    </Button>
                    <Button onClick={submitGrade} disabled={isGrading || !gradeScore}>
                        {isGrading ? 'Grading...' : 'Submit Grade'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {assignments.length === 0 && !loading && (
            <div className="text-center py-10 text-muted-foreground">
                No assignments created yet. Click "Create Assignment" to start.
            </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-primary/10 border border-primary/20 p-8 flex flex-col md:flex-row items-center gap-8 shadow-glow shadow-primary/5"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
           <TrendingUp className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Submission Trends</h3>
           <p className="text-sm text-muted-foreground font-medium">Overall assignment submission rate has improved by <span className="text-emerald-500 font-black">12.5%</span> this week. Peer-to-peer collaboration seems to be high in {assignments[0]?.batch_name || 'your classes'}.</p>
        </div>
        <Button variant="outline" className="rounded-xl h-12 px-8 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">Detailed Insights <ArrowRight className="ml-2 w-4 h-4" /></Button>
      </motion.div>
    </div>
  );
}
