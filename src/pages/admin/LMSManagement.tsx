import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Users, Trophy, TrendingUp, Clock,
  Target, Award, BarChart3, Brain, Zap,
  CheckCircle2, XCircle, Star, Filter, Plus, Send, AlertCircle,
  Medal, Search
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
} from 'recharts';

import { getQuizzes, addQuiz, Quiz, getQuizResults, QuizResult, getStudents, Student } from '@/lib/data-store';
import { toast } from 'sonner';

export default function LMSManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState<Omit<Quiz, 'id' | 'createdAt'>>({
    title: '',
    subject: '',
    subjectCode: '',
    duration: '30 mins',
    questions: 20,
    difficulty: 'Medium',
    deadline: '',

    assignedTo: 'all',
    status: 'active'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);

  // Get unique batches for assignment
  const uniqueBatches = useMemo(() => {
      const students = getStudents();
      return Array.from(new Set(students.map(s => s.batch))).sort();
  }, []);

  useEffect(() => {
    setQuizzes(getQuizzes());
    setResults(getQuizResults());
  }, []);

  const handleAddQuiz = () => {
    if (!newQuiz.title || !newQuiz.subjectCode || !newQuiz.deadline) {
        toast.error("Please fill in required fields");
        return;
    }
    addQuiz(newQuiz);
    setQuizzes(getQuizzes());
    setIsAddOpen(false);
    toast.success("Quiz created successfully!");
  };

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
    const studentResults = results.filter(r => r.userId === searchedStudent.id);
    const total = studentResults.length;
    const avgScore = total > 0 ? Math.round(studentResults.reduce((acc, r) => acc + r.score, 0) / total) : 0;
    const passed = studentResults.filter(r => r.score >= 50).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, avgScore, passRate, results: studentResults };
  }, [searchedStudent, results]);

  const filteredQuizzes = quizzes.filter(q => 
    selectedSubject === 'all' || q.subjectCode.toLowerCase() === selectedSubject.toLowerCase()
  );

  const difficultyData = [
    { name: 'Easy', value: quizzes.filter(q => q.difficulty === 'Easy').length, color: '#10b981' },
    { name: 'Medium', value: quizzes.filter(q => q.difficulty === 'Medium').length, color: '#f59e0b' },
    { name: 'Hard', value: quizzes.filter(q => q.difficulty === 'Hard').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const stats = useMemo(() => {
    const total = results.length;
    const avgScore = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / total) : 0;
    const passed = results.filter(r => r.score >= 50).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, avgScore, passRate };
  }, [results]);

  const topPerformers = useMemo(() => {
    const userStats = new Map<string, { name: string, score: number, count: number }>();
    results.forEach(res => {
        const existing = userStats.get(res.userId);
        if (!existing || res.score > existing.score) {
            userStats.set(res.userId, { name: res.userName, score: res.score, count: (existing?.count || 0) + 1 });
        } else if (existing) {
            existing.count += 1;
        }
    });

    return Array.from(userStats.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            LMS Assessment Matrix
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Global assessment distribution and performance analytics</p>
        </div>
        <div className="flex gap-2">
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-accent shadow-glow-sm h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <Plus className="w-4 h-4" />
                    Deploy Quiz
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="italic font-bold">Configure Assessment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Quiz Title</Label>
                        <Input 
                            placeholder="e.g. Unit 1 Fundamentals" 
                            value={newQuiz.title}
                            onChange={e => setNewQuiz({...newQuiz, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Subject Code</Label>
                            <Input 
                                placeholder="CS301" 
                                value={newQuiz.subjectCode}
                                onChange={e => setNewQuiz({...newQuiz, subjectCode: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Difficulty</Label>
                            <Select value={newQuiz.difficulty} onValueChange={(val: any) => setNewQuiz({...newQuiz, difficulty: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Assign To</Label>
                        <Select value={newQuiz.assignedTo} onValueChange={(val: any) => setNewQuiz({...newQuiz, assignedTo: val})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Batches</SelectItem>
                                {uniqueBatches.map(batch => (
                                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Qs Count</Label>
                            <Input 
                                type="number" 
                                value={newQuiz.questions}
                                onChange={e => setNewQuiz({...newQuiz, questions: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Duration</Label>
                            <Input 
                                placeholder="30 mins" 
                                value={newQuiz.duration}
                                onChange={e => setNewQuiz({...newQuiz, duration: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-muted-foreground">Deadline</Label>
                        <Input 
                            type="date"
                            value={newQuiz.deadline}
                            onChange={e => setNewQuiz({...newQuiz, deadline: e.target.value})}
                        />
                    </div>
                    <Button className="w-full gap-2 shadow-glow-sm font-black uppercase tracking-widest text-xs h-11" onClick={handleAddQuiz}>
                        <Send className="w-4 h-4" />
                        Deploy to LMS
                    </Button>
                </div>
            </DialogContent>
          </Dialog>
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
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Quizzes Taken</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Avg Score</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.avgScore}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/40 border-white/5">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Pass Rate</p>
                            <p className="text-2xl font-black font-mono">{searchedStudentStats.passRate}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">Recent Attempts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchedStudentStats.results.slice(0, 6).map((res, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background/40 border border-white/5">
                             <span className="text-sm font-medium">Unknown Quiz</span>
                             <Badge variant={res.score >= 50 ? "default" : "destructive"}>{res.score}%</Badge>
                        </div>
                    ))}
                    {searchedStudentStats.results.length === 0 && (
                         <div className="col-span-full py-4 text-center text-muted-foreground text-xs italic">No quizzes attempted yet.</div>
                    )}
                </div>
            </div>

        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Quizzes', value: quizzes.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
          { label: 'Submissions', value: stats.total, icon: Zap, color: 'from-purple-500 to-pink-500' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, icon: Trophy, color: 'from-emerald-500 to-teal-500' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, icon: CheckCircle2, color: 'from-orange-500 to-amber-500' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Difficulty Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {difficultyData.length > 0 ? (
                <>
                <div className="flex items-center justify-center">
                    <ResponsiveContainer width={180} height={180}>
                    <RePieChart>
                        <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {difficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </RePieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    {difficultyData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.name} ({item.value})</span>
                    </div>
                    ))}
                </div>
                </>
            ) : (
                <div className="py-20 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No metrics available.</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 lg:col-span-2 shadow-xl">
            <Tabs defaultValue="inventory" className="w-full">
                <div className="px-6 pt-6 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        LMS Database
                    </h3>
                    <TabsList className="bg-muted/50 p-1 border border-white/5 rounded-xl">
                        <TabsTrigger value="inventory" className="text-[9px] font-black uppercase tracking-widest px-4 h-8 gap-2">
                            <BookOpen className="w-3.5 h-3.5" /> Inventory
                        </TabsTrigger>
                        <TabsTrigger value="performers" className="text-[9px] font-black uppercase tracking-widest px-4 h-8 gap-2">
                            <Medal className="w-3.5 h-3.5" /> Performers
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <CardContent className="mt-4">
                    <TabsContent value="inventory">
                        <div className="space-y-3">
                            {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold italic">{quiz.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-0 bg-muted/50 h-5 px-2">{quiz.subjectCode}</Badge>
                                            <span className="text-[9px] text-muted-foreground uppercase font-black">{quiz.questions} Qs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge className={
                                        quiz.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                        quiz.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'
                                     + ' border-0 font-black uppercase text-[8px] h-5 px-2'}>
                                        {quiz.difficulty}
                                    </Badge>
                                    <p className="text-[9px] text-muted-foreground mt-1 uppercase font-black tracking-widest">{quiz.deadline}</p>
                                </div>
                            </motion.div>
                            )) : (
                                <div className="py-20 text-center opacity-30 italic">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No assessments logged.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="performers">
                        <div className="space-y-3">
                            {topPerformers.length > 0 ? topPerformers.map((student, index) => (
                            <motion.div
                                key={student.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                        index === 0 ? 'bg-amber-400 text-white' : 'bg-white/10 text-muted-foreground'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold italic">{student.name}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{student.count} Sessions Completed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary font-mono tracking-tighter uppercase">{student.score}%</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mt-1">Best Score</p>
                                </div>
                            </motion.div>
                            )) : (
                                <div className="py-20 text-center opacity-30 italic">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Insufficient performance data.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
      </div>
    </div>
  );
}
