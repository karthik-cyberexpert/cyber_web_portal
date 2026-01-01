import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Calendar, 
  Tag, 
  Download, 
  ChevronRight,
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  CheckCircle2,
  X,
  FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// import { getCirculars, Circular } from '@/lib/data-store'; // Removed local data store
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

interface Circular {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  created_at: string;
  attachment_url: string | null;
  created_by_name?: string;
  category?: string;
  date?: string;
  target_batch_id?: number;
  target_section_id?: number;
  batch_name?: string;
  section_name?: string;
  audience?: string;
}

interface Allocation {
    subject_id: number;
    subject_name: string;
    section_id: number;
    section_name: string;
    batch_id: number;
    batch_name: string;
}

export default function Circulars() {
  const { user } = useAuth();
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  
  // New Circular State
  const [newCircular, setNewCircular] = useState({
    title: '',
    description: '',
    type: 'Notice',
    priority: 'Medium',
    target_batch_id: '',
    target_section_id: 'all',
    file: null as File | null
  });

  const loadCirculars = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/circulars`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Transform data for UI if needed
            const formatted = data.map((c: any) => ({
                ...c,
                category: c.type, // Map type to category for UI
                date: new Date(c.created_at).toLocaleDateString('en-GB')
            }));
            setCirculars(formatted);
        }
    } catch (error) {
        console.error('Error loading circulars:', error);
    } finally {
        setLoading(false);
    }
  };

  const loadAllocations = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/assignments/my-allocations`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setAllocations(data);
          }
      } catch (error) {
          console.error('Error loading allocations:', error);
      }
  };

  useEffect(() => {
    loadCirculars();
    loadAllocations();
  }, []);

  const handleCreate = async () => {
      if (!newCircular.title || !newCircular.target_batch_id) {
          toast.error('Title and Batch are required');
          return;
      }

      const formData = new FormData();
      formData.append('title', newCircular.title);
      formData.append('description', newCircular.description);
      formData.append('type', newCircular.type);
      formData.append('priority', newCircular.priority);
      formData.append('audience', 'Students'); // Default for faculty circulars
      formData.append('target_batch_id', newCircular.target_batch_id);
      if (newCircular.target_section_id && newCircular.target_section_id !== 'all') {
          formData.append('target_section_id', newCircular.target_section_id);
      }
      if (newCircular.file) {
          formData.append('file', newCircular.file);
      }

      try {
          const token = localStorage.getItem('token');
          const url = isEditMode 
            ? `${API_BASE_URL}/circulars/${editingId}`
            : `${API_BASE_URL}/circulars`;
          const method = isEditMode ? 'PUT' : 'POST';
          
          const res = await fetch(url, {
              method,
              headers: { Authorization: `Bearer ${token}` },
              body: formData
          });

          if (res.ok) {
              toast.success(isEditMode ? 'Circular updated successfully' : 'Circular published successfully');
              setIsCreateOpen(false);
              setIsEditMode(false);
              setEditingId(null);
              setNewCircular({
                  title: '',
                  description: '',
                  type: 'Notice',
                  priority: 'Medium',
                  target_batch_id: '',
                  target_section_id: 'all',
                  file: null
              });
              loadCirculars();
          } else {
              const err = await res.json();
              toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'publish'} circular`);
          }
      } catch (error) {
          console.error(error);
          toast.error(`Error ${isEditMode ? 'updating' : 'creating'} circular`);
      }
  };

  const handleDelete = async (circularId: number) => {
    if (!confirm('Are you sure you want to delete this circular?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/circulars/${circularId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Circular deleted successfully');
        loadCirculars();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to delete circular');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting circular');
    }
  };

  // Unique batches and sections for dropdowns
  const uniqueBatches = Array.from(new Set(allocations.map(a => a.batch_id)))
    .map(id => allocations.find(a => a.batch_id === id));
  
  const sectionsForBatch = allocations.filter(a => a.batch_id === Number(newCircular.target_batch_id));
  const uniqueSections = Array.from(new Set(sectionsForBatch.map(a => a.section_id)))
    .map(id => sectionsForBatch.find(a => a.section_id === id));

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

  // Pagination
  const totalPages = Math.ceil(filteredCirculars.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCirculars = filteredCirculars.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
                placeholder="Search circulars..." 
                className="pl-9 bg-muted/50 border-transparent rounded-xl focus:bg-card transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Notice
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Circular' : 'Create New Circular'}</DialogTitle>
                        <DialogDescription>Publish a circular for your students.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="md:col-span-2">
                            <Label>Title</Label>
                            <Input 
                                value={newCircular.title}
                                onChange={e => setNewCircular({...newCircular, title: e.target.value})}
                                placeholder="e.g. Mid-Term Exam Schedule"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <Label>Description</Label>
                             <Textarea 
                                 value={newCircular.description}
                                 onChange={e => setNewCircular({...newCircular, description: e.target.value})}
                                 placeholder="Enter detailed information..."
                                 rows={3}
                             />
                        </div>
                        
                        <div>
                            <Label>Batch</Label>
                            <Select 
                                value={newCircular.target_batch_id} 
                                onValueChange={v => setNewCircular({...newCircular, target_batch_id: v, target_section_id: 'all'})}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                                <SelectContent>
                                    {uniqueBatches.map(b => (
                                        <SelectItem key={b?.batch_id} value={String(b?.batch_id)}>{b?.batch_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Section</Label>
                            <Select 
                                value={newCircular.target_section_id} 
                                onValueChange={v => setNewCircular({...newCircular, target_section_id: v})}
                                disabled={!newCircular.target_batch_id}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sections</SelectItem>
                                    {uniqueSections.map(s => (
                                        <SelectItem key={s?.section_id} value={String(s?.section_id)}>{s?.section_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Type</Label>
                            <Select value={newCircular.type} onValueChange={v => setNewCircular({...newCircular, type: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Notice">Notice</SelectItem>
                                    <SelectItem value="Circular">Circular</SelectItem>
                                    <SelectItem value="Event">Event</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label>Priority</Label>
                             <Select value={newCircular.priority} onValueChange={v => setNewCircular({...newCircular, priority: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <Label>Attachment</Label>
                            <Input 
                                type="file" 
                                onChange={e => setNewCircular({...newCircular, file: e.target.files?.[0] || null})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Publish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {paginatedCirculars.length > 0 ? paginatedCirculars.map((notice, idx) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-4 glass-card rounded-xl border-transparent hover:border-primary/20 transition-all cursor-pointer bg-primary/[0.01]"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[9px] font-bold uppercase border-0 px-1.5 py-0 rounded ${getPriorityStyles(notice.priority)}`}>
                    {notice.priority}
                  </Badge>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Tag className="w-2.5 h-2.5 text-primary" />
                    {notice.category}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-auto">
                    <Calendar className="w-2.5 h-2.5 text-primary" />
                    {notice.date}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-tight mb-1">
                  {notice.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notice.description}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    setSelectedCircular(notice);
                    setViewDetailsOpen(true);
                  }}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {notice.attachment_url && (
                    <DropdownMenuItem asChild>
                      <a href={`${API_BASE_URL}${notice.attachment_url}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => {
                    setIsEditMode(true);
                    setEditingId(notice.id);
                    setNewCircular({
                      title: notice.title,
                      description: notice.description,
                      type: notice.type || 'Notice',
                      priority: notice.priority,
                      target_batch_id: String(notice.target_batch_id || ''),
                      target_section_id: String(notice.target_section_id || 'all'),
                      file: null
                    });
                    setIsCreateOpen(true);
                  }}>
                    <FileEdit className="w-4 h-4 mr-2" />
                    Edit Circular
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleDelete(notice.id)}>
                    <X className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        )) : (
            <div className="text-center py-12 bg-muted/20 border-2 border-dashed border-white/5 rounded-xl">
                <Megaphone className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">No circulars found for faculty.</p>
            </div>
        )}
        </div>
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredCirculars.length}
        />
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCircular?.title}</DialogTitle>
            <DialogDescription>
              Full details of the circular
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-1">Priority</h4>
                <Badge variant="outline" className={`text-xs font-bold uppercase ${getPriorityStyles(selectedCircular?.priority || 'Medium')}`}>
                  {selectedCircular?.priority}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-1">Type</h4>
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {selectedCircular?.type || selectedCircular?.category}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-1">Posted To</h4>
                <p className="text-sm">
                  <span className="font-semibold">{selectedCircular?.batch_name || 'All Batches'}</span>
                  {selectedCircular?.section_name && (
                    <span className="text-muted-foreground"> → {selectedCircular.section_name}</span>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground mb-1">Audience</h4>
                <p className="text-sm font-semibold">{selectedCircular?.audience || 'Students'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground mb-1">Created</h4>
              <p className="text-sm">
                <Calendar className="w-3 h-3 inline mr-1" />
                {selectedCircular?.created_at 
                  ? new Date(selectedCircular.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })
                  : selectedCircular?.date
                }
              </p>
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-bold mb-2">Description:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedCircular?.description || 'No description provided.'}
              </p>
            </div>
            {selectedCircular?.attachment_url && (
              <div>
                <h4 className="text-sm font-bold mb-2">Attachment:</h4>
                <Button asChild variant="outline" size="sm">
                  <a href={`${API_BASE_URL}${selectedCircular.attachment_url}`} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </a>
                </Button>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-4 border-t">
              Posted by: {selectedCircular?.created_by_name || 'Unknown'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
