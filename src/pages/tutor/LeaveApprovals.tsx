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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getLeaveRequests, updateLeaveStatus, LeaveRequest, getTutors, Tutor, getStudents } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

export default function LeaveApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
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

  const filteredRequests = requests
    .filter(r => activeTab === 'pending' ? r.status === 'pending' : r.status !== 'pending')
    .filter(r => {
      // Filter by tutor's assigned students if tutorInfo is available
      if (!tutorInfo) return true;
      const students = getStudents();
      const applicant = students.find(s => s.id === r.userId);
      if (!applicant) return true; // fallback
      return applicant.batch === tutorInfo.batch && applicant.section === tutorInfo.section;
    });

  if (loading) return <div className="p-8 text-center uppercase tracking-widest text-xs font-bold animate-pulse">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">Tutor Leave Portal 🏥</h1>
          <p className="text-muted-foreground font-medium">Manage and approve leave requests for {tutorInfo ? `${tutorInfo.batch} - ${tutorInfo.section}` : 'your classes'}</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={activeTab === 'pending' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="rounded-lg font-bold"
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
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
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16 border-4 border-primary/10 group-hover:border-primary/30 transition-all rounded-2xl">
                    <AvatarFallback className="font-bold text-xl">{request.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">{request.userName}</h3>
                      <Badge variant="secondary" className="text-[10px] font-black uppercase bg-accent/10 text-accent border-accent/20 tracking-widest">
                        {request.type}
                      </Badge>
                      {request.status !== 'pending' && (
                          <Badge variant={request.status === 'approved' ? 'success' : 'destructive'} className="uppercase text-[9px] font-black">
                              {request.status}
                          </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{request.startDate}</span> <ChevronRight className="w-3 h-3" /> <span className="text-foreground">{request.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-500">
                        <User className="w-4 h-4" />
                        {request.contact}
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-muted/30 border border-border/50 relative group/reason">
                      <div className="flex items-center gap-2 mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        Reason for Leave
                      </div>
                      <p className="text-sm leading-relaxed italic text-foreground/80 font-medium">
                        "{request.reason}"
                      </p>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex lg:flex-col justify-end gap-3 lg:min-w-[160px]">
                    <Button 
                      variant="gradient" 
                      className="flex-1 lg:w-full shadow-glow-sm font-bold uppercase text-xs tracking-widest"
                      onClick={() => handleAction(request.id, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 lg:w-full border-destructive/20 text-destructive hover:bg-destructive/10 font-bold uppercase text-xs tracking-widest"
                      onClick={() => handleAction(request.id, 'reject')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {request.status !== 'pending' && (
                    <div className="flex flex-col justify-center items-end text-right lg:min-w-[160px]">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">Processed By</p>
                        <p className="font-bold text-sm">{request.processedBy}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(request.processedDate || '').toLocaleDateString()}</p>
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
            className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-white/5"
          >
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border/50">
              <CheckCircle className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground/50 uppercase tracking-widest">No Requests Found</h3>
            <p className="text-muted-foreground/60 max-w-sm mx-auto text-sm">
                Classes are healthy! No pending applications for your section.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
