# Tutor My Class Analysis
**Component:** `src/pages/tutor/ClassManagement.tsx`

## 1. Overview
The Class Management page (also known as "My Class") provides tutors with a comprehensive view and management tools for their assigned class (batch and section). It displays all students in the tutor's assigned section with key metrics and allows for detailed student management.

## 2. Key Features
- **Class Statistics**: Shows average attendance, average CGPA, and certification metrics for the class
- **Student List**: Displays all students in the assigned batch and section with detailed information
- **Search and Filter**: Allows searching students by name or roll number
- **Sorting Options**: Provides multiple sorting options (Name, Roll Number, Attendance, CGPA)
- **Student Details**: Shows student avatar, name, email, roll number, attendance, and CGPA
- **Visual Indicators**: Color-coded attendance bars and status badges
- **Export Functionality**: Option to export the student list
- **Bulk Actions**: Tools for managing multiple students at once
- **Individual Actions**: Options to contact students or view their profiles

## 3. Data Integration
The page connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Students assigned to the tutor's batch and section
- Attendance data for each student
- CGPA information for each student
- Student contact information (email, avatar)

## 4. Visual Components
- **Glassmorphism Stat Cards**: For displaying class statistics with animated values
- **Student Table**: Comprehensive table with student details and visual indicators
- **Attendance Progress Bars**: Visual representation of each student's attendance
- **Status Badges**: Color-coded indicators for student status
- **Action Buttons**: For contacting students and accessing additional options
- **Animated Transitions**: Using Framer Motion for smooth interactions

## 5. Interactive Elements
- **Search Functionality**: Real-time filtering of student list
- **Sort Options**: Dropdown menu for different sorting criteria
- **Filter Options**: Additional filtering capabilities
- **Student Actions**: Dropdown menus with options for each student
- **Bulk Actions**: Tools for managing multiple students simultaneously
- **Export Options**: Download student list functionality

## 6. Role-Specific Functionality
The page is specifically designed for tutors to:
- Monitor all students in their assigned class
- Track attendance and academic performance
- Identify students who need attention (low attendance)
- Access student contact information
- Perform bulk actions on the class
- Export class data for reporting purposes

## 7. Navigation Integration
The page integrates with the tutor dashboard ecosystem by:
- Being accessible through the tutor-specific sidebar as "My Class"
- Following consistent UI/UX patterns with other tutor pages
- Maintaining proper authentication and role-based access
- Providing back-links to the main tutor dashboard
- Supporting the tutor's class management responsibilities