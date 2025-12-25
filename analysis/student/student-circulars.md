# Student Circulars Analysis

## Overview
The "Circulars & Notices" module acts as a digital notice board for students, aggregating announcements from academic, examination, and administrative departments.

## Notice Display
Announcements are presented as cards with key metadata:
-   **Priority Badge**: Color-coded usage (High/Red, Medium/Orange, Default/Blue) to indicate urgency.
-   **Category Tag**: Helps identifying the nature of the notice (e.g., Examination, Placement).
-   **Actions**:
    -   **Download Attachment**: Enabled if a file is linked.
    -   **Read Full**: Expands content (UI placeholder).

## Filtering & Navigation
-   **Sidebar Categories**: Allows filtering notices by specific topics (Academic, Events, etc.).
-   **Global Search**: Filters by title and description content.
-   **Audience Logic**: Automatically filters `getCirculars()` to show only notices marked for 'all' or 'students'.

## Stats
-   **Quick Stats**: Simple count of total available notices for the current month.
