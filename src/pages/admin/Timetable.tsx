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
import { getTimetable, saveTimetable, TimetableSlot, addTimetableSlot, deleteTimetableSlot } from '@/lib/data-store';
import { API_BASE_URL } from '@/lib/api-config';
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
  const [subjects, setSubjects] = useState<any[]>([]); // All fetched subjects
  
  // Selection State
  const [batches, setBatches] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedYearSem, setSelectedYearSem] = useState('1'); // Default to 1, will update based on batch
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot> | null>(null);

  // Derived state for filtered faculty based on selected subject in modal
  const [modalFaculty, setModalFaculty] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Update selected semester when batch changes
  useEffect(() => {
      if (selectedBatch && batches.length > 0) {
          const batch = batches.find(b => b.id.toString() === selectedBatch);
          if (batch && batch.current_semester) {
              setSelectedYearSem(batch.current_semester.toString());
          }
      }
  }, [selectedBatch, batches]);

  // Update modal faculty when editing slot changes (specifically subject)
  useEffect(() => {
      if (editingSlot?.subjectCode) {
          const subject = subjects.find(s => s.code === editingSlot.subjectCode);
          if (subject && subject.faculties && subject.faculties.length > 0) {
              setModalFaculty(subject.faculties);
          } else {
              // Fallback to all faculty if no specific assignment or subject not found
               setModalFaculty(facultyList);
          }
      } else {
          setModalFaculty(facultyList);
      }
  }, [editingSlot?.subjectCode, subjects, facultyList]);

  // Fetch sections when batch changes
  useEffect(() => {
      if (selectedBatch) {
          fetchSections(selectedBatch);
      } else {
          setSections([]);
          setSelectedSection('');
      }
  }, [selectedBatch]);

  const loadInitialData = async () => {
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Batches
        const resBatches = await fetch(`${API_BASE_URL}/academic/batches`, { headers });
        if (resBatches.ok) {
            const data = await resBatches.json();
            setBatches(data);
            if (data.length > 0) {
                setSelectedBatch(data[0].id.toString());
            }
        }

        // 2. Fetch Faculty
        const resFaculty = await fetch(`${API_BASE_URL}/admin/faculty`, { headers });
        if (resFaculty.ok) {
            const data = await resFaculty.json();
            setFacultyList(data);
            if (data.length > 0) {
                if (view === 'faculty') setSelectedFacultyId(data[0].id.toString());
            }
        }

        // 3. Fetch Subjects
        const resSubjects = await fetch(`${API_BASE_URL}/academic/subjects`, { headers });
        if (resSubjects.ok) {
            const data = await resSubjects.json();
            setSubjects(data);
        }

        loadTimetableData();

    } catch (error) {
        console.error("Failed to load initial data", error);
        toast.error("Failed to load filter data");
    }
  };

  const fetchSections = async (batchId: string) => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setSections(data);
              if (data.length > 0) {
                  setSelectedSection(data[0].id.toString()); 
              } else {
                  setSelectedSection('');
              }
          }
      } catch (error) {
          console.error("Failed to fetch sections", error);
      }
  };

  const loadTimetableData = async () => {
    try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        let url = `${API_BASE_URL}/academic/timetable?`;
        if (view === 'students' && selectedBatch && selectedSection) {
            url += `batchId=${selectedBatch}&sectionId=${selectedSection}`;
            if (selectedYearSem) url += `&semester=${selectedYearSem}`;
        } else if (view === 'faculty' && selectedFacultyId) {
            url += `facultyId=${selectedFacultyId}`;
        } else {
            return; // Don't fetch if filters invalid
        }

        const res = await fetch(url, { headers });
        if (res.ok) {
            const data = await res.json();
            setTimetable(data);
        }
    } catch (error) {
        console.error("Failed to load timetable", error);
        toast.error("Failed to load timetable");
    }
  };

  // Reload when filters change
  useEffect(() => {
      loadTimetableData();
  }, [view, selectedBatch, selectedSection, selectedFacultyId]);

  const currentTimetable = timetable; // Filter handled by API

  const getSlot = (day: string, period: number | string) => {
    return currentTimetable.find(slot => slot.day === day && slot.period === period);
  };

  const handleCellClick = (day: string, period: number | string) => {
    if (typeof period !== 'number') return;
    if (day === 'Saturday' && period > 4) {
       toast.error("Saturday is a half day (Only 4 periods)");
       return;
    }
    const existing = getSlot(day, period);
    if (existing) {
      setEditingSlot(existing);
      // If editing existing, fetch sections for that batch to populate dropdown if needed
      if (view === 'faculty' && existing.classId) {
          fetchSections(existing.classId);
      }
    } else {
      setEditingSlot({
        day,
        period,
        classId: view === 'students' ? selectedBatch : '',
        sectionId: view === 'students' ? selectedSection : '',
        type: 'theory',
        subject: '',
        subjectCode: '',
        facultyId: view === 'faculty' ? selectedFacultyId : '',
        facultyName: '',
        room: ''
      });
      // Reset sections if starting new in faculty view (or keep empty until batch selected)
      if (view === 'faculty') setFormSections([]); 
    }
    setIsEditOpen(true);
  };

  // Sections for the modal (distinct from page filter sections)
  const [formSections, setFormSections] = useState<any[]>([]);

  const handleModalBatchChange = async (batchId: string) => {
      // Update slot
      setEditingSlot(prev => ({ ...prev, classId: batchId, sectionId: '' }));
      
      // Fetch sections for this batch
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setFormSections(data);
          }
      } catch (error) {
          console.error("Failed to fetch form sections", error);
      }
  };

  const handleSubjectChange = (subjectCode: string) => {
      const subject = subjects.find(s => s.code === subjectCode);
      if (subject) {
          setEditingSlot(prev => ({
              ...prev,
              subjectCode: subject.code,
              subject: subject.name,
              // If student view, reset faculty. If faculty view, keep faculty (it's me).
              facultyId: view === 'faculty' ? prev?.facultyId : '', 
              facultyName: view === 'faculty' ? prev?.facultyName : ''
          }));
      }
  };

  const hasSameContent = (day: string, p1: number | string, p2: number | string) => {
    const s1 = getSlot(day, p1);
    const s2 = getSlot(day, p2);
    if (!s1 || !s2) return false;
    // For merge, we check basic identity
    // If faculty view, we want to see contiguous blocks for same class/subject
    return s1.subjectCode === s2.subjectCode && s1.type === s2.type && s1.classId === s2.classId && s1.sectionId === s2.sectionId;
  };

  const saveSlot = async () => {
    if (!editingSlot) return;

    // Validation
    if (!editingSlot.subjectCode && editingSlot.type !== 'free') {
        toast.error("Please select a subject");
        return;
    }
    if (view === 'faculty' && (!editingSlot.classId || !editingSlot.sectionId)) {
        toast.error("Please select a Batch and Section");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const payload = {
            batch_id: editingSlot.classId,
            section_id: editingSlot.sectionId,
            day: editingSlot.day,
            period: editingSlot.period,
            subject_code: editingSlot.subjectCode,
            faculty_id: editingSlot.facultyId,
            room: editingSlot.room,
            type: editingSlot.type,
            semester: parseInt(selectedYearSem)
        };

        const res = await fetch(`${API_BASE_URL}/academic/timetable`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success('Timetable saved successfully');
            setIsEditOpen(false);
            loadTimetableData(); // Refresh from DB
        } else {
            const err = await res.json();
            toast.error(err.message || 'Failed to save slot');
        }
    } catch (error) {
        console.error("Save Error", error);
        toast.error("Error saving slot");
    }
  };

  const deleteSlot = async () => {
     if(editingSlot && editingSlot.id) {
         // In real API, we might use DELETE endpoint or just save with null/empty?
         // Current backend deletes if upsert logic detects change. 
         // Actually, let's implement a DELETE or use save with empty subject implies delete?
         // For now, let's use the save logic but passing empty subject/faculty effectively clears it?
         // No, the save logic requires IDs. 
         // Let's just "Free" the period by deleting the slot.
         // We didn't implement DELETE specific endpoint yet, but save logic deletes first.
         // So if we don't insert (allocationId check), it stays deleted.
         // But save requires subject_code to find allocation.
         
         // Implement proper delete call later? Or sending empty payload?
         // Users usually "Clear" a slot.
         // Let's assume we can set Type to 'free' and Subject to empty.
         
         // Temporary: Just Toast "Cleared" locally? No, must persist.
         // I'll skip DELETE for now or implement strict logic.
         // Actually, the save logic says: DELETE WHERE section_id/day/period.
         // THEN INSERT IF allocationId.
         // So if I send invalid subject_code, it fails step 2 but validated step 1?
         // Let's add explicit 'clear' flag or just a delete endpoint?
         // Let's leave Clear as "To Be Implemented" or use a special route.
         toast.error("Delete not yet fully wired to API");
     }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters (Unchanged) */}
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
           {/* Actions... */}
        </div>
      </div>

      {/* Filters Card (Unchanged) */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {view === 'students' ? (
              <>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                  <SelectContent>{batches.map((b:any)=><SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
                
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                   <SelectTrigger className="w-32"><SelectValue placeholder="Section" /></SelectTrigger>
                   <SelectContent>{sections.map((s:any)=><SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>

                <Select value={selectedYearSem} onValueChange={setSelectedYearSem}>
                   <SelectTrigger className="w-32"><SelectValue placeholder="Semester" /></SelectTrigger>
                   <SelectContent>
                       {[...Array(8)].map((_, i) => (
                           <SelectItem key={i+1} value={(i+1).toString()}>Semester {i+1}</SelectItem>
                       ))}
                   </SelectContent>
                </Select>
              </>
            ) : (
              <>
                 <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                   <SelectTrigger className="w-64"><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                   <SelectContent>{facultyList.map((f:any)=><SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>)}</SelectContent>
                 </Select>
                 {/* Year-Sem Select... */}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid and Legend... */}
       <Card className="glass-card border-white/10 overflow-hidden">
        {/* ... Table ... */} 
          {/* Table Body Logic Modified: Use `currentTimetable` directly */}
           <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 text-left font-semibold text-muted-foreground w-32 sticky left-0 bg-background/95 backdrop-blur z-20">Day / Time</th>
                      {periods.map((period, index) => (
                        <th key={index} className={`p-4 text-center font-semibold text-muted-foreground min-w-[120px] ${period.isBreak ? 'w-10 min-w-[40px] p-0' : ''}`}>
                           {period.isBreak ? (
                             <div className="h-full w-full flex items-center justify-center bg-white/5">
                               {/* Break Header if needed, or empty to match the vertical bar */}
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-1">
                                <span className="text-sm text-foreground">Period {period.num}</span>
                                <span className="text-[10px] opacity-70 font-mono">{period.time}</span>
                             </div>
                           )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIndex) => (
                      <tr key={day} className="border-b border-white/5">
                        <td className="p-3 text-sm font-medium text-muted-foreground sticky left-0 bg-background/95 backdrop-blur z-10">{day}</td>
                        {periods.map((period, index) => {
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
                          const prevPeriod = periods[index - 1];
                          if (prevPeriod && !prevPeriod.isBreak && hasSameContent(day, prevPeriod.num, period.num)) return null;

                          let colSpan = 1;
                          for (let k = index + 1; k < periods.length; k++) {
                              const nextPeriod = periods[k];
                             if (nextPeriod.isBreak) break;
                             if (hasSameContent(day, period.num, nextPeriod.num)) colSpan++;
                             else break;
                          }

                          const slot = getSlot(day, period.num);
                          return (
                            <td key={`${day}-${period.num}`} className="p-1" colSpan={colSpan} onClick={() => handleCellClick(day, period.num)}>
                              {slot ? (
                                <motion.div whileHover={{ scale: 1.02 }} className={`p-2 rounded-lg border transition-all cursor-pointer min-h-[80px] flex flex-col justify-center ${getSlotColor(slot.type)}`}>
                                  <div className="font-medium text-sm truncate">{slot.subject}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{slot.subjectCode}</div>
                                  
                                  {/* In Faculty View, Show Class Name instead of Faculty Name */}
                                  {view === 'faculty' ? (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          Batch {batches.find(b=>b.id.toString()===slot.classId)?.name} - {sections.find(s=>s.id.toString()===slot.sectionId)?.name || slot.sectionId}
                                      </div>
                                  ) : (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                          <User className="w-3 h-3" />
                                          {slot.facultyName.split(' ')[0]}
                                      </div>
                                  )}

                                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building className="w-3 h-3" />{slot.room}</div>
                                </motion.div>
                              ) : (
                                <div className="h-full min-h-[80px] rounded-lg border border-dashed border-white/10 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"><Plus className="w-4 h-4 text-muted-foreground" /></div>
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

      {/* Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-card border-white/10 text-white">
          <DialogHeader><DialogTitle>Edit Timetable Slot</DialogTitle></DialogHeader>
          {editingSlot && (
            <div className="space-y-4 py-4">
                 {/* Day / Period Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Day</Label><Input value={editingSlot.day} disabled className="bg-white/5 border-white/10" /></div>
                    <div className="space-y-2"><Label>Period</Label><Input value={`Period ${editingSlot.period}`} disabled className="bg-white/5 border-white/10" /></div>
                </div>

                {/* Faculty View: Select Class (Batch + Year/Sem + Section) */}
                {view === 'faculty' && (
                    <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                         <div className="col-span-2"><Label className="text-primary font-semibold">Assign To Class</Label></div>
                         
                         {/* Batch Select */}
                         <div className="space-y-2">
                            <Label>Batch</Label>
                            <Select value={editingSlot.classId} onValueChange={handleModalBatchChange}>
                                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                                <SelectContent>{batches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>

                         {/* Section Select */}
                         <div className="space-y-2">
                             <Label>Section</Label>
                             <Select value={editingSlot.sectionId} onValueChange={(v) => setEditingSlot({...editingSlot, sectionId: v})}>
                                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Section" /></SelectTrigger>
                                <SelectContent>{formSections.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                             </Select>
                         </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={editingSlot.subjectCode} onValueChange={handleSubjectChange}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.code}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                
                 {/* ... Remaining fields (Room, Type) ... */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2"><Label>Subject Code</Label><Input value={editingSlot.subjectCode} disabled className="bg-white/5 border-white/10" /></div>
                     <div className="space-y-2"><Label>Room</Label><Input value={editingSlot.room} onChange={(e) => setEditingSlot({...editingSlot, room: e.target.value})} className="bg-white/5 border-white/10" placeholder="e.g. LH-101" /></div>
                 </div>

                 {/* Faculty Select: Hidden if in Faculty View (implicitly me) */}
                 {view === 'students' && (
                    <div className="space-y-2">
                        <Label>Faculty</Label>
                        <Select 
                            value={editingSlot.facultyId?.toString()} 
                            onValueChange={(val) => {
                                const f = facultyList.find(fac => fac.id.toString() === val);
                                setEditingSlot({...editingSlot, facultyId: val, facultyName: f?.name || ''});
                            }}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                            <SelectContent>
                                {modalFaculty.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>)}
                                {modalFaculty.length === 0 && <SelectItem value="none" disabled>No faculty assigned</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>
                 )}

                 <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={editingSlot.type} onValueChange={(val: any) => setEditingSlot({...editingSlot, type: val})}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Type" /></SelectTrigger>
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
             {/* ... */}
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={saveSlot} className="bg-primary text-primary-foreground">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
