import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Upload,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Assignments() {
  const assignments = [
    { 
      id: 1,
      title: "Data Structures - Graph Algorithms",
      subject: "CS301",
      deadline: "Oct 25, 2024",
      status: "pending",
      priority: "high",
      progress: 45
    },
    { 
      id: 2,
      title: "DBMS - Normalization & Indexing",
      subject: "CS302",
      deadline: "Oct 28, 2024",
      status: "submitted",
      priority: "medium",
      progress: 100
    },
    { 
      id: 3,
      title: "OS - Process Synchronization",
      subject: "CS303",
      deadline: "Tomorrow",
      status: "pending",
      priority: "critical",
      progress: 10
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Keep track of your coursework and submission deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">History</Button>
          <Button variant="gradient">Submit New</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-6 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    assignment.status === 'submitted' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {assignment.status === 'submitted' ? <CheckCircle2 className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{assignment.subject}</p>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase ${getPriorityColor(assignment.priority)} border-0`}>
                        {assignment.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{assignment.title}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    DEADLINE
                  </div>
                  <p className="text-sm font-black tracking-tight">{assignment.deadline}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground">Preparation Progress</span>
                  <span className="font-bold text-primary">{assignment.progress}%</span>
                </div>
                <Progress value={assignment.progress} className="h-1.5" />
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      PDF / DOCX
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <AlertCircle className="w-3 h-3" />
                      PLAGIARISM CHECK REQUIRED
                    </div>
                  </div>
                  <Button variant={assignment.status === 'submitted' ? 'secondary' : 'default'} size="sm" className="rounded-xl h-8 text-xs font-bold">
                    {assignment.status === 'submitted' ? 'View Submission' : 'Upload Assignment'}
                    <Upload className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Submission Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <p className="text-2xl font-black text-primary font-mono">12</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Completed</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-white/5">
                <p className="text-2xl font-black text-warning font-mono">03</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-success uppercase">Completion Rate</span>
                <span className="text-xs font-black text-success">80%</span>
              </div>
              <div className="h-1.5 bg-success/20 rounded-full overflow-hidden">
                <div className="h-full bg-success w-[80%]" />
              </div>
            </div>
          </motion.div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {[1, 2].map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <div className="flex-1">
                    <p className="text-xs font-bold truncate">OS Process Synchronization</p>
                    <p className="text-[10px] text-muted-foreground">Due in 23 hours</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
