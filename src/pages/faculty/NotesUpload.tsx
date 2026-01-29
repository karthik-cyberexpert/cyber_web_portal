import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, 
  Search, 
  BookOpen, 
  Trash2, 
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  MoreVertical,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';

interface Note {
  id: number;
  title: string;
  description: string;
  type: 'Note' | 'QP' | 'Manual' | 'Other';
  file_type: string;
  file_url: string;
  file_size: string;
  download_count: number;
  is_published: boolean;
  created_at: string;
  subject_name: string;
  subject_code: string;
  section_name: string;
  batch_name: string;
}

interface SubjectAllocation {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  section_id: number;
  section_name: string;
  batch_name: string;
}

export default function NotesUpload() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<SubjectAllocation[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [newResource, setNewResource] = useState({
    title: '',
    subject_id: '',
    section_id: '',
    type: 'Note' as 'Note' | 'QP' | 'Manual',
    file_type: 'PDF'
  });

  // Fetch subjects (allocations) for the faculty
  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/notes/my-subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
        if (data.length > 0) {
          setNewResource(prev => ({
            ...prev,
            subject_id: String(data[0].subject_id),
            section_id: String(data[0].section_id)
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch notes uploaded by this faculty
  const loadNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/notes/my-notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSubjects();
      loadNotes();
    }
  }, [user]);

  const handleUpload = async () => {
    if (!newResource.title || !newResource.subject_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('subject_id', newResource.subject_id);
      if (newResource.section_id) {
        formData.append('section_id', newResource.section_id);
      }
      formData.append('type', newResource.type);
      
      // Append file if selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });

      if (res.ok) {
        toast.success('Resource uploaded successfully');
        setIsUploadOpen(false);
        setSelectedFile(null);
        setNewResource({
          title: '',
          subject_id: subjects[0]?.subject_id ? String(subjects[0].subject_id) : '',
          section_id: subjects[0]?.section_id ? String(subjects[0].section_id) : '',
          type: 'Note',
          file_type: 'PDF'
        });
        loadNotes();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading resource');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Resource deleted');
        loadNotes();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting resource');
    }
  };

  const handleDownload = async (note: Note) => {
    if (!note.file_url) {
      toast.error('No file attached to this note');
      return;
    }

    try {
      // Increment download count
      await fetch(`${API_BASE_URL}/notes/${note.id}/download`, {
        method: 'POST'
      });

      // Download the file using fetch + blob to force download
      let url = note.file_url;
      if (!url.startsWith('http')) {
          if (!url.startsWith('/uploads')) {
               url = `/uploads/notes/${url}`;
          }
          url = `${API_BASE_URL}${url}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('File not found');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Extract original filename from URL or use title
      const urlParts = note.file_url.split('/');
      const filename = urlParts[urlParts.length - 1] || `${note.title}.${note.file_type.toLowerCase()}`;
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);

      toast.success('File downloaded successfully');
      
      // Refresh notes to update download count
      loadNotes();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading file');
    }
  };

  const totalDownloads = notes.reduce((acc, curr) => acc + (curr.download_count || 0), 0);
  
  // Get unique subjects for dropdown
  const uniqueSubjects = subjects.filter((s, i, arr) => 
    arr.findIndex(x => x.subject_id === s.subject_id) === i
  );
  
  // Get sections for selected subject
  const sectionsForSubject = subjects.filter(
    s => String(s.subject_id) === newResource.subject_id
  );

  return (
    <>
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Notes Library & Upload</h1>
          <p className="text-muted-foreground mt-1 font-medium">Distribute course materials and question banks</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" className="rounded-xl shadow-lg shadow-primary/20 scale-105">
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload New Material
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Learning Resource</DialogTitle>
                    <DialogDescription>Add notes, question papers or manuals for your students.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="e.g. Unit 1: Introduction" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={newResource.subject_id} onValueChange={v => setNewResource({...newResource, subject_id: v, section_id: ''})}>
                                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {uniqueSubjects.map(sub => (
                                        <SelectItem key={sub.subject_id} value={String(sub.subject_id)}>{sub.subject_name} ({sub.subject_code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Batch / Section</Label>
                            <Select value={newResource.section_id} onValueChange={v => setNewResource({...newResource, section_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                                <SelectContent>
                                    {sectionsForSubject.map(sec => (
                                        <SelectItem key={sec.section_id} value={String(sec.section_id)}>{sec.batch_name} - {sec.section_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Resource Type</Label>
                        <Select value={newResource.type} onValueChange={(v: any) => setNewResource({...newResource, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Note">Lecture Notes</SelectItem>
                                <SelectItem value="QP">Question Paper</SelectItem>
                                <SelectItem value="Manual">Lab Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Upload File</Label>
                        {selectedFile ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <FileText className="w-8 h-8 text-primary" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            toast.success(`File selected: ${file.name}`);
                                        }
                                    }}
                                />
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">Supported: PDF, Word, Excel, PowerPoint, Images (Max 25MB)</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isUploading}>
                        {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isUploading ? 'Uploading...' : 'Confirm Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="glass-card p-6 border-none shadow-xl col-span-1 h-fit">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Library Stats</h3>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <FileText className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xl font-black">{notes.length}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Files</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <Download className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-xl font-black">{totalDownloads >= 1000 ? `${(totalDownloads/1000).toFixed(1)}k` : totalDownloads}</p>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Downloads</p>
                  </div>
               </div>
               <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase text-primary mb-3 tracking-widest">Storage Status</p>
                  <div className="flex justify-between text-xs font-bold mb-2">
                     <span>Used</span>
                     <span>0.2%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-primary to-accent w-[2%]" />
                  </div>
               </div>
            </div>
         </Card>

         <div className="col-span-1 md:col-span-3 space-y-4">
            <div className="flex gap-4 items-center">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                     placeholder="Search by title, subject or batch..." 
                     className="pl-10 rounded-2xl bg-white/5 border-white/10"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="rounded-2xl border-white/10">Filter Files</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               <AnimatePresence>
               {notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase())).map((note, idx) => (
                     <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                     >
                        <Card className="glass-card border-none p-5 group hover:shadow-glow transition-all cursor-pointer" onClick={() => setSelectedNote(note)}>
                           <div className="flex gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex flex-col items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                 <FileText className="w-6 h-6" />
                                 <span className="text-[8px] font-black leading-none mt-1 uppercase">{note.file_type}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-white/10">{note.subject_code}</Badge>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                       <Button 
                                         variant="ghost" 
                                         size="icon" 
                                         className="w-8 h-8 rounded-lg hover:text-primary" 
                                         disabled={!note.file_url}
                                         onClick={() => handleDownload(note)}
                                       >
                                         <Download className="w-4 h-4" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-destructive/50 hover:text-destructive" onClick={() => handleDelete(note.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                 </div>
                                 <h4 className="font-bold text-sm truncate mb-3">{note.title}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                    <span className="flex items-center gap-1 uppercase tracking-widest"><Users className="w-3 h-3" /> {note.section_name || 'All'}</span>
                                    <span className="flex items-center gap-1 uppercase tracking-widest"><Clock className="w-3 h-3" /> {new Date(note.created_at).toLocaleDateString('en-GB')}</span>
                                    <span className="ml-auto text-primary px-2 py-0.5 rounded-full bg-primary/10">{note.download_count} dl</span>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </AnimatePresence>

               {notes.length === 0 && (
                   <div className="lg:col-span-2 text-center py-10 text-muted-foreground border-2 border-dashed border-white/5 rounded-2xl">
                       No resources uploaded yet.
                   </div>
               )}

               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsUploadOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-8 group cursor-pointer hover:border-primary/30 transition-all hover:bg-primary/5"
               >
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-xs font-black uppercase text-muted-foreground group-hover:text-primary tracking-widest">Drop files here</p>
               </motion.div>
            </div>
         </div>
      </div>
    </div>

      {/* View Note Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
                <span className="text-[8px] font-black leading-none mt-0.5 uppercase">{selectedNote?.file_type}</span>
              </div>
              <div>
                <p className="text-lg font-bold">{selectedNote?.title}</p>
                <Badge variant="outline" className="mt-1 text-[9px]">{selectedNote?.subject_code} - {selectedNote?.subject_name}</Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">View note details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedNote?.description && (
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm">{selectedNote.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
                <p className="mt-1 text-sm font-bold">
                  {selectedNote?.type === 'Note' && 'Lecture Notes'}
                  {selectedNote?.type === 'QP' && 'Question Paper'}
                  {selectedNote?.type === 'Manual' && 'Lab Manual'}
                  {selectedNote?.type === 'Other' && 'Other'}
                </p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Section</Label>
                <p className="mt-1 text-sm font-bold">{selectedNote?.section_name || 'All Sections'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">File Size</Label>
                <p className="mt-1 text-sm font-bold">{selectedNote?.file_size || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Downloads</Label>
                <p className="mt-1 text-sm font-bold text-primary">{selectedNote?.download_count || 0}</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Uploaded</Label>
                <p className="mt-1 text-sm font-bold">{selectedNote?.created_at ? new Date(selectedNote.created_at).toLocaleDateString('en-GB') : 'N/A'}</p>
              </div>
            </div>
            {!selectedNote?.file_url && (
              <div className="p-6 rounded-xl border-2 border-dashed border-white/10 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No file attached to this note</p>
                <p className="text-xs text-muted-foreground/60 mt-1">File upload functionality coming soon</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNote(null)}>Close</Button>
            <Button 
              disabled={!selectedNote?.file_url}
              onClick={() => selectedNote && handleDownload(selectedNote)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
