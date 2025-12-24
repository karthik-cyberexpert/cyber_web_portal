import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Search,
  Filter,
  User,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getResources, getSyllabus, Resource, Syllabus } from '@/lib/data-store';

export default function NotesStatus() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectNotes, setSubjectNotes] = useState<any[]>([]);

  useEffect(() => {
    const allResources = getResources();
    const allSyllabus = getSyllabus();

    // Grouping resources by subject and matching with syllabus units
    const stats = allSyllabus.map(syl => {
        const relatedResources = allResources.filter(r => r.subjectCode === syl.subjectCode && r.type === 'Note');
        
        // Basic logic: if units are defined, count units with at least one note
        // For now, let's just count total notes per subject vs a target (e.g. 5 units)
        const completedUnits = Math.min(relatedResources.length, 5); // Mock unit mapping
        
        return {
            id: syl.id,
            subject: syl.subjectName,
            code: syl.subjectCode,
            faculty: 'Assigned Faculty',
            totalUnits: 5,
            completedUnits: completedUnits,
            lastUpdate: relatedResources.length > 0 ? new Date(relatedResources[0].createdAt).toLocaleDateString() : 'N/A',
            status: completedUnits >= 5 ? 'Completed' : completedUnits > 0 ? 'In Progress' : 'Pending'
        };
    });

    setSubjectNotes(stats);
  }, []);

  const filteredNotes = subjectNotes.filter(n => 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Notes Completion Status 📚</h1>
          <p className="text-muted-foreground">Monitor subject-wise notes upload progress for your class</p>
        </div>
        <div className="flex gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search subject..." 
                className="pl-10 w-[240px] rounded-xl glass-card bg-background/50" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" className="rounded-xl">
             <Filter className="w-4 h-4 mr-2" />
             Filters
           </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg. Completion', value: subjectNotes.length > 0 ? `${Math.round((subjectNotes.reduce((a,b) => a + (b.completedUnits/b.totalUnits), 0) / subjectNotes.length) * 100)}%` : '0%', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Units', value: `${subjectNotes.reduce((a,b) => a + (b.totalUnits - b.completedUnits), 0)} Units`, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Active Subjects', value: subjectNotes.length.toString(), icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-2xl flex items-center justify-between border-none shadow-lg"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 uppercase">{stat.value}</h3>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.map((note, index) => {
          const percentage = (note.completedUnits / note.totalUnits) * 100;
          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{note.subject}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{note.code}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "px-3 py-1 rounded-lg border-none flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]",
                        note.status === 'Completed' ? 'bg-success/20 text-success' : 
                        note.status === 'Delayed' ? 'bg-destructive/10 text-destructive shadow-glow-sm shadow-destructive/20' : 
                        'bg-primary/10 text-primary'
                      )}
                    >
                      {note.status === 'Delayed' && <AlertCircle className="w-3 h-3" />}
                      {note.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-semibold">{note.faculty}</p>
                        <p className="text-xs text-muted-foreground">Subject Coordinator</p>
                     </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground">Unit Progress</span>
                      <span className="font-bold">{note.completedUnits}/{note.totalUnits} Units</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full shadow-glow-sm",
                          note.status === 'Completed' ? 'bg-success' : 
                          note.status === 'Delayed' ? 'bg-destructive' : 'bg-primary'
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Updated {note.lastUpdate}
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary rounded-lg group">
                      Detailed View
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {filteredNotes.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-white/5">
                <p className="text-muted-foreground">No subjects or syllabus records found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
