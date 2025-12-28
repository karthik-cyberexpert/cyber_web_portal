import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getStudents, Student, getLeaveRequests, addLeaveRequest, LeaveRequest } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LeavePortal() {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    contact: ''
  });

  const [fileAttached, setFileAttached] = useState(false);

  useEffect(() => {
    if (user) {
      const students = getStudents();
      const current = students.find(s => s.email === user.email);
      if (current) setStudentData(current);
      
      const allLeaves = getLeaveRequests();
      setLeaveHistory(allLeaves.filter(l => l.userId === user.id).reverse());
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !studentData) return;

    if (!formData.startDate || !formData.endDate || !formData.reason) {
        toast.error("Please fill in all required fields");
        return;
    }

    // Conditional File Upload Validation
    if (formData.type !== 'Casual Leave' && !fileAttached) {
        toast.error(`Document attachment is required for ${formData.type}`);
        return;
    }

    addLeaveRequest({
        userId: user.id,
        userName: studentData.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        contact: formData.contact
    });

    toast.success("Application submitted successfully!");
    setShowApply(false);
    setLeaveHistory(getLeaveRequests().filter(l => l.userId === user.id).reverse());
    setFormData({
        type: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: '',
        contact: ''
    });
    setFileAttached(false); 
  };

  const isGraduated = studentData?.status === 'Graduated';
  const isFileUploadRequired = formData.type !== 'Casual Leave';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const leaveBalance = [
    { label: "Sick Leave", used: leaveHistory.filter(l => l.type === 'Sick Leave' && l.status === 'approved').length, total: 10, color: "bg-primary" },
    { label: "Casual Leave", used: leaveHistory.filter(l => l.type === 'Casual Leave' && l.status === 'approved').length, total: 8, color: "bg-accent" },
    { label: "On Duty", used: leaveHistory.filter(l => l.type.includes('On Duty') && l.status === 'approved').length, total: 15, color: "bg-success" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Leave Portal</h1>
          <p className="text-muted-foreground">Request leave/OD and track approval status</p>
        </div>
        <Button 
          variant={showApply ? "outline" : "gradient"} 
          className="rounded-xl shadow-lg shadow-primary/20"
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
              Apply Leave / OD
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
              className="lg:col-span-2 glass-card rounded-2xl p-8 border-primary/20 bg-primary/[0.02]"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                New Leave Application
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type of Request</Label>
                    <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full h-11 bg-muted/50 rounded-xl px-4 border-transparent focus:border-primary/20 focus:ring-0 transition-all text-sm font-medium outline-none"
                    >
                      <option>Sick Leave</option>
                      <option>Casual Leave</option>
                      <option>On Duty (Academic)</option>
                      <option>On Duty (ECA)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Emergency Contact</Label>
                    <Input 
                        placeholder="+91 98765 43210" 
                        value={formData.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        className="h-11 bg-muted/50 border-transparent rounded-xl" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">From Date</Label>
                    <Input 
                        type="date" 
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        className="h-11 bg-muted/50 border-transparent rounded-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">To Date</Label>
                    <Input 
                        type="date" 
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                        className="h-11 bg-muted/50 border-transparent rounded-xl" 
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
                  <div className="flex items-center gap-3">
                    <Input 
                      type="file" 
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
                          // In a real app, you'd handle the file upload here
                          toast.success("File attached successfully");
                          setFileAttached(true);
                        } else {
                            setFileAttached(false);
                        }
                      }}
                      className="bg-muted/50 border-transparent rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Max size: 1MB. Supported formats: PNG, JPG, JPEG.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: For medical leave exceeding 2 days, you must upload a doctor's certificate. For OD, attach proof of event/invitation.
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
                    "OD requires physical verification of proof."
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

        <div className={showApply ? "lg:col-span-1" : "lg:col-span-2"}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6 h-full"
          >
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 px-2">Application History</h3>
            <div className="space-y-4">
              {leaveHistory.map((leave, idx) => (
                <div 
                  key={leave.id}
                  className="group p-5 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusBadge(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-tight">{leave.type}</h4>
                        <p className="text-xs text-muted-foreground font-medium">{leave.startDate} - {leave.endDate}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`rounded-lg font-black uppercase text-[10px] border-0 ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <p className="text-xs text-muted-foreground font-medium italic">"{leave.reason}"</p>
                    {leave.processedBy && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                        <UserCheck className="w-3 h-3" />
                        {leave.processedBy}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaveHistory.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No application history found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
