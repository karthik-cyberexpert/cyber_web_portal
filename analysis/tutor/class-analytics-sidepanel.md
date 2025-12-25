# Class Analytics Page Side Panel Analysis
**Component:** `src/components/dashboard/DashboardSidebar.tsx`

## 1. Navigation Context
The Class Analytics page is accessible through the tutor-specific sidebar as part of the tutor dashboard ecosystem. It's represented by the "Class Analytics" link with a BarChart3 icon in the sidebar navigation.

## 2. Sidebar Integration
- **Label**: "Class Analytics"
- **Icon**: `BarChart3` 
- **Route Path**: `/tutor/analytics`
- **Purpose**: Class performance and statistics dashboard

## 3. Positioning in Navigation
The Class Analytics link appears as the second item in the tutor navigation menu, right after the main dashboard, highlighting its importance for tutors to monitor their assigned class's performance.

## 4. Visual Design
- Uses the `BarChart3` icon to represent analytics functionality
- Follows the same visual styling as other sidebar items
- Maintains consistent hover and active state styling with the glassmorphism design
- Responsive to sidebar collapse/expand states

## 5. Role-Based Access
- Only accessible to users with the `tutor` role
- Properly integrated with the authentication system and protected routes
- Links to the ClassAnalytics component which validates user permissions

## 6. User Experience
- Quick access to detailed class performance metrics
- Centralized location within the tutor dashboard navigation
- Consistent interaction patterns with other tutor-specific pages
- Direct pathway from tutor dashboard to detailed analytics

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