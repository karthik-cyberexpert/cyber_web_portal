import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap,
  Clock,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { calculateCurrentAcademicState } from '@/lib/academic-calendar';
import { API_BASE_URL } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  startOfWeek,
  endOfWeek,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';

interface Batch {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    code: string;
    name: string;
    semester: number;
}

interface CalendarEvent {
    id: number;
    event_type: 'UT' | 'MODEL' | 'SEMESTER' | 'HOLIDAY';
    date: string;
    title?: string;
    subject_id?: number;
    subject_name?: string;
    subject_code?: string;
    description?: string;
}

const EXAM_TYPES = [
    { value: 'UT', label: 'Unit Test (UT)' },
    { value: 'MODEL', label: 'Model Exam' },
    { value: 'SEMESTER', label: 'Semester Exam' }
];

export default function ExamSchedule() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [selectedUTType, setSelectedUTType] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch batches and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, subjectsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/academic/batches`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/academic/subjects`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        if (batchesRes.ok) {
           const data = await batchesRes.json();
           setBatches(data);
        }
        if (subjectsRes.ok) {
            const data = await subjectsRes.json();
            setSubjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, [token]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
      if (!selectedBatchId || !selectedSemester) return;

      try {
          const query = new URLSearchParams({
              // type: '...', // Intentionally omitted to fetch all types
              batchId: selectedBatchId,
              semester: selectedSemester,
              month: (currentMonth.getMonth() + 1).toString(),
              year: currentMonth.getFullYear().toString()
          });

          const res = await fetch(`${API_BASE_URL}/calendar/events?${query.toString()}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              setEvents(data);
          }
      } catch (error) {
          console.error("Failed to fetch events", error);
      }
  }, [selectedBatchId, selectedSemester, currentMonth, token]);

  useEffect(() => {
      fetchEvents();
  }, [fetchEvents]);

  const handleBatchChange = (batchId: string) => {
      setSelectedBatchId(batchId);
      
      const batch = batches.find(b => b.id.toString() === batchId);
      if (batch) {
          const { semester } = calculateCurrentAcademicState(batch.name);
          setSelectedSemester(semester.toString());
      }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      setSelectedSubject("");
      setSelectedExamType("");
      setSelectedUTType("");
      setIsDialogOpen(true);
  };

  const handleScheduleExam = async () => {
      if (!selectedSubject || !selectedDate || !selectedExamType) {
          toast.error("Please fill in all fields");
          return;
      }

      setIsSaving(true);
      const finalCategory = selectedExamType === 'UT' ? selectedUTType : selectedExamType;
      
      try {
          const res = await fetch(`${API_BASE_URL}/calendar/events`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                  event_type: finalCategory,
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  batch_id: selectedBatchId,
                  semester: selectedSemester,
                  subject_id: selectedSubject,
                  description: `${finalCategory} - ${subjects.find(s => s.id.toString() === selectedSubject)?.name}`
              })
          });

          if (res.ok) {
              const subjectName = subjects.find(s => s.id.toString() === selectedSubject)?.name || "Exam";
              toast.success(`Scheduled ${subjectName} (${finalCategory})`);
              setIsDialogOpen(false);
              fetchEvents(); // Refresh
          } else {
              const errorData = await res.json();
              toast.error(errorData.message || "Failed to schedule exam");
          }
      } catch (error) {
          toast.error("Network error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: number) => {
      e.stopPropagation();
      if(!confirm("Are you sure you want to delete this exam?")) return;

      try {
          const res = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              toast.success("Exam cancelled");
              fetchEvents();
          }
      } catch (error) {
           toast.error("Failed to delete");
      }
  }

  // Filtered Subjects based on selected Semester
  const filteredSubjects = subjects.filter(
      (s) => s.semester.toString() === selectedSemester
  );

  // Generate Calendar Grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventColor = (type: string) => {
      switch(type) {
          case 'UT':
          case 'UT-1':
          case 'UT-2':
          case 'UT-3': return 'bg-blue-500/10 border-blue-500/20 text-blue-200';
          case 'MODEL': return 'bg-purple-500/10 border-purple-500/20 text-purple-200';
          case 'SEMESTER': return 'bg-orange-500/10 border-orange-500/20 text-orange-200';
          default: return 'bg-gray-500/10 border-gray-500/20 text-gray-200';
      }
  };

  return (
    <div className="space-y-6">
      {/* Full Width Selection Header */}
      <div className="-mx-6 -mt-6 p-6 bg-background/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Exam Schedule
              </h1>
              <p className="text-muted-foreground text-sm">Manage all exam schedules (UT, Model, Semester, External)</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               {/* Batch Selector */}
               <div className="w-[200px]">
                   <Select value={selectedBatchId} onValueChange={handleBatchChange}>
                       <SelectTrigger className="bg-white/5 border-white/10 h-10">
                           <SelectValue placeholder="Select Batch" />
                       </SelectTrigger>
                       <SelectContent>
                           {batches.map(batch => (
                               <SelectItem key={batch.id} value={batch.id.toString()}>
                                   <div className="flex items-center gap-2">
                                       <GraduationCap className="w-4 h-4 text-primary" />
                                       {batch.name}
                                   </div>
                               </SelectItem>
                           ))}
                       </SelectContent>
                   </Select>
               </div>

               {/* Semester Selector */}
               {selectedBatchId && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="w-[160px]"
                   >
                       <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                           <SelectTrigger className="bg-white/5 border-white/10 h-10">
                               <SelectValue placeholder="Semester" />
                           </SelectTrigger>
                           <SelectContent>
                               {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                   <SelectItem key={sem} value={sem.toString()}>
                                       Semester {sem}
                                   </SelectItem>
                               ))}
                           </SelectContent>
                       </Select>
                   </motion.div>
               )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
        {selectedBatchId && selectedSemester ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
                {/* Calendar Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-foreground">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs font-medium px-3 h-8">
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-4">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> UT</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Model</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Sem</span>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                        {weeks.map(day => (
                            <div key={day} className="py-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-white/10 divide-y bg-background/30">
                        {calendarDays.map((day, dayIdx) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodayDate = isToday(day);
                            const dateStr = format(day, 'yyyy-MM-dd');
                            
                            // Find events for this day
                            const dayEvents = events.filter(e => {
                                const eventDate = typeof e.date === 'string' ? e.date.split('T')[0] : format(e.date, 'yyyy-MM-dd');
                                return eventDate === dateStr;
                            });

                            return (
                                <motion.div
                                    key={day.toString()}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: dayIdx * 0.01 }}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        relative p-2 group transition-all duration-200 cursor-pointer
                                        ${!isCurrentMonth ? 'bg-black/20 text-muted-foreground/30' : 'hover:bg-white/5'}
                                        ${isTodayDate ? 'bg-primary/5' : ''}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`
                                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                                            ${isTodayDate ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40' : 'text-muted-foreground group-hover:text-foreground group-hover:bg-white/10'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    {/* Events Container */}
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div 
                                                key={event.id} 
                                                className={`text-[10px] p-1 px-1.5 rounded border truncate font-medium flex items-center justify-between group/event ${getEventColor(event.event_type)}`}
                                            >
                                                <span>
                                                    <span className="opacity-75 mr-1 font-bold">{event.event_type && event.event_type.charAt(0)}:</span> 
                                                    {event.subject_name || event.title}
                                                </span>
                                                <button 
                                                    onClick={(e) => handleDeleteEvent(e, event.id)}
                                                    className="opacity-0 group-hover/event:opacity-100 hover:text-red-400 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Hover Add Button */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                            <Plus className="w-3 h-3" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
            >
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl rotate-3">
                    <CalendarIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-foreground">No Batch Selected</h3>
                    <p className="text-muted-foreground">Select a batch and semester from the header to view the exam schedule.</p>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
      
        {/* Schedule Exam Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Schedule Exam</DialogTitle>
                    <DialogDescription>
                        Schedule an exam for <strong>{selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="exam-type">Exam Type</Label>
                        <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                            <SelectTrigger id="exam-type" className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Select Exam Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXAM_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedExamType === 'UT' && (
                        <div className="grid gap-2">
                            <Label htmlFor="ut-type">UT Sub-type</Label>
                            <Select value={selectedUTType} onValueChange={setSelectedUTType}>
                                <SelectTrigger id="ut-type" className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select UT Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UT-1">UT-1</SelectItem>
                                    <SelectItem value="UT-2">UT-2</SelectItem>
                                    <SelectItem value="UT-3">UT-3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger id="subject" className="bg-white/5 border-white/10">
                                <SelectValue placeholder={filteredSubjects.length > 0 ? "Select Subject" : "No subjects for this semester"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.name} ({subject.code})
                                    </SelectItem>
                                )) : (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        No subjects found for Semester {selectedSemester}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button 
                        onClick={handleScheduleExam} 
                        className="bg-primary text-primary-foreground" 
                        disabled={filteredSubjects.length === 0 || isSaving || !selectedExamType || (selectedExamType === 'UT' && !selectedUTType)}
                    >
                        {isSaving ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Scheduling...' : 'Schedule'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
