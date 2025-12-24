import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTutors, 
  getStudents, 
  getAssignments, 
  getSubmissions, 
  Tutor, 
  Student, 
  Assignment, 
  Submission 
} from '@/lib/data-store';

export default function AssignmentStatus() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    overdue: 0,
    avgGrade: 'B+'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const allTutors = getTutors();
    const currentTutor = allTutors.find(t => t.id === user.id || t.email === user.email);
    if (!currentTutor) return;
    setTutor(currentTutor);

    const allStudents = getStudents();
    const myStudents = allStudents.filter(s => s.batch === currentTutor.batch && s.section === currentTutor.section);
    
    const allAssignments = getAssignments();
    const mySectionAssignments = allAssignments.filter(a => a.classId === currentTutor.batch && a.sectionId === currentTutor.section);
    
    const allSubmissions = getSubmissions();
    const mySubmissions = allSubmissions.filter(s => myStudents.find(std => std.id === s.studentId));

    const assignmentList = mySectionAssignments.map(a => {
        const subs = allSubmissions.filter(s => s.assignmentId === a.id);
        const evaluated = subs.filter(s => s.status === 'graded').length;
        
        return {
            ...a,
            submissions: subs.length,
            totalStudents: myStudents.length,
            evaluated,
            status: new Date(a.dueDate) < new Date() ? 'Completed' : 'Active'
        };
    });
    setAssignments(assignmentList);

    // Analytics (Submission Rate by Subject)
    const subjectRates = new Map();
    assignmentList.forEach(a => {
        if (!subjectRates.has(a.subjectCode)) {
            subjectRates.set(a.subjectCode, { name: a.subjectCode, total: 0, subs: 0 });
        }
        const s = subjectRates.get(a.subjectCode);
        s.total += a.totalStudents;
        s.subs += a.submissions;
    });

    const rates = Array.from(subjectRates.values()).map(s => ({
        name: s.name,
        rate: s.total > 0 ? Math.round((s.subs / s.total) * 100) : 0
    }));
    setAnalytics(rates);

    // Stats
    const pending = assignmentList.filter(a => a.submissions < a.totalStudents).length;
    const overdue = assignmentList.filter(a => new Date(a.dueDate) < new Date() && a.submissions < a.totalStudents).length;
    setStats({
        pending,
        overdue,
        avgGrade: 'A' // Mocked as grading depends on more data
    });

  }, [user]);

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Assignment Tracking 📝</h1>
          <p className="text-muted-foreground font-medium">Evaluation and submission progress for Section {tutor?.section}</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest italic hover:bg-white/5">
             <BarChart2 className="w-4 h-4 mr-2 text-primary" />
             Report
           </Button>
           <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-6">
             Notify Pending
           </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-8 border-none shadow-2xl lg:col-span-2 bg-white/[0.02] rounded-3xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-tight">Submission Rates</h3>
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                Live Tracking
              </div>
           </div>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(23, 23, 23, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]} barSize={40}>
                    {analytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rate > 80 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <div className="space-y-4">
           {[
             { label: 'Total Pending', value: stats.pending.toString(), icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
             { label: 'Overdue', value: stats.overdue.toString(), icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
             { label: 'Avg. Class GPA', value: '8.4', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' }
           ].map((stat, i) => (
             <Card key={i} className="glass-card p-6 border-none shadow-xl flex items-center gap-6 group hover:translate-x-2 transition-all rounded-2xl bg-white/[0.02]">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow transition-transform group-hover:scale-110", stat.bg)}>
                   <stat.icon className={cn("w-7 h-7", stat.color)} />
                </div>
                <div>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black italic tracking-tight uppercase">{stat.value}</p>
                </div>
             </Card>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black italic uppercase tracking-tight">Assignment Matrix</h3>
           <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by subject..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[250px] pl-10 h-10 rounded-xl bg-white/5 border-white/10 font-bold uppercase text-[10px] tracking-widest italic" 
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-white/10">
                <Filter className="w-4 h-4" />
              </Button>
           </div>
        </div>

        <div className="grid gap-4">
          {filteredAssignments.length > 0 ? filteredAssignments.map((task, index) => {
            const submissionRate = (task.submissions / task.totalStudents) * 100;
            const evaluationRate = (task.submissions > 0 ? (task.evaluated / task.submissions) * 100 : 0);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-none p-6 shadow-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/[0.02]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-glow shadow-primary/20 transition-transform group-hover:scale-110">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="font-black italic tracking-tight uppercase truncate group-hover:text-primary transition-colors">{task.title}</h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{task.subject}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-2 gap-12">
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-muted-foreground italic">Submissions</span>
                           <span className="text-primary">{task.submissions}/{task.totalStudents}</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${submissionRate}%` }}
                              className="h-full bg-primary rounded-full shadow-glow shadow-primary/20"
                            />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-muted-foreground italic">Evaluated</span>
                           <span className="text-success">{task.evaluated}/{task.submissions}</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${evaluationRate}%` }}
                              className="h-full bg-success rounded-full shadow-glow shadow-success/20"
                            />
                         </div>
                      </div>
                    </div>

                    <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                         <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Due Date</p>
                         <p className="text-sm font-black italic mt-1">{task.dueDate}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:scale-110">
                         <ArrowUpRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          }) : (
              <div className="text-center py-20 opacity-50 italic font-medium">No assignments found for this class.</div>
          )}
        </div>
      </div>
    </div>
  );
}

