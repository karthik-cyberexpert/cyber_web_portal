
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar as CalendarIcon, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';

interface StudentFeedbackItem {
  id: number;
  title: string;
  type: 'faculty' | 'other';
  closing_date: string;
  status: 'Open' | 'Closed';
  is_completed?: number;
}

interface Question {
    id: number;
    question_text: string;
    question_type: 'mcq' | 'text';
    options?: any; // JSON string or object
    order_index: number;
}

interface Target {
    faculty_id: number;
    subject_name: string;
    faculty_name: string;
}

interface FeedbackDetails {
    form: StudentFeedbackItem;
    questions: Question[];
    targets: Target[]; 
}

export default function FeedbackPortalStudent() {
  const [feedbacks, setFeedbacks] = useState<StudentFeedbackItem[]>([]);
  const token = localStorage.getItem('token');
  
  // Active Feedback State
  const [activeFeedbackId, setActiveFeedbackId] = useState<number | null>(null);
  const [details, setDetails] = useState<FeedbackDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Answers State: Record<UniqueKey, AnswerValue>
  // Key format: "q_{questionId}_t_{targetId}" (targetId is 'null' for general)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudentFeedbacks();
  }, []);

  const fetchStudentFeedbacks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback forms", error);
    }
  };

  const openFeedback = async (id: number) => {
      setActiveFeedbackId(id);
      setIsLoadingDetails(true);
      setDetails(null);
      setAnswers({});
      
      try {
          const res = await fetch(`${API_BASE_URL}/feedback/${id}/details`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setDetails(data);
          } else {
              toast.error("Failed to load feedback details");
              setActiveFeedbackId(null);
          }
      } catch (error) {
           toast.error("Network error");
           setActiveFeedbackId(null);
      } finally {
          setIsLoadingDetails(false);
      }
  };

  const handleAnswerChange = (questionId: number, targetId: number | null, value: string) => {
      const key = `q_${questionId}_t_${targetId}`;
      setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
      if (!details) return;

      // Validate all required fields
      // For faculty: questions.length * targets.length
      // For other: questions.length
      
      const missingAnswers: string[] = [];
      
      if (details.form.type === 'faculty') {
          for (const t of details.targets) {
              for (const q of details.questions) {
                  const key = `q_${q.id}_t_${t.faculty_id}`;
                  if (!answers[key]) {
                       missingAnswers.push(`Missing answer for ${t.subject_name}`);
                       break; // one per target is enough notification
                  }
              }
          }
      } else {
           for (const q of details.questions) {
                const key = `q_${q.id}_t_null`;
                if (!answers[key]) {
                    missingAnswers.push("Please answer all questions");
                    break;
                }
           }
      }

      if (missingAnswers.length > 0) {
          toast.error("Please answer all questions before submitting.");
          return;
      }

      setIsSubmitting(true);
      
      // Transform map to array for backend
      const payloadAnswers = Object.keys(answers).map(key => {
          const [_, qId, __, tId] = key.split('_');
          return {
              question_id: Number(qId),
              target_id: tId === 'null' ? null : Number(tId),
              answer: answers[key]
          };
      });

      try {
          const res = await fetch(`${API_BASE_URL}/feedback/${activeFeedbackId}/submit`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ answers: payloadAnswers })
          });

          if (res.ok) {
              toast.success("Feedback submitted successfully!");
              // Update local state to mark this feedback as completed immediately
              setFeedbacks(prev => prev.map(f => 
                  f.id === activeFeedbackId ? { ...f, is_completed: 1 } : f
              ));
              setActiveFeedbackId(null);
          } else {
              toast.error("Submission failed");
          }
      } catch (error) {
          toast.error("Network error");
      } finally {
          setIsSubmitting(false);
      }
  };

  const renderQuestion = (q: Question, targetId: number | null) => {
      const key = `q_${q.id}_t_${targetId}`;
      const val = answers[key] || "";
      
      // Parse options if string
      let options: string[] = [];
      if (q.question_type === 'mcq' && q.options) {
          try {
              options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          } catch (e) { options = []; }
      }

      return (
          <div key={`${q.id}-${targetId}`} className="mb-6 p-4 border rounded-lg bg-card/50">
              <Label className="text-base font-medium mb-3 block">
                  {q.question_text} <span className="text-destructive">*</span>
              </Label>
              
              {q.question_type === 'mcq' ? (
                   <RadioGroup value={val} onValueChange={(v) => handleAnswerChange(q.id, targetId, v)}>
                       {options.map((opt, i) => (
                           <div key={i} className="flex items-center space-x-2 mb-1">
                               <RadioGroupItem value={opt} id={`${key}-opt-${i}`} />
                               <Label htmlFor={`${key}-opt-${i}`} className="font-normal">{opt}</Label>
                           </div>
                       ))}
                   </RadioGroup>
              ) : (
                  <Textarea 
                      placeholder="Your answer..." 
                      value={val}
                      onChange={(e) => handleAnswerChange(q.id, targetId, e.target.value)}
                  />
              )}
          </div>
      );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Your Feedback
                </h1>
                <p className="text-muted-foreground">Share your thoughts to help us improve.</p>
            </div>
        </div>

        {feedbacks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((item: any) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow border-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={item.type === 'faculty' ? 'default' : 'secondary'} className="mb-2">
                         {item.type === 'faculty' ? 'Faculty Eval' : 'General'}
                    </Badge>
                    {item.is_completed === 1 && <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>}
                  </div>
                  <CardTitle className="text-xl line-clamp-2" title={item.title}>
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Closes: {new Date(item.closing_date).toLocaleDateString('en-GB')}
                    </div>
                    
                    {item.is_completed === 1 ? (
                         <Button className="w-full" variant="secondary" disabled>
                             <CheckCircle2 className="w-4 h-4 mr-2" />
                             Submitted
                         </Button>
                    ) : (
                        <Button className="w-full group" variant="outline" onClick={() => openFeedback(item.id)}>
                            Start Feedback
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
               <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-medium">No Pending Feedback</h3>
               <p className="text-muted-foreground max-w-sm mt-2">
                 You're all caught up! Check back later for new feedback forms.
               </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Response Modal */}
      <Dialog open={!!activeFeedbackId} onOpenChange={(v) => !v && setActiveFeedbackId(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
            {isLoadingDetails || !details ? (
                <div className="flex items-center justify-center h-full">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Loading Feedback Details</DialogTitle>
                    </DialogHeader>
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="text-2xl">{details.form.title}</DialogTitle>
                        <DialogDescription>
                            Please answer all questions honestly. Your feedback is anonymous.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 p-6 bg-muted/10">
                        {details.form.type === 'faculty' ? (
                            <div className="space-y-8">
                                {details.targets.length > 0 ? (details.targets.map((target) => (
                                    <Card key={target.faculty_id} className="border-l-4 border-l-primary shadow-sm">
                                        <CardHeader>
                                            <CardTitle>{target.subject_name}</CardTitle>
                                            <CardDescription className="text-lg font-medium text-foreground/80">
                                                Faculty: {target.faculty_name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {details.questions.map(q => renderQuestion(q, target.faculty_id))}
                                        </CardContent>
                                    </Card>
                                ))) : (
                                    <div className="text-center p-8">No subjects/faculty allocated to your section yet.</div>
                                )}
                            </div>
                        ) : (
                             // Generic Feedback
                             <div className="max-w-3xl mx-auto">
                                 {details.questions.map(q => renderQuestion(q, null))}
                             </div>
                        )}
                    </ScrollArea>

                    <div className="p-6 border-t bg-background flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setActiveFeedbackId(null)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Submit Feedback
                        </Button>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
