import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  GraduationCap,
  Calendar,
  Filter,
  Download,
  Search,
  PieChart as PieIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getTutors, getStudents, getMarks, Tutor, Student, MarkEntry } from '@/lib/data-store';

export default function ClassAnalytics() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<any>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Overview
        const ovRes = await fetch('http://localhost:3007/api/tutor-analytics/overview', { headers });
        const overview = await ovRes.json();
        if (overview.hasAssignment) {
          setTutor({
            section: overview.sectionName,
            batch: overview.batchName,
            studentsCount: overview.totalStudents,
            avgAttendance: overview.avgAttendance
          });
        }

        // 2. Attendance
        const attRes = await fetch('http://localhost:3007/api/tutor-analytics/attendance', { headers });
        const attendance = await attRes.json();
        setAttendanceTrend(attendance);

        // 3. Performance
        const perfRes = await fetch('http://localhost:3007/api/tutor-analytics/performance', { headers });
        const performance = await perfRes.json();
        setGradeDistribution(performance);

        // 4. Subjects
        const subRes = await fetch('http://localhost:3007/api/tutor-analytics/subjects', { headers });
        const subjects = await subRes.json();
        setSubjectPerformance(subjects);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching tutor analytics:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tutor) {
      return (
          <div className="text-center py-20 glass-card rounded-3xl">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h2 className="text-2xl font-black uppercase italic">No Assignment Found</h2>
              <p className="text-muted-foreground italic">You are not currently assigned as an active Class In-charge.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Class Analytics 📊</h1>
          <p className="text-muted-foreground font-medium">Performance insights for Section {tutor?.section} ({tutor?.batch})</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic">
            <Download className="w-4 h-4 mr-2 text-primary" />
            Download PDF
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-3xl border-none shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tight">Weekly Attendance</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Student Presence Count</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3">
                Avg: {Math.round(attendanceTrend.reduce((sum, d) => sum + d.count, 0) / (attendanceTrend.length || 1))} Present
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={40}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                  {attendanceTrend.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count < (tutor?.studentsCount || 0) * 0.75 ? 'hsl(var(--destructive))' : 'url(#barGrad)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-3xl border-none shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tight">Grade Spectrum</h3>
            <PieIcon className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {gradeDistribution.map((grade, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full shadow-glow" style={{ backgroundColor: grade.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{grade.name}: {grade.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl border-none shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10 blur-3xl" />
        <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Subject Integrity Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {subjectPerformance.map((sub, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
            >
              <p className="text-sm font-black italic uppercase tracking-tight group-hover:text-primary transition-colors">{sub.subject}</p>
              <div className="mt-6 space-y-4">
                <div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                     <span className="text-muted-foreground">Class Avg</span>
                     <span className="text-primary">{sub.avg}%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.avg}%` }}
                        className="h-full bg-primary shadow-glow shadow-primary/50" 
                     />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                     <span className="text-muted-foreground">Pass Index</span>
                     <span className="text-success">{sub.pass}%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.pass}%` }}
                        className="h-full bg-success shadow-glow shadow-success/50" 
                     />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

