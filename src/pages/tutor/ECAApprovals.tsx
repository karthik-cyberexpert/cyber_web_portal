import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
  MessageSquare,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAchievements, updateAchievementStatus, Achievement, getTutors, Tutor, getStudents } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

export default function ECAApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tutorInfo, setTutorInfo] = useState<Tutor | null>(null);
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);
  const [points, setPoints] = useState('10');
  const [remarks, setRemarks] = useState('');
  const [isProcessOpen, setIsProcessOpen] = useState(false);

  useEffect(() => {
    if (user) {
        const tutors = getTutors();
        const current = tutors.find(t => t.email === user.email);
        if (current) setTutorInfo(current);
    }
    loadData();
  }, [user]);

  const loadData = () => {
    setAchievements(getAchievements().reverse());
  };

  const handleProcess = (action: 'approved' | 'rejected') => {
    if (!selectedAch) return;
    updateAchievementStatus(selectedAch.id, action, parseInt(points), remarks);
    toast.success(`Achievement ${action} successfully!`);
    setIsProcessOpen(false);
    loadData();
    setSelectedAch(null);
    setPoints('10');
    setRemarks('');
  };

  const filtered = achievements.filter(a => {
    const statusMatch = a.status === activeTab;
    if (!statusMatch) return false;
    
    if (!tutorInfo) return true;
    const students = getStudents();
    const student = students.find(s => s.id === a.userId);
    if (!student) return true;
    return student.batch === tutorInfo.batch && student.section === tutorInfo.section;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">ECA Verification 🏆</h1>
          <p className="text-muted-foreground font-medium">Verify student achievements for {tutorInfo ? `${tutorInfo.batch} - ${tutorInfo.section}` : 'your classes'}</p>
        </div>
        <div className="flex bg-muted p-1 rounded-xl">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <Button 
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-4"
            >
              {tab}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-3xl overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col bg-primary/[0.01]"
            >
              <div className="h-24 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 relative">
                <div className="absolute top-4 left-4">
                   <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-0 text-[9px] font-black uppercase tracking-widest px-3 h-6">
                     {item.category}
                   </Badge>
                </div>
                <div className="absolute -bottom-6 right-6">
                    <Avatar className="w-14 h-14 border-4 border-background shadow-xl rounded-2xl">
                        <AvatarFallback className="font-bold bg-primary/10 text-primary">{item.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
              </div>
              
                <div className="p-6 pt-8 flex-1 flex flex-col">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors min-h-[3rem] italic">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs font-bold text-muted-foreground">{item.userName}</p>
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <p className="text-[10px] font-black text-primary/70 tracking-widest uppercase">{item.level}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-warning" />
                          <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Points</p>
                        </div>
                        <p className="text-xs font-bold font-mono">+{item.points}</p>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/40 border border-white/5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-success" />
                          <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Date</p>
                        </div>
                        <p className="text-xs font-bold truncate">{item.date}</p>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.organization}</p>
                  </div>
  
                  <div className="flex items-center gap-3 pt-6 mt-auto">
                    <Button variant="outline" className="flex-1 rounded-xl h-10 border-white/5 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest" asChild disabled={!item.link}>
                        {item.link ? (
                            <a href={item.link} target="_blank" rel="noreferrer">
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            Verify Proof
                            </a>
                        ) : (
                            <span>No Link</span>
                        )}
                    </Button>
                    
                    {item.status === 'pending' && (
                        <Button 
                            variant="gradient" 
                            size="icon"
                            onClick={() => { setSelectedAch(item); setIsProcessOpen(true); }}
                            className="w-10 h-10 rounded-xl shadow-glow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                            <Check className="w-5 h-5" />
                        </Button>
                    )}
                  </div>

                  {item.remarks && (
                    <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-white/5 text-[10px] italic font-medium text-muted-foreground">
                        "{item.remarks}"
                    </div>
                  )}
                </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-muted/10 border-2 border-dashed border-white/5 rounded-3xl">
                <Award className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No {activeTab} submissions found.</p>
            </div>
        )}
      </div>

      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="glass-card border-white/10">
            <DialogHeader>
                <DialogTitle className="italic font-bold">Process Achievement Verification</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
                {selectedAch && (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-white/5">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedAch.userName}</p>
                        <h4 className="font-bold text-lg leading-tight mt-1">{selectedAch.title}</h4>
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-bold tracking-widest">Award Points</Label>
                        <Input 
                            type="number" 
                            value={points}
                            onChange={e => setPoints(e.target.value)}
                            placeholder="e.g. 25"
                        />
                        <p className="text-[9px] text-muted-foreground font-bold italic">* Suggested: 10 (Local), 25 (State), 50 (National)</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-bold tracking-widest">Remarks / Feedback</Label>
                        <Input 
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="e.g. Verified with certificate. Excellent work!"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button variant="success" className="gap-2 shadow-glow-sm font-black uppercase tracking-widest text-xs h-11" onClick={() => handleProcess('approved')}>
                        <CheckCircle className="w-4 h-4" />
                        Verify & Award
                    </Button>
                    <Button variant="destructive" className="gap-2 shadow-glow-sm font-black uppercase tracking-widest text-xs h-11" onClick={() => handleProcess('rejected')}>
                        <XCircle className="w-4 h-4" />
                        Reject Request
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
