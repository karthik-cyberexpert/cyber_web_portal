# Student LMS Quiz Analysis

## Overview
The "LMS Quiz Portal" is a gamified assessment center allowing students to take tests, track performance, and compete on a global leaderboard.

## Modules

### Practice Modes
Three quick-access buttons for different assessment styles:
1.  **Practice**: Low-stakes learning.
2.  **Challenge**: Competitive assessment.
3.  **Mock Exam**: Simulation of final exams.

### Quiz Inventory
Switchable tabs between:
-   **Available**: Quizzes where `status !== 'expired'`.
-   **History**: Quizzes where `status === 'expired'`.

### Quiz Card
Displays key information for each assessment:
-   **Metadata**: Subject Code, Difficulty, Duration, Question Count.
-   **Status**:
    -   **LIVE**: Active and available (`status === 'active'`).
    -   **SCHEDULED**: Upcoming (`status === 'scheduled'`).
    -   **CLOSED**: Expired.
-   **Action**: "Begin Session" button (Active only).

## Leaderboard Sidebar
Displays the top 5 performers based on `getQuizResults()`.
-   **Ranking Logic**: Sorts by `Score (Desc)` -> `Time Taken (Asc)`.
-   **Visuals**: Custom trophies/colors for Top 3 ranks.

## Data Logic
-   **Quizzes**: Fetched via `getQuizzes()`.
-   **Results**: Fetched via `getQuizResults()` to calculate the user's Overall Average score.
