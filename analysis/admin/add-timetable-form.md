# Edit/Add Timetable Slot Form Analysis
**Context:** Popup Modal in `src/pages/admin/Timetable.tsx`

## 1. Structure & Purpose
This form serves dual purposes: **Creating** a new class entry in an empty slot or **Updating** an existing one. It is triggered by clicking any cell in the timetable grid.

## 2. Form Fields
| Field Label | Input Type | Source/Options | Notes |
| :--- | :--- | :--- | :--- |
| **Day** | Input (Disabled) | Clicked cell's day | Read-only context. |
| **Period** | Input (Disabled) | Clicked cell's period | Read-only context (e.g., "Period 1"). |
| **Subject Name** | Text Input | User Entry | e.g., "Data Structures". |
| **Subject Code** | Text Input | User Entry | e.g., "CS301". |
| **Room** | Text Input | User Entry | e.g., "LH-101". |
| **Faculty** | Select | `getFaculty()` list | Maps ID to Name on selection. |
| **Type** | Select | Theory, Lab, Tutorial, Free | Determines color coding on grid. |

## 3. Logic & Persistence
- **State Management**: Uses `editingSlot` state to hold temporary values.
- **Initial State**:
    - If cell has data: Pre-fills with existing `TimetableSlot` data.
    - If cell is empty: Initializes with target Day/Period and defaults (Type: 'theory').
- **Faculty Mapping**: When a Faculty ID is selected from dropdown, it searches `facultyList` to automatically set `facultyName` for display performance.
- **Save Logic**:
    - Filters out *any* existing slot for that specific coordinate (Day + Period + Section).
    - Pushes the new object to the array (only if `subject` is provided).
    - Calls `saveTimetable(filtered)`.
- **Delete Logic**: "Clear Slot" button (visible only if editing existing slot) removes item via `deleteTimetableSlot`.

## 4. Validation
- Minimal validation: The primary check is `if (editingSlot.subject)` before saving. If subject is empty, it effectively acts as a delete/clear operation without error.
