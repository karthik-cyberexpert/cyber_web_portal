import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Plus, Edit2, Download, Upload, 
  Sparkles, BookOpen, User, Building, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getTimetable, saveTimetable, TimetableSlot, addTimetableSlot, deleteTimetableSlot, getFaculty } from '@/lib/data-store';
import { toast } from 'sonner';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Period structure conceptualization: 
// 1, 2, BREAK, 3, 4, LUNCH, 5, 6, 7
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

export default function Timetable({ view = 'students' }: { view?: 'students' | 'faculty' }) {
  const [selectedBatch, setSelectedBatch] = useState('2024-2028');
  const [selectedYearSem, setSelectedYearSem] = useState('1-1'); // Year 1 - Sem 1
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot> | null>(null);

  useEffect(() => {
    loadData();
    const faculty = getFaculty();
    setFacultyList(faculty);
    if (faculty.length > 0) setSelectedFacultyId(faculty[0].id);
  }, []);

  const loadData = () => {
    const data = getTimetable();
    setTimetable(data);
  };

  const currentTimetable = timetable.filter(
    t => view === 'students' 
      ? t.classId === selectedBatch && t.sectionId === selectedSection
      : t.facultyId === selectedFacultyId
  );

  const getSlot = (day: string, period: number | string) => {
    return currentTimetable.find(slot => slot.day === day && slot.period === period);
  };

  const handleCellClick = (day: string, period: number | string) => {
    // Ensure period is a number for slot creation
    if (typeof period !== 'number') return;

    // Saturday constraint: only 4 periods
    if (day === 'Saturday' && period > 4) {
       toast.error("Saturday is a half day (Only 4 periods)");
       return;
    }
    const existing = getSlot(day, period);
    if (existing) {
      setEditingSlot(existing);
    } else {
      setEditingSlot({
        day,
        period,
        classId: selectedBatch,
        sectionId: selectedSection,
        type: 'theory',
        subject: '',
        subjectCode: '',
        facultyId: '',
        facultyName: '',
        room: ''
      });
    }
    setIsEditOpen(true);
  };

  const hasSameContent = (day: string, p1: number | string, p2: number | string) => {
    const s1 = getSlot(day, p1);
    const s2 = getSlot(day, p2);
    if (!s1 || !s2) return false;
    return s1.subject === s2.subject && s1.type === s2.type && s1.subjectCode === s2.subjectCode;
  };

  const saveSlot = () => {
    if (!editingSlot) return;

    const allSlots = getTimetable();
    
    // Remove existing if any (since we might be updating)
    const filtered = allSlots.filter(
      s => !(s.classId === selectedBatch && s.sectionId === selectedSection && s.day === editingSlot.day && s.period === editingSlot.period)
    );

    // Add new ONLY if subject is not empty (allow deleting by clearing subject)
    if (editingSlot.subject) {
        // Find faculty name
        const faculty = facultyList.find(f => f.id === editingSlot.facultyId);
        const slotToSave: TimetableSlot = {
            id: editingSlot.id || `slot-${Date.now()}`,
            day: editingSlot.day!,
            period: editingSlot.period!,
            classId: selectedBatch,
            sectionId: selectedSection,
            subject: editingSlot.subject!,
            subjectCode: editingSlot.subjectCode || 'SUB',
            facultyId: editingSlot.facultyId || '',
            facultyName: faculty ? faculty.name : (editingSlot.facultyName || 'Unknown'),
            room: editingSlot.room || 'TBD',
            type: (editingSlot.type as any) || 'theory'
        };
        filtered.push(slotToSave);
    }
    
    saveTimetable(filtered);
    setTimetable(filtered);
    setIsEditOpen(false);
    toast.success('Timetable updated successfully');
  };

  const deleteSlot = () => {
     if(editingSlot && editingSlot.id) {
         deleteTimetableSlot(editingSlot.id);
         loadData();
         setIsEditOpen(false);
         toast.success('Slot cleared');
     }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {view === 'students' ? 'Student Timetable' : 'Faculty Timetable'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {view === 'students' ? 'Manage class schedules and academic periods' : 'View and manage faculty scheduling'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {view === 'students' ? (
              <>
                 {/* Batch Selection */}
                 <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2028">Batch 2024-28</SelectItem>
                    <SelectItem value="2023-2027">Batch 2023-27</SelectItem>
                    <SelectItem value="2022-2026">Batch 2022-26</SelectItem>
                    <SelectItem value="2021-2025">Batch 2021-25</SelectItem>
                  </SelectContent>
                </Select>

                {/* Year - Sem Selection */}
                <Select value={selectedYearSem} onValueChange={setSelectedYearSem}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Year & Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-1">Year 1 - Odd Sem (I)</SelectItem>
                    <SelectItem value="1-2">Year 1 - Even Sem (II)</SelectItem>
                    <SelectItem value="2-1">Year 2 - Odd Sem (III)</SelectItem>
                    <SelectItem value="2-2">Year 2 - Even Sem (IV)</SelectItem>
                    <SelectItem value="3-1">Year 3 - Odd Sem (V)</SelectItem>
                    <SelectItem value="3-2">Year 3 - Even Sem (VI)</SelectItem>
                    <SelectItem value="4-1">Year 4 - Odd Sem (VII)</SelectItem>
                    <SelectItem value="4-2">Year 4 - Even Sem (VIII)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Section Selection */}
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                 {/* Faculty Selection */}
                 <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year - Sem Selection (Descending Order) */}
                <Select value={selectedYearSem} onValueChange={setSelectedYearSem}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Year & Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-even">2025 (Even Sem)</SelectItem>
                    <SelectItem value="2025-odd">2025 (Odd Sem)</SelectItem>
                    <SelectItem value="2024-even">2024 (Even Sem)</SelectItem>
                    <SelectItem value="2024-odd">2024 (Odd Sem)</SelectItem>
                    <SelectItem value="2023-even">2023 (Even Sem)</SelectItem>
                    <SelectItem value="2023-odd">2023 (Odd Sem)</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Timetable Grid */}
      <Card className="glass-card border-white/10 overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule View - {view === 'students' ? `Section ${selectedSection}` : (facultyList.find(f => f.id === selectedFacultyId)?.name || 'Faculty')}
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
                          // Check if previous period was same (and not break), if so, skip rendering
                          const prevPeriod = periods[index - 1];
                          if (prevPeriod && !prevPeriod.isBreak && hasSameContent(day, prevPeriod.num, period.num)) {
                              return null;
                          }

                          // Calculate span
                          let colSpan = 1;
                          for (let k = index + 1; k < periods.length; k++) {
                              const nextPeriod = periods[k];
                              if (nextPeriod.isBreak) break; // Don't merge across breaks
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
                                onClick={() => handleCellClick(day, period.num)}
                            >
                              {slot ? (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-2 rounded-lg border transition-all cursor-pointer min-h-[80px] flex flex-col justify-center ${getSlotColor(slot.type)}`}
                                >
                                  <div className="font-medium text-sm truncate">
                                    {slot.subject}
                                  </div>
                                  {slot.subjectCode && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {slot.subjectCode}
                                    </div>
                                  )}
                                  {slot.facultyName && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
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
                                </motion.div>
                              ) : (
                                <div className="h-full min-h-[80px] rounded-lg border border-dashed border-white/10 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100">
                                    <Plus className="w-4 h-4 text-muted-foreground" />
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

      {/* Subject Summary - Could be calculated from timetable */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
             {/* Dynamic Summary */}
             {Array.from(new Set(currentTimetable.map(t => t.subjectCode))).map((code, index) => {
                 const subjectSlots = currentTimetable.filter(t => t.subjectCode === code);
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
                    <div className="text-xs text-muted-foreground mt-1">{subject.facultyName}</div>
                    <div className="text-xs text-primary mt-2">{subjectSlots.length} hrs/week</div>
                  </motion.div>
                 );
             })}
             {currentTimetable.length === 0 && <div className="text-muted-foreground text-sm col-span-5 text-center">No subjects scheduled</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Timetable Slot</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Day</Label>
                        <Input value={editingSlot.day} disabled className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Label>Period</Label>
                        <Input value={`Period ${editingSlot.period}`} disabled className="bg-white/5 border-white/10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input 
                        value={editingSlot.subject} 
                        onChange={(e) => setEditingSlot({...editingSlot, subject: e.target.value})}
                        className="bg-white/5 border-white/10"
                        placeholder="e.g. Data Structures"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Subject Code</Label>
                        <Input 
                            value={editingSlot.subjectCode} 
                            onChange={(e) => setEditingSlot({...editingSlot, subjectCode: e.target.value})}
                            className="bg-white/5 border-white/10"
                            placeholder="e.g. CS301"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label>Room</Label>
                        <Input 
                            value={editingSlot.room} 
                            onChange={(e) => setEditingSlot({...editingSlot, room: e.target.value})}
                            className="bg-white/5 border-white/10"
                            placeholder="e.g. LH-101"
                        />
                     </div>
                </div>

                <div className="space-y-2">
                    <Label>Faculty</Label>
                    <Select 
                        value={editingSlot.facultyId} 
                        onValueChange={(val) => {
                            const f = facultyList.find(fac => fac.id === val);
                            setEditingSlot({...editingSlot, facultyId: val, facultyName: f?.name || ''});
                        }}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select Faculty" />
                        </SelectTrigger>
                        <SelectContent>
                            {facultyList.map(f => (
                                <SelectItem key={f.id} value={f.id}>{f.name} ({f.department || 'Dept'})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                        value={editingSlot.type} 
                        onValueChange={(val: any) => setEditingSlot({...editingSlot, type: val})}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="theory">Theory</SelectItem>
                            <SelectItem value="lab">Lab</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                            <SelectItem value="free">Free/Break</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          )}
          <DialogFooter>
            {editingSlot?.id && (
                 <Button variant="destructive" onClick={deleteSlot} className="mr-auto">Clear Slot</Button>
            )}
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveSlot} className="bg-primary text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
