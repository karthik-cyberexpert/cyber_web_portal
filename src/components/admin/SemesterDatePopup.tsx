import { calculateCurrentAcademicState } from '@/lib/academic-calendar';

// ... (inside component)
export default function SemesterDatePopup({ batch, onSave, onClose, readOnly = false }: SemesterDatePopupProps) {
  const token = localStorage.getItem('token');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate semester dynamically to match table view
  const { semester: displaySemester } = calculateCurrentAcademicState(batch.name);

  // ...

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
