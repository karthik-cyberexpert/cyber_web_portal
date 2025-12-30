import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { API_BASE_URL } from '@/lib/api-config';

interface StudentWithMarks extends Student {
  currentMarks: number | null;
  breakdown: any;
  markStatus: 'saved' | 'pending' | 'changed';
  absent: boolean;
}

export default function MarksEntrySheet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get query params
  const section = searchParams.get('section') || '';
  const subject = searchParams.get('subject') || '';
  const exam = searchParams.get('exam') as 'ia1' | 'ia2' | 'ia3' | 'model' | 'assignment' || 'ia1';

  const [students, setStudents] = useState<StudentWithMarks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (section && subject && exam) {
      loadData();
    }
  }, [section, subject, exam]);

  const loadData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/faculty/marks?sectionId=${section}&subjectCode=${subject}&examType=${exam}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            // Map keys
            const mapped = data.map((d: any) => ({
                id: d.id,
                name: d.name,
                rollNumber: d.rollNumber,
                email: d.email,
                section: section, // inferred
                currentMarks: d.currentMarks,
                breakdown: d.breakdown || {},
                markStatus: d.currentMarks !== null ? 'saved' : 'pending',
                absent: d.breakdown?.absent === true
            }));
            setStudents(mapped);
        } else {
             toast.error("Failed to fetch marks data");
        }
    } catch (error) {
        console.error("Fetch Marks Error", error);
        toast.error("Error loading data");
    } finally {
        setLoading(false);
    }
  };

  const handleDetailedMarkChange = (studentId: string, part: string, idx: number, value: string, max: number) => {
      let numVal = parseFloat(value);
      if (isNaN(numVal) || value === '') numVal = 0;
      if (numVal < 0) numVal = 0;
      if (numVal > max) {
          toast.error(`Max marks for this field is ${max}`);
          numVal = max;
      }

      setStudents(prev => prev.map(s => {
          if (s.id !== studentId) return s;

          const newBreakdown = { ...s.breakdown };
          if (!newBreakdown[part]) newBreakdown[part] = [];
          newBreakdown[part][idx] = numVal;

          // Recalculate Total
          const total = calculateTotal(newBreakdown, exam);

          return { ...s, breakdown: newBreakdown, currentMarks: total, markStatus: 'changed' };
      }));
  };

  const calculateTotal = (breakdown: any, type: string) => {
     if (breakdown.absent) return 0;

     let total = 0;
     if (type === 'ia1' || type === 'ia2' || type === 'ia3') {
         // 5 x 2m, 5 x 8m
         const partA = breakdown['partA'] || [];
         const partB = breakdown['partB'] || [];
         total += partA.reduce((a: number, b: number) => a + (b || 0), 0);
         total += partB.reduce((a: number, b: number) => a + (b || 0), 0);
     } else if (type === 'model') {
         // 10 x 2, 5 x 16
         const partA = breakdown['partA'] || [];
         const partB = breakdown['partB'] || [];
         total += partA.reduce((a: number, b: number) => a + (b || 0), 0);
         total += partB.reduce((a: number, b: number) => a + (b || 0), 0);
     }
     return total;
  };

  const handleAbsentToggle = (studentId: string, isAbsent: boolean) => {
      setStudents(prev => prev.map(s => {
          if (s.id !== studentId) return s;
          
          const newBreakdown = { ...s.breakdown, absent: isAbsent };
          // If absent, clear marks or set to 0. Let's keep existing values but total becomes 0
          const total = calculateTotal(newBreakdown, exam);
          
          return { 
              ...s, 
              absent: isAbsent, 
              breakdown: newBreakdown, 
              currentMarks: total,
              markStatus: 'changed' 
          };
      }));
  };

  const handleAssignmentToggle = (studentId: string, checked: boolean) => {
      setStudents(prev => prev.map(s => {
          if (s.id !== studentId) return s;
          const status = checked ? 'Submitted' : 'Not Submitted';
          return { 
              ...s, 
              currentMarks: checked ? 1 : 0, 
              breakdown: { status }, 
              markStatus: 'changed' 
          };
      }));
  };

  const handleSaveAll = async () => {
    const changed = students.filter(s => s.markStatus === 'changed');
    if (changed.length === 0) {
      toast.info('No changes to save');
      return;
    }

    try {
        const payload = {
            sectionId: section,
            subjectCode: subject,
            examType: exam,
            marks: changed.map(s => ({
                studentId: s.id,
                marks: s.absent ? 0 : (s.currentMarks || 0),
                maxMarks: exam === 'model' ? 100 : exam === 'assignment' ? 1 : 50,
                breakdown: { ...s.breakdown, absent: s.absent }
            }))
        };

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/faculty/marks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success(`Saved marks for ${changed.length} students`);
            loadData(); // Reload to refresh status
        } else {
            const err = await res.json();
            toast.error(err.message || "Failed to save marks");
        }
    } catch (e) {
        console.error("Save Error", e);
        toast.error("Error occurred while saving");
    }
  };

  // Generate headers based on exam type
  const getQuestionHeaders = () => {
      if (exam === 'assignment') return ['Submission'];
      if (exam === 'model') {
          // 10 Qs for Part A, 5 Qs for Part B. Total 15 columns + Absent
          const headers = [];
          for(let i=1; i<=10; i++) headers.push(`Q${i}(2M)`);
          for(let i=1; i<=5; i++) headers.push(`Q${i+10}(16M)`);
          return headers;
      }
      // IA 1/2/3
      // 5 Qs for Part A, 5 Qs for Part B. Total 10 columns
      const headers = [];
      for(let i=1; i<=5; i++) headers.push(`Q${i}(2M)`);
      for(let i=1; i<=5; i++) headers.push(`Q${i+5}(8M)`);
      return headers;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between sticky top-0 z-50 bg-background/95 backdrop-blur py-4 border-b border-white/10"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">{subject} - {exam.toUpperCase()}</h1>
                    <p className="text-muted-foreground text-sm font-medium">Entering marks for Section {section}</p>
                </div>
            </div>
            <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20" onClick={handleSaveAll}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
            </Button>
        </motion.div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/30 border-b border-white/10">
                            <th className="p-2 text-left font-black uppercase tracking-widest text-muted-foreground text-[10px] sticky left-0 bg-muted/30 z-30" style={{width: '45px', minWidth: '45px'}}>S.No</th>
                            <th className="p-2 text-left font-black uppercase tracking-widest text-muted-foreground text-[10px] sticky bg-muted/30 z-30" style={{left: '45px', width: '140px', minWidth: '140px'}}>Name</th>
                            <th className="p-2 text-left font-black uppercase tracking-widest text-muted-foreground text-[10px] sticky bg-muted/30 z-30" style={{left: '185px', width: '150px', minWidth: '150px'}}>Reg. No</th>
                            
                            {/* Dynamic Question Headers - these scroll */}
                            {getQuestionHeaders().map((h, i) => (
                                <th key={i} className="p-2 text-center font-bold uppercase tracking-tight text-[10px] whitespace-nowrap text-muted-foreground/80" style={{minWidth: '55px'}}>
                                    {h}
                                </th>
                            ))}

                            <th className="p-2 text-center font-bold uppercase tracking-widest text-muted-foreground text-[10px] whitespace-nowrap sticky bg-muted/30 z-30" style={{right: '60px', width: '55px', minWidth: '55px'}}>Absent</th>
                            <th className="p-2 text-center font-bold uppercase tracking-widest text-primary text-[10px] whitespace-nowrap sticky right-0 bg-muted/30 z-30" style={{width: '60px', minWidth: '60px'}}>Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {students.map((student, idx) => (
                            <motion.tr 
                                key={student.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                className={`group hover:bg-white/5 transition-colors ${student.absent ? 'opacity-60 bg-red-500/5' : ''}`}
                            >
                                <td className="p-2 font-mono text-muted-foreground text-xs sticky left-0 bg-background z-20" style={{width: '45px', minWidth: '45px'}}>{idx + 1}</td>
                                <td className="p-2 sticky bg-background z-20" style={{left: '45px', width: '140px', minWidth: '140px'}}>
                                    <span className="font-bold text-xs leading-tight" style={{maxWidth: '130px', wordBreak: 'break-word', display: 'block'}}>{student.name}</span>
                                </td>
                                <td className="p-2 font-mono text-muted-foreground text-xs sticky bg-background z-20" style={{left: '185px', width: '150px', minWidth: '150px', wordBreak: 'break-word'}}>{student.rollNumber}</td>

                                {exam === 'assignment' ? (
                                    <td className="p-4 text-center">
                                        <Checkbox 
                                            checked={student.currentMarks === 1}
                                            onCheckedChange={(c: boolean) => handleAssignmentToggle(student.id, c)}
                                            className="mx-auto"
                                        />
                                    </td>
                                ) : (
                                    <>
                                        {/* Part A Inputs (1-5 or 1-10) */}
                                        {Array.from({ length: exam === 'model' ? 10 : 5 }).map((_, i) => (
                                            <td key={`A-${i}`} className="p-2 text-center">
                                                <Input
                                                    className={`w-12 h-9 text-center bg-white/5 border-white/10 ${student.absent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    value={student.breakdown?.partA?.[i] ?? ''}
                                                    onChange={(e) => handleDetailedMarkChange(student.id, 'partA', i, e.target.value, 2)}
                                                    disabled={student.absent}
                                                />
                                            </td>
                                        ))}
                                        {/* Part B Inputs (6-10 or 11-15) */}
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <td key={`B-${i}`} className="p-2 text-center">
                                                <Input
                                                    className={`w-12 h-9 text-center bg-white/5 border-white/10 ${student.absent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    value={student.breakdown?.partB?.[i] ?? ''}
                                                    onChange={(e) => handleDetailedMarkChange(student.id, 'partB', i, e.target.value, exam === 'model' ? 16 : 8)}
                                                    disabled={student.absent}
                                                />
                                            </td>
                                        ))}
                                    </>
                                )}

                                {/* Absent column - sticky on right */}
                                <td className="p-2 text-center sticky bg-background z-20" style={{right: '60px', width: '55px', minWidth: '55px'}}>
                                    <Checkbox 
                                        checked={student.absent}
                                        onCheckedChange={(c: boolean) => handleAbsentToggle(student.id, c)}
                                        className="mx-auto data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                                    />
                                </td>
                                
                                <td className="p-2 text-center font-black text-primary bg-primary/10 text-sm sticky right-0 z-20" style={{width: '60px', minWidth: '60px'}}>
                                    {student.absent ? 'AB' : (student.currentMarks || 0)}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
