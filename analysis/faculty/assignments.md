# Faculty Assignments Analysis

## Overview
The "Assignment Management" module enables faculty to create new coursework, track submission progress across classes, and initiate the evaluation process.

## Assignment Creation
A dialog-based form (`Dialog`) allows faculty to create new assignments:
-   **Fields**:
    -   **Title**: Assignment name (e.g., "Linked List Implementation").
    -   **Subject**: Selected from a dropdown (e.g., "Data Structures").
    -   **Due Date**: Submission deadline.
    -   **Class/Section**: Target audience (e.g., "CSE - A").
    -   **Max Marks**: Total score (default: 100).
    -   **Description**: Detailed instructions for students.
-   **Logic**:
    -   Auto-generates `subjectCode` (first 3 chars of Subject).
    -   Sets initial status to 'active'.
    -   Calls `addAssignment()` to persist data.

## Dashboard Metrics (Top Row)
Three cards provide a snapshot of the assignment lifecycle:
1.  **Active Tasks**: Total number of ongoing assignments (`dueDate >= Reference Date`).
2.  **Due Shortly**: Count of assignments due within the next 3 days.
3.  **Evaluation Rate**: Percentage of submissions that have been graded (`status === 'graded'`).

## Assignment List (Cards)
Displays created assignments with detailed tracking:
-   **Details**:
    -   Title & Subject Tags.
    -   Max Marks Badge.
    -   Target Class/Section.
    -   Due Date (Warning color if near).
-   **Submission Tracking**:
    -   Progress Bar: Visualizes `Count(Submissions) / Total Students`.
    -   Stats: displays exact count (e.g., "45 / 60 Students").
-   **Actions**:
    -   **Evaluate**: Primary action to start grading submissions (Placeholder).
    -   **More Options**: Secondary actions menu (Placeholder).

## Actions
-   **Create Assignment**: Opens the creation dialog.
-   **Filter**: Search by title or filter by "Active Only".

## Data Logic
-   **Fetching**: Retrieves assignments via `getAssignments()` filtered by `facultyId`.
-   **Tracking**: Cross-references `getSubmissions()` to calculate live submission rates per assignment.
-   **Insights**: AI-driven insight card at the bottom provides (mocked) qualitative feedback on submission trends.
