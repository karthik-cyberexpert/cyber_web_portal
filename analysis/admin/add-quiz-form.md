# Add Quiz Form Analysis
**Context:** Popup Modal in `src/pages/admin/LMSManagement.tsx`

## 1. Structure & Purpose
This form triggers the "Deployment" of a new quiz to the LMS. It configures the metadata that students will see before starting an assessment.

## 2. Form Fields
| Field Label | Input Type | Options / Default | Notes |
| :--- | :--- | :--- | :--- |
| **Quiz Title** | Text Input | e.g. "Unit 1 Fundamentals" | Required. |
| **Subject Code** | Text Input | e.g. "CS301" | Used for filtering & grouping. |
| **Difficulty** | Select | Easy, Medium, Hard | Determines badge color. |
| **Qs Count** | Number Input | Number of questions involved. | Display only (questions aren't added here). |
| **Duration** | Text Input | e.g. "30 mins" | Free text currently. |
| **Deadline** | Date Input | YYYY-MM-DD | Defines when the quiz expires. |

## 3. Logic & Actions
- **State**: `newQuiz` object holds the configuration.
- **Validation**: Strict check for Title, Subject Code, and Deadline.
- **Visuals**:
    - Labels use `text-[10px] font-black uppercase tracking-widest` to match the "Matrix" aesthetic.
    - Submit button uses a "Deploy to LMS" label with a `Send` icon.
- **Output**: Creates a `Quiz` object with status `active` and pushes it to the data store.
