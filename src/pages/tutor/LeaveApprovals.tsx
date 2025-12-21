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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { getData, updateItem } from '@/lib/data-store';

const LEAVE_REQUESTS_KEY = 'college_portal_leave_requests';

interface LeaveRequest {
  id: string;
  student: string;
  rollNo: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  photo: string;
}

export default function LeaveApprovals() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const data = getData<LeaveRequest>(LEAVE_REQUESTS_KEY);
    setRequests(data);
    setLoading(false);
  };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    updateItem<LeaveRequest>(LEAVE_REQUESTS_KEY, id, { status: newStatus });
    
    toast({
      title: action === 'approve' ? "Leave Approved" : "Leave Rejected",
      description: `Request ${id} has been ${action}d successfully.`,
      variant: action === 'approve' ? "default" : "destructive",
    });
    
    loadRequests();
  };

  const filteredRequests = activeTab === 'pending' 
    ? requests.filter(r => r.status === 'pending')
    : requests.filter(r => r.status !== 'pending');

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Leave Portal 🏥</h1>
          <p className="text-muted-foreground">Manage and approve student leave requests</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={activeTab === 'pending' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="rounded-lg"
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('history')}
            className="rounded-lg"
          >
            History
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden group"
            >
              {request.status === 'approved' && (
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant="success" className="rounded-full">Approved</Badge>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-14 h-14 border-4 border-primary/10 group-hover:border-primary/30 transition-all">
                    <AvatarImage src={request.photo} />
                    <AvatarFallback>{request.student.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {request.student}
                      <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        {request.rollNo}
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        {request.startDate} to {request.endDate} ({request.days} days)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-accent" />
                        {request.type}
                      </div>
                    </div>
                    <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border/50 italic text-sm relative">
                      <MessageSquare className="w-4 h-4 absolute -left-2 -top-2 text-primary opacity-50" />
                      "{request.reason}"
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex lg:flex-col justify-end gap-2 lg:min-w-[140px]">
                    <Button 
                      variant="success" 
                      className="flex-1 lg:w-full"
                      onClick={() => handleAction(request.id, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 lg:w-full border-destructive/20 text-destructive hover:bg-destructive/10"
                        onClick={() => handleAction(request.id, 'reject')}
                      >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-card rounded-2xl"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold">No Pending Requests</h3>
            <p className="text-muted-foreground">You're all caught up! Great job.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
