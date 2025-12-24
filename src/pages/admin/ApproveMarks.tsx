import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, Filter, Eye, ThumbsUp, ThumbsDown,
  TrendingUp, Users, BookOpen, BarChart3
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { getMarks, getStudents, getFaculty, updateMarkStatus, MarkEntry, Student, Faculty } from '@/lib/data-store';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface MarksSubmission {
  id: string; // Group ID: `${subjectCode}-${examType}-${section}`
  subject: string;
  subjectCode: string;
  faculty: string;
  class: string;
  section: string;
  examType: 'IA1' | 'IA2' | 'IA3' | 'Assignment' | 'External' | string;
  submittedAt: string;
  verifiedBy: string;
  verifiedAt: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  studentCount: number;
  avgScore: number;
  maxScore: number;
  rawMarks: MarkEntry[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'verified': return <Clock className="w-4 h-4 text-amber-400" />;
    case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
    default: return <AlertTriangle className="w-4 h-4 text-orange-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'verified': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  }
};

const getExamTypeBadge = (type: string) => {
  switch (type) {
    case 'IA1': return 'bg-blue-500/20 text-blue-400';
    case 'IA2': return 'bg-cyan-500/20 text-cyan-400';
    case 'IA3': return 'bg-teal-500/20 text-teal-400';
    case 'Assignment': return 'bg-purple-500/20 text-purple-400';
    case 'External': return 'bg-pink-500/20 text-pink-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function ApproveMarks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<MarksSubmission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [submissions, setSubmissions] = useState<MarksSubmission[]>([]);

  const refreshData = () => {
    const marks = getMarks();
    const students = getStudents();
    const facultyList = getFaculty();

    // Group marks into "Submissions"
    // Key: subjectCode-examType-section
    const groups: Record<string, any> = {};

    marks.forEach(mark => {
        const student = students.find(s => s.id === mark.studentId);
        if (!student) return;

        const key = `${mark.subjectCode}-${mark.examType}-${student.section}`;
        if (!groups[key]) {
            const faculty = facultyList.find(f => f.id === mark.submittedBy);
            groups[key] = {
                id: key,
                subject: mark.subjectCode, // Fallback if name not available, or we could fetch from syllabus
                subjectCode: mark.subjectCode,
                faculty: faculty?.name || 'Unknown Faculty',
                class: student.batch,
                section: student.section,
                examType: mark.examType,
                submittedAt: (mark.createdAt || mark.date || new Date().toISOString()).split('T')[0],
                verifiedBy: mark.verifiedBy || '',
                verifiedAt: (mark.updatedAt || mark.date || new Date().toISOString()).split('T')[0],
                status: mark.status, // We assume all marks in a group have same status
                studentCount: 0,
                totalScore: 0,
                maxScore: mark.maxMarks,
                rawMarks: []
            };
        }

        groups[key].studentCount++;
        groups[key].totalScore += mark.marks;
        groups[key].rawMarks.push(mark);

        // Final status should be the "highest" state if mixed, but usually they move together
        // For ApproveMarks, we care about 'verified' (waiting for admin) or 'approved'
        if (mark.status === 'verified') groups[key].status = 'verified';
        else if (mark.status === 'submitted' && groups[key].status !== 'verified') groups[key].status = 'pending';
    });

    const processed = Object.values(groups).map((g: any) => ({
        ...g,
        avgScore: g.studentCount > 0 ? parseFloat((g.totalScore / g.studentCount).toFixed(1)) : 0
    }));

    setSubmissions(processed);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const stats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    verified: submissions.filter(s => s.status === 'verified').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    submission.rawMarks.forEach(mark => {
        updateMarkStatus(mark.id, 'approved', 'Admin');
    });

    toast.success(`Approved marks for ${submission.subjectCode} - Section ${submission.section}`);
    refreshData();
  };

  const handleReject = (id: string) => {
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;

    submission.rawMarks.forEach(mark => {
        updateMarkStatus(mark.id, 'submitted', 'Admin'); // Sends back to tutor or faculty
    });

    toast.error(`Rejected marks for ${submission.subjectCode} - Section ${submission.section}`);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Approve Marks
        </h1>
        <p className="text-muted-foreground mt-1">Review and approve internal assessment marks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Verification', value: stats.pending, icon: AlertTriangle, color: 'from-orange-500 to-amber-500' },
          { label: 'Awaiting Approval', value: stats.verified, icon: Clock, color: 'from-amber-500 to-yellow-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-rose-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({stats.pending + stats.verified})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, faculty, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submissions Grid */}
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredSubmissions
                .filter(s => s.status === 'pending' || s.status === 'verified')
                .map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-all">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{submission.subject}</h3>
                                <Badge variant="outline">{submission.subjectCode}</Badge>
                                <Badge className={getExamTypeBadge(submission.examType)}>
                                  {submission.examType}
                                </Badge>
                                <Badge className={getStatusBadge(submission.status)}>
                                  {getStatusIcon(submission.status)}
                                  <span className="ml-1 capitalize">{submission.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {submission.faculty} • {submission.class} - Section {submission.section}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {submission.studentCount} students
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Avg: {submission.avgScore}/{submission.maxScore}
                                </span>
                                <span>Submitted: {submission.submittedAt}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            {submission.status === 'verified' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                                  onClick={() => handleApprove(submission.id)}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleReject(submission.id)}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {submission.status === 'verified' && (
                          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-400">
                              <CheckCircle2 className="w-4 h-4 inline mr-2" />
                              Verified by {submission.verifiedBy} on {submission.verifiedAt}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="glass-card border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Approved On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions
                    .filter(s => s.status === 'approved')
                    .map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="font-medium">{sub.subject}</div>
                          <div className="text-xs text-muted-foreground">{sub.subjectCode}</div>
                        </TableCell>
                        <TableCell>{sub.faculty}</TableCell>
                        <TableCell>{sub.class} - {sub.section}</TableCell>
                        <TableCell>
                          <Badge className={getExamTypeBadge(sub.examType)}>{sub.examType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(sub.avgScore / sub.maxScore) * 100} className="w-16 h-2" />
                            <span className="text-sm">{sub.avgScore}/{sub.maxScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>{sub.verifiedAt}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              {submissions.filter(s => s.status === 'rejected').length === 0 ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rejected submissions</p>
                </div>
              ) : (
                submissions
                  .filter(s => s.status === 'rejected')
                  .map((sub) => (
                    <div key={sub.id} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{sub.subject} ({sub.subjectCode})</h4>
                          <p className="text-sm text-muted-foreground">{sub.faculty}</p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="glass-card border-white/10 max-w-4xl">
          <DialogHeader>
            <DialogTitle>Marks Details - {selectedSubmission?.subject}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-muted-foreground">Subject Code</p>
                  <p className="font-medium">{selectedSubmission.subjectCode}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-muted-foreground">Exam Type</p>
                  <p className="font-medium">{selectedSubmission.examType}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="font-medium">{selectedSubmission.studentCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-muted-foreground">Average Score</p>
                  <p className="font-medium">{selectedSubmission.avgScore}/{selectedSubmission.maxScore}</p>
                </div>
              </div>
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const bins = [0, 0, 0, 0, 0];
                    selectedSubmission.rawMarks.forEach(m => {
                      const percentage = (m.marks / m.maxMarks) * 100;
                      if (percentage <= 20) bins[0]++;
                      else if (percentage <= 40) bins[1]++;
                      else if (percentage <= 60) bins[2]++;
                      else if (percentage <= 80) bins[3]++;
                      else bins[4]++;
                    });
                    const maxBin = Math.max(...bins, 1);
                    return (
                      <>
                        <div className="h-32 flex items-end justify-around gap-2">
                          {bins.map((count, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${(count / maxBin) * 100}%` }}
                              transition={{ delay: i * 0.1 }}
                              className="w-12 bg-gradient-to-t from-primary to-accent rounded-t relative group"
                            >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] bg-popover px-1 rounded border">
                                {count} students
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="flex justify-around mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                          {['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'].map((range) => (
                            <span key={range}>{range}</span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
