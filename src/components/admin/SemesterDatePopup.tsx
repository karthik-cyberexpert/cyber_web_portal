import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, AlertCircle, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';

interface PendingBatch {
  id: number;
  name: string;
  current_semester: number;
  semester_start_date: string | null;
  semester_end_date: string | null;
}

interface SemesterDatePopupProps {
  batch: PendingBatch;
  onSave: () => void;
  onClose?: () => void; // If provided, allows closing the dialog
  readOnly?: boolean; // If true, batch is pre-selected and can't be changed
}

export default function SemesterDatePopup({ batch, onSave, onClose, readOnly = false }: SemesterDatePopupProps) {
  const token = localStorage.getItem('token');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Pre-fill dates if they exist
    if (batch.semester_start_date) {
      setStartDate(batch.semester_start_date.split('T')[0]);
    }
    if (batch.semester_end_date) {
      setEndDate(batch.semester_end_date.split('T')[0]);
    }
  }, [batch]);

  const handleSave = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/academic/batches/${batch.id}/semester-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          semester_start_date: startDate,
          semester_end_date: endDate
        })
      });

      if (res.ok) {
        toast.success(`Semester ${batch.current_semester} dates set for ${batch.name}`);
        onSave();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save dates');
      }
    } catch (error) {
      console.error('Error saving semester dates:', error);
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      <DialogContent 
        className="sm:max-w-[450px] bg-background/95 backdrop-blur-xl border-primary/20"
        onPointerDownOutside={(e) => { if (!onClose) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (!onClose) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-primary" />
            Set Semester Dates
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-amber-500/80">
            <AlertCircle className="w-4 h-4" />
            {onClose ? 'Update semester dates' : 'Required: Please configure semester dates to continue'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          {/* Batch Info (Read-Only) */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span className="font-medium">Batch</span>
            </div>
            <p className="text-lg font-bold">{batch.name}</p>
          </div>

          {/* Current Semester (Read-Only) */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Semester</span>
              <span className="text-2xl font-black text-accent">{batch.current_semester}</span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 bg-white/5 border-white/10"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={isSaving || !startDate || !endDate}
            className="w-full h-12 text-lg font-bold"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Semester Dates
              </>
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
