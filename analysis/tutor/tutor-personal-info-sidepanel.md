# Tutor Personal Information Page Side Panel Analysis
**Component:** `src/components/dashboard/DashboardSidebar.tsx`

## 1. Navigation Context
The Personal Details page is accessible through the tutor-specific sidebar as part of the tutor dashboard ecosystem. It's represented by the "Personal Details" link with a User icon in the sidebar navigation.

## 2. Sidebar Integration
- **Label**: "Personal Details"
- **Icon**: `User` 
- **Route Path**: `/tutor/personal`
- **Purpose**: Tutor profile and personal information management

## 3. Positioning in Navigation
The Personal Details link appears as the third item in the tutor navigation menu, positioned after the main dashboard and class analytics pages, highlighting its importance for tutors to manage their profile information.

## 4. Visual Design
- Uses the `User` icon to represent personal profile functionality
- Follows the same visual styling as other sidebar items
- Maintains consistent hover and active state styling with the glassmorphism design
- Responsive to sidebar collapse/expand states

## 5. Role-Based Access
- Only accessible to users with the `tutor` role
- Properly integrated with the authentication system and protected routes
- Links to the PersonalDetails component which validates user permissions

## 6. User Experience
- Quick access to profile management tools
- Centralized location within the tutor dashboard navigation
- Consistent interaction patterns with other tutor-specific pages
- Direct pathway from tutor dashboard to personal information management

## 7. Code Reference
```tsx
const tutorLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/tutor' },
  { label: 'Class Analytics', icon: BarChart3, path: '/tutor/analytics' },
  { label: 'Personal Details', icon: User, path: '/tutor/personal' },
  { label: 'My Class', icon: Users, path: '/tutor/class' },
  { label: 'Timetable', icon: Calendar, path: '/tutor/timetable' },
  { label: 'Verify Marks', icon: ClipboardList, path: '/tutor/marks' },
  { label: 'Notes Status', icon: BookOpen, path: '/tutor/notes' },
  { label: 'Assignment Status', icon: FileText, path: '/tutor/assignments' },
  { label: 'LMS Analytics', icon: BarChart3, path: '/tutor/lms' },
  { label: 'ECA Approvals', icon: Trophy, path: '/tutor/eca' },
  { label: 'Circulars', icon: Bell, path: '/tutor/circulars' },
  { label: 'Leave Approvals', icon: ExternalLink, path: '/tutor/leave' },
];
```