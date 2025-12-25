# Student ECA & Achievements Analysis

## Overview
The "ECA & Achievements" module allows students to document their extracurricular activities, submit them for verification, and earn academic credit points (gamified).

## Achievement Submission
A dialog-based form (`Dialog`) for adding new entries:
-   **Fields**:
    -   **Title**: Achievement name (e.g., Hackathon Win).
    -   **Organization**: Issuer (e.g., IEEE).
    -   **Category**: Dropdown (Technical, Cultural, Sports, Social Service, Leadership).
    -   **Level**: Dropdown (College to International).
    -   **Evidence**: Optional proof link/URL.
-   **Action**: `addAchievement()` creates a record with 'pending' status.

## Gallery & Tracking
-   **Status Badges**:
    -   **Approved**: Green Check with Points added.
    -   **Rejected**: Red X with Remarks displayed.
    -   **Pending**: Yellow Clock.
-   **Filtering**: Sidebar buttons to filter the gallery by category (Technical, Sports, etc.).
-   **Feedback**: Displays remarks from the approver (tutor/admin) if rejected or approved with comments.

## Gamification (Sidebar)
-   **Total Points**: Aggregates points from all approved achievements.
-   **Semester Goal**: Visual progress bar tracking points against a hypothetical target (100 points).

## Data Logic
-   **Source**: `getAchievements()` filtered by `userId`.
-   **Categories**: Maps categories to specific icons (Code, Music, Target, etc.) for visual distinction.
