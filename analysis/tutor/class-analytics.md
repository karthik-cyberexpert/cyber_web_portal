# Tutor Class Analytics Analysis
**Component:** `src/pages/tutor/ClassAnalytics.tsx`

## 1. Overview
The Class Analytics page provides tutors with comprehensive performance insights for their assigned class (batch and section). It visualizes key metrics including attendance trends, grade distribution, and subject-wise performance to help tutors monitor and improve their class's academic outcomes.

## 2. Key Features
- **Weekly Attendance Chart**: Bar chart showing daily attendance counts for the assigned class
- **Grade Distribution Pie Chart**: Visual breakdown of grades (O, A+, A, B+, B, U) based on IA-1 exam results
- **Subject Performance Matrix**: Detailed view of class average and pass percentage for each subject
- **Export Functionality**: Options to download PDF reports and generate detailed analytics
- **Class-Specific Data**: All analytics are filtered to show data only for the tutor's assigned batch and section

## 3. Data Integration
The page connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Students in the tutor's assigned batch and section
- Marks entries filtered by exam type (IA-1) and assigned students
- Attendance data for the class
- Subject-specific performance metrics

## 4. Visual Components
- **Bar Chart**: Shows weekly attendance trends with color-coded indicators for low attendance days
- **Pie Chart**: Displays grade distribution with color-coded segments
- **Performance Cards**: Individual cards for each subject showing average scores and pass percentages
- **Animated Progress Bars**: Visual indicators for class averages and pass rates
- **Glassmorphism Design**: Modern UI with translucent cards and gradient backgrounds

## 5. Interactive Elements
- **Download PDF**: Export class analytics as a PDF report
- **Generate Report**: Create detailed analytical reports
- **Hover Tooltips**: Interactive tooltips on charts showing detailed values
- **Animated Transitions**: Smooth animations using Framer Motion for enhanced UX

## 6. Role-Specific Functionality
The Class Analytics page is specifically designed to support tutors in:
- Monitoring class attendance patterns and identifying issues
- Understanding grade distribution across the class
- Identifying subject-wise performance gaps
- Making data-driven decisions for class improvement
- Tracking academic progress of assigned students
- Generating reports for academic reviews

## 7. Navigation Integration
The page integrates with the tutor dashboard ecosystem by:
- Being accessible through the tutor-specific sidebar
- Maintaining consistent UI/UX patterns with other tutor pages
- Providing back-links to the main tutor dashboard
- Following the same authentication and role-based access controls