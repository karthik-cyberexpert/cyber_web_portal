# Student Sidepanel Analysis

## Overview
The student sidepanel provides navigation to all student-centric modules, allowing access to academic records, learning resources, and administrative tools.

## Navigation Links
The sidebar contains the following links for the 'Student' role:

| Label | Icon | Route Path | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `LayoutDashboard` | `/student` | Central hub for overview and quick stats. |
| **Personal Details** | `User` | `/student/personal` | View and manage personal profile information. |
| **Academic Details** | `GraduationCap` | `/student/academic` | Academic history and current semester details. |
| **Timetable & Syllabus** | `Calendar` | `/student/timetable` | Class schedule and course progression. |
| **Marks & Grades** | `ClipboardList` | `/student/marks` | Assessment scores and grading history. |
| **Notes & Question Bank** | `BookOpen` | `/student/notes` | Access to study materials and repositories. |
| **Assignments** | `FileText` | `/student/assignments` | View and submit course assignments. |
| **Circulars** | `Bell` | `/student/circulars` | Official announcements and notices. |
| **Leave Portal** | `ExternalLink` | `/student/leave` | Apply for and track leave requests. |
| **LMS Quiz** | `Trophy` | `/student/lms` | Online quizzes and assessments. |
| **ECA & Achievements** | `Sparkles` | `/student/eca` | Extra-curricular activities and awards. |
| **Resume Builder** | `FileCheck` | `/student/resume` | Tool to generate professional resumes. |

## Structure & Behavior
-   **Responsive Design**: Collapsible sidebar (`collapsed` prop) that shows/hides text labels while keeping icons visible.
-   **Role-Based Rendering**: Uses `getLinksByRole` to dynamically render links based on the authenticated user's role (`student`).
-   **Active State**: Highlights the current route using `NavLink` with visual indicators (background color, scale effect, and active indicator bar).
-   **Footer**: Contains Theme Toggle (`Sun`/`Moon`), User Profile summary, and Logout button.
