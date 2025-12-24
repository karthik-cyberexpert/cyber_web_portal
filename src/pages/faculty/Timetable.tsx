import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
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
import { useAuth } from '@/contexts/AuthContext';
import { getTimetable, TimetableSlot } from '@/lib/data-store';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

const getSlotColor = (type: string) => {
  switch (type) {
    case 'theory': return 'bg-primary/10 text-primary border-primary/20';
    case 'lab': return 'bg-accent/10 text-accent border-accent/20';
    case 'tutorial': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export default function Timetable() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<{day: string, slots: any[]}[]>([]);

  useEffect(() => {
    if (!user) return;
    const allSlots = getTimetable();
    const mySlots = allSlots.filter(s => s.facultyId === user.id || s.facultyName === user.name);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const formattedSchedule = days.map(day => {
        const dailySlots = mySlots.filter(s => s.day === day);
        // Map data-store periods to display times
        const mappedSlots = dailySlots.map(s => ({
            time: getTimeFromPeriod(s.period),
            subject: s.subject,
            class: `${s.classId} (${s.sectionId})`, // Combine class and section
            room: s.room,
            type: s.type
        }));
        return { day, slots: mappedSlots };
    });
    setSchedule(formattedSchedule);
  }, [user]);

  const getTimeFromPeriod = (p: number) => {
    // Basic mapping, assuming 1-based periods starting at 9 AM
    // This logic should ideally match the period definitions in Admin Timetable
    const startHour = 8 + p; 
    const ampm = startHour >= 12 ? 'PM' : 'AM';
    const hour12 = startHour > 12 ? startHour - 12 : startHour;
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Timetable 🗓️</h1>
          <p className="text-muted-foreground mt-1">Your weekly teaching schedule and lab sessions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
          <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20">Sync Calendar</Button>
        </div>
      </motion.div>

      <Card className="glass-card border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full"><ChevronLeft className="w-5 h-5" /></Button>
              <h2 className="text-lg font-black uppercase tracking-widest">March 2024</h2>
              <Button variant="ghost" size="icon" className="rounded-full"><ChevronRight className="w-5 h-5" /></Button>
           </div>
           <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Theory</Badge>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 px-3 py-1">Lab</Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">Tutorial</Badge>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30">
                <th className="p-4 border-b border-r border-white/5 text-xs font-black uppercase tracking-tighter text-muted-foreground w-32">Time / Day</th>
                {schedule.map(day => (
                  <th key={day.day} className="p-4 border-b border-white/5 text-sm font-black uppercase tracking-widest">{day.day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4 border-r border-b border-white/5 text-xs font-bold text-muted-foreground text-center bg-muted/10">{time}</td>
                  {schedule.map(day => {
                    // Fuzzy match time for now since period mapping might be exact hour vs range
                    // In real app, we'd match exact period ID or time range
                    const slot = day.slots.find(s => s.time === time);
                    return (
                      <td key={`${day.day}-${time}`} className="p-2 border-b border-white/5 min-w-[160px]">
                        {slot ? (
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`p-4 rounded-2xl border ${getSlotColor(slot.type)} shadow-lg transition-all cursor-pointer`}
                          >
                            <div className="flex items-center justify-between mb-2">
                               <Badge className="bg-background/50 backdrop-blur-sm text-[10px] font-black uppercase tracking-tighter border-none">{slot.type}</Badge>
                               <BookOpen className="w-3 h-3 opacity-50" />
                            </div>
                            <h4 className="text-sm font-black leading-tight mb-1">{slot.subject}</h4>
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold opacity-80 flex items-center gap-1 uppercase">
                                  <User className="w-2.5 h-2.5" /> {slot.class}
                               </p>
                               <p className="text-[10px] font-bold opacity-80 flex items-center gap-1 uppercase tracking-widest">
                                  <MapPin className="w-2.5 h-2.5" /> {slot.room}
                                </p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full min-h-[80px] rounded-2xl border border-dashed border-white/5 group-hover:border-white/10 transition-colors" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="glass-card p-8 border-none shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 italic">
               <Calendar className="w-6 h-6 text-primary" />
               Upcoming Seminars
            </h3>
            <div className="space-y-4">
               {[
                 { event: 'Research Methodology', date: 'Upcoming Friday', status: 'Department' },
                 { event: 'Curriculum Review', date: 'Nex Monday', status: 'Mandatory' },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-all">
                    <div>
                       <p className="text-sm font-bold italic">{item.event}</p>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{item.date}</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[9px] uppercase font-black tracking-widest">{item.status}</Badge>
                 </div>
               ))}
            </div>
         </Card>

         <Card className="glass-card p-8 border-none shadow-xl bg-gradient-to-br from-accent/5 to-transparent">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3 italic">
               <Clock className="w-6 h-6 text-accent" />
               Teaching Load Analytics
            </h3>
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-3xl font-black tracking-tighter italic">{schedule.reduce((acc, d) => acc + d.slots.length, 0)} hrs</p>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Weekly Contact Load</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-black text-[9px] tracking-widest uppercase px-3 py-1">Active Schedule</Badge>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-xl font-black italic">{schedule.reduce((acc, d) => acc + d.slots.filter(s => s.type === 'theory').length, 0)}</p>
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Theory</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-xl font-black italic">{schedule.reduce((acc, d) => acc + d.slots.filter(s => s.type === 'lab').length, 0)}</p>
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Lab</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                     <p className="text-xl font-black italic">{schedule.reduce((acc, d) => acc + d.slots.filter(s => s.type === 'tutorial').length, 0)}</p>
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Tutorial</p>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
