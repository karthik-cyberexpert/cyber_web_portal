import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  FileText,
  Eye
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Student detail dialog states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [selectedStudentSubject, setSelectedStudentSubject] = useState('');
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'faculty') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First get all subject allocations for this faculty
      const allocRes = await fetch('http://localhost:3007/api/class-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (allocRes.ok) {
        const allocData = await allocRes.json();
        setAllocations(allocData);
        
        console.log('Allocations loaded:', allocData.length);
        
        // Load ALL students from all sections by default
        if (allocData.length > 0) {
          const allStudentsPromises = allocData.map((alloc: any) =>
            fetch(`http://localhost:3007/api/faculty-students/${alloc.allocation_id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : [])
          );
          
          const studentsArrays = await Promise.all(allStudentsPromises);
          const uniqueStudents = Array.from(
            new Map(studentsArrays.flat().map((s: any) => [s.id, s])).values()
          );
          
          console.log('Total students loaded:', uniqueStudents.length);
          setStudents(uniqueStudents as any[]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsForAllocation = async (allocationId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3007/api/faculty-students/${allocationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // When subject filter changes, load students for that allocation
  useEffect(() => {
    if (selectedSubject !== 'all') {
      const allocation = allocations.find(a => a.allocation_id === parseInt(selectedSubject));
      if (allocation) {
        loadStudentsForAllocation(allocation.allocation_id);
      }
    } else if (allocations.length > 0) {
      // Load all students from all allocations
      loadAllStudents();
    }
  }, [selectedSubject]);

  const loadAllStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const allStudentsPromises = allocations.map(alloc =>
        fetch(`http://localhost:3007/api/faculty-students/${alloc.allocation_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : [])
      );
      
      const studentsArrays = await Promise.all(allStudentsPromises);
      // Flatten and deduplicate by student ID
      const uniqueStudents = Array.from(
        new Map(studentsArrays.flat().map(s => [s.id, s])).values()
      );
      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error loading all students:', error);
    }
  };

  const uniqueBatches = Array.from(new Set(allocations.map(a => a.batch_name))).sort();
  const uniqueSections = Array.from(new Set(allocations.map(a => a.section_name))).sort();

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.register_number?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [students, searchQuery]);

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    setStudentDetailsLoading(true);
    
    try {
      // Get all subjects this faculty teaches to this student's section
      const studentSubjectsForFaculty = allocations.filter(
        alloc => alloc.section_id === student.section_id
      );
      
      setStudentSubjects(studentSubjectsForFaculty);
      
      // Auto-select first subject
      if (studentSubjectsForFaculty.length > 0) {
        setSelectedStudentSubject(String(studentSubjectsForFaculty[0].allocation_id));
      }
    } catch (error) {
      console.error('Error loading student subjects:', error);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground mt-1">View and manage student academic details</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
            </Button>
        </div>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or register number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allocations.map(alloc => (
                  <SelectItem key={alloc.allocation_id} value={String(alloc.allocation_id)}>
                    {alloc.subject_name} - {alloc.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">S.No</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Register Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead className="text-center w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                        <p className="font-medium">{student.name}</p>
                    </TableCell>
                    <TableCell className="font-mono">{student.register_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${student.attendance_percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.attendance_percentage}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No students found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6 mt-4">
              {/* Student Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Register Number</p>
                  <p className="font-semibold font-mono">{selectedStudent.register_number}</p>
                </div>
              </div>

              {/* Subject Selector (if multiple subjects) */}
              {studentSubjects.length > 1 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Select Subject</p>
                  <Select value={selectedStudentSubject} onValueChange={setSelectedStudentSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentSubjects.map(subject => (
                        <SelectItem key={subject.allocation_id} value={String(subject.allocation_id)}>
                          {subject.subject_name} ({subject.subject_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Current Subject Display (if only one subject) */}
              {studentSubjects.length === 1 && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-semibold">
                    {studentSubjects[0].subject_name} ({studentSubjects[0].subject_code})
                  </p>
                </div>
              )}

              {/* Academic Performance */}
              <div>
                <h3 className="font-semibold mb-3">Academic Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                    <p className={`text-2xl font-bold ${selectedStudent.attendance_percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedStudent.attendance_percentage}%
                    </p>
                  </Card>
                  
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Internal</p>
                    <p className="text-2xl font-bold">TBA</p>
                  </Card>
                </div>
              </div>

              {/* Internal Marks Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Internal Assessment Marks</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">CIA 1</p>
                    <p className="text-lg font-bold">-</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">CIA 2</p>
                    <p className="text-lg font-bold">-</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">CIA 3</p>
                    <p className="text-lg font-bold">-</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="text-lg font-bold">-</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Assignment</p>
                    <p className="text-lg font-bold">-</p>
                  </Card>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic text-center">
                * Marks data will be available after assessments are graded
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
