import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard, GlassStatCard, ProgressCard } from '@/components/dashboard/StatCards';
import { 
  TrendingUp, 
  BookOpen, 
  ClipboardCheck, 
  Trophy,
  Calendar,
  FileText,
  Clock,
  Target,
  Award,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentMarks, getStudents, getAssignments, getSubmissions, Assignment, Submission, Student } from '@/lib/data-store';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentStats, setStudentStats] = useState({
    attendance: 0,
    internalAverage: 0,
    pendingTasks: 0,
    ecaPoints: 0
  });
  
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [subjectDist, setSubjectDist] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadStats();
    }
  }, [user]);

  const loadStats = () => {
    // 1. Get Student Details
    const allStudents = getStudents();
    const me = allStudents.find(s => s.id === user?.id || s.email === user?.email);
    
    // 2. Get Marks & Tasks
    const myMarks = user ? getStudentMarks(user.id) : [];
    const allAssignments = getAssignments();
    const allSubmissions = getSubmissions();
    
    // Filter assignments for student's class/section
    const myAssignments = allAssignments.filter(a => 
      me && (a.classId === me.batch || a.classId === me.year.toString()) && (a.sectionId === me.section || !a.sectionId)
    );
    
    // Find pending assignments (not submitted yet)
    const mySubmissions = allSubmissions.filter(s => s.studentId === (me?.id || user?.id));
    const pending = myAssignments.filter(a => !mySubmissions.find(s => s.assignmentId === a.id));

    let avgMarks = 0;
    if (myMarks.length > 0) {
      const totalObtained = myMarks.reduce((acc, curr) => acc + curr.marks, 0);
      const totalMax = myMarks.reduce((acc, curr) => acc + curr.maxMarks, 0);
      if (totalMax > 0) {
        avgMarks = (totalObtained / totalMax) * 100;
      }
    }

    setStudentStats({
      attendance: me ? me.attendance : 0,
      internalAverage: Number(avgMarks.toFixed(1)),
      pendingTasks: pending.length,
      ecaPoints: 0 // Resetting dummy data
    });

    // Populate upcoming tasks from pending assignments
    setUpcomingTasks(pending.slice(0, 3).map(a => ({
      title: a.title,
      type: 'assignment',
      due: a.dueDate,
      icon: FileText
    })));

    // Reset others to empty arrays as they were dummy data
    setAttendanceTrend([]);
    setSubjectDist([]);
    setRecentNotes([]);
  };

  if (!user || user.role !== 'student') {
     return (
       <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
         <AlertCircle className="w-12 h-12 mb-4" />
         <h2 className="text-2xl font-bold">Access Restricted</h2>
         <p>This dashboard is only for Students.</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground">Here's your academic overview for today</p>
        </div>
        <Button variant="gradient" className="w-fit">
          <Calendar className="w-4 h-4 mr-2" />
          View Timetable
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${studentStats.attendance}%`}
          subtitle="This semester"
          icon={TrendingUp}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Internal Average"
          value={studentStats.internalAverage}
          subtitle="Out of 100"
          icon={ClipboardCheck}
          variant="accent"
          delay={0.2}
        />
        <StatCard
          title="Pending Tasks"
          value={studentStats.pendingTasks}
          subtitle="Assignments & Quizzes"
          icon={BookOpen}
          variant="warning"
          delay={0.3}
        />
        <StatCard
          title="ECA Points"
          value={studentStats.ecaPoints}
          subtitle="This year"
          icon={Trophy}
          variant="success"
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Attendance Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly attendance percentage</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl">
            {attendanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                    {/* ... chart config ... */}
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-muted-foreground text-sm font-medium">No attendance data available yet.</p>
            )}
          </div>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl">
             {subjectDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    {/* ... chart config ... */}
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-muted-foreground text-sm font-medium">No marking data yet.</p>
             )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Cards */}
        <div className="space-y-4">
          <ProgressCard
            title="Resume Completion"
            value={0}
            color="primary"
            delay={0.5}
          />
          <ProgressCard
            title="Course Progress"
            value={0}
            color="accent"
            delay={0.6}
          />
        </div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? upcomingTasks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'assignment' ? 'bg-primary/10 text-primary' :
                    item.type === 'quiz' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {item.due}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.div>
              );
            }) : (
                <p className="text-muted-foreground text-sm text-center py-10">No upcoming tasks.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Notes</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentNotes.length > 0 ? recentNotes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{note.topic}</p>
                  <p className="text-xs text-muted-foreground">{note.subject} • {note.faculty}</p>
                </div>
              </motion.div>
            )) : (
                <p className="text-muted-foreground text-sm text-center py-10">No notes uploaded.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ECA & Achievements Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 text-white"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Level Up Your Profile!</h3>
              <p className="text-white/80">Add your ECA achievements and build your resume</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="glass" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
            <Button variant="glass" className="bg-white/20 hover:bg-white/30 text-white border-0">
              Build Resume
            </Button>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
}
