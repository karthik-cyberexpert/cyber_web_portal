# Manage Tutors Page Analysis
**Component:** `src/pages/admin/ManageTutors.tsx`

## 1. Page Overview
The "Manage Tutors" page focuses on assigning class teachers (tutors) to specific batches and sections. Unlike general faculty management, this page links a faculty member to a specific academic cohort (Batch + Section), acting as their primary mentor.

## 2. Key Features

### Data Management
- **State**: Manages a list of `Tutor` objects via `getTutors`.
- **Integration**: Fetches available `getFaculty` list to allowing assigning *existing* faculty as tutors.
- **Filtering**:
    - **Search**: By Name, Email, or Batch.
    - **Batch**: Dropdown filter.
    - **Status**: Active/On Leave.

### Statistics Headers
Four `StatCard` components highlight the mentoring scope:
- **Total Tutors**: Number of assigned class teachers.
- **Active Tutors**: Tutors currently available.
- **Students Mentored**: Total count of students under all active tutors.
- **Batches Covered**: Unique count of batches with assigned tutors.

### Tutors Grid Layout
Unlike the table view in Students/Faculty pages, this uses a **Grid Card Layout** (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3...`).
- **Card Content**:
    - Head: Avatar, Name, Designation.
    - Body: Class (Section), Batch, Student Count key-value pairs.
    - Footer: Status badge + "View Class" shortcut.
- **Actions**: View, Edit, Remove (via Dropdown).

## 3. Operations & Modals

### Behaviours
- **Assign Tutor (Add)**: Maps a Faculty member -> Batch + Section.
- **Update Tutor**: Modifies the assignment details.
- **Remove Tutor**: Delete confirmation logic.

## 4. UI Design Systems
- **Cards**: Uses `glass-card` with hover effects (`hover:shadow-card-hover`) for interactivity.
- **Badges**: Standard status colors.
- **Responsive**: Adapts column count based on screen width.

## 5. Dependencies
- **Components**: `StatCard`, `Button`, `Input`, `Select`, `Dialog`.
- **Data Store**: `getTutors`, `getFaculty`, `addTutor`, `updateTutor`.
