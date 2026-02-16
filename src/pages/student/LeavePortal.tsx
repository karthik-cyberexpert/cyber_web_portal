import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  ArrowRight,
  FileText,
  UserCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getStudents, Student, getLeaveRequests, addLeaveRequest, LeaveRequest } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { DatePicker } from '@/components/ui/date-picker';
import { API_BASE_URL } from '@/lib/api-config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeavePortal() {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    type: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
    durationType: 'Full-Day'
  });

  const [fileAttached, setFileAttached] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch student data
          const students = getStudents();
          const current = students.find(s => s.email === user.email);
          if (current) setStudentData(current);
          
          // Fetch leave history from backend
          const historyResponse = await fetch(`${API_BASE_URL}/leave/my-requests`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (historyResponse.ok) {
            const history = await historyResponse.json();
            setLeaveHistory(history);
          }
        } catch (error) {
          console.error('Error fetching leave details:', error);
          toast.error('Failed to load leave history');
        }
      }
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.startDate || !formData.endDate || !formData.reason) {
        toast.error("Please fill in all required fields");
        return;
    }

    // Date Range Validation
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast.error("End date cannot be before Start date");
        return;
    }

    // Conditional File Upload Validation
    if (['Sick', 'Medical'].includes(formData.type) && !fileAttached) {
        toast.error(`Document attachment is required for ${formData.type}`);
        return;
    }

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('category', formData.type);
        formDataToSend.append('start_date', formData.startDate);
        formDataToSend.append('end_date', formData.endDate);
        formDataToSend.append('duration_type', formData.durationType);
        formDataToSend.append('reason', formData.reason);
        formDataToSend.append('is_half_day', String(formData.durationType !== 'Full-Day'));
        formDataToSend.append('session', formData.durationType);

        // Append file if exists
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput?.files?.[0]) {
            formDataToSend.append('file', fileInput.files[0]);
        }

        // Call backend API
        const response = await fetch(`${API_BASE_URL}/leave/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formDataToSend
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error(data.error || 'Failed to submit leave request');
            return;
        }

        toast.success(`Leave request submitted! (${data.working_days} working days)`);
        setShowApply(false);
        
        // Refresh leave history
        const historyResponse = await fetch(`${API_BASE_URL}/leave/my-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const history = await historyResponse.json();
        setLeaveHistory(history);

        setFormData({
            type: 'Casual',
            startDate: '',
            endDate: '',
            reason: '',
            durationType: 'Full-Day'
        });
        setFileAttached(false);
    } catch (error) {
        console.error('Error submitting leave:', error);
        toast.error('Failed to submit leave request');
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/${id}/cancel-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to request cancellation');
        return;
      }

      toast.success(data.message);
      
      // Refresh list
      const historyResponse = await fetch(`${API_BASE_URL}/leave/my-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const history = await historyResponse.json();
      setLeaveHistory(history);
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast.error('Failed to request cancellation');
    }
  };

  const isGraduated = studentData?.status === 'Graduated';
  const isFileUploadRequired = ['Sick', 'Medical'].includes(formData.type);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'forwarded_to_admin': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancel_requested': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border-muted-foreground/20';
      case 'forwarded_to_admin': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const leaveBalance = [
    { label: "Sick Leave", used: leaveHistory.filter((l: any) => (l.type === 'Sick' || l.category === 'Sick') && l.status === 'approved').length, total: 10, color: "bg-primary" },
    { label: "Casual Leave", used: leaveHistory.filter((l: any) => (l.type === 'Casual' || l.category === 'Casual') && l.status === 'approved').length, total: 8, color: "bg-accent" },
    { label: "On Duty", used: leaveHistory.filter((l: any) => (l.type?.includes('On Duty') || l.category?.includes('On Duty') || l.type?.includes('Academic') || l.category?.includes('Academic') || l.type?.includes('Sports') || l.category?.includes('Sports')) && l.status === 'approved').length, total: 15, color: "bg-success" },
  ];

  // Pagination logic
  const totalPages = Math.ceil(leaveHistory.length / itemsPerPage);
  const paginatedHistory = leaveHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Leave Portal</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Request leave and track approval status</p>
        </div>
        <Button 
          variant={showApply ? "outline" : "gradient"} 
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20"
          onClick={() => !isGraduated && setShowApply(!showApply)}
          disabled={isGraduated}
        >
          {isGraduated ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Portal Locked
            </>
          ) : showApply ? "Cancel Request" : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </>
          )}
        </Button>
      </motion.div>

      {isGraduated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive mb-6"
        >
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold">This portal is locked as your batch ({studentData?.batch}) has graduated. Applications are no longer accepted.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {showApply ? (
            <motion.div
              key="apply-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="lg:col-span-2 glass-card rounded-2xl p-4 sm:p-8 border-primary/20 bg-primary/[0.02]"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                New Leave Application
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type of Leave</Label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full h-11 bg-muted/50 rounded-xl px-4 border-transparent focus:border-primary/20 focus:ring-0 transition-all text-sm font-medium outline-none"
                    >
                      <option>Casual</option>
                      <option>Sick</option>
                      <option>Medical</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Duration Type</Label>
                    <select 
                        value={formData.durationType}
                        onChange={e => setFormData({...formData, durationType: e.target.value})}
                        className="w-full h-11 bg-muted/50 rounded-xl px-4 border-transparent focus:border-primary/20 focus:ring-0 transition-all text-sm font-medium outline-none"
                    >
                      <option>Full-Day</option>
                      <option>Half-Day (First Half)</option>
                      <option>Half-Day (Second Half)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">From Date</Label>
                    <DatePicker 
                        date={formData.startDate ? new Date(
                          parseInt(formData.startDate.split('-')[0]),
                          parseInt(formData.startDate.split('-')[1]) - 1,
                          parseInt(formData.startDate.split('-')[2]),
                          12, 0, 0
                        ) : undefined}
                        onChange={date => setFormData({...formData, startDate: date ? format(date, "yyyy-MM-dd") : ''})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">To Date</Label>
                    <DatePicker 
                        date={formData.endDate ? new Date(
                          parseInt(formData.endDate.split('-')[0]),
                          parseInt(formData.endDate.split('-')[1]) - 1,
                          parseInt(formData.endDate.split('-')[2]),
                          12, 0, 0
                        ) : undefined}
                        onChange={date => setFormData({...formData, endDate: date ? format(date, "yyyy-MM-dd") : ''})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reason for Leave</Label>
                  <Textarea 
                    placeholder="Explain your reason clearly..." 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    className="min-h-[120px] bg-muted/50 border-transparent rounded-xl focus:bg-card transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Attach Document {isFileUploadRequired ? <span className="text-destructive">* (Required)</span> : <span className="text-muted-foreground">(Optional)</span>}
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Input 
                      type="file" 
                      id="file-upload"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            toast.error("File size must be less than 1MB");
                            e.target.value = '';
                            setFileAttached(false);
                            return;
                          }
                          if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                            toast.error("Only PNG, JPG, and JPEG files are allowed");
                            e.target.value = '';
                            setFileAttached(false);
                            return;
                          }
                          toast.success("File attached successfully");
                          setFileAttached(true);
                        } else {
                            setFileAttached(false);
                        }
                      }}
                      className="bg-muted/50 border-transparent rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-xs sm:text-sm" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Max size: 1MB. Supported formats: PNG, JPG, JPEG.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: For medical leave exceeding 2 days, you must upload a doctor's certificate.
                  </p>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-xl shadow-primary/20">
                  Submit Application
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Guidelines</h3>
                <ul className="space-y-3">
                  {[
                    "Apply at least 24 hours in advance.",
                    "Attend classes until approval is granted.",
                    "Compulsory attendance for lab sessions.",
                    "Medical certificate required for sick leave."
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={showApply ? "lg:col-span-1" : "lg:col-span-3"}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6 h-full"
          >
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 px-2">Application History</h3>
            
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="w-[60px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap">S.No</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Leave Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">From Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">To Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {paginatedHistory.map((leave: any, idx) => {
                    const type = leave.type || leave.category || 'Leave';
                    const status = leave.status || 'pending';
                    
                    const formatDate = (date: any) => {
                      if (!date) return '-';
                      const d = new Date(date);
                      return isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    };

                    const startDate = formatDate(leave.startDate || leave.start_date);
                    const endDate = formatDate(leave.endDate || leave.end_date);
                    const sNo = (currentPage - 1) * itemsPerPage + idx + 1;

                    return (
                      <TableRow key={leave.id || idx} className="hover:bg-muted/30 border-white/5 transition-colors group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sNo.toString().padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{type}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 italic">"{leave.reason}"</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{startDate}</TableCell>
                        <TableCell className="text-xs font-medium">{endDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-lg font-black uppercase text-[9px] border-0 py-0.5 ${getStatusBadge(status)}`}>
                            {status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card/95 backdrop-blur-xl border-primary/10 p-1.5 shadow-2xl">
                              <DropdownMenuItem 
                                className={`gap-2 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                                  status !== 'cancelled' && status !== 'rejected' && new Date(leave.startDate || leave.start_date) > new Date()
                                    ? 'text-amber-500 focus:text-amber-500 focus:bg-amber-500/10 cursor-pointer' 
                                    : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'
                                }`}
                                disabled={status === 'cancelled' || status === 'rejected' || new Date(leave.startDate || leave.start_date) <= new Date()}
                                onClick={() => handleCancelRequest(leave.id)}
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                {status === 'cancel_requested' ? 'Cancel Pending' : 'Cancel Request'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
             </div>

              {leaveHistory.length === 0 && (
                <div className="text-center py-20 bg-muted/10">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No application history found.</p>
                </div>
              )}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={leaveHistory.length}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
