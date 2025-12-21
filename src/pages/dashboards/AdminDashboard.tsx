import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCards';
import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  FileCheck,
  Bell,
  Calendar,
  TrendingUp,
  BarChart3,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  BookOpen,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getData } from '@/lib/data-store';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const departmentStats = [
  { month: 'Jan', students: 400, faculty: 24 },
  { month: 'Feb', students: 450, faculty: 25 },
  { month: 'Mar', students: 480, faculty: 26 },
  { month: 'Apr', students: 510, faculty: 28 },
  { month: 'May', students: 540, faculty: 30 },
  { month: 'Jun', students: 580, faculty: 32 },
];

const batchDistribution = [
  { name: 'Batch 2021-25', value: 160, color: 'hsl(var(--primary))' },
  { name: 'Batch 2022-26', value: 140, color: 'hsl(var(--accent))' },
  { name: 'Batch 2023-27', value: 150, color: 'hsl(var(--success))' },
  { name: 'Batch 2024-28', value: 130, color: 'hsl(var(--warning))' },
];

const marksApprovalQueue = [
  { exam: 'End-Sem Theory Portions', tutor: 'Prof. Amrita', section: 'CSE-A', count: 64 },
  { exam: 'Internal Assessment 2', tutor: 'Dr. Ramesh', section: 'CSE-B', count: 62 },
  { exam: 'Practical Exam Viva', tutor: 'Prof. Suresh', section: 'CSE-C', count: 60 },
];

const recentActivities = [
  { type: 'circular', action: 'Posted New Circular', target: 'Regarding Semester Holidays', time: '2h ago' },
  { type: 'marks', action: 'Approved Internal Marks', target: 'Data Structures • Section B', time: '4h ago' },
  { type: 'timetable', action: 'Updated Timetable', target: 'Third Year • Semester 6', time: '1d ago' },
  { type: 'faculty', action: 'New Faculty Joined', target: 'Dr. Preeti • AI/ML Dept', time: '2d ago' },
];

const semesterProgress = [
  { semester: 'Sem 1', progress: 100, status: 'completed' },
  { semester: 'Sem 2', progress: 100, status: 'completed' },
  { semester: 'Sem 3', progress: 100, status: 'completed' },
  { semester: 'Sem 4', progress: 100, status: 'completed' },
  { semester: 'Sem 5', progress: 100, status: 'completed' },
  { semester: 'Sem 6', progress: 100, status: 'completed' },
  { semester: 'Sem 7', progress: 45, status: 'active' },
  { semester: 'Sem 8', progress: 0, status: 'pending' },
];

interface LeaveRequest {
  status: string;
}

interface MarksInternal {
  status: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    pendingLeaves: 0,
    pendingMarks: 0
  });

  useEffect(() => {
    const studentsArr = getData<unknown[]>('college_portal_students') || [];
    const facultyArr = getData<unknown[]>('college_portal_faculty') || [];
    const leavesArr = getData<LeaveRequest[]>('college_portal_leave_requests') || [];
    const marksArr = getData<MarksInternal[]>('college_portal_marksInternal') || [];
    
    const pendingAdminMarks = marksArr.filter((m) => m.status === 'pending_admin');

    setStats({
      students: studentsArr.length,
      faculty: facultyArr.length,
      pendingLeaves: leavesArr.filter((l) => l.status === 'pending').length,
      pendingMarks: pendingAdminMarks.length
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome, Dr. Rajesh! 🎓</h1>
          <p className="text-muted-foreground">Head of Department • Computer Science & Engineering</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/circulars')}>
            <Bell className="w-4 h-4 mr-2" />
            Post Circular
          </Button>
          <Button variant="gradient" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Department Settings
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.students}
          subtitle="Across all batches"
          icon={GraduationCap}
          variant="primary"
          delay={0.1}
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Faculty Members"
          value={stats.faculty}
          subtitle="Department staff"
          icon={Users}
          variant="accent"
          delay={0.2}
          onClick={() => navigate('/admin/faculty')}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          subtitle="Awaiting HOD approval"
          icon={ExternalLink}
          variant="success"
          delay={0.3}
          onClick={() => navigate('/admin/leave')}
        />
        <StatCard
          title="Approve Marks"
          value={stats.pendingMarks}
          subtitle="Awaiting final approval"
          icon={ClipboardCheck}
          variant="warning"
          delay={0.4}
          onClick={() => navigate('/admin/marks')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Department Overview</h3>
              <p className="text-sm text-muted-foreground">Student & Faculty trends</p>
            </div>
            <Button variant="outline" size="sm">Export Report</Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar yAxisId="left" dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Students" />
                <Bar yAxisId="right" dataKey="faculty" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Batch Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Batch Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={batchDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {batchDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {batchDistribution.map((batch, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: batch.color }}
                />
                <span className="text-xs text-muted-foreground">{batch.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marks Approval Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Marks Approval Queue</h3>
            <Button variant="gradient" size="sm" onClick={() => navigate('/admin/marks')}>Approve All</Button>
          </div>
          <div className="space-y-3">
            {marksApprovalQueue.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.exam}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.tutor} • {item.section} • {item.count} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="success" size="sm" onClick={() => navigate('/admin/marks')}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const icons: Record<string, React.ElementType> = {
                timetable: Calendar,
                circular: Bell,
                faculty: Users,
                marks: ClipboardCheck,
              };
              const Icon = icons[activity.type] || Bell;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.target}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Semester Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Semester Progress (2021-2025 Batch)</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')}>Configure Dates</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {semesterProgress.map((sem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className={`p-4 rounded-xl text-center ${
                sem.status === 'completed' ? 'bg-success/10' :
                sem.status === 'active' ? 'bg-primary/10 ring-2 ring-primary' :
                'bg-muted/50'
              }`}
            >
              <p className="text-sm font-medium mb-2">{sem.semester}</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sem.status === 'completed' ? 'bg-success' :
                    sem.status === 'active' ? 'bg-primary' :
                    'bg-muted-foreground/30'
                  }`}
                  style={{ width: `${sem.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {sem.status === 'completed' ? 'Done' :
                 sem.status === 'active' ? `${sem.progress}%` :
                 'Upcoming'}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: Users, label: 'Manage Students', color: 'primary', path: '/admin/students' },
            { icon: GraduationCap, label: 'Manage Faculty', color: 'accent', path: '/admin/faculty' },
            { icon: ExternalLink, label: 'Leave Approvals', color: 'success', path: '/admin/leave' },
            { icon: ClipboardCheck, label: 'Approve Marks', color: 'warning', path: '/admin/marks' },
            { icon: Bell, label: 'Post Circular', color: 'info', path: '/admin/circulars' },
            { icon: BarChart3, label: 'Analytics', color: 'primary', path: '/admin/settings' },
          ].map((action, index) => {
            const Icon = action.icon;
            const colorMap: Record<string, string> = {
              primary: 'bg-primary/10 text-primary',
              accent: 'bg-accent/10 text-accent',
              success: 'bg-success/10 text-success',
              warning: 'bg-warning/10 text-warning',
              info: 'bg-info/10 text-info',
            };
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all text-center group"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${colorMap[action.color]} group-hover:scale-110 transition-transform`}>
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
