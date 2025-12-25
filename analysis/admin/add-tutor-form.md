# Assign Tutor Form Analysis
**Context:** Popup Modal in `src/pages/admin/ManageTutors.tsx`

## 1. Structure & Purpose
This form is distinct because it doesn't create a *new user*; instead, it **assigns** an existing Faculty member to a Class (Section/Batch).

- **State**: `formData` (Partial<Tutor>)
- **Dependencies**: Uses `availableFaculty` state (mapped from `getFaculty`) to populate the selection dropdown.

## 2. Form Fields Breakdown
The form is a single-column stack on mobile, expanding to grid for Batch/Section.

| Field Label | Input Type | Logic & Notes |
| :--- | :--- | :--- |
| **Select Faculty** | Select Dropdown | **Auto-Fill Magic**: Selecting a faculty member automatically populates `name` and generates a formatted `email` (lowercase, dots for spaces). |
| **Batch** | Select Dropdown | Defaults to "2024-2028". Options fetched dynamically or from fallback list. |
| **Section** | Select Dropdown | A, B, C, D |
| **No. of Students** | Number Input | Defaults to 60. Represents the class strength. |
| **Status** | Select | Active, On Leave |

## 3. Automation Logic
- **Selection Event**:
  ```javascript
  onValueChange={(v) => {
      const faculty = availableFaculty.find(f => f.id === v);
      setFormData({
          ...formData,
          facultyId: v,
          name: faculty?.name,
          email: `${formatted_email}@college.edu`
      });
  }}
  ```
- **Avatar**: Auto-generated on submission using the faculty's name seed.

## 4. Validation & Submission
- **Required**: Name, Email, Batch (implicitly Faculty ID via selection).
- **Action**: Calls `addTutor` which creates the relationship record.
- **Feedback**: "Tutor assigned successfully!" toast.
