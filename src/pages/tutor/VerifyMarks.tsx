import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  CheckCircle, 
  AlertCircle, 
  User, 
  BookOpen, 
  Search,
  ArrowRight,
  Filter,
  CheckCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { Users } from 'lucide-react';

export default function VerifyMarks() {
  const { user } = useAuth();
  const [tutor, setTutor] = useState<any | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    completion: 0
  });
  const [selectedExam, setSelectedExam] = useState('ia1');

  useEffect(() => {
    fetchVerifications();
  }, [user]);

  const fetchVerifications = async () => {
    if (!user) return;
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/verification-status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setVerifications(data);
            
            // Stats
            const total = data.length;
            const pending = data.filter((v: any) => v.markStatus === 'pending_tutor').length;
            const verified = total - pending;
            setStats({
                total,
                pending,
                verified,
                completion: total > 0 ? Math.round((verified / total) * 100) : 0
            });
        }
    } catch (error) {
        console.error("Fetch Verifications Error", error);
    }
  };

  const handleVerify = async (v: any) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/marks/verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                scheduleId: v.scheduleId,
                sectionId: v.sectionId,
                subjectCode: v.subjectCode
            })
        });

        if (res.ok) {
            toast.success("Marks Verified and forwarded to Admin.");
            fetchVerifications();
        } else {
            toast.error("Failed to verify marks");
        }
    } catch (error) {
        toast.error("Network error");
    }
  };

  const filteredVerifications = verifications.filter(v => v.examType === selectedExam);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Internal Marks Verification 📝</h1>
          <p className="text-muted-foreground font-medium">Verify class marks submitted by subject teachers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest italic">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
            Consolidated
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic">
            <CheckCheck className="w-4 h-4 mr-2" />
            Verify All
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subjects', value: stats.total.toString(), icon: BookOpen, color: 'primary' },
          { label: 'Pending', value: stats.pending.toString(), icon: AlertCircle, color: 'warning' },
          { label: 'Verified', value: stats.verified.toString(), icon: CheckCircle, color: 'success' },
          { label: 'Completion', value: `${stats.completion}%`, icon: ClipboardCheck, color: 'accent' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl border-none shadow-xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center shadow-glow shadow-${stat.color}/20 transition-transform group-hover:scale-110`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black italic tracking-tight uppercase">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-none shadow-2xl bg-white/[0.02]">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl w-full md:w-auto">
            <Button variant="ghost" size="sm" className="rounded-xl bg-background shadow-sm font-black uppercase text-[9px] tracking-widest italic px-4">Odd Sem</Button>
            <Button variant="ghost" size="sm" className="rounded-xl font-black uppercase text-[9px] tracking-widest italic px-4">Even Sem</Button>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest italic">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                <SelectItem value="ia1" className="font-bold cursor-pointer">Internal Assessment 1</SelectItem>
                <SelectItem value="ia2" className="font-bold cursor-pointer">Internal Assessment 2</SelectItem>
                <SelectItem value="ia3" className="font-bold cursor-pointer">Internal Assessment 3</SelectItem>
                <SelectItem value="model" className="font-bold cursor-pointer">Model Exam</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="rounded-xl border-white/10">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredVerifications.length > 0 ? filteredVerifications.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-8 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-glow ${
                    subject.markStatus === 'pending_tutor' ? 'bg-primary/10 text-primary shadow-primary/20' : 'bg-success/10 text-success shadow-success/20'
                  }`}>
                    {subject.markStatus === 'pending_tutor' ? <ClipboardCheck className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center gap-3">
                      {subject.subjectName}
                      <Badge variant="outline" className="text-[9px] font-black font-mono border-white/10 tracking-widest px-2 py-0.5">
                        {subject.subjectCode}
                      </Badge>
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-2">
                       {subject.sectionName} • {subject.facultyName} • {subject.studentCount} Students
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="text-right hidden sm:block">
                     <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Submitted On</p>
                     <p className="text-sm font-bold italic mt-1">{subject.submittedAt ? subject.submittedAt.split('T')[0] : 'N/A'}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     {subject.markStatus !== 'pending_tutor' ? (
                       <Badge variant="secondary" className="bg-success text-white px-6 py-2 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-success/30 border-none">
                          <CheckCheck className="w-3.5 h-3.5" /> Forwarded
                        </Badge>
                     ) : (
                       <div className="flex items-center gap-3">
                         <Button 
                          variant="gradient" 
                          size="sm"
                          className="rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest italic px-8"
                          onClick={() => handleVerify(subject)}
                         >
                           Verify & Forward
                           <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          )) : (
              <div className="text-center py-24 opacity-50 italic font-medium">
                  No marks data available for this exam type.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

