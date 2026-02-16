import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';
import { calculateCurrentAcademicState } from '@/lib/academic-calendar';

interface SemesterDatePopupProps {
  batch: {
    id: number;
    name: string;
    current_semester: number;
    semester_start_date?: string;
    semester_end_date?: string;
  };
  onSave: () => void;
  onClose: () => void;
  readOnly?: boolean;
}

export default function SemesterDatePopup({ batch, onSave, onClose, readOnly = false }: SemesterDatePopupProps) {
  const token = localStorage.getItem('token');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate semester dynamically to match table view
  const { semester: displaySemester } = calculateCurrentAcademicState(batch.name);

  useEffect(() => {
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

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/academic/batches/${batch.id}/semester-dates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          semester_start_date: startDate,
          semester_end_date: endDate
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update semester dates');
      }

      toast.success('Semester dates updated successfully');
      onSave();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open && onClose) onClose();
    }}>
      <DialogContent className="sm:max-w-md glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Semester Dates - {batch.name}
          </DialogTitle>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4"
        >
          {/* Current Semester (Read-Only) */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Semester</span>
              <span className="text-2xl font-black text-accent">{displaySemester}</span>
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
                disabled={readOnly}
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
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Save Button */}
          {!readOnly && (
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
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
