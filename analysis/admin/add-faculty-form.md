# Add Faculty Form Analysis
**Context:** Popup Modal in `src/pages/admin/ManageFaculty.tsx`

## 1. Structure & State
- **State Object**: `formData` (Partial<Faculty>)
- **Trigger**: `handleAdd` initializes form with default values (`designation` defaulting to 'Assistant Professor', `status` to 'Active').

## 2. Form Fields Breakdown
The grid layout (`grid-cols-1 md:grid-cols-2`) contains the following inputs:

### Identity & Contact
| Field Label | Input Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| **Full Name** | Text Input | Yes | |
| **Employee ID** | Text Input | Yes | Unique identifier (e.g., EMP001). |
| **Email** | Email Input | Yes | |
| **Phone** | Text Input | No | |
| **Address** | Text Input | No | Full width spanning 2 columns. |

### Professional Details
| Field Label | Input Type | Options / Default |
| :--- | :--- | :--- |
| **Designation** | Select | Professor, Associate Professor, Assistant Professor, Lecturer |
| **Qualification** | Text Input | e.g., Ph.D in Computer Science |
| **Specialization** | Text Input | e.g., Machine Learning |
| **Experience** | Number Input | Years of experience. |
| **Date of Joining** | Date Input | Native date picker. |
| **Status** | Select | Active, On Leave, Resigned |

### Missing / Implicit Fields
- **Subjects & Sections**: The `data-store` supports `subjects` and `sections` arrays, and the `addFaculty` function in this component initializes them as `[]` or preserves existing data. However, there are **no input fields** in this specific modal code to add/edit these arrays. They might be managed in a separate detailed view or future implementation.

## 3. Validation & Submission
- **Validation**: Checks `name`, `employeeId`, and `email` for truthiness.
- **Action**: Calls `addFaculty` or `updateFaculty`.
- **Feedback**: Displays success toast via `sonner`.
