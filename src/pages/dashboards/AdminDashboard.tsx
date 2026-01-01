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
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
// Remvoing getStudents etc as we move to API
import { 
  getData, 
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
import SemesterDatePopup from '@/components/admin/SemesterDatePopup';

interface PendingBatch {
  id: number;
  name: string;
  current_semester: number;
  department_name: string;
  semester_start_date: string | null;
  semester_end_date: string | null;
}

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
  
  // Semester Popup State
  const [pendingBatches, setPendingBatches] = useState<PendingBatch[]>([]);
  const [currentPendingBatch, setCurrentPendingBatch] = useState<PendingBatch | null>(null);

  // Fetch pending semester updates
  const fetchPendingSemesterUpdates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/academic/pending-semester-updates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const batches = await response.json();
        setPendingBatches(batches);
        if (batches.length > 0) {
          setCurrentPendingBatch(batches[0]);
        } else {
          setCurrentPendingBatch(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pending semester updates:', error);
    }
  };

  const handleSemesterDateSaved = () => {
    // Remove the saved batch from pending list and show next one
    const remaining = pendingBatches.filter(b => b.id !== currentPendingBatch?.id);
    setPendingBatches(remaining);
    if (remaining.length > 0) {
      setCurrentPendingBatch(remaining[0]);
    } else {
      setCurrentPendingBatch(null);
    }
  };

  useEffect(() => {
    // Check for pending semester updates first
    fetchPendingSemesterUpdates();
    
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          
          // Fetch attendance trend for active batches
          try {
            const trendResponse = await fetch(`${API_BASE_URL}/attendance-trend/admin`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (trendResponse.ok) {
              const trendData = await trendResponse.json();
              // Transform trend data for the chart
              const chartData = trendData.trend?.map((t: any) => ({
                month: t.month,
                students: t.leaves || 0, // Using leaves as primary
                faculty: t.ods || 0 // Using ODs as secondary
              })) || [];
              setDepartmentStats(chartData.length > 0 ? chartData : [
                { month: 'Jan', students: 0, faculty: 0 },
                { month: 'Feb', students: 0, faculty: 0 },
                { month: 'Mar', students: 0, faculty: 0 }
              ]);
              
              // Set batch distribution from ALL batches with real student counts
              const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--destructive))'];
              const batchData = trendData.batches?.map((b: any, i: number) => ({
                name: b.name,
                value: b.studentCount || 0,  // Use actual student count
                fill: colors[i % colors.length]
              })) || [];
              setBatchDistribution(batchData);
            }
          } catch (trendError) {
            console.error('Failed to fetch attendance trend:', trendError);
          }
          
           setRecentActivities([
            { id: 1, type: 'Registration', message: 'New Student Registered', time: '2 mins ago', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
            { id: 2, type: 'Leave', message: 'Leave Request Approved', time: '15 mins ago', icon: Clock, color: 'text-green-500', bg: 'bg-green-100' },
            { id: 3, type: 'Academic', message: 'Marksheet Generated', time: '1 hour ago', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-100' },
           ]);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Calculate Semester Progress based on actual active batch
  const calculateSemesterProgress = () => {
    // Mocking for now as we transition to API
    const currentBatch = '2023-2027';
    
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
      {/* Semester Date Popup - Shows when batch semester end date has passed */}
      {currentPendingBatch && (
        <SemesterDatePopup 
          batch={currentPendingBatch} 
          onSave={handleSemesterDateSaved}
        />
      )}
      
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
              <h3 className="text-lg font-semibold">Attendance Trend</h3>
              <p className="text-sm text-muted-foreground">Leave & OD Days (Active Semesters)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              // In a real application, this would export the report
              alert('Report export functionality would be implemented here');
            }}>Export Report</Button>
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
                <Bar yAxisId="left" dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Leave Days" />
                <Bar yAxisId="right" dataKey="faculty" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="OD Days" />
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
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/marks')}>View All</Button>
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
                  <Button variant="success" size="sm" onClick={() => navigate(`/admin/marks?subject=${item.subject}&exam=${item.exam}`)}>
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
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')}>View All</Button>
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
          <h3 className="text-lg font-semibold">Semester Progress (Active Batch)</h3>
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

