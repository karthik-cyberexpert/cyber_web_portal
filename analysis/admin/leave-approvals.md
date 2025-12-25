# Leave Approvals Page Analysis
**Component:** `src/pages/admin/LeaveApprovals.tsx`

## 1. Page Overview
The "Department Leave Portal" acts as a processing center for leave applications submitted by students. HODs/Admins use this interface to review reasons and grant or deny permissions.

## 2. Key Features

### Workflow & States
- **Pending**: Requests awaiting action. Default landing view.
- **History**: Archive of previously processed (Approved/Rejected) requests.

### Filters & Search
- **Tabs**: "Pending" vs "History" toggle switch.
- **Search**: Filters request cards by:
    - Student Name
    - Leave Type (e.g., Medical, Personal)

### Request Card Design
Each request is displayed as a detailed card containing:
- **Identity**: Student Avatar & Name.
- **Badges**:
    - **Type**: (Medical, Personal, etc.)
    - **Status**: (Pending, Approved, Rejected) - colored dynamically.
- **Meta Data**:
    - **Dates**: Start Date -> End Date range.
    - **Contact**: Emergency contact number during leave.
    - **Reason**: A prominent, styled snippet ("Reason for Leave") displaying the student's justification.
- **Processing Info** (History only): Shows who processed the request (`processedBy`) and when.

## 3. Operations
- **Approve**:
    - Visual: Gradient green button.
    - Action: Updates status to 'approved' and records the admin's name.
- **Reject**:
    - Visual: Outline red button.
    - Action: Updates status to 'rejected'.

## 4. UI/UX Elements
- **Animations**: Extensive use of `framer-motion` (`layout` prop) for smooth transitions when cards are removed from the pending list or filtered.
- **Styling**: Distinct typography (uppercase, tracking-widest) gives it a formal "Portal" feel.
- **Empty State**: Custom "No Requests Found" graphic.

## 5. Dependencies
- **Data Store**: `getLeaveRequests`, `updateLeaveStatus`.
- **Auth Context**: `useAuth` (to record *who* performed the approval).
- **Icons**: `Building2`, `MessageSquare`, `Calendar`, `ChevronRight` (lucide-react).
