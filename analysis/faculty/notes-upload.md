# Faculty Notes Upload Analysis

## Overview
The "Notes Library & Upload" module enables faculty to distribute academic materials to students. It supports various resource types and provides tracking metrics for engagement.

## Upload Functionality
A dialog-based form (`Dialog`) allows faculty to add new resources:
-   **Fields**:
    -   **Title**: Descriptive name of the resource.
    -   **Subject**: Selected from the faculty's assigned subjects.
    -   **Class/Section**: Target audience (Section).
    -   **Resource Type**:
        -   Lecture Notes
        -   Question Paper
        -   Lab Manual
-   **Process**:
    -   Simulates an upload delay (`setTimeout`).
    -   Calls `addResource()` to persist data.
    -   Refreshes the list upon completion.

## Resource Library (List View)
Displays uploaded files in a searchable grid.
-   **Search**: Filters resources by title.
-   **Card Details**:
    -   File Type icon (PDF, etc.).
    -   Subject Code badge.
    -   Target Class/Section.
    -   Upload Date.
    -   Download Count (tracked via `downloads` property).
-   **Actions**:
    -   **Delete**: Removes the resource via `deleteResource()`.
    -   **Download**: Placeholder button.

## Statistics (Sidebar)
Provides a quick summary of the faculty's contributions:
1.  **Total Files**: Count of all uploaded resources.
2.  **Total Downloads**: Aggregate download count across all files.
3.  **Storage Status**: Visual progress bar indicating space usage (Mocked at 0.2%).

## Data Logic
-   **Fetching**: Retrieves all resources via `getResources()` and filters by `facultyId`.
-   **Initialization**: Pre-fills the upload form with the faculty's first assigned subject and section for convenience.
