import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Trash2, 
  Users,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { StatCard } from '@/components/dashboard/StatCards';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

interface TutorAssignment {
  id: number;
  faculty_id: number;
  faculty_name: string;
  faculty_email: string;
  faculty_avatar: string;
  section_id: number;
  section_name: string;
  batch_id: number;
  batch_name: string;
  reg_number_start: string;
  reg_number_end: string;
  assigned_at: string;
  created_at: string;
}

interface Faculty {
    id: number;
    name: string;
}

interface Batch {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

const ITEMS_PER_PAGE = 10;

export default function ManageTutors() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [tutors, setTutors] = useState<TutorAssignment[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<TutorAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorAssignment | null>(null);

  // Form Data for Assignment
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [batchList, setBatchList] = useState<Batch[]>([]);
  const [sectionList, setSectionList] = useState<Section[]>([]);
  
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [regStart, setRegStart] = useState<string>('');
  const [regEnd, setRegEnd] = useState<string>('');

  const fetchTutors = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/tutors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setTutors(data);
        }
    } catch (error) {
        console.error("Failed to fetch tutors", error);
    }
  };

  const fetchFaculty = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/faculty`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setFacultyList(data); // Assuming data is array of faculty objects
        }
    } catch (error) {
        console.error("Failed to fetch faculty", error);
    }
  };

  const fetchBatches = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/academic/batches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setBatchList(data);
        }
    } catch (error) {
        console.error("Failed to fetch batches", error);
    }
  };

  const fetchSections = async (batchId: string) => {
      if (!batchId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setSectionList(data);
        }
    } catch (error) {
        console.error("Failed to fetch sections", error);
    }
  };

  useEffect(() => {
    fetchTutors();
    fetchFaculty();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
        fetchSections(selectedBatchId);
    } else {
        setSectionList([]);
    }
  }, [selectedBatchId]);

  useEffect(() => {
    let filtered = tutors;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.faculty_name.toLowerCase().includes(term) ||
        t.batch_name.toLowerCase().includes(term) ||
        t.section_name.toLowerCase().includes(term)
      );
    }
    setFilteredTutors(filtered);
    setCurrentPage(1);
  }, [tutors, searchTerm]);

  const handleAssignTutor = async () => {
      if (!selectedFacultyId || !selectedSectionId || !selectedBatchId) {
          toast.error("Please select Faculty, Batch, and Section");
          return;
      }

      try {
          const res = await fetch(`${API_BASE_URL}/tutors`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                  facultyId: parseInt(selectedFacultyId),
                  batchId: parseInt(selectedBatchId),
                  sectionId: parseInt(selectedSectionId),
                  reg_number_start: regStart,
                  reg_number_end: regEnd
              })
          });

          if (res.ok) {
              toast.success("Tutor assigned successfully");
              setIsAddModalOpen(false);
              fetchTutors();
              // Reset
              setSelectedFacultyId('');
              setSelectedBatchId('');
              setSelectedSectionId('');
              setRegStart('');
              setRegEnd('');
          } else {
              const err = await res.json();
              toast.error(err.message || "Failed to assign tutor");
          }
      } catch (error) {
          toast.error("Network error");
      }
  };

  const handleDelete = (tutor: TutorAssignment) => {
    setSelectedTutor(tutor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!selectedTutor) return;
      try {
          const res = await fetch(`${API_BASE_URL}/tutors/${selectedTutor.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              toast.success("Assignment revoked successfully");
              setIsDeleteModalOpen(false);
              fetchTutors();
          } else {
              toast.error("Failed to revoke assignment");
          }
      } catch (error) {
          toast.error("Network error");
      }
  };

  // Stats
  const stats = {
      total: tutors.length,
      active: tutors.length, // All fetched are active
      sections: new Set(tutors.map(t => t.section_id)).size
  };

  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const paginatedTutors = filteredTutors.slice(
      (currentPage - 1) * ITEMS_PER_PAGE, 
      currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Manage Tutors</h1>
          <p className="text-muted-foreground">Assign Faculty as Class Tutors</p>
        </div>
        <Button variant="gradient" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Tutor
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Tutors"
          value={stats.total}
          icon={Users}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Active Assignments"
          value={stats.active}
          icon={UserCheck}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Assigned Sections"
          value={stats.sections}
          icon={GraduationCap}
          variant="warning"
          delay={0.3}
        />
      </div>

        {/* Filters and List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                placeholder="Search by faculty, batch, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
            </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Faculty</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Assigned Class</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Student Range</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Assigned Date</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedTutors.map((tutor, index) => (
                  <motion.tr
                    key={tutor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {tutor.faculty_name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium">{tutor.faculty_name}</p>
                                <p className="text-sm text-muted-foreground">{tutor.faculty_email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="font-medium">{tutor.batch_name}</div>
                        <div className="text-xs text-muted-foreground">Section {tutor.section_name}</div>
                    </td>
                    <td className="p-4">
                        <div className="font-medium text-primary">
                            {tutor.reg_number_start && tutor.reg_number_end ? 
                                `${tutor.reg_number_start} — ${tutor.reg_number_end}` : 
                                'All Students'
                            }
                        </div>
                    </td>
                    <td className="p-4 text-sm">
                        {tutor.assigned_at ? new Date(tutor.assigned_at).toLocaleDateString('en-GB') : 
                         tutor.created_at ? new Date(tutor.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="p-4 text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(tutor)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedTutors.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No active tutor assignments found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

        {/* Assign Tutor Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Class Tutor</DialogTitle>
                    <DialogDescription>Select a faculty member to enable as class in-charge.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Faculty Member</Label>
                        <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Faculty" />
                            </SelectTrigger>
                            <SelectContent>
                                {facultyList.map(f => (
                                    <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Batch</Label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                {batchList.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Section</Label>
                        <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedBatchId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionList.map(s => (
                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Student Range Start (Optional)</Label>
                            <Input 
                                type="number"
                                placeholder="e.g., 1"
                                value={regStart}
                                onChange={(e) => setRegStart(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Student Range End (Optional)</Label>
                            <Input 
                                type="number"
                                placeholder="e.g., 30"
                                value={regEnd}
                                onChange={(e) => setRegEnd(e.target.value)}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Leave blank to assign all students in the selected batch and section.
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignTutor}>Assign</Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Revoke Assignment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove <strong>{selectedTutor?.faculty_name}</strong> as the tutor for {selectedTutor?.batch_name} - {selectedTutor?.section_name}?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete}>Revoke</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
