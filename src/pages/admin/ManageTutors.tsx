import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users,
  UserCheck,
  GraduationCap,
  Calendar
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Tutor, 
  getTutors, 
  addTutor, 
  updateTutor, 
  deleteTutor,
  getFaculty,
  getData,
  BATCHES_KEY 
} from '@/lib/data-store';
import { StatCard } from '@/components/dashboard/StatCards';

const ITEMS_PER_PAGE = 10;

export default function ManageTutors() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [formData, setFormData] = useState<Partial<Tutor>>({});
  const [availableFaculty, setAvailableFaculty] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setTutors(getTutors());
    const faculty = getFaculty();
    setAvailableFaculty(faculty.map(f => ({ id: f.id, name: f.name })));
  }, []);

  useEffect(() => {
    let filtered = tutors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.batch.toLowerCase().includes(term)
      );
    }

    if (batchFilter !== 'all') {
      filtered = filtered.filter(t => t.batch === batchFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTutors(filtered);
    setCurrentPage(1);
  }, [tutors, searchTerm, batchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const paginatedTutors = filteredTutors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const batches = [...new Set(tutors.map(t => t.batch))];
  
  const stats = {
    total: tutors.length,
    active: tutors.filter(t => t.status === 'Active').length,
    totalStudents: tutors.reduce((acc, t) => acc + t.studentsCount, 0),
    batches: [...new Set(tutors.map(t => t.batch))].length,
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      facultyId: '',
      designation: 'Assistant Professor',
      batch: '2024-2028',
      section: 'A',
      studentsCount: 60,
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setFormData(tutor);
    setIsEditModalOpen(true);
  };

  const handleView = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsViewModalOpen(true);
  };

  const handleDelete = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setIsDeleteModalOpen(true);
  };

  const submitAdd = () => {
    if (!formData.name || !formData.email || !formData.batch) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newTutor = addTutor({
      ...formData as Omit<Tutor, 'id' | 'createdAt'>,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
    });
    
    setTutors(prev => [...prev, newTutor]);
    setIsAddModalOpen(false);
    toast.success('Tutor assigned successfully!');
  };

  const submitEdit = () => {
    if (!selectedTutor) return;
    
    const updated = updateTutor(selectedTutor.id, formData);
    if (updated) {
      setTutors(prev => prev.map(t => t.id === updated.id ? updated : t));
      setIsEditModalOpen(false);
      toast.success('Tutor updated successfully!');
    }
  };

  const confirmDelete = () => {
    if (!selectedTutor) return;
    
    if (deleteTutor(selectedTutor.id)) {
      setTutors(prev => prev.filter(t => t.id !== selectedTutor.id));
      setIsDeleteModalOpen(false);
      toast.success('Tutor removed successfully!');
    }
  };

  const getStatusBadge = (status: Tutor['status']) => {
    const styles = {
      Active: 'bg-success/10 text-success border-success/20',
      'On Leave': 'bg-warning/10 text-warning border-warning/20',
    };
    return styles[status] || styles.Active;
  };

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
          <p className="text-muted-foreground">Assign and manage class in-charges</p>
        </div>
        <Button variant="gradient" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Tutor
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tutors"
          value={stats.total}
          icon={Users}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Active Tutors"
          value={stats.active}
          icon={UserCheck}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Students Mentored"
          value={stats.totalStudents}
          icon={GraduationCap}
          variant="accent"
          delay={0.3}
        />
        <StatCard
          title="Batches Covered"
          value={stats.batches}
          icon={Calendar}
          variant="warning"
          delay={0.4}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(batch => (
                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Cards Grid for Tutors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence>
          {paginatedTutors.map((tutor, index) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h3 className="font-semibold">{tutor.name}</h3>
                    <p className="text-sm text-muted-foreground">{tutor.designation}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(tutor)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(tutor)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(tutor)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Class</span>
                  <span className="font-medium">CSE-{tutor.section}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Batch</span>
                  <span className="font-medium">{tutor.batch}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Students</span>
                  <span className="font-bold text-primary">{tutor.studentsCount}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(tutor.status)}`}>
                  {tutor.status}
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleView(tutor)}>
                  View Class
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAddModalOpen ? 'Assign New Tutor' : 'Edit Tutor Assignment'}</DialogTitle>
            <DialogDescription>
              {isAddModalOpen ? 'Assign a faculty member as class in-charge' : 'Update tutor assignment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Faculty *</Label>
              <Select 
                value={formData.facultyId || ''} 
                onValueChange={(v) => {
                  const faculty = availableFaculty.find(f => f.id === v);
                  setFormData({ 
                    ...formData, 
                    facultyId: v,
                    name: faculty?.name || '',
                    email: `${faculty?.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@college.edu` || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {availableFaculty.map(faculty => (
                    <SelectItem key={faculty.id} value={faculty.id}>{faculty.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch *</Label>
                <Select 
                  value={formData.batch || '2024-2028'} 
                  onValueChange={(v) => setFormData({ ...formData, batch: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getData<any>(BATCHES_KEY).map((b: any) => (
                      <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                    ))}
                    {/* Fallback if store is empty */}
                    {getData<any>(BATCHES_KEY).length === 0 && (
                      <>
                        <SelectItem value="2021-2025">2021-2025</SelectItem>
                        <SelectItem value="2022-2026">2022-2026</SelectItem>
                        <SelectItem value="2023-2027">2023-2027</SelectItem>
                        <SelectItem value="2024-2028">2024-2028</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section *</Label>
                <Select 
                  value={formData.section || 'A'} 
                  onValueChange={(v) => setFormData({ ...formData, section: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentsCount">Number of Students</Label>
              <Input
                id="studentsCount"
                type="number"
                value={formData.studentsCount || 60}
                onChange={(e) => setFormData({ ...formData, studentsCount: parseInt(e.target.value) || 60 })}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status || 'Active'} 
                onValueChange={(v) => setFormData({ ...formData, status: v as Tutor['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={isAddModalOpen ? submitAdd : submitEdit}>
              {isAddModalOpen ? 'Assign Tutor' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
          </DialogHeader>
          {selectedTutor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTutor.avatar}
                  alt={selectedTutor.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20"
                />
                <div>
                  <h3 className="text-2xl font-bold">{selectedTutor.name}</h3>
                  <p className="text-muted-foreground">{selectedTutor.designation}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedTutor.status)}`}>
                    {selectedTutor.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{selectedTutor.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedTutor.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Assigned Class</p>
                  <p className="font-bold text-lg text-primary">CSE-{selectedTutor.section}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-bold text-lg">{selectedTutor.batch}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-primary text-white col-span-2">
                  <p className="text-sm opacity-80">Total Students Under Mentorship</p>
                  <p className="font-bold text-3xl">{selectedTutor.studentsCount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Tutor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedTutor?.name}</strong> as tutor for CSE-{selectedTutor?.section}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
