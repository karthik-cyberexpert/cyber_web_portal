# Student Personal Details Analysis

## Overview
The "Personal Details" page acts as the "Identity Matrix," providing a comprehensive, read-only view of the student's verified profile data. It organizes information into logical thematic groups.

## Profile Card (Left Column)
A visually rich card displaying the student's core identity and status.
-   **Visuals**: Avatar with a "Camera" edit button overlay.
-   **Identity**: Name, Class, and Year.
-   **Badges**: Status badge (e.g., ACTIVE) in the top right.
-   **Metrics**:
    -   **Digital Trust Score**: Visual progress bar (Mocked at 94%).
    -   **Global GPA**: CGPA display.
    -   **Attendance**: Aggregate attendance percentage.
-   **Verification**: "Blockchain Verified Profile" indicator at the bottom.

## Information Groups (Right Column)
Data is segmented into four cards for readability:
1.  **Identity & Core**: Name, Roll Number, Email, Phone.
2.  **Biological & Demographics**: DOB, Gender, Blood Group, Nationality, Address.
3.  **Support Network**: Guardian Name and Contact.
4.  **Professional Footprint**: LinkedIn, GitHub, and Portfolio URLs.

## Actions
-   **Edit Registry**: Button to request profile updates (Placeholder).

## Data Logic
-   **Source**: `getStudents()` filtered by the logged-in user's ID or Email.
-   **State**: Local state holds the `student` object.
