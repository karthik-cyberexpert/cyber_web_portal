# Student Academic Details Analysis

## Overview
The "Academic Overview" page provides a detailed track record of the student's educational journey, highlighting performance metrics and curriculum progress.

## High-level Statistics
Four glass-morphism cards display key performance indicators (KPIs):
1.  **Current CGPA**: Cumulative Grade Point Average (to 2 decimals).
2.  **Total Credits**: Sum of credits earned across all semesters.
3.  **Backlogs**: Count of current backlogs (zero-padded).
4.  **Semesters**: Progress indicator (e.g., "05/08").

## Academic Profile (Left Column)
A detailed list of the student's academic identity and placement:
-   **Programme**: Degree program (e.g., B.Tech Computer Science).
-   **Identity**:
    -   Status (Active/Inactive)
    -   Batch (Year Range)
    -   Curriculum Year & Active Semester
    -   Major & Section
    -   **Class Tutor**: Fetched dynamically based on Batch/Section.
    -   Enrollment & Admission Types.

## Semester History (Right Column)
A chronological list of semesters:
-   **Visuals**: Semester number badge (Green for Completed, Orange/Pulse for Active).
-   **Details**: Credits, Status.
-   **Performance**: Semester GPA (displayed prominently).

## Data Logic
-   **Student Data**: `getStudents()` filtered by user ID.
-   **Tutor Mapping**: `getTutors()` searched for a match on `batch` and `section` to display the assigned Class Tutor's name.
