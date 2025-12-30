import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Calendar, 
  Tag, 
  Download, 
  ChevronRight,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';

interface BackendCircular {
  id: number;
  title: string;
  description: string;
  type: string;
  audience: string;
  priority: string;
  attachment_url: string | null;
  published_at: string;
  created_at: string;
  created_by_name: string;
}

export default function Circulars() {
  const { user } = useAuth();
  const [circulars, setCirculars] = useState<BackendCircular[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Notices');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCircular, setSelectedCircular] = useState<BackendCircular | null>(null);
  const itemsPerPage = 10;

  const fetchCirculars = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/circulars`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch circulars');

      const data = await response.json();
      setCirculars(data);
    } catch (error: any) {
      console.error('Fetch Circulars Error:', error);
      toast.error('Could not load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCirculars();
    }
  }, [user, fetchCirculars]);

  const getPriorityStyles = (priority: string) => {
    const p = priority.toLowerCase();
    switch (p) {
      case 'high': 
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Backend 'type' maps to frontend 'category'
    const matchesCategory = selectedCategory === 'All Notices' || c.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCirculars.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCirculars.slice(indexOfFirstItem, indexOfLastItem);

  const categories = ['All Notices', 'Academic', 'Examination', 'Placement', 'Events', 'Notice', 'Circular'];

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Fetching the latest updates...</p>
      </div>
    );
  }

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
        <div className="lg:col-span-3 space-y-3">
          {currentItems.length > 0 ? (
            <>
              {currentItems.map((notice, idx) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCircular(notice)}
                  className="group relative p-4 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] font-black uppercase border-0 px-1.5 py-0 rounded-lg ${getPriorityStyles(notice.priority)}`}>
                          {notice.priority}
                        </Badge>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                          <Tag className="w-2.5 h-2.5" />
                          {notice.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">•</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatDateTime(notice.created_at)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold group-hover:text-primary transition-colors truncate">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 pr-4">{notice.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {notice.attachment_url && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg text-primary hover:bg-primary/10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notice.attachment_url) window.open(notice.attachment_url, '_blank');
                          }}
                          title="Download Attachment"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-muted group/btn">
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                  <p className="text-xs text-muted-foreground font-medium">
                    Showing <span className="text-foreground">{indexOfFirstItem + 1}</span> to <span className="text-foreground">{Math.min(indexOfLastItem, filteredCirculars.length)}</span> of <span className="text-foreground">{filteredCirculars.length}</span> notices
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-2 h-8"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                       {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                         <button
                           key={page}
                           onClick={() => setCurrentPage(page)}
                           className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                             currentPage === page 
                               ? 'bg-primary text-white shadow-glow-sm' 
                               : 'hover:bg-muted text-muted-foreground'
                           }`}
                         >
                           {page}
                         </button>
                       ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl px-2 h-8"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-white/5">
                <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No circulars found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Circular Detail Modal */}
      <Dialog open={!!selectedCircular} onOpenChange={(open) => !open && setSelectedCircular(null)}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 gap-0">
          {selectedCircular && (
            <div className="flex flex-col h-full max-h-[85vh]">
              {/* Header with gradient/image area */}
              <div className="h-24 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent relative">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-primary/10">
                    <Megaphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] font-black uppercase border-0 px-2 py-0.5 rounded-lg ${getPriorityStyles(selectedCircular.priority)}`}>
                        {selectedCircular.priority} Priority
                      </Badge>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{selectedCircular.type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">{formatDateTime(selectedCircular.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-auto p-8 pt-6">
                <h2 className="text-2xl font-black mb-6 leading-tight text-foreground">
                  {selectedCircular.title}
                </h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedCircular.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center font-bold text-xs text-muted-foreground">
                      {selectedCircular.created_by_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Published By</p>
                      <p className="text-xs font-bold">{selectedCircular.created_by_name || 'Administrator'}</p>
                    </div>
                  </div>

                  {selectedCircular.attachment_url && (
                    <Button 
                      variant="gradient" 
                      className="rounded-2xl px-6 font-bold shadow-glow-sm"
                      onClick={() => window.open(selectedCircular.attachment_url!, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Attachment
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-muted/10 flex justify-end">
                <Button 
                  variant="ghost" 
                  className="rounded-xl font-bold text-muted-foreground hover:bg-muted/20"
                  onClick={() => setSelectedCircular(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
