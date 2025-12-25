# Tutor Assignment Status Analysis
**Component:** `src/pages/tutor/AssignmentStatus.tsx`

## 1. Overview
The Assignment Status page provides tutors with comprehensive tracking and analytics for assignments given to their assigned class. It displays assignment details, submission rates, evaluation progress, and visual analytics to help tutors monitor student engagement and academic progress.

## 2. Key Features
- **Assignment Matrix**: Displays all assignments with submission and evaluation statistics
- **Submission Rate Analytics**: Visual bar chart showing submission rates by subject
- **Assignment Statistics**: Shows total pending assignments, overdue assignments, and average class GPA
- **Search Functionality**: Allows filtering assignments by title or subject
- **Detailed Assignment View**: Shows submission count vs total students and evaluation progress
- **Due Date Tracking**: Displays assignment due dates for easy reference
- **Notification Tools**: Option to notify students about pending assignments
- **Report Generation**: Option to generate assignment reports

## 3. Data Integration
The page connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Students assigned to the tutor's batch and section
- Assignments filtered by the tutor's assigned class
- Submission records for those assignments
- Assignment status and due date information

## 4. Visual Components
- **Interactive Bar Chart**: Shows submission rates by subject using Recharts
- **Assignment Cards**: Individual cards for each assignment with progress visualization
- **Progress Bars**: Visual representation of submission and evaluation rates
- **Statistics Cards**: Shows pending assignments, overdue assignments, and class GPA
- **Glassmorphism Design**: Modern UI with translucent panels
- **Animated Transitions**: Using Framer Motion for smooth progress animations

## 5. Interactive Elements
- **Search**: Real-time filtering of assignments by title or subject
- **Filter Options**: Additional filtering capabilities
- **Notify Pending**: Button to send notifications about pending assignments
- **Report Generation**: Option to generate assignment reports
- **Detailed View**: Access to more detailed assignment information

## 6. Role-Specific Functionality
The page is specifically designed for tutors to:
- Monitor assignment submission rates across subjects
- Track evaluation progress for each assignment
- Identify overdue or pending assignments
- Assess student engagement with assignments
- Coordinate with faculty on assignment deadlines
- Generate reports for academic reviews
- Send notifications to students about pending work

## 7. Navigation Integration
The page integrates with the tutor dashboard ecosystem by:
- Being accessible through the tutor-specific sidebar as "Assignment Status"
- Following consistent UI/UX patterns with other tutor pages
- Maintaining proper authentication and role-based access
- Providing back-links to the main tutor dashboard
- Supporting the tutor's academic oversight responsibilities