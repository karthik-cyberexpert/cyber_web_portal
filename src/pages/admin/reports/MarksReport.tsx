import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Search, BookOpen, GraduationCap, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import * as XLSX from 'xlsx';

interface Batch {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    code: string;
    name: string;
    semester: number;
}

interface StudentEntry {
    id: string;
    name: string;
    rollNo: string;
    marks: Record<string, number>; // subjectCode -> totalMarks
}

export default function MarksReport() {
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const isAdmin = user?.role === 'admin';
    const isTutor = user?.role === 'tutor';

    const [batches, setBatches] = useState<Batch[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('1');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [reportType, setReportType] = useState<'raw' | 'calculated'>('calculated');
    const [searchQuery, setSearchQuery] = useState('');
    const [reportData, setReportData] = useState<StudentEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchBatches();
        }
    }, [user]);

    // ... (keep fetchBatches, fetchSections, fetchSubjects same)

    const fetchReport = async () => {
        if (!selectedSemester) return;
        if (isAdmin && !selectedBatch) return; // Wait for batch selection
        
        setIsLoading(true);
        try {
            await fetchSubjects();

            // 1. Fetch Students
            const studentsRes = await fetch(`${API_BASE_URL}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allStudents = await studentsRes.json();
            
            // Filter students by criteria
            const targetStudents = allStudents.filter((s: any) => {
                const matchesSemester = s.semester?.toString() === selectedSemester;
                const matchesBatch = !isAdmin || !selectedBatch || s.batch_id?.toString() === selectedBatch;
                const matchesSection = !isAdmin || !selectedSection || s.section_id?.toString() === selectedSection;
                return matchesSemester && matchesBatch && matchesSection;
            });

            if (reportType === 'calculated') {
                // Fetch Calculated Internals
                const calcRes = await fetch(`${API_BASE_URL}/academic/marks/internals/theory?batchId=${selectedBatch}&semester=${selectedSemester}`, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                
                const calcData = calcRes.ok ? await calcRes.json() : [];

                // Pivot Data
                const mapped: StudentEntry[] = targetStudents.map((s: any) => {
                    const studentMarks: Record<string, number> = {};
                    
                    // Filter marks for this student
                    const myMarks = calcData.filter((m: any) => m.studentId === s.id);
                    
                    myMarks.forEach((m: any) => {
                        studentMarks[m.subjectCode] = m.total;
                    });

                    return {
                        id: s.id,
                        name: s.name,
                        rollNo: s.roll_number || s.rollNo || 'N/A',
                        marks: studentMarks
                    };
                });
                 
                setReportData(mapped.filter(r => 
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
                ));

            } else {
                // RAW MARKS LOGIC
                const marksRes = await fetch(`${API_BASE_URL}/academic/marks/report?batchId=${selectedBatch}&semester=${selectedSemester}`, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                
                const allMarks = marksRes.ok ? await marksRes.json() : [];

                const mapped: StudentEntry[] = targetStudents.map((s: any) => {
                    const studentMarks: Record<string, number> = {};
                    subjects.forEach(sub => {
                        const subjectExamMarks = allMarks.filter((m: any) => 
                            m.studentId === s.id && 
                            m.subjectId === sub.id
                        );
                        const total = subjectExamMarks.reduce((sum: number, curr: any) => sum + (curr.marks || 0), 0);
                        studentMarks[sub.code] = total;
                    });

                    return {
                        id: s.id,
                        name: s.name,
                        rollNo: s.roll_number || s.rollNo || 'N/A',
                        marks: studentMarks
                    };
                });

                setReportData(mapped.filter(r => 
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    r.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
                ));
            }

        } catch (error) {
            console.error("Report fetch failed:", error);
            toast.error("Failed to load marks report");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedBatch, selectedSection, selectedSemester, searchQuery, reportType]);
    
    // ... handleExport ...

    return (
        <div className="space-y-6">
            {/* Headers ... */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                        Marks Report
                    </h1>
                    <p className="text-muted-foreground mt-1">Total internal marks summary by semester</p>
                </div>
                {/* ... */}
                 <Button onClick={handleExport} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Download className="w-4 h-4" />
                    Export to Excel
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm">
                 {/* Batch/Section Selectors (Admin Only) */}
                {isAdmin && (
                    <>
                        <div className="space-y-2">
                             <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batch</label>
                            {/* ... Select Batch ... */}
                            <Select value={selectedBatch} onValueChange={(val) => {
                                setSelectedBatch(val);
                                fetchSections(parseInt(val));
                            }}>
                                <SelectTrigger className="glass-select">
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map(b => (
                                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section</label>
                             <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="glass-select">
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>Section {s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
                
                {/* Report Type Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Type</label>
                    <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
                        <SelectTrigger className="glass-select border-blue-500/20 bg-blue-500/5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="calculated">Consolidated Internals (40)</SelectItem>
                            <SelectItem value="raw">Raw Exam Marks</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semester</label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="glass-select">
                            <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* ... Focus Subject and Search ... */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="glass-select">
                            <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(sub => (
                                <SelectItem key={sub.id} value={sub.code}>{sub.code} - {sub.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Student search..."
                            className="pl-9 glass-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[60px]">S.No</TableHead>
                            <TableHead className="min-w-[150px]">Name</TableHead>
                            <TableHead className="min-w-[120px]">Register No</TableHead>
                            {/* Dynamic Subject Columns */}
                            {subjects.filter(s => selectedSubject === 'all' || selectedSubject === s.code).map(sub => (
                                <TableHead key={sub.id} className="text-center font-mono text-xs">
                                    <div className="flex flex-col items-center">
                                        <span>{sub.code}</span>
                                        <span className="text-[10px] text-muted-foreground font-sans font-normal truncate max-w-[80px]" title={sub.name}>
                                            {sub.name}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={subjects.length + 3} className="h-32 text-center text-muted-foreground animate-pulse">
                                    Generating dynamic marks report...
                                </TableCell>
                            </TableRow>
                        ) : reportData.length > 0 ? (
                            reportData.map((student, index) => (
                                <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-semibold">{student.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px]">{student.rollNo}</Badge>
                                    </TableCell>
                                    {subjects.filter(s => selectedSubject === 'all' || selectedSubject === s.code).map(sub => (
                                        <TableCell key={sub.id} className="text-center">
                                            <span className={`font-bold ${
                                                (student.marks[sub.code] || 0) < 40 ? 'text-rose-500' : 'text-emerald-500'
                                            }`}>
                                                {student.marks[sub.code] || 0}
                                            </span>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={subjects.length + 3} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                                        <BarChart3 className="w-8 h-8 opacity-20" />
                                        <p>No data available for the selected criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
