# Faculty Marks Entry Analysis

## Overview
The "Marks Entry" module allows faculty to record assessment scores for students. It is designed for high-efficiency data entry with real-time status tracking and batch saving capabilities.

## Filters & Configuration (Sidebar)
Faculty must select the context for marks entry:
1.  **Requirement (Class/Section)**: Filter by specific section (e.g., "A", "B") or view "All My Sections".
2.  **Subject**: Select from the list of subjects assigned to the faculty.
3.  **Assessment**: Choose the exam type:
    -   Internal Assessment 1 (IA1)
    -   Internal Assessment 2 (IA2)
    -   Model Examination

### Progress Tracking
A progress bar in the sidebar visualizes completion:
-   **Metric**: Percentage of students with entered marks vs. total students.
-   **Stats**: Displays numerical count (e.g., "45/60 Entered").

## Student List & Data Entry
The main area displays a searchable table of students matching the filters.

| Column | Description |
| :--- | :--- |
| **Student ID** | Roll Number with a visual hash icon. |
| **Name** | Full name of the student. |
| **Marks** | Numeric input field. <br> - **Validation**: Accepts values 0-20. <br> - **Visual Feedback**: Border color changes based on status (Orange=Pending, Blue=Changed, Green=Saved). |
| **Status** | Badge indicating the state of the entry: <br> - **Saved** (Green): Data persisted in store. <br> - **Missing** (Orange): No data entered. <br> - **Unsaved** (Blue Pulse): Modified locally but not yet committed. |
| **Action** | "History" button (currently placeholder). |

## Actions
-   **Import CSV**: Placeholder for bulk data import.
-   **Save All Changes**: Commits all "Changed" entries to the data store via `addOrUpdateMark`. Invalidates the local cache to refresh status to "Saved".

## Data Logic
-   **Fetching**:
    -   `getStudents()`: Filtered by the selected section.
    -   `getMarks()`: Matched against `studentId`, `subjectCode`, and `examType`.
-   **State Management**:
    -   `currentMarks`: Local state for input value.
    -   `markStatus`: 'saved' | 'pending' | 'changed'.
-   **Commit**: Only changed records are sent to the store to optimize performance.

## AI Insights
A placeholder section at the bottom for future implementation of class performance analytics.
