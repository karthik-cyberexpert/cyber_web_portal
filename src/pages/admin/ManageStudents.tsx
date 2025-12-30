import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Trash2, 
  Edit2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  GraduationCap,
  Users,
  UserCheck,
  AlertCircle,
  X,
  Lock,
  Upload, 
  FileSpreadsheet
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
  Student, 
  // Removing local store functions
} from '@/lib/data-store';
import { API_BASE_URL } from '@/lib/api-config';
// ... existing imports ...
import { StatCard } from '@/components/dashboard/StatCards';

// Define API Interfaces locally or map to existing Student
interface ApiStudent {
    id: number;
    name: string;
    email: string;
    phone: string;
    roll_number: string;
    register_number: string;
    batch_name: string;
    section_name: string;
    batch_id?: number;
    section_id?: number;
    avatar_url?: string;
}

const ITEMS_PER_PAGE = 10;

interface LocalStudent extends Student {
    batchId?: number;
    sectionId?: number;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<LocalStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<LocalStudent[]>([]);
  const [batches, setBatches] = useState<any[]>([]); // New State for Batches
  const [sections, setSections] = useState<any[]>([]); // New State for Sections
  
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<LocalStudent | null>(null);
  const [formData, setFormData] = useState<any>({}); // Relaxed type for form data

  
  // Bulk Upload State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };

