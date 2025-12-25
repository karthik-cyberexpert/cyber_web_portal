# Faculty Dashboard Analysis

## Overview
The Faculty Dashboard serves as the central hub for faculty members to manage their daily academic activities. It provides real-time insights into their schedule, pending evaluations, and quick access to essential tools.

## Key Metrics (Stat Cards)

| Metric | Source/Calculation | Icon | Color Variant |
| :--- | :--- | :--- | :--- |
| **Today's Classes** | Count of timetable slots for the current day where `facultyId` matches the user. | `Clock` | Primary (Blue) |
| **Subjects Handled** | Total unique subjects assigned to the faculty (or count of subjects in timetable). | `BookOpen` | Accent (Purple) |
| **Pending Evaluation** | Number of submissions with `status === 'submitted'` for assignments created by this faculty. | `ClipboardCheck` | Warning (Orange) |
| **Notes Uploaded** | Count of resources uploaded by the faculty. | `FileUp` | Success (Green) |

## Visualizations

### 1. Weekly Overview
-   **Type**: Bar Chart
-   **Data**: Number of classes per day (Mon-Fri).
-   **Purpose**: Visualize teaching load distribution across the week.

### 2. Today's Schedule
-   **Type**: List View
-   **Data**:
    -   Time (derived from period number)
    -   Subject Name
    -   Section & Room Number
    -   Status (e.g., "Upcoming")
-   **Interaction**: Clickable list items (potentially linking to class details).

### 3. Pending Evaluations
-   **Type**: Progress Bar List
-   **Data**: Top 3 assignments with pending submissions.
    -   Assignment Title
    -   Section Name
    -   Progress Bar: `(Submitted / Total Students) * 100`
    -   Count Label: `Submitted/Total`

## Quick Actions

| Action | Icon | Target Functionality |
| :--- | :--- | :--- |
| **Upload Notes** | `Upload` | Navigate to Resource Management / Upload Dialog |
| **Create Assignment** | `FileText` | Navigate to Assignment Creation Form |
| **Enter Marks** | `ClipboardCheck` | Navigate to Marks Entry Module |
| **View Students** | `Users` | Navigate to Student List (Filtered by Faculty's classes) |

## Data Sources
-   `getTimetable()`: For schedule and weekly stats.
-   `getAssignments()`: For pending evaluations.
-   `getSubmissions()`: For calculating pending counts.
-   `getStudents()`: For total student counts in sections.
-   `getResources()`: For notes count.
