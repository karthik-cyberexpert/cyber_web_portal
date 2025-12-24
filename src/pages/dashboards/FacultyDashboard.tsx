import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard, GlassStatCard, ProgressCard } from '@/components/dashboard/StatCards';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  FileUp,
  Calendar,
  Clock,
  ChevronRight,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTimetable, 
  getAssignments, 
  getSubmissions, 
  getMarks, 
  getStudents, 
  getResources,
  getFaculty,
  TimetableSlot, 
  Assignment, 
  Submission, 
  MarkEntry,
  Faculty
} from '@/lib/data-store';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [classesData, setClassesData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [marksEntryStatus, setMarksEntryStatus] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayClasses: 0,
    todayHours: 0,
    subjects: 0,
    sections: 0,
    pendingEvaluations: 0,
    notesUploaded: 0
  });

  useEffect(() => {
    if (!user) return;

    const allFaculty = getFaculty();
    const currentFaculty = allFaculty.find(f => f.id === user.id || f.email === user.email);
    
    const allTimetable = getTimetable();
    const allAssignments = getAssignments();
    const allSubmissions = getSubmissions();
    const allMarks = getMarks();
    const allStudents = getStudents();
    const allResources = getResources();

    // Filter timetable for this faculty
    const mySchedule = allTimetable.filter(t => t.facultyId === user.id || t.facultyName === user.name);
    
    // Today's schedule
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todaysClasses = mySchedule
      .filter(t => t.day === today)
      .sort((a, b) => a.period - b.period)
      .map(t => ({
        subject: t.subject,
        section: t.sectionId || 'N/A',
        time: getTimeFromPeriod(t.period),
        room: t.room || 'TBD',
        status: 'upcoming'
      }));
    setClassesData(todaysClasses);

    // Weekly Stats
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const wStats = weekDays.map(day => {
        const dayClasses = mySchedule.filter(t => t.day === day);
        return {
            day: day.substring(0, 3),
            classes: dayClasses.length,
            hours: dayClasses.length
        };
    });
    setWeeklyStats(wStats);

    // Filter assignments by my subjects/sections
    const myAssignments = allAssignments.filter(a => 
      a.facultyId === user.id || 
      (currentFaculty && currentFaculty.subjects.includes(a.subjectCode || ''))
    );

    const pSubmissions = myAssignments.map(a => {
        const matchingStudents = allStudents.filter(s => 
          (s.batch === a.classId || s.year.toString() === a.classId) && 
          (!a.sectionId || s.section === a.sectionId)
        );
        const submitted = allSubmissions.filter(s => s.assignmentId === a.id).length;
        return {
            assignment: a.title,
            section: a.sectionId || a.classId,
            submitted: submitted,
            total: matchingStudents.length || 1,
            id: a.id
        };
    }).slice(0, 3);
    setPendingSubmissions(pSubmissions);

    // Calculate marks entry status
    if (currentFaculty) {
      const marksNeeded = currentFaculty.subjects.map(subjectCode => {
        const sections = currentFaculty.sections;
        return sections.map(section => {
          const studentsInSection = allStudents.filter(s => s.section === section);
          const ia1Marks = allMarks.filter(m => m.subjectCode === subjectCode && m.examType === 'ia1');
          const missing = studentsInSection.length - ia1Marks.length;
          return {
            subject: subjectCode,
            section: section,
            missing: Math.max(0, missing)
          };
        });
      }).flat().filter(m => m.missing > 0).slice(0, 3);
      setMarksEntryStatus(marksNeeded);
    }

    // Top Stats
    const totalSubjects = currentFaculty ? currentFaculty.subjects.length : new Set(mySchedule.map(s => s.subjectCode)).size;
    const totalSections = currentFaculty ? currentFaculty.sections.length : new Set(mySchedule.map(s => s.sectionId)).size;
    const pendingEvals = allSubmissions.filter(s => 
        myAssignments.find(a => a.id === s.assignmentId) && s.status === 'submitted'
    ).length;
    
    const myResources = allResources.filter(r => r.facultyId === user.id || r.facultyName === user.name);

    setStats({
        todayClasses: todaysClasses.length,
        todayHours: todaysClasses.length,
        subjects: totalSubjects,
        sections: totalSections,
        pendingEvaluations: pendingEvals,
        notesUploaded: myResources.length
    });

  }, [user]);

  const getTimeFromPeriod = (p: number) => {
      const times = ['9:00 AM', '9:50 AM', '10:50 AM', '11:40 AM', '1:30 PM', '2:20 PM', '3:20 PM', '4:10 PM'];
      return times[p - 1] || 'Unknown';
  };

  const getStudentCountOriginal = (classId: string, sectionId: string, allStudents: any[]) => {
      // Logic to count students matching class/section
      // If classId is "4th Year" or "2021-2025", match batch or year
      return allStudents.filter(s => 
          (s.batch === classId || s.year.toString() === classId) && 
          (!sectionId || s.section === sectionId)
      ).length;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Good Morning, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
          <p className="text-muted-foreground">You have {stats.todayClasses} classes scheduled for today</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            My Timetable
          </Button>
          <Button variant="gradient">
            <Upload className="w-4 h-4 mr-2" />
            Upload Notes
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Classes"
          value={stats.todayClasses}
          subtitle={`${stats.todayHours} hours total`}
          icon={Clock}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Subjects Handled"
          value={stats.subjects}
          subtitle={`Across ${stats.sections} sections`}
          icon={BookOpen}
          variant="accent"
          delay={0.2}
        />
        <StatCard
          title="Pending Evaluation"
          value={stats.pendingEvaluations}
          subtitle="Submissions to review"
          icon={ClipboardCheck}
          variant="warning"
          delay={0.3}
        />
        <StatCard
          title="Notes Uploaded"
          value={stats.notesUploaded}
          subtitle="This semester"
          icon={FileUp}
          variant="success"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Today's Schedule</h3>
              <p className="text-sm text-muted-foreground">Your classes for today</p>
            </div>
            <Button variant="outline" size="sm">Full Timetable</Button>
          </div>
          <div className="space-y-4">
            {classesData.length > 0 ? classesData.map((cls, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer group"
              >
                <div className="w-16 text-center">
                  <p className="text-sm font-bold text-primary">{cls.time}</p>
                </div>
                <div className="w-1 h-12 bg-gradient-primary rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold">{cls.subject}</p>
                  <p className="text-sm text-muted-foreground">{cls.section} • Room {cls.room}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    Upcoming
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.div>
            )) : (
                <div className="text-center py-8 text-muted-foreground">No classes scheduled for today</div>
            )}
          </div>
        </motion.div>

        {/* Weekly Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Weekly Overview</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="classes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary/10">
            <p className="text-sm text-center">
              <span className="font-semibold text-primary">{weeklyStats.reduce((acc, curr) => acc + curr.classes, 0)} classes</span>
              <span className="text-muted-foreground"> this week</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Evaluations</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {pendingSubmissions.length > 0 ? pendingSubmissions.map((item, index) => {
              const percentage = item.total > 0 ? (item.submitted / item.total) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.assignment}</p>
                      <p className="text-xs text-muted-foreground section-badge">{item.section}</p>
                    </div>
                    <span className="text-sm font-medium">
                      {item.submitted}/{item.total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-accent rounded-full"
                    />
                  </div>
                </div>
              );
            }) : (
                <div className="text-center py-4 text-muted-foreground">No pending evaluations</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Upload, label: 'Upload Notes', color: 'primary' },
            { icon: FileText, label: 'Create Assignment', color: 'accent' },
            { icon: ClipboardCheck, label: 'Enter Marks', color: 'warning' },
            { icon: Users, label: 'View Students', color: 'success' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all text-center group"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-${action.color}/10 text-${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

