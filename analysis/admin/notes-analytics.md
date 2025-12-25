# Notes Analytics Page Analysis
**Component:** `src/pages/admin/NotesAnalytics.tsx`

## 1. Page Overview
The "Notes & Resources Analytics" page is a dashboard focused on tracking digital library usage and content completeness. It helps admins ensure that faculty are uploading required study materials (Notes, Question Banks, Manuals) and monitors student engagement via downloads.

## 2. Key Metrics & Calculations

### Stats Overview
- **Total Resources**: Raw count of all uploaded items (Note + QP + Manual).
- **Total Downloads**: Sum of the `downloads` count from all resource objects.
- **Active Subjects**: Count of unique subjects that have at least one resource uploaded.
- **Completion Rate**:
    - **Logic**: Assumes a target of **5 Units** per subject.
    - **Formula**: `(Total Uploaded Units / (Active Subjects * 5)) * 100`.
    - Note: This metric is "System-wide" and gives a rough estimate of syllabus coverage.

### Visualization Widgets
- **Category Distribution (Pie Chart)**: Breakdown of resources by type:
    - Lecture Notes (Blue)
    - Question Banks (Purple)
    - Lab Manuals (Pink)
- **Monthly Upload Trends (Bar Chart)**: Currently a placeholder/mock component intended to show upload volume over time (implementation pending historical data).

## 3. Detailed Reports

### Subject-wise Progress List
A list view showing compliance per subject:
- **Display**: Subject Name, Faculty Name, Upload Count.
- **Progress Bar**: Visualizes `Uploaded / 5 Units`.
- **Badge Indicator**:
    - **Default (Dark/Black)**: >= 90% Complete.
    - **Secondary (Gray)**: >= 70% Complete.
    - **Outline**: < 70% Complete.

## 4. UI/UX Elements
- **Filters**: Dropdown to filter analytics by "Batch" (currently defaults to 'All').
- **Empty States**: Specific error states ("No resources in database") with iconography (`AlertCircle`).
- **Glassmorphism**: Consistent `glass-card` styling with `border-white/10` for a modern, sleek look.

## 5. Dependencies
- **Data Store**: `getResources` (fetches the raw list of `Resource` objects).
- **Libraries**: `recharts` (BarChart, PieChart), `framer-motion` (animations).
- **Components**: `Card`, `Progress`, `Badge`, `Select`.
