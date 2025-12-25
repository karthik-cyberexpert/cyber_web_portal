# Add Circular Form Analysis
**Context:** Popup Modal in `src/pages/admin/Circulars.tsx`

## 1. Structure & Purpose
This form allows admins to draft notices that are immediately "published" (saved to the data store).

## 2. Form Fields
| Field Label | Input Type | Options / Default |
| :--- | :--- | :--- |
| **Title** | Text Input | Required. |
| **Description** | Textarea | Required. Support multi-line content (rows=4). |
| **Category** | Select | Academic, Examination, Events, Administrative. |
| **Priority** | Select | Low, Medium, High. |
| **Audience** | Select | Everyone, Students Only, Faculty Only. |
| **Date** | Date Input | Defaults to Today (ISO format). |

## 3. Logic & Actions
- **State**: `newCircular` object holds the draft.
- **Initialization**: Resets fields to defaults (Category: 'Academic', Priority: 'Low', Date: Today) whenever a publish action completes.
- **Validation**: Checks `if (!newCircular.title || !newCircular.description)`. Shows error toast if missing.
- **Publish Action**: 
    - Calls `addCircular`.
    - Updates local state list via `getCirculars()` immediately.
    - Closes modal.
    - Shows success toast.
