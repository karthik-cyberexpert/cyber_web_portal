# Tutor Circulars Page Side Panel Analysis
**Component:** `src/components/dashboard/DashboardSidebar.tsx`

## 1. Navigation Context
The Circulars page is accessible through the tutor-specific sidebar as part of the tutor dashboard ecosystem. It's represented by the "Circulars" link with a Bell icon in the sidebar navigation.

## 2. Sidebar Integration
- **Label**: "Circulars"
- **Icon**: `Bell` 
- **Route Path**: `/tutor/circulars`
- **Purpose**: Announcements and notices

## 3. Positioning in Navigation
The Circulars link appears as the eleventh item in the tutor navigation menu, positioned after the main dashboard, class analytics, personal details, my class, timetable, verify marks, notes status, assignment status, LMS analytics, and ECA approvals pages, reflecting its importance in communication management.

## 4. Visual Design
- Uses the `Bell` icon to represent announcements and circulars functionality
- Follows the same visual styling as other sidebar items
- Maintains consistent hover and active state styling with the glassmorphism design
- Responsive to sidebar collapse/expand states

## 5. Role-Based Access
- Only accessible to users with the `tutor` role
- Properly integrated with the authentication system and protected routes
- Links to the Circulars component which validates user permissions

## 6. User Experience
- Quick access to announcements and notices
- Centralized location within the tutor dashboard navigation
- Consistent interaction patterns with other tutor-specific pages
- Direct pathway from tutor dashboard to circular management

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