import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  CheckCircle, 
  AlertCircle, 
  User, 
  BookOpen, 
  Search,
  ArrowRight,
  Filter,
  CheckCheck,
  FileSpreadsheet,
  Eye,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { Users } from 'lucide-react';

export default function VerifyMarks() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('UT-1');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [markType, setMarkType] = useState<'internal' | 'external'>('internal');
  
  // Detailed Modal State
  // Detailed Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Grade Entry State
  const [isGradeEntryOpen, setIsGradeEntryOpen] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [user, selectedSemester, markType]);

  const fetchVerifications = async () => {
    if (!user) return;
    try {
        const token = localStorage.getItem('token');
        let url = `${API_BASE_URL}/marks/verification-status?semester=${selectedSemester}`;
        
        if (markType === 'external') {
            url = `${API_BASE_URL}/marks/tutor/subjects?semester=${selectedSemester}`;
        }

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            console.log("Fetched Verifications:", data);
            setVerifications(data);
        }
    } catch (error) {
        console.error("Fetch Verifications Error", error);
    }
  };

  const internalExams = ['UT-1', 'UT-2', 'UT-3', 'MODEL', 'ASSIGNMENT'];
  const externalExams = ['SEMESTER'];

  const stats = useMemo(() => {
    const relevantVerifications = verifications.filter(v => {
        if (markType === 'internal') {
            return internalExams.includes(v.examType);
        } else {
            return externalExams.includes(v.examType);
        }
    });

    const total = relevantVerifications.length;
    const pending = relevantVerifications.filter(v => v.markStatus === 'pending_tutor').length;
    const verified = total - pending;
    
    return {
        total,
        pending,
        verified,
        completion: total > 0 ? Math.round((verified / total) * 100) : 0
    };
  }, [verifications, markType]);

  const handleVerify = async (v: any) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                scheduleId: v.scheduleId,
                sectionId: v.sectionId,
                subjectCode: v.subjectCode
            })
        });

        if (res.ok) {
            toast.success("Marks Verified and forwarded to Admin.");
            fetchVerifications();
        } else {
            toast.error("Failed to verify marks");
        }
    } catch (error) {
        toast.error("Network error");
    }
  };

  const fetchDetails = async (v: any) => {
    setSelectedSubject(v);
    setLoadingDetails(true);
    
    // If external, open grade entry
    if (markType === 'external') {
        setIsGradeEntryOpen(true);
    } else {
        setIsDetailsOpen(true);
    }

    try {
        const token = localStorage.getItem('token');
        // For external new entry, scheduleId might be null.
        // If so, we pass examType='SEMESTER' (implied) and existing backend logic should handle it? 
        // Actually getDetailedVerifications expects scheduleId.
        // Current getDetailedVerifications logic for Admin needs scheduleId.
        // But for Grade Entry w/o saved marks, we don't have scheduleId yet.
        
        // Wait, for External Marks, generic "Enter Grades" should fetch STUDENT LIST even if no marks.
        // My new getTutorSubjects returns "NULL" for scheduleId if no marks.
        // So I need a way to fetch student list using subjectId + sectionId if scheduleId is null.
        
        let url = `${API_BASE_URL}/marks/detailed-verification?subjectId=${v.subjectId}&sectionId=${v.sectionId}`;
        if (v.scheduleId) {
             url += `&scheduleId=${v.scheduleId}`;
        } else if (markType === 'external') {
             // If no schedule (first time), we still need to load students.
             // Backend getDetailedVerifications checks for scheduleId param presence.
             // Let's modify backend or just pass dummy scheduleId? No, better:
             // Use a different endpoint or modify getDetailedVerifications to accept just subject/section for initial load.
             // Actually, `getDetailedVerifications` logic relies on `schedule_id` to join marks.
             // I need a way to get *just students* if no marks exist.
             // BUT `getDetailedVerifications` returns `marks` TABLE.
             
             // WORKAROUND: Pass special flag or use a new logic?
             // Actually, simply calling with dummy scheduleId=-1 might return empty list.
             // I need the STUDENT LIST.
             
             // Let's rely on the fact that for External, if no schedule, we just want empty marks with student list.
             // I'll update the backend `getDetailedVerifications` to be more flexible, 
             // OR simpler: modify this frontend to call `getMarks` (faculty endpoint) which handles "Create/Find Schedule".
             // `getMarks` in controller creates schedule if missing! 
             // That is PERFECT for "Enter Grades" mode.
             url = `${API_BASE_URL}/marks/faculty/marks?sectionId=${v.sectionId}&subjectCode=${v.subjectCode}&examType=SEMESTER`;
        } else {
             url += `&scheduleId=${v.scheduleId}`;
        }

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            if (markType === 'external') {
                // Determine format based on which endpoint was called
                // getMarks returns { id (userId), name, rollNumber, currentMarks, markStatus }
                // detailed-verification returns { id, name, rollNumber, marks, grade, status }
                
                const formatted = data.map((d: any) => ({
                    studentId: d.studentId || d.id, // getMarks returns id as userId
                    name: d.name,
                    rollNumber: d.rollNumber,
                    grade: d.grade || '', // getMarks doesn't return grade? Wait, I added it to getMarks?
                    // Let's check getMarks.
                    status: d.markStatus || d.status
                }));
                setGrades(formatted);
            } else {
                setDetails(data);
            }
        }
    } catch (error) {
        toast.error("Failed to fetch detailed marks");
    } finally {
        setLoadingDetails(false);
    }
  };

  const handleGradeChange = (studentId: string, value: string) => {
    setGrades(prev => prev.map(g => g.studentId === studentId ? { ...g, grade: value.toUpperCase() } : g));
  };

  const saveGrades = async () => {
    if (!selectedSubject) return;
    setSavingGrades(true);
    try {
        const token = localStorage.getItem('token');
        const marksPayload = grades.map(g => ({
            studentId: g.studentId,
            marks: 0, // Not used for external
            maxMarks: 0,
            grade: g.grade,
            status: 'approved', // Direct approval for external
            breakdown: {}
        }));

        const res = await fetch(`${API_BASE_URL}/marks/faculty/marks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                sectionId: selectedSubject.sectionId,
                subjectCode: selectedSubject.subjectCode,
                examType: 'SEMESTER',
                marks: marksPayload
            })
        });

        if (res.ok) {
            toast.success("Grades Saved Successfully");
            setIsGradeEntryOpen(false);
            fetchVerifications();
        } else {
            toast.error("Failed to save grades");
        }
    } catch (error) {
        toast.error("Error saving grades");
    } finally {
        setSavingGrades(false);
    }
  };

  useEffect(() => {
    // Reset selection when switching types
    if (markType === 'internal') {
        setSelectedExam('UT-1');
    } else {
        setSelectedExam('SEMESTER');
    }
  }, [markType]);

  const filteredVerifications = useMemo(() => {
    return verifications.filter(v => v.examType === selectedExam);
  }, [verifications, selectedExam]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            {markType === 'internal' ? 'Internal' : 'External'} Marks Verification 📝
          </h1>
          <p className="text-muted-foreground font-medium">Verify class marks submitted by subject teachers</p>
        </div>
        {markType === 'internal' && (
            <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
                Consolidated
            </Button>
            <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic">
                <CheckCheck className="w-4 h-4 mr-2" />
                Verify All
            </Button>
            </div>
        )}
      </motion.div>

      {/* Mark Type Toggle */}
      <div className="bg-black/20 p-1.5 rounded-2xl w-fit flex gap-1 border border-white/5">
        <button
            onClick={() => setMarkType('internal')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                markType === 'internal' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            }`}
        >
            Internal Marks
        </button>
        <button
            onClick={() => setMarkType('external')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                markType === 'external' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            }`}
        >
            External Marks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: stats.total.toString(), icon: BookOpen, color: 'primary' },
          { label: 'Pending', value: stats.pending.toString(), icon: AlertCircle, color: 'warning' },
          { label: 'Verified', value: stats.verified.toString(), icon: CheckCircle, color: 'success' },
          { label: 'Completion', value: `${stats.completion}%`, icon: ClipboardCheck, color: 'accent' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl border-none shadow-xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center shadow-glow shadow-${stat.color}/20 transition-transform group-hover:scale-110`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black italic tracking-tight uppercase">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-none shadow-2xl bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Semester</span>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[140px] bg-background border-none rounded-xl font-bold uppercase text-[10px] tracking-widest italic shadow-sm h-9">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()} className="font-bold cursor-pointer italic uppercase text-[10px]">
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest italic">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                {markType === 'internal' ? (
                    <>
                        <SelectItem value="UT-1" className="font-bold cursor-pointer italic uppercase">Unit Test 1 (UT-1)</SelectItem>
                        <SelectItem value="UT-2" className="font-bold cursor-pointer italic uppercase">Unit Test 2 (UT-2)</SelectItem>
                        <SelectItem value="UT-3" className="font-bold cursor-pointer italic uppercase">Unit Test 3 (UT-3)</SelectItem>
                        <SelectItem value="MODEL" className="font-bold cursor-pointer italic uppercase">Model Exam</SelectItem>
                        <SelectItem value="ASSIGNMENT" className="font-bold cursor-pointer italic uppercase">Assignment</SelectItem>
                    </>
                ) : (
                    <SelectItem value="SEMESTER" className="font-bold cursor-pointer italic uppercase">Semester Exam</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="rounded-xl border-white/10">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredVerifications.length > 0 ? filteredVerifications.map((subject, index) => (
            <motion.div
              key={`${subject.scheduleId}-${subject.subjectCode}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-8 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-glow ${
                    subject.markStatus === 'pending_tutor' ? 'bg-primary/10 text-primary shadow-primary/20' : 'bg-success/10 text-success shadow-success/20'
                  }`}>
                    {subject.markStatus === 'pending_tutor' ? <ClipboardCheck className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-3">
                      {subject.subjectName}
                      <Badge variant="outline" className="text-[9px] font-black font-mono border-white/10 tracking-widest px-2 py-0.5">
                        {subject.subjectCode}
                      </Badge>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-2">
                       {subject.sectionName} • {subject.facultyName} • {subject.studentCount} Students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block mr-5">
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Submitted On</p>
                     <p className="text-sm font-bold italic mt-1">{subject.submittedAt ? subject.submittedAt.split('T')[0] : 'N/A'}</p>
                   </div>
                   
                   <Button 
                    variant="ghost" 
                    className="rounded-xl font-black uppercase text-[10px] tracking-widest italic border border-white/10 hover:bg-white/5"
                    onClick={() => fetchDetails(subject)}
                   >
                     <Eye className="w-4 h-4 mr-2" />
                     {markType === 'external' ? 'Enter Grades' : 'View Marks'}
                   </Button>

                   {subject.markStatus !== 'pending_tutor' ? (
                     <Badge variant="secondary" className="bg-success text-white px-6 py-2 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-success/30 border-none ml-3">
                        <CheckCheck className="w-3.5 h-3.5" /> Forwarded
                      </Badge>
                   ) : (
                     <Button 
                      variant="gradient" 
                      size="sm"
                      className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-8 ml-3"
                      onClick={() => handleVerify(subject)}
                     >
                       Verify & Forward
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                   )}
                </div>
              </div>
            </motion.div>
          )) : (
              <div className="text-center py-24 opacity-50 italic font-medium">
                  No marks data available for this exam type.
              </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl border-none glass-card p-0 shadow-2xl">
          <DialogHeader className="p-8 border-b border-white/5">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span>Student Marks View</span>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                  {selectedSubject?.subjectName} ({selectedSubject?.subjectCode}) • {selectedSubject?.sectionName}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8">
            <div className="rounded-2xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Roll No</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Student Name</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4">Marks</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetails ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="font-bold italic uppercase text-[10px] tracking-widest text-muted-foreground">Fetching Data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : details.length > 0 ? (
                    details.map((row) => (
                      <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-xs font-bold py-4">{row.rollNumber}</TableCell>
                        <TableCell className="font-bold italic uppercase text-sm py-4">{row.name}</TableCell>
                        <TableCell className="text-right font-black italic text-base text-primary py-4">{row.marks}</TableCell>
                        <TableCell className="text-center py-4">
                          <Badge 
                            variant="secondary" 
                            className={`rounded-lg font-black uppercase text-[8px] tracking-widest px-2 ${
                              row.status === 'pending_tutor' ? 'bg-warning/20 text-warning' : 
                              row.status === 'pending_admin' ? 'bg-primary/20 text-primary' : 
                              'bg-success/20 text-success'
                            }`}
                          >
                            {row.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center italic text-muted-foreground font-medium">
                        No student marks found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Entry Dialog */}
      <Dialog open={isGradeEntryOpen} onOpenChange={setIsGradeEntryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl border-none glass-card p-0 shadow-2xl">
          <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span>Grade Entry</span>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                  {selectedSubject?.subjectName} • {selectedSubject?.sectionName}
                </p>
              </div>
            </DialogTitle>
            <Button onClick={saveGrades} disabled={savingGrades} className="rounded-xl font-black uppercase text-[10px] tracking-widest italic shadow-lg shadow-primary/20" variant="gradient">
                {savingGrades ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Save Grades
            </Button>
          </DialogHeader>
          
          <div className="p-8">
            <div className="rounded-2xl border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Roll No</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Student Name</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase tracking-widest py-4">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetails ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="font-bold italic uppercase text-[10px] tracking-widest text-muted-foreground">Fetching Data...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : grades.length > 0 ? (
                    grades.map((row) => (
                      <TableRow key={row.studentId} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-xs font-bold py-4">{row.rollNumber}</TableCell>
                        <TableCell className="font-bold italic uppercase text-sm py-4">{row.name}</TableCell>
                        <TableCell className="text-center py-2">
                            <Input 
                                value={row.grade} 
                                onChange={(e) => handleGradeChange(row.studentId, e.target.value)}
                                className="w-20 mx-auto text-center font-black uppercase bg-white/5 border-white/10 h-10 text-lg focus:scale-110 transition-transform"
                                maxLength={2}
                            />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center italic text-muted-foreground font-medium">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

