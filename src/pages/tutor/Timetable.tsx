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
import { getTimetable, getTutors, TimetableSlot } from '@/lib/data-store';

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
  const [tutorInfo, setTutorInfo] = useState<{batch: string, section: string} | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Tutor's Class Timetable
    // 1. Get Class Info
    // 2. Fetch Timetable for that class
    // For simplicity, we can reuse /api/tutors/class to get the class info, then maybe a new endpoint or filter?
    // OR, we can just fetch the Faculty's OWN timetable if that's what is intended?
    // User request: "for time table, subject allocation and everything"
    // Usually "Tutor Dashboard" -> "Timetable" implies the Class Timetable (of the students they mentor) OR their own schedule.
    // Given the previous code fetched `classSlots` (students' schedule), let's try to maintain that.
    // We need an endpoint `GET /api/tutors/class/timetable` or similar.
    // For now, let's fetch the Faculty's OWN timetable as a fallback or if usually Tutors want to see their teaching schedule.
    // Wait, the previous code was `allSlots.filter(s => s.classId === currentTutor.batch ...)` -> This is CLASS Timetable.
    // So we need to fetch the timetable for the Assigned Batch/Section.
    
    const fetchClassTimetable = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // 1. Get Class Info
            const classRes = await fetch(`${API_BASE_URL}/tutors/class`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            
            if (classRes.ok) {
                const classData = await classRes.json();
                if (classData.hasAssignment) {
                     setTutorInfo({ batch: classData.batch, section: classData.section });
                     
                     // 2. Fetch Timetable for this Batch/Section
                     // We can reuse the public/admin timetable API with filters or make a specific one.
                     // Let's assume we can fetch all or specific. 
                     // Actually, we haven't made a dedicated "Get Class Timetable" API yet.
                     // Let's quickly add `getTutorTimetable` to `tutor.controller`.
                     
                     const ttRes = await fetch(`${API_BASE_URL}/tutors/timetable`, { // New Endpoint needed
                         headers: { Authorization: `Bearer ${token}` }
                     });
                     
                     if (ttRes.ok) {
                         const slots = await ttRes.json();
                         setTimetable(slots.map((s: any) => ({
                             ...s,
                             type: s.type || 'theory'
                         })));
                     }
                }
            }
        } catch (e) {
            console.error("Error fetching class timetable", e);
        }
    };

    fetchClassTimetable();
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
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             Class Timetable 📅
          </h1>
          <p className="text-muted-foreground mt-1">
              Schedule for {tutorInfo ? `Batch ${tutorInfo.batch} - Section ${tutorInfo.section}` : 'My Class'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
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
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
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
                                      {slot.facultyName && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {slot.facultyName.split(' ')[0]}
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
    </div>
  );
}
