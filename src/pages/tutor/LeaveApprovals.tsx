import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  MessageSquare,
  FileText,
  AlertCircle,
  Filter,
  ChevronRight,
  TrendingUp, // Added for consistency
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // Added import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getLeaveRequests, updateLeaveStatus, LeaveRequest, getTutors, Tutor, getStudents } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

export default function LeaveApprovals({ filterType }: { filterType?: 'leave' | 'od' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorInfo, setTutorInfo] = useState<Tutor | null>(null);

  useEffect(() => {
    if (user) {
      const tutors = getTutors();
      const current = tutors.find(t => t.email === user.email);
      if (current) setTutorInfo(current);
    }
    loadRequests();
  }, [user]);

  const loadRequests = () => {
    setRequests(getLeaveRequests().reverse());
    setLoading(false);
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    if (!user) return;
    const status = action === 'approve' ? 'approved' : 'rejected';
    updateLeaveStatus(id, status, user.name);
    
    toast.success(action === 'approve' ? "Leave Approved" : "Leave Rejected");
    loadRequests();
  };

  // Calculate cutoff date (6 months ago)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get unique batches for filter
  const uniqueBatches = Array.from(new Set(getStudents().map(s => s.batch))).sort();

  const filteredRequests = requests
    .filter(r => {
        const requestDate = new Date(r.startDate); // Assuming startDate is consistent
        if (activeTab === 'current') {
            return requestDate >= sixMonthsAgo;
        } else {
            return requestDate < sixMonthsAgo;
        }
    })
    .filter(r => {
        // Status Filter
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        
        // Batch Filter
        if (batchFilter !== 'all') {
            const students = getStudents();
            const student = students.find(s => s.id === r.userId);
            if (!student || student.batch !== batchFilter) return false;
        }

        return true;
    })
    .filter(r => {
      // Filter by tutor's assigned students if tutorInfo is available
      if (!tutorInfo) return true;
      const students = getStudents();
      const applicant = students.find(s => s.id === r.userId);
      if (!applicant) return true; // fallback
      if (!applicant) return true; // fallback
      return applicant.batch === tutorInfo.batch && applicant.section === tutorInfo.section;
    })
    .filter(r => {
        if (!filterType) return true;
        // Assuming 'type' field in LeaveRequest contains 'Leave' or 'OD'. 
        // Adapting match based on data. Case insensitive check.
        return r.type.toLowerCase().includes(filterType.toLowerCase());
    });
    
  // Stats Calculation
  const stats = {
      pending: requests.filter(r => (!filterType || r.type.toLowerCase().includes(filterType.toLowerCase())) && r.status === 'pending').length,
      approved: requests.filter(r => (!filterType || r.type.toLowerCase().includes(filterType.toLowerCase())) && r.status === 'approved').length,
      rejected: requests.filter(r => (!filterType || r.type.toLowerCase().includes(filterType.toLowerCase())) && r.status === 'rejected').length,
  };

  if (loading) return <div className="p-8 text-center uppercase tracking-widest text-xs font-bold animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">
            {filterType === 'od' ? 'On-Duty (OD) Portal 🏃' : filterType === 'leave' ? 'Student Leave Portal 🏥' : 'Leave & OD Portal'}
          </h1>
          <p className="text-muted-foreground font-medium">Manage and approve {filterType ? filterType.toUpperCase() : 'leave'} requests for {tutorInfo ? `${tutorInfo.batch} - ${tutorInfo.section}` : 'your classes'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>

            <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {uniqueBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={activeTab === 'current' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('current')}
            className="rounded-lg font-bold"
          >
            Current Semester
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('history')}
            className="rounded-lg font-bold"
          >
            History
          </Button>

        </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-pink-500' },
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
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>




      <div className="glass-card rounded-2xl border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px] font-bold">S.No</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Register No.</TableHead>
              <TableHead className="font-bold">Batch & Year</TableHead>
              <TableHead className="font-bold">Current Sem</TableHead>
              <TableHead className="font-bold">Tutor</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((request, index) => {
                const students = getStudents();
                const student = students.find(s => s.id === request.userId);
                const tutors = getTutors();
                const tutor = student ? tutors.find(t => t.batch === student.batch && t.section === student.section) : null;
                
                return (
                  <motion.tr
                    key={request.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-lg">
                          <AvatarFallback className="rounded-lg">{request.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-sm">{request.userName}</p>
                            <p className="text-xs text-muted-foreground">{request.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-xs font-mono">{student?.rollNumber || 'N/A'}</TableCell>
                    <TableCell>
                        <div className="text-xs">
                            <p className="font-bold">{student?.batch || 'N/A'}</p>
                            <p className="text-muted-foreground">Year {student?.year || '-'}</p>
                        </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs">Sem {student?.semester || '-'}</TableCell>
                    <TableCell className="text-xs font-medium">{tutor?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'} 
                             className={`uppercase text-[10px] font-black ${request.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => {
                                // View logic mock
                                toast.info(`Reason: ${request.reason}`);
                            }}>
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleAction(request.id, 'approve')}>
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleAction(request.id, 'reject')}>
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground mr-2">
                           {request.processedBy ? `By ${request.processedBy.split(' ')[0]}` : '-'}
                        </span>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filteredRequests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        No requests found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
