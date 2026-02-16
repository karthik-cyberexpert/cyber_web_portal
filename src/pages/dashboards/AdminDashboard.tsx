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
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  
  // Graph Data State
  const [rawTrendData, setRawTrendData] = useState<any[]>([]);
  const [rawBatches, setRawBatches] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

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

  // Re-calculate stats when month or raw data changes
  useEffect(() => {
    if (rawBatches.length === 0) return;

    const aggregatedData = rawBatches.map((batch: any) => {
        const safeName = batch.name.replace(/[^a-zA-Z0-9]/g, '_');
        
        let totalLeaves = 0;
        let totalODs = 0;

        if (selectedMonth === 'All') {
             // Sum up leaves and ODs across all months
             totalLeaves = rawTrendData.reduce((sum: number, month: any) => sum + (month[`${safeName}_leave`] || 0), 0);
             totalODs = rawTrendData.reduce((sum: number, month: any) => sum + (month[`${safeName}_od`] || 0), 0);
        } else {
             // Find specific month
             const monthData = rawTrendData.find((m: any) => m.month === selectedMonth);
             if (monthData) {
                 totalLeaves = monthData[`${safeName}_leave`] || 0;
                 totalODs = monthData[`${safeName}_od`] || 0;
             }
        }

        return {
            name: batch.name,
            leave: totalLeaves,
            od: totalODs
        };
    });
    
    setDepartmentStats(aggregatedData);

  }, [selectedMonth, rawTrendData, rawBatches]);
  
  // Initial Data Fetch
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
              const chartData = trendData.trend || [];
              const batches = trendData.batches || [];
              
              setRawTrendData(chartData);
              setRawBatches(batches);
              
              // Extract unique months for dropdown
              const months: string[] = Array.from(new Set(chartData.map((d: any) => d.month)));
              setAvailableMonths(months);
              
              // Batch distribution
              const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--destructive))'];
              const batchData = batches.map((b: any, i: number) => ({
                name: b.name,
                value: b.studentCount || 0,
                fill: colors[i % colors.length]
              }));
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
          onClose={() => setCurrentPendingBatch(null)}
        />
      )}
      
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold font-display">Welcome Back, Admin! 🎓</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your institution efficiently</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="xs:size-default" onClick={() => navigate('/admin/circulars')}>
            <Bell className="w-4 h-4 mr-2" />
            Post Circular
          </Button>
          <Button variant="gradient" size="sm" className="xs:size-default" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-4 4xl:grid-cols-8 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 4xl:grid-cols-4 gap-6">
        {/* Department Overview Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 4xl:col-span-3 glass-card rounded-2xl p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Attendance Overview (Batch-wise)</h3>
              <p className="text-sm text-muted-foreground">Combined Leave & OD Days by Batch</p>
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Months</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="h-64 sm:h-80 3xl:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="leave" 
                  fill="#22c55e"  // Green-500
                  radius={[4, 4, 0, 0]} 
                  name="Leave Days"
                />
                <Bar 
                  dataKey="od" 
                  fill="#3b82f6"  // Blue-500
                  radius={[4, 4, 0, 0]} 
                  name="OD Days"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-xs sm:text-sm text-muted-foreground">Leave Days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#3b82f6' }} />
                <span className="text-xs sm:text-sm text-muted-foreground">OD Days</span>
              </div>
          </div>
        </motion.div>

        {/* Batch Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-center lg:text-left">Batch Distribution</h3>
          <div className="h-48 sm:h-64 3xl:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={batchDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
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

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-2 mt-4">
            {batchDistribution.map((batch, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: batch.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{batch.name}</span>
              </div>
            ))}
            {batchDistribution.length === 0 && (
                 <div className="col-span-2 text-center text-sm text-muted-foreground">No batches found</div>
            )}
          </div>
        </motion.div>
      </div>


      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card rounded-2xl p-4 sm:p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Quick Actions</h3>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { icon: Users, label: 'Students', color: 'primary', path: '/admin/students' },
            { icon: GraduationCap, label: 'Faculty', color: 'accent', path: '/admin/faculty' },
            { icon: ExternalLink, label: 'Leaves', color: 'success', path: '/admin/leave' },
            { icon: ClipboardCheck, label: 'Marks', color: 'warning', path: '/admin/marks' },
            { icon: Bell, label: 'Circular', color: 'info', path: '/admin/circulars' },
            { icon: FileText, label: 'Reports', color: 'primary', path: '/admin/reports' },
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
                className="p-3 sm:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all text-center group flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px]"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${colorMap[action.color]} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-xs sm:text-sm font-medium leading-tight">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

