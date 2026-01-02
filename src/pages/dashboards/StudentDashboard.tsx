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
import { API_BASE_URL } from '@/lib/api-config';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { calculateCurrentAcademicState } from '@/lib/academic-calendar';


export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentStats, setStudentStats] = useState({
    attendance: 0,
    internalAverage: 0,
    pendingTasks: 0,
    ecaPoints: 0
  });

  const [academicState, setAcademicState] = useState({ year: 1, semester: 1 });
  
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [subjectDist, setSubjectDist] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    if (studentData && studentData.batch) {
        setAcademicState(calculateCurrentAcademicState(studentData.batch));
    }
  }, [studentData]);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch student stats from API
      const response = await fetch(`${API_BASE_URL}/student-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Student stats loaded:', data);
        
        setStudentStats({
          attendance: data.attendance || 0,
          internalAverage: data.internalAverage || 0,
          pendingTasks: data.pendingTasks || 0,
          ecaPoints: data.ecaPoints || 0
        });

        setStudentData(data.studentInfo);

        // Fetch semester-based attendance trend from new API
        try {
          const trendResponse = await fetch(`${API_BASE_URL}/attendance-trend/student`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (trendResponse.ok) {
            const trendData = await trendResponse.json();
            // Map to expected format - using leaves + ods for chart
            const chartData = trendData.map((t: any) => ({
              month: t.month,
              attendance: (t.leaves || 0) + (t.ods || 0) // Total absence days
            }));
            setAttendanceTrend(chartData);
          }
        } catch (trendError) {
          console.error('Error fetching attendance trend:', trendError);
        }
      } else {
        console.error('Failed to load student stats');
      }
    } catch (error) {
      console.error('Error loading student stats:', error);
    }
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-sm sm:text-base text-muted-foreground">
                Year {academicState.year} • Semester {academicState.semester}
             </p>
             <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/5 border-primary/20 text-primary">
                {studentData?.batch || 'Batch N/A'}
             </Badge>
          </div>
        </div>
        <Button onClick={() => navigate('/student/timetable')} variant="gradient" size="sm" className="w-fit sm:size-default">
          <Calendar className="w-4 h-4 mr-2" />
          View Timetable
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 4xl:grid-cols-8 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 4xl:grid-cols-4 gap-6">
        {/* Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 4xl:col-span-3 glass-card rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Attendance Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly attendance percentage</p>
            </div>
          </div>
          <div className="h-64 sm:h-80 3xl:h-96">
            {attendanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#colorAttendance)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted-foreground/20 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No attendance data available yet.</p>
                </div>
            )}
          </div>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">Subject Distribution</h3>
          <div className="h-48 sm:h-64 3xl:h-80">
             {subjectDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={subjectDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {subjectDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed border-muted-foreground/20 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No marking data yet.</p>
                </div>
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
            value={studentData ? 60 : 30}
            color="primary"
            delay={0.5}
          />
          <ProgressCard
            title="ECA Analytics"
            value={studentStats.ecaPoints > 100 ? 100 : studentStats.ecaPoints} // Cap at 100 or use specific target logic
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

        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Updates</h3>
            <Button onClick={() => navigate('/student/circulars')} variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentUpdates.length > 0 ? recentUpdates.map((update, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    update.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{update.title}</p>
                  <p className="text-xs text-muted-foreground">{update.category} • {update.date}</p>
                </div>
              </motion.div>
            )) : (
                <p className="text-muted-foreground text-sm text-center py-10">No recent updates.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ECA & Achievements Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary p-4 sm:p-6 text-white"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Level Up Your Profile!</h3>
              <p className="text-sm sm:text-base text-white/80">Add your ECA achievements and build your resume</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={() => navigate('/student/eca')} variant="glass" size="sm" className="sm:size-default bg-white/20 hover:bg-white/30 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
            <Button onClick={() => navigate('/student/resume')} variant="glass" size="sm" className="sm:size-default bg-white/20 hover:bg-white/30 text-white border-0">
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
