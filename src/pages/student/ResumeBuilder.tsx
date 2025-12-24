import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileUser, 
  Sparkles, 
  Download, 
  Eye, 
  Layout, 
  CheckCircle2,
  Rocket,
  Plus,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getResume, saveResume, Resume } from '@/lib/data-store';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (user) {
        const existing = getResume(user.id);
        if (existing) {
            setResume(existing);
        } else {
            // Initialize new resume for user
            const initial: Resume = {
                userId: user.id,
                personalInfo: {
                    fullName: user.name,
                    email: user.email,
                    phone: '',
                    summary: ''
                },
                sections: [
                    { name: "Personal Info", completion: 20, data: {} },
                    { name: "Education", completion: 0, data: [] },
                    { name: "Skills & Keywords", completion: 0, data: [] },
                    { name: "Projects", completion: 0, data: [] },
                    { name: "Achievements", completion: 0, data: [] },
                    { name: "Certifications", completion: 0, data: [] },
                ],
                template: 'Modern Professional',
                lastUpdated: new Date().toISOString()
            };
            setResume(initial);
            saveResume(initial);
        }
    }
  }, [user]);

  const handleSave = () => {
    if (resume) {
        saveResume({
            ...resume,
            lastUpdated: new Date().toISOString()
        });
        toast.success("Resume progress saved!");
    }
  };

  const overallCompletion = useMemo(() => {
    if (!resume) return 0;
    const sum = resume.sections.reduce((acc, s) => acc + s.completion, 0);
    return Math.round(sum / resume.sections.length);
  }, [resume]);

  if (!resume) return <div className="p-8 text-center uppercase font-black text-[10px] animate-pulse">Initializing AI Builder...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold italic">AI Resume Builder 🚀</h1>
          <p className="text-muted-foreground font-medium">Craft a high-impact, ATS-friendly resume tailored for placements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-white/10 hover:bg-white/5" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="gradient" className="rounded-xl shadow-glow-sm font-bold uppercase text-[10px] tracking-widest px-6">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Sections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-8 bg-primary/[0.02] border-primary/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <FileUser className="w-64 h-64 -rotate-12" />
            </div>
            
            <div className="flex items-center gap-6 mb-10 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner border border-white/5">
                <Layout className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black italic">Career Readiness</h2>
                    <span className="text-2xl font-black text-primary font-mono">{overallCompletion}%</span>
                </div>
                <Progress value={overallCompletion} className="h-2.5 mb-2 shadow-sm" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                    {overallCompletion > 70 ? 'Ready for placement cycle' : 'Keep building to improve ATS score'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {resume.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-2xl bg-background/40 border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full border-2 ${section.completion === 100 ? 'bg-success border-success shadow-glow-sm' : 'border-primary/30'}`} />
                    <span className="text-sm font-bold tracking-tight italic">{section.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black font-mono text-muted-foreground">{section.completion}%</span>
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        {section.completion === 100 ? <Check className="w-4 h-4" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" className="rounded-2xl h-auto py-5 border-dashed border-primary/30 text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Section
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="p-10 rounded-3xl bg-gradient-to-br from-accent via-primary to-accent text-white space-y-4 shadow-2xl overflow-hidden relative group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/90">AI Placement Optimization</h3>
              </div>
              <p className="text-3xl font-black mb-4 leading-none italic group-hover:translate-x-2 transition-transform duration-500">Your projects need quantitative impact.</p>
              <p className="text-white/80 text-sm mb-8 max-w-lg font-medium leading-relaxed">
                Pro Tip: Replace passive descriptions with action verbs. Instead of "Responsible for testing", use "Engineered automated test suites reducing bugs by 35%".
              </p>
              <Button variant="glass" className="bg-white/20 border-white/30 text-white hover:bg-white/40 font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl shadow-xl">
                <Rocket className="w-4 h-4 mr-2" />
                Optimize Section with AI
              </Button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute top-10 right-10 opacity-20">
                <Sparkles className="w-20 h-20 animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Templates & Tips */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-8 shadow-xl border-white/5">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 italic">Visual System</h3>
            <div className="space-y-6">
              {[
                { name: "Modern Professional", active: true, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop' },
                { name: "Minimalist Tech", active: false, image: 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=400&h=600&fit=crop' },
              ].map((tpl, idx) => (
                <div 
                  key={idx}
                  onClick={() => resume && setResume({...resume, template: tpl.name})}
                  className={`group relative aspect-[3/4.2] rounded-2xl border-2 overflow-hidden transition-all cursor-pointer shadow-lg ${
                    resume.template === tpl.name ? 'border-primary scale-105 shadow-glow-sm' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-primary/30'
                  }`}
                >
                  <img src={tpl.image} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{tpl.name}</p>
                  </div>
                  {resume.template === tpl.name && (
                    <div className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 bg-primary/[0.03] border-primary/10 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Industry Secret</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
              Fortune 500 ATS systems prioritize resumes with at least 85% keyword match for technical stacks. Ensure your keywords are mapped to the job description.
            </p>
            <Button variant="link" className="p-0 text-primary font-black uppercase text-[10px] tracking-widest h-auto mt-4 hover:no-underline hover:text-accent transition-colors">Career Placement Guide ↗</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
