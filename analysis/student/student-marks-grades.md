# Student Marks & Grades Analysis

## Overview
The "Marks & Grades" module allows students to track their academic performance, including internal assessments, model exams, and calculated GPA.

## Performance Stats
Key metrics displayed at the top:
1.  **Current Semester GPA**: Real-time calculated GPA based on available marks.
2.  **Class Rank**: Placeholder for rank position (currently "N/A").
3.  **Cumulative GPA**: Aggregate GPA across all semesters.

## Assessment Details (Main Table)
A detailed breakdown of marks for the current semester:
-   **Columns**: Subject, IA-1, IA-2, Model Exam, Assignment, Grade, Total.
-   **Calculations**:
    -   **Total**: Sum of all internal components.
    -   **Grade**: Dynamic letter grade (O, A+, A, B+, B, C) based on percentage of internal marks (Mock logic: >90% = O, etc.).
    -   **Visualization**: Color-coded badges for grades.

## Previous History (Sidebar)
A list of past semester performances (currently placeholder logic that clears on load, intended to show history).
-   **Details**: Semester, Rank, GPA, Earned Credits.
-   **Actions**: "Detailed Performance Report" button (Disabled placeholder).

## Data Logic
-   **Source**: `getStudentMarks(user.id)`.
-   **Grouping**: Aggregates raw mark entries by `subjectCode`.
-   **GPA Calculation**: Client-side calculation: `(Sum of obtained marks / Sum of max marks) * 10`.
