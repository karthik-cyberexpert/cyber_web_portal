# Faculty Circulars Analysis

## Overview
The "Faculty Notices" module serves as the communication channel for administrative and academic announcements targeted at teaching staff. It provides a filtered view of circulars, ensuring faculty only see relevant information.

## Filtering Logic
-   **Audience Filter**: The system automatically filters the global circulars list to show only records where:
    -   `audience === 'faculty'` (Targeted)
    -   `audience === 'all'` (General)
-   **Search Filter**: Real-time filtering by `title` or `description`.

## List View (Cards)
Circulars are presented as interactive cards with visual indicators for importance:
-   **Priority Badges**:
    -   **High**: Red variant (`destructive`).
    -   **Medium**: Orange variant (`warning`).
    -   **Low/Default**: Blue variant (`primary`).
-   **Metadata**:
    -   **Category**: Tagged categorization (e.g., Academic, HR).
    -   **Date**: Publication date.
    -   **Description**: Full text content.

## Actions
-   **Download PDF**: Allows downloading attached documents (Button disabled if no attachment exists).
-   **Mark as Read**: Acknowledgment action (Currently UI-only placeholder).

## Data Logic
-   **Source**: `getCirculars()` from the central data store.
-   **State**: Local state manages the filtered list and search term.
