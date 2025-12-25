# Tutor Verify Marks Analysis
**Component:** `src/pages/tutor/VerifyMarks.tsx`

## 1. Overview
The Verify Marks page provides tutors with tools to review and verify internal assessment marks submitted by subject teachers for their assigned class. It displays marks grouped by subject and exam type, allowing tutors to approve marks before they are forwarded to the HOD.

## 2. Key Features
- **Verification Dashboard**: Shows statistics for total subjects, pending verifications, verified marks, and completion percentage
- **Subject Grouping**: Marks are grouped by subject code and exam type (IA1, IA2, IA3, Model Exam)
- **Exam Type Filter**: Allows filtering marks by different exam types
- **Bulk Verification**: Option to verify all marks at once
- **Individual Verification**: Ability to verify marks for each subject individually
- **Consolidated View**: Option to view consolidated marks data
- **Submission Tracking**: Shows when marks were submitted by faculty
- **Faculty Information**: Displays which faculty submitted the marks for each subject

## 3. Data Integration
The page connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Students assigned to the tutor's batch and section
- Marks entries for those students
- Faculty information for mark submissions
- Status of marks (submitted/approved)

## 4. Visual Components
- **Statistics Cards**: Shows total subjects, pending, verified, and completion percentage
- **Subject Cards**: Individual cards for each subject with verification status
- **Color-Coded Indicators**: Different colors for pending vs verified marks
- **Badge System**: For subject codes and verification status
- **Glassmorphism Design**: Modern UI with translucent panels
- **Animated Transitions**: Using Framer Motion for smooth interactions

## 5. Interactive Elements
- **Verify Individual**: Button to verify marks for each subject
- **Verify All**: Option to verify all pending marks at once
- **View Marks**: Option to view detailed marks before verification
- **Exam Type Selection**: Dropdown to filter by different exam types
- **Semester Toggle**: Option to switch between odd and even semesters

## 6. Role-Specific Functionality
The page is specifically designed for tutors to:
- Review marks submitted by subject teachers for their assigned class
- Verify accuracy and completeness of marks before forwarding
- Track verification progress across subjects
- Maintain quality control over internal assessments
- Ensure timely processing of marks for academic records
- Coordinate with faculty members on mark submissions

## 7. Navigation Integration
The page integrates with the tutor dashboard ecosystem by:
- Being accessible through the tutor-specific sidebar as "Verify Marks"
- Following consistent UI/UX patterns with other tutor pages
- Maintaining proper authentication and role-based access
- Providing back-links to the main tutor dashboard
- Supporting the tutor's academic oversight responsibilities