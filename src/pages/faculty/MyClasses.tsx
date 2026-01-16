import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Clock, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';

interface ClassSection {
  id: string;
  subject: string;
  code: string;
  section: string;
  batch: string;
  students: number;
  attendance: number;
  progress: number;
  nextClass: string;
  room: string;
}

interface SyllabusItem {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  syllabus_id: number | null;
  file_url: string | null;
  original_filename: string | null;
  status: 'Uploaded' | 'Pending';
}

export default function MyClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgAttendance: 0
  });
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Syllabus State
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  useEffect(() => {
    if (user && (user.role === 'faculty' || user.role === 'tutor')) {
      loadFacultyClasses();
    }
  }, [user]);

  useEffect(() => {
    if (syllabusOpen) {
      loadSyllabus();
    }
  }, [syllabusOpen]);

  const loadFacultyClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/class-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
          const formattedClasses: ClassSection[] = data.map((stat: any) => ({
            id: String(stat.allocation_id),
            subject: stat.subject_name || 'N/A',
            code: stat.subject_code || 'N/A',
            section: stat.section_name || 'N/A',
            batch: stat.batch_name || 'N/A',
            students: stat.student_count || 0,
            attendance: stat.attendance_rate || 0,
            progress: stat.progress || 0,
            nextClass: stat.next_class || 'No upcoming class',
            room: stat.room_number || 'TBA'
          }));

          setClasses(formattedClasses);

          // Calculate stats
          const totalStudents = formattedClasses.reduce((acc, curr) => acc + curr.students, 0);
          const avgAttendance = formattedClasses.length > 0 
            ? formattedClasses.reduce((acc, curr) => acc + curr.attendance, 0) / formattedClasses.length 
            : 0;

          setStats({
            totalCourses: formattedClasses.length,
            totalStudents,
            avgAttendance: Number(avgAttendance.toFixed(1))
          });
        } else {
          setClasses([]);
          setStats({ totalCourses: 0, totalStudents: 0, avgAttendance: 0 });
        }
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
      setStats({ totalCourses: 0, totalStudents: 0, avgAttendance: 0 });
    }
  };

  const loadSyllabus = async () => {
    setLoadingSyllabus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/syllabus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSyllabusList(data);
      }
    } catch (error) {
      console.error('Error loading syllabus:', error);
      toast.error('Failed to load syllabus list');
    } finally {
      setLoadingSyllabus(false);
    }
  };

  const handleUploadClick = (subjectId: number) => {
    setSelectedSubjectId(subjectId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSubjectId) return;

    if (file.size > 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', String(selectedSubjectId));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/syllabus/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success('Syllabus uploaded successfully');
        loadSyllabus(); // Refresh list
      } else {
        const error = await res.json();
        toast.error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      toast.error('Error uploading syllabus');
    } finally {
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSelectedSubjectId(null);
    }
  };

  const handleDeleteSyllabus = async (syllabusId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/syllabus/${syllabusId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Syllabus deleted successfully');
        loadSyllabus();
      } else {
        toast.error('Failed to delete syllabus');
      }
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      toast.error('Error deleting syllabus');
    }
  };

  const handleViewSyllabus = (fileUrl: string) => {
    window.open(`${API_BASE_URL}${fileUrl}`, '_blank');
  };

  const handleViewStudents = async (classSection: ClassSection) => {
    setSelectedClass(classSection);
    setLoadingStudents(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/faculty-students/${classSection.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to load students');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  if (!user || (user.role !== 'faculty' && user.role !== 'tutor')) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p>This dashboard is only for Faculty members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subjects 📚</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}. Monitor course progress and student engagement.</p>
        </div>
        <div className="flex gap-3">
           <Button 
            variant="outline" 
            className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary"
            onClick={() => setSyllabusOpen(true)}
           >
            <FileText className="w-4 h-4 mr-2" />
            Course Syllabus
           </Button>
           {/* Bulk Attendance Button Removed */}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-glow shadow-primary/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase">Total Courses</p>
              <h3 className="text-2xl font-black">{stats.totalCourses} Active</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Including lab sessions</p>
        </Card>

        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-accent/10 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-glow shadow-accent/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase">Total Students</p>
              <h3 className="text-2xl font-black">{stats.totalStudents} Enrolled</h3>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Across all sections</p>
        </Card>

        <Card className="glass-card p-6 border-none shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-glow shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase">Avg Attendance</p>
              <h3 className="text-2xl font-black">{stats.avgAttendance}%</h3>
            </div>
          </div>
          <p className="text-xs text-emerald-500 font-bold">Good engagement level</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {classes.length > 0 ? (
          classes.map((cls, idx) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card border-none hover:shadow-2xl transition-all group overflow-hidden">
                 <div className="flex flex-col lg:flex-row items-stretch">
                    <div className="lg:w-72 p-8 bg-muted/30 flex flex-col justify-center border-r border-white/5">
                       <Badge className="w-fit mb-3 bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest">{cls.code}</Badge>
                       <h3 className="text-xl font-black leading-tight mb-2 group-hover:text-primary transition-colors">{cls.subject}</h3>
                       <p className="text-sm font-bold text-muted-foreground">{cls.batch} - Section {cls.section}</p>
                    </div>
                    
                    <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-muted-foreground uppercase tracking-wider">
                             <span>Syllabus Progress</span>
                             <span className="text-primary">{cls.progress}%</span>
                          </div>
                          <Progress value={cls.progress} className="h-2 rounded-full bg-primary/10" />
                       </div>
  
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                             <Users className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase">Strength</p>
                             <p className="text-sm font-bold">{cls.students} Enrolled</p>
                          </div>
                       </div>
  
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase">Next Class</p>
                             <p className="text-sm font-bold text-accent">{cls.nextClass}</p>
                          </div>
                       </div>
  
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                             <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase">Location</p>
                             <p className="text-sm font-bold uppercase tracking-wider">{cls.room}</p>
                          </div>
                       </div>
                    </div>
  
                     <div className="p-4 flex flex-row lg:flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l border-white/5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleViewStudents(cls)}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          View Students
                        </Button>
                     </div>
                 </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/10 rounded-3xl">
            <p className="text-muted-foreground italic">No classes found. Please contact the administrator to have subjects assigned to you.</p>
          </div>
        )}
      </div>

      {/* Analytics Insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl bg-secondary/5 border border-secondary/20 p-8 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
           <Award className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Academic Spotlight</h3>
           <p className="text-sm text-muted-foreground font-medium">Keep up the great work! Your timely syllabus completion is helping students prepare better for upcoming assessments.</p>
        </div>
        <div className="flex items-center gap-2 text-secondary font-black text-sm group cursor-pointer">
           View Full Analytics <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </motion.div>

      {/* Student List Modal */}
      <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClass?.subject} ({selectedClass?.code}) - {selectedClass?.section}
            </DialogTitle>
          </DialogHeader>
          
          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading students...</div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students enrolled in this section
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {students.map((student, index) => (
                <Card key={student.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{student.name}</h4>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>Reg No: {student.register_number}</span>
                          <span>•</span>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                      <Badge variant={student.attendance_percentage >= 75 ? 'default' : 'destructive'}>
                        {student.attendance_percentage}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Syllabus Management Modal */}
      <Dialog open={syllabusOpen} onOpenChange={setSyllabusOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Course Syllabus Management
            </DialogTitle>
          </DialogHeader>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          {loadingSyllabus ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : syllabusList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No subjects assigned to you.
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-xs font-bold uppercase text-muted-foreground">
                <div className="col-span-4">Subject Info</div>
                <div className="col-span-2">Semester</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {syllabusList.map((item) => (
                <div key={item.subject_id} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-xl hover:bg-muted/20 transition-colors">
                  <div className="col-span-4">
                    <h4 className="font-bold text-sm">{item.subject_name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{item.subject_code}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary" className="font-mono">Sem {item.semester}</Badge>
                  </div>
                  <div className="col-span-3">
                    <Badge className={item.status === 'Uploaded' ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25' : 'bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    {item.status === 'Pending' ? (
                      <Button size="sm" onClick={() => handleUploadClick(item.subject_id)}>
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => item.file_url && handleViewSyllabus(item.file_url)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Syllabus
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUploadClick(item.subject_id)}>
                              <UploadCloud className="w-4 h-4 mr-2" />
                              Re-upload
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => item.syllabus_id && handleDeleteSyllabus(item.syllabus_id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
