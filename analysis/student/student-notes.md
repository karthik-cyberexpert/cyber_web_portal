# Student Notes & Question Bank Analysis

## Overview
The "Learning Resources" module provides access to a repository of study materials, lecture notes, and question papers uploaded by faculty.

## Interface
-   **Search Bar**: Prominent global search input filtering resources by title, subject, or code.
-   **Quick Filters (Sidebar)**:
    -   **Type Filters**: Preset buttons for Lecture Notes, Question Bank, Lab Manuals (UI only, logic pending).
    -   **Subject Count**: Dynamic list of subjects available in the repository with a count of files for each.

## Content Area (Tabs)
-   **Views**:
    -   **All Resources**: Default grid view.
    -   **Recently Added**: Chronological sort (Placeholder tab logic).
    -   **Favorites**: User-saved resources (Placeholder tab logic).
-   **Resource Card**:
    -   **Header**: Icon distinguishing Note vs. Question Paper.
    -   **Metadata**: Subject Code, Type, File Size, File Type.
    -   **Actions**:
        -   **Open**: External link icon (Placeholder).
        -   **Download**: Direct file download (Placeholder).

## Data Logic
-   **Source**: `getResources()`.
-   **Filtering**: Client-side filtering based on `searchTerm` matching title or subject.
-   **aggregation**: Dynamically computes unique subjects and their file counts for the sidebar.
