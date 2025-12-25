# Tutor Personal Information Analysis
**Component:** `src/pages/tutor/PersonalDetails.tsx`

## 1. Overview
The Personal Details page displays comprehensive profile information for tutors (class in-charges) in the educational management system. It shows both tutor-specific information and linked faculty information, providing a complete view of the tutor's professional profile.

## 2. Key Features
- **Profile Card**: Displays tutor's avatar, name, designation, employee ID, and status
- **Contact Information**: Shows email, phone number, and office location
- **Professional Information**: Displays department, joining date, specialization, and in-charge details
- **Academic Background**: Shows educational qualifications in a timeline format
- **Address Information**: Displays the tutor's address details
- **Edit Profile Functionality**: Allows tutors to update their profile information

## 3. Data Integration
The page connects to the data store to fetch:
- Tutor profile information based on logged-in user
- Linked faculty information associated with the tutor (using facultyId)
- Employee ID from the faculty record
- Office location from the faculty record
- Department, joining date, and specialization from faculty record
- Educational background from faculty record

## 4. Visual Components
- **Profile Header**: Gradient background with avatar prominently displayed
- **Glassmorphism Cards**: Modern translucent design with shadow effects
- **Badge System**: For employee ID and status indicators
- **Icon-Based Information Display**: Using Lucide React icons for visual cues
- **Timeline Layout**: For academic background section
- **Animated Transitions**: Using Framer Motion for smooth animations

## 5. Information Structure
Based on the admin's Manage Faculty and Manage Tutors pages, the tutor personal information includes:
- **Basic Info**: Name, email, phone number, avatar
- **Professional Info**: Designation, employee ID, department, joining date, specialization
- **Tutor-Specific Info**: Batch and section in-charge details
- **Academic Background**: Educational qualifications timeline
- **Address**: Office and residential address information

## 6. Role-Specific Functionality
The page is specifically designed for tutors to:
- View their complete professional profile
- Access contact information
- Review academic credentials
- Update profile information (via edit functionality)
- Understand their class in-charge responsibilities

## 7. Navigation Integration
The page integrates with the tutor dashboard ecosystem by:
- Being accessible through the tutor-specific sidebar
- Following consistent UI/UX patterns with other tutor pages
- Maintaining proper authentication and role-based access
- Providing back-links to the main tutor dashboard