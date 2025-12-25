# Student Assignments Analysis

## Overview
The Assignments module helps students manage their coursework deadlines, view task details, and submit their work.

## Assignment List
Displays assignments filtered by the student's class and section.
-   **Priority Indicators**:
    -   **Overdue**: Red styling (if `dueDate < today`).
    -   **Urgent**: Orange styling (if due within 2 days).
    -   **Standard**: Blue styling.
-   **Status Badge**: Explicit labels for 'SUBMITTED', 'PENDING', or 'OVERDUE'.
-   **Progress**:
    -   100% for Submitted.
    -   50% for Pending (Active).
    -   0% for Overdue (Missed).

## Submission Workflow
-   **Method**: Clicking "Upload Assignment" opens a modal dialog.
-   **Interface**: Drag-and-drop zone (Mocked) for file upload.
-   **Action**: `submitAssignment()` is called with a simulated delay to persist the submission record.
-   **Feedback**: Toast notification on success.

## Side Panel Stats
-   **Submission Stats**: Counts of Completed vs. Pending tasks.
-   **Completion Rate**: Visual progress bar of overall submission performance.
-   **Upcoming Deadlines**: A quick list of the next 3 pending assignments sorted by date.

## Data Logic
-   **Assignments**: Fetched via `getAssignments()` and filtered by `student.batch` (or year) and `student.section`.
-   **Submissions**: Fetched via `getSubmissions()` and matched by `assignmentId` to determine status.
