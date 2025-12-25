# ECA Analytics & Global Track Page Analysis
**Component:** `src/pages/admin/ECAAnalytics.tsx`

## 1. Page Overview
The "ECA Analytics" page monitors the institution's extra-curricular ecosystem. It serves two functions: providing high-level insights into student participation (Sports, Cultural, Technical, etc.) and acting as a verification portal for achievement logs submitted by students.

## 2. Key Metrics & Analytics

### Engagement Stats
- **Total Logs**: Cumulative count of all achievement entries.
- **Pending Verifications**: Count of items awaiting admin review.
- **Approval Rate**: Percentage of logs marked as 'approved'.
- **Unique Students**: Count of distinct users engaging in ECA.

### Charts
- **Category Breakdown (Pie Chart)**: Visualizes the diverse interests of the student body (Technical vs Sports vs Cultural etc.).
- **Participation Trends (Line Chart)**: Tracks activity volume month-over-month.

### Leaderboard (Points Board Tab)
- **Top 5 Ranking**: Dynamically calculates scores based on approved achievements.
- **Visuals**: Gold/Silver/Bronze styling for top ranks.

## 3. Workflow
- **Verification Queue (Queued Approvals Tab)**:
    - Lists pending items.
    - Displays detailed meta-data: Student Name, Category, Level (District/State/National), Date, and the Verifying Organization.
    - **Action**: "Verify Details" button (currently a placeholder for opening a detailed review modal).

## 4. UI/UX Elements
- **Gamified Aesthetics**:
    - **Trophy/Medal Icons**: Heavily used to reinforce the "Achievement" theme.
    - **Badges**: Color-coded by Category and Level (e.g., National level gets a unique purple badge).
- **Styling**: `italic` fonts for names/titles, `uppercase tracking-widest` for technical labels.

## 5. Dependencies
- **Data Store**: `getAchievements`.
- **Libraries**: `recharts`, `framer-motion`.
- **Components**: `Tabs`, `Card`, `Badge`, `Progress`.
- **Icons**: `Award`, `Trophy`, `Target`, `TrendingUp` (lucide-react).
