import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Award, 
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassStatCard } from '@/components/dashboard/StatCards';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function MarksGrades() {
  const { user } = useAuth();
  const [marksData, setMarksData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    cgpa: 0,
    averageMarks: 0,
    totalSubjects: 0,
    currentSemester: 1
  });
  const [viewType, setViewType] = useState<"internal" | "external">("internal");
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    if (user && user.role === 'student') {
      loadMarks();
    }
  }, [user]);

  const loadMarks = async () => {
    if (!user) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/student-marks`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.error("Failed to load marks");
            return;
        }

        const data = await res.json();
        console.log('Marks data loaded:', data);
        
        setMarksData(data.subjectMarks || []);
        
        const currentSem = data.stats?.currentSemester || 1;
        setStats({
          cgpa: data.stats?.cgpa || 0,
          averageMarks: data.stats?.averageMarks || 0,
          totalSubjects: data.stats?.totalSubjects || 0,
          currentSemester: currentSem
        });
        
        // Default to current semester
        setSelectedSemester(currentSem.toString());

    } catch (error) {
        console.error('Error loading marks:', error);
    } finally {
        setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'O': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'A+': return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'A': return 'bg-teal-500/20 text-teal-600 border-teal-500/50';
      case 'B+': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'B': return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'C': return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
      case 'U': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  // Filter logic
  const filteredMarks = marksData.filter(item => {
      // If we ever want 'all' back, we can uncomment this
      // if (selectedSemester === 'all') return true;
      return item.semester?.toString() === selectedSemester;
  });

  // Calculate stats based on filtered view
  const filteredStats = React.useMemo(() => {
      if (filteredMarks.length === 0) {
          return { cgpa: 0, averageMarks: 0, totalSubjects: 0 };
      }
      
      const totalMarks = filteredMarks.reduce((sum, s) => sum + (s.total || 0), 0);
      const avg = totalMarks / filteredMarks.length;
      
      return {
          cgpa: avg / 10,
          averageMarks: avg,
          totalSubjects: filteredMarks.length
      };
  }, [filteredMarks]);

  if (!user || user.role !== 'student') {
     return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
         <AlertCircle className="w-12 h-12 mb-4" />
         <h2 className="text-2xl font-bold">Access Restricted</h2>
         <p>This page is only for Students.</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Marks & Grades</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your academic performance and assessment results</p>
        </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2 w-full xs:w-auto">
              <Select value={viewType} onValueChange={(v: "internal" | "external") => setViewType(v)}>
                <SelectTrigger className="flex-1 xs:w-[150px] bg-background/50 border-white/10 rounded-xl">
                  <SelectValue placeholder="View Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Marks</SelectItem>
                  <SelectItem value="external">External Result</SelectItem>
                </SelectContent>
              </Select>
  
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="flex-1 xs:w-[150px] bg-background/50 border-white/10 rounded-xl">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: stats.currentSemester }, (_, i) => i + 1).map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="gradient" size="sm" className="w-full sm:w-auto" disabled>
              Download Grade Sheet
            </Button>
          </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassStatCard
          title={selectedSemester === 'all' ? "Overall CGPA" : "Semester GPA"}
          value={filteredStats.cgpa === 0 ? "0.00" : filteredStats.cgpa.toFixed(2)}
          icon={TrendingUp}
          iconColor="text-primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Total Subjects"
          value={filteredStats.totalSubjects.toString()}
          icon={BookOpen}
          iconColor="text-accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Average Marks"
          value={filteredStats.averageMarks === 0 ? "0.00" : filteredStats.averageMarks.toFixed(2)}
          subtitle="Out of 100"
          icon={BarChart3}
          iconColor="text-success"
          delay={0.3}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Internal Assessment / External Results Switcher */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between bg-primary/5 gap-3">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {viewType === 'internal' ? 'Internal Assessment Details' : 'University Results'}
            </h3>
            <span className="w-fit text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                {viewType === 'internal' ? 'In Progress' : 'Published'}
            </span>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {viewType === 'internal' ? (
                <Table>
                    <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="w-[60px] font-bold text-muted-foreground pl-6 whitespace-nowrap">S.No</TableHead>
                        <TableHead className="font-bold text-muted-foreground whitespace-nowrap">Subject Name and Code</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">CIA-1</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">CIA-2</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">CIA-3</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">Model</TableHead>
                        <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">Assignment</TableHead>
                        <TableHead className="font-bold text-primary text-right pr-6 whitespace-nowrap">Total</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredMarks.length > 0 ? filteredMarks.map((item, idx) => (
                        <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="pl-6 font-medium text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="whitespace-nowrap">
                            <p className="font-bold text-sm tracking-tight">{item.subject}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.code}</p>
                        </TableCell>
                        <TableCell className="text-center font-medium font-mono">{item.ia1}</TableCell>
                        <TableCell className="text-center font-medium font-mono">{item.ia2}</TableCell>
                        <TableCell className="text-center font-medium font-mono">{item.cia3 || '-'}</TableCell>
                        <TableCell className="text-center font-medium font-mono">{item.model || '-'}</TableCell>
                        <TableCell className="text-center font-medium font-mono">{item.assignment}</TableCell>
                        <TableCell className="text-right pr-6">
                            <span className="font-black text-primary font-mono">{item.total}</span>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                        <TableCell colSpan={8} className="text-center py-20 text-muted-foreground italic">
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="w-8 h-8 opacity-20" />
                                <p>No assessment records or marks released yet for this semester.</p>
                            </div>
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="w-[60px] font-bold text-muted-foreground pl-6 whitespace-nowrap">S.No</TableHead>
                            <TableHead className="font-bold text-muted-foreground whitespace-nowrap">Subject Name</TableHead>
                            <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">Subject Code</TableHead>
                            <TableHead className="font-bold text-muted-foreground text-center whitespace-nowrap">Grade</TableHead>
                            <TableHead className="font-bold text-success text-center border-l border-white/5 whitespace-nowrap">GPA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMarks.length > 0 ? filteredMarks.map((item, idx) => (
                            <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="pl-6 font-medium text-muted-foreground">{idx + 1}</TableCell>
                                <TableCell className="font-bold text-sm tracking-tight whitespace-nowrap">{item.subject}</TableCell>
                                <TableCell className="text-center text-xs font-mono text-muted-foreground">{item.code}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={cn("font-bold", getGradeColor(item.external))}>
                                        {item.external}
                                    </Badge>
                                </TableCell>
                                {idx === 0 && (
                                    <TableCell 
                                        rowSpan={filteredMarks.length} 
                                        className="text-center border-l border-white/5 bg-white/[0.02] p-4 min-w-[120px]"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1 h-full">
                                            <span className="text-2xl sm:text-3xl font-black text-success tracking-tighter">
                                                {filteredStats.cgpa > 0 ? filteredStats.cgpa.toFixed(2) : '-'}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Semester GPA</span>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="w-8 h-8 opacity-20" />
                                        <p>No external results available.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
          </div>
        </motion.div>

        {/* Previous Semester Grades */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Previous History
          </h3>
          <div className="space-y-4">
            {false ? (
              <div>Placeholder</div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-sm text-muted-foreground font-medium">No previous records found.</p>
                </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-xl group" disabled>
            Detailed Performance Report
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
