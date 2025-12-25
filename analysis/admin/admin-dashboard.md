# Admin Dashboard Analysis
**Component:** `src/pages/dashboards/AdminDashboard.tsx`

## 1. Page Overview
The Admin Dashboard acts as the primary landing page for authenticated administrators, providing a high-level overview of the institution's health and quick access to management functions. It is designed with a responsive grid layout using `framer-motion` for entrance animations.

## 2. Key Metrics (Stat Cards)
The dashboard displays four primary statistics at the top:

| Statistic | Icon | Calculation Logic | Visual Variant | Path |
| :--- | :--- | :--- | :--- | :--- |
| **Total Students** | `GraduationCap` | Total count of students from `getStudents()` | Primary | `/admin/students` |
| **Faculty Members** | `Users` | Total count of faculty from `getFaculty()` | Accent | `/admin/faculty` |
| **Pending Leaves** | `ExternalLink` | Count of leave requests with `status === 'pending'` | Success | `/admin/leave` |
| **Approve Marks** | `ClipboardCheck` | Count of mark entries with `status === 'verified'` | Warning | `/admin/marks` |

## 3. Data Visualizations
The dashboard features several charts to visualize trends:

### Institution Overview (Bar Chart)
- **Library**: `recharts`
- **Data**: Cumulative growth of Students vs Faculty over the last 6 months.
- **Axes**: Month (X) vs Count (Y). Includes dual Y-axes for different scales if needed.

### Batch Distribution (Pie Chart)
- **Library**: `recharts`
- **Data**: Distribution of active students grouped by their `batch` identifier (e.g., '2021-2025').
- **Styling**: Uses a custom color palette (`primary`, `accent`, `success`, etc.) and a donut chart style.

## 4. Operational Queues & Lists

### Marks Approval Queue
- **Purpose**: Urgent action items for the admin regarding exam results.
- **Content**: Groups verified marks by `Subject - Exam Type`.
- **Action**: "Approve" button navigates to the detailed marks approval page with filters pre-applied.

### Recent Activities
- **Purpose**: Activity stream showing the latest system events.
- **Sources**: Combined list of:
    - New Student Joints
    - New Faculty Joins
    - Circulars/Notices Posted
    - Processed Leave Requests
- **Limit**: Top 5 most recent items.

## 5. Semester Progress Tracker
A custom visual component that calculates the academic progress of the current active batch.
- **Logic**: Determines the current semester (1-8) based on the batch start year and current date.
- **Status States**:
    - `Completed`: 100% progress (green)
    - `Active`: Calculated % progress (primary/blue)
    - `Upcoming`: 0% progress (gray)

## 6. Quick Action Grid
A dedicated section for fast navigation to common tasks:

| Action Label | Icon | Target Route | Color Theme |
| :--- | :--- | :--- | :--- |
| Manage Students | `Users` | `/admin/students` | Primary |
| Manage Faculty | `GraduationCap` | `/admin/faculty` | Accent |
| Leave Approvals | `ExternalLink` | `/admin/leave` | Success |
| Approve Marks | `ClipboardCheck` | `/admin/marks` | Warning |
| Post Circular | `Bell` | `/admin/circulars` | Info |
| Analytics | `BarChart3` | `/admin/settings` | Primary |

## 7. Dependencies
- **UI Components**: `StatCard`, `Button`, `motion` (framer-motion)
- **Data Layer**: `data-store` (centralized mock data)
- **Routing**: `useNavigate` (react-router-dom)
