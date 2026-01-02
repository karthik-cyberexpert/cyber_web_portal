
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Upload,
  Paperclip,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';
// No jszip needed

export default function GrievancePortal() {
  const token = localStorage.getItem('token');
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      target_role: 'Tutor',
      attachment: null as File | null
  });

  const fetchGrievances = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/grievance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrievances(data.grievances);
      }
    } catch (error) {
      console.error("Failed to fetch grievances", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFormData({ ...formData, attachment: e.target.files[0] });
      }
  };

  const handleSubmit = async () => {
      if (!formData.title || !formData.description) {
          toast.error("Please fill in all required fields");
          return;
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('target_role', formData.target_role);
      if (formData.attachment) {
          data.append('attachment', formData.attachment);
      }

      try {
          const res = await fetch(`${API_BASE_URL}/grievance`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }, // Body is FormData, don't set Content-Type
              body: data
          });

          if (res.ok) {
              toast.success("Grievance submitted successfully");
              setIsCreateOpen(false);
              setFormData({ title: '', description: '', target_role: 'Tutor', attachment: null });
              fetchGrievances();
          } else {
              toast.error("Failed to submit grievance");
          }
      } catch (error) {
          console.error("Submit error", error);
          toast.error("An error occurred");
      }
  };

  const filteredGrievances = grievances.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Solved': return 'bg-green-100 text-green-800 border-green-200';
          case 'Returned': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Grievance Portal</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Register and track your complaints</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto gap-2">
          <Plus className="w-4 h-4" /> Register Complaint
        </Button>
      </div>

      <div className="grid gap-6">
          <Card className="overflow-hidden">
              <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle>My Grievances</CardTitle>
                      <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder="Search..."
                              className="pl-8"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-[50px] whitespace-nowrap">S.No</TableHead>
                                  <TableHead className="whitespace-nowrap">Title</TableHead>
                                  <TableHead className="whitespace-nowrap">Target</TableHead>
                                  <TableHead className="whitespace-nowrap">Date</TableHead>
                                  <TableHead className="whitespace-nowrap">Status</TableHead>
                                  <TableHead className="whitespace-nowrap">Remarks</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {isLoading ? (
                                  <TableRow>
                                      <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                  </TableRow>
                              ) : filteredGrievances.length === 0 ? (
                                  <TableRow>
                                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No grievances found</TableCell>
                                  </TableRow>
                              ) : (
                                  filteredGrievances.map((g, idx) => (
                                      <TableRow key={g.id}>
                                          <TableCell className="whitespace-nowrap">{idx + 1}</TableCell>
                                          <TableCell className="font-medium min-w-[150px]">
                                              <div>{g.title}</div>
                                              {g.attachment_path && (
                                                  <a 
                                                    href={`${API_BASE_URL}/${g.attachment_path}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline"
                                                  >
                                                      <Paperclip className="w-3 h-3"/> View Attachment
                                                  </a>
                                              )}
                                          </TableCell>
                                          <TableCell className="whitespace-nowrap">
                                              <Badge variant="outline">{g.target_role}</Badge>
                                          </TableCell>
                                          <TableCell className="whitespace-nowrap">{new Date(g.created_at).toLocaleDateString('en-GB')}</TableCell>
                                          <TableCell className="whitespace-nowrap">
                                              <Badge variant="secondary" className={getStatusColor(g.status)}>
                                                  {g.status}
                                              </Badge>
                                          </TableCell>
                                          <TableCell className="max-w-[200px] truncate" title={g.action_reason}>
                                              {g.action_reason || '-'}
                                          </TableCell>
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>
                  </div>
              </CardContent>
          </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Register Complaint</DialogTitle>
                <CardDescription>Submit your grievance to the appropriate authority.</CardDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                        placeholder="Brief title of the issue" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Grievance To</Label>
                    <Select 
                        value={formData.target_role} 
                        onValueChange={(val) => setFormData({...formData, target_role: val})}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Tutor">Class Tutor</SelectItem>
                            <SelectItem value="Admin">Administrator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        placeholder="Detailed description of your grievance..." 
                        rows={4}
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Attachment (Optional)</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="file" 
                            onChange={handleFileChange}
                            className="cursor-pointer text-xs"
                        />
                    </div>
                </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button onClick={handleSubmit} className="w-full sm:w-auto">Submit Complaint</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
