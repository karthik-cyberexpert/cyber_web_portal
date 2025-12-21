import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Download, 
  Info, 
  ChevronRight,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TimetableSyllabus() {
  const timetable = [
    { time: "09:00 - 10:00", subject: "Data Structures", room: "LT-101", faculty: "Dr. Ramesh", type: "Theory" },
    { time: "10:00 - 11:00", subject: "DBMS", room: "LT-202", faculty: "Prof. Lakshmi", type: "Theory" },
    { time: "11:15 - 12:15", subject: "OS Lab", room: "Lab-A", faculty: "Mr. Senthil", type: "Lab" },
    { time: "12:15 - 01:15", subject: "OS Lab", room: "Lab-A", faculty: "Mr. Senthil", type: "Lab" },
    { time: "02:15 - 03:15", subject: "Networks", room: "LT-105", faculty: "Ms. Priya", type: "Theory" },
  ];

  const syllabus = [
    { code: "CS301", name: "Data Structures", credits: 4, type: "Core", completion: 65 },
    { code: "CS302", name: "Database Management Systems", credits: 3, type: "Core", completion: 50 },
    { code: "CS303", name: "Operating Systems", credits: 4, type: "Core", completion: 40 },
    { code: "CS304", name: "Computer Networks", credits: 3, type: "Core", completion: 30 },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Timetable & Syllabus</h1>
          <p className="text-muted-foreground">Manage your weekly schedule and track course progress</p>
        </div>
      </motion.div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="timetable" className="rounded-lg px-8">Timetable</TabsTrigger>
          <TabsTrigger value="syllabus" className="rounded-lg px-8">Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <Button 
                key={idx} 
                variant={day === 'Mon' ? 'default' : 'outline'} 
                className={`rounded-xl ${day === 'Sun' ? 'opacity-50' : ''}`}
              >
                {day}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {timetable.map((session, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col md:flex-row md:items-center gap-6 p-5 glass-card rounded-2xl border-transparent hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4 md:w-48">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{session.time}</p>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${
                      session.type === 'Lab' ? 'text-accent' : 'text-primary'
                    }`}>{session.type}</p>
                  </div>
                </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.color}`} />
                      {session.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {session.room}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={session.avatar} />
                          <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                        </Avatar>
                        {session.faculty}
                      </div>
                    </div>
                  </div>

                <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="syllabus" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {syllabus.map((course, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{course.code}</p>
                  <h3 className="text-xl font-bold">{course.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{course.type}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{course.credits} Credits</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-tighter">Course Completion</span>
                    <span className="text-accent">{course.completion}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.completion}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>

                <Button variant="link" className="px-0 mt-4 text-primary group-hover:gap-2 transition-all">
                  View Detailed Syllabus <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
