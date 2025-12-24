import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Upload,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getAssignments, getSubmissions, submitAssignment, Assignment, Submission, getStudents } from '@/lib/data-store';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<(Assignment & { submission?: Submission, statusStr: string, progress: number })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const allStudents = getStudents();
    const student = allStudents.find(s => s.id === user.id || s.email === user.email);

    if (student) {
        const allAssignments = getAssignments();
        const mySubmissions = getSubmissions().filter(s => s.studentId === student.id);

        // Filter assignments for my class
        const myAssignments = allAssignments.filter(a => 
            a.classId === student.batch || a.classId === student.year.toString() // assuming batch/year matching
        ).map(a => {
            const submission = mySubmissions.find(s => s.assignmentId === a.id);
            const statusStr = submission ? submission.status : (new Date(a.dueDate) < new Date() ? 'overdue' : 'pending');
            // Mock progress calculation
            const progress = submission ? 100 : (statusStr === 'overdue' ? 0 : 50); 

            return { ...a, submission, statusStr, progress };
        });

        // Sort by deadline
        myAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setAssignments(myAssignments);
    }
  }, [user, isSubmitting]);

  const handleSubmit = (assignmentId: string) => {
    setIsSubmitting(true);
    // Simulate upload delay
    setTimeout(() => {
        submitAssignment({
            assignmentId: assignmentId,
            studentId: user?.id || '',
            studentName: user?.name || 'Student',
            fileUrl: 'https://example.com/mock-file.pdf',
        });
        toast.success('Assignment submitted successfully!');
        setIsSubmitting(false);
        setSelectedAssignment(null);
    }, 1500);
  };

  const getPriorityColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-destructive bg-destructive/10'; // Overdue
    if (diffDays <= 2) return 'text-orange-500 bg-orange-500/10'; // High urgency
    return 'text-primary bg-primary/10';
  };

  const completedCount = assignments.filter(a => a.submission).length;
  const pendingCount = assignments.length - completedCount;
  const completionRate = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Keep track of your coursework and submission deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">History</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assignments.length > 0 ? assignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-6 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    assignment.submission ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {assignment.submission ? <CheckCircle2 className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{assignment.subject}</p>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase ${getPriorityColor(assignment.dueDate)} border-0`}>
                        {new Date(assignment.dueDate) < new Date() && !assignment.submission ? 'OVERDUE' : (assignment.submission ? 'SUBMITTED' : 'PENDING')}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{assignment.title}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    DEADLINE
                  </div>
                  <p className="text-sm font-black tracking-tight">{assignment.dueDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground">Status</span>
                  <span className="font-bold text-primary">{assignment.progress}%</span>
                </div>
                <Progress value={assignment.progress} className="h-1.5" />
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      MAX MARKS: {assignment.maxMarks}
                    </div>
                  </div>
                  
                  {assignment.submission ? (
                      <Button variant="secondary" size="sm" className="rounded-xl h-8 text-xs font-bold">
                        View Submission
                        <CheckCircle2 className="w-3 h-3 ml-2" />
                      </Button>
                  ) : (
                      <Dialog open={selectedAssignment === assignment.id} onOpenChange={(open) => setSelectedAssignment(open ? assignment.id : null)}>
                        <DialogTrigger asChild>
                            <Button variant="default" size="sm" className="rounded-xl h-8 text-xs font-bold">
                                Upload Assignment
                                <Upload className="w-3 h-3 ml-2" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit Assignment</DialogTitle>
                                <DialogDescription>Upload your solution for {assignment.title}.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors">
                                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground font-medium">Click to upload file</p>
                                    <p className="text-xs text-muted-foreground/50">(Mock upload)</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => handleSubmit(assignment.id)} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
              <div className="text-center py-12 text-muted-foreground">
                  No assignments found for your class.
              </div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Submission Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <p className="text-2xl font-black text-primary font-mono">{completedCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Completed</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <p className="text-2xl font-black text-warning font-mono">{pendingCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-success uppercase">Completion Rate</span>
                <span className="text-xs font-black text-success">{completionRate}%</span>
              </div>
              <div className="h-1.5 bg-success/20 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </motion.div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {assignments.filter(a => !a.submission && new Date(a.dueDate) >= new Date()).slice(0, 3).map((a, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <div className="flex-1">
                    <p className="text-xs font-bold truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">Due: {a.dueDate}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {assignments.filter(a => !a.submission && new Date(a.dueDate) >= new Date()).length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming deadlines.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
