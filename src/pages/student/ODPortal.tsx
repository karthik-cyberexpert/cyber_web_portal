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
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreVertical,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getStudents, Student, LeaveRequest } from '@/lib/data-store';
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

export default function ODPortal() {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [odHistory, setODHistory] = useState<LeaveRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    type: 'Academic',
    startDate: '',
    endDate: '',
    reason: '',
    durationType: 'Full-Day',
    placeToVisit: ''
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
          
          // Fetch OD history from backend
          const historyResponse = await fetch(`${API_BASE_URL}/od/my-requests`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (historyResponse.ok) {
            const history = await historyResponse.json();
            setODHistory(history);
          }
        } catch (error) {
          console.error('Error fetching OD details:', error);
          toast.error('Failed to load OD history');
        }
      }
    };
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.startDate || !formData.endDate || !formData.reason || !formData.placeToVisit) {
        toast.error("Please fill in all required fields");
        return;
    }

    // Date Range Validation
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast.error("End date cannot be before Start date");
        return;
    }

    // OD always requires document
    if (!fileAttached) {
        toast.error(`Document attachment is required for OD requests`);
        return;
    }

    try {
        const formDataToSend = new FormData();
        formDataToSend.append('category', formData.type);
        formDataToSend.append('start_date', formData.startDate);
        formDataToSend.append('end_date', formData.endDate);
        formDataToSend.append('duration_type', formData.durationType);
        formDataToSend.append('reason', formData.reason);
        formDataToSend.append('place_to_visit', formData.placeToVisit);
        formDataToSend.append('is_half_day', String(formData.durationType !== 'Full-Day'));
        formDataToSend.append('session', formData.durationType);

        // Append file if exists
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput?.files?.[0]) {
            formDataToSend.append('file', fileInput.files[0]);
        }

        // Call backend API
        const response = await fetch(`${API_BASE_URL}/od/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formDataToSend
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error(data.error || 'Failed to submit OD request');
            return;
        }

        toast.success(`OD request submitted! (${data.working_days} working days)`);
        setShowApply(false);

        // Refresh OD history
        const historyResponse = await fetch(`${API_BASE_URL}/od/my-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const history = await historyResponse.json();
        setODHistory(history);

        setFormData({
            type: 'Academic',
            startDate: '',
            endDate: '',
            reason: '',
            durationType: 'Full-Day',
            placeToVisit: ''
        });
        setFileAttached(false);
    } catch (error) {
        console.error('Error submitting OD:', error);
        toast.error('Failed to submit OD request');
    }
  };

  const handleCancelRequest = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/od/${id}/cancel-request`, {
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
      const historyResponse = await fetch(`${API_BASE_URL}/od/my-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const history = await historyResponse.json();
      setODHistory(history);
    } catch (error) {
      console.error('Error cancelling OD:', error);
      toast.error('Failed to request cancellation');
    }
  };

  const isGraduated = studentData?.status === 'Graduated';

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

  // Pagination logic
  const totalPages = Math.ceil(odHistory.length / itemsPerPage);
  const paginatedHistory = odHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-success" />
            On-Duty (OD) Portal
          </h1>
          <p className="text-muted-foreground">Apply for On-Duty requests for academic events, sports, and competitions</p>
        </div>
        <Button 
          variant={showApply ? "outline" : "gradient"} 
          className="rounded-xl shadow-lg shadow-success/20"
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
              Apply for OD
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
              className="lg:col-span-2 glass-card rounded-2xl p-8 border-success/20 bg-success/[0.02]"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-success" />
                New OD Application
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">OD Category</Label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full h-11 bg-muted/50 rounded-xl px-4 border-transparent focus:border-success/20 focus:ring-0 transition-all text-sm font-medium outline-none"
                    >
                      <option>Academic</option>
                      <option>Sports</option>
                      <option>Symposium</option>
                      <option>Workshop</option>
                      <option>Conference</option>
                      <option>Competition</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Duration Type</Label>
                    <select 
                        value={formData.durationType}
                        onChange={e => setFormData({...formData, durationType: e.target.value})}
                        className="w-full h-11 bg-muted/50 rounded-xl px-4 border-transparent focus:border-success/20 focus:ring-0 transition-all text-sm font-medium outline-none"
                    >
                      <option>Full-Day</option>
                      <option>Half-Day (First Half)</option>
                      <option>Half-Day (Second Half)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Place to Visit</Label>
                  <Input 
                    placeholder="e.g., IIT Madras, Chennai" 
                    value={formData.placeToVisit}
                    onChange={e => setFormData({...formData, placeToVisit: e.target.value})}
                    className="h-11 bg-muted/50 border-transparent rounded-xl focus:bg-card transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Event/Activity Details</Label>
                  <Textarea 
                    placeholder="Provide details about the event, venue, and purpose..." 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    className="min-h-[120px] bg-muted/50 border-transparent rounded-xl focus:bg-card transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Attach Proof <span className="text-destructive">* (Required)</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="file" 
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            toast.error("File size must be less than 1MB");
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
                      className="bg-muted/50 border-transparent rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-success/10 file:text-success hover:file:bg-success/20" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Max size: 1MB. Attach event invitation, permission letter, or proof.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-success/5 border border-success/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-success mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: OD requests require valid proof of participation. Ensure you attach the event invitation or official document.
                  </p>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold shadow-xl shadow-success/20 bg-success hover:bg-success/90">
                  Submit OD Application
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
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">OD Guidelines</h3>
                <ul className="space-y-3">
                  {[
                    "Apply at least 3 days in advance.",
                    "Proof of participation is mandatory.",
                    "Attendance will be marked if approved.",
                    "Submit physical documents to class tutor.",
                    "Check approval status regularly."
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="w-3 h-3 text-success mt-0.5 shrink-0" />
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
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 px-2">OD History</h3>
            
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="w-[60px] text-[10px] font-black uppercase tracking-widest">S.No</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">OD Type</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">From Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">To Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Place</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.map((od: any, idx) => {
                    const type = od.type || od.category || 'OD Request';
                    const status = od.status || 'pending';
                    const place = od.placeToVisit || od.place_to_visit || '';
                    
                    const formatDate = (date: any) => {
                      if (!date) return '-';
                      const d = new Date(date);
                      return isNaN(d.getTime()) ? date : d.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    };

                    const startDate = formatDate(od.startDate || od.start_date);
                    const endDate = formatDate(od.endDate || od.end_date);
                    const sNo = (currentPage - 1) * itemsPerPage + idx + 1;

                    return (
                      <TableRow key={od.id || idx} className="hover:bg-muted/30 border-white/5 transition-colors group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sNo.toString().padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{type}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1 italic">"{od.reason}"</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{startDate}</TableCell>
                        <TableCell className="text-xs font-medium">{endDate}</TableCell>
                        <TableCell className="text-xs font-medium">{place || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-lg font-black uppercase text-[9px] border-0 py-0.5 ${getStatusBadge(status)}`}>
                            {status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-success/10 hover:text-success transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card/95 backdrop-blur-xl border-success/10 p-1.5 shadow-2xl">
                              <DropdownMenuItem 
                                className={`gap-2 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                                  status !== 'cancelled' && status !== 'rejected' && new Date(od.startDate || od.start_date) > new Date()
                                    ? 'text-amber-500 focus:text-amber-500 focus:bg-amber-500/10 cursor-pointer' 
                                    : 'text-muted-foreground/40 opacity-50 cursor-not-allowed'
                                }`}
                                disabled={status === 'cancelled' || status === 'rejected' || new Date(od.startDate || od.start_date) <= new Date()}
                                onClick={() => handleCancelRequest(od.id)}
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

              {odHistory.length === 0 && (
                <div className="text-center py-20 bg-muted/10">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No application history found.</p>
                </div>
              )}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={odHistory.length}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
