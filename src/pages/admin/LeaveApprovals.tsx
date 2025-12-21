import React from 'react';
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
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

const leaveRequests = [
  { 
    id: '1', 
    student: 'Arun Prasath', 
    rollNo: '21CS001', 
    batch: '2021-2025',
    section: 'CSE-A',
    tutor: 'Prof. Lakshmi',
    type: 'Medical', 
    startDate: '2024-03-20', 
    endDate: '2024-03-22', 
    days: 3, 
    reason: 'Severe fever and doctor advised rest.',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop'
  },
  { 
    id: '2', 
    student: 'Priya Sharma', 
    rollNo: '21CS045', 
    batch: '2021-2025',
    section: 'CSE-B',
    tutor: 'Dr. Ramesh',
    type: 'Family Function', 
    startDate: '2024-03-25', 
    endDate: '2024-03-25', 
    days: 1, 
    reason: "Sister's wedding engagement ceremony.",
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
  },
  { 
    id: '3', 
    student: 'Suresh Kumar', 
    rollNo: '22CS089', 
    batch: '2022-2026',
    section: 'CSE-C',
    tutor: 'Mr. Senthil',
    type: 'On Duty', 
    startDate: '2024-03-21', 
    endDate: '2024-03-24', 
    days: 4, 
    reason: 'National level Hackathon at Anna University.',
    status: 'pending',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  },
  { 
    id: '4', 
    student: 'Karthik Raja', 
    rollNo: '21CS023', 
    batch: '2021-2025',
    section: 'CSE-A',
    tutor: 'Prof. Lakshmi',
    type: 'On Duty', 
    startDate: '2024-03-21', 
    endDate: '2024-03-21', 
    days: 1, 
    reason: 'Inter-college symposium at IIT Madras.',
    status: 'approved',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  { 
    id: '5', 
    student: 'Meena Kumari', 
    rollNo: '23CS012', 
    batch: '2023-2027',
    section: 'CSE-A',
    tutor: 'Dr. Priya',
    type: 'Medical', 
    startDate: '2024-03-18', 
    endDate: '2024-03-19', 
    days: 2, 
    reason: 'Dental appointment for surgery.',
    status: 'approved',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
  }
];

export default function LeaveApprovals() {
  const [activeTab, setActiveTab] = React.useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    toast({
      title: action === 'approve' ? "Leave Approved by Admin" : "Leave Rejected by Admin",
      description: `Request ${id} has been ${action}d at department level.`,
      variant: action === 'approve' ? "default" : "destructive",
    });
  };

  const filteredRequests = leaveRequests
    .filter(r => activeTab === 'pending' ? r.status === 'pending' : r.status !== 'pending')
    .filter(r => 
      r.student.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">Department Leave Portal 🏢</h1>
          <p className="text-muted-foreground font-medium">HOD Approval Center for Student Requests</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={activeTab === 'pending' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="rounded-lg"
          >
            Pending ({leaveRequests.filter(r => r.status === 'pending').length})
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

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, roll no, or section..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-xl">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
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
                  <Badge variant="success" className="rounded-full px-4 py-1">Approved by HOD</Badge>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16 border-4 border-primary/10 group-hover:border-primary/30 transition-all rounded-2xl">
                    <AvatarImage src={request.photo} />
                    <AvatarFallback>{request.student.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">{request.student}</h3>
                      <Badge variant="outline" className="text-xs bg-primary/5">{request.rollNo}</Badge>
                      <Badge variant="secondary" className="text-xs font-semibold bg-accent/10 text-accent border-accent/20">
                        {request.batch} • {request.section}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{request.startDate}</span> to <span className="font-semibold">{request.endDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-warning" />
                        {request.days} Day(s)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-info" />
                        Tutor: {request.tutor}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        {request.type}
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-muted/30 border border-border/50 relative group/reason">
                      <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                        <MessageSquare className="w-3 h-3 text-primary" />
                        Reason for Leave
                      </div>
                      <p className="text-sm leading-relaxed italic text-foreground/80">
                        "{request.reason}"
                      </p>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex lg:flex-col justify-end gap-3 lg:min-w-[160px]">
                    <Button 
                      variant="gradient" 
                      className="flex-1 lg:w-full shadow-glow-sm"
                      onClick={() => handleAction(request.id, 'approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      HOD Approve
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
            className="text-center py-20 glass-card rounded-2xl border-dashed"
          >
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border/50">
              <FileText className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-2xl font-bold text-muted-foreground/50">No Requests Found</h3>
            <p className="text-muted-foreground/60 max-w-sm mx-auto">
              {searchQuery ? `No leave requests matching "${searchQuery}"` : "The department is currently clear of pending leave applications."}
            </p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
