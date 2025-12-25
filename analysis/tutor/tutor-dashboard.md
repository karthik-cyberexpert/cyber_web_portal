# Tutor Dashboard Analysis
**Component:** `src/pages/dashboards/TutorDashboard.tsx`

## 1. Overview
The Tutor Dashboard serves as the main landing page for tutors (class in-charges) in the educational management system. It provides a comprehensive overview of their assigned class's performance, pending tasks, and critical alerts.

## 2. Key Features
- **Class Performance Metrics**: Shows class strength, pending approvals, marks to verify, and assignment pulse
- **Performance Dynamics Chart**: Visualizes attendance and academic average trends over time
- **Today's Schedule**: Displays the current day's timetable for the tutor's assigned class
- **Approval Queue**: Shows pending leave requests and ECA achievements requiring approval
- **Quality Control**: Lists marks entries pending verification
- **Class Alerts**: Highlights students with critical attendance issues
- **Assignment Activity**: Tracks assignment submission progress for the assigned class

## 3. Data Integration
The dashboard connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Students in the tutor's assigned batch and section
- Leave requests from students in their class
- ECA achievements pending approval
- Marks entries requiring verification
- Academic alerts (low attendance cases)
- Timetable information for their class
- Assignment data for their assigned batch/section

## 4. Interactive Elements
- **Approve Leave**: Process leave requests with one-click approval
- **Approve Achievement**: Verify ECA achievements with one-click approval
- **Verify Marks**: Batch verify marks entries by subject and exam type
- **Class Analytics Button**: Navigate to detailed class analytics
- **Attendance Button**: Access attendance management tools

## 5. Visual Design
- Glassmorphism card design with gradient backgrounds
- Animated transitions using Framer Motion
- Custom stat cards with icon indicators
- Responsive grid layout that adapts to different screen sizes
- Color-coded status indicators for different priority levels
- Interactive charts using Recharts library

## 6. Role-Specific Functionality
The tutor dashboard is specifically designed to support class in-charge responsibilities:
- Monitoring student attendance and academic performance
- Processing approval requests from assigned students
- Verifying academic data (marks, achievements) before final submission
- Tracking assignment completion rates for the assigned class
- Managing class-related workflows and administrative tasks

## 7. Navigation Integration
The dashboard works seamlessly with the tutor-specific sidebar, providing:
- Quick access to all tutor-specific modules
- Role-based navigation options
- Consistent user experience across all tutor pages
- Proper routing to related modules like class management, marks verification, etc.