import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Calendar, 
  Tag, 
  Download, 
  Search,
  Plus,
  MoreVertical,
  FileText,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface Circular {
  id: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  created_at: string;
  attachment_url: string | null;
  created_by_name?: string;
  batch_name?: string;
  section_name?: string;
}

export default function Circulars() {
  const { user } = useAuth();
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignedSection, setAssignedSection] = useState<string>('');
  
  const [newCircular, setNewCircular] = useState({
    title: '',
    description: '',
    type: 'Notice',
    priority: 'Medium',
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
            setCirculars(data);
        }
    } catch (error) {
        console.error('Error loading circulars:', error);
    } finally {
        setLoading(false);
    }
  };

  const loadAssignment = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/tutors/class`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              if (data.hasAssignment) {
                  setAssignedSection(`${data.batch} - Section ${data.section}`);
              }
          }
      } catch (error) {
          console.error('Error loading assignment:', error);
      }
  };

  useEffect(() => {
    loadCirculars();
    loadAssignment();
  }, []);

  const handleCreate = async () => {
      if (!newCircular.title) {
          toast.error('Title is required');
          return;
      }

      const formData = new FormData();
      formData.append('title', newCircular.title);
      formData.append('description', newCircular.description);
      formData.append('type', newCircular.type);
      formData.append('priority', newCircular.priority);
      formData.append('audience', 'Students');
      if (newCircular.file) {
          formData.append('file', newCircular.file);
      }

      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/circulars`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData
          });

          if (res.ok) {
              toast.success('Circular published successfully');
              setIsCreateOpen(false);
              setNewCircular({
                  title: '',
                  description: '',
                  type: 'Notice',
                  priority: 'Medium',
                  file: null
              });
              loadCirculars();
          } else {
              const err = await res.json();
              toast.error(err.message || 'Failed to publish circular');
          }
      } catch (error) {
          console.error(error);
          toast.error('Error creating circular');
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

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const filteredCirculars = circulars.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">Class Circulars 📣</h1>
          <p className="text-muted-foreground font-medium">
            {assignedSection ? `Managing circulars for ${assignedSection}` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-3">
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
              <Button variant="gradient" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Circular
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Circular</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    📌 This circular will be visible only to students in <span className="font-bold text-primary">{assignedSection}</span>
                  </p>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., Important Exam Notice"
                    value={newCircular.title}
                    onChange={(e) => setNewCircular({...newCircular, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Provide detailed information..."
                    rows={4}
                    value={newCircular.description}
                    onChange={(e) => setNewCircular({...newCircular, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newCircular.type} onValueChange={(v) => setNewCircular({...newCircular, type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Notice">Notice</SelectItem>
                        <SelectItem value="Circular">Circular</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="News">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newCircular.priority} onValueChange={(v) => setNewCircular({...newCircular, priority: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Attachment (Optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => setNewCircular({...newCircular, file: e.target.files?.[0] || null})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button variant="gradient" onClick={handleCreate}>Publish Circular</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : filteredCirculars.length > 0 ? filteredCirculars.map((circular, idx) => (
          <motion.div
            key={circular.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-6 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all bg-primary/[0.01]"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-[10px] font-black uppercase border-0 px-2 py-0.5 rounded-lg ${getPriorityStyles(circular.priority)}`}>
                    {circular.priority} Priority
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Tag className="w-3 h-3 text-primary" />
                    {circular.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-tight">
                  {circular.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl whitespace-nowrap tracking-widest border border-white/5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {new Date(circular.created_at).toLocaleDateString('en-GB')}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(circular.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 pr-4 font-medium leading-relaxed">{circular.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              {circular.attachment_url ? (
                <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10" asChild>
                  <a href={circular.attachment_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download Attachment
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No attachment</span>
              )}
              <div className="text-[10px] font-black uppercase text-muted-foreground">
                {circular.section_name ? `Section ${circular.section_name}` : 'All Sections'}
              </div>
            </div>
          </motion.div>
        )) : (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-white/5 rounded-2xl">
                <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No circulars found.</p>
            </div>
        )}
      </div>
    </div>
  );
}
