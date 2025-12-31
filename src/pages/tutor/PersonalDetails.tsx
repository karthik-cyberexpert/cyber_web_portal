import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Award, 
  BookOpen,
  Edit2,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { getTutors, getFaculty, Tutor, Faculty } from '@/lib/data-store';

export default function PersonalDetails() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [faculty, setFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Tutors are Faculty, so we use the same Profile API
    const fetchProfile = async () => {
         try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                setTutor({
                    id: user.id || '',
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    avatar: data.avatar,
                    designation: 'Class In-charge', // Specific to Tutor View
                    status: data.status,
                    batch: 'View Class', // Or fetch from /tutor/class
                    section: 'View Class',
                    facultyId: data.id
                } as any);

                setFaculty({
                    ...data,
                    designation: data.designation || 'Assistant Professor', 
                    employeeId: data.employeeId || `FAC-${data.id}`,
                });
            }
         } catch (e) {
             console.error("Error fetching profile", e);
         }
    };
    fetchProfile();
  }, [user]);

  if (!tutor) {
      return (
          <div className="flex items-center justify-center h-[50vh] opacity-50 italic">
              Loading tutor profile...
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Personal Profile 👤</h1>
          <p className="text-muted-foreground font-medium">Manage your department profile and professional details</p>
        </div>
        <Button variant="gradient" className="shadow-lg shadow-primary/20 rounded-xl font-black uppercase text-[10px] tracking-widest italic px-6">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card overflow-hidden border-none shadow-2xl rounded-3xl">
            <div className="h-32 bg-gradient-to-br from-primary via-accent to-secondary relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="p-1.5 bg-background rounded-full shadow-2xl">
                  <Avatar className="w-24 h-24 border-4 border-background">
                    <AvatarImage src={tutor.avatar} />
                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            <div className="pt-16 pb-8 px-8 text-center">
              <h2 className="text-2xl font-black italic tracking-tight">{tutor.name}</h2>
              <p className="text-primary font-black uppercase text-[10px] tracking-widest mt-2">{tutor.designation}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest">
                  {faculty?.employeeId || 'STF-TBC'}
                </Badge>
                <Badge variant="secondary" className="bg-success/10 text-success border-none font-black text-[9px] uppercase tracking-widest">
                  {tutor.status}
                </Badge>
              </div>
              <div className="space-y-4 text-left border-t border-white/5 pt-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
                    <p className="text-sm font-bold">{tutor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Phone className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Contact</p>
                    <p className="text-sm font-bold">{tutor.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                    <MapPin className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Office Location</p>
                    <p className="text-sm font-bold italic">{faculty?.office || 'Main Block'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass-card p-8 border-none shadow-2xl rounded-3xl bg-white/[0.02]">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic uppercase tracking-tight">
              <Building2 className="w-6 h-6 text-primary" />
              Professional Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Department</p>
                <p className="font-bold italic">{faculty?.department || 'Information Technology'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Joining Date</p>
                <p className="font-bold italic">{faculty?.dateOfJoining || 'June 2018'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Specialization</p>
                <p className="font-bold italic">{faculty?.specialization || 'AI & Machine Learning'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">In-Charge Details</p>
                <p className="font-bold italic text-primary">Batch {tutor.batch} Section {tutor.section}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-8 border-none shadow-2xl rounded-3xl bg-white/[0.02]">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 italic uppercase tracking-tight text-accent">
              <GraduationCap className="w-6 h-6" />
              Academic Background
            </h3>
            <div className="space-y-8">
              {(faculty?.education || [
                  { degree: 'Ph.D in CS', institution: 'Anna University', year: '2014' },
                  { degree: 'M.Tech in Cyber Security', institution: 'NIT Trichy', year: '2008' }
              ]).map((edu, index) => (
                <div key={index} className="flex gap-6 relative group">
                  {index !== (faculty?.education || []).length - 1 && (
                    <div className="absolute left-3 top-10 bottom-0 w-[1px] bg-white/5" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center z-10 flex-shrink-0 mt-1 border border-accent/30 group-hover:scale-125 transition-transform">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <p className="font-black text-lg italic leading-none">{edu.degree}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-2">{edu.institution} • Class of {edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-8 border-none shadow-2xl rounded-3xl bg-white/[0.02]">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 italic uppercase tracking-tight text-secondary">
              <BookOpen className="w-6 h-6" />
              Digital Footprint
            </h3>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Address</p>
              <p className="text-sm font-bold italic leading-relaxed">{faculty?.address || '42, Garden Street, Chennai - 600025'}</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

