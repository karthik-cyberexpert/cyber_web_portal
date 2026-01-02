import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  ExternalLink, 
  Plus, 
  Sparkles,
  Music,
  Code,
  Palette,
  Target,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Send,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { getAchievements, addAchievement, Achievement } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ECAAchievements() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState<File | null>(null);
  const [newAch, setNewAch] = useState({
    title: '',
    organization: '',
    date: '',
    category: 'Technical',
    customCategory: '',
    level: 'College',
    link: ''
  });

  useEffect(() => {
    if (user) {
        setAchievements(getAchievements().filter(a => a.userId === user.id));
    }
  }, [user]);

  const handleAdd = () => {
    if (!user) return;
    
    const finalCategory = newAch.category === 'Other' ? newAch.customCategory : newAch.category;

    if (!newAch.title || !newAch.organization || !newAch.date || !finalCategory) {
        toast.error("Please fill in required fields");
        return;
    }

    addAchievement({
        userId: user.id,
        userName: user.name,
        title: newAch.title,
        organization: newAch.organization,
        date: newAch.date,
        category: finalCategory,
        level: newAch.level,
        link: newAch.link
    });

    setAchievements(getAchievements().filter(a => a.userId === user.id));
    setIsAddOpen(false);
    toast.success("Achievement submitted for verification!");
    setNewAch({
        title: '',
        organization: '',
        date: '',
        category: 'Technical',
        customCategory: '',
        level: 'College',
        link: ''
    });
    setSelectedProofImage(null);
  };

  const totalPoints = useMemo(() => {
    return achievements.reduce((acc, a) => acc + (a.points || 0), 0);
  }, [achievements]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20", shadow: "shadow-success/20" };
      case 'rejected': return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", shadow: "shadow-destructive/20" };
      default: return { icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", shadow: "shadow-warning/20" };
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case 'Technical': return Code;
        case 'Cultural': return Music;
        case 'Sports': return Target;
        case 'Leadership': return Sparkles;
        default: return Award;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold italic tracking-tight">ECA & Achievements 🏆</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Document your extracurricular activities and earn academic credits</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="w-full sm:w-auto rounded-xl shadow-glow-sm hover:scale-[1.02] transition-all uppercase font-black tracking-widest text-[10px] h-11 sm:h-10">
                <Plus className="w-4 h-4 mr-2" />
                Add New Achievement
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl italic font-black">New Achievement Submission</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Achievement Title</Label>
                        <Input 
                            placeholder="e.g. 1st Place - National Hackathon" 
                            value={newAch.title}
                            onChange={e => setNewAch({...newAch, title: e.target.value})}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization / Issuer</Label>
                        <Input 
                            placeholder="IEEE, Google, Sports Club etc." 
                            value={newAch.organization}
                            onChange={e => setNewAch({...newAch, organization: e.target.value})}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                        <Select value={newAch.category} onValueChange={(val: any) => setNewAch({...newAch, category: val})}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Cultural">Cultural</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Social Service">Social Service</SelectItem>
                                <SelectItem value="Leadership">Leadership</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Participation Level</Label>
                        <Select value={newAch.level} onValueChange={(val: any) => setNewAch({...newAch, level: val})}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="International">International</SelectItem>
                                <SelectItem value="National">National</SelectItem>
                                <SelectItem value="State">State</SelectItem>
                                <SelectItem value="University">University</SelectItem>
                                <SelectItem value="College">College</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>


                {newAch.category === 'Other' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specify Category</Label>
                    <Input 
                        placeholder="Please specify the category..." 
                        value={newAch.customCategory}
                        onChange={e => setNewAch({...newAch, customCategory: e.target.value})}
                        className="rounded-xl"
                    />
                  </motion.div>
                )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</Label>
                            <Input 
                                type="date"
                                value={newAch.date}
                                onChange={e => setNewAch({...newAch, date: e.target.value})}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof Link (Optional)</Label>
                            <Input 
                                placeholder="GitHub, LinkedIn etc." 
                                value={newAch.link}
                                onChange={e => setNewAch({...newAch, link: e.target.value})}
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Proof Image Upload */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proof Image (Max 5MB)</Label>
                        <input
                          type="file"
                          id="proof-image-upload"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              if (file.size > 5 * 1024 * 1024) {
                                toast.error('File size must be less than 5MB');
                                return;
                              }
                              setSelectedProofImage(file);
                              toast.success(`Selected: ${file.name}`);
                            }
                          }}
                        />
                        <label
                          htmlFor="proof-image-upload"
                          className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 flex flex-col items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-colors block text-center"
                        >
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            {selectedProofImage ? (
                              <>
                                <p className="text-sm text-primary font-medium">{selectedProofImage.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedProofImage.size / 1024).toFixed(2)} KB</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground font-medium">Click to upload proof image</p>
                                <p className="text-xs text-muted-foreground/50">JPG, PNG, or PDF (Max 5MB)</p>
                              </>
                            )}
                        </label>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button variant="outline" onClick={() => setIsAddOpen(false)} className="w-full sm:w-1/3 rounded-xl h-11">
                          Cancel
                      </Button>
                      <Button className="w-full sm:w-2/3 gap-2 shadow-glow-sm font-black uppercase tracking-widest text-xs h-11 rounded-xl" onClick={handleAdd}>
                          <Send className="w-4 h-4" />
                          Submit Verification
                      </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-white/20 z-10 relative">
                <Trophy className="w-12 h-12" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg z-20 shadow-accent/50"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-primary font-mono tracking-tighter">{totalPoints}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ECA Points Earned</p>
            </div>
            <div className="w-full space-y-2 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Semester Goal</span>
                <span className="text-primary">{Math.min(100, Math.round((totalPoints / 100) * 100))}%</span>
              </div>
              <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((totalPoints / 100) * 100))}%` }}
                  className="h-full bg-primary rounded-full pulse-glow" 
                />
              </div>
            </div>
          </motion.div>

          {/* Gallery Filter Removed */}
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {achievements
                .filter(a => filter === 'all' || a.category.toLowerCase() === filter)
                .map((item, idx) => {
                const Icon = getCategoryIcon(item.category);
                const status = getStatusConfig(item.status);
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group glass-card rounded-2xl overflow-hidden hover:border-primary/20 transition-all flex flex-col shadow-xl border-white/5 relative bg-primary/[0.01]"
                  >
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className={`${status.bg} ${status.color} ${status.border} backdrop-blur-md shadow-lg font-black text-[8px] sm:text-[9px] px-2 sm:px-3 py-0.5 sm:py-1 border`}>
                        <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">{item.category} • {item.level}</span>
                            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors pr-20 italic">{item.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 mt-2">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.organization}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">{item.date}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-2xl font-black text-primary font-mono tracking-tighter">+{item.points}</p>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Points</p>
                        </div>
                      </div>
                      
                      {item.remarks && (
                        <div className="mb-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-3 animate-fade-in-up">
                          <MessageSquare className="w-4 h-4 text-destructive mt-0.5" />
                          <p className="text-xs text-destructive font-bold italic">"{item.remarks}"</p>
                        </div>
                      )}

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10" disabled>
                            <ImageIcon className="w-5 h-5" />
                          </Button>
                          {item.link && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10"
                              onClick={() => window.open(item.link, '_blank')}
                            >
                              <ExternalLink className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl text-[9px] font-black uppercase tracking-widest h-10 px-4 border-white/10 hover:bg-white/5">Details</Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {achievements.length === 0 && (
                <div className="col-span-full py-20 text-center bg-muted/20 border-2 border-dashed border-white/5 rounded-3xl">
                    <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No achievements documented yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
