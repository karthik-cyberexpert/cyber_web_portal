import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  IdCard, 
  Globe,
  Camera,
  Edit,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Heart,
  Droplets,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PersonalDetails() {
  const infoGroups = [
    {
      title: "Basic Information",
      items: [
        { label: "Full Name", value: "Arun Kumar", icon: User },
        { label: "Student ID", value: "STU2024001", icon: IdCard },
        { label: "Email", value: "arun.kumar@university.edu", icon: Mail },
        { label: "Phone", value: "+91 98765 43210", icon: Phone },
      ]
    },
    {
      title: "Contact Details",
      items: [
        { label: "Address", value: "123 Academic Lane, Knowledge City", icon: MapPin },
        { label: "Nationality", value: "Indian", icon: Globe },
        { label: "Date of Birth", value: "15 May 2003", icon: Calendar },
      ]
    },
    {
      title: "Academic Background",
      items: [
        { label: "Current Semester", value: "Semester 5", icon: Briefcase },
        { label: "Admission Year", value: "2021", icon: Calendar },
        { label: "Department", value: "Computer Science", icon: Briefcase },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Personal Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and credentials</p>
        </div>
        <Button variant="gradient">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-4"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">Arun Kumar</h2>
            <p className="text-sm text-muted-foreground">B.E. Computer Science • Year 3</p>
          </div>

          <div className="w-full space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium text-primary">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Verified Student Profile
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="lg:col-span-2 space-y-6">
          {infoGroups.map((group, gIdx) => (
            <motion.div
              key={gIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * gIdx }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  IdCard, 
  Globe,
  Camera,
  Edit,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Heart,
  Droplets,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function PersonalDetails() {
  const infoGroups = [
    {
      title: "Basic Information",
      items: [
        { label: "Full Name", value: "Arun Kumar", icon: User },
        { label: "Student ID", value: "STU2024001", icon: IdCard },
        { label: "Email", value: "arun.kumar@university.edu", icon: Mail },
        { label: "Phone", value: "+91 98765 43210", icon: Phone },
      ]
    },
    {
      title: "Contact Details",
      items: [
        { label: "Address", value: "123 Academic Lane, Knowledge City", icon: MapPin },
        { label: "Nationality", value: "Indian", icon: Globe },
        { label: "Date of Birth", value: "15 May 2003", icon: Calendar },
      ]
    },
    {
      title: "Academic Background",
      items: [
        { label: "Current Semester", value: "Semester 5", icon: Briefcase },
        { label: "Admission Year", value: "2021", icon: Calendar },
        { label: "Department", value: "Computer Science", icon: Briefcase },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Personal Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and credentials</p>
        </div>
        <Button variant="gradient" className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Sparkles className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-4"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">Arun Kumar</h2>
            <p className="text-sm text-muted-foreground">B.E. Computer Science • Year 3</p>
          </div>

          <div className="w-full space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium text-primary">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Verified Student Profile
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="lg:col-span-2 space-y-6">
          {infoGroups.map((group, gIdx) => (
            <motion.div
              key={gIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * gIdx }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
