# Faculty Personal Details Analysis

## Overview
The "Personal Details" page for faculty members serves as a comprehensive digital profile, displaying professional information, academic credentials, and contact details. It is designed to be a read-only view with an option to request updates.

## Profile Header (Left Column)
Visual identity and primary contact information.
-   **Avatar**: Displays user's profile picture or initial fallback.
-   **Identity**: Name and Designation.
-   **Badges**:
    -   Employee ID
    -   Employment Status (e.g., Active)
-   **Contact Info**:
    -   Email Address
    -   Contact Number
    -   Work Location (Office/Cabin)

## Professional Background
Detailed employment history and specialization.
-   **Primary Specialization**: The faculty's main area of expertise.
-   **Experience**: Total years of academic experience.
-   **Date of Joining**: The date they joined the institution.
-   **Status**: Current employment status (Verified/Active).

## Academic Qualifications
A grid display of the faculty's educational background.
-   **Data Points**:
    -   Degree Name
    -   Institution/University
    -   Year of Passing ("Class of 20XX")
-   **Visuals**: Distinct icons for primary vs. secondary degrees.

## Additional Information
-   **Registered Address**: The faculty member's physical address on file.

## Actions
-   **Update Details**: A button allows faculty to request updates to their profile (Implementation pending/Link to update form).

## Data Sources
-   `useAuth()`: Identifies the currently logged-in user.
-   `getFaculty()`: Fetches the detailed faculty record matching the logged-in user's ID or email.
