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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { getAssignments, addAssignment, getSubmissions, Assignment, getFaculty, getStudents } from '@/lib/data-store';
import { toast } from 'sonner';

export default function Assignments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Form State
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    subjectCode: '',
    classId: '',
    sectionId: '',
    dueDate: '',
    maxMarks: 100,
    description: ''
  });

  const loadData = () => {
    if (!user) return;
    const allAssignments = getAssignments();
    // Filter for this faculty
    const myAssignments = allAssignments.filter(a => a.facultyId === user.id || a.facultyName === user.name);
    setAssignments(myAssignments);

    const allSubmissions = getSubmissions();
    setSubmissions(allSubmissions);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreate = () => {
    if (!user || !newAssignment.title || !newAssignment.subject || !newAssignment.dueDate) {
        toast.error('Please fill in all required fields');
        return;
    }

    // Basic subject code extraction or mapping could be better
    const subjectCode = newAssignment.subject.substring(0, 3).toUpperCase(); 

    addAssignment({
        title: newAssignment.title,
        description: newAssignment.description,
        subject: newAssignment.subject,
        subjectCode: subjectCode,
        facultyId: user.id,
        facultyName: user.name,
        classId: newAssignment.classId,
        sectionId: newAssignment.sectionId,
        dueDate: newAssignment.dueDate,
        maxMarks: Number(newAssignment.maxMarks),
        status: 'active'
    });
    
    toast.success('Assignment created successfully');
    setIsCreateOpen(false);
    setNewAssignment({ title: '', subject: '', subjectCode: '', classId: '', sectionId: '', dueDate: '', maxMarks: 100, description: '' });
    loadData();
  };

  // Stats
  const totalTasks = assignments.length;
  const activeTasks = assignments.filter(a => new Date(a.dueDate) >= new Date()).length; // Simple check
  // Evaluation rate: evaluated submissions / total submissions
  // For now verify against submission status 'graded'
  const myAssignmentIds = assignments.map(a => a.id);
  const mySubmissions = submissions.filter(s => myAssignmentIds.includes(s.assignmentId));
  const gradedCount = mySubmissions.filter(s => s.status === 'graded').length;
  const evaluationRate = mySubmissions.length > 0 ? Math.round((gradedCount / mySubmissions.length) * 100) : 0;
  
  const dueApproaching = assignments.filter(a => {
      const due = new Date(a.dueDate);
      const today = new Date();
      const diff = due.getTime() - today.getTime();
      return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  }).length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight">Assignment Management 📝</h1>
          <p className="text-muted-foreground mt-1 font-medium">Create, track and evaluate student submissions</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>Set up a new assignment for your students.</DialogDescription>
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
                         <Select onValueChange={v => setNewAssignment({...newAssignment, subject: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Ideally fetch subjects from Faculty profile */}
                                <SelectItem value="Data Structures">Data Structures</SelectItem>
                                <SelectItem value="DBMS">DBMS</SelectItem>
                                <SelectItem value="Operating Systems">Operating Systems</SelectItem>
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
                        <Label>Class</Label>
                        <Select onValueChange={v => setNewAssignment({...newAssignment, classId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CSE">CSE</SelectItem>
                                <SelectItem value="ECE">ECE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Section</Label>
                        <Select onValueChange={v => setNewAssignment({...newAssignment, sectionId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A">Section A</SelectItem>
                                <SelectItem value="B">Section B</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Max Marks</Label>
                        <Input 
                            type="number" 
                            value={newAssignment.maxMarks} 
                            onChange={e => setNewAssignment({...newAssignment, maxMarks: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                            rows={4}
                            value={newAssignment.description} 
                            onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} 
                            placeholder="Detailed instructions..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Create Assignment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </motion.div>

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

         <div className="grid grid-cols-1 gap-4">
            {assignments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map((assignment, idx) => {
               const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
               // Assuming logic to get total students class size, for now hardcoded or fetched
               const totalStudents = 60; // Should fetch class size from student data
               const subCount = assignmentSubmissions.length;

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
                               <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/10">{assignment.subject}</Badge>
                               <Badge className={'bg-primary/10 text-primary border-none'}>
                                  {assignment.maxMarks} MARKS
                               </Badge>
                            </div>
                            <h4 className="text-lg font-black group-hover:text-primary transition-colors">{assignment.title}</h4>
                            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-muted-foreground">
                               <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Users className="w-3.5 h-3.5" /> {assignment.classId} - {assignment.sectionId}</span>
                               <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Clock className="w-3.5 h-3.5 text-orange-500" /> Due: {assignment.dueDate}</span>
                            </div>
                         </div>
 
                         <div className="w-full lg:w-48 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                               <span>Submission Rate</span>
                               <span className="text-primary">{Math.round((subCount/totalStudents)*100)}%</span>
                            </div>
                            <Progress value={(subCount/totalStudents)*100} className="h-1.5 bg-primary/10" indicatorClassName="bg-primary" />
                            <p className="text-right text-[10px] font-bold text-muted-foreground">{subCount} / {totalStudents} Students</p>
                         </div>
 
                         <div className="flex gap-2">
                            <Button className="rounded-xl px-6 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-glow shadow-primary/10">Evaluate</Button>
                            <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-5 h-5" /></Button>
                         </div>
                      </div>
                   </Card>
                </motion.div>
             );
            })}
            
            {assignments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No assignments created yet. Click "Create Assignment" to start.
                </div>
            )}
         </div>
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
           <p className="text-sm text-muted-foreground font-medium">Overall assignment submission rate has improved by <span className="text-emerald-500 font-black">12.5%</span> this week. Peer-to-peer collaboration seems to be high in {assignments[0]?.classId || 'your classes'}.</p>
        </div>
        <Button variant="outline" className="rounded-xl h-12 px-8 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">Detailed Insights <ArrowRight className="ml-2 w-4 h-4" /></Button>
      </motion.div>
    </div>
  );
}
