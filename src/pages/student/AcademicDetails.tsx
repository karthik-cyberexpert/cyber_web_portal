import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock, 
  Layout, 
  ShieldCheck,
  TrendingUp,
  History,
  FileBadge,
  Calendar,
  User
} from 'lucide-react';
import { GlassStatCard } from '@/components/dashboard/StatCards';
import { cn } from '@/lib/utils';

export default function AcademicDetails() {
  const semesters = [
    { sem: 1, gpa: 8.8, status: "Completed", credits: 24 },
    { sem: 2, gpa: 8.5, status: "Completed", credits: 22 },
    { sem: 3, gpa: 8.9, status: "Completed", credits: 21 },
    { sem: 4, gpa: 9.1, status: "Completed", credits: 24 },
    { sem: 5, gpa: 8.7, status: "On-going", credits: 23 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Academic Overview</h1>
        <p className="text-muted-foreground">Detailed track record of your academic journey and achievements</p>
      </motion.div>

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatCard
          title="Current CGPA"
          value="8.82"
          icon={TrendingUp}
          color="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Total Credits"
          value="114"
          icon={Award}
          color="accent"
          delay={0.2}
        />
        <GlassStatCard
          title="Backlogs"
          value="00"
          icon={ShieldCheck}
          color="success"
          delay={0.3}
        />
        <GlassStatCard
          title="Semesters"
          value="04/08"
          icon={History}
          color="warning"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">Programme</p>
              <p className="text-sm font-semibold">Bachelor of Engineering</p>
            </div>
          </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Academic Info</h3>
              {[
                { label: "Current Status", value: "Active", icon: ShieldCheck, color: "text-success" },
                { label: "Batch", value: "2021 - 2025", icon: Clock },
                { label: "Year", value: "Year 3", icon: Calendar },
                { label: "Semester", value: "Semester 5 (Odd)", icon: History },
                { label: "Class", value: "B.E. CSE", icon: Layout },
                { label: "Section", value: "Section A", icon: User },
                { label: "Class Tutor", value: "Mrs. Anitha", icon: User },
                { label: "Enrollment Type", value: "Regular", icon: BookOpen },
                { label: "Admission Type", value: "Counseling", icon: FileBadge },
                { label: "Current Papers", value: "6 Theory + 2 Labs", icon: BookOpen },
                { label: "Certifications", value: "3 Active", icon: Award },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <item.icon className={cn("w-5 h-5 text-muted-foreground", item.color)} />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
        </motion.div>

        {/* Semester History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6 text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
            <span>Semester Breakdown</span>
            <span>Performance Trend</span>
          </div>
          
          <div className="space-y-3">
            {semesters.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-all cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    s.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning animate-pulse"
                  }`}>
                    S{s.sem}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Semester {s.sem}</p>
                    <p className="text-xs text-muted-foreground">{s.credits} Credits • {s.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-primary font-mono">{s.gpa.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-tighter">GPA SCORE</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
