import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/dashboard/StatCards';
import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  Bell,
  Calendar,
  BarChart3,
  ExternalLink,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getData, 
  getStudents, 
  getFaculty, 
  getMarks, 
  getLeaveRequests,
  getCirculars,
  Student, 
  Faculty, 
  MarkEntry,
  LEAVE_KEY
} from '@/lib/data-store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    pendingLeaves: 0,
    pendingMarks: 0
  });

  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [batchDistribution, setBatchDistribution] = useState<any[]>([]);
  const [marksApprovalQueue, setMarksApprovalQueue] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const studentsArr = getStudents();
    const facultyArr = getFaculty();
    const marksArr = getMarks();
    const leavesArr = getLeaveRequests();
    const circularsArr = getCirculars();
    
    // Calculate Stats
    setStats({
      students: studentsArr.length,
      faculty: facultyArr.length,
      pendingLeaves: leavesArr.filter((l: any) => l.status === 'pending').length,
      pendingMarks: marksArr.filter((m: MarkEntry) => m.status === 'verified').length
    });

    // Calculate Department Stats (Real Cumulative Growth)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(now.getMonth() - 5 + i);
        return d;
    });

    const statsData = last6Months.map(date => {
        const monthYear = `${months[date.getMonth()]}`;
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return {
            month: monthYear,
            students: studentsArr.filter(s => new Date(s.createdAt) <= endOfMonth).length,
            faculty: facultyArr.filter(f => new Date(f.createdAt) <= endOfMonth).length
        };
    });
    setDepartmentStats(statsData);

    // Calculate Batch Distribution
    const batchCounts = studentsArr.reduce((acc: any, student) => {
        acc[student.batch] = (acc[student.batch] || 0) + 1;
        return acc;
    }, {});

    const batchColors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];
    const batchDist = Object.keys(batchCounts).map((batch, index) => ({
        name: `Batch ${batch}`,
        value: batchCounts[batch],
        color: batchColors[index % batchColors.length]
    }));
    setBatchDistribution(batchDist);

    // Calculate Marks Approval Queue
    const pending = marksArr.filter(m => m.status === 'verified');
    const groupedPending = pending.reduce((acc: any, mark) => {
        const key = `${mark.subjectCode}-${mark.examType}`; 
        if (!acc[key]) {
            acc[key] = {
                exam: mark.examType.toUpperCase(),
                subject: mark.subjectCode,
                count: 0,
                section: 'Unknown' 
            };
        }
        acc[key].count++;
        const student = studentsArr.find(s => s.id === mark.studentId);
        if (student) acc[key].section = student.section;
        return acc;
    }, {});
    setMarksApprovalQueue(Object.values(groupedPending));

    // Recent Activities (Combined Source)
    const activities = [
        ...studentsArr.map(s => ({ type: 'student', action: 'New Student Joined', target: `${s.name} • ${s.batch}`, time: s.createdAt })),
        ...facultyArr.map(f => ({ type: 'faculty', action: 'New Faculty Joined', target: `${f.name} • ${f.designation}`, time: f.createdAt })),
        ...circularsArr.map(c => ({ type: 'circular', action: 'Notice Posted', target: c.title, time: c.createdAt })),
        ...leavesArr.filter(l => l.status !== 'pending').map(l => ({ 
            type: 'leave', 
            action: `Leave ${l.status}`, 
            target: `${l.userName} (${l.type})`, 
            time: l.processedDate || l.createdAt 
        })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
    
    const formattedActivities = activities.map(a => {
        const dateString = new Date(a.time).toLocaleDateString();
        // Simple relative time approximation
        const diffMs = now.getTime() - new Date(a.time).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60) ;
        const diffDays = Math.floor(diffHours / 24);
        
        let relativeTime = dateString;
        if (diffDays > 0) relativeTime = `${diffDays}d ago`;
        else if (diffHours > 0) relativeTime = `${diffHours}h ago`;
        else if (diffMins > 0) relativeTime = `${diffMins}m ago`;
        else relativeTime = 'Just now';

        return {
            ...a,
            time: relativeTime
        };
    });
    setRecentActivities(formattedActivities);

  }, []);

  // Calculate Semester Progress based on actual active batch
  const calculateSemesterProgress = () => {
    const students = getStudents();
    
    // Determine the most common batch or use the most recent batch
    const batches = [...new Set(students.map(s => s.batch))];
    const currentBatch = batches.length > 0 ? batches[0] : 'Active Batch';
    
    // Extract start year from batch name (assuming format like '2021-2025')
    const startYear = parseInt(currentBatch.split('-')[0]) || new Date().getFullYear() - 1;
    const now = new Date();
    const semesters = [];
    
    for (let i = 1; i <= 8; i++) {
        const semStartYear = startYear + Math.floor((i - 1) / 2);
        const isOdd = i % 2 !== 0;
        const semStartDate = new Date(semStartYear, isOdd ? 6 : 0, 1); // July or Jan
        const semEndDate = new Date(semStartYear + (isOdd ? 0 : 0), isOdd ? 11 : 5, 30); // Dec or June
        
        let status: 'completed' | 'active' | 'pending' = 'pending';
        let progress = 0;
        
        if (now > semEndDate) {
            status = 'completed';
            progress = 100;
        } else if (now >= semStartDate && now <= semEndDate) {
            status = 'active';
            const total = semEndDate.getTime() - semStartDate.getTime();
            const elapsed = now.getTime() - semStartDate.getTime();
            progress = Math.round((elapsed / total) * 100);
        }
        
        semesters.push({
            semester: `Sem ${i}`,
            progress,
            status
        });
    }
    return semesters;
  };

  const semesterProgress = calculateSemesterProgress();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome Back, Admin! 🎓</h1>
          <p className="text-muted-foreground">Manage your institution efficiently</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/circulars')}>
            <Bell className="w-4 h-4 mr-2" />
            Post Circular
          </Button>
          <Button variant="gradient" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            System Settings
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
          subtitle="Institution staff"
          icon={Users}
          variant="accent"
          delay={0.2}
          onClick={() => navigate('/admin/faculty')}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          subtitle="Awaiting approval"
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
              <h3 className="text-lg font-semibold">Institution Overview</h3>
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
            {batchDistribution.length === 0 && (
                 <div className="col-span-2 text-center text-sm text-muted-foreground">No batches found</div>
            )}
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
            {marksApprovalQueue.length > 0 ? marksApprovalQueue.map((item, index) => (
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
                    <p className="font-medium text-sm">{item.subject} - {item.exam}</p>
                    <p className="text-xs text-muted-foreground">
                       Section {item.section} • {item.count} students
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
            )) : (
                <div className="text-center py-4 text-muted-foreground">No pending marks for approval</div>
            )}
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
            {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
              const icons: Record<string, React.ElementType> = {
                timetable: Calendar,
                circular: Bell,
                faculty: Users,
                marks: ClipboardCheck,
                student: GraduationCap,
                leave: ExternalLink
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
            }) : (
                <div className="text-center py-4 text-muted-foreground">No recent activities</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Semester Progress (Active Batch) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Semester Progress ({getStudents().length > 0 ? getStudents()[0].batch : 'Active Batch'})</h3>
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

