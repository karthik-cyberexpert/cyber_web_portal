import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  ListPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogTrigger,
  } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    rollNumber: string;
    batch: string;
    section: string;
    semester: number;
  };
  education: Array<{
    institution: string;
    degree: string;
    batch: string;
    year: string;
  }>;
  achievements: Array<{
    title: string;
    organizer: string;
    category: string;
    level: string;
    date: string;
    position?: string;
    points: number;
  }>;
  skills: string[];
  projects: any[];
  certifications: any[];
}

// Vertical Portrait Preview (A4 size ratio)
const PortraitPreview = ({ data, template }: { data: ResumeData; template: string }) => {
  // Professional Template
  const renderProfessional = () => (
    <div className="bg-white text-black p-8 text-[10px] leading-tight">
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-bold mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-[9px]">{data.personalInfo.email} | {data.personalInfo.phone}</p>
        <p className="text-[9px]">{data.personalInfo.rollNumber}</p>
      </div>
      
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-gray-700 mb-2">EDUCATION</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold text-[10px]">{edu.degree}</p>
              <p className="text-[9px] text-gray-700">{edu.institution} | {edu.year}</p>
            </div>
          ))}
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-gray-700 mb-2">SKILLS</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-200 text-[8px] rounded">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      {data.achievements.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-gray-700 mb-2">ACHIEVEMENTS</h2>
          {data.achievements.slice(0, 5).map((ach, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold text-[10px]">{ach.title}</p>
              <p className="text-[9px] text-gray-700">{ach.organizer} | {ach.level}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Modern Template (two-column)
  const renderModern = () => (
    <div className="bg-white text-black flex min-h-full">
      <div className="w-1/3 bg-gray-900 text-white p-4">
        <h1 className="text-sm font-bold mb-3">{data.personalInfo.fullName}</h1>
        <div className="text-[8px] space-y-2">
          <div>
            <p className="font-bold text-gray-400 uppercase text-[7px] mb-1">Contact</p>
            <p className="break-all">{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
          </div>
          {data.skills.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-gray-400 uppercase text-[7px] mb-1">Skills</p>
              <div className="space-y-1">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="text-[8px] bg-gray-800 px-2 py-0.5 rounded">{skill}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-2/3 p-4">
        {data.education.length > 0 && (
          <div className="mb-3">
            <h2 className="text-xs font-bold mb-2">Education</h2>
            {data.education.map((edu, idx) => (
              <div key={idx} className="text-[9px] mb-2">
                <p className="font-bold">{edu.degree}</p>
                <p className="text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
        {data.achievements.length > 0 && (
          <div>
            <h2 className="text-xs font-bold mb-2">Achievements</h2>
            {data.achievements.slice(0, 4).map((ach, idx) => (
              <div key={idx} className="text-[9px] mb-1">
                <p className="font-semibold">{ach.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Academic Template (serif, centered)
  const renderAcademic = () => (
    <div className="bg-white text-black p-6 text-[9px] font-serif">
      <div className="text-center mb-4">
        <h1 className="text-base font-bold mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-[8px]">{data.personalInfo.email} • {data.personalInfo.phone}</p>
      </div>
      <hr className="border-t-2 border-black mb-3" />
      {data.education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase mb-1">Education</h2>
          {data.education.map((edu, idx) => (
            <p key={idx} className="text-[9px] mb-1">{edu.degree}, {edu.institution}</p>
          ))}
        </div>
      )}
      {data.achievements.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase mb-1">Honors & Awards</h2>
          <ul className="list-disc pl-4 space-y-1">
            {data.achievements.slice(0, 5).map((ach, idx) => (
              <li key={idx} className="text-[8px]">{ach.title} - {ach.organizer}</li>
            ))}
          </ul>
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase mb-1">Skills</h2>
          <p className="text-[8px]">{data.skills.join(' • ')}</p>
        </div>
      )}
    </div>
  );

  // Switch based on template
  switch (template) {
    case 'Modern':
      return renderModern();
    case 'Academic':
      return renderAcademic();
    default:
      return renderProfessional();
  }
};

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('Professional');
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    personal: true,
    education: false,
    achievements: false,
    skills: false
  });
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState({ title: '', organizer: '', level: '' });
  const [activeCustomSection, setActiveCustomSection] = useState<string | null>(null);
  const [newCustomItem, setNewCustomItem] = useState('');

  useEffect(() => {
    if (user) {
      fetchResumeData();
    }
  }, [user]);

  const fetchResumeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3007/api/student-resume-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
      } else {
        toast.error('Failed to load resume data');
      }
    } catch (error) {
      console.error('Fetch resume data error:', error);
      toast.error('Error loading resume data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const removeSkill = (skillToRemove: string) => {
    if (resumeData) {
      setResumeData({
        ...resumeData,
        skills: resumeData.skills.filter(skill => skill !== skillToRemove)
      });
    }
  };

  const addCustomSection = () => {
    if (newSectionName.trim()) {
      const sectionKey = newSectionName.toLowerCase().replace(/\s+/g, '_');
      setCustomSections([...customSections, { name: newSectionName, key: sectionKey, items: [] }]);
      setExpandedSections(prev => ({ ...prev, [sectionKey]: true }));
      setNewSectionName('');
      setShowSectionDialog(false);
    }
  };

  const addSkill = () => {
    if (resumeData && newSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
      setShowSkillDialog(false);
      toast.success('Skill added!');
    }
  };

  const addEducation = () => {
    if (resumeData && newEducation.degree.trim() && newEducation.institution.trim()) {
      setResumeData({
        ...resumeData,
        education: [...resumeData.education, { ...newEducation, batch: '' }]
      });
      setNewEducation({ degree: '', institution: '', year: '' });
      setShowEducationDialog(false);
      toast.success('Education added!');
    }
  };

  const addAchievement = () => {
    if (resumeData && newAchievement.title.trim()) {
      setResumeData({
        ...resumeData,
        achievements: [...resumeData.achievements, {
          ...newAchievement,
          category: 'Custom',
          date: new Date().toISOString(),
          points: 0
        }]
      });
      setNewAchievement({ title: '', organizer: '', level: '' });
      setShowAchievementDialog(false);
      toast.success('Achievement added!');
    }
  };

  const addCustomItem = () => {
    if (activeCustomSection && newCustomItem.trim()) {
      setCustomSections(customSections.map(section =>
        section.key === activeCustomSection
          ? { ...section, items: [...section.items, newCustomItem.trim()] }
          : section
      ));
      setNewCustomItem('');
      setActiveCustomSection(null);
      toast.success('Item added!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 font-bold">Loading your resume...</span>
      </div>
    );
  }

  if (!resumeData) {
    return <div className="p-8 text-center">Unable to load resume data</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <p className="text-sm text-muted-foreground">Build your professional resume</p>
        </div>
        <Button variant="gradient" className="rounded-xl shadow-glow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Sections (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Personal Info Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('personal')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <h3 className="font-bold text-sm">Personal Information</h3>
              {expandedSections.personal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.personal && (
              <div className="p-6 pt-0 space-y-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={resumeData.personalInfo.fullName} className="mt-1" readOnly />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input value={resumeData.personalInfo.email} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input value={resumeData.personalInfo.phone} className="mt-1" readOnly />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Roll Number</Label>
                  <Input value={resumeData.personalInfo.rollNumber} className="mt-1" readOnly />
                </div>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('education')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <h3 className="font-bold text-sm">Education</h3>
              {expandedSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.education && (
              <div className="p-6 pt-0 space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-muted/30 rounded-xl space-y-3">
                    <div>
                      <Label className="text-xs">Degree</Label>
                      <Input value={edu.degree} className="mt-1" readOnly />
                    </div>
                    <div>
                      <Label className="text-xs">Institution</Label>
                      <Input value={edu.institution} className="mt-1" readOnly />
                    </div>
                    <div>
                      <Label className="text-xs">Year</Label>
                      <Input value={edu.year} className="mt-1" readOnly />
                    </div>
                  </div>
                ))}
                <Dialog open={showEducationDialog} onOpenChange={setShowEducationDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Education</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Degree</Label>
                        <Input
                          placeholder="e.g., B.Tech in Computer Science"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Institution</Label>
                        <Input
                          placeholder="e.g., University Name"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Input
                          placeholder="e.g., 2020-2024"
                          value={newEducation.year}
                          onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowEducationDialog(false)}>Cancel</Button>
                      <Button onClick={addEducation}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('achievements')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <h3 className="font-bold text-sm">Achievements ({resumeData.achievements.length})</h3>
              {expandedSections.achievements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.achievements && (
              <div className="p-6 pt-0 space-y-3 max-h-[400px] overflow-y-auto">
                {resumeData.achievements.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No achievements yet</p>
                ) : (
                  resumeData.achievements.map((ach, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-xl">
                      <p className="text-sm font-semibold">{ach.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ach.organizer} | {ach.level}</p>
                      {ach.position && <p className="text-xs text-primary mt-0.5">{ach.position}</p>}
                    </div>
                  ))
                )}
                <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Achievement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          placeholder="e.g., First Prize in Hackathon"
                          value={newAchievement.title}
                          onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Organizer</Label>
                        <Input
                          placeholder="e.g., IEEE, ACM, University"
                          value={newAchievement.organizer}
                          onChange={(e) => setNewAchievement({...newAchievement, organizer: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Select value={newAchievement.level} onValueChange={(val) => setNewAchievement({...newAchievement, level: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="International">International</SelectItem>
                            <SelectItem value="National">National</SelectItem>
                            <SelectItem value="State">State</SelectItem>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAchievementDialog(false)}>Cancel</Button>
                      <Button onClick={addAchievement}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <h3 className="font-bold text-sm">Skills</h3>
              {expandedSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.skills && (
              <div className="p-6 pt-0 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx} className="group relative px-3 py-1 pr-7 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
                <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Skill</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Skill Name</Label>
                        <Input
                          placeholder="e.g., Python, React, Machine Learning"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSkillDialog(false)}>Cancel</Button>
                      <Button onClick={addSkill}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Custom Sections */}
          {customSections.map((section) => (
            <div key={section.key} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <h3 className="font-bold text-sm">{section.name}</h3>
                {expandedSections[section.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections[section.key] && (
                <div className="p-6 pt-0">
                  {section.items.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {section.items.map((item: string, idx: number) => (
                        <p key={idx} className="text-xs p-2 bg-muted/30 rounded">{item}</p>
                      ))}
                    </div>
                  )}
                  <Dialog open={activeCustomSection === section.key} onOpenChange={(open) => !open && setActiveCustomSection(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveCustomSection(section.key)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Item to {section.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Item Description</Label>
                          <Input
                            placeholder="Enter item details..."
                            value={newCustomItem}
                            onChange={(e) => setNewCustomItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveCustomSection(null)}>Cancel</Button>
                        <Button onClick={addCustomItem}>Add</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          ))}

          {/* Add Section Button */}
          <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full rounded-2xl border-dashed border-2">
                <ListPlus className="w-4 h-4 mr-2" />
                Add Custom Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Section</DialogTitle>
                <DialogDescription>
                  Create a new section for your resume like Projects, Certifications, Languages, etc.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm">Section Name</Label>
                  <Input
                    placeholder="e.g., Projects, Certifications, Languages..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addCustomSection} disabled={!newSectionName.trim()}>
                  Add Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right: Portrait Preview (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Live Preview</h3>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Modern">Modern</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Portrait A4 Preview */}
          <div className="glass-card rounded-2xl p-4 bg-gray-100 sticky top-4">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden mx-auto" style={{ aspectRatio: '1 / 1.414', maxHeight: '600px' }}>
              <div className="h-full overflow-y-auto">
                <PortraitPreview data={resumeData} template={selectedTemplate} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-lg font-black text-primary">{resumeData.achievements.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Achievements</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-lg font-black text-accent">{resumeData.skills.length}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Skills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
