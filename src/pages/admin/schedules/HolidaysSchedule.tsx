import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Save,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';

interface CalendarEvent {
    id: number;
    event_type: 'UT' | 'MODEL' | 'SEMESTER' | 'HOLIDAY';
    date: string;
    title?: string;
    description?: string;
}

export default function HolidaysSchedule() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
      if (!token) return;
      try {
          const query = new URLSearchParams({
              category: 'Holiday',
              month: (currentMonth.getMonth() + 1).toString(),
              year: currentMonth.getFullYear().toString()
          });

          const res = await fetch(`${API_BASE_URL}/calendar/events?${query.toString()}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
              const data = await res.json();
              setEvents(data);
          } else {
            console.error("Failed to fetch holidays:", res.status, res.statusText);
          }
      } catch (error) {
          console.error("Failed to fetch holidays", error);
      }
  }, [currentMonth, token]);

  useEffect(() => {
      fetchEvents();
  }, [fetchEvents]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      setHolidayName(""); 
      setIsDialogOpen(true);
  };

  const handleDeclareHoliday = async () => {
      if (!holidayName.trim() || !selectedDate) {
          toast.error("Please enter a holiday name");
          return;
      }
      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      setIsSaving(true);
      try {
          const res = await fetch(`${API_BASE_URL}/calendar/events`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                  event_type: 'Holiday',
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  title: holidayName,
                  description: 'Holiday'
              })
          });

          if (res.ok) {
              toast.success(`Declared Holiday: ${holidayName}`);
              setIsDialogOpen(false);
              fetchEvents(); // Refresh
          } else {
              const errorData = await res.json();
              toast.error(`Failed to declare holiday: ${errorData.detail || res.statusText}`);
          }
      } catch (error) {
          toast.error("Network error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: number) => {
      e.stopPropagation();
      if(!confirm("Are you sure you want to remove this holiday?")) return;
      if (!token) {
        toast.error("Authentication token not found.");
        return;
      }

      try {
          const res = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              toast.success("Holiday removed");
              fetchEvents();
          } else {
              const errorData = await res.json();
              toast.error(`Failed to delete holiday: ${errorData.detail || res.statusText}`);
          }
      } catch (error) {
           toast.error("Network error");
      }
  }

  // Generate Calendar Grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Full Width Selection Header */}
      <div className="-mx-6 -mt-6 p-6 bg-background/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Holiday Schedule
              </h1>
              <p className="text-muted-foreground text-sm">Manage Holidays and non-working days</p>
            </div>
            {/* No selection needed for Holidays generally, or could add Year selector */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={() => handleDateClick(new Date())}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Declare Holiday
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                    {weeks.map(day => (
                        <div key={day} className="py-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

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
                                        <div key={event.id} className="text-[10px] p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200 truncate font-medium flex items-center justify-between group/event">
                                            <span>{event.title}</span>
                                            <button 
                                                onClick={(e) => handleDeleteEvent(e, event.id)}
                                                className="opacity-0 group-hover/event:opacity-100 hover:text-red-400 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

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
      
        {/* Schedule Holiday Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Declare Holiday</DialogTitle>
                    <DialogDescription>
                        Declare a holiday for <strong>{selectedDate ? format(selectedDate, 'MMMM do, yyyy') : ''}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="holidayName">Holiday Name</Label>
                        <Input 
                            id="holidayName" 
                            placeholder="e.g. Independence Day" 
                            value={holidayName}
                            onChange={(e) => setHolidayName(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleDeclareHoliday} className="bg-primary text-primary-foreground" disabled={!holidayName.trim() || isSaving}>
                         {isSaving ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                         {isSaving ? 'Saving...' : 'Declare Holiday'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
