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
  getStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent 
} from '@/lib/data-store';
import { StatCard } from '@/components/dashboard/StatCards';
import { getData, BATCHES_KEY } from '@/lib/data-store';

const ITEMS_PER_PAGE = 10;

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  
  // Bulk Upload State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

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
      filtered = filtered.filter(s => s.batch === batchFilter);
    }

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(s => s.section === sectionFilter);
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

  const batches = [...new Set(students.map(s => s.batch))];
  const sections = [...new Set(students.map(s => s.section))];

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    graduated: students.filter(s => s.status === 'Graduated').length,
    onLeave: students.filter(s => s.status === 'On Leave').length,
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      rollNumber: '',
      batch: batches.length > 0 ? batches[0] : '2024-2028',
      year: 1,
      semester: 1,
      section: 'A',
      enrollmentType: 'Regular',
      admissionType: 'Government',
      status: 'Active',
      dateOfBirth: '',
      address: '',
      guardianName: '',
      guardianPhone: '',
      attendance: 100,
      cgpa: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData(student);
    setIsEditModalOpen(true);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const submitAdd = () => {
    if (!formData.name || !formData.rollNumber || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newStudent = addStudent({
      ...formData as Omit<Student, 'id' | 'createdAt'>,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
    });
    
    setStudents(prev => [...prev, newStudent]);
    setIsAddModalOpen(false);
    toast.success('Student added successfully!');
  };

  const submitEdit = () => {
    if (!selectedStudent) return;
    
    const updated = updateStudent(selectedStudent.id, formData);
    if (updated) {
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      setIsEditModalOpen(false);
      toast.success('Student updated successfully!');
    }
  };

  const confirmDelete = () => {
    if (!selectedStudent) return;
    
    if (deleteStudent(selectedStudent.id)) {
      setStudents(prev => prev.filter(s => s.id !== selectedStudent.id));
      setIsDeleteModalOpen(false);
      toast.success('Student deleted successfully!');
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

        data.forEach((row: any) => {
          // Basic validation
          if (!row['Full Name'] || !row['Roll Number'] || !row['Email']) {
            errorCount++;
            return;
          }

          addStudent({
            name: row['Full Name'],
            rollNumber: row['Roll Number'],
            email: row['Email'],
            phone: row['Phone'] || '',
            batch: row['Batch'] || '2024-2028',
            section: row['Section'] || 'A',
            year: 1, // Defaulting, could be calculated or added to template
            semester: 1,
            enrollmentType: 'Regular',
            admissionType: 'Government',
            status: 'Active',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${row['Full Name']}`,
            dateOfBirth: '',
            address: '',
            guardianName: row['Guardian Name'] || '',
            guardianPhone: row['Guardian Phone'] || '',
            attendance: 0,
            cgpa: 0,
            programme: 'B.Tech',
            class: '1st Year',
            backlogs: 0,
            gender: row['Gender'] || 'Not Specified',
            bloodGroup: '',
            nationality: 'Indian',
            semesterHistory: [],
          });
          addedCount++;
        });

        setStudents(getStudents()); // Refresh list
        toast.success(`Successfully added ${addedCount} students. ${errorCount > 0 ? `${errorCount} entries failed due to missing data.` : ''}`);
        setIsBulkUploadModalOpen(false);
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
              {batches.map(batch => (
                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map(section => (
                <SelectItem key={section} value={section}>Section {section}</SelectItem>
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
                      {batches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                      {batches.length === 0 && (
                        <>
                          <SelectItem value="2024-2028">2024-2028</SelectItem>
                          <SelectItem value="2023-2027">2023-2027</SelectItem>
                          <SelectItem value="2022-2026">2022-2026</SelectItem>
                          <SelectItem value="2021-2025">2021-2025</SelectItem>
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
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
