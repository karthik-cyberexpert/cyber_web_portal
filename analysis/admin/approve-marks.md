# Approve Marks Page Analysis
**Component:** `src/pages/admin/ApproveMarks.tsx`

## 1. Page Overview
The "Approve Marks" page is a quality assurance interface for internal assessments. It aggregates individual student marks into **Submission Groups** (Subject + Exam Type + Section), moving the focus from individual student editing to batch verification.

## 2. Key Features

### Aggregation Logic
Marks are not shown row-by-row initially. Instead, they are grouped by unique keys:
- **Key**: `${subjectCode}-${examType}-${section}`.
- **Metrics**: Calculates `studentCount`, `avgScore`, and determines a unified `status` for the group (e.g., if one mark is 'pending', the group is 'pending').

### Workflow Statuses
- **Pending Verification**: Submitted by Faculty/Tutor, awaiting check.
- **Verified**: Checked by a lower-level authority (optional in this flow) or ready for final admin approval.
- **Approved**: Finalized records.
- **Rejected**: Sent back to the faculty for correction.

### Visualization & Stats
- **Stats Cards**: 4-column overview of pending, awaiting approval, approved, and rejected counts.
- **Tabs**: Groups submissions into `Pending` (Actionable), `Approved` (Read-only reference), and `Rejected` (History).
- **Distribution Chart**: A bar chart visualization showing the spread of scores (0-20%, 21-40% etc.) for a selected submission group.

## 3. Operations
- **Approve**: Bulk updates all marks in the group to status `approved`.
- **Reject**: Bulk updates all marks in the group to status `submitted` (effectively reverting them to the faculty's queue).
- **View Details**: Opens a modal with specific metrics for that batch of marks.

## 4. UI/UX Elements
- **Badges**:
    - **Status**: Color-coded (Emerald=Approved, Amber=Verified, Red=Rejected).
    - **Exam Type**: Distinct colors for IA1, IA2, External, etc.
- **Search & Filter**: Filters by Subject/Faculty/Code and specific status.
- **Animations**: Rows animate in/out using `framer-motion` during filtering or status changes.

## 5. Dependencies
- **Data Store**: `getMarks`, `getStudents`, `getFaculty`, `updateMarkStatus`.
- **Components**: `Tabs`, `Card`, `Table`, `Dialog`, `Progress`.
- **Icons**: `CheckCircle2`, `AlertTriangle`, `BarChart3` (lucide-react).
