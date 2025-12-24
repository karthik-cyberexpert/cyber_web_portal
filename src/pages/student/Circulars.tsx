import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Calendar, 
  Tag, 
  Download, 
  ChevronRight,
  Search,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCirculars, Circular } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';

export default function Circulars() {
  const { user } = useAuth();
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Notices');

  useEffect(() => {
    const all = getCirculars();
    // Filter by audience (all or students)
    const accessible = all.filter(c => c.audience === 'all' || c.audience === 'students');
    setCirculars(accessible);
  }, []);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Notices' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All Notices', 'Academic', 'Examination', 'Placement', 'Events', 'Administrative'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Circulars & Notices</h1>
          <p className="text-muted-foreground">Stay updated with the latest campus announcements</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search notices..." 
            className="pl-9 bg-muted/50 border-transparent rounded-xl focus:bg-card focus:border-primary/20 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedCategory === cat ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-accent/5 to-primary/5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm font-bold">{circulars.length} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredCirculars.length > 0 ? filteredCirculars.map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative p-6 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all cursor-pointer`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase border-0 px-2 py-0.5 rounded-lg ${getPriorityStyles(notice.priority)}`}>
                      {notice.priority} Priority
                    </Badge>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                      <Tag className="w-3 h-3" />
                      {notice.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors pr-8 leading-tight">
                    {notice.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.date}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 pr-4">{notice.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-bold text-primary hover:bg-primary/10" disabled={!notice.attachment}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Attachment
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-bold group-hover:gap-2 transition-all">
                  Read Full Announcement
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-white/5">
                <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No circulars found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
