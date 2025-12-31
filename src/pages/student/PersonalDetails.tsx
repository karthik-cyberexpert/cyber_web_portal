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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { getStudents, Student } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';
import { calculateCurrentAcademicState } from '@/lib/academic-calendar';

export default function PersonalDetails() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const academicState = student?.batch ? calculateCurrentAcademicState(student.batch) : { year: 1, semester: 1 };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/students/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        setFormData({
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          gender: data.gender || 'male',
          bloodGroup: data.bloodGroup || '',
          guardianName: data.guardianName || '',
          guardianPhone: data.guardianPhone || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
        });
      }
    } catch (err) {
      console.error("Error loading profile", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/students/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Registry updated successfully!");
        setIsEditing(false);
        fetchProfile();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Error updating profile", err);
      toast.error("Fixed some errors and try again");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-left animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Accessing Identity Matrix...</p>
      </div>
    );
  }

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
        { label: "LinkedIn Profile", value: student.linkedinUrl || "Not added", icon: Globe, color: "text-primary" },
        { label: "GitHub Profile", value: student.githubUrl || "Not added", icon: Globe, color: "text-foreground" },
        { label: "Portfolio URL", value: student.portfolioUrl || "Not added", icon: Sparkles, color: "text-accent" },
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
        <Button 
          variant="gradient" 
          onClick={() => setIsEditing(true)}
          className="shadow-lg shadow-primary/20 hover:scale-105 transition-all h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
        >
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
            <h2 className="text-2xl font-black tracking-tight italic">{student.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 slashed-zero">
                {student.class} • Year {academicState.year} • Sem {academicState.semester}
            </p>
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl glass-card border-white/10 rounded-[2rem] overflow-hidden p-0 gap-0">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black italic tracking-tight">Edit Identity Registry</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Update your biological and demographic information. Core identity details verified by blockchain are read-only.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile}>
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Contact Connectivity</h4>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest">Phone Number</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest">Residential Address</Label>
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                    />
                  </div>
                </div>

                {/* Demographics */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent italic">Demographic Data</h4>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(v) => setFormData({...formData, gender: v})}
                      >
                        <SelectTrigger className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10 rounded-xl">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Blood Group</Label>
                      <Input 
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                        placeholder="e.g. O+"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Network */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Support Network</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Guardian Name</Label>
                      <Input 
                        value={formData.guardianName}
                        onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Guardian Phone</Label>
                      <Input 
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Links */}
                <div className="md:col-span-2 space-y-4 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent italic">Professional Footprint</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">LinkedIn URL</Label>
                      <Input 
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">GitHub URL</Label>
                      <Input 
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                        placeholder="github.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest">Portfolio URL</Label>
                      <Input 
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                        className="bg-muted/50 border-white/5 rounded-xl h-11 font-bold italic"
                        placeholder="yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 pt-0 gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
                className="rounded-xl font-bold italic"
              >
                Discard Changes
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                disabled={isSaving}
                className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8 shadow-glow-sm"
              >
                {isSaving && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                Commit Updates
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
