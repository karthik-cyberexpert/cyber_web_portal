# Batches & Classes Page Analysis
**Component:** `src/pages/admin/BatchesClasses.tsx`

## 1. Page Overview
The "Batches & Classes" page allows administrators to configure the academic structure of the institution. It manages the hierarchy:
**Batch** (e.g., 2024-2028) -> **Class** (e.g., 1st Year) -> **Section** (A, B, C).

## 2. Key Features

### Academic Hierarchy Management
- **Batches**: Represents a 4-year academic cycle (e.g., Start Year 2024 -> End Year 2028).
- **Classes**: Represents a specific academic year within a batch (1st, 2nd, 3rd, 4th Year). Only one Class is "Active" per batch at a time.
- **Sections**: Subdivisions of a class (e.g., Section A, B) where students are enrolled.

### Interface & Layout
- **Access Control**: Strict check `isAdmin()` blocking non-admin users with an "Access Denied" screen.
- **Card-Based Lists**: Each Batch is rendered as a `Card` containing its own isolated context for Classes and Sections.
- **Tabs System**: Separate tabs for:
    - **Current Academic Year** (Active Class & Sections)
    - **History** (Previous/Completed Classes)

### Operations
- **Create Batch**: Initializes a new lifecycle with a 1st Year class and auto-generated sections.
- **Promote Class**: Moves a batch to the next academic year (e.g., 1st -> 2nd). Deactivates the old class and creates a new one.
- **Manage Sections**: Add, Edit, or Delete sections dynamically within the active class.
- **History Tracking**: Keeps records of past years (e.g., a 2nd Year batch will show 1st Year in history).

## 3. UI/UX Elements
- **Styling**: Heavy use of italics and gradients (`italic`, `bg-gradient-to-r`) for a distinct visual identity compared to other admin pages.
- **Animations**: `framer-motion` used for list reordering giving a "popLayout" feel.
- **Empty States**: Custom dashed-border empty states when no batches or sections exist.

## 4. Dependencies
- **Data Store**: Uses local storage keys `BATCHES_KEY`, `CLASSES_KEY`, `SECTIONS_KEY` via `getData`/`saveData`.
- **UI Components**: `Tabs`, `Card`, `Dialog`, `Collapsible`, `Badge`.
- **Icons**: `GraduationCap`, `Clock`, `History`, `ShieldAlert`.
