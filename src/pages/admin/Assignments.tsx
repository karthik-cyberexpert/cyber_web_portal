import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Clock, CheckCircle2, AlertCircle, Users,
  Search, Filter, Calendar, Download, Eye, BarChart3,
  TrendingUp, BookOpen, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { getAssignments, getSubmissions, Assignment, Submission } from '@/lib/data-store';

export default function Assignments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState('all');
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
      total: 0,
      active: 0,
      overdue: 0,
      completed: 0,
      totalSubmissions: 0,
      totalEvaluated: 0
  });
  const [submissionTrends, setSubmissionTrends] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);

  useEffect(() => {
      const allAssignments = getAssignments();
      const allSubmissions = getSubmissions();

      // Calculate Stats
      const today = new Date();
      const active = allAssignments.filter(a => new Date(a.dueDate) >= today).length;
      const overdue = allAssignments.filter(a => new Date(a.dueDate) < today).length; // Simplified overdue logic
      const completed = 0; // 'completed' status logic might need refinement based on business rules

      const evaluated = allSubmissions.filter(s => s.status === 'graded').length;

      setStats({
          total: allAssignments.length,
          active,
          overdue,
          completed,
          totalSubmissions: allSubmissions.length,
          totalEvaluated: evaluated
      });

      setAssignments(allAssignments);

      // Subject Stats
      const subjects: any = {};
      allAssignments.forEach(a => {
          if (!subjects[a.subjectCode]) {
              subjects[a.subjectCode] = { subject: a.subjectCode, pending: 0, submitted: 0, evaluated: 0 };
          }
          const subs = allSubmissions.filter(s => s.assignmentId === a.id);
          subjects[a.subjectCode].submitted += subs.length;
          subjects[a.subjectCode].evaluated += subs.filter(s => s.status === 'graded').length;
          // Pending is trickier without total student count, assuming simplified view for now
      });
      setSubjectStats(Object.values(subjects));

      // Calculate Submission Trends (Last 7 Days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const trends = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = days[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];
        
        const daySubmissions = allSubmissions.filter(s => s.submittedAt.startsWith(dateStr));
        return {
          day: dayName,
          submissions: daySubmissions.length,
          onTime: daySubmissions.filter(s => s.status !== 'late').length
        };
      });
      setSubmissionTrends(trends);

  }, []);

  const getStatusColor = (dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date();
    return isOverdue ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-blue-500/20 text-blue-500 border-blue-500/30';
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const isOverdue = new Date(a.dueDate) < new Date();
    const status = isOverdue ? 'overdue' : 'active';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesClass = selectedClass === 'all' || a.classId === selectedClass;
    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Assignments Management
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage all class assignments</p>
        </div>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: stats.active, icon: Clock, color: 'from-emerald-500 to-teal-500' },
          { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'from-red-500 to-rose-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-purple-500 to-pink-500' },
          { label: 'Submissions', value: stats.totalSubmissions, icon: Users, color: 'from-amber-500 to-orange-500' },
          { label: 'Evaluated', value: stats.totalEvaluated, icon: TrendingUp, color: 'from-indigo-500 to-violet-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Submission Trends (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={submissionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="submissions" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                <Line type="monotone" dataKey="onTime" name="On Time" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Subject-wise Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="subject" type="category" width={60} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="submitted" name="Submitted" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="evaluated" name="Evaluated" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Assignments</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Assignment</th>
                  <th className="px-4 py-3 font-medium">Faculty</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">{assignment.subjectCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{assignment.facultyName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{assignment.classId} - {assignment.sectionId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{assignment.dueDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusColor(assignment.dueDate)}>
                        {new Date(assignment.dueDate) < new Date() ? 'Overdue' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredAssignments.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-4 text-muted-foreground">No assignments found</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
