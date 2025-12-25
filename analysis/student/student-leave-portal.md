# Student Leave Portal Analysis

## Overview
The Leave Portal enables students to formally request leave or On-Duty (OD) permissions and track the status of their applications.

## Application Interface
-   **Toggle**: "Apply Leave / OD" button reveals the application form.
-   **Access Control**: Button is disabled and locked if `student.status === 'Graduated'`.
-   **Form Fields**:
    -   **Type**: Dropdown (Sick Leave, Casual Leave, OD - Academic, OD - ECA).
    -   **Dates**: Start and End date pickers.
    -   **Contact**: Emergency phone number.
    -   **Reason**: Text area for explanation.
-   **Sidebar Info**:
    -   **Leave Balance**: Progress bars for Sick, Casual, and OD limits (Mocked totals).
    -   **Guidelines**: Static list of rules (e.g., "Apply 24h in advance").

## History View
Displays a list of past applications.
-   **Cards**: Each item shows Type, Date Range, Status Badge, and Reason.
-   **Status Visuals**:
    -   **Approved**: Green CheckCircle.
    -   **Rejected**: Red XCircle.
    -   **Pending**: Yellow Clock.

## Data Logic
-   **Source**: `getLeaveRequests()` filtered by `userId`.
-   **Action**: `addLeaveRequest()` appends a new record with status 'pending'.
