# Assignments Page Analysis
**Component:** `src/pages/admin/Assignments.tsx`

## 1. Page Overview
The "Assignments Management" page acts as a central monitoring hub for all academic tasks issued across the institution. Unlike the faculty view (which manages meaningful creation/grading), this admin view focuses on **compliance tracking** and **submission analytics**.

## 2. Key Metrics & Analytics

### System Health Stats
Six `StatCard` style widgets provide a high-level snapshot:
- **Total**: Count of all assignments issued.
- **Active**: Assignments where `dueDate` has not passed.
- **Overdue**: Assignments past their due date.
- **Submissions**: Total student uploads received.
- **Evaluated**: Count of submissions marked as 'graded'.

### Visualizations
- **Submission Trends (Line Chart)**: Tracks the volume of submissions over the last 7 days, splitting data points into "Total" vs "On Time".
- **Subject-wise Status (Bar Chart)**: Compares "Submitted" vs "Evaluated" counts per subject, helping to identify backlog in grading.

## 3. Data Management
- **Source**: Fetches from `getAssignments` and `getSubmissions` in the data store.
- **Filtering**:
    - **Search**: By Title or Subject.
    - **Status**: Filter for 'Active' or 'Overdue'.
    - **Class**: Logic exists in code for class filtering (`selectedClass`), though the UI dropdown for it is currently implicit/simplified in the rendered view.

## 4. UI/UX Elements
- **Table View**: detailed list showing Title, Faculty, Class target, Due Date, and Real-time Status.
- **Status Badges**:
    - **Active**: Blue styling.
    - **Overdue**: Red styling.
- **Interaction**: The "View" action is present but currently acts as a placeholder for potentially opening a detailed drill-down view.

## 5. Dependencies
- **Charts**: `recharts` for Line and Bar charts.
- **Components**: `Card`, `Badge`, `Input`, `Select`, `Button`.
- **Icons**: `FileText`, `Clock`, `AlertCircle`, `TrendingUp` (lucide-react).
