
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, GraduationCap } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { API_BASE_URL } from '@/lib/api-config';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-header';

interface Student {
  id: number;
  roll_number: string;
  register_number: string;
  name: string;
  current_semester: number;
  batch_name: string;
}

interface Batch {
  id: number;
  name: string;
}

export default function PromoteStudents() {
  const { token } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [targetSemester, setTargetSemester] = useState<string>('');
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch Batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/academic/batches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setBatches(data);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };
    fetchBatches();
  }, [token]);

  // Fetch Students when Batch Changes
  useEffect(() => {
    if (!selectedBatch) {
        setStudents([]);
        return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        // We might need a specific endpoint to get students by batch or filter existing one
        // For now using the main endpoint and filtering client-side or we can add query param
        const response = await fetch(`${API_BASE_URL}/students?batchId=${selectedBatch}`, {
             headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            // Data typically comes as full profile, map it to our interface
            // We need to ensure the backend returns `current_semester`. 
            // If it doesn't yet (before DB update), we might fallback or seeing issues.
            setStudents(data); 
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedBatch, token]);

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle Individual Select
  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  // Promote Function
  const handlePromote = async () => {
    if (!targetSemester) {
        setMessage({ type: 'error', text: 'Please select a target semester' });
        return;
    }
    if (selectedStudents.length === 0) {
        setMessage({ type: 'error', text: 'Please select at least one student' });
        return;
    }

    setPromoting(true);
    setMessage(null);

    try {
        const response = await fetch(`${API_BASE_URL}/students/promote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                studentIds: selectedStudents,
                targetSemester: parseInt(targetSemester)
            })
        });

        if (response.ok) {
            setMessage({ type: 'success', text: `Successfully promoted ${selectedStudents.length} students to Sem ${targetSemester}` });
            setSelectedStudents([]);
            setTargetSemester('');
            // Refresh table
            const currentBatch = selectedBatch;
            setSelectedBatch('');
            setTimeout(() => setSelectedBatch(currentBatch), 100); 
        } else {
            const error = await response.json();
            setMessage({ type: 'error', text: error.message || 'Failed to promote students' });
        }
    } catch (error) {
        setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
        setPromoting(false);
    }
  };

  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            Promote Students
        </h1>
        <p className="text-muted-foreground">Select students and promote them to the next semester.</p>
      </div>

      {/* Filter Section */}
      <div className="glass-card p-6 rounded-xl flex items-center gap-4">
        <div className="w-full sm:w-[300px]">
          <label className="text-sm font-medium mb-2 block">Select Batch</label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Select Batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map(batch => (
                <SelectItem key={batch.id} value={batch.id.toString()}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        {/* Action Bar - Only Visible when students are selected */}
        <AnimatePresence>
            {selectedStudents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-primary"
                >
                    <div className="flex items-center gap-4">
                         <span className="font-semibold text-primary">{selectedStudents.length} Students Selected</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={targetSemester} onValueChange={setTargetSemester}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Target Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <SelectItem key={sem} value={sem.toString()}>
                                        Semester {sem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button 
                            variant="gradient" 
                            disabled={!targetSemester || promoting}
                            onClick={handlePromote}
                        >
                            {promoting ? 'Promoting...' : 'Promote Selected'}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Message Alert */}
        {message && (
             <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-success/10 border-success text-success' : 'bg-destructive/10 border-destructive text-destructive'}`}>
                 <div className="flex items-center gap-2">
                     {message.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                     <p>{message.text}</p>
                 </div>
             </div>
        )}

      {/* Students Table */}
      {selectedBatch && (
        <div className="glass-card rounded-xl overflow-hidden">
             {loading ? (
                 <div className="p-8 text-center text-muted-foreground">Loading students...</div>
             ) : students.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground">No students found in this batch.</div>
             ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[80px]">S.No</TableHead>
                            <TableHead>Register Number</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Current Semester</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedStudents.includes(student.id)}
                                        onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-mono">{student.register_number}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.roll_number}</div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        Sem {student.current_semester || '?'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">Active</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             )}
        </div>
      )}
    </div>
  );
}
