import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, Filter, Eye, Users, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';
import { Loader2 } from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'verified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'; // Admin Approved
    case 'forwarded': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // Sent to Admin
    case 'submitted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // Faculty entered
    case 'pending': return 'bg-muted text-muted-foreground border-white/10'; // Not started
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function ViewMarks() {
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [batches, setBatches] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  // Filters
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('1');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Data
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subjectsMap, setSubjectsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Details Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchSubjects();
    fetchData();
  }, [activeTab, selectedSemester, selectedBatch, selectedSection, selectedExam]); 

  const fetchBatches = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/academic/batches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setBatches(await res.json());
        }
    } catch (error) {
        console.error("Failed to fetch batches", error);
    }
  };

  const fetchSubjects = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/academic/subjects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            const map: Record<string, number> = {};
            data.forEach((s: any) => {
                map[s.code] = s.semester;
                map[s.id] = s.semester;
            });
            setSubjectsMap(map);
        }
    } catch (error) {
        console.error("Failed to fetch subjects", error);
    }
  };

  const fetchSections = async (batchId: string) => {
      setSelectedSection('all');
      if (batchId === 'all') {
          setSections([]);
          return;
      }
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              setSections(await res.json());
          }
      } catch (error) {
          console.error("Failed to fetch sections", error);
      }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (selectedBatch !== 'all') params.append('batchId', selectedBatch);
        if (selectedSection !== 'all') params.append('sectionId', selectedSection);
        if (selectedSemester !== 'all') params.append('semester', selectedSemester);
        if (selectedExam !== 'all') params.append('examType', selectedExam);
        else if (activeTab === 'external') params.append('examType', 'SEMESTER');
        
        const res = await fetch(`${API_BASE_URL}/marks/status-report?${params.toString()}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.ok) {
            const data = await res.json();
            setSubmissions(data);
        }
    } catch (error) {
        toast.error("Failed to fetch data");
    } finally {
        setLoading(false);
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(sub => {
    // 1. Tab Filter (Internal vs External)
    // Assuming backend data `examType` tells us.
    const isExternal = sub.examType === 'SEMESTER' || sub.examType === 'External';
    if (activeTab === 'internal' && isExternal) return false;
    if (activeTab === 'external' && !isExternal) return false;

    // 2. Search
    const matchesSearch =
      (sub.subjectName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sub.subjectCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (sub.facultyName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // 3. Dropdowns
    const matchesBatch = selectedBatch === 'all' || sub.batchName === batches.find((b: any) => b.id.toString() === selectedBatch)?.name;
    // Note: sub.batchName is name, selectedBatch is ID. We need to match properly. 
    // Ideally backend returns batchId. If not, we might need a workaround or lookup name.
    // Let's assume for now we might mismatch if using Name vs ID. 
    // Wait, ApproveMarks uses `sub.batchName === batchFilter` where batchFilter comes from `uniqueBatches` (names).
    // Here `selectedBatch` is ID. Let's fix logic.
    const batchName = selectedBatch === 'all' ? null : batches.find((b: any) => b.id.toString() === selectedBatch)?.name;
    const matchesBatchName = !batchName || sub.batchName === batchName;

    // Section Logic: `sub.sectionName` vs `selectedSection` (ID).
    const sectionName = selectedSection === 'all' ? null : sections.find((s: any) => s.id.toString() === selectedSection)?.name;
    const matchesSectionName = !sectionName || sub.sectionName === sectionName;
    
    // Semester
    // Lookup semester from map if missing
    const semester = sub.semester || subjectsMap[sub.subjectCode] || subjectsMap[sub.subjectId];
    const matchesSemester = selectedSemester === 'all' || (semester && semester.toString() === selectedSemester);

    // Exam
    const matchesExam = selectedExam === 'all' || sub.examType === selectedExam;

    return matchesSearch && matchesBatchName && matchesSectionName && matchesSemester && matchesExam;
  });

  const fetchDetails = async (sub: any) => {
    setSelectedSubject(sub);
    setIsDetailsOpen(true);
    setLoadingDetails(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/detailed-verification?scheduleId=${sub.scheduleId}&subjectId=${sub.subjectId}&sectionId=${sub.sectionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setDetails(await res.json());
        }
    } catch (error) {
        toast.error("Failed to fetch detailed marks");
    } finally {
        setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
             View Marks
           </h1>
           <p className="text-muted-foreground mt-1">View detailed internal and external marks across batches</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-muted p-1 rounded-xl flex">
            <Button
                variant={activeTab === 'internal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setActiveTab('internal'); setSelectedExam('all'); }}
                className="rounded-lg font-bold w-32"
            >
                Internal
            </Button>
            <Button
                variant={activeTab === 'external' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => { setActiveTab('external'); setSelectedExam('SEMESTER'); }}
                className="rounded-lg font-bold w-32"
            >
                External
            </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 flex-wrap">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search Subject, Faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
              </div>

               <Select value={selectedBatch} onValueChange={(val) => {
                    setSelectedBatch(val);
                    fetchSections(val);
                }}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches.map(b => (
                            <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={selectedBatch === 'all'}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sections.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>Section {s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {activeTab === 'internal' && (
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Exam Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Exams</SelectItem>
                            <SelectItem value="UT-1">UT-1</SelectItem>
                            <SelectItem value="UT-2">UT-2</SelectItem>
                            <SelectItem value="UT-3">UT-3</SelectItem>
                            <SelectItem value="MODEL">Model Exam</SelectItem>
                            <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                )}
          </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="glass-card border-white/10">
         <CardContent className="p-0">
             <Table>
                 <TableHeader>
                    <TableRow>
                        <TableHead>Batch & Section</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                     {loading ? (
                         <TableRow>
                             <TableCell colSpan={6} className="h-24 text-center">
                                 <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                             </TableCell>
                         </TableRow>
                     ) : filteredSubmissions.length === 0 ? (
                         <TableRow>
                             <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                 No marks found matching criteria.
                             </TableCell>
                         </TableRow>
                     ) : (
                         filteredSubmissions.map((sub, idx) => (
                             <TableRow key={`${sub.scheduleId}-${idx}`}>
                                 <TableCell>
                                     <div className="font-medium">{sub.batchName}</div>
                                     <div className="text-xs text-muted-foreground">Section {sub.sectionName}</div>
                                 </TableCell>
                                 <TableCell>
                                     <div className="font-semibold">{sub.subjectName}</div>
                                     <Badge variant="outline" className="text-[10px]">{sub.subjectCode}</Badge>
                                 </TableCell>
                                 <TableCell>
                                     <Badge variant="secondary">{sub.examType}</Badge>
                                 </TableCell>
                                 <TableCell className="text-sm">{sub.facultyName}</TableCell>
                                 <TableCell className="text-center">
                                      <Badge className={getStatusBadge(sub.markStatus)}>
                                          {sub.markStatus.replace('_', ' ')}
                                      </Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                     <Button size="sm" variant="outline" onClick={() => fetchDetails(sub)}>
                                         <Eye className="w-4 h-4 mr-2" />
                                         View
                                     </Button>
                                 </TableCell>
                             </TableRow>
                         ))
                     )}
                 </TableBody>
             </Table>
         </CardContent>
      </Card>
      
       {/* Detailed Marks Dialog */}
       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col glass-card border-white/10 p-0">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-xl font-bold flex items-center justify-between pr-8">
               <div className="flex flex-col gap-1">
                 <span className="text-2xl font-black italic tracking-tighter uppercase">{selectedSubject?.subjectName}</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Section {selectedSubject?.sectionName} • {selectedSubject?.batchName} • {selectedSubject?.examType}
                 </p>
               </div>
               <Badge className={getStatusBadge(selectedSubject?.markStatus || '')}>
                 {selectedSubject?.markStatus?.replace('_', ' ')}
               </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-0">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground italic">Fetching data...</p>
              </div>
            ) : (
                <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="w-[100px] font-black uppercase text-[10px] tracking-widest pl-6">Roll No</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Student Name</TableHead>
                        {/* Dynamic Exam Headers */}
                        {['UT-1', 'UT-2', 'UT-3', 'MODEL', 'ASSIGNMENT', 'SEMESTER'].map(exam => {
                            // Only show if at least one student has marks for this exam OR if we are in 'All' mode (maybe show all empty?)
                            // Better: Show only exams that exist in data to avoid clutter, or fixed set if preferred.
                            // Let's show columns that have ANY data or matches current filter?
                            // Simple: Show all generic exams found in the data keys.
                            const hasData = details.some(d => d.marks && d.marks[exam] !== undefined);
                            const hasDataMixed = details.some(d => d.marks && Object.keys(d.marks).some(k => k.toUpperCase() === exam));
                            
                            // Case insensitive matching
                            const actualKey = details.flatMap(d => Object.keys(d.marks || {})).find(k => k.toUpperCase() === exam) || exam;
                            
                            if (!hasDataMixed) return null;
                            
                            return (
                                <TableHead key={exam} className="text-center font-black uppercase text-[10px] tracking-widest text-primary/80">
                                    {exam}
                                </TableHead>
                            );
                        })}
                        <TableHead className="text-center font-black uppercase text-[10px] tracking-widest pr-6">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {details.map((student) => (
                        <TableRow key={student.id || student.rollNumber} className="border-white/5 hover:bg-white/[0.02]">
                        <TableCell className="font-mono font-bold text-xs pl-6">{student.rollNumber}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{student.name}</span>
                            </div>
                        </TableCell>
                        
                        {/* Dynamic Exam Cells */}
                        {['UT-1', 'UT-2', 'UT-3', 'MODEL', 'ASSIGNMENT', 'SEMESTER'].map(exam => {
                             const hasDataMixed = details.some(d => d.marks && Object.keys(d.marks).some(k => k.toUpperCase() === exam));
                             if (!hasDataMixed) return null;

                             // Find key that matches this exam (unsafe casing handling)
                             // Assuming backend returns consistent casing "UT-1" etc from `sch.category`.
                             // `sch.category` usually matches the array above.
                             // Let's try direct access or find key.
                             const markVal = student.marks ? (student.marks[exam] ?? student.marks[exam.replace('-', ' ')] ?? student.marks[exam.toUpperCase()]) : undefined;
                             // Try varied keys: "UT-1", "UT 1", "Model", "MODEL"
                             // Best approach: Normalize keys in backend or here?
                             // Let's iterate keys once.
                             
                             let displayMark = '-';
                             if (student.marks) {
                                 const key = Object.keys(student.marks).find(k => k.toUpperCase() === exam.replace('-', ' ') || k.toUpperCase() === exam);
                                 if (key) displayMark = student.marks[key];
                             }

                             return (
                                <TableCell key={exam} className="text-center">
                                    <span className={`font-medium ${displayMark !== '-' ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                                        {displayMark}
                                    </span>
                                </TableCell>
                             );
                        })}

                        <TableCell className="text-center pr-6">
                            <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest border-none ${
                                student.status === 'approved' ? 'text-success bg-success/10' : 
                                student.status === 'pending_admin' ? 'text-warning bg-warning/10' : 
                                'text-muted-foreground bg-white/5'
                            }`}>
                                {student.status?.replace('_', ' ') || 'Pending'}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    {details.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">No students found for this section.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            )}
          </div>
          
          <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.01]">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest italic">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
