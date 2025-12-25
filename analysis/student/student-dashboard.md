# Student Dashboard Analysis

## Overview
The Student Dashboard serves as the central hub for students, providing a personalized overview of their academic standing, pending tasks, and recent updates.

## Key Metrics (Stat Cards)
Four primary cards display real-time academic indicators:
1.  **Attendance**: Percentage for the current semester.
    -   *Source*: `student.attendance`
    -   *Visual*: Trending Up icon, Primary variant.
2.  **Internal Average**: Weighted average of marks obtained vs. max marks.
    -   *Calculation*: `Sum(Obtained) / Sum(Max) * 100`
    -   *Visual*: Clipboard Check icon, Accent variant.
3.  **Pending Tasks**: Count of assignments not yet submitted.
    -   *Logic*: `Assignments` (filtered by class/section) matching no `Submission`.
    -   *Visual*: Book Open icon, Warning variant.
4.  **ECA Points**: Cumulative extracurricular activity points.
    -   *Source*: Sum of `credits` from `semesterHistory`.
    -   *Visual*: Trophy icon, Success variant.

## Visualizations

### 1. Attendance Trend
-   **Type**: Area Chart (`recharts`)
-   **Data**: Monthly attendance percentage (Mocked based on base `student.attendance` with variance).
-   **Purpose**: Visualize consistency in attendance over the last 6 months.

### 2. Subject Distribution
-   **Type**: Pie Chart (`recharts`)
-   **Data**: Distribution of total marks obtained across different subjects (`mark.subjectCode`).
-   **Purpose**: Highlight performance focus areas.

## Widgets

### Upcoming Tasks
A list of the top 3 deadlines.
-   **Content**: Assignments or Quizzes (Placeholder types).
-   **Visual**: Icon distinguishing the task type, with Due Date.
-   **Action**: Links to "View All" (UI only).

### Recent Notes
Displays the 3 most recently uploaded resources relevant to the student's subjects.
-   **Content**: Topic, Subject Code, Faculty Name.
-   **Source**: `getResources()` filtered by student's subject codes.

### Progress Trackers
-   **Resume Completion**: Hardcoded estimate (60% or 30%).
-   **Course Progress**: Calculated based on current semester vs. total (8).

## Actions
-   **View Timetable**: Quick link to the specific timetable page.
-   **Add Achievement**: Quick link to ECA section.
-   **Build Resume**: Quick link to Resume Builder.

## Data Logic
-   **Initialization**: `loadStats()` fetches `student`, `marks`, `assignments`, `submissions`, and `resources` to compute all dashboard metrics locally.
-   **Access Control**: Strictly checks `user.role === 'student'`.
