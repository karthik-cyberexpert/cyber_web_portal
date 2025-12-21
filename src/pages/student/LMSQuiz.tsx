import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function LMSQuiz() {
  const [activeTab, setActiveTab] = useState('available');

  const quizzes = [
    { 
      id: 1, 
      title: "Data Structures - Linked Lists", 
      subject: "CS301",
      duration: "30 mins", 
      questions: 20, 
      status: "active",
      difficulty: "Medium",
      deadline: "Oct 25, 06:00 PM"
    },
    { 
      id: 2, 
      title: "DBMS - SQL Joins & Queries", 
      subject: "CS302",
      duration: "45 mins", 
      questions: 30, 
      status: "completed",
      difficulty: "Hard",
      score: 85,
      date: "Oct 15"
    },
    { 
      id: 3, 
      title: "OS - Memory Management", 
      subject: "CS303",
      duration: "20 mins", 
      questions: 15, 
      status: "missed",
      difficulty: "Easy",
      deadline: "Oct 12"
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Arun Kumar", score: 98, time: "12:45", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" },
    { rank: 2, name: "Priya Das", score: 95, time: "14:20", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { rank: 3, name: "Senthil Kumar", score: 92, time: "13:10", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">LMS Quiz Portal</h1>
          <p className="text-muted-foreground">Test your knowledge with chapter-wise assessments</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border-primary/20">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Average Score</p>
              <p className="text-sm font-black">78.5%</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Difficulty Selection Cards */}
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
                <span className="text-xs font-black uppercase tracking-widest">{mode.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest text-[10px]">Active Assessments</h3>
              <div className="flex gap-1">
                {['available', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                      activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
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
                {quizzes
                  .filter(q => activeTab === 'available' ? q.status !== 'completed' : q.status === 'completed')
                  .map((quiz, idx) => (
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
                          quiz.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Puzzle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{quiz.subject}</p>
                            <Badge variant="outline" className="text-[9px] font-bold border-0 bg-muted/50">{quiz.difficulty}</Badge>
                            {quiz.status === 'active' && <Badge className="bg-success text-white border-0 text-[9px] px-2 h-4 animate-pulse">LIVE</Badge>}
                          </div>
                          <h4 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight mb-3">
                            {quiz.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-left">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                              <Timer className="w-3.5 h-3.5" />
                              {quiz.duration}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                              <HelpCircle className="w-3.5 h-3.5" />
                              {quiz.questions} Qs
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 min-w-[140px]">
                        {quiz.status === 'completed' ? (
                          <div className="text-right">
                            <p className="text-2xl font-black text-success font-mono">{quiz.score}%</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Score</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm font-bold text-warning">{quiz.deadline}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Deadline</p>
                          </div>
                        )}
                        
                        <Button 
                          variant={quiz.status === 'active' ? 'default' : 'secondary'} 
                          size="sm" 
                          className="w-full rounded-xl h-9 text-xs font-bold"
                          disabled={quiz.status === 'missed'}
                        >
                          {quiz.status === 'active' ? 'Begin Session' : quiz.status === 'completed' ? 'Review Quiz' : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </h3>
            <div className="space-y-4 relative z-10">
              {leaderboard.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5 hover:border-primary/20 transition-all group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    idx === 0 ? 'bg-yellow-500 text-white' : 
                    idx === 1 ? 'bg-slate-300 text-slate-700' : 
                    'bg-amber-600 text-white'
                  }`}>
                    {user.rank}
                  </div>
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{user.time} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary font-mono">{user.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full h-auto p-0 text-[10px] font-bold text-primary uppercase mt-4 tracking-widest">View Full Rankings</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
              <History className="w-4 h-4" />
              Performance Trend
            </h3>
            <div className="h-32 flex items-end justify-between px-2 gap-2">
              {[65, 45, 85, 70, 95, 80].map((height, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`w-full rounded-t-lg ${idx === 4 ? 'bg-primary pulse-glow' : 'bg-primary/20 hover:bg-primary/40 transition-colors'}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[9px] font-black text-muted-foreground uppercase tracking-tighter px-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
