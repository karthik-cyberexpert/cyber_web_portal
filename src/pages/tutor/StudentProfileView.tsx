import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  TrendingUp,
  Award,
  AlertCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { toast } from 'sonner';

export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    }
  }, [id]);

  useEffect(() => {
    // Auto-open alert dialog if sendAlert query param is present
    if (searchParams.get('sendAlert') === 'true' && student) {
      setShowAlertDialog(true);
    }
  }, [searchParams, student]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch student from tutor's class
      const res = await fetch(`${API_BASE_URL}/tutors/class`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const studentData = data.students?.find((s: any) => String(s.id) === String(id));
        if (studentData) {
          setStudent(studentData);
        } else {
          toast.error('Student not found in your class');
          navigate('/tutor/class');
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!alertTitle.trim() || !alertMessage.trim()) {
      toast.error('Please provide both title and message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/circulars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: alertTitle,
          content: alertMessage,
          target_role: 'student',
          target_student_id: student.id // Send to specific student
        })
      });

      if (res.ok) {
        toast.success(`Alert sent to ${student.name}`);
        setShowAlertDialog(false);
        setAlertTitle('');
        setAlertMessage('');
      } else {
        toast.error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground">Loading student profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <Button onClick={() => navigate('/tutor/class')} className="mt-4">
          Back to Class
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/tutor/class')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Class
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowAlertDialog(true)}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Send Alert
        </Button>
      </div>

      {/* Student Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {student.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Roll: {student.rollNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>Register: {student.registerNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={student.attendance >= 75 ? 'default' : 'destructive'}>
                    {student.attendance >= 75 ? 'Active' : 'Low Attendance'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Attendance</p>
              <p className="text-2xl font-bold">{student.attendance}%</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">CGPA</p>
              <p className="text-2xl font-bold">{student.cgpa || '0.00'}</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Certifications</p>
              <p className="text-2xl font-bold">{student.certifications || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Details Section */}
      <Card className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6">Student Details</h2>
        <Separator className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Full Name</p>
            <p className="font-medium">{student.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email Address</p>
            <p className="font-medium">{student.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
            <p className="font-medium">{student.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Register Number</p>
            <p className="font-medium">{student.registerNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
            <p className="font-medium">{student.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
            <p className="font-medium">{student.dob || 'Not provided'}</p>
          </div>
        </div>
      </Card>

      {/* Send Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Alert to {student.name}</DialogTitle>
            <DialogDescription>
              This will send a circular notification directly to this student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="alertTitle">Alert Title</Label>
              <Input
                id="alertTitle"
                placeholder="e.g., Attendance Warning"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="alertMessage">Message</Label>
              <Textarea
                id="alertMessage"
                placeholder="Enter your message here..."
                rows={5}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAlertDialog(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendAlert}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
