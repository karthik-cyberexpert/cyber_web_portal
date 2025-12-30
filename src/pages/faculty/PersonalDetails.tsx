import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  GraduationCap,
  Edit2,
  BookOpen,
  Briefcase,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getFaculty, Faculty } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';

export default function PersonalDetails() {
  const { user } = useAuth();
  const [faculty, setFaculty] = React.useState<Faculty | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    phone: '',
    address: '',
    qualification: '',
    specialization: '',
    office: ''
  });

  React.useEffect(() => {
    if (user && user.role === 'faculty') {
        const fetchProfile = async () => {
             try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    const profileData = {
                        ...data,
                        designation: data.designation || 'Assistant Professor', 
                        employeeId: data.employeeId || `FAC-${data.id}`,
                    };
                    
                    setFaculty(profileData);
                    
                    // Initialize form data with current values
                    setFormData({
                        phone: data.phone || '',
                        address: data.address || '',
                        qualification: data.qualification || '',
                        specialization: data.specialization || '',
                        office: data.office || ''
                    });
                }
             } catch (e) {
                 console.error("Error fetching profile", e);
             }
        };
        fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/faculty/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedData = await res.json();
        setFaculty({
          ...faculty!,
          ...updatedData
        });
        setIsEditDialogOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (e) {
      console.error('Error updating profile:', e);
      toast.error('An error occurred while updating profile');
    }
  };

  if (!faculty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <GraduationCap className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing faculty records...</p>
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
          <h1 className="text-3xl font-bold italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Faculty Profile</h1>
          <p className="text-muted-foreground mt-1">Professional information & academic credentials</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl border-primary/20 hover:bg-primary/5 transition-all"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Update Details
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card shadow-2xl border-none overflow-hidden group">
            <div className="h-40 bg-gradient-to-br from-primary/80 via-accent/80 to-secondary/80 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="p-2 bg-background/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/20">
                  <Avatar className="w-24 h-24 border-4 border-transparent shadow-glow shadow-primary/30">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-2xl font-black bg-primary text-white">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-8 px-8 text-center">
              <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
              <p className="text-primary font-bold uppercase text-xs tracking-widest mt-1 mb-6">
                {faculty.designation}
              </p>
              
              <div className="flex justify-center gap-3 mb-8">
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase font-black tracking-widest text-[10px] px-3">
                  {faculty.employeeId}
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500 uppercase font-black tracking-widest text-[10px] px-3">
                  {faculty.status}
                </Badge>
              </div>

              <div className="space-y-4 text-left p-4 rounded-2xl bg-muted/30 border border-white/5">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold truncate">{faculty.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover/item:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Contact Number</p>
                    <p className="text-sm font-bold">{faculty.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover/item:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Work Location</p>
                    <p className="text-sm font-bold">{faculty.office}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card p-8 border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Professional Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Primary Specialization</p>
                    <p className="text-base font-bold text-foreground">{faculty.specialization}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Experience</p>
                    <p className="text-base font-bold text-foreground">{faculty.experience} Years Academic Experience</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Date of Joining</p>
                    <p className="text-base font-bold text-foreground">{faculty.dateOfJoining}</p>
                  </div>
                  <div className="space-y-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Status</p>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <ShieldCheck className="w-5 h-5" />
                      {faculty.status} Faculty
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card p-8 border-none shadow-xl h-full">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-accent" />
                  Academic Qualifications
                </h3>
                <div className="space-y-4">
                  {faculty.education.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-white/5 hover:border-accent/30 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 group-hover:scale-110 transition-transform">
                          {idx === 0 ? <ShieldCheck className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-black leading-tight mb-1">{edu.degree}</p>
                          <p className="text-xs text-muted-foreground font-medium mb-2">{edu.institution}</p>
                          <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">Class of {edu.year}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card p-8 border-none shadow-xl h-full flex flex-col">
                <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-secondary" />
                  Registered Address
                </h3>
                <div className="flex items-start gap-6 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-relaxed">{faculty.address}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Update Profile Details</DialogTitle>
            <DialogDescription>
              Make changes to your profile information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="font-bold uppercase text-xs tracking-wider">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="qualification" className="font-bold uppercase text-xs tracking-wider">
                Qualification
              </Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="Ph.D, M.Tech, etc."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="specialization" className="font-bold uppercase text-xs tracking-wider">
                Specialization
              </Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Machine Learning, Data Science, etc."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="office" className="font-bold uppercase text-xs tracking-wider">
                Office Location
              </Label>
              <Input
                id="office"
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                placeholder="Room 301, CS Block"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="font-bold uppercase text-xs tracking-wider">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your residential address"
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
