import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Trophy, Users, Star, TrendingUp,
  Medal, Target, Calendar, CheckCircle2, XCircle,
  Clock, Filter, Eye, ThumbsUp, ThumbsDown, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';

import { getAchievements, Achievement, getStudents, Student } from '@/lib/data-store';
import { toast } from 'sonner';

export default function ECAAnalytics() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);

  useEffect(() => {
    setAchievements(getAchievements());
  }, []);

  // Filter achievements based on viewMode
  const filteredAchievements = achievements.filter(a => {
      // Mock Date Logic
      if (viewMode === 'current') return true; 
      return false; 
  });
  
  const displayAchievements = filteredAchievements;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const students = getStudents();
    const found = students.find(s => s.rollNumber.toLowerCase() === searchQuery.toLowerCase());
    
    if (found) {
        setSearchedStudent(found);
        toast.success(`Found student: ${found.name}`);
    } else {
        setSearchedStudent(null);
        toast.error("Student not found with this register number");
    }
  };

  const searchedStudentStats = useMemo(() => {
    if (!searchedStudent) return null;
    const studentLogs = displayAchievements.filter(a => a.userId === searchedStudent.id);
    const totalPoints = studentLogs.reduce((acc, a) => acc + (a.status === 'approved' ? a.points : 0), 0);
    const pendingCount = studentLogs.filter(a => a.status === 'pending').length;
    const approvedCount = studentLogs.filter(a => a.status === 'approved').length;
    
    return { logs: studentLogs, totalPoints, pendingCount, approvedCount };
  }, [searchedStudent, displayAchievements]);

  const stats = useMemo(() => {
    const total = displayAchievements.length;
    const pending = displayAchievements.filter(a => a.status === 'pending').length;
    const approved = displayAchievements.filter(a => a.status === 'approved').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    // Unique participants
    const participants = new Set(displayAchievements.map(a => a.userId)).size;

    return { total, pending, rate, participants };
  }, [displayAchievements]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
        'Technical': 0,
        'Sports': 0,
        'Cultural': 0,
        'Social Service': 0,
        'Leadership': 0
    };
    
    displayAchievements.forEach(a => {
        if (counts[a.category] !== undefined) counts[a.category]++;
    });

    return [
      { name: 'Technical', value: counts['Technical'], color: '#3b82f6' },
      { name: 'Sports', value: counts['Sports'], color: '#10b981' },
      { name: 'Cultural', value: counts['Cultural'], color: '#8b5cf6' },
      { name: 'Social Service', value: counts['Social Service'], color: '#f59e0b' },
      { name: 'Leadership', value: counts['Leadership'], color: '#ec4899' },
    ].filter(d => d.value > 0);
  }, [displayAchievements]);

  const topAchievers = useMemo(() => {
    const userStats = new Map<string, { name: string, points: number, count: number }>();
    
    achievements.filter(a => a.status === 'approved').forEach(a => {
        const existing = userStats.get(a.userId);
        if (!existing) {
            userStats.set(a.userId, { name: a.userName, points: a.points, count: 1 });
        } else {
            existing.points += a.points;
            existing.count += 1;
        }
    });

    return Array.from(userStats.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
        .map((user, idx) => ({ rank: idx + 1, ...user }));
  }, [achievements]);

  const participationTrends = useMemo(() => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const trendMap = new Map<number, { month: string, count: number }>();
      
      // Initialize last 6 months
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          trendMap.set(d.getMonth(), { month: months[d.getMonth()], count: 0 });
      }

      achievements.forEach(a => {
          const d = new Date(a.date);
          if (trendMap.has(d.getMonth())) {
              trendMap.get(d.getMonth())!.count += 1;
          }
      });

      return Array.from(trendMap.values());
  }, [achievements]);

  const pendingList = achievements.filter(a => a.status === 'pending').slice(0, 5);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'International': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'National': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'State': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'District': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'bg-blue-500/20 text-blue-400';
      case 'Sports': return 'bg-emerald-500/20 text-emerald-400';
      case 'Cultural': return 'bg-purple-500/20 text-purple-400';
      case 'Social Service': return 'bg-amber-500/20 text-amber-400';
      case 'Leadership': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            ECA Analytics & Global Track
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Monitoring extra-curricular excellence and verified accomplishments</p>
        </div>
        <div className="flex bg-muted/50 rounded-xl p-1 border border-white/5">
            <Input 
                placeholder="Search Register No..." 
                className="h-9 w-[180px] bg-transparent border-none text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg" onClick={handleSearch}>
                <Search className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {searchedStudent && searchedStudentStats && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card border-primary/20 bg-primary/5 p-6 rounded-2xl relative overflow-hidden"
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground pointer-events-none">STUDENT FOUND</Badge>
                        <h2 className="text-xl font-bold">{searchedStudent.name}</h2>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        Batch: {searchedStudent.batch} • Section: {searchedStudent.section} • Roll: {searchedStudent.rollNumber}
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                    setSearchedStudent(null);
                    setSearchQuery('');
                }}>Close</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="bg-background/40 border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Total Logs</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.logs.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Total Points</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.totalPoints}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Pending</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">Achievement History</h3>
                <div className="space-y-3">
                    {searchedStudentStats.logs.slice(0, 5).map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background/40 border border-white/5">
                             <div className="flex items-center gap-3">
                                <Badge className={`${getCategoryColor(log.category)} border-0 text-[8px]`}>{log.category}</Badge>
                                <span className="text-sm font-bold">{log.title}</span>
                             </div>
                             <Badge variant={log.status === 'approved' ? "default" : "secondary"}>{log.status}</Badge>
                        </div>
                    ))}
                    {searchedStudentStats.logs.length === 0 && (
                         <div className="col-span-full py-4 text-center text-muted-foreground text-xs italic">No achievements logged.</div>
                    )}
                </div>
            </div>

        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, icon: Award, color: 'from-blue-500 to-cyan-500' },
          { label: 'Pending Verifications', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' },
          { label: 'Approval Rate', value: `${stats.rate}%`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
          { label: 'Unique Students', value: stats.participants, icon: Users, color: 'from-purple-500 to-pink-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-white/10 shadow-glow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black mt-1 uppercase font-mono">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
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
        <Card className="glass-card border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
                <div className="flex items-center justify-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
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
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
                <div className="py-20 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No achievements mapped.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 shadow-xl">
            <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Participation trends
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
                {participationTrends.some(t => t.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={participationTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                }} 
                            />
                            <Line type="monotone" dataKey="count" name="Achievements" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full opacity-50">
                        <Medal className="w-8 h-8 mb-2 text-muted-foreground/30" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Historical trends pending data.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-muted/50 p-1 border border-white/5 rounded-xl">
          <TabsTrigger value="pending" className="gap-2 text-[10px] font-black uppercase tracking-widest min-w-[160px]">
            <Clock className="w-3.5 h-3.5" />
            Queued Approvals ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2 text-[10px] font-black uppercase tracking-widest min-w-[160px]">
            <Trophy className="w-3.5 h-3.5" />
            Points Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-4">
            {pendingList.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-white/10 hover:border-primary/20 transition-all bg-primary/[0.01]">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold italic">{item.title}</h3>
                            <Badge className={`${getCategoryColor(item.category)} border-0 text-[8px] font-black uppercase h-5`}>{item.category}</Badge>
                            <Badge variant="outline" className={`${getLevelBadge(item.level)} border-0 text-[8px] font-black uppercase h-5`}>{item.level}</Badge>
                          </div>
                          <p className="text-xs font-bold text-muted-foreground">
                            {item.userName} ({item.userId})
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Medal className="w-3 h-3 text-accent" />
                                Verifying at {item.organization}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5">
                          Verfiy Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {pendingList.length === 0 && (
                <div className="text-center py-10 opacity-40">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">All documentation processed.</p>
                </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card className="glass-card border-white/10 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {topAchievers.length > 0 ? topAchievers.map((student, index) => (
                  <motion.div
                    key={student.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-primary/10 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono ${
                        student.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-glow-sm scale-110' :
                        student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg' :
                        student.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg' :
                        'bg-white/10 text-muted-foreground border border-white/5'
                      } text-white`}>
                        {student.rank === 1 ? <Trophy className="w-5 h-5" /> : student.rank}
                      </div>
                      <div>
                        <p className="font-bold italic group-hover:text-primary transition-colors">{student.name}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{student.count} Verified Achievements</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xl font-black text-primary font-mono tracking-tighter uppercase">{student.points}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">Total Points</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                    <div className="text-center py-20 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-widestitalic">No rankings generated yet.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
