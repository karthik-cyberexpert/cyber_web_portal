import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet,
  ArrowRight,
  School,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getFaculty, Faculty } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

export default function MarksEntrySelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<'UT-1' | 'UT-2' | 'UT-3' | 'MODEL' | 'ASSIGNMENT'>('UT-1');
  const [selectedSubject, setSelectedSubject] = useState(''); 
  const [selectedSection, setSelectedSection] = useState('');
  
  // Data State
  const [allocations, setAllocations] = useState<any[]>([]);
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/marks/faculty/classes`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setAllocations(data);
              
              // Extract Unique Sections
              const sections = Array.from(new Set(data.map((a: any) => JSON.stringify({id: a.sectionId, name: a.sectionName, batch: a.batchName}))))
                .map((s: any) => JSON.parse(s));
              setAvailableSections(sections);

              if (sections.length > 0) setSelectedSection(sections[0].id.toString());
          }
      } catch (error) {
          console.error("Failed to fetch classes", error);
          toast.error("Failed to load your classes");
      }
  };

  // Filter subjects based on selected section
  useEffect(() => {
      if (selectedSection) {
          const sectionId = parseInt(selectedSection);
          const relevant = allocations.filter(a => a.sectionId === sectionId);
          const subjects = Array.from(new Set(relevant.map(a => a.subjectCode)));
          setAvailableSubjects(subjects);
          if (subjects.length > 0) setSelectedSubject(subjects[0] as string);
      } else {
          setAvailableSubjects([]);
          setSelectedSubject('');
      }
  }, [selectedSection, allocations]);

  const handleProceed = () => {
      if (!selectedSection || !selectedSubject || !selectedExam) {
          toast.error("Please select all fields");
          return;
      }
      
      const secDetails = availableSections.find(s => s.id.toString() === selectedSection);
      const secName = secDetails ? secDetails.name : '';

      // Navigate to the sheet
      navigate(`/faculty/marks/sheet?section=${selectedSection}&subject=${selectedSubject}&exam=${selectedExam}&sectionName=${secName}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Examination Marks Entry 📝
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Select course details to proceed to the marks sheet</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-8 border-none shadow-2xl relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center cursor-default">
                <div className="space-y-6">
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <School className="w-4 h-4" /> Batch / Section
                        </label>
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger className="rounded-xl h-12 bg-white/5 border-white/10 text-lg">
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSections.map((sec: any) => (
                                    <SelectItem key={sec.id} value={sec.id.toString()}>
                                        {sec.batch} - {sec.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                             <BookOpen className="w-4 h-4" /> Subject
                        </label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="rounded-xl h-12 bg-white/5 border-white/10 text-lg">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSubjects.map((sub: any) => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                             <GraduationCap className="w-4 h-4" /> Examination
                        </label>
                        <Select value={selectedExam} onValueChange={(v: any) => setSelectedExam(v)}>
                            <SelectTrigger className="rounded-xl h-12 bg-white/5 border-white/10 text-lg">
                                <SelectValue placeholder="Select Batch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UT-1">Unit Test 1 (UT-1)</SelectItem>
                                <SelectItem value="UT-2">Unit Test 2 (UT-2)</SelectItem>
                                <SelectItem value="UT-3">Unit Test 3 (UT-3)</SelectItem>
                                <SelectItem value="MODEL">Model Examination</SelectItem>
                                <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <FileSpreadsheet className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">Ready to Enter Marks?</h3>
                        <p className="text-sm text-muted-foreground">
                            You are about to enter marks for <br/>
                            <span className="text-primary font-bold">{selectedSubject || '...'}</span> - <span className="text-accent font-bold">{selectedExam.toUpperCase()}</span>
                        </p>
                    </div>
                    <Button 
                        size="lg" 
                        className="w-full rounded-xl font-bold text-lg h-14 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        variant="gradient"
                        onClick={handleProceed}
                    >
                        Enter Marks Now <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </Card>
      </motion.div>
    </div>
  );
}
