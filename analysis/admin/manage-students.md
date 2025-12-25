# Manage Students Page Analysis
**Component:** `src/pages/admin/ManageStudents.tsx`

## 1. Page Overview
The "Manage Students" page is a comprehensive CRUD (Create, Read, Update, Delete) interface for student administration. It allows admins to filter, search, view detailed profiles, and modify student records.

## 2. Key Features

### Data Management
- **State**: Manages a local list of students fetched from `data-store` (`getStudents`).
- **Filtering**: Multi-faceted filtering system:
    - **Search**: Real-time filtering by Name, Roll Number, or Email.
    - **Batch**: Dropdown filter for academic batches (e.g., 2024-2028).
    - **Section**: Filter by Section (A, B, C, D).
    - **Status**: Filter by student status (Active, Graduated, On Leave, Dismissed).

### Statistics Headers
Four `StatCard` components provide instant counts:
- **Total Students**: Total record count.
- **Active**: Count of students with 'Active' status.
- **Graduated**: Count of alumni.
- **On Leave**: Count of students currently on leave.

### Student Table
- **Pagination**: Client-side pagination (10 items per page).
- **Columns**:
    - Student (Avatar + Name + Email)
    - Roll Number
    - Batch
    - Section
    - Attendance (Visual progress bar + percentage)
    - CGPA (Color-coded based on performance)
    - Status (Badges with distinct styles)
    - Actions (Dropdown menu)

## 3. Operations & Modals

### Add / Edit Student (Dialog)
- **Form Fields**:
    - Personal: Name, Email, Phone, Date of Birth, Address.
    - Academic: Roll Number, Batch, Section, Year, Semester.
    - Enrollment: Type (Regular/Lateral), Admission Type (Govt/Mgmt/NRI).
    - Status: Active/Leave/Graduated/Dismissed.
    - Guardian: Name, Phone.
- **Validation**: Checks for required fields (Name, Roll No, Email).
- **Avatar**: Auto-generated using DiceBear API based on name seed.

### View Details (Dialog)
- Read-only modal displaying the full student profile including extended academic and personal details not shown in the main table.

### Delete Student (Dialog)
- Confirmation modal before removing a record permanently.

## 4. UI/UX Elements
- **Styling**: Uses `glass-card` classes for panels and `motion` for entry animations.
- **Status Badges**:
    - Active: Green (Success)
    - Graduated: Blue (Info)
    - On Leave: Yellow (Warning)
    - Dismissed: Red (Destructive)
- **Performance Indicators**:
    - Low Attendance (<75%) shown in red.
    - High CGPA (>=8) shown in green.

## 5. Dependencies
- **Components**: `Button`, `Input`, `Select`, `Dialog`, `DropdownMenu`, `StatCard`.
- **Icons**: `lucide-react` (Search, Plus, Filter, Trash2, Edit2, etc.).
- **Utilities**: `framer-motion` (animations), `sonner` (toast notifications).
