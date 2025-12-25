# Faculty Timetable Analysis

## Overview
The "Academic Timetable" module offers faculty a weekly view of their teaching schedule. It integrates standard calendar features with specific academic metrics like teaching load and session types.

## Schedule Grid
A table-based layout representing the weekly schedule:
-   **Rows**: Time slots (09:00 AM - 04:00 PM).
-   **Columns**: Days of the week (Monday - Friday).
-   **Cells**:
    -   Displays `Subject`, `Class/Section`, and `Room Number`.
    -   **Color Coding**: Distinguished styles for 'Theory' (Primary), 'Lab' (Accent/Blue), and 'Tutorial' (Emerald).

## Analytics & Insights
The module includes a bottom section with two key cards:

### 1. Upcoming Seminars
A list of upcoming academic events or mandatory meetings.
-   *Data Points*: Event Name, Relative Date (e.g., "Upcoming Friday"), and Status tag (e.g., "Department").

### 2. Teaching Load Analytics
Visual breakdown of the faculty's workload.
-   **Total Hours**: Aggregated weekly contact hours.
-   **Breakdown**: Count of hours per session type:
    -   Theory
    -   Lab
    -   Tutorial

## Actions
-   **Download PDF**: Export the schedule (Placeholder).
-   **Sync Calendar**: Integration with external calendars (Placeholder).
-   **Navigation**: Previous/Next Month controls (UI mostly, data is currently weekly-based).

## Data Logic
-   **Source**: Fetches from `getTimetable()` then filters for the current user (`facultyId` or `facultyName`).
-   **Time Mapping**: Maps integer-based 'period' numbers from the data store to display time strings (e.g., `Period 1` -> `09:00 AM`).
