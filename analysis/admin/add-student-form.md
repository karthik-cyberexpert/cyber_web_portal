# Add Student Form Analysis
**Context:** Popup Modal in `src/pages/admin/ManageStudents.tsx`

## 1. Component Structure
The "Add Student" functionality is implemented as a `Dialog` component triggered by the "Add Student" button. It reuses the same modal structure for "Edit Student", switching title and logic based on the `isAddModalOpen` state.

## 2. Form State & Data
- **State Object**: `formData` (Partial<Student>)
- **Default/Initial Values**:
    - `batch`: Defaults to "2024-2028" (or first available batch).
    - `section`: Defaults to "A".
    - `enrollmentType`: Defaults to "Regular".
    - `admissionType`: Defaults to "Government".
    - `status`: Defaults to "Active".
    - `attendance`: Defaults to 100.
    - `cgpa`: Defaults to 0.

## 3. Form Fields Breakdown
The form is organized into a responsive grid (`grid-cols-1 md:grid-cols-2`).

### Personal Information
| Field Label | Input Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| **Full Name** | Text Input | Yes | Used to generate Avatar seed. |
| **Email** | Email Input | Yes | |
| **Phone** | Text Input | No | Placeholder: `+91 ...` |
| **Date of Birth** | Date Input | No | Native date picker. |
| **Address** | Text Input | No | Spans 2 columns (`md:col-span-2`). |

### Academic Information
| Field Label | Input Type | Options / Default |
| :--- | :--- | :--- |
| **Roll Number** | Text Input | Required field. |
| **Batch** | Select | Dynamic from `BATCHES_KEY` or fallback list (2021-2025 to 2024-2028). |
| **Section** | Select | A, B, C, D |
| **Status** | Select | Active, Graduated, On Leave, Dismissed |

### Enrollment Details
| Field Label | Input Type | Options |
| :--- | :--- | :--- |
| **Enrollment Type** | Select | Regular, Lateral Entry |
| **Admission Type** | Select | Government, Management, NRI |

### Guardian Information
| Field Label | Input Type | Notes |
| :--- | :--- | :--- |
| **Guardian Name** | Text Input | Parent/Guardian name. |
| **Guardian Phone** | Text Input | Contact number. |

## 4. Logic & Validation
- **Trigger**: `handleAdd` function resets `formData` to default values before opening the modal.
- **Validation**:
    - The `submitAdd` function checks for truthiness of `name`, `rollNumber`, and `email`.
    - **Error**: Shows `toast.error('Please fill in all required fields')` if validation fails.
- **Submission**:
    - Calls `addStudent` from `data-store`.
    - Auto-generates an avatar URL using DiceBear API: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`.
    - Updates local state `setStudents` immediately for UI feedback.
    - Closes modal and shows success toast.

## 5. UI Elements
- **Layout**: Two-column grid layout for desktop, single column for mobile.
- **Actions**:
    - **Cancel**: Closes modal without saving.
    - **Add Student**: Triggers validation and submission (uses `variant="gradient"`).
