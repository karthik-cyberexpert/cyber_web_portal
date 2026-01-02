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
  BookOpen,
  Building,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { getTimetable, TimetableSlot } from '@/lib/data-store';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const periods = [
  { num: 1, time: '8:30 - 9:15' },
  { num: 2, time: '9:15 - 10:20' },
  { num: 'BREAK', time: '10:20 - 10:30', isBreak: true, label: 'Short Break' },
  { num: 3, time: '10:30 - 11:25' },
  { num: 4, time: '11:25 - 12:20' },
  { num: 'LUNCH', time: '12:20 - 1:20', isBreak: true, label: 'Lunch Break' },
  { num: 5, time: '1:20 - 2:15' },
  { num: 6, time: '2:15 - 3:10' },
  { num: 7, time: '3:10 - 4:05' },
];

const getSlotColor = (type: string) => {
  switch (type) {
    case 'theory': return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400';
    case 'lab': return 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400';
    case 'tutorial': return 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400';
    case 'free': return 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/20';
    default: return 'bg-muted';
  }
};

export default function Timetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchTimetable = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/faculty/timetable`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                // Map backend slots to frontend TimetableSlot
                const mapped = data.map((s: any) => ({
                    id: Math.random(), // or s.id
                    day: s.day,
                    period: s.period,
                    subject: s.subject,
                    subjectCode: s.subjectCode,
                    type: 'theory', // Default or derive from subject type
                    room: s.room,
                    classId: s.batch,
                    sectionId: s.section,
                    facultyId: user.id,
                    facultyName: user.name
                }));
                setTimetable(mapped);
            }
        } catch (e) {
            console.error("Error loading timetable", e);
        }
    };
    
    fetchTimetable();
  }, [user]);

  const getSlot = (day: string, period: number | string) => {
    return timetable.find(slot => slot.day === day && slot.period === period);
  };

  const hasSameContent = (day: string, p1: number | string, p2: number | string) => {
    const s1 = getSlot(day, p1);
    const s2 = getSlot(day, p2);
    if (!s1 || !s2) return false;
    return s1.subject === s2.subject && s1.type === s2.type && s1.subjectCode === s2.subjectCode;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             Academic Timetable 🗓️
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Your weekly teaching schedule and lab sessions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
          <Button variant="gradient" className="w-full sm:w-auto">Sync Calendar</Button>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500/40 to-cyan-500/40 border border-blue-500/50" />
          <span className="text-sm text-muted-foreground">Theory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-purple-500/50" />
          <span className="text-sm text-muted-foreground">Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500/40 to-orange-500/40 border border-amber-500/50" />
          <span className="text-sm text-muted-foreground">Tutorial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30" />
          <span className="text-sm text-muted-foreground">Free</span>
        </div>
      </div>

      <Card className="glass-card border-white/10 overflow-hidden">
        <CardHeader className="border-b border-white/10 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-2 text-left text-sm font-semibold text-muted-foreground w-32 sticky left-0 bg-background/95 backdrop-blur z-10">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Day
                      </th>
                      {periods.map((period) => (
                        <th 
                          key={period.num} 
                          className={`p-2 text-center text-sm font-semibold ${period.isBreak ? 'w-10 p-0 bg-emerald-500/20 border-b-0' : ''}`}
                        >
                          {!period.isBreak && (
                            <>
                              <div>{`Period ${period.num}`}</div>
                              <div className="text-xs font-normal text-muted-foreground">{period.time}</div>
                            </>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIndex) => (
                      <tr key={day} className="border-b border-white/5">
                        <td className="p-3 text-sm font-medium text-muted-foreground sticky left-0 bg-background/95 backdrop-blur z-10">
                          {day}
                        </td>
                        {periods.map((period, index) => {
                          // Handle Breaks - Vertical Column
                          if (period.isBreak) {
                             if (dayIndex === 0) {
                               return (
                                 <td 
                                    key={`${day}-${period.num}`} 
                                    rowSpan={days.length} 
                                    className="p-0 bg-emerald-500/20 align-middle text-center w-10 border-x border-white/10 border-t-0"
                                 >
                                    <div className="h-full flex items-center justify-center writing-vertical-lr rotate-180 font-extrabold text-emerald-600 tracking-widest text-xl py-4 uppercase shadow-inner">
                                      {period.label}
                                    </div>
                                 </td>
                               );
                             }
                             return null;
                          }

                          // Handle Saturday Constraint
                          if (day === 'Saturday' && typeof period.num === 'number' && period.num > 4) {
                             return (
                               <td key={`${day}-${period.num}`} className="p-1 bg-white/5 opacity-50 relative">
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground font-medium -rotate-12 select-none">
                                      No Class
                                  </div>
                               </td>
                             );
                          }

                          // MERGE LOGIC
                          const prevPeriod = periods[index - 1];
                          if (prevPeriod && !prevPeriod.isBreak && hasSameContent(day, prevPeriod.num, period.num)) {
                              return null;
                          }

                          let colSpan = 1;
                          for (let k = index + 1; k < periods.length; k++) {
                              const nextPeriod = periods[k];
                              if (nextPeriod.isBreak) break; 
                              if (hasSameContent(day, period.num, nextPeriod.num)) {
                                  colSpan++;
                              } else {
                                  break;
                              }
                          }

                          const slot = getSlot(day, period.num);
                          return (
                            <td 
                                key={`${day}-${period.num}`} 
                                className="p-1"
                                colSpan={colSpan}
                            >
                              {slot ? (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-2 rounded-lg border transition-all cursor-default min-h-[80px] flex flex-col justify-center ${getSlotColor(slot.type)}`}
                                >
                                  <div className="font-medium text-sm truncate">
                                    {slot.subject}
                                  </div>
                                  {slot.subjectCode && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {slot.subjectCode}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                      {slot.classId && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {slot.classId}-{slot.sectionId}
                                        </div>
                                      )}
                                      {slot.room && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Building className="w-3 h-3" />
                                          {slot.room}
                                        </div>
                                      )}
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="h-full min-h-[80px] rounded-lg border border-dashed border-white/5 bg-white/[0.02] flex items-center justify-center opacity-50">
                                    <span className="text-xs text-muted-foreground">Free</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Subject Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Teaching Load Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-4">
             {Array.from(new Set(timetable.map(t => t.subjectCode))).map((code, index) => {
                 const subjectSlots = timetable.filter(t => t.subjectCode === code);
                 if (subjectSlots.length === 0) return null;
                 const subject = subjectSlots[0];
                 return (
                  <motion.div
                    key={code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <Badge className="mb-2">{code}</Badge>
                    <div className="font-medium text-sm">{subject.subject}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {Array.from(new Set(subjectSlots.map(s => `${s.classId}-${s.sectionId}`))).join(', ')}
                    </div>
                    <div className="text-xs text-primary mt-2">{subjectSlots.length} hrs/week</div>
                  </motion.div>
                 );
             })}
             {timetable.length === 0 && <div className="text-muted-foreground text-sm col-span-5 text-center">No subjects scheduled</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
