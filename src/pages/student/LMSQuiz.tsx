import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle2, 
  Timer,
  BarChart,
  HelpCircle,
  Plus,
  Trophy,
  History,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getQuizzes, Quiz, getQuizResults, QuizResult } from '@/lib/data-store';

export default function LMSQuiz() {
  const [activeTab, setActiveTab] = useState('available');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setQuizzes(getQuizzes());
    setResults(getQuizResults());
  }, []);

  // Compute leaderboard from results
  // We'll aggregate by user and take their best score or sum scores
  const leaderboard = useMemo(() => {
    const userStats = new Map<string, { name: string, score: number, time: string, count: number }>();
    
    results.forEach(res => {
        const existing = userStats.get(res.userId);
        if (!existing || res.score > existing.score) {
            userStats.set(res.userId, {
                name: res.userName,
                score: res.score,
                time: res.timeTaken,
                count: (existing?.count || 0) + 1
            });
        } else if (existing) {
            existing.count += 1;
        }
    });

    return Array.from(userStats.values())
        .sort((a, b) => b.score - a.score || parseInt(a.time) - parseInt(b.time))
        .slice(0, 5)
        .map((user, idx) => ({
            rank: idx + 1,
            ...user,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
        }));
  }, [results]);

  const overallAverage = useMemo(() => {
    if (results.length === 0) return 'N/A';
    const sum = results.reduce((acc, res) => acc + res.score, 0);
    return `${Math.round(sum / results.length)}%`;
  }, [results]);

  const filteredQuizzes = quizzes.filter(q => activeTab === 'available' ? q.status !== 'expired' : q.status === 'expired');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">LMS Quiz Portal 🧩</h1>
          <p className="text-muted-foreground font-medium">Test your knowledge with chapter-wise assessments</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border-primary/20">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Overall Average</p>
              <p className="text-sm font-black mt-1 uppercase">{overallAverage}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Practice", icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Challenge", icon: Zap, color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Mock Exam", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((mode, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl glass-card flex flex-col items-center gap-2 border-transparent hover:border-primary/20 transition-all ${mode.bg}`}
              >
                <mode.icon className={`w-6 h-6 ${mode.color}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest text-[9px]">Inventory</h3>
              <div className="flex bg-muted p-1 rounded-lg">
                {['available', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                      activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, idx) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group p-6 glass-card rounded-2xl transition-all hover:border-primary/20 bg-primary/[0.01]"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-5 text-left">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          quiz.status === 'active' ? 'bg-primary/10 text-primary pulse-glow' :
                          quiz.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Puzzle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{quiz.subjectCode}</p>
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-0 bg-muted/50 tracking-widest px-2">{quiz.difficulty}</Badge>
                            {quiz.status === 'active' && <Badge className="bg-success text-white border-0 text-[10px] px-2 h-5 animate-pulse uppercase font-black tracking-widest shadow-glow-sm">LIVE</Badge>}
                          </div>
                          <h4 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight mb-3 italic">
                            {quiz.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-left">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              <Timer className="w-3.5 h-3.5 text-primary" />
                              {quiz.duration}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              <HelpCircle className="w-3.5 h-3.5 text-accent" />
                              {quiz.questions} Questions
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 min-w-[150px]">
                        <div className="text-right">
                          <p className="text-xs font-black text-warning uppercase tracking-widest">{quiz.deadline}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Closing Time</p>
                        </div>
                        
                        <Button 
                          variant={quiz.status === 'active' ? 'gradient' : 'secondary'} 
                          size="sm" 
                          className="w-full rounded-xl h-10 text-xs font-black uppercase tracking-widest shadow-glow-sm"
                          disabled={quiz.status !== 'active'}
                        >
                          {quiz.status === 'active' ? 'Begin Session' : quiz.status === 'scheduled' ? 'Coming Soon' : 'Closed'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                    <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-white/5 rounded-2xl">
                        <AlertCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No {activeTab} quizzes found.</p>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="w-24 h-24 rotate-12" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Global Leaderboard
            </h3>
            <div className="space-y-4 relative z-10">
              {leaderboard.length > 0 ? leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 
                    idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-700' : 
                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-white/10 text-muted-foreground'
                  }`}>
                    {user.rank}
                  </div>
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">{user.time} min • {user.count} Quizzes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary font-mono">{user.score}%</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">Rankings will be calculated after next session.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
              <History className="w-4 h-4" />
              Portal Status
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
                LMS Assessment engine is online. Global rankings are updated in real-time based on normalized scores across all batches and sections.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
