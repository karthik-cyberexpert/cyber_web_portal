# LMS Management Page Analysis
**Component:** `src/pages/admin/LMSManagement.tsx`

## 1. Page Overview
The "LMS Assessment Matrix" is a command center for managing digital assessments. It focuses on the deployment of Quizzes and the analysis of student performance across these assessments.

## 2. Key Metrics & Analytics

### Global Stats
- **Total Quizzes**: Count of all deployed assessments.
- **Submissions**: Total attempts made by students across all quizzes.
- **Avg Score**: Mean percentage score across all results.
- **Pass Rate**: Percentage of attempts scoring >= 50%.

### Visualizations
- **Difficulty Index (Pie Chart)**: Breakdown of active quizzes by difficulty tier:
    - **Easy**: Emerald Theme.
    - **Medium**: Amber Theme.
    - **Hard**: Red Theme.

### Leaderboard (Performers Tab)
A logic-driven "Top 5" list:
- **Criteria**: Ranks students by their *highest* score found in the results.
- **Tie-breaker**: Currently simplified (sorts purely by score desc).
- **Display**: Shows Rank, Name, Session Count, and Best Score %.

## 3. Inventory Management (Inventory Tab)
Displays a list of active quizzes:
- **Card Layout**: Each quiz is a row showing:
    - Icon (`Brain`).
    - Title & Subject Code.
    - Question Count.
    - Difficulty Badge.
    - Deadline.
- **Empty State**: Custom italicized message for zero records.

## 4. UI/UX Elements
- **Styling**: Heavy use of "Cyber-academic" styling:
    - **Fonts**: `font-black`, `uppercase`, `tracking-widest` for headers/labels.
    - **Shadows**: `shadow-glow-sm` custom utility.
    - **Colors**: Neon-accented gradients (`from-primary to-accent`).
- **Animations**: `framer-motion` for list entry and tab switching.

## 5. Dependencies
- **Data Store**: `getQuizzes`, `getQuizResults`.
- **Libraries**: `recharts`, `framer-motion`.
- **Icons**: `BookOpen`, `Zap`, `Trophy`, `Target` (lucide-react).
