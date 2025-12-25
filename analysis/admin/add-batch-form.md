# Add Batch Form Analysis
**Context:** Popup Modal in `src/pages/admin/BatchesClasses.tsx`

## 1. Concept: Auto-Initialization
Unlike simple forms, this "New Batch" wizard initializes an entire ecosystem. It doesn't just create a batch record; it automatically sets up the academic structure for the **1st Year** of that batch.

## 2. Form Fields
| Field Label | Input Type | Default | Logic |
| :--- | :--- | :--- | :--- |
| **Start Year** | Number Input | Current Year | Determines the 4-year cycle label (e.g., 2024–2028). |
| **No. of Sections** | Number Input | 1 | Determines how many sections to auto-generate (A, B, C...). |

## 3. Automation Logic (`handleAddBatch`)
1.  **Validation**:
    - Checks start year validity.
    - Prevents duplicates (uniqueness check on `startYear`).
2.  **Batch Creation**: Stores `startYear` and calculated `endYear` (Start + 4).
3.  **Class Creation**: Automatically creates "1st Year" (`yearNumber: 1`) and marks it `isActive: true`.
4.  **Section Generation**: Loop runs `n` times (based on input) to create sections named A, B, C... using `String.fromCharCode(65 + i)`.

## 4. Section Management Forms
There are distinct, smaller dialogs for managing sections within an existing class:
- **Add Section**: Simple input for Section Name (max length 2). Checks for duplicates in current class.
- **Edit Section**: Renames an existing section.
