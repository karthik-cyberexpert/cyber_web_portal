import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Award, 
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassStatCard } from '@/components/dashboard/StatCards';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MarksGrades() {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'A': return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'B+': return 'bg-teal-500/20 text-teal-600 border-teal-500/50';
      case 'B': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'C': return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'D': return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
      case 'U': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const internalMarks = [
    { subject: "Data Structures", code: "CS301", ia1: 22, ia2: 24, ia3: 21, assignment: 10, total: 77, external: 'A+' },
    { subject: "DBMS", code: "CS302", ia1: 18, ia2: 20, ia3: 19, assignment: 9, total: 66, external: 'A' },
    { subject: "Operating Systems", code: "CS303", ia1: 25, ia2: 23, ia3: 24, assignment: 10, total: 82, external: 'B+' },
    { subject: "Networks", code: "CS304", ia1: 20, ia2: 21, ia3: 18, assignment: 8, total: 67, external: 'B' },
  ];

  const grades = [
    { sem: "Semester 4", gpa: 9.12, status: "Outstanding", credits: 24, rank: "3rd" },
    { sem: "Semester 3", gpa: 8.85, status: "Excellent", credits: 21, rank: "5th" },
    { sem: "Semester 2", gpa: 8.56, status: "Very Good", credits: 22, rank: "12th" },
    { sem: "Semester 1", gpa: 8.80, status: "Excellent", credits: 24, rank: "8th" },
  ];

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
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Semester
          </Button>
          <Button variant="gradient" size="sm">
            Download Grade Sheet
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStatCard
          title="Last Semester GPA"
          value="9.12"
          icon={TrendingUp}
          color="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Class Rank"
          value="03 / 64"
          icon={Award}
          color="accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Total Points"
          value="8.82"
          subtitle="Cumulative GPA"
          icon={BarChart3}
          color="success"
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
              <BookOpen className="w-5 h-5 text-primary" />
              Internal Assessment - Semester 5
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
                  <TableHead className="font-bold text-muted-foreground text-center">IA-3</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-center">Assgn.</TableHead>
                  <TableHead className="font-bold text-primary text-right pr-6">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalMarks.map((item, idx) => (
                  <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6">
                      <p className="font-bold text-sm tracking-tight">{item.subject}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.code}</p>
                    </TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia1}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia2}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia3}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.assignment}</TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-black text-primary font-mono">{item.total}/100</span>
                    </TableCell>
                  </TableRow>
                ))}
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
            Previous Grades
          </h3>
          <div className="space-y-4">
            {grades.map((grade, idx) => (
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
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-xl group">
            Detailed Performance Report
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Award, 
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  Filter,
  CheckCircle2
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

export default function MarksGrades() {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'A': return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'B+': return 'bg-teal-500/20 text-teal-600 border-teal-500/50';
      case 'B': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'C': return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'D': return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
      case 'U': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const internalMarks = [
    { subject: "Data Structures", code: "CS301", ia1: 22, ia2: 24, ia3: 21, assignment: 10, total: 77, external: 'A+' },
    { subject: "DBMS", code: "CS302", ia1: 18, ia2: 20, ia3: 19, assignment: 9, total: 66, external: 'A' },
    { subject: "Operating Systems", code: "CS303", ia1: 25, ia2: 23, ia3: 24, assignment: 10, total: 82, external: 'B+' },
    { subject: "Networks", code: "CS304", ia1: 20, ia2: 21, ia3: 18, assignment: 8, total: 67, external: 'B' },
  ];

  const grades = [
    { sem: "Semester 4", gpa: 9.12, status: "Outstanding", credits: 24, rank: "3rd" },
    { sem: "Semester 3", gpa: 8.85, status: "Excellent", credits: 21, rank: "5th" },
    { sem: "Semester 2", gpa: 8.56, status: "Very Good", credits: 22, rank: "12th" },
    { sem: "Semester 1", gpa: 8.80, status: "Excellent", credits: 24, rank: "8th" },
  ];

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
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Semester
          </Button>
          <Button variant="gradient" size="sm">
            Download Grade Sheet
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStatCard
          title="Last Semester GPA"
          value="9.12"
          icon={TrendingUp}
          color="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Class Rank"
          value="03 / 64"
          icon={Award}
          color="accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Total Points"
          value="8.82"
          subtitle="Cumulative GPA"
          icon={BarChart3}
          color="success"
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
              <BookOpen className="w-5 h-5 text-primary" />
              Internal Assessment - Semester 5
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
                  <TableHead className="font-bold text-muted-foreground text-center">IA-3</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-center">Assgn.</TableHead>
                  <TableHead className="font-bold text-primary text-right pr-6">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalMarks.map((item, idx) => (
                  <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6">
                      <p className="font-bold text-sm tracking-tight">{item.subject}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.code}</p>
                    </TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia1}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia2}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia3}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.assignment}</TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-black text-primary font-mono">{item.total}/100</span>
                    </TableCell>
                  </TableRow>
                ))}
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
            Previous Grades
          </h3>
          <div className="space-y-4">
            {grades.map((grade, idx) => (
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
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-xl group">
            Detailed Performance Report
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Award, 
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  Filter,
  CheckCircle2
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

export default function MarksGrades() {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'A': return 'bg-green-500/20 text-green-600 border-green-500/50';
      case 'B+': return 'bg-teal-500/20 text-teal-600 border-teal-500/50';
      case 'B': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'C': return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
      case 'D': return 'bg-orange-500/20 text-orange-600 border-orange-500/50';
      case 'U': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const internalMarks = [
    { subject: "Data Structures", code: "CS301", ia1: 22, ia2: 24, ia3: 21, assignment: 10, total: 77, external: 'A+' },
    { subject: "DBMS", code: "CS302", ia1: 18, ia2: 20, ia3: 19, assignment: 9, total: 66, external: 'A' },
    { subject: "Operating Systems", code: "CS303", ia1: 25, ia2: 23, ia3: 24, assignment: 10, total: 82, external: 'B+' },
    { subject: "Networks", code: "CS304", ia1: 20, ia2: 21, ia3: 18, assignment: 8, total: 67, external: 'B' },
  ];

  const grades = [
    { sem: "Semester 4", gpa: 9.12, status: "Outstanding", credits: 24, rank: "3rd" },
    { sem: "Semester 3", gpa: 8.85, status: "Excellent", credits: 21, rank: "5th" },
    { sem: "Semester 2", gpa: 8.56, status: "Very Good", credits: 22, rank: "12th" },
    { sem: "Semester 1", gpa: 8.80, status: "Excellent", credits: 24, rank: "8th" },
  ];

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
            <Button variant="gradient" size="sm">
              Download Grade Sheet
            </Button>
          </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStatCard
          title="Last Semester GPA"
          value="9.12"
          icon={TrendingUp}
          color="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Class Rank"
          value="03 / 64"
          icon={Award}
          color="accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Total Points"
          value="8.82"
          subtitle="Cumulative GPA"
          icon={BarChart3}
          color="success"
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
              <BookOpen className="w-5 h-5 text-primary" />
              Internal Assessment - Semester 5
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
                  <TableHead className="font-bold text-muted-foreground text-center">IA-3</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-center">Assgn.</TableHead>
                  <TableHead className="font-bold text-primary text-right pr-6">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {internalMarks.map((item, idx) => (
                  <TableRow key={idx} className="group border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6">
                      <p className="font-bold text-sm tracking-tight">{item.subject}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{item.code}</p>
                    </TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia1}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia2}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.ia3}</TableCell>
                    <TableCell className="text-center font-medium font-mono">{item.assignment}</TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="font-black text-primary font-mono">{item.total}/100</span>
                    </TableCell>
                  </TableRow>
                ))}
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
            Previous Grades
          </h3>
          <div className="space-y-4">
            {grades.map((grade, idx) => (
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
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-xl group">
            Detailed Performance Report
            <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
