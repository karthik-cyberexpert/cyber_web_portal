import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ECAAchievements() {
  const [filter, setFilter] = useState('all');

  const achievements = [
    { 
      id: 1, 
      title: "1st Place - National Hackathon 2024", 
      org: "IEEE Computer Society", 
      date: "Aug 2024", 
      category: "Technical", 
      status: "approved",
      points: 50,
      icon: Code,
      certificate: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400&h=300&fit=crop",
      link: "https://github.com/arun/hackathon-win"
    },
    { 
      id: 2, 
      title: "Cultural Excellence Award", 
      org: "College Fine Arts Club", 
      date: "May 2024", 
      category: "Cultural", 
      status: "pending",
      points: 30,
      icon: Palette,
      certificate: "https://images.unsplash.com/photo-1544923246-77307dd654ca?w=400&h=300&fit=crop",
    },
    { 
      id: 3, 
      title: "Inter-College Cricket Winner", 
      org: "University Sports Board", 
      date: "Mar 2024", 
      category: "Sports", 
      status: "rejected",
      remarks: "Certificate scan is blurry. Please re-upload.",
      points: 40,
      icon: Target,
      certificate: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop",
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20", shadow: "shadow-success/20" };
      case 'rejected': return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", shadow: "shadow-destructive/20" };
      default: return { icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", shadow: "shadow-warning/20" };
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold font-heading">ECA & Achievements</h1>
          <p className="text-muted-foreground">Document your extracurricular activities and earn academic credits</p>
        </div>
        <Button variant="gradient" className="rounded-xl shadow-lg hover:scale-105 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add New Achievement
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-white/20 z-10 relative">
                <Trophy className="w-12 h-12" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg z-20"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>
            <div>
              <p className="text-4xl font-black text-primary font-mono tracking-tighter">150</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ECA Points Earned</p>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground">Semester Goal</span>
                <span className="text-primary">80%</span>
              </div>
              <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  className="h-full bg-primary rounded-full pulse-glow" 
                />
              </div>
            </div>
          </motion.div>

          <div className="glass-card rounded-2xl p-4 space-y-2">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 mb-2">Filter Gallery</h3>
            {['All', 'Technical', 'Cultural', 'Sports'].map((cat) => (
              <Button
                key={cat}
                variant={filter === cat.toLowerCase() ? 'default' : 'ghost'}
                onClick={() => setFilter(cat.toLowerCase())}
                className="w-full justify-start rounded-xl h-10 text-xs font-bold transition-all"
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${filter === cat.toLowerCase() ? 'bg-white' : 'bg-primary'}`} />
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {achievements
                .filter(a => filter === 'all' || a.category.toLowerCase() === filter)
                .map((item, idx) => {
                const Icon = item.icon;
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
                    className="group glass-card rounded-2xl overflow-hidden hover:border-primary/20 transition-all flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={item.certificate} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${status.bg} ${status.color} ${status.border} backdrop-blur-md shadow-lg font-black text-[9px] px-3 py-1 border`}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className={`absolute bottom-3 left-3 flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10`}>
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h4>
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-0 font-black">+{item.points}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mb-4">{item.org} • {item.date}</p>
                      
                      {item.remarks && (
                        <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/10 flex items-start gap-2 animate-fade-in-up">
                          <MessageSquare className="w-3 h-3 text-destructive mt-0.5" />
                          <p className="text-[10px] text-destructive font-bold italic">{item.remarks}</p>
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                            <ImageIcon className="w-4 h-4" />
                          </Button>
                          {item.link && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => window.open(item.link, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest h-8">View Detailed</Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            <motion.button 
              whileHover={{ scale: 0.98 }}
              className="rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground group min-h-[300px]"
            >
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">New Achievement</p>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
