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
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAssignment, setPreviewAssignment] = useState<any | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user && user.role === 'student') {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/student-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Assignments loaded:', data);
        
        // Combine all assignments and add status/progress
        const allAssignments = [
          ...data.pending.map((a: any) => ({ ...a, statusStr: 'pending', progress: 0 })),
          ...data.submitted.map((a: any) => ({ ...a, statusStr: 'submitted', progress: 75 })),
          ...data.graded.map((a: any) => ({ ...a, statusStr: 'graded', progress: 100 }))
        ];
        
        // Sort by newest first (most recent due date or created date)
        allAssignments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        
        setAssignments(allAssignments);
      } else {
        console.error('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success(`Selected: ${e.target.files[0].name}`);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('assignmentId', assignmentId);
      
      const res = await fetch(`${API_BASE_URL}/assignment-submission`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Assignment submitted successfully!');
        
        // Find the assignment to preview
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
          setPreviewAssignment({
            ...assignment,
            submittedFile: selectedFile.name,
            submittedAt: new Date().toLocaleString(),
            fileUrl: data.fileUrl
          });
        }
        
        setSelectedAssignment(null);
        setSelectedFile(null);
        await loadAssignments(); // Reload assignments
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-destructive bg-destructive/10'; // Overdue
    if (diffDays <= 2) return 'text-orange-500 bg-orange-500/10'; // High urgency
    return 'text-primary bg-primary/10';
  };

  const completedCount = assignments.filter(a => a.statusStr === 'graded' || a.statusStr === 'submitted').length;
  const pendingCount = assignments.length - completedCount;
  const completionRate = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  // Pagination
  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = assignments.slice(startIndex, endIndex);

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
          {currentAssignments.length > 0 ? currentAssignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-2xl p-5 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    assignment.statusStr !== 'pending' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {assignment.statusStr !== 'pending' ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase ${getPriorityColor(assignment.dueDate)} border-0 px-2 py-0.5`}>
                        {new Date(assignment.dueDate) < new Date() && assignment.statusStr === 'pending' ? 'OVERDUE' : assignment.statusStr.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold group-hover:text-primary transition-colors">{assignment.title}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    DEADLINE
                  </div>
                  <p className="text-sm font-black tracking-tight">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-3 gap-3 mb-3 p-3 rounded-xl bg-muted/20 border border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-xs font-bold">{assignment.subjectName}</p>
                  <p className="text-[10px] text-muted-foreground">{assignment.subjectCode}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Assigned By</p>
                  <p className="text-xs font-bold">{assignment.assignedBy || 'Faculty'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Max Marks</p>
                  <p className="text-xs font-bold">{assignment.maxMarks}</p>
                </div>
              </div>

              {assignment.description && (
                <div className="mb-3 p-3 rounded-xl bg-muted/30 border border-white/5">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{assignment.description}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {assignment.statusStr !== 'pending' ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-xl h-8 text-xs font-bold"
                      onClick={() => setPreviewAssignment(assignment)}
                    >
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
                              <input
                                type="file"
                                id={`file-upload-${assignment.id}`}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.zip"
                              />
                              <label
                                htmlFor={`file-upload-${assignment.id}`}
                                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 flex flex-col items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors block"
                              >
                                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                                  {selectedFile ? (
                                    <>
                                      <p className="text-sm text-primary font-medium">{selectedFile.name}</p>
                                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-sm text-muted-foreground font-medium">Click to upload file</p>
                                      <p className="text-xs text-muted-foreground/50">PDF, DOC, DOCX, or ZIP</p>
                                    </>
                                  )}
                              </label>
                          </div>
                          <DialogFooter>
                              <Button onClick={() => handleSubmit(assignment.id)} disabled={isSubmitting || !selectedFile}>
                                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  {isSubmitting ? 'Submitting...' : 'Submit'}
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                )}
              </div>
            </motion.div>
          )) : (
              <div className="text-center py-12 text-muted-foreground">
                  No assignments found for your class.
              </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="rounded-xl w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl"
              >
                Next
              </Button>
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
              {assignments.filter(a => a.statusStr === 'pending' && new Date(a.dueDate) >= new Date()).slice(0, 3).map((a, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <div className="flex-1">
                    <p className="text-xs font-bold truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {assignments.filter(a => a.statusStr === 'pending' && new Date(a.dueDate) >= new Date()).length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming deadlines.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Preview/View Dialog */}
      <Dialog open={!!previewAssignment} onOpenChange={(open) => !open && setPreviewAssignment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {previewAssignment?.submittedFile ? 'Submission Successful! 🎉' : 'Submission Details'}
            </DialogTitle>
            <DialogDescription>
              {previewAssignment?.submittedFile 
                ? 'Your assignment has been submitted successfully.'
                : 'View your submitted assignment details.'
              }
            </DialogDescription>
          </DialogHeader>
          {previewAssignment && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <p className="font-bold text-success">
                    {previewAssignment.statusStr === 'graded' ? 'Assignment Graded' : 'Assignment Submitted'}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assignment:</span>
                    <span className="font-bold">{previewAssignment.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-bold">{previewAssignment.subjectName}</span>
                  </div>
                  {previewAssignment.submittedFile && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted File:</span>
                      <span className="font-bold text-primary">{previewAssignment.submittedFile}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted At:</span>
                    <span className="font-bold">
                      {previewAssignment.submittedAt || 
                       (previewAssignment.submittedAtOriginal ? new Date(previewAssignment.submittedAtOriginal).toLocaleString() : 'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Marks:</span>
                    <span className="font-bold">{previewAssignment.maxMarks}</span>
                  </div>
                  {previewAssignment.marksObtained !== null && previewAssignment.marksObtained !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marks Obtained:</span>
                      <span className="font-bold text-primary">{previewAssignment.marksObtained}/{previewAssignment.maxMarks}</span>
                    </div>
                  )}
                  {previewAssignment.feedback && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-muted-foreground block mb-1">Feedback:</span>
                      <p className="text-sm">{previewAssignment.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
              {!previewAssignment.submittedFile && (
                <div className="p-3 rounded-xl bg-muted/20 border border-white/5">
                  <p className="text-xs text-muted-foreground text-center">
                    {previewAssignment.statusStr === 'graded' 
                      ? 'Your assignment has been graded by the faculty.'
                      : 'Your faculty will review and grade your submission soon.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewAssignment(null)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
