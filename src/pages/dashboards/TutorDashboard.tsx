import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard, GlassStatCard, ProgressCard } from '@/components/dashboard/StatCards';
import { 
  Users, 
  ClipboardCheck, 
  FileCheck,
  AlertTriangle,
  Trophy,
  BarChart3,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BookOpen,
  FileText
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
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { 
  getTutors, 
  getStudents, 
  getLeaveRequests, 
  getAchievements, 
  getMarks, 
  updateLeaveStatus,
  updateAchievementStatus,
  updateMarkStatus,
  getTimetable,
  getAssignments,
  getSubmissions,
  Tutor,
  Student,
  LeaveRequest,
  Achievement,
  MarkEntry
} from '@/lib/data-store';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

export default function TutorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    marksToVerify: 0,
    academicAlerts: 0,
    avgAttendance: 0
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [assignmentStat, setAssignmentStat] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Get Overview & Assignment
        const ovRes = await fetch(`${API_BASE_URL}/tutor-analytics/overview`, { headers });
        const overview = await ovRes.json();
        
        if (overview.hasAssignment) {
          setTutor({
            section: overview.sectionName,
            batch: overview.batchName
          });
          
          setStats(prev => ({
            ...prev,
            totalStudents: overview.totalStudents,
            avgAttendance: overview.avgAttendance
          }));

          // 2. Fetch Class List for alerts
          const classRes = await fetch(`${API_BASE_URL}/tutors/class`, { headers });
          const classData = await classRes.json();
          const myStudents = classData.students || [];

          // Alerts (Attendance < 75)
          const myAlerts = myStudents.filter((s: any) => s.attendance < 75).map((s: any) => ({
            student: s.name,
            issue: `Low Attendance (${s.attendance}%)`,
            severity: s.attendance < 65 ? 'high' : 'medium'
          })).slice(0, 3);
          setAlerts(myAlerts);
          setStats(prev => ({ ...prev, academicAlerts: myAlerts.length }));
        }

        // 3. Attendance Trend (Semester-based from new API)
        const trendRes = await fetch(`${API_BASE_URL}/attendance-trend/tutor`, { headers });
        const trendData = await trendRes.json();
        // Map to expected format for chart
        const trend = trendData.map((d: any) => ({
          month: d.month,
          attendance: d.absences || 0,  // Using absences as primary metric
          marks: d.ods || 0  // Using ODs as secondary metric
        }));
        setPerformanceData(trend);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching tutor dashboard data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchTutorData();
    }
  }, [user]);

  const handleApproveLeave = (id: string) => {
    updateLeaveStatus(id, 'approved', user?.name || 'Tutor');
    toast.success('Leave approved');
    window.location.reload();
  };

  const handleApproveAchievement = (id: string) => {
    updateAchievementStatus(id, 'approved', 50, 'Verified by Tutor');
    toast.success('Achievement verified');
    window.location.reload();
  };

  const handleVerifyMarks = (ids: string[]) => {
    ids.forEach(id => updateMarkStatus(id, 'approved', user?.name || 'Tutor'));
    toast.success('Marks verified for section');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl 3xl:text-4xl font-black italic tracking-tighter uppercase">
            Good Morning, {user?.name?.split(' ')[0]}! 👩‍🏫
          </h1>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] sm:text-[10px]">
            Section In-Charge • {tutor?.section} Section • {tutor?.batch}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={() => navigate('/tutor/analytics')} variant="outline" size="sm" className="w-fit sm:size-default rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic px-6">
            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
            Class Analytics
          </Button>
          <Button onClick={() => navigate('/tutor/class')} variant="gradient" size="sm" className="w-fit sm:size-default rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-8">
            <Users className="w-4 h-4 mr-2" />
            Attendance
          </Button>
        </div>
      </motion.div>

      {/* Faculty Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 sm:p-6 rounded-3xl border-none bg-white/[0.02] shadow-xl"
      >
         <h3 className="text-lg font-black uppercase tracking-tight italic mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Faculty Responsibilities
         </h3>
         <div className="grid grid-cols-2 md:grid-cols-4 4xl:grid-cols-4 gap-3 sm:gap-4">
             <Button onClick={() => navigate('/faculty/marks')} variant="outline" className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/5 hover:border-primary/50 hover:bg-primary/5 rounded-2xl group">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                 </div>
                 <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Marks Entry</span>
             </Button>
             <Button onClick={() => navigate('/faculty/notes')} variant="outline" className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/5 hover:border-accent/50 hover:bg-accent/5 rounded-2xl group">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                 </div>
                 <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Upload Notes</span>
             </Button>
             <Button onClick={() => navigate('/faculty/assignments')} variant="outline" className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/5 hover:border-success/50 hover:bg-success/5 rounded-2xl group">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                 </div>
                 <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Assignments</span>
             </Button>
             <Button onClick={() => navigate('/faculty/timetable')} variant="outline" className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/5 hover:border-warning/50 hover:bg-warning/5 rounded-2xl group">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                 </div>
                 <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">My Timetable</span>
             </Button>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 4xl:grid-cols-8 gap-4">
        <GlassStatCard
          title="Class Strength"
          value={stats.totalStudents.toString()}
          icon={Users}
          iconColor="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Pending Approvals"
          value={stats.pendingApprovals.toString()}
          icon={Clock}
          iconColor="warning"
          delay={0.2}
        />
        <GlassStatCard
          title="Marks to Verify"
          value={stats.marksToVerify.toString()}
          icon={ClipboardCheck}
          iconColor="accent"
          delay={0.3}
        />
        <GlassStatCard
          title="Assignment Pulse"
          value={`${assignmentStat.pending}/${assignmentStat.total}`}
          icon={BookOpen}
          iconColor="success"
          delay={0.4}
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 4xl:col-span-3 glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl relative overflow-hidden bg-white/[0.02]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">Attendance Trend</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Class Average Trends</p>
            </div>
            <Button onClick={() => navigate('/tutor/analytics')} variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-black uppercase text-[9px] tracking-widest border-white/10 italic px-4">Insights</Button>
          </div>
          <div className="h-64 sm:h-80 3xl:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fill="url(#attendanceGrad)"
                  name="Absences"
                />
                <Area
                  type="monotone"
                  dataKey="marks"
                  stroke="hsl(var(--accent))"
                  strokeWidth={4}
                  fill="url(#marksGrad)"
                  name="OD Days"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Absences</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent shadow-glow shadow-accent/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">OD Days</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Today's Schedule</h3>
            <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3">
              {todaySchedule.length} Sessions
            </Badge>
          </div>
          <div className="space-y-4">
            {todaySchedule.length > 0 ? todaySchedule.map((slot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-background/50 flex items-center justify-center border border-white/5 flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm italic truncate">{slot.subject}</p>
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 truncate">
                        {slot.faculty} • {slot.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="hidden xs:inline-flex text-[8px] font-black uppercase tracking-widest border-white/10 shrink-0">{slot.type}</Badge>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 opacity-50 italic font-medium">No sessions scheduled for today.</div>
            )}
          </div>
          <Button onClick={() => navigate('/tutor/timetable')} variant="ghost" className="w-full mt-6 rounded-xl font-black uppercase text-[10px] tracking-widest italic" size="sm">
            View Full Timetable
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Approval Queue</h3>
            <Button onClick={() => navigate('/tutor/leave')} variant="ghost" size="sm" className="font-black text-[9px] uppercase tracking-widest text-primary italic">Process All</Button>
          </div>
          <div className="space-y-4">
            {approvals.length > 0 ? approvals.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0 ${
                    item.type === 'Leave' ? 'bg-info/10 text-info shadow-info/20' : 'bg-success/10 text-success shadow-success/20'
                  }`}>
                    {item.type === 'Leave' ? <Clock className="w-5 h-5 sm:w-6 sm:h-6" /> : <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm italic group-hover:text-primary transition-colors truncate">{item.student}</p>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 truncate">
                      {item.type}: {item.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Button 
                    onClick={() => item.type === 'Leave' ? handleApproveLeave(item.id) : handleApproveAchievement(item.id)}
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-success hover:bg-success/10 hover:scale-110 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:scale-110 transition-all">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </motion.div>
            )) : (
                <div className="text-center py-10 opacity-50 italic text-sm">Queue is empty</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Quality Control</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Marks Verification</p>
          </div>
          <div className="space-y-4">
            {verifications.length > 0 ? verifications.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-glow shadow-primary/20 flex-shrink-0">
                    <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm italic group-hover:text-primary transition-colors truncate">{item.exam}</p>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 truncate">Pending Audit: {item.count} Records</p>
                  </div>
                </div>
                <Button onClick={() => handleVerifyMarks(item.ids)} variant="gradient" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest italic px-4 sm:px-6 shadow-lg shadow-primary/20 shrink-0">Verify</Button>
              </motion.div>
            )) : (
                <div className="text-center py-10 opacity-50 italic text-sm">No marks pending verification</div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Class Alerts</h3>
            <Badge className="w-fit bg-destructive/20 text-destructive border-none font-black text-[9px] uppercase tracking-widest px-3">
              {alerts.length} Critical
            </Badge>
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-black italic uppercase truncate">{alert.student}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 truncate">{alert.issue}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50 italic text-sm">No critical alerts.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card rounded-3xl p-4 sm:p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Assignment Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success shadow-glow" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Current Window</span>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-muted-foreground">Submission Progress</span>
                <span className="text-primary">{assignmentStat.total > 0 ? Math.round(((assignmentStat.total - assignmentStat.pending)/assignmentStat.total)*100) : 0}%</span>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${assignmentStat.total > 0 ? ((assignmentStat.total - assignmentStat.pending)/assignmentStat.total)*100 : 0}%` }}
                    className="h-full bg-primary shadow-glow shadow-primary/20"
                />
             </div>
             <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Total Active</p>
                   <p className="text-lg sm:text-xl font-black italic uppercase mt-1">{assignmentStat.total}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Pending</p>
                   <p className="text-lg sm:text-xl font-black italic uppercase mt-1 text-warning">{assignmentStat.pending}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}


