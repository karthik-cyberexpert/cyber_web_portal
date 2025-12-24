import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, Edit2, Trash2, Pin, Send, Eye,
  Calendar, Users, FileText, Search, Filter,
  Megaphone, AlertCircle, Info, CheckCircle2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCirculars, saveCirculars, addCircular, Circular } from '@/lib/data-store';
import { toast } from 'sonner';

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'urgent': return <AlertCircle className="w-4 h-4" />;
    case 'examination': return <FileText className="w-4 h-4" />;
    case 'events': return <Megaphone className="w-4 h-4" />;
    case 'academic': return <Calendar className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'examination': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'events': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'academic': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
};

export default function Circulars() {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCircular, setNewCircular] = useState<Omit<Circular, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'Academic',
    priority: 'low',
    audience: 'all',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setCirculars(getCirculars());
  }, []);

  const handlePublish = () => {
    if (!newCircular.title || !newCircular.description) {
        toast.error("Please fill in all fields");
        return;
    }
    addCircular(newCircular);
    setCirculars(getCirculars());
    setIsAddOpen(false);
    setNewCircular({
        title: '',
        description: '',
        category: 'Academic',
        priority: 'low',
        audience: 'all',
        date: new Date().toISOString().split('T')[0]
    });
    toast.success("Circular published successfully!");
  };

  const handleDelete = (id: string) => {
    const all = getCirculars().filter(c => c.id !== id);
    saveCirculars(all);
    setCirculars(all);
    toast.success("Circular deleted");
  };

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="w-4 h-4" />
              New Circular
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Circular</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="Enter circular title..."
                  value={newCircular.title}
                  onChange={(e) => setNewCircular({ ...newCircular, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Enter circular description..."
                  rows={4}
                  value={newCircular.description}
                  onChange={(e) => setNewCircular({ ...newCircular, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newCircular.category} 
                    onValueChange={(value) => setNewCircular({ ...newCircular, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Examination">Examination</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={newCircular.priority} 
                    onValueChange={(value: any) => setNewCircular({ ...newCircular, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select 
                    value={newCircular.audience} 
                    onValueChange={(value: any) => setNewCircular({ ...newCircular, audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="faculty">Faculty Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                        type="date"
                        value={newCircular.date}
                        onChange={(e) => setNewCircular({ ...newCircular, date: e.target.value })}
                    />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="gap-2" onClick={handlePublish}>
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: circulars.length, icon: Bell, color: 'from-blue-500 to-cyan-500' },
          { label: 'High Priority', value: circulars.filter(c => c.priority === 'high').length, icon: AlertCircle, color: 'from-red-500 to-pink-500' },
          { label: 'Events', value: circulars.filter(c => c.category.toLowerCase() === 'events').length, icon: Megaphone, color: 'from-amber-500 to-orange-500' },
          { label: 'Academic', value: circulars.filter(c => c.category.toLowerCase() === 'academic').length, icon: Calendar, color: 'from-emerald-500 to-teal-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search circulars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="examination">Examination</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Circulars List */}
      <div className="space-y-4">
        {filteredCirculars.length > 0 ? filteredCirculars.map((circular, index) => (
        <motion.div
            key={circular.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="glass-card border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${getCategoryColor(circular.category).split(' ')[0]}`}>
                                {getCategoryIcon(circular.category)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{circular.title}</h3>
                                    <Badge className={getCategoryColor(circular.category)}>
                                        {circular.category}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/10">
                                        Audience: {circular.audience}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{circular.description}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {circular.date}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
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
