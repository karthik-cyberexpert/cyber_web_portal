import React, { useState, useEffect } from 'react';
import { ExternalLink, Download, Search, Calendar as StreamlineCalendar } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';

interface Batch {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface ODReportEntry {
    id: string;
    studentName: string;
    rollNo: string;
    reason: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    batchId?: number;
    sectionId?: number;
    semester?: number;
}

export default function ODReport() {
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const isAdmin = user?.role === 'admin';
    const isTutor = user?.role === 'tutor';

    const [batches, setBatches] = useState<Batch[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<string>('1');
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [reportData, setReportData] = useState<ODReportEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchBatches();
        }
    }, [user]);

    const fetchBatches = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/academic/batches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
                if (data.length > 0) {
                    setSelectedBatch(data[0].id.toString());
                    fetchSections(data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch batches", error);
        }
    };

    const fetchSections = async (batchId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSections(data);
                if (data.length > 0) {
                    setSelectedSection(data[0].id.toString());
                }
            }
        } catch (error) {
            console.error("Failed to fetch sections", error);
        }
    };

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/od/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const mapped: ODReportEntry[] = data.map((r: any) => ({
                    id: r.id,
                    studentName: r.user_name || 'Unknown',
                    rollNo: r.roll_number || 'N/A',
                    reason: r.reason || 'On-Duty',
                    startDate: r.startDate,
                    endDate: r.endDate,
                    days: Math.ceil((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 3600 * 24)) + 1,
                    status: r.status,
                    batchId: r.batch_id,
                    sectionId: r.section_id,
                    semester: r.current_semester
                }));

                const filtered = mapped.filter(r => {
                    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                         r.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesSemester = !selectedSemester || r.semester?.toString() === selectedSemester;
                    const matchesBatch = !isAdmin || !selectedBatch || r.batchId?.toString() === selectedBatch;
                    const matchesSection = !isAdmin || !selectedSection || r.sectionId?.toString() === selectedSection;

                    // Date Filter
                    const matchesDate = (!fromDate || new Date(r.startDate) >= fromDate) &&
                                        (!toDate || new Date(r.endDate) <= toDate);

                    return matchesSearch && matchesSemester && matchesBatch && matchesSection && matchesDate;
                });

                setReportData(filtered);
            }
        } catch (error) {
            toast.error("Failed to load report data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedBatch, selectedSection, selectedSemester, searchQuery, fromDate, toDate]);

    const handleExport = () => {
        if (reportData.length === 0) {
            toast.error("No data to export");
            return;
        }

        const exportData = reportData.map((r, index) => ({
            'S.No': index + 1,
            'Student Name': r.studentName,
            'Register Number': r.rollNo,
            'Reason': r.reason,
            'Start Date': r.startDate,
            'End Date': r.endDate,
            'Total Days': r.days,
            'Status': r.status.toUpperCase()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "OD Report");
        XLSX.writeFile(wb, `OD_Report_Sem_${selectedSemester}.xlsx`);
        toast.success("Report exported successfully");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        On-Duty (OD) Report
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate and export student OD records</p>
                </div>
                <Button onClick={handleExport} className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    <Download className="w-4 h-4" />
                    Export to Excel
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm">
                {isAdmin && (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batch</label>
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
                {/* Date Filters */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Date (Optional)</label>
                    <DatePicker 
                        date={fromDate} 
                        onChange={setFromDate} 
                        placeholder="Pick start date"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Date (Optional)</label>
                    <DatePicker 
                        date={toDate} 
                        onChange={setToDate} 
                        placeholder="Pick end date"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Student name or roll no..."
                            className="pl-9 glass-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[80px]">S.No</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Reg. Number</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground animate-pulse">
                                    Fetching report data...
                                </TableCell>
                            </TableRow>
                        ) : reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-semibold">{row.studentName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">{row.rollNo}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={row.reason}>
                                        {row.reason}
                                    </TableCell>
                                    <TableCell>{new Date(row.startDate).toLocaleDateString('en-GB')}</TableCell>
                                    <TableCell>{new Date(row.endDate).toLocaleDateString('en-GB')}</TableCell>
                                    <TableCell>{row.days}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge className={
                                            row.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            row.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                        }>
                                            {row.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                                        <ExternalLink className="w-8 h-8 opacity-20" />
                                        <p>No Records found for the selected criteria.</p>
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
