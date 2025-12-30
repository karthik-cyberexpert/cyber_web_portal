import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  User, 
  BookOpen, 
  Download, 
  CheckCircle2,
  Building,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function TimetableSyllabus() {
  const { user } = useAuth();
  const [timetableData, setTimetableData] = useState<any>({});
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/student-timetable`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Timetable loaded:', data);
          setTimetableData(data.timetable || {});
          setSyllabus(data.syllabus || []);
        } else {
          console.error('Failed to load timetable');
        }
      } catch (err) {
        console.error('Error loading timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimetable();
  }, [user]);

  const getSlot = (day: string, period: number | string) => {
    const daySlots = timetableData[day] || [];
    return daySlots.find((slot: any) => slot.period === period);
  };

  const hasSameContent = (day: string, p1: number | string, p2: number | string) => {
    const s1 = getSlot(day, p1);
    const s2 = getSlot(day, p2);
    if (!s1 || !s2) return false;
    return s1.subject === s2.subject && s1.type === s2.type && s1.code === s2.code;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             Timetable & Syllabus
          </h1>
          <p className="text-muted-foreground">Manage your weekly schedule and track course progress</p>
        </div>
      </motion.div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="timetable" className="rounded-lg px-8">Timetable</TabsTrigger>
          <TabsTrigger value="syllabus" className="rounded-lg px-8">Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="space-y-6 outline-none">
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
                    Weekly Schedule
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
                                        {slot.code && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                            {slot.code}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            {slot.faculty && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <User className="w-3 h-3" />
                                                {slot.faculty.split(' ')[0]}
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
        </TabsContent>

        <TabsContent value="syllabus" className="outline-none">
          <Card className="glass-card border-white/10 overflow-hidden">
             <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Syllabus
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="w-[80px]">S.No</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Subject Code</TableHead>
                            <TableHead>Faculty Name</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {syllabus.length > 0 ? syllabus.map((course, idx) => {
                             return (
                                <TableRow key={idx} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                                    <TableCell className="font-medium">{course.subject_name}</TableCell>
                                    <TableCell>
                                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                            {course.subject_code}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] text-accent font-bold">
                                                {course.faculty_name ? course.faculty_name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm">{course.faculty_name || 'Not Assigned'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                                onClick={() => toast.success(`Viewing syllabus for ${course.subject_name}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                                                onClick={() => toast.success(`Downloading syllabus for ${course.subject_name}`)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                             );
                         }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No syllabus data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
