# Timetable Page Analysis
**Component:** `src/pages/admin/Timetable.tsx`

## 1. Page Overview
The "Timetable Management" page provides a visual interface for creating and modifying weekly class schedules. It allows admins to assign subjects, faculty, and rooms to specific time slots across the week for a selected section.

## 2. Key Features

### Schedule Visualization
- **Context Filters**: Section selection dropdown (A, B, C) (with Batch currently hardcoded/defaulted).
- **Views**:
    - **Week View**: Traditional grid table (Periods vs Days).
    - **Day View**: Card-based stack showing the schedule day-by-day.
- **Period System**: 8 standard periods from 9:00 AM to 5:00 PM.
- **Color Coding**: Visual differentiation between types:
    - **Theory**: Blue gradient
    - **Lab**: Purple/Pink gradient
    - **Tutorial**: Amber gradient
    - **Free**: Gray gradient

### Editing Capabilities
- **Slot Interaction**: Clicking any grid cell opens the "Edit Timetable Slot" modal.
- **Data Handling**:
    - **Get**: Fetches all slots via `getTimetable` and filters by current section.
    - **Set**: Saves new/updated slots locally using `saveTimetable`.

### Analytics
- **Subject Distribution**: Aggregates total hours per week for each subject code in the current view.
- **Empty State**: Displays unique UI for unassigned slots (dotted border with hover effect).

## 3. UI/UX Elements
- **Interactive Grid**: Cells have hover effects (`scale: 1.02`) and truncated text for clean layout.
- **Animations**: `framer-motion` used extensively for cell interactions and loading transitions.
- **Tools Header**: Placeholders for Import, Export PDF, and AI Generate features.

## 4. Dependencies
- **Components**: `Tabs`, `Card`, `Dialog`, `Select`, `Badge`, `Button`.
- **Data**: `TimetableSlot` type, `getFaculty` (for dropdowns).
- **Icons**: `Calendar`, `Clock`, `User`, `Building`, `Sparkles` (lucide-react).
