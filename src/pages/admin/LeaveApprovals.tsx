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
  Search,
  Building2,
  ChevronRight,
  MapPin,
  Eye,
  FileDown,
  MoreHorizontal,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLeaveRequests, updateLeaveStatus, LeaveRequest } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function LeaveApprovals({ filterType = 'leave' }: { filterType?: 'leave' | 'od' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filterType]);

  const loadRequests = async () => {
    try {
      const endpoint = filterType === 'od' ? 'od' : 'leave';
      const response = await fetch(`${API_BASE_URL}/${endpoint}/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading admin requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'revoke', reason?: string) => {
    if (!user) return;
    
    try {
      const endpoint = action === 'approve' ? 'admin-approve' : (action === 'reject' ? 'reject' : 'admin-revoke');
      const apiEndpoint = filterType === 'od' ? 'od' : 'leave';
      
      const response = await fetch(`${API_BASE_URL}/${apiEndpoint}/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: action === 'reject' ? JSON.stringify({ rejection_reason: reason }) : undefined
      });

      if (response.ok) {
        toast.success(`${filterType.toUpperCase()} ${action}d successfully`);
        setIsRejectOpen(false);
        setIsViewOpen(false);
        setRejectionReason('');
        loadRequests();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Error during ${action}`);
    }
  };

  const filteredRequests = requests
    .filter(r => activeTab === 'pending' ? r.status === 'pending_admin' : r.status !== 'pending_admin')
    .filter(r => {
      const name = r.user_name || r.userName || '';
      const roll = r.roll_number || '';
      const type = r.type || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
             type.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) return <div className="p-8 text-center uppercase tracking-widest text-xs font-bold animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight italic">{filterType === 'od' ? 'OD' : 'Leave'} Approval Center 🏢</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">HOD Approval Center for Student Requests</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Button 
            variant={activeTab === 'pending' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="flex-1 sm:flex-none rounded-lg font-bold whitespace-nowrap"
          >
            Pending ({requests.filter(r => r.status === 'pending_admin').length})
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('history')}
            className="flex-1 sm:flex-none rounded-lg font-bold whitespace-nowrap"
          >
            History
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, roll number or type..." 
            className="pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-card transition-all w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[180px] sm:w-[200px] pl-4 sm:pl-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Student Info</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Roll Number</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Batch & Year</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Forwarded</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">From Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">To Date</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right pr-4 sm:pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredRequests
                .map((request) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  key={request.id}
                  className="group border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                   <TableCell className="pl-4 sm:pl-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="w-8 h-8 rounded-lg ring-1 ring-white/10 group-hover:ring-primary/30 transition-all shrink-0">
                        <AvatarFallback className="rounded-lg text-[10px] font-bold bg-primary/10 text-primary">
                            {(request.user_name || request.userName || '?').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                          <p className="font-bold text-xs truncate max-w-[100px] sm:max-w-none">{request.user_name || request.userName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium italic truncate">{request.type}</p>
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
                  <TableCell className="text-center">
                    {request.forwarded_by_name ? (
                        <Badge variant="outline" className="text-[9px] font-black border-amber-500/20 text-amber-500 bg-amber-500/5">
                            {request.forwarded_by_name.split(' ')[0]}
                        </Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground/30">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-foreground/70 whitespace-nowrap">{formatDate(request.startDate)}</TableCell>
                  <TableCell className="text-[10px] font-bold text-foreground/70 whitespace-nowrap">{formatDate(request.endDate)}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : (request.status === 'rejected' ? 'destructive' : (request.status === 'cancel_requested' ? 'outline' : 'outline'))} 
                      className={`uppercase text-[9px] font-black ${
                        request.status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                        request.status === 'cancel_requested' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        request.status === 'cancelled' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : ''
                      }`}
                    >
                        {request.status.replace('_admin', '').replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end items-center gap-1">
                      {request.status === 'pending_admin' && (
                        <div className="flex gap-1 mr-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all"
                            onClick={() => handleAction(request.id, 'approve')}
                          >
                              <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
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
                          
                          {request.status !== 'pending_admin' && (
                            (() => {
                              const canRevoke = new Date(request.startDate) > new Date();
                              return (
                                <DropdownMenuItem 
                                  className={`gap-2 text-[10px] font-bold uppercase tracking-wider rounded-lg mt-0.5 ${canRevoke ? 'text-amber-500 focus:text-amber-500 focus:bg-amber-500/10 cursor-pointer' : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'}`}
                                  onClick={() => canRevoke && handleAction(request.id, 'revoke')}
                                  disabled={!canRevoke}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Revoke Decision
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

            {filteredRequests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg w-[calc(100%-2rem)] rounded-3xl p-0 overflow-hidden border-white/5 glass-card shadow-2xl">
          <div className="p-1 px-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20">
              <div className="bg-card/90 backdrop-blur-xl rounded-[22px] p-6 space-y-6">
                  <DialogHeader>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-2">
                        <Avatar className="w-16 h-16 rounded-2xl border-2 border-primary/20 shrink-0">
                            <AvatarFallback className="text-xl font-black bg-primary/5 text-primary">
                                {selectedRequest ? (selectedRequest.user_name || selectedRequest.userName || '?').charAt(0) : '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                                {selectedRequest?.user_name || selectedRequest?.userName}
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium">{selectedRequest?.roll_number} • {selectedRequest?.batch_id}</p>
                        </div>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-success/5 border border-success/10">
                        <MapPin className="w-4 h-4 text-success" />
                        <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-success/70">Place to Visit</p>
                             <p className="text-sm font-bold text-success">{selectedRequest.placeToVisit || selectedRequest.place_to_visit}</p>
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

                  {selectedRequest?.status === 'pending_admin' && (
                      <DialogFooter className="pt-4 flex flex-col sm:flex-row items-stretch sm:justify-center gap-3">
                          <Button 
                            className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest shadow-glow-primary w-full" 
                            variant="gradient"
                            onClick={() => handleAction(selectedRequest.id, 'approve')}
                          >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Request
                          </Button>
                          <Button 
                            className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5 w-full" 
                            variant="outline"
                            onClick={() => {
                                setIsViewOpen(false);
                                setIsRejectOpen(true);
                            }}
                          >
                              <XCircle className="w-4 h-4 mr-2" />
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
        <DialogContent className="max-w-md w-[calc(100%-2rem)] rounded-3xl border-white/5 glass-card shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Reject Request
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground pt-1">
                Please provide a reason for rejecting this {filterType} request. This will be visible to the student and tutor.
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

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
             <Button variant="ghost" onClick={() => {
                 setIsRejectOpen(false);
                 setRejectionReason('');
             }} className="w-full sm:w-auto rounded-xl font-bold text-xs uppercase tracking-widest h-11 px-6">
                Cancel
             </Button>
             <Button 
                variant="destructive" 
                onClick={() => handleAction(selectedRequest?.id!, 'reject', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="w-full sm:w-auto rounded-xl font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-glow-destructive"
             >
                Reject Request
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
