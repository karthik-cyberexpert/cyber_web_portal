import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatCard, GlassStatCard, ProgressCard } from '@/components/dashboard/StatCards';
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
  { month: 'Aug', students: 450, faculty: 25 },
  { month: 'Sep', students: 455, faculty: 25 },
  { month: 'Oct', students: 460, faculty: 26 },
  { month: 'Nov', students: 458, faculty: 26 },
  { month: 'Dec', students: 462, faculty: 27 },
];

const batchDistribution = [
  { name: '2021-2025', value: 240, color: '#6366f1' },
  { name: '2022-2026', value: 220, color: '#14b8a6' },
  { name: '2023-2027', value: 200, color: '#f59e0b' },
  { name: '2024-2028', value: 180, color: '#ec4899' },
];

const marksApprovalQueue = [
  { exam: 'IA1 - Data Structures', tutor: 'Prof. Lakshmi', section: 'CSE-A', count: 60, status: 'pending' },
  { exam: 'IA1 - DBMS', tutor: 'Dr. Ramesh', section: 'CSE-B', count: 58, status: 'pending' },
  { exam: 'IA2 - OS', tutor: 'Mr. Senthil', section: 'CSE-C', count: 55, status: 'pending' },
];

const recentActivities = [
  { action: 'Timetable Published', target: 'Semester 5', time: '2 hours ago', type: 'timetable' },
  { action: 'Circular Posted', target: 'Exam Schedule', time: '4 hours ago', type: 'circular' },
  { action: 'Faculty Assigned', target: 'Dr. Kumar to CSE-D', time: '1 day ago', type: 'faculty' },
  { action: 'Marks Approved', target: 'IA1 - All Sections', time: '2 days ago', type: 'marks' },
];

const semesterProgress = [
  { semester: 'Sem 1', progress: 100, status: 'completed' },
  { semester: 'Sem 2', progress: 100, status: 'completed' },
  { semester: 'Sem 3', progress: 100, status: 'completed' },
  { semester: 'Sem 4', progress: 100, status: 'completed' },
  { semester: 'Sem 5', progress: 65, status: 'active' },
  { semester: 'Sem 6', progress: 0, status: 'upcoming' },
  { semester: 'Sem 7', progress: 0, status: 'upcoming' },
  { semester: 'Sem 8', progress: 0, status: 'upcoming' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome, Dr. Rajesh! 🎓</h1>
          <p className="text-muted-foreground">Head of Department • Computer Science & Engineering</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Post Circular
          </Button>
          <Button variant="gradient">
            <Settings className="w-4 h-4 mr-2" />
            Department Settings
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value="840"
            subtitle="Across all batches"
            icon={GraduationCap}
            trend={{ value: 5, isPositive: true }}
            variant="primary"
            delay={0.1}
            onClick={() => navigate('/admin/students')}
          />
            <StatCard
              title="Faculty Members"
              value="27"
              subtitle="Including 8 tutors"
              icon={Users}
              variant="accent"
              delay={0.2}
              onClick={() => navigate('/admin/faculty')}
            />
            <StatCard
              title="Pending Leaves"
              value="14"
              subtitle="Awaiting approval"
              icon={ExternalLink}
              variant="success"
              delay={0.3}
              onClick={() => navigate('/admin/leave')}
            />
            <StatCard
              title="Approve Marks"
              value="8"
              subtitle="Awaiting approval"
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
            <Button variant="gradient" size="sm">Approve All</Button>
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
                  <Button variant="success" size="sm">
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
          <Button variant="outline" size="sm">Configure Dates</Button>
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
              { icon: BarChart3, label: 'Analytics', color: 'primary', path: '/admin/analytics' },
            ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
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
