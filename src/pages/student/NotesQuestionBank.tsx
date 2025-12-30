import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Download, 
  BookOpen, 
  FileCode, 
  HelpCircle,
  ExternalLink,
  Filter,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function NotesQuestionBank() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [notesData, setNotesData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'student') {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/student-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Notes loaded:', data);
        setNotesData(data.notesBySubject || {});
      } else {
        console.error('Failed to load notes');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Flatten notes for filtering
  const allNotes = Object.values(notesData).flatMap((subject: any) => 
    subject.notes.map((note: any) => ({
      ...note,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode
    }))
  );

  const filteredResources = allNotes.filter((note: any) => {
    const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject ? note.subjectCode === selectedSubject : true;
    const matchesType = activeTab === 'notes' ? note.category === 'Note' : note.category === 'QP';
    
    return matchesSearch && matchesSubject && matchesType;
  });

  // Unique Subjects for Sidebar
  const subjects = Object.keys(notesData).map(code => ({
    name: notesData[code].subjectName,
    code: code,
    count: notesData[code].notes.length
  }));
  
  const totalNotes = allNotes.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground">Access study materials, lecture notes, and question banks</p>
        </div>
      </motion.div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search for subjects, topics, or question papers..." 
          className="pl-12 h-14 bg-muted/50 border-transparent focus:bg-card focus:border-primary/20 rounded-2xl text-lg transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Quick Filters
            </h3>
            <div className="space-y-2">
              <Button 
                variant={activeTab === 'notes' ? 'secondary' : 'ghost'} 
                className="w-full justify-start rounded-xl font-semibold transition-all"
                onClick={() => setActiveTab('notes')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Lecture Notes
              </Button>
              <Button 
                variant={activeTab === 'question_bank' ? 'secondary' : 'ghost'} 
                className="w-full justify-start rounded-xl font-semibold transition-all"
                onClick={() => setActiveTab('question_bank')}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Question Bank
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold">By Subjects</h3>
            </div>
            <div className="space-y-3">
              <div 
                className={`flex items-center justify-between group cursor-pointer hover:text-primary transition-colors ${selectedSubject === null ? 'text-primary font-bold' : ''}`}
                onClick={() => setSelectedSubject(null)}
              >
                  <span className="text-sm font-medium">All Subjects</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    {totalNotes}
                  </span>
              </div>
              {subjects.map((sub, idx) => (
                <div 
                    key={idx} 
                    className={`flex items-center justify-between group cursor-pointer hover:text-primary transition-colors ${selectedSubject === sub.code ? 'text-primary font-bold' : ''}`}
                    onClick={() => setSelectedSubject(sub.code)}
                >
                  <span className="text-sm font-medium">{sub.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    {sub.count}
                  </span>
                </div>
              ))}
              {subjects.length === 0 && (
                  <p className="text-xs text-muted-foreground">No subjects found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              {activeTab === 'notes' ? <FileText className="w-5 h-5 text-primary" /> : <HelpCircle className="w-5 h-5 text-accent" />}
              {activeTab === 'notes' ? 'Lecture Notes' : 'Question Banks'}
            </h2>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Showing {filteredResources.length} resources
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.map((note: any, idx: number) => (
                <ResourceCard key={note.id} note={note} idx={idx} />
            ))}
            {filteredResources.length === 0 && (
                <EmptyState type={activeTab === 'notes' ? "Lecture Notes" : "Question Banks"} />
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 p-8 text-center space-y-4 border border-white/10"
          >
            <h3 className="text-xl font-bold">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Request specific study materials from your faculty directly.
            </p>
            <div className="flex justify-center gap-3">
              <RequestMaterialDialog user={user} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function RequestMaterialDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFaculty();
    }
  }, [open]);

  const loadFaculty = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data.faculty || []);
      }
    } catch (error) {
      console.error('Error loading faculty:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !description) {
      toast.error("Please select a faculty and provide a description.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/material-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyId: selectedFaculty,
          description
        })
      });

      if (res.ok) {
        toast.success("Request sent successfully!");
        setOpen(false);
        setSelectedFaculty('');
        setDescription('');
      } else {
        toast.error("Failed to send request");
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error("Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-xl px-8">Request Material</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Study Material</DialogTitle>
          <DialogDescription>
            Send a request to your faculty for specific notes or question papers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Faculty</label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Faculty" />
              </SelectTrigger>
              <SelectContent>
                {facultyList.map((f: any) => (
                  <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="Describe the material you need (e.g., Unit 3 Notes for Data Structures)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ResourceCard = ({ note, idx }: { note: any, idx: number }) => {
  const handleDownload = () => {
    if (note.fileUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = note.fileUrl;
      link.download = note.title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${note.title}`);
    } else {
      toast.error('File URL not available');
    }
  };

  const handleView = () => {
    if (note.fileUrl) {
      window.open(note.fileUrl, '_blank');
      toast.success('Opening in new tab');
    } else {
      toast.error('File URL not available');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="p-5 glass-card rounded-2xl group hover:border-primary/20 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          note.category === 'Note' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
        }`}>
          {note.category === 'Note' ? <FileText className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleView}
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted text-primary"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{note.subjectCode}</p>
      <h4 className="font-bold text-lg mb-4 group-hover:text-primary transition-colors">{note.title}</h4>

      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
        <span>{note.fileSize} ({note.fileType})</span>
        <span className="flex items-center gap-1 text-[8px]">
          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
          {new Date(note.uploadedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ type }: { type: string }) => (
    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-20 text-center flex flex-col items-center gap-3 bg-muted/20 rounded-2xl border-2 border-dashed border-white/5">
        <AlertCircle className="w-10 h-10 opacity-20" />
        <p className="text-muted-foreground font-medium">No {type} found matching your criteria.</p>
    </div>
);
