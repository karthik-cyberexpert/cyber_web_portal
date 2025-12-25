# Faculty My Classes Analysis

## Overview
The "My Classes" module provides faculty with a consolidated view of all courses they are teaching. It offers high-level statistics and detailed cards for each specific subject-section combination.

## Key Statistics (Top Row)
Three cards provide a quick snapshot of teaching engagement:
1.  **Total Courses**: Number of unique Subject-Section pairs assigned to the faculty.
    -   *Icon*: `BookOpen` (Primary Color)
2.  **Total Students**: Aggregate count of students enrolled across all assigned sections.
    -   *Icon*: `Users` (Accent Color)
3.  **Avg Attendance**: Average attendance percentage across all classes (currently mocked data).
    -   *Icon*: `TrendingUp` (Emerald Color)

## Class List (Cards)
Each class is represented by a detailed card containing:
-   **Header**:
    -   **Course Code**: Mocked code (e.g., CS301).
    -   **Subject Name**: Derived from faculty's assigned subjects.
    -   **Section**: Assigned section (e.g., Section A).
-   **Metrics & Details**:
    -   **Syllabus Progress**: Progress bar showing completion percentage (Mocked).
    -   **Strength**: Number of students enrolled (Calculated from `getStudents` filtering).
    -   **Next Class**: Date/Time of the next scheduled session (Mocked).
    -   **Location**: Room number (Mocked).

## Actions
-   **Course Syllabus**: Button to view/manage syllabus (Placeholder).
-   **Bulk Attendance**: Button to launch attendance marking interface (Placeholder).
-   **View Class Details**: Arrow icon on each card for detailed view (Placeholder).

## Data Logic
-   **Class Generation**: The system currently generates the class list by creating a Cartesian product of the faculty's `subjects` and `sections` arrays.
    -   *Note*: This logic assumes the faculty teaches *every* assigned subject to *every* assigned section, which might need refinement for complex schedules.
-   **Student Count**: Dynamic filtering of the `allStudents` array based on the section.

## Analytics Spotlight
A motivational section at the bottom provides qualitative feedback on teaching performance (currently static content).
