import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Camera, Save, Shield, 
  Activity, Clock, Loader2,
  CheckCircle2, AlertCircle, Edit2, X,
  KeyRound
} from 'lucide-react';
import UpdatePasswordModal from '@/components/UpdatePasswordModal';
import ImageCropModal from '@/components/ImageCropModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
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
    if (user && user.role === 'admin') {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        updateUser({ name: formData.name, email: formData.email });
        setIsEditing(false);
        fetchProfile();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Error updating profile", err);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic">Synchronizing Admin Privileges...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-black italic bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Personal Profile
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs italic">
          Administrative Identity Management
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Avatar & Quick Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 flex flex-col items-center"
        >
          <div className="relative group/avatar">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-accent to-secondary rounded-[3rem] blur opacity-25 group-hover/avatar:opacity-50 transition duration-1000 group-hover/avatar:duration-200" />
            <div className="relative p-2 bg-background rounded-[3rem] border border-white/10 shadow-2xl">
              <Avatar className="w-56 h-56 rounded-[2.5rem] border-4 border-transparent shadow-inner">
                <AvatarImage src={profile.avatar} className="object-cover" />
                <AvatarFallback className="text-6xl font-black bg-gradient-to-br from-primary to-accent text-white">
                  {profile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => setIsCropModalOpen(true)}
                className="absolute -bottom-2 -right-2 p-5 bg-primary text-white rounded-[1.5rem] shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all hover:rotate-6 border-4 border-background"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center space-y-3">
             <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                {profile.role?.toUpperCase() || 'ADMINISTRATOR'}
             </Badge>
             <h2 className="text-2xl font-black italic">{profile.name}</h2>
          </div>
        </motion.div>

        {/* Right: Consolidated Details Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
          <Card className="glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic flex items-center gap-3">
                   <User className="w-6 h-6 text-primary" />
                   Identification Records
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="rounded-xl hover:bg-accent/10 hover:text-accent transition-all shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-muted/30 border border-white/5 group hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 italic">Identity Name</p>
                      <p className="text-lg font-bold text-foreground italic">{profile.name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-muted/30 border border-white/5 group hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-inner">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 italic">Authentication Source</p>
                      <p className="text-lg font-bold text-foreground italic truncate">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-muted/30 border border-white/5 group hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-inner">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 italic">Contact Sequence</p>
                      <p className="text-lg font-bold text-foreground italic">{profile.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-xl w-[calc(100%-2rem)] glass-card border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black italic tracking-tight">Modify Identity Variables</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
              Update your core identification credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic ml-1">Name</Label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="pl-12 h-12 rounded-2xl bg-muted/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all font-bold italic"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-accent italic ml-1">Email</Label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-accent transition-colors" />
                  <Input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@college.edu"
                    className="pl-12 h-12 rounded-2xl bg-muted/50 border-white/10 focus:border-accent/50 focus:ring-accent/20 transition-all font-bold italic"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-secondary italic ml-1">Phone</Label>
                <div className="relative group/input">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-secondary transition-colors" />
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="pl-12 h-12 rounded-2xl bg-muted/50 border-white/10 focus:border-secondary/50 focus:ring-secondary/20 transition-all font-bold italic"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              className="w-full sm:w-auto rounded-xl font-bold italic order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary/90 font-black uppercase text-xs tracking-widest px-8 h-11 shadow-glow-sm order-1 sm:order-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Commit Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpdatePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSuccess={() => fetchProfile()}
      />
    </div>
  );
}