          // 1. Fetch Students
          const resStudents = await fetch(`${API_BASE_URL}/students`, { headers });
          if (resStudents.ok) {
              const data = await resStudents.json();
              // Map API data to Frontend Interface
              const mappedStudents: LocalStudent[] = data.map((s: any) => ({
                  id: s.id.toString(),
                  name: s.name,
                  rollNumber: s.roll_number,
                  regNumber: s.register_number,
                  email: s.email,
                  phone: s.phone,
                  batch: s.batch_name || 'N/A',
                  batchId: s.batch_id, // Map batch ID
                  section: s.section_name || 'N/A',
                  sectionId: s.section_id, // Map section ID
                  status: 'Active', 
                  attendance: 0,
                  cgpa: 0,
                  avatar: s.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`
              }));
              setStudents(mappedStudents);
          }

          // 2. Fetch Batches for Filter/Dropdown
          const resBatches = await fetch(`${API_BASE_URL}/academic/batches`, { headers });
          if (resBatches.ok) {
              const data = await resBatches.json();
              setBatches(data);
          }

      } catch (error) {
          console.error("Failed to fetch data", error);
          toast.error("Failed to load data");
      }
  };

  // Fetch sections when batch filter changes
  useEffect(() => {
    const fetchSections = async () => {
      if (batchFilter !== 'all') {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchFilter}/sections`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSections(data);
          } else {
             setSections([]); // Reset if fetch fails
          }
        } catch (error) {
          console.error("Failed to fetch sections", error);
          setSections([]);
        }
      } else {
        setSections([]); // Clear sections if no batch selected
      }
    };
    fetchSections();
  }, [batchFilter]);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.rollNumber.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }

    if (batchFilter !== 'all') {
      // Filter by Batch ID (ensure type match)
      filtered = filtered.filter(s => s.batchId === Number(batchFilter));
    }

    if (sectionFilter !== 'all') {
      // Filter by Section ID
       filtered = filtered.filter(s => s.sectionId === Number(sectionFilter));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchTerm, batchFilter, sectionFilter, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );



  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    graduated: students.filter(s => s.status === 'Graduated').length,
    onLeave: students.filter(s => s.status === 'On Leave').length,
  };

  const [formSections, setFormSections] = useState<any[]>([]); // Sections for the Add/Edit Modal

  const handleAdd = () => {
    // Default to first batch ID if available
    const defaultBatchId = batches.length > 0 ? batches[0].id : ''; 
    setFormData({
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      batch: defaultBatchId, 
      section: '', // Will be set after fetching sections or user selection
      enrollmentType: 'Regular',
      admissionType: 'Government',
      status: 'Active',
      dateOfBirth: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
    });
    // Trigger section fetch for default batch if exists
    if (defaultBatchId) {
        handleFormBatchChange(defaultBatchId, true); // true = isInit
    }
    setIsAddModalOpen(true);
  };

  const handleFormBatchChange = async (batchId: string, isInit = false) => {
      // Update form data (skip if init as it's already set)
      if (!isInit) {
          setFormData(prev => ({ ...prev, batch: batchId, section: '' }));
      }
      
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/academic/batches/${batchId}/sections`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setFormSections(data);
              // Default to first section if available
              if (data.length > 0) {
                   setFormData(prev => ({ ...prev, section: data[0].id }));
              }
          } else {
              setFormSections([]);
          }
      } catch (error) {
          console.error("Failed to fetch form sections", error);
          setFormSections([]);
      }
  };

  const handleEdit = (student: LocalStudent) => {
    setSelectedStudent(student);
    // Student object uses names for display, need to use IDs for form if available
    // OR map back. Since we added batchId/sectionId to student object earlier:
    setFormData({
        ...student,
        batch: student.batchId,
        section: student.sectionId
    });
    // Fetch sections for this batch so the dropdown works
    if (student.batchId) {
        handleFormBatchChange(student.batchId.toString(), true);
    }
    setIsEditModalOpen(true);
  };

  const handleView = (student: LocalStudent) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDelete = (student: LocalStudent) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const submitAdd = async () => {
    if (!formData.name || !formData.email || !formData.rollNumber) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roll_number: formData.rollNumber,
        register_number: formData.regNumber || '',
        batch_id: formData.batch, 
        section_id: formData.section,
        dob: formData.dateOfBirth || '2000-01-01',
        gender: formData.gender || 'Other'
      };

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Student added successfully!');
        setIsAddModalOpen(false);
        fetchData(); // Reload list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add student');
      }
    } catch (error) {
      console.error('Add Student Error:', error);
      toast.error('Network error');
    }
  };

  const submitEdit = async () => {
    if (!selectedStudent) return;
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        phone: formData.phone,
        roll_number: formData.rollNumber,
        batch_id: formData.batch, // IDs are now stored
        section_id: formData.section
      };

      const response = await fetch(`${API_BASE_URL}/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Student updated successfully!');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        toast.error('Failed to update student');
      }
    } catch (error) {
       console.error('Update Error:', error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/students/${selectedStudent.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Student deleted successfully!');
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        toast.error('Failed to delete student');
      }
    } catch (error) {
       console.error('Delete Error:', error);
    }
  };

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      Active: 'bg-success/10 text-success border-success/20',
      Graduated: 'bg-info/10 text-info border-info/20',
      Dismissed: 'bg-destructive/10 text-destructive border-destructive/20',
      'On Leave': 'bg-warning/10 text-warning border-warning/20',
    };
    return styles[status] || styles.Active;
    return styles[status] || styles.Active;
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Full Name': 'John Doe',
        'Roll Number': '21CSE101',
        'Email': 'john.doe@college.edu',
        'Phone': '9876543210',
        'Batch': '2024-2028',
        'Section': 'A',
        'Gender': 'Male',
        'Guardian Name': 'Robert Doe',
        'Guardian Phone': '9876543211'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_upload_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let addedCount = 0;
        let errorCount = 0;

        // Process in chunks or sequentially
        const uploadStudents = async () => {
             for (const row of data as any[]) {
                // Basic validation
                if (!row['Full Name'] || !row['Roll Number'] || !row['Email']) {
                  errorCount++;
                  continue;
                }

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE_URL}/students`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: row['Full Name'],
                            roll_number: row['Roll Number'],
                            email: row['Email'],
                            phone: row['Phone'] || '',
                            batch_id: row['Batch ID'] || 1, // Validation needed for ID vs Name
                            section_id: row['Section ID'] || 1, // Validation needed
                            dob: '2000-01-01', // Default
                            gender: row['Gender'] || 'Not Specified',
                            // Add other fields as necessary mapped from Excel
                        })
                    });
                    
                    if (res.ok) addedCount++;
                    else errorCount++;
                } catch (e) {
                    errorCount++;
                }
             }
             
             setIsUploading(false);
             if (fileInputRef.current) fileInputRef.current.value = '';
             fetchData();
             toast.success(`Upload complete. Added: ${addedCount}, Failed: ${errorCount}`);
             setIsBulkUploadModalOpen(false);
        };
        
        uploadStudents();
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Failed to parse the file. Please check the format.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
           fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsBinaryString(file);
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
          <h1 className="text-3xl font-bold">Manage Students</h1>
          <p className="text-muted-foreground">View and manage all enrolled students</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
          <Button 
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 border-0"
            onClick={() => setIsBulkUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={GraduationCap}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={UserCheck}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Graduated"
          value={stats.graduated}
          icon={Users}
          variant="info"
          delay={0.3}
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon={AlertCircle}
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
              placeholder="Search by name, roll number, or email..."
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
              {batches.map((batch: any) => (
                <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section: any) => (
                <SelectItem key={section.id} value={section.id.toString()}>Section {section.name}</SelectItem>
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
              <SelectItem value="Graduated">Graduated</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold text-sm">Student</th>
                <th className="text-left p-4 font-semibold text-sm">Roll Number</th>
                <th className="text-left p-4 font-semibold text-sm">Batch</th>
                <th className="text-left p-4 font-semibold text-sm">Section</th>
                <th className="text-left p-4 font-semibold text-sm">Attendance</th>
                <th className="text-left p-4 font-semibold text-sm">CGPA</th>
                <th className="text-left p-4 font-semibold text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{student.rollNumber}</td>
                    <td className="p-4 text-sm">{student.batch}</td>
                    <td className="p-4 text-sm">CSE-{student.section}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.attendance >= 75 ? 'bg-success' : 'bg-destructive'
                            }`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm">{student.attendance}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${
                        student.cgpa >= 8 ? 'text-success' : 
                        student.cgpa >= 6 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {student.cgpa}
                      </span>
                    </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(student.status)}`}>
                            {student.status}
                          </span>
                          {student.status === 'Graduated' && (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </td>

                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(student)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(student)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(student)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddModalOpen ? 'Add New Student' : 'Edit Student'}</DialogTitle>
            <DialogDescription>
              {isAddModalOpen ? 'Enter the details of the new student' : 'Update the student information'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber || ''}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g., 21CSE001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@college.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select 
                value={formData.batch ? formData.batch.toString() : ''} 
                onValueChange={(v) => handleFormBatchChange(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select 
                value={formData.section ? formData.section.toString() : ''} 
                onValueChange={(v) => setFormData({ ...formData, section: v })}
                disabled={!formSections.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {formSections.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>Section {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Enrollment Type</Label>
              <Select 
                value={formData.enrollmentType || 'Regular'} 
                onValueChange={(v) => setFormData({ ...formData, enrollmentType: v as Student['enrollmentType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Lateral">Lateral Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Admission Type</Label>
              <Select 
                value={formData.admissionType || 'Government'} 
                onValueChange={(v) => setFormData({ ...formData, admissionType: v as Student['admissionType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="NRI">NRI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status || 'Active'} 
                onValueChange={(v) => setFormData({ ...formData, status: v as Student['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Graduated">Graduated</SelectItem>
                  <SelectItem value="Dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName || ''}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent/Guardian name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone || ''}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+91 9876543210"
              />
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
              {isAddModalOpen ? 'Add Student' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20"
                />
                <div>
                  <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.rollNumber}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedStudent.status)}`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStudent.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-medium">{selectedStudent.batch}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">CSE-{selectedStudent.section}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Year / Semester</p>
                  <p className="font-medium">Year {selectedStudent.year} / Sem {selectedStudent.semester}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Enrollment</p>
                  <p className="font-medium">{selectedStudent.enrollmentType}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className={`font-bold text-lg ${selectedStudent.attendance >= 75 ? 'text-success' : 'text-destructive'}`}>
                    {selectedStudent.attendance}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className={`font-bold text-lg ${
                    selectedStudent.cgpa >= 8 ? 'text-success' : 
                    selectedStudent.cgpa >= 6 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {selectedStudent.cgpa}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Guardian</p>
                  <p className="font-medium">{selectedStudent.guardianName}</p>
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
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedStudent?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Upload Modal */}
      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Students</DialogTitle>
            <DialogDescription>
              Upload an Excel file to add multiple students at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
             <div className="flex flex-col gap-4">
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Download Template</p>
                      <p className="text-sm text-muted-foreground">Use this format to import students</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    Download
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center space-y-4 hover:bg-muted/50 transition-colors">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                     <p className="font-medium">Click to upload or drag and drop</p>
                     <p className="text-sm text-muted-foreground">XLSX files only</p>
                  </div>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".xlsx, .xls"
                    className="hidden" 
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Label 
                    htmlFor="file-upload" 
                    className={`inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {isUploading ? 'Uploading...' : 'Select File'}
                  </Label>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
