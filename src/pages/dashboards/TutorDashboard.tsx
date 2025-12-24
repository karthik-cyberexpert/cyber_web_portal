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

export default function TutorDashboard() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    marksToVerify: 0,
    academicAlerts: 0
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [assignmentStat, setAssignmentStat] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    if (!user) return;
    
    // 1. Get Tutor Record
    const allTutors = getTutors();
    const currentTutor = allTutors.find(t => t.id === user.id || t.email === user.email);
    if (!currentTutor) return;
    setTutor(currentTutor);

    // 2. Get Students in Section
    const allStudents = getStudents();
    const myStudents = allStudents.filter(s => s.batch === currentTutor.batch && s.section === currentTutor.section);

    // 3. Pending Approvals
    const allLeaves = getLeaveRequests();
    const allAchievements = getAchievements();
    
    const myLeaves = allLeaves.filter(l => 
        l.status === 'pending' && 
        myStudents.find(s => s.id === l.userId)
    );
    const myAchievements = allAchievements.filter(a => 
        a.status === 'pending' && 
        myStudents.find(s => s.id === a.userId)
    );

    const pendingList = [
        ...myLeaves.map(l => ({ id: l.id, type: 'Leave', student: l.userName, reason: l.reason, date: 'Today', original: l })),
        ...myAchievements.map(a => ({ id: a.id, type: 'ECA', student: a.userName, reason: a.title, date: 'Recent', original: a }))
    ].slice(0, 4);
    setApprovals(pendingList);

    // 4. Marks Verification
    const allMarks = getMarks();
    const mySubmittedMarks = allMarks.filter(m => 
        m.status === 'submitted' && 
        myStudents.find(s => s.id === m.studentId)
    );
    
    // Group marks by Subject + Exam
    const groupedMarksMap = new Map();
    mySubmittedMarks.forEach(m => {
        const key = `${m.subjectCode}-${m.examType}`;
        if (!groupedMarksMap.has(key)) {
            groupedMarksMap.set(key, { exam: `${m.examType.toUpperCase()} - ${m.subjectCode}`, count: 0, ids: [] });
        }
        const group = groupedMarksMap.get(key);
        group.count += 1;
        group.ids.push(m.id);
    });
    setVerifications(Array.from(groupedMarksMap.values()).slice(0, 3));

    // 5. Academic Alerts
    const myAlerts = myStudents.filter(s => s.attendance < 75).map(s => ({
        student: s.name,
        issue: `Low Attendance (${s.attendance}%)`,
        severity: s.attendance < 65 ? 'high' : 'medium'
    })).slice(0, 3);
    setAlerts(myAlerts);

    // 6. Timetable (Today)
    const allTimetable = getTimetable();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const mySchedule = allTimetable
        .filter(t => t.day === today && t.classId === currentTutor.batch && t.sectionId === currentTutor.section)
        .sort((a, b) => a.period - b.period)
        .map(t => ({
            id: t.id,
            subject: t.subject,
            time: t.period <= 3 ? `${9+t.period-1}:00` : `${10+t.period}:00`,
            faculty: t.facultyName,
            type: t.type
        }));
    setTodaySchedule(mySchedule);

    // 7. Assignments
    const allAssignments = getAssignments();
    const myAssignments = allAssignments.filter(a => a.classId === currentTutor.batch && a.sectionId === currentTutor.section);
    setAssignmentStat({
        total: myAssignments.length,
        pending: myAssignments.filter(a => new Date(a.dueDate) > new Date()).length
    });

    // 8. Stats
    setStats({
        totalStudents: myStudents.length,
        pendingApprovals: myLeaves.length + myAchievements.length,
        marksToVerify: mySubmittedMarks.length,
        academicAlerts: myAlerts.length
    });

    // 9. Performance Trend
    const myMarks = allMarks.filter(m => myStudents.find(s => s.id === m.studentId));
    const avgAttendance = myStudents.length > 0 ? Math.round(myStudents.reduce((acc, s) => acc + s.attendance, 0) / myStudents.length) : 0;
    const avgMarks = myMarks.length > 0 ? Math.round(myMarks.reduce((acc, m) => acc + (m.marks || 0), 0) / myMarks.length) : 75;

    const trend = [
        { month: 'Oct', attendance: avgAttendance - 2, marks: avgMarks - 5 },
        { month: 'Nov', attendance: avgAttendance, marks: avgMarks },
        { month: 'Dec', attendance: avgAttendance + 1, marks: avgMarks + 2 }
    ];
    setPerformanceData(trend);

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
    ids.forEach(id => updateMarkStatus(id, 'approved'));
    toast.success('Marks verified for section');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Good Morning, {user?.name?.split(' ')[0]}! 👩‍🏫
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Section In-Charge • {tutor?.section} Section • {tutor?.batch}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic px-6">
            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
            Class Analytics
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-8">
            <Users className="w-4 h-4 mr-2" />
            Attendance
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          className="lg:col-span-2 glass-card rounded-3xl p-8 border-none shadow-2xl relative overflow-hidden bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">Performance Dynamics</h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Class Average Trends</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl font-black uppercase text-[9px] tracking-widest border-white/10 italic px-4">Insights</Button>
          </div>
          <div className="h-64">
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
                  name="Attendance %"
                />
                <Area
                  type="monotone"
                  dataKey="marks"
                  stroke="hsl(var(--accent))"
                  strokeWidth={4}
                  fill="url(#marksGrad)"
                  name="Avg Marks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attendance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent shadow-glow shadow-accent/50" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Academic Avg</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]"
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
                className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center border border-white/5">
                      <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-black text-sm italic">{slot.subject}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {slot.faculty} • {slot.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10">{slot.type}</Badge>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 opacity-50 italic font-medium">No sessions scheduled for today.</div>
            )}
          </div>
          <Button variant="ghost" className="w-full mt-6 rounded-xl font-black uppercase text-[10px] tracking-widest italic" size="sm">
            View Full Timetable
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Approval Queue</h3>
            <Button variant="ghost" size="sm" className="font-black text-[9px] uppercase tracking-widest text-primary italic">Process All</Button>
          </div>
          <div className="space-y-4">
            {approvals.length > 0 ? approvals.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow ${
                    item.type === 'Leave' ? 'bg-info/10 text-info shadow-info/20' : 'bg-success/10 text-success shadow-success/20'
                  }`}>
                    {item.type === 'Leave' ? <Clock className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-black text-sm italic group-hover:text-primary transition-colors">{item.student}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                      {item.type}: {item.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => item.type === 'Leave' ? handleApproveLeave(item.id) : handleApproveAchievement(item.id)}
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-xl text-success hover:bg-success/10 hover:scale-110 transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:scale-110 transition-all">
                    <XCircle className="w-5 h-5" />
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
          className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
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
                className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-glow shadow-primary/20">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm italic group-hover:text-primary transition-colors">{item.exam}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Pending Audit: {item.count} Records</p>
                  </div>
                </div>
                <Button onClick={() => handleVerifyMarks(item.ids)} variant="gradient" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest italic px-6 shadow-lg shadow-primary/20">Verify</Button>
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
          className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Class Alerts</h3>
            <Badge className="bg-destructive/20 text-destructive border-none font-black text-[9px] uppercase tracking-widest px-3">
              {alerts.length} Critical
            </Badge>
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm font-black italic uppercase">{alert.student}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">{alert.issue}</p>
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
          className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-8">
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
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Total Active</p>
                   <p className="text-xl font-black italic uppercase mt-1">{assignmentStat.total}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">Pending</p>
                   <p className="text-xl font-black italic uppercase mt-1 text-warning">{assignmentStat.pending}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


