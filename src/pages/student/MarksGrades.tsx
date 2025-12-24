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
import { getStudentMarks, MarkEntry } from '@/lib/data-store';

export default function MarksGrades() {
  const { user } = useAuth();
  const [marksData, setMarksData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    gpa: 0,
    rank: "N/A",
    totalPoints: 0
  });

  const [previousGrades, setPreviousGrades] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadMarks();
    }
  }, [user]);

  const loadMarks = () => {
    if (!user) return;
    const rawMarks = getStudentMarks(user.id);
    
    // Group marks by subject
    const subjects: Record<string, any> = {};
    
    rawMarks.forEach(mark => {
      if (!subjects[mark.subjectCode]) {
        subjects[mark.subjectCode] = {
            subject: mark.subjectCode, // Use code as name fallback
            code: mark.subjectCode,
            ia1: '-',
            ia2: '-',
            ia3: '-',
            assignment: '-',
            total: 0,
            external: 'Pending'
          };
      }
      
      if (mark.examType === 'ia1') subjects[mark.subjectCode].ia1 = mark.marks;
      if (mark.examType === 'ia2') subjects[mark.subjectCode].ia2 = mark.marks;
      if (mark.examType === 'model') subjects[mark.subjectCode].ia3 = mark.marks;
    });

    // Calculate totals and GPA for current semester
    let totalObtained = 0;
    let totalMax = 0;
    
    Object.values(subjects).forEach(sub => {
      let subTotal = 0;
      let count = 0;
      if (typeof sub.ia1 === 'number') { subTotal += sub.ia1; count++; }
      if (typeof sub.ia2 === 'number') { subTotal += sub.ia2; count++; }
      if (typeof sub.ia3 === 'number') { subTotal += sub.ia3; count++; }
      
      sub.total = subTotal; 
      
      // Calculate contribution to GPA
      totalObtained += subTotal;
      totalMax += 300; // Assuming 3 assessments of 100 each for simplicity or similar logic

      // Simple grade logic based on percentage of internal marks available
      const percentage = (subTotal / 300) * 100;
      if (percentage >= 90) sub.external = 'O';
      else if (percentage >= 80) sub.external = 'A+';
      else if (percentage >= 70) sub.external = 'A';
      else if (percentage >= 60) sub.external = 'B+';
      else if (percentage >= 50) sub.external = 'B';
      else if (percentage > 0) sub.external = 'C';
      else sub.external = 'Pending';
    });

    const currentGpa = totalMax > 0 ? (totalObtained / totalMax) * 10 : 0;

    setMarksData(Object.values(subjects));
    setStats({
        gpa: Number(currentGpa.toFixed(2)),
        rank: "N/A", // Calculation requires comparing with all students in the batch
        totalPoints: Number(currentGpa.toFixed(2))
    });

    // Clear previous grades as they were dummy
    setPreviousGrades([]);
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
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Marks & Grades</h1>
          <p className="text-muted-foreground">Track your academic performance and assessment results</p>
        </div>
          <div className="flex gap-2">
            <Select defaultValue="sem5">
              <SelectTrigger className="w-[180px] bg-background/50 border-white/10 rounded-xl">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem1">Semester 1</SelectItem>
                <SelectItem value="sem2">Semester 2</SelectItem>
                <SelectItem value="sem3">Semester 3</SelectItem>
                <SelectItem value="sem4">Semester 4</SelectItem>
                <SelectItem value="sem5">Semester 5</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="gradient" size="sm" disabled>
              Download Grade Sheet
            </Button>
          </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStatCard
          title="Current Semester GPA"
          value={stats.gpa === 0 ? "0.00" : stats.gpa.toString()}
          icon={TrendingUp}
          iconColor="text-primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Class Rank"
          value={stats.rank}
          icon={Award}
          iconColor="text-accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Cumulative GPA"
          value={stats.totalPoints === 0 ? "0.00" : stats.totalPoints.toString()}
          subtitle="All Semesters"
          icon={BarChart3}
          iconColor="text-success"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Internal Assessment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-primary/5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              < BookOpen className="w-5 h-5 text-primary" />
              Assessment Details
            </h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">In Progress</span>
          </div>
          <div className="p-0">
            <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="font-bold text-muted-foreground pl-6">Subject</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-center">IA-1</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-center">IA-2</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-center">Model</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-center">Assgn.</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-center">Grade</TableHead>
                    <TableHead className="font-bold text-primary text-right pr-6">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marksData.length > 0 ? marksData.map((item, idx) => (
                    <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="pl-6">
                        <p className="font-bold text-sm tracking-tight">{item.subject}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.code}</p>
                      </TableCell>
                      <TableCell className="text-center font-medium font-mono">{item.ia1}</TableCell>
                      <TableCell className="text-center font-medium font-mono">{item.ia2}</TableCell>
                      <TableCell className="text-center font-medium font-mono">{item.ia3}</TableCell>
                      <TableCell className="text-center font-medium font-mono">{item.assignment}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("font-bold", getGradeColor(item.external))}>
                          {item.external}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-black text-primary font-mono">{item.total}</span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                        <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="w-8 h-8 opacity-20" />
                            <p>No assessment records or marks released yet for this semester.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
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
            {previousGrades.length > 0 ? previousGrades.map((grade, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-muted/30 border border-transparent hover:border-accent/20 transition-all cursor-default group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{grade.sem}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-success">
                    <ArrowUpRight className="w-3 h-3" />
                    RANK {grade.rank}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-foreground font-mono">{grade.gpa.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{grade.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{grade.credits} Credits</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Earned</p>
                  </div>
                </div>
              </div>
            )) : (
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
