import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Download, 
  Info, 
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/contexts/AuthContext';
import { getTimetable, getSyllabus, getStudents, TimetableSlot, Syllabus } from '@/lib/data-store';

export default function TimetableSyllabus() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [syllabus, setSyllabus] = useState<Syllabus[]>([]);
  const [selectedDay, setSelectedDay] = useState('Mon');

  useEffect(() => {
    if (!user) return;
    const allStudents = getStudents();
    const student = allStudents.find(s => s.id === user.id || s.email === user.email);
    
    if (student) {
        // Fetch Timetable
        const allSlots = getTimetable();
        // Assuming student.class matches batch or classId used in timetable
        const mySlots = allSlots.filter(s => 
            (s.classId === student.batch || s.classId === student.year.toString()) && 
            s.sectionId === student.section
        );
        
        // Transform for display based on selected day
        // Need to re-trigger this when selectedDay changes
        updateTimetableDisplay(mySlots, selectedDay);

        // Fetch Syllabus
        // Syllabus is by subject. We need subjects for this student.
         // In a real app we'd get subjects from curriculum. Here we infer from timetable or just get all for now for demo
        const allSyllabus = getSyllabus();
        setSyllabus(allSyllabus); // Ideally filter by semester/year
    }
  }, [user, selectedDay]); // added selectedDay dependency to re-filter

  const updateTimetableDisplay = (slots: TimetableSlot[], dayShort: string) => {
      // Map short day to full day
      const dayMap: any = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };
      const fullDay = dayMap[dayShort];
      
      const daysSlots = slots.filter(s => s.day === fullDay).sort((a, b) => a.period - b.period);
      
      const mapped = daysSlots.map(s => ({
          time: getTimeFromPeriod(s.period), // Helper needed
          subject: s.subject,
          room: s.room,
          faculty: s.facultyName,
          type: s.type, // theory/lab
          color: getSubjectColor(s.subject), // Helper
          avatar: '' 
      }));
      setTimetable(mapped);
  };

  const getTimeFromPeriod = (p: number) => {
      const times = ['09:00 - 09:50', '09:50 - 10:40', '10:50 - 11:40', '11:40 - 12:30', '01:30 - 02:20', '02:20 - 03:10', '03:10 - 04:10', '04:10 - 05:00'];
      return times[p-1] || 'Unknown';
  };

  const getSubjectColor = (subject: string) => {
      // Consistent coloring
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
      let hash = 0;
      for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Timetable & Syllabus</h1>
          <p className="text-muted-foreground">Manage your weekly schedule and track course progress</p>
        </div>
      </motion.div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="timetable" className="rounded-lg px-8">Timetable</TabsTrigger>
          <TabsTrigger value="syllabus" className="rounded-lg px-8">Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <Button 
                key={idx} 
                variant={selectedDay === day ? 'default' : 'outline'} 
                className={`rounded-xl ${day === 'Sun' ? 'opacity-50' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {timetable.length > 0 ? timetable.map((session, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col md:flex-row md:items-center gap-6 p-5 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4 md:w-48">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{session.time}</p>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${
                      session.type === 'lab' ? 'text-accent' : 'text-primary'
                    }`}>{session.type}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${session.color}`} />
                    {session.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {session.room}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={session.avatar} />
                        <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                      </Avatar>
                      {session.faculty}
                    </div>
                  </div>
                </div>

                <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )) : (
                <div className="text-center py-10 text-muted-foreground">No classes scheduled for this day.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="syllabus" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {syllabus.length > 0 ? syllabus.map((course, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{course.subjectCode}</p>
                  <h3 className="text-xl font-bold">{course.subjectName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.type}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{course.credits} Credits</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-tighter">Course Completion</span>
                    <span className="text-accent">
                        {Math.round((course.units.filter(u => u.status === 'completed').length / course.units.length) * 100) || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(course.units.filter(u => u.status === 'completed').length / course.units.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="units" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2 text-primary font-bold text-xs">
                      View Detailed Units
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {course.units?.map((unit, uIdx) => (
                          <li key={uIdx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-[11px]">
                            <span className="font-medium">{unit.title}</span>
                            {unit.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                unit.status === 'in-progress' ? 'bg-primary/20 text-primary animate-pulse' : 'bg-muted text-muted-foreground'
                              }`}>
                                {unit.status.toUpperCase()}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )) : (
                <div className="col-span-2 text-center py-10 text-muted-foreground">No syllabus data available.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
