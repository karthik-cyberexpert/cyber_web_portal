import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Clock, 
  Layout, 
  ShieldCheck,
  TrendingUp,
  History,
  FileBadge,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { GlassStatCard } from '@/components/dashboard/StatCards';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function AcademicDetails() {
  const { user } = useAuth();
  const [academicData, setAcademicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'student') {
        const fetchAcademicDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/academic-details`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Academic details loaded:', data);
                    setAcademicData(data);
                } else {
                    console.error('Failed to load academic details');
                }
            } catch (err) {
                console.error("Error loading academic details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAcademicDetails();
    }
  }, [user]);

  if (loading || !academicData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
          {loading ? 'Loading academic records...' : 'No academic data available'}
        </p>
      </div>
    );
  }

  const student = academicData.studentInfo;
  const totalCredits = academicData.totalCredits || 0;

  return (
    <div className="space-y-6 text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold italic">Academic Details 🎓</h1>
        <p className="text-muted-foreground font-medium">Detailed track record of your academic journey and achievements</p>
      </motion.div>

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatCard
          title="Current CGPA"
          value={Number(academicData.cgpa || 0).toFixed(2)}
          icon={TrendingUp}
          iconColor="primary"
          delay={0.1}
        />
        <GlassStatCard
          title="Total Credits"
          value={totalCredits.toString()}
          icon={Award}
          iconColor="blue"
          delay={0.2}
        />
        <GlassStatCard
          title="Backlogs"
          value={(academicData.backlogs || 0).toString().padStart(2, '0')}
          icon={ShieldCheck}
          iconColor="green"
          delay={0.3}
        />
        <GlassStatCard
          title="Semesters"
          value={`${(academicData.semesters?.length || 0).toString().padStart(2, '0')}/08`}
          icon={History}
          iconColor="orange"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Programme</p>
              <p className="text-sm font-bold italic">{student.program || 'B.Tech'}</p>
            </div>
          </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 italic">Academic Identity</h3>
              {[
                { label: "Current Status", value: student.currentStatus || 'Active', icon: ShieldCheck, color: "text-success" },
                { label: "Batch", value: student.batch || 'N/A', icon: Clock },
                { label: "Curriculum Year", value: `Year ${student.year || 2}`, icon: Calendar },
                { label: "Section", value: `Section ${student.section || 'A'}`, icon: User },
                { label: "Department", value: student.department || 'CSE', icon: Layout },
                { label: "Register Number", value: student.registerNumber || 'N/A', icon: FileBadge },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-white/5 group">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <item.icon className={cn("w-4 h-4 text-muted-foreground", item.color)} />
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none">{item.label}</p>
                    <p className="text-xs font-bold mt-1 italic">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
        </motion.div>

        {/* Semester History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1 italic">
            <span>Semester Breakdown</span>
            <span>Performance Velocity</span>
          </div>
          
          <div className="space-y-3">
            {academicData.semesters && academicData.semesters.length > 0 ? (
              academicData.semesters.map((s: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="group flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 border border-white/5 hover:border-primary/20 transition-all cursor-default"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-lg ${
                    s.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning animate-pulse"
                  }`}>
                    S{s.sem || idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black italic">Semester {s.sem || idx + 1}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.credits} Credits • {s.status || 'Completed'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-primary font-mono tracking-tighter">{s.gpa > 0 ? s.gpa.toFixed(2) : '--'}</p>
                  <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">GPA Score</p>
                </div>
              </motion.div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No semester data available yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
