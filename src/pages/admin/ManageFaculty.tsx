import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
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
  BookOpen,
  Users,
  UserCheck,
  GraduationCap,
  Upload,
  FileSpreadsheet,
  KeyRound
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
import { useAuth } from '@/contexts/AuthContext';
import { DatePicker } from '@/components/ui/date-picker';
import { API_BASE_URL } from '@/lib/api-config';
import { StatCard } from '@/components/dashboard/StatCards';

const ITEMS_PER_PAGE = 10;

// Define interfaces locally since we removed data-store
interface Faculty {
  id: number;
  name: string;
  email: string;
  phone: string;
  employeeId: string; // Mapping from employee_id or custom
  designation?: string;
  qualification: string;
  specialization: string;
  department: string;
  experience: number;
  subjects: string[];
  sections: string[];
  status: 'Active' | 'On Leave' | 'Resigned';
  avatar: string;
  dateOfJoining: string;
  address: string;
}

export default function ManageFaculty() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<Partial<Faculty>>({});
  
  // Bulk Upload State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/faculty`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Transform data if needed
            // DB returns: id, name, email, phone, avatar_url, role, designation, qualification, specialization, experience, joining_date, address
            const transformed = data.map((f: any) => ({
                id: f.id,
                name: f.name,
                email: f.email,
                phone: f.phone,
                employeeId: f.employee_id || 'N/A',
                qualification: f.qualification || '',
                specialization: f.specialization || '',
                department: f.department || '', // Mapped from d.name
                experience: f.experience || 0,
                subjects: [], // Fetching subjects handled separately or not yet supported in this view
                sections: [],
                status: 'Active', // Mock status for now as DB doesn't have it in users table? Or add it.
                avatar: f.avatar_url || '',
                dateOfJoining: f.joining_date || '',
                address: f.address || ''
            }));
            setFaculty(transformed);
        } else {
             toast.error('Failed to fetch faculty');
        }
    } catch (error) {
        toast.error('Network error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    let filtered = faculty;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.employeeId.toLowerCase().includes(term) ||
        f.email.toLowerCase().includes(term) ||
        f.specialization.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    setFilteredFaculty(filtered);
    setCurrentPage(1);
  }, [faculty, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredFaculty.length / ITEMS_PER_PAGE);
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = {
    total: faculty.length,
    active: faculty.filter(f => f.status === 'Active').length,
    onLeave: faculty.filter(f => f.status === 'On Leave').length,
    resigned: faculty.filter(f => f.status === 'Resigned').length,
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      designation: '',
      qualification: '',
      specialization: '',
      department: '',
      experience: 0,
      subjects: [],
      sections: [],
      status: 'Active',
      dateOfJoining: '',
      address: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (member: Faculty) => {
    setSelectedFaculty(member);
    setFormData({
      ...member,
      dateOfJoining: member.dateOfJoining ? member.dateOfJoining.split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleView = (member: Faculty) => {
    setSelectedFaculty(member);
    setIsViewModalOpen(true);
  };

  const handleDelete = (member: Faculty) => {
    setSelectedFaculty(member);
    setIsDeleteModalOpen(true);
  };

  const submitAdd = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/admin/faculty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...formData,
                phone: formData.phone || '',
                // other fields...
            })
        });

        if (res.ok) {
            toast.success('Faculty member added successfully!');
            setIsAddModalOpen(false);
            fetchData();
        } else {
            const err = await res.json();
            toast.error(err.message || 'Failed to add faculty');
        }
    } catch (error) {
        toast.error('Network error');
    }
  };

  const submitEdit = async () => {
    if (!selectedFaculty) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/admin/faculty/${selectedFaculty.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            toast.success('Faculty updated successfully!');
            setIsEditModalOpen(false);
            fetchData();
        } else {
             const err = await res.json();
             toast.error(err.message || 'Failed to update');
        }
    } catch (error) {
        toast.error('Network error');
    }
  };

  const confirmDelete = async () => {
    if (!selectedFaculty) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/admin/faculty/${selectedFaculty.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success('Faculty member deleted successfully!');
            setIsDeleteModalOpen(false);
            fetchData();
        } else {
            toast.error('Failed to delete');
        }
    } catch (error) {
         toast.error('Network error');
    }
  };

  const handleResetPassword = async (member: Faculty) => {
    if (!confirm(`Reset password for ${member.name}? This will set their password to the default and require them to create a new one on login.`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reset-password/${member.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success(`Password reset for ${member.name}. They will need to set a new password on next login.`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      toast.error('Network error');
    }
  };

  const getStatusBadge = (status: Faculty['status']) => {
    const styles = {
      Active: 'bg-green-100 text-green-700 border-green-200',
      'On Leave': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Resigned: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status] || styles.Active;
  };



  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Full Name': 'Dr. Jane Smith',
        'Employee ID': 'EMP001',
        'Email': 'jane.smith@college.edu',
        'Phone': '9876543210',
        'Qualification': 'Ph.D in AI',
        'Specialization': 'Artificial Intelligence',
        'Experience': 5,
        'Date of Joining': '2023-01-15',
        'Address': '123 College St, City'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty");
    XLSX.writeFile(wb, "faculty_upload_template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let addedCount = 0;
        let errorCount = 0;

        // Process sequentially to avoid overwhelming server or just parallelize with Promise.all
        // For better error handling, sequential or chunked is better.
        for (const row of data as any[]) {
             if (!row['Full Name'] || !row['Email']) {
                 errorCount++;
                 continue;
             }

             try {
                 const res = await fetch(`${API_BASE_URL}/admin/faculty`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: row['Full Name'],
                        employeeId: row['Employee ID'] || '',
                        email: row['Email'],
                        phone: row['Phone'] || '',
                        qualification: row['Qualification'] || '',
                        specialization: row['Specialization'] || '',
                        experience: Number(row['Experience']) || 0,
                        dateOfJoining: row['Date of Joining'] || new Date().toISOString().split('T')[0],
                        address: row['Address'] || ''
                    })
                 });

                 if (res.ok) {
                     addedCount++;
                 } else {
                     errorCount++;
                 }
             } catch (err) {
                 errorCount++;
             }
        }

        fetchData(); // Refresh list
        toast.success(`Upload complete. Added: ${addedCount}, Failed: ${errorCount}`);
        setIsBulkUploadModalOpen(false);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Failed to parse the file.");
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
          <h1 className="text-3xl font-bold">Manage Faculty</h1>
          <p className="text-muted-foreground">View and manage department faculty members</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gradient" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
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
          title="Total Faculty"
          value={stats.total}
          icon={Users}
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
          title="On Leave"
          value={stats.onLeave}
          icon={BookOpen}
          variant="warning"
          delay={0.3}
        />
        <StatCard
          title="Resigned"
          value={stats.resigned}
          icon={GraduationCap}
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
              placeholder="Search by name, employee ID, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Designation Filter Removed */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Resigned">Resigned</SelectItem>
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
                <th className="text-left p-4 font-semibold text-sm">Faculty</th>
                <th className="text-left p-4 font-semibold text-sm">Employee ID</th>
                <th className="text-left p-4 font-semibold text-sm">Qualification</th>
                <th className="text-left p-4 font-semibold text-sm">Specialization</th>
                <th className="text-left p-4 font-semibold text-sm">Experience</th>
                <th className="text-left p-4 font-semibold text-sm">Status</th>
                <th className="text-left p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginatedFaculty.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{member.employeeId}</td>
                    <td className="p-4 text-sm">{member.qualification}</td>
                    <td className="p-4 text-sm">{member.specialization}</td>
                    <td className="p-4 text-sm">{member.experience} years</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(member)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(member)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(member)}
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
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFaculty.length)} of {filteredFaculty.length} faculty
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
            <DialogTitle>{isAddModalOpen ? 'Add New Faculty' : 'Edit Faculty'}</DialogTitle>
            <DialogDescription>
              {isAddModalOpen ? 'Enter the details of the new faculty member' : 'Update faculty information'}
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
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g., EMP0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@college.edu"
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
            {/* Designation Input Removed */}
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., Ph.D in Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Assistant Professor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({...formData, department: v})}
              >
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Machine Learning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience || 0}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                placeholder="Years of experience"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status || 'Active'} 
                onValueChange={(v) => setFormData({ ...formData, status: v as Faculty['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <DatePicker 
                date={formData.dateOfJoining ? new Date(formData.dateOfJoining) : undefined}
                onChange={date => setFormData({ ...formData, dateOfJoining: date ? format(date, "yyyy-MM-dd") : '' })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={isAddModalOpen ? submitAdd : submitEdit}>
              {isAddModalOpen ? 'Add Faculty' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Faculty Details</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedFaculty.avatar}
                  alt={selectedFaculty.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/20"
                />
                <div>
                  <h3 className="text-2xl font-bold">{selectedFaculty.name}</h3>
                  <p className="text-muted-foreground">{selectedFaculty.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{selectedFaculty.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedFaculty.phone}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium text-sm">{selectedFaculty.qualification}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedFaculty.specialization}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-bold text-lg text-primary">{selectedFaculty.experience} years</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedFaculty.status)}`}>
                    {selectedFaculty.status}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Subjects Handled</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFaculty.subjects.map((subject, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
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
            <DialogTitle>Delete Faculty</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedFaculty?.name}</strong>? This action cannot be undone.
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
            <DialogTitle>Bulk Upload Faculty</DialogTitle>
            <DialogDescription>
              Upload an Excel file to add multiple faculty members at once.
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
                      <p className="text-sm text-muted-foreground">Use this format to import faculty</p>
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
