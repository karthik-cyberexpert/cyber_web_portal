import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Calendar, 
  Tag, 
  Download, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCirculars, Circular } from '@/lib/data-store';

export default function Circulars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const all = getCirculars();
    // Filter for faculty audience
    setCirculars(all.filter(c => c.audience === 'all' || c.audience === 'faculty'));
  }, []);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const filteredCirculars = circulars.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">Faculty Notices 📋</h1>
          <p className="text-muted-foreground font-medium">Academic and administrative circulars for teaching staff</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search circulars..." 
            className="pl-9 bg-muted/50 border-transparent rounded-xl focus:bg-card transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCirculars.length > 0 ? filteredCirculars.map((notice, idx) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all cursor-pointer bg-primary/[0.01]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] font-black uppercase border-0 px-2 py-0.5 rounded-lg ${getPriorityStyles(notice.priority)}`}>
                    {notice.priority} Priority
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Tag className="w-3 h-3 text-primary" />
                    {notice.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                  {notice.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl whitespace-nowrap tracking-widest border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {notice.date}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 pr-4 font-medium leading-relaxed">{notice.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10" disabled={!notice.attachment}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-black uppercase tracking-widest transition-all">
                Mark as Read
              </Button>
            </div>
          </motion.div>
        )) : (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-white/5 rounded-2xl">
                <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No circulars found for faculty.</p>
            </div>
        )}
      </div>
    </div>
  );
}
