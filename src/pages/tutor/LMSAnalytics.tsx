import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  BarChart3, 
  PieChart as PieChartIcon,
  Search,
  Download,
  Flame,
  Star,
  Brain,
  Timer,
  AlertCircle,
  Medal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { getQuizzes, Quiz, getTutors, Tutor, getQuizResults, QuizResult, getStudents } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

export default function LMSAnalytics() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [tutorInfo, setTutorInfo] = useState<Tutor | null>(null);

  useEffect(() => {
    if (user) {
        const tutors = getTutors();
        const current = tutors.find(t => t.email === user.email);
        if (current) setTutorInfo(current);
    }
    setQuizzes(getQuizzes());
    setResults(getQuizResults());
  }, [user]);

  const filteredResults = useMemo(() => {
    if (!tutorInfo) return results;
    const students = getStudents();
    const classStudents = students.filter(s => s.batch === tutorInfo.batch && s.section === tutorInfo.section);
    const studentIds = new Set(classStudents.map(s => s.id));
    return results.filter(r => studentIds.has(r.userId));
  }, [results, tutorInfo]);

  const stats = useMemo(() => {
    const total = quizzes.length;
    const active = quizzes.filter(q => q.status === 'active').length;
    const avgScore = filteredResults.length > 0 
        ? Math.round(filteredResults.reduce((acc, r) => acc + r.score, 0) / filteredResults.length) 
        : 0;
    const engagement = filteredResults.length > 5 ? 'High' : filteredResults.length > 0 ? 'Moderate' : 'N/A';
    
    return [
        { label: 'Total Assessments', value: total, icon: Target, color: 'text-primary' },
        { label: 'Active Sessions', value: active, icon: Zap, color: 'text-accent' },
        { label: 'Avg. Accuracy', value: avgScore > 0 ? `${avgScore}%` : 'N/A', icon: Trophy, color: 'text-warning' },
        { label: 'Class Engagement', value: engagement, icon: Flame, color: 'text-orange-500' }
    ];
  }, [quizzes, filteredResults]);

  const hallOfFame = useMemo(() => {
    const userStats = new Map<string, { name: string, score: number, count: number }>();
    filteredResults.forEach(res => {
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
  }, [filteredResults]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">LMS Insights 🎓</h1>
          <p className="text-muted-foreground font-medium">Performance analytics for {tutorInfo ? `${tutorInfo.batch} - ${tutorInfo.section}` : 'your classes'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest h-10 px-4 border-white/10 hover:bg-white/5">
             <Download className="w-4 h-4 mr-2" />
             Export Reports
          </Button>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {stats.map((stat, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
           >
             <Card className="glass-card p-5 border-none shadow-lg group hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 transition-all">
                <div className="flex items-center gap-4">
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-background/50 shadow-inner", stat.color)}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-xl font-black uppercase font-mono mt-1">{stat.value}</p>
                   </div>
                </div>
             </Card>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-6 border-none shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Student Engagement Trends
                </h3>
            </div>
            <div className="h-64 flex flex-col items-center justify-center text-center bg-muted/20 border-2 border-dashed border-white/5 rounded-2xl">
                <AreaChart className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">Insufficient engagement data</p>
                <p className="text-[10px] text-muted-foreground/60 max-w-xs mt-1 italic">Engagement trends will populate once students complete more assessments.</p>
            </div>
        </Card>

        <Card className="glass-card p-6 border-none shadow-xl">
           <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Live Assessments
           </h3>
           <div className="space-y-4">
              {quizzes.slice(0, 5).map((quiz, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-white/5 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold group-hover:text-primary transition-colors truncate pr-2 italic">{quiz.title}</p>
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-0 bg-primary/10 text-primary h-5">{quiz.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase">
                           <Timer className="w-3.5 h-3.5 text-primary" />
                           {quiz.duration}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase">
                           <Target className="w-3.5 h-3.5 text-accent" />
                           {quiz.difficulty}
                        </div>
                    </div>
                </div>
              ))}
              {quizzes.length === 0 && (
                <div className="py-10 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No local assessments found.</p>
                </div>
              )}
           </div>
           {quizzes.length > 5 && (
             <Button variant="ghost" className="w-full mt-4 text-[10px] font-black uppercase tracking-widest">View Inventory</Button>
           )}
        </Card>
      </div>

      <Card className="glass-card p-6 border-none shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    Class Hall of Fame
                </h3>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase h-5 tracking-widest px-3">GLOBAL RANKINGS</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hallOfFame.length > 0 ? hallOfFame.map((student, index) => (
                    <motion.div
                        key={student.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            index === 0 ? 'bg-amber-400 text-white' : 'bg-white/10 text-muted-foreground'
                        }`}>
                            {index === 0 ? <Medal className="w-5 h-5" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold italic truncate">{student.name}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-black">{student.count} Quizzes</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-primary font-mono tracking-tighter uppercase">{student.score}%</p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-muted/10 border-2 border-dashed border-white/5 rounded-3xl">
                        <Trophy className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Hall of fame is empty for current semester.</p>
                    </div>
                )}
            </div>
      </Card>
    </div>
  );
}
