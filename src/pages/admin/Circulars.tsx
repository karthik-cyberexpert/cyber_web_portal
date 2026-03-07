import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, Edit2, Trash2, Pin, Send, Eye,
  Calendar, Users, FileText, Search, Filter,
  Megaphone, AlertCircle, Info, CheckCircle2,
  X, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';

interface Circular {
    id: number;
    title: string;
    content: string;
    description?: string;
    audience: string;
    priority: string;
    type: string;
    published_at: string;
    created_at: string;
    created_by_name: string;
    attachment_url?: string;
    batch_name?: string;
    section_name?: string;
}

export default function Circulars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Circular State
  const [newCircular, setNewCircular] = useState({
    title: '',
    content: '',
    audience: 'All', // Default to 'All' to match backend case
    priority: 'Medium',
    type: 'Notice',
    target_batch_id: '',
    target_section_id: 'all',
  });

  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    fetchCirculars();
    fetchBatches();
  }, []);

  // Fetch users when audience or batch changes in modal
  useEffect(() => {
    if (recipientMode === 'selected') {
        fetchAvailableUsers();
    }
  }, [newCircular.audience, newCircular.target_batch_id, recipientMode]);

  const fetchCirculars = async () => {
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
        toast.error("Failed to load circulars");
    }
  };

  const fetchBatches = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/academic/batches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setBatches(data);
        }
    } catch (error) {}
  };

  const fetchAvailableUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        let url = '';
        if (newCircular.audience === 'Students') {
            url = `${API_BASE_URL}/students?`;
            if (newCircular.target_batch_id && newCircular.target_batch_id !== 'all') {
                url += `batchId=${newCircular.target_batch_id}`;
            }
        } else if (newCircular.audience === 'Faculty') {
            url = `${API_BASE_URL}/admin/faculty`;
        } else {
            setAvailableUsers([]);
            return;
        }

        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setAvailableUsers(data);
        }
    } catch (error) {
        console.error("Fetch users error", error);
    }
  };

  const handlePublish = async () => {
    if (!newCircular.title || !newCircular.content) {
        toast.error("Please fill in title and content");
        return;
    }

    setIsLoading(true);
    try {
        const token = localStorage.getItem('token');
        const payload = {
            ...newCircular,
            recipient_ids: recipientMode === 'selected' ? selectedUserIds : []
        };

        const res = await fetch(`${API_BASE_URL}/circulars`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Circular published successfully!");
            setIsAddOpen(false);
            resetForm();
            fetchCirculars();
        } else {
            const err = await res.json();
            toast.error(err.message || "Failed to publish");
        }
    } catch (error) {
        toast.error("Server error publishing circular");
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
      setNewCircular({
        title: '',
        content: '',
        audience: 'All',
        priority: 'Medium',
        type: 'Notice',
        target_batch_id: '',
        target_section_id: 'all',
      });
      setRecipientMode('all');
      setSelectedUserIds([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this circular?")) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/circulars/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success("Circular deleted");
            fetchCirculars();
        }
    } catch (error) {
        toast.error("Failed to delete circular");
    }
  };

  const toggleUserSelection = (userId: number) => {
      setSelectedUserIds(prev => 
          prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
  };

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (c.type || '').toLowerCase() === categoryFilter.toLowerCase();
    const matchesBatch = selectedBatchFilter === 'all' || (c.batch_name && c.batch_name === batches.find(b=>b.id.toString()===selectedBatchFilter)?.name);
    return matchesSearch && matchesCategory && matchesBatch;
  });

  const filteredUsers = availableUsers.filter(u => 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      (u.roll_number || u.employee_id || '').toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Circulars & Notices
          </h1>
          <p className="text-muted-foreground mt-1">Manage announcements and notifications</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(v) => { setIsAddOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="w-4 h-4" />
              New Circular
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Create New Circular</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="Enter notice title..."
                  value={newCircular.title}
                  onChange={(e) => setNewCircular({ ...newCircular, title: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Content / Message</Label>
                <Textarea 
                  placeholder="Detailed announcement content..."
                  rows={4}
                  value={newCircular.content}
                  onChange={(e) => setNewCircular({ ...newCircular, content: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select 
                    value={newCircular.audience} 
                    onValueChange={(val: any) => {
                        setNewCircular({ ...newCircular, audience: val, target_batch_id: '' });
                        setRecipientMode('all');
                        setSelectedUserIds([]);
                    }}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Everyone</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Faculty">Faculty Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCircular.audience === 'Students' && (
                  <div className="space-y-2">
                    <Label>Target Batch</Label>
                    <Select 
                        value={newCircular.target_batch_id || 'all'} 
                        onValueChange={(v) => {
                            setNewCircular({...newCircular, target_batch_id: v === 'all' ? '' : v});
                            setSelectedUserIds([]); // Reset selection if batch changes
                        }}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="All Batches" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Delivery Mode: All vs Selected */}
              {newCircular.audience !== 'All' && (
                  <div className="grid grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                          <Label>Delivery Mode</Label>
                          <Select value={recipientMode} onValueChange={(v: any) => {
                              setRecipientMode(v);
                              if (v === 'selected') setIsUserPickerOpen(true);
                              else setSelectedUserIds([]);
                          }}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All {newCircular.audience}</SelectItem>
                                  <SelectItem value="selected">Selected {newCircular.audience}</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      
                      {recipientMode === 'selected' && (
                          <Button 
                            variant="outline" 
                            className="gap-2 border-dashed border-primary/50 text-primary" 
                            onClick={() => setIsUserPickerOpen(true)}
                          >
                              <UserCheck className="w-4 h-4" />
                              {selectedUserIds.length} Selected
                          </Button>
                      )}
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type / Category</Label>
                  <Select value={newCircular.type} onValueChange={(v) => setNewCircular({...newCircular, type: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Notice">Notice</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Examination">Examination</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newCircular.priority} onValueChange={(v) => setNewCircular({...newCircular, priority: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="gap-2" onClick={handlePublish} disabled={isLoading}>
                  {isLoading ? "Publishing..." : <><Send className="w-4 h-4" /> Publish Circular</>}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipient Picker Modal */}
      <Dialog open={isUserPickerOpen} onOpenChange={setIsUserPickerOpen}>
          <DialogContent className="glass-card border-white/10 max-w-lg">
              <DialogHeader>
                  <DialogTitle>Select {newCircular.audience} Recipients</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                      {newCircular.target_batch_id ? `Showing results for selected batch` : `Showing all available ${newCircular.audience}`}
                  </p>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by name or ID..." 
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                      />
                  </div>
                  <ScrollArea className="h-72 pr-4">
                      <div className="space-y-2">
                          {filteredUsers.length > 0 ? filteredUsers.map(user => (
                              <div 
                                    key={user.id || user.user_id} 
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10"
                                    onClick={() => toggleUserSelection(user.id || user.user_id)}
                                >
                                  <div className="flex items-center gap-3">
                                      <Checkbox 
                                        checked={selectedUserIds.includes(user.id || user.user_id)}
                                        onCheckedChange={() => toggleUserSelection(user.id || user.user_id)}
                                      />
                                      <div>
                                          <p className="text-sm font-medium">{user.name}</p>
                                          <p className="text-[10px] text-muted-foreground">{user.roll_number || user.employee_id || 'ID: ' + (user.id || user.user_id)}</p>
                                      </div>
                                  </div>
                                  {user.section_name && <Badge variant="outline" className="text-[9px] h-5">{user.section_name}</Badge>}
                              </div>
                          )) : (
                              <div className="text-center py-10 opacity-50">No results found</div>
                          )}
                      </div>
                  </ScrollArea>
              </div>
              <DialogFooter>
                  <div className="flex justify-between items-center w-full">
                      <span className="text-xs text-muted-foreground">{selectedUserIds.length} users selected</span>
                      <Button onClick={() => setIsUserPickerOpen(false)}>Done</Button>
                  </div>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Published', value: circulars.length, icon: Bell, color: 'from-blue-500 to-cyan-500' },
          { label: 'High Priority', value: circulars.filter(c => c.priority === 'High').length, icon: AlertCircle, color: 'from-red-500 to-pink-500' },
          { label: 'Events Today', value: circulars.filter(c => c.type === 'Events').length, icon: Megaphone, color: 'from-amber-500 to-orange-500' },
          { label: 'Academic', value: circulars.filter(c => c.type === 'Academic').length, icon: Calendar, color: 'from-emerald-500 to-teal-500' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 uppercase">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-bold" />
          <Input placeholder="Search notices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Notice">Notice</SelectItem>
            <SelectItem value="Examination">Examination</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedBatchFilter} onValueChange={setSelectedBatchFilter}>
          <SelectTrigger className="w-full sm:w-48"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Batch" /></SelectTrigger>
          <SelectContent>
             <SelectItem value="all">All Batches</SelectItem>
             {batches.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.length > 0 ? filteredCirculars.map((circular, index) => (
        <motion.div key={circular.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="glass-card border-white/10 hover:border-white/20 transition-all border-l-4 border-l-primary/50 relative overflow-hidden group">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-lg">{circular.title}</h3>
                                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                                        {circular.type}
                                    </Badge>
                                    <Badge variant="secondary" className="opacity-70">
                                        {circular.audience}
                                    </Badge>
                                    {circular.batch_name && (
                                        <Badge variant="outline" className="border-accent/30 text-accent">
                                            {circular.batch_name}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-white/60 mt-2 line-clamp-3">{circular.content}</p>
                                <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(circular.created_at), 'MMM dd, yyyy')}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> By {circular.created_by_name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {circular.attachment_url && (
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={circular.attachment_url} target="_blank" rel="noreferrer"><Eye className="w-4 h-4" /></a>
                                </Button>
                             )}
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/20 text-destructive" onClick={() => handleDelete(circular.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
        )) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-white/5">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">No circulars found matching criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
}
