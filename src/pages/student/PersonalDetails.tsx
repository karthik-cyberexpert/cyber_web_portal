import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  IdCard, 
  Globe,
  Camera,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Heart,
  Droplets,
  Link,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getStudents, Student } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function PersonalDetails() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (user && user.role === 'student') {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3007/api/students/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStudent(data);
                } else {
                    console.error("Failed to load profile");
                }
            } catch (err) {
                console.error("Error loading profile", err);
            }
        };
        fetchProfile();
    }
  }, [user]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-left">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Awaiting profile data...</p>
      </div>
    );
  }

  const infoGroups = [
    {
      title: "Identity & Core",
      items: [
        { label: "Full Name", value: student.name, icon: User },
        { label: "Student ID", value: student.rollNumber, icon: IdCard },
        { label: "Email Address", value: student.email, icon: Mail },
        { label: "Phone Number", value: student.phone, icon: Phone },
      ]
    },
    {
      title: "Biological & Demographics",
      items: [
        { label: "Date of Birth", value: student.dateOfBirth, icon: Calendar },
        { label: "Gender", value: student.gender, icon: User },
        { label: "Blood Group", value: student.bloodGroup, icon: Droplets },
        { label: "Nationality", value: student.nationality, icon: Globe },
        { label: "Residential Address", value: student.address, icon: MapPin },
      ]
    },
    {
      title: "Support Network",
      items: [
        { label: "Guardian Name", value: student.guardianName, icon: User },
        { label: "Guardian Contact", value: student.guardianPhone, icon: Phone },
        { label: "Support Status", value: "Verified contact", icon: ShieldCheck, color: "text-success" },
      ]
    },
    {
      title: "Professional Footprint",
      items: [
        { label: "LinkedIn Profile", value: student.linkedin || "Not added", icon: Link },
        { label: "GitHub Profile", value: student.github || "Not added", icon: Globe },
        { label: "Portfolio URL", value: "portfolio.edu/student", icon: Sparkles },
      ]
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold italic">Identity Matrix 🧬</h1>
          <p className="text-muted-foreground font-medium">Manage your personal information and verified credentials</p>
        </div>
        <Button variant="gradient" className="shadow-lg shadow-primary/20 hover:scale-105 transition-all h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest">
          <Sparkles className="w-4 h-4 mr-2" />
          Edit Registry
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-card rounded-3xl p-8 flex flex-col items-center text-center space-y-6 border-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-6 right-6">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-black text-[9px] uppercase tracking-widest px-3 py-1">
              {student.status.toUpperCase()}
            </Badge>
          </div>
          
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center p-1 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
              <img 
                src={student.avatar} 
                alt={student.name} 
                className="w-full h-full rounded-[2.2rem] object-cover" 
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:scale-110 transition-transform active:scale-95 group-hover:rotate-6 border-2 border-background">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-black tracking-tight italic">{student.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 slashed-zero">{student.class} • Year {student.year}</p>
          </div>

          <div className="w-full space-y-3 px-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
              <span className="text-muted-foreground">Digital Trust Score</span>
              <span className="text-primary">94%</span>
            </div>
            <Progress value={94} className="h-2 rounded-full shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full pt-4">
            <div className="bg-muted/30 p-4 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
              <p className="text-xl font-black text-primary font-mono leading-none slashed-zero">{Number(student.cgpa || 0).toFixed(2)}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase mt-2 tracking-widest">Global GPA</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all">
              <p className="text-xl font-black text-accent font-mono leading-none slashed-zero">{student.attendance}%</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase mt-2 tracking-widest">Attendance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-success bg-success/10 px-5 py-3 rounded-2xl border border-success/20 w-full justify-center tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Blockchain Verified Profile
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="lg:col-span-2 space-y-6">
          {infoGroups.map((group, gIdx) => (
            <motion.div
              key={gIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * gIdx }}
              className="glass-card rounded-3xl p-8 shadow-xl border-white/5"
            >
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 italic">
                <div className="w-2 h-2 bg-primary rounded-full shadow-glow-sm" />
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="group flex flex-col items-start text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner border border-white/5">
                        <item.icon className={cn("w-5 h-5", item.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground mb-1 font-black uppercase tracking-widest leading-none">{item.label}</p>
                        <p className="text-sm font-bold italic truncate group-hover:text-primary transition-colors">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
