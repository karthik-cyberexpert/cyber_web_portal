import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTutors, 
  getTimetable, 
  getSyllabus, 
  getCirculars, 
  getAssignments,
  Tutor, 
  TimetableSlot,
  Syllabus,
  Circular,
  Assignment
} from '@/lib/data-store';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:15 - 12:15',
  '12:15 - 01:15',
  '02:00 - 03:00',
  '03:00 - 04:00'
];

export default function Timetable() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [schedule, setSchedule] = useState<Record<string, any[]>>({});
  const [velocity, setVelocity] = useState<any[]>([]);
  const [pulse, setPulse] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const allTutors = getTutors();
    const currentTutor = allTutors.find(t => t.id === user.id || t.email === user.email);
    if (!currentTutor) return;
    setTutor(currentTutor);

    // 1. Timetable
    const allTimetable = getTimetable();
    const mySectionTimetable = allTimetable.filter(t => t.classId === currentTutor.batch && t.sectionId === currentTutor.section);

    const grouped: Record<string, any[]> = {};
    const subjectCodesList = new Set<string>();

    days.forEach(day => {
        const daySlots = mySectionTimetable.filter(t => t.day === day).sort((a, b) => a.period - b.period);
        const slots = Array(6).fill(null).map((_, i) => {
            const match = daySlots.find(s => s.period === i + 1);
            if (match) {
                subjectCodesList.add(match.subjectCode);
                return {
                    subject: match.subject,
                    code: match.subjectCode,
                    room: match.room || 'LH-01',
                    type: match.type || 'theory',
                    faculty: match.facultyName,
                    color: match.type === 'lab' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                };
            }
            if (i === 3) return { subject: 'Lunch Break', type: 'Break', color: 'bg-muted text-muted-foreground' };
            return { subject: 'No Class', type: 'Free', color: 'bg-muted/30 text-muted-foreground' };
        });
        grouped[day] = slots;
    });
    setSchedule(grouped);

    // 2. Syllabus Velocity
    const allSyllabus = getSyllabus();
    const mySubjectsSyllabus = allSyllabus.filter(s => subjectCodesList.has(s.subjectCode));
    
    const velocityData = mySubjectsSyllabus.map(s => {
        const completed = s.units.filter(u => u.status === 'completed').length;
        const total = s.units.length;
        const prog = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
            sub: s.subjectName,
            prog,
            color: prog > 80 ? 'bg-success' : prog > 50 ? 'bg-primary' : 'bg-warning'
        };
    });
    setVelocity(velocityData.length > 0 ? velocityData : [
        { sub: 'Syllabus Data Pending', prog: 0, color: 'bg-muted' }
    ]);

    // 3. Class Pulse (Circulars + Assignments)
    const allCirculars = getCirculars();
    const allAssignments = getAssignments();
    
    const myAssignments = allAssignments.filter(a => a.classId === currentTutor.batch && a.sectionId === currentTutor.section);
    const relevantCirculars = allCirculars.filter(c => c.audience === 'students' || c.audience === 'all');

    const pulseData = [
        ...myAssignments.map(a => ({
            label: 'Assignment Due',
            title: a.title,
            date: a.dueDate,
            color: 'text-primary'
        })),
        ...relevantCirculars.map(c => ({
            label: 'Circular',
            title: c.title,
            date: c.date,
            color: 'text-accent'
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    
    setPulse(pulseData);

  }, [user]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Class Timetable 📅</h1>
          <p className="text-muted-foreground font-medium">Academic schedule for Section {tutor?.section} ({tutor?.batch})</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest italic hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            Class Selector
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-6">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      <div className="flex bg-white/5 p-2 rounded-2xl overflow-x-auto gap-2 no-scrollbar border border-white/5">
        {days.map((day) => (
          <Button
            key={day}
            variant={activeDay === day ? 'default' : 'ghost'}
            onClick={() => setActiveDay(day)}
            className={cn(
              "rounded-xl px-8 font-black uppercase text-[10px] tracking-widest transition-all duration-300 italic",
              activeDay === day ? "shadow-lg shadow-primary/25 bg-primary" : "hover:bg-white/5"
            )}
          >
            {day}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {(schedule[activeDay] || []).map((item, index) => {
            const isBreak = item.type === 'Break';
            const isFree = item.type === 'Free';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "glass-card border-none overflow-hidden transition-all duration-300 group hover:translate-x-2 rounded-2xl",
                  (isBreak || isFree) ? "opacity-60" : "shadow-xl hover:shadow-2xl bg-white/[0.02]"
                )}>
                  <div className="flex items-stretch min-h-[90px]">
                    <div className={cn(
                      "w-2 flex-shrink-0",
                      isBreak || isFree ? "bg-white/10" : "bg-gradient-to-b from-primary to-accent shadow-glow shadow-primary/20"
                    )} />
                    
                    <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-4 items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-black italic">{timeSlots[index]}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Session {index + 1}</p>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-black italic tracking-tight uppercase group-hover:text-primary transition-colors">{item.subject}</h4>
                          {item.code && <Badge variant="outline" className="text-[9px] font-mono border-white/10 font-black tracking-widest uppercase">{item.code}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          {item.room && (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                              <MapPin className="w-3 h-3 text-accent" />
                              {item.room}
                            </span>
                          )}
                          {!isBreak && !isFree && (
                            <Badge variant="secondary" className={cn("text-[8px] font-black uppercase tracking-widest px-3 py-0.5 border-none", item.color)}>
                              {item.type}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:flex justify-end">
                         {item.faculty ? (
                           <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-all">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
                               <User className="w-4 h-4 text-primary" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest">{item.faculty}</span>
                           </div>
                         ) : (
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic opacity-50">{isBreak ? 'Break' : 'Self Study'}</span>
                         )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="glass-card p-8 border-none shadow-2xl rounded-3xl bg-white/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-8 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Syllabus Velocity
            </h3>
            <div className="space-y-6">
               {velocity.map((item, i) => (
                 <div key={i} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground italic truncate max-w-[150px]">{item.sub}</span>
                      <span className="text-primary">{item.prog}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${item.prog}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className={cn("h-full rounded-full shadow-glow", item.color)}
                       />
                    </div>
                 </div>
               ))}
            </div>
            <Button variant="outline" className="w-full mt-8 rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest italic hover:bg-white/5">Full Syllabus Mapping</Button>
          </Card>

          <Card className="glass-card p-8 border-none shadow-2xl rounded-3xl bg-gradient-to-br from-success/5 to-primary/5 border border-success/5">
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Class Pulse</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Upcoming Milestones</p>
            <div className="space-y-4">
               {pulse.length > 0 ? pulse.map((item, i) => (
                 <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className={cn("text-[9px] font-black uppercase tracking-widest", item.color)}>{item.label}</p>
                    <p className="text-sm font-black italic mt-2 uppercase">{item.title}</p>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50">{item.date}</p>
                 </div>
               )) : (
                 <div className="text-center py-10 opacity-30 italic font-medium uppercase text-[10px] tracking-widest">No upcoming pulse data</div>
               )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


