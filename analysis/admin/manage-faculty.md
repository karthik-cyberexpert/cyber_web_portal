# Manage Faculty Page Analysis
**Component:** `src/pages/admin/ManageFaculty.tsx`

## 1. Page Overview
The "Manage Faculty" page allows administrators to oversee the institution's teaching staff. It provides full CRUD capabilities, specialized filtering for academic designations, and detailed profile views including subject expertise.

## 2. Key Features

### Data Management
- **State**: Manages a local list of faculty members fetched from `data-store` (`getFaculty`).
- **Filtering**:
    - **Search**: Filters by Name, Employee ID, Email, or Specialization.
    - **Designation**: Dropdown to filter by role (Professor, Associate Prof, Assistant Prof, Lecturer).
    - **Status**: Filter by employment status (Active, On Leave, Resigned).

### Statistics Headers
Four `StatCard` components provide a breakdown of staff hierarchy:
- **Total Faculty**: Overall headcount.
- **Professors**: Count of Full Professors.
- **Associate Professors**: Count of Associate Professors.
- **Assistant Professors**: Combined count of Assistant Professors and Lecturers.

### Faculty Table
- **Pagination**: Client-side pagination (10 items per page).
- **Columns**:
    - Faculty (Avatar + Name + Email)
    - Employee ID
    - Designation (Color-coded badges)
    - Specialization
    - Experience (In years)
    - Status
    - Actions (Dropdown menu)

## 3. Operations & Modals

### Add / Edit Faculty (Dialog)
- **Form Fields**:
    - **Personal**: Full Name, Email, Phone, Address, Date of Joining.
    - **Professional**: Employee ID, Designation, Qualification, Specialization, Experience.
    - **System**: Status.
- **Subjects/Sections**: The `subjects` and `sections` arrays are present in the `addFaculty` call but currently lack specific UI input fields in the provided code snippet (defaulting to empty arrays or existing data).
- **Validation**: Requires Name, Employee ID, and Email.
- **Avatar**: Auto-generated constant seed avatar based on name.

### View Details (Dialog)
- Extended profile view showing:
    - Basic info (Phone, Email).
    - Academic info (Qualification, Specialization).
    - **Experience**: Highlighted metric.
    - **Subjects Handled**: Displays a list of tags (though input mechanism is hidden/implicit in this file version).

### Delete Faculty (Dialog)
- Standard confirmation modal before permanent deletion.

## 4. UI Design Systems
- **Badges**:
    - **Designation**: Distinct colors for hierarchy (Professor=Primary, Associate=Accent, Assistant=Info, etc.).
    - **Status**: Consistent status colors with other modules (Active=Success, Resigned=Destructive).
- **Layout**: Consistent "Header -> Stats -> Filters -> Table" vertical flow.

## 5. Dependencies
- **Components**: `StatCard`, `Button`, `Input`, `Select`, `Dialog`.
- **Icons**: `GraduationCap`, `BookOpen`, `UserCheck`, `Users` (from `lucide-react`).
- **Data Store**: `getFaculty`, `addFaculty`, `updateFaculty`, `deleteFaculty`.
