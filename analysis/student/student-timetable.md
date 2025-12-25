# Student Timetable & Syllabus Analysis

## Overview
This module combines the weekly academic schedule and detailed course curriculum tracking into a unified tabbed interface.

## Tab 1: Timetable
Allows students to view their daily schedule.
-   **Day Filter**: Horizontal day selector (Mon-Sun).
-   **Session Cards**:
    -   **Time**: Start and End time.
    -   **Type**: Label for 'Theory' or 'Lab' (Visual distinction).
    -   **Subject**: Color-coded subject indicator.
    -   **Details**: Room number and Faculty name with avatar.
-   **Logic**:
    -   Fetches all timetable slots via `getTimetable()`.
    -   Filters by Student's `batch/year` and `section`.
    -   Client-side filtering by the selected day.

## Tab 2: Syllabus
Tracks curriculum progress for each enrolled subject.
-   **Subject Card**:
    -   **Header**: Subject Code, Name, Type (Core/Elective), and Credits.
    -   **Progress Bar**: Visualizes the percentage of completed units.
    -   **Unit Breakdown**: An accordion list detailing each unit.
        -   **Status**: Indicators for 'Completed' (Checkmark), 'In Progress' (Pulse), or 'Pending'.
-   **Logic**:
    -   Fetches syllabus data via `getSyllabus()`.
    -   Calculates completion % dynamically based on the status of individual units.
