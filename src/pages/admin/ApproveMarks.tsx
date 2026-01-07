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

import { toast } from 'sonner';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-config';

interface MarksSubmission {
  subjectName: string;
  subjectCode: string;
  sectionId: number;
  sectionName: string;
  batchName: string;
  examType: string;
  scheduleId: number;
  facultyName: string;
  tutorName: string;
  studentCount: number;
  pendingCount: number;
  submittedAt: string;
  markStatus: string;
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
    case 'pending_admin': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
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
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<MarksSubmission | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [submissions, setSubmissions] = useState<MarksSubmission[]>([]);

  const refreshData = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/approval-status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setSubmissions(data);
        }
    } catch (error) {
        console.error("Fetch Approval Error", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const stats = {
    pending: submissions.filter(s => s.markStatus === 'pending_admin').length,
    approved: submissions.filter(s => s.markStatus === 'approved').length,
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simplification for now: matches all
    const matchesStatus = statusFilter === 'all' || sub.markStatus === statusFilter;
    const matchesBatch = batchFilter === 'all' || sub.batchName === batchFilter;
    const matchesExam = examFilter === 'all' || sub.examType === examFilter;
    return matchesSearch && matchesStatus && matchesBatch && matchesExam;
  });

  const uniqueBatches = Array.from(new Set(submissions.map(s => s.batchName)));

  const handleApprove = async (sub: MarksSubmission) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                scheduleId: sub.scheduleId,
                sectionId: sub.sectionId,
                subjectCode: sub.subjectCode
            })
        });

        if (res.ok) {
            toast.success(`Approved marks for ${sub.subjectCode} - Section ${sub.sectionName}`);
            refreshData();
        } else {
            toast.error("Failed to approve marks");
        }
    } catch (e) {
        toast.error("Network error");
    }
  };

  const handleReject = async (id: string) => {
    // Rejection not implemented in backend yet, keep as placeholder
    toast.error(`Rejection feature coming soon.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Approve Marks
          </h1>
          <p className="text-muted-foreground mt-1">Review and approve internal assessment marks</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={viewMode === 'current' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('current')}
            className="rounded-lg font-bold"
          >
            Current Semester
          </Button>
          <Button 
            variant={viewMode === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('history')}
            className="rounded-lg font-bold"
          >
            History
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {[
          { label: 'Awaiting Approval', value: stats.pending, icon: Clock, color: 'from-amber-500 to-yellow-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
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

      {/* Table Section */}
      <Card className="glass-card border-white/10">
         <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <CardTitle>Marks Submissions</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending_admin">Awaiting Approval</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>

                    </Select>
                    <Select value={batchFilter} onValueChange={setBatchFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Batch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {uniqueBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={examFilter} onValueChange={setExamFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Examination" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            <SelectItem value="CIA 1">CIA 1</SelectItem>
                            <SelectItem value="CIA 2">CIA 2</SelectItem>
                            <SelectItem value="CIA 3">CIA 3</SelectItem>
                            <SelectItem value="Model Exam">Model Exam</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
         </CardHeader>
         <CardContent className="p-0">
             <Table>
                 <TableHeader>
                      <TableRow>
                          <TableHead>Batch</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Subject Code</TableHead>
                          <TableHead>Examination</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Tutor (Verified By)</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                 </TableHeader>
                 <TableBody>
                     {filteredSubmissions.length === 0 ? (
                         <TableRow>
                             <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                 No submissions found
                             </TableCell>
                         </TableRow>
                     ) : (
                          filteredSubmissions.map((sub, idx) => (
                              <TableRow key={`${sub.scheduleId}-${sub.sectionId}-${sub.subjectCode}`}>
                                  <TableCell className="font-medium">{sub.batchName}</TableCell>
                                  <TableCell>{sub.sectionName}</TableCell>
                                  <TableCell>{sub.subjectName}</TableCell>
                                  <TableCell>
                                      <Badge variant="outline">{sub.subjectCode}</Badge>
                                  </TableCell>
                                  <TableCell>
                                      <Badge className={getExamTypeBadge(sub.examType)}>{sub.examType}</Badge>
                                  </TableCell>
                                  <TableCell className="text-xs">{sub.facultyName}</TableCell>
                                  <TableCell className="text-xs">{sub.tutorName || 'Pending'}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Badge className={`mr-2 ${getStatusBadge(sub.markStatus)}`}>
                                            <span className="capitalize">{sub.markStatus.replace('_', ' ')}</span>
                                        </Badge>
                                        
                                        {sub.markStatus === 'pending_admin' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 w-8 p-0"
                                                    onClick={() => handleApprove(sub)}
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                  </TableCell>
                              </TableRow>
                          ))
                     )}
                 </TableBody>
             </Table>
         </CardContent>
      </Card>

    </div>
  );
}


