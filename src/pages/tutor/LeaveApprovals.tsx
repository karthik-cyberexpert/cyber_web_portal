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
  TrendingUp,
  Eye,
  ChevronLeft,
  MapPin,
  FileDown,
  ArrowRight,
  MoreHorizontal,
  RotateCcw
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLeaveRequests, updateLeaveStatus, LeaveRequest, getTutors, Tutor, getStudents } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function LeaveApprovals({ filterType }: { filterType?: 'leave' | 'od' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorInfo, setTutorInfo] = useState<Tutor | null>(null);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user) {
      const tutors = getTutors();
      const current = tutors.find(t => t.email === user.email);
      if (current) setTutorInfo(current);
    }
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/tutor`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'forward' | 'revoke', reason?: string) => {
    if (!user) return;
    
    try {
      let endpoint = action === 'approve' ? 'approve' : (action === 'reject' ? 'reject' : (action === 'forward' ? 'forward' : 'revoke'));
      const apiEndpoint = filterType === 'od' ? 'od' : 'leave';
      
      const response = await fetch(`http://localhost:3007/api/${apiEndpoint}/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: action === 'reject' ? JSON.stringify({ rejection_reason: reason }) : undefined
      });

      if (response.ok) {
        toast.success(`Leave ${action.charAt(0).toUpperCase() + action.slice(1)}ed successfully`);
        setIsRejectOpen(false);
        setIsViewOpen(false);
        setRejectionReason('');
        loadRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} leave`);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Error during ${action}`);
    }
  };

  // Calculate cutoff date (6 months ago)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get unique batches for filter
  const uniqueBatches = Array.from(new Set(getStudents().map(s => s.batch))).sort();

  const filteredRequests = requests
    .filter(r => activeTab === 'current' ? r.status === 'pending' : r.status !== 'pending')
    .filter(r => {
        // Status Filter
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;

        // Batch Filter (from frontend students list if needed, but backend already filters by tutor section)
        if (batchFilter !== 'all' && r.batch_id !== batchFilter) return false;

        return true;
    })
    .filter(r => {
      // Filter by tutor's assigned students if tutorInfo is available
      if (!tutorInfo) return true;
      const students = getStudents();
      const applicant = students.find(s => s.id === r.userId);
      if (!applicant) return true; // fallback
      return applicant.batch === tutorInfo.batch && applicant.section === tutorInfo.section;
    })
    .filter(r => {
        if (!filterType) return true;
        // Assuming 'type' field in LeaveRequest contains 'Leave' or 'OD'.
        // Adapting match based on data. Case insensitive check.
        return r.type.toLowerCase().includes(filterType.toLowerCase());
    });

  const displayRequests = filteredRequests.map(r => ({
    ...r,
    userName: r.user_name || r.userName || 'Unknown Student'
  }));

  // Stats Calculation
  const stats = {
      pending: requests.filter(r => (r.status as string) === 'pending' || (r.status as string) === 'cancel_requested').length,
      forwarded: requests.filter(r => (r.status as string) === 'pending_admin').length,
      approved: requests.filter(r => (r.status as string) === 'approved').length,
      rejected: requests.filter(r => (r.status as string) === 'rejected').length,
      cancelled: requests.filter(r => (r.status as string) === 'cancelled').length,
  };

  if (loading) return <div className="p-8 text-center uppercase tracking-widest text-xs font-bold animate-pulse">Loading requests...</div>;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic tracking-tight uppercase">
            <span className="text-primary">{filterType || 'Leave'}</span> Approval Portal 📑
          </h1>
          <p className="text-muted-foreground font-medium text-xs tracking-widest uppercase">
            Manage and Review Student Applications
          </p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-2xl border border-white/5">
          <Button 
            variant={activeTab === 'current' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('current')}
            className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            Current Requests
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('history')}
            className="rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            History (6M+)
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending/Cancel', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Forwarded', value: stats.forwarded, icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Cancelled', value: stats.cancelled, icon: RotateCcw, color: 'text-slate-500', bg: 'bg-slate-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-white/5 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-black italic">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-muted/50 border-white/5 font-bold text-xs uppercase tracking-widest">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/5 glass-card font-bold text-xs">
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-muted/50 border-white/5 font-bold text-xs uppercase tracking-widest">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/5 glass-card font-bold text-xs">
              <SelectItem value="all">Batch: All</SelectItem>
              {uniqueBatches.map(batch => (
                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[200px] pl-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Info</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Roll Number</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Batch & Year</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From Date</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To Date</TableHead>
              <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode='popLayout'>
            {displayRequests.map((request) => (
              <motion.tr
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key={request.id}
                className="group border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 rounded-lg ring-1 ring-white/10 group-hover:ring-primary/30 transition-all">
                      <AvatarFallback className="rounded-lg text-[10px] font-bold bg-primary/10 text-primary">
                          {request.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-bold text-xs truncate whitespace-nowrap">{request.userName}</p>
                        <p className="text-[10px] text-muted-foreground font-medium italic">{request.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[10px] font-bold tracking-tighter text-muted-foreground">{request.roll_number || 'N/A'}</TableCell>
                <TableCell>
                    <div className="text-[10px]">
                        <p className="font-black text-primary/80">{request.batch_name || request.batch_id || 'N/A'}</p>
                        <p className="text-muted-foreground/70 font-bold uppercase tracking-tighter">Year {request.current_semester ? Math.ceil(request.current_semester / 2) : '1'}</p>
                    </div>
                </TableCell>
                <TableCell className="text-[10px] font-bold text-foreground/70">{formatDate(request.startDate)}</TableCell>
                <TableCell className="text-[10px] font-bold text-foreground/70">{formatDate(request.endDate)}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={request.status === 'approved' ? 'default' : (request.status === 'rejected' ? 'destructive' : (request.status === 'pending_admin' ? 'secondary' : (request.status === 'cancel_requested' ? 'outline' : 'outline')))} 
                    className={`uppercase text-[9px] font-black ${
                      request.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      request.status === 'pending_admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      request.status === 'cancel_requested' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      request.status === 'cancelled' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : ''
                    }`}
                  >
                      {request.status === 'pending_admin' ? 'Forwarded' : request.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end items-center gap-1">
                    {(request.status === 'pending' || request.status === 'cancel_requested') && (
                      <div className="flex gap-1 mr-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title={request.status === 'cancel_requested' ? "Approve Cancellation" : "Approve Request"}
                          className={`h-7 w-7 rounded-full transition-all ${request.status === 'cancel_requested' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                          onClick={() => handleAction(request.id, 'approve')}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        {request.status === 'pending' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            title="Forward to Admin"
                            className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"
                            onClick={() => handleAction(request.id, 'forward')}
                          >
                              <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title={request.status === 'cancel_requested' ? "Reject Cancellation" : "Reject Request"}
                          className="h-7 w-7 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          onClick={() => {
                              setSelectedRequest(request);
                              setIsRejectOpen(true);
                          }}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10 p-1 min-w-[120px]">
                        <DropdownMenuItem 
                          className="gap-2 text-[10px] font-bold uppercase tracking-wider text-primary focus:text-primary focus:bg-primary/10 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsViewOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </DropdownMenuItem>
                        
                        {(request.status === 'approved' || request.status === 'rejected') && (
                          (() => {
                            const canRevoke = 
                              new Date(request.startDate) > new Date() && 
                              request.approved_by !== 'Admin' && 
                              (request.working_days || 0) < 2;
                            return (
                              <DropdownMenuItem 
                                className={`gap-2 text-[10px] font-bold uppercase tracking-wider rounded-lg mt-0.5 ${canRevoke ? 'text-amber-500 focus:text-amber-500 focus:bg-amber-500/10 cursor-pointer' : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'}`}
                                onClick={() => canRevoke && handleAction(request.id, 'revoke')}
                                disabled={!canRevoke}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {request.approved_by === 'Admin' ? 'Admin Approved' : (request.working_days || 0) >= 2 ? 'Long Duration' : 'Revoke Action'}
                              </DropdownMenuItem>
                            );
                          })()
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
            </AnimatePresence>

            {displayRequests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                            <FileText className="w-8 h-8 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No requests found</p>
                        </div>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-white/5 glass-card shadow-2xl">
          <div className="p-1 px-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20">
              <div className="bg-card/90 backdrop-blur-xl rounded-[22px] p-6 space-y-6">
                  <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Avatar className="w-14 h-14 rounded-2xl border-2 border-primary/20">
                            <AvatarFallback className="text-xl font-black bg-primary/5 text-primary">
                                {selectedRequest ? (selectedRequest.user_name || selectedRequest.userName || '?').charAt(0) : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                {selectedRequest?.user_name || selectedRequest?.userName}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium">{selectedRequest?.roll_number} • {selectedRequest?.batch_id}</p>
                        </div>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-3 rounded-2xl bg-muted/30 border border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">From Date</p>
                          <p className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {formatDate(selectedRequest?.startDate)}
                          </p>
                      </div>
                      <div className="space-y-1 p-3 rounded-2xl bg-muted/30 border border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">To Date</p>
                          <p className="text-sm font-bold flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {formatDate(selectedRequest?.endDate)}
                          </p>
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        Details & Purpose
                      </p>
                      <div className="p-4 rounded-2xl bg-muted/30 border border-white/5 italic text-sm font-medium leading-relaxed text-foreground/80">
                        "{selectedRequest?.reason}"
                      </div>
                  </div>

                  {filterType === 'od' && (selectedRequest?.placeToVisit || selectedRequest?.place_to_visit) && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70">Place to Visit</p>
                             <p className="text-sm font-bold text-emerald-500">{selectedRequest.placeToVisit || selectedRequest.place_to_visit}</p>
                        </div>
                    </div>
                  )}

                  {selectedRequest?.proofUrl && (
                      <div className="pt-2">
                          <Button variant="outline" className="w-full rounded-2xl border-primary/10 hover:bg-primary/5 h-12 gap-2 text-xs font-bold" onClick={() => window.open(selectedRequest.proofUrl, '_blank')}>
                              <FileDown className="w-4 h-4 text-primary" />
                              View Attachment / Proof Document
                          </Button>
                      </div>
                  )}

                  {selectedRequest?.status === 'pending' && (
                    <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-1 gap-2">
                        <Button 
                          className="flex-1 rounded-2xl h-11 font-bold uppercase text-[9px] tracking-widest bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald" 
                          onClick={() => handleAction(selectedRequest.id, 'approve')}
                        >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Approve
                        </Button>
                        <Button 
                          className="flex-1 rounded-2xl h-11 font-bold uppercase text-[9px] tracking-widest bg-amber-500 hover:bg-amber-600 shadow-glow-amber text-white" 
                          onClick={() => handleAction(selectedRequest.id, 'forward')}
                        >
                            <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                            Forward
                        </Button>
                      </div>
                      <Button 
                        className="w-full sm:w-auto px-6 rounded-2xl h-11 font-bold uppercase text-[9px] tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5" 
                        variant="outline"
                        onClick={() => {
                            setIsViewOpen(false);
                            setIsRejectOpen(true);
                        }}
                      >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                      </Button>
                    </DialogFooter>
                  )}
                  
                  {selectedRequest?.status === 'rejected' && selectedRequest?.rejection_reason && (
                    <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-destructive/70 mb-1">Rejection Reason</p>
                        <p className="text-xs font-bold text-destructive italic">"{selectedRequest.rejection_reason}"</p>
                    </div>
                  )}
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-white/5 glass-card shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Reject Request
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground pt-1">
                Please provide a reason for rejecting this request. This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
                placeholder="Type your reason here..." 
                className="rounded-2xl bg-muted/30 border-white/5 focus:ring-1 focus:ring-red-500/50 min-h-[100px] text-sm font-medium italic"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="ghost" onClick={() => {
                 setIsRejectOpen(false);
                 setRejectionReason('');
             }} className="rounded-xl font-bold text-xs uppercase tracking-widest h-11 px-6">
                Cancel
             </Button>
             <Button 
                variant="destructive" 
                onClick={() => handleAction(selectedRequest?.id!, 'reject', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="rounded-xl font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-glow-destructive"
             >
                Reject Request
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
