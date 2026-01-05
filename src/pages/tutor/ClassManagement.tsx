import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlassStatCard } from '@/components/dashboard/StatCards';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { getTutors, getStudents, Tutor, Student } from '@/lib/data-store';

export default function ClassManagement() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    avgAttendance: 0,
    avgCGPA: 0,
    certifications: 0
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchClassData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/tutors/class`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.hasAssignment) {
                    setTutor({
                        id: user.id || '',
                        name: user.name || '',
                        batch: data.batch,
                        section: data.section || 'A', // Fallback
                        // mock other fields if needed or allow Partial
                    } as any);

                    setStudents(data.students || []);
                    setFilteredStudents(data.students || []);

                    // Calc stats
                    const myStudents = data.students || [];
                    if (myStudents.length > 0) {
                        const totalAttendance = myStudents.reduce((sum: number, s: any) => sum + (s.attendance || 0), 0);
                        const totalCGPA = myStudents.reduce((sum: number, s: any) => sum + (s.cgpa || 0), 0);
                        const totalCerts = myStudents.reduce((sum: number, s: any) => sum + (s.certifications || 0), 0);
                        setStats({
                            avgAttendance: Math.round(totalAttendance / myStudents.length),
                            avgCGPA: Number((totalCGPA / myStudents.length).toFixed(2)),
                            certifications: totalCerts
                        });
                    }
                } else {
                    console.log("No class assigned to this tutor");
                    // Could show empty state UI
                }
            }
        } catch (e) {
            console.error("Error fetching tutor class", e);
        }
    };

    fetchClassData();
  }, [user]);

  useEffect(() => {
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Class Management 📋</h1>
          <p className="text-muted-foreground font-medium">{tutor?.section} Section • {tutor?.batch} Batch • {students.length} Students</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic">
            <Download className="w-4 h-4 mr-2 text-primary" />
            Export List
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic">
            <Users className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassStatCard
          title="Avg Attendance"
          value={`${stats.avgAttendance}%`}
          subtitle="Class Average"
          icon={Calendar}
          iconColor="text-primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Average CGPA"
          value={stats.avgCGPA.toString()}
          subtitle="Class Performance"
          icon={TrendingUp}
          iconColor="text-success"
          delay={0.2}
        />
        <GlassStatCard
          title="Certifications"
          value={stats.certifications.toString()}
          subtitle="Total this semester"
          icon={Award}
          iconColor="text-accent"
          delay={0.3}
        />
      </div>

      <div className="glass-card rounded-3xl p-8 border-none shadow-2xl bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
                className="pl-12 bg-white/5 border-white/10 rounded-xl font-medium" 
                placeholder="Search students by name or roll no..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest italic">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest italic">Sort By</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem className="font-bold">Name</DropdownMenuItem>
                <DropdownMenuItem className="font-bold">Roll Number</DropdownMenuItem>
                <DropdownMenuItem className="font-bold">Attendance</DropdownMenuItem>
                <DropdownMenuItem className="font-bold">CGPA</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground pl-4">Student</th>
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Roll No</th>
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Attendance</th>
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">CGPA</th>
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="pb-6 font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group hover:bg-white/[0.02] transition-all"
                >
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-lg shadow-primary/10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black italic text-sm group-hover:text-primary transition-colors">{student.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{student.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-xs font-black font-code text-white/70 tracking-widest">{student.rollNumber}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${student.attendance}%` }}
                          className={`h-full rounded-full shadow-glow ${student.attendance < 75 ? 'bg-destructive shadow-destructive/50' : 'bg-primary shadow-primary/50'}`}
                        />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${student.attendance < 75 ? 'text-destructive' : 'text-primary'}`}>
                        {student.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <Badge variant="outline" className="font-black italic text-sm border-white/10 group-hover:border-primary/50 transition-colors">
                        {student.cgpa}
                    </Badge>
                  </td>
                  <td className="py-5">
                    <Badge variant={student.attendance < 75 ? 'destructive' : 'secondary'} className="rounded-lg font-black text-[9px] uppercase tracking-widest px-3 border-none shadow-lg">
                      {student.attendance < 75 ? 'Alert' : 'Active'}
                    </Badge>
                  </td>
                  <td className="py-5 text-right pr-4">
                    <div className="flex items-center justify-end gap-2 opacity-20 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-primary hover:bg-primary/10">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl text-info hover:bg-info/10">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                          <DropdownMenuItem className="font-bold">View Profile</DropdownMenuItem>
                          <DropdownMenuItem className="font-bold">Academic History</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive font-bold">Send Alert</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
              <div className="text-center py-20 opacity-50 italic font-medium">
                  No students found matching your search.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

