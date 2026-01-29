import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Eye, TrendingUp, Users, 
  BookOpen, Calendar, BarChart3, PieChart, Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { API_BASE_URL } from '@/lib/api-config';

interface NoteResource {
  id: number;
  title: string;
  type: string;
  subject_name: string;
  subject_code: string;
  faculty_name: string;
  download_count: number;
  batch_name: string;
  batch_id: number;
  semester: number;
}

interface Batch {
  id: number;
  name: string;
}

export default function NotesAnalytics() {
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [resources, setResources] = useState<NoteResource[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/academic/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const url = selectedBatch === 'all' 
        ? `${API_BASE_URL}/notes/analytics`
        : `${API_BASE_URL}/notes/analytics?batchId=${selectedBatch}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Filter resources based on viewMode (Mock logic: Assuming all are current for now, but adding structure)
  const filteredResources = resources.filter(r => {
      // In real app, check r.uploadedAt vs 6 months ago
      if (viewMode === 'current') return true; 
      return false; // Mocking no history for now to avoid empty page validation issues, or we can toggle
  });

  const totalNotes = filteredResources.filter(r => r.type === 'Note').length;
  const totalQPs = filteredResources.filter(r => r.type === 'QP').length;
  const totalManuals = filteredResources.filter(r => r.type === 'Manual').length;
  const totalDownloads = filteredResources.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  const subjectStats = filteredResources.reduce((acc: any[], curr) => {
    const existing = acc.find(s => s.subjectCode === curr.subject_code);
    if (!existing) {
        acc.push({ subject: curr.subject_name, subjectCode: curr.subject_code, uploaded: 1, total: 5, faculty: curr.faculty_name });
    } else {
        existing.uploaded += 1;
    }
    return acc;
  }, []);

  const totalSubjectUnits = subjectStats.length * 5;
  const totalUploadedUnits = subjectStats.reduce((acc, s) => acc + s.uploaded, 0);
  const completionRate = totalSubjectUnits > 0 ? Math.round((totalUploadedUnits / totalSubjectUnits) * 100) : 0;

  // Category Data
  const categoryData = [
    { name: 'Lecture Notes', value: totalNotes, color: '#3b82f6' },
    { name: 'Question Banks', value: totalQPs, color: '#8b5cf6' },
    { name: 'Lab Manuals', value: totalManuals, color: '#ec4899' },
  ].filter(c => c.value > 0);

  // Mock Fallback if empty
  const hasData = resources.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Notes & Resources Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Track uploads, downloads, and resource utilization</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-muted p-1 rounded-xl mr-2">
            <Button 
                variant={viewMode === 'current' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('current')}
                className="rounded-lg font-bold"
            >
                Current Semester
            </Button>
            <Button 
                variant={viewMode === 'history' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('history')}
                className="rounded-lg font-bold"
            >
                History
            </Button>
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => (
                <SelectItem key={batch.id} value={String(batch.id)}>{batch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: resources.length, icon: FileText, color: 'from-blue-500 to-cyan-500', change: 'Live' },
          { label: 'Total Downloads', value: totalDownloads, icon: Download, color: 'from-purple-500 to-pink-500', change: 'Live' },
          { label: 'Active Subjects', value: subjectStats.length, icon: BookOpen, color: 'from-emerald-500 to-teal-500', change: 'Live' },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'from-orange-500 to-amber-500', change: 'System-wide' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 uppercase">{stat.value}</p>
                    <p className="text-xs text-primary mt-1 uppercase">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends - Mocked as we don't have enough history yet */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Upload Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
                 <p className="py-20 text-center text-muted-foreground italic">Insufficient historical data to display trends.</p>
            ) : (
                <div className="py-20 text-center flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p className="text-muted-foreground">No resources in database.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Resource Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
                <div className="flex items-center justify-center gap-8">
                <ResponsiveContainer width={200} height={200}>
                    <RePieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    </RePieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                    {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-bold">({item.value})</span>
                    </div>
                    ))}
                </div>
                </div>
            ) : (
                <p className="py-20 text-center text-muted-foreground italic">No category data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Progress */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject-wise Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectStats.map((subject, index) => {
              const percentage = Math.min(Math.round((subject.uploaded / 5) * 100), 100);
              return (
                <motion.div
                  key={subject.subjectCode}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-sm text-muted-foreground ml-2">({subject.faculty})</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-primary font-medium">{subject.uploaded}</span>
                      <span className="text-muted-foreground">/5 Units</span>
                      <Badge className="ml-2" variant={percentage >= 90 ? 'default' : percentage >= 70 ? 'secondary' : 'outline'}>
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </motion.div>
              );
            })}
            {subjectStats.length === 0 && (
                <p className="text-center py-10 text-muted-foreground uppercase text-xs font-bold tracking-widest">No subject resources tracked yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
