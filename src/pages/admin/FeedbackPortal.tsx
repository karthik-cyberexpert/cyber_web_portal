import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  Edit,
  Calendar as CalendarIcon,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { API_BASE_URL } from '@/lib/api-config';
import { FACULTY_FEEDBACK_QUESTIONS } from './feedback-constants';

// Data Interfaces
interface Batch {
    id: number;
    name: string; 
}

interface Section {
    id: number;
    name: string;
}

interface CustomQuestion {
    id: number;
    text: string;
    type: 'mcq' | 'text';
    options?: string[]; // For MCQ
}

interface FeedbackItem {
  id: number;
  title: string;
  type: 'faculty' | 'other';
  batch_name: string; // From backend join
  section_name: string; // From backend join
  closing_date: string;
  status: 'Open' | 'Closed';
  question_count?: number;
  response_count?: number;
}

export default function FeedbackPortalAdmin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // --- Fetch Data States ---
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  // --- Form States ---
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackType, setFeedbackType] = useState<'faculty' | 'other'>('faculty');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all'); // 'all' or batchId
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all'); // 'all' or sectionId
  const [closingDate, setClosingDate] = useState('');

  // --- Custom Questions Builder State ---
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Initial Fetch
  useEffect(() => {
      fetchBatches();
      fetchFeedbacks();
  }, []);

  // Fetch Sections when Batch changes
  useEffect(() => {
      if (selectedBatchId !== 'all') {
          fetchSections(Number(selectedBatchId));
      } else {
          setSections([]);
          setSelectedSectionId('all');
      }
  }, [selectedBatchId]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/feedback/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleViewResults = async (id: number) => {
      setIsViewModalOpen(true);
      setSelectedFeedbackResults(null);
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/feedback/${id}/results`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
              const data = await response.json();
              setSelectedFeedbackResults(data);
          }
      } catch (error) {
          console.error("Error fetching results", error);
      }
  };

  const fetchBatches = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setBatches(data);
          }
      } catch (error) {
          console.error("Failed to fetch batches", error);
      }
  };

  const fetchSections = async (batchId: number) => {
      try {
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setSections(data);
          }
      } catch (error) {
          console.error("Failed to fetch sections", error);
      }
  };

  // --- Handlers for Custom Form Builder ---
  const addCustomQuestion = () => {
      const newQ: CustomQuestion = {
          id: Date.now(),
          text: '',
          type: 'mcq',
          options: ['Option 1', 'Option 2']
      };
      setCustomQuestions([...customQuestions, newQ]);
  };

  const removeCustomQuestion = (id: number) => {
      setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: number, text: string) => {
      setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateQuestionType = (id: number, type: 'mcq' | 'text') => {
      setCustomQuestions(customQuestions.map(q => q.id === id ? { ...q, type } : q));
  };

  const updateOptionText = (qId: number, optIndex: number, text: string) => {
      setCustomQuestions(customQuestions.map(q => {
          if (q.id === qId && q.options) {
              const newOpts = [...q.options];
              newOpts[optIndex] = text;
              return { ...q, options: newOpts };
          }
          return q;
      }));
  };

  const addOption = (qId: number) => {
      setCustomQuestions(customQuestions.map(q => {
          if (q.id === qId && q.options) {
              return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
          }
          return q;
      }));
  };

    const removeOption = (qId: number, optIndex: number) => {
      setCustomQuestions(customQuestions.map(q => {
          if (q.id === qId && q.options && q.options.length > 1) {
             const newOpts = q.options.filter((_, idx) => idx !== optIndex);
             return { ...q, options: newOpts };
          }
          return q;
      }));
  };

  // --- Submit Handler ---
  const handleCreate = async () => {
    if (!feedbackTitle || !closingDate) {
      toast.error("Please fill in Title and Closing Date");
      return;
    }

    if (feedbackType === 'other' && customQuestions.length === 0) {
        toast.error("Please add at least one question for custom feedback.");
        return;
    }

    const payload = {
        title: feedbackTitle,
        type: feedbackType,
        batch_id: selectedBatchId,
        section_id: selectedSectionId,
        closing_date: closingDate,
        custom_questions: feedbackType === 'other' ? customQuestions : []
    };

    try {
        const res = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Feedback Form Created Successfully");
            fetchFeedbacks(); // Refresh list
            
            // Reset Form
            setFeedbackTitle('');
            setFeedbackType('faculty');
            setSelectedBatchId('all');
            setSelectedSectionId('all');
            setClosingDate('');
            setCustomQuestions([]);
            setIsCreateOpen(false);
        } else {
            const err = await res.json();
            toast.error(err.message || 'Failed to create feedback');
        }
    } catch (error) {
        toast.error("Network error");
    }
  };

  const handleDelete = async (id: number) => {
      try {
          const res = await fetch(`${API_BASE_URL}/feedback/${id}`, {
              method: 'DELETE',
               headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              setFeedbacks(feedbacks.filter(item => item.id !== id));
              toast.success("Feedback deleted");
          }
      } catch (error) {
          toast.error("Failed to delete");
      }
  };

  const filteredFeedbacks = feedbacks.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Feedback Portal Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage feedback forms and view responses</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Create Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Create New Feedback Form</DialogTitle>
              <DialogDescription>Configure the feedback details and questions.</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6 pt-2">
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4 border p-4 rounded-xl bg-muted/20">
                        <div className="space-y-2">
                            <Label>Feedback Title</Label>
                            <Input 
                                placeholder="e.g. End Semester Feedback" 
                                value={feedbackTitle}
                                onChange={(e) => setFeedbackTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Feedback Type</Label>
                            <RadioGroup 
                                defaultValue="faculty" 
                                value={feedbackType} 
                                onValueChange={(val: 'faculty' | 'other') => setFeedbackType(val)}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="faculty" id="r1" />
                                    <Label htmlFor="r1">Feedback on Faculty (Standard 8 Questions)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="r2" />
                                    <Label htmlFor="r2">Other (Custom Questions)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Batch</Label>
                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Batches</SelectItem>
                                    {batches.map(b => (
                                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Section</Label>
                            <Select 
                                value={selectedSectionId} 
                                onValueChange={setSelectedSectionId}
                                disabled={selectedBatchId === 'all'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sections</SelectItem>
                                     {sections.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Closing Date & Time (23:59)</Label>
                        <DatePicker 
                            date={closingDate ? new Date(closingDate) : undefined}
                            onChange={date => setClosingDate(date ? format(date, "yyyy-MM-dd") : '')}
                        />
                    </div>

                    {/* Question Content Area */}
                    <div className="border-t pt-4">
                        <Label className="text-lg font-semibold mb-4 block">Questions Preview</Label>
                        
                        {feedbackType === 'faculty' ? (
                             <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">Standard Faculty Evaluation Template</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        The user will see the 8 standard evaluation questions for EACH faculty member assigned to their section.
                                    </p>
                                    <div className="pl-4 border-l-2 border-primary/30 space-y-2 text-sm text-muted-foreground">
                                        {FACULTY_FEEDBACK_QUESTIONS.slice(0, 3).map((q, i) => (
                                            <p key={q.id}>{i+1}. {q.text}</p>
                                        ))}
                                        <p>... and 5 more.</p>
                                    </div>
                                </CardContent>
                             </Card>
                        ) : (
                            <div className="space-y-4">
                                {customQuestions.map((q, index) => (
                                    <Card key={q.id} className="relative group">
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeCustomQuestion(q.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-muted-foreground">Q{index + 1}</span>
                                                <Input 
                                                    value={q.text} 
                                                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                                    placeholder="Enter question text..."
                                                    className="flex-1"
                                                />
                                                <Select 
                                                    value={q.type} 
                                                    onValueChange={(val: 'mcq' | 'text') => updateQuestionType(q.id, val)}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                                                        <SelectItem value="text">Short Text</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {q.type === 'mcq' && q.options && (
                                                <div className="pl-8 space-y-2">
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                                            <Input 
                                                                value={opt}
                                                                onChange={(e) => updateOptionText(q.id, optIdx, e.target.value)}
                                                                className="h-8 max-w-[300px]"
                                                                placeholder={`Option ${optIdx + 1}`}
                                                            />
                                                            {q.options!.length > 1 && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOption(q.id, optIdx)}>
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => addOption(q.id)}>
                                                        <Plus className="w-3 h-3 mr-1" /> Add Option
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                
                                <Button 
                                    onClick={addCustomQuestion} 
                                    variant="outline" 
                                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary/50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Question
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>

            <DialogFooter className="p-6 border-t bg-muted/10">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Publish Feedback Form</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search feedback..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-muted/50 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>Title / Type</TableHead>
                <TableHead>Role / Target</TableHead>
                <TableHead>Closing Date</TableHead>
                <TableHead className="text-center">Total Response</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20">
                             {item.batch_name || 'All Batches'}
                          </Badge>
                          <span className="text-xs text-muted-foreground pl-1">{item.section_name || 'All Sections'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(item.closing_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">{item.response_count}</span>
                    </TableCell>
                     <TableCell className="text-center">
                      <Badge variant={item.status === 'Open' ? 'default' : 'secondary'} className={item.status === 'Open' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 text-primary" 
                           title="View Responses"
                           onClick={() => navigate(`/admin/feedback/${item.id}/results`)}
                         >
                            <Eye className="w-4 h-4" />
                         </Button>
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No feedback forms found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


    </div>
  );
}
