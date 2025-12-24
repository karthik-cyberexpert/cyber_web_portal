import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  User,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { 
  getStudents, 
  getMarks, 
  addOrUpdateMark, 
  getFaculty,
  Student, 
  MarkEntry,
  Faculty
} from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

interface StudentWithMarks extends Student {
  currentMarks: number | null;
  markStatus: 'saved' | 'pending' | 'changed';
}

export default function MarksEntry() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<'ia1' | 'ia2' | 'model'>('ia1');
  const [selectedSubject, setSelectedSubject] = useState(''); 
  const [selectedSection, setSelectedSection] = useState('all');
  const [students, setStudents] = useState<StudentWithMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    if (user) {
      const allFaculty = getFaculty();
      const current = allFaculty.find(f => f.id === user.id || f.email === user.email);
      if (current) {
        setFaculty(current);
        if (current.subjects.length > 0) setSelectedSubject(current.subjects[0]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject) {
      loadData();
    }
  }, [selectedExam, selectedSubject, selectedSection, faculty]);

  const loadData = () => {
    setLoading(true);
    const allStudents = getStudents();
    const allMarks = getMarks();

    console.log("Loading marks for", selectedExam, selectedSubject, selectedSection);

    // Filter students by faculty sections or selected section
    const filteredBySection = allStudents.filter(s => {
      const matchSection = selectedSection === 'all' 
        ? (faculty ? faculty.sections.includes(s.section) : true)
        : s.section === selectedSection;
      return matchSection;
    });

    const mappedStudents = filteredBySection.map(student => {
      const existingMark = allMarks.find(m => 
        m.studentId === student.id && 
        m.subjectCode === selectedSubject && 
        m.examType === selectedExam
      );

      return {
        ...student,
        currentMarks: existingMark ? existingMark.marks : null,
        markStatus: existingMark ? 'saved' : 'pending'
      } as StudentWithMarks;
    });

    setStudents(mappedStudents);
    setLoading(false);
  };

  const handleMarksChange = (id: string, value: string) => {
     const numVal = parseInt(value);
     if (!isNaN(numVal) && numVal >= 0 && numVal <= 20) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, currentMarks: numVal, markStatus: 'changed' } : s));
     } else if (value === '') {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, currentMarks: null, markStatus: 'pending' } : s));
     }
  };

  const handleSaveAll = () => {
    const changed = students.filter(s => s.markStatus === 'changed');
    if (changed.length === 0) {
      toast.info('No changes to save');
      return;
    }

    changed.forEach(student => {
      if (student.currentMarks !== null) {
        addOrUpdateMark({
          studentId: student.id,
          subjectCode: selectedSubject,
          examType: selectedExam,
          marks: student.currentMarks,
          maxMarks: 20,
          date: new Date().toISOString(),
          status: 'submitted'
        });
      }
    });

    toast.success(`Saved marks for ${changed.length} students`);
    loadData(); // Refresh to set status to 'saved'
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    entered: students.filter(s => s.currentMarks !== null).length,
    saved: students.filter(s => s.markStatus === 'saved').length
  };

  const progress = Math.round((stats.entered / stats.total) * 100) || 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight">Examination Marks Entry 📝</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Record and update student assessments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 group">
             <FileSpreadsheet className="w-4 h-4 mr-2 group-hover:text-emerald-500 transition-colors" />
             Import CSV
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20" onClick={handleSaveAll}>
             <Save className="w-4 h-4 mr-2" />
             Save All Changes
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-1 space-y-4">
            <Card className="glass-card p-6 border-none shadow-xl h-full">
               <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Course Filters</h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-primary">Requirement</p>
                     <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="rounded-xl bg-white/5 border-white/10">
                           <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All My Sections</SelectItem>
                           {faculty?.sections.map(sec => (
                             <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-primary">Subject</p>
                     <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="rounded-xl bg-white/5 border-white/10">
                           <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculty?.subjects.map(subCode => (
                             <SelectItem key={subCode} value={subCode}>{subCode}</SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-primary">Assessment</p>
                     <Select value={selectedExam} onValueChange={(v: any) => setSelectedExam(v)}>
                        <SelectTrigger className="rounded-xl bg-white/5 border-white/10">
                           <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ia1">Internal Assessment 1</SelectItem>
                           <SelectItem value="ia2">Internal Assessment 2</SelectItem>
                           <SelectItem value="model">Model Examination</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                     <p className="text-[10px] font-black text-primary uppercase mb-1">Entry Progress</p>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xl font-black">{progress}%</span>
                        <span className="text-xs font-bold text-muted-foreground">{stats.entered}/{stats.total} Entered</span>
                     </div>
                     <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="md:col-span-3 space-y-4">
            <Card className="glass-card border-none shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-white/5 bg-muted/20 flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input 
                        placeholder="Search student name or ID..." 
                        className="pl-10 rounded-xl bg-white/5 border-white/10 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-muted/10">
                           <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Student ID</th>
                           <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Name</th>
                           <th className="p-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground w-40">Marks (Max: 20)</th>
                           <th className="p-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                           <th className="p-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        <AnimatePresence>
                           {filteredStudents.map((student, idx) => (
                              <motion.tr 
                                 key={student.id}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: idx * 0.05 }}
                                 className="group hover:bg-white/5 transition-all"
                              >
                                 <td className="p-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                          <Hash className="w-3 h-3" />
                                       </div>
                                       <span className="font-bold text-sm tracking-tight">{student.rollNumber}</span>
                                    </div>
                                 </td>
                                 <td className="p-4 font-bold text-sm">{student.name}</td>
                                 <td className="p-4">
                                    <div className="flex justify-center">
                                       <Input 
                                          type="text" 
                                          className={`w-20 text-center font-black rounded-lg transition-all ${
                                             student.markStatus === 'pending' ? 'bg-orange-500/10 border-orange-500/30' : 
                                             student.markStatus === 'changed' ? 'bg-primary/20 border-primary/40 text-primary' : 
                                             'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                          }`}
                                          value={student.currentMarks === null ? '' : student.currentMarks}
                                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                       />
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <div className="flex justify-center">
                                       {student.markStatus === 'saved' ? (
                                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none flex gap-1 items-center">
                                             <CheckCircle2 className="w-3 h-3" /> Saved
                                          </Badge>
                                       ) : student.markStatus === 'pending' ? (
                                          <Badge className="bg-orange-500/10 text-orange-500 border-none flex gap-1 items-center">
                                             <AlertCircle className="w-3 h-3" /> Missing
                                          </Badge>
                                       ) : (
                                          <Badge className="bg-primary/20 text-primary border-none flex gap-1 items-center animate-pulse">
                                             Unsaved
                                          </Badge>
                                       )}
                                    </div>
                                 </td>
                                 <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">History</Button>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>
            </Card>
            
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between"
            >
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black uppercase tracking-tight">AI Insights</h4>
                     <p className="text-xs font-medium text-muted-foreground">Class performance analytics will appear here after sufficient data is collected.</p>
                  </div>
               </div>
               <Button variant="link" className="text-primary font-black uppercase text-xs">Full Report</Button>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
