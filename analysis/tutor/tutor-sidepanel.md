# Tutor Side Panel Analysis
**Component:** `src/components/dashboard/DashboardSidebar.tsx`

## 1. Structure Overview
The sidebar is a responsive, collapsible navigation component that adapts its content based on the user's role. For the `tutor` role, it renders a specific set of navigation items defined in the `tutorLinks` array.

## 2. Tutor Navigation Items
The following items are displayed in the sidebar for Tutor users:

| Label | Icon | Route Path | Purpose |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `LayoutDashboard` | `/tutor` | Main overview page for class management |
| **Class Analytics** | `BarChart3` | `/tutor/analytics` | Class performance and statistics dashboard |
| **Personal Details** | `User` | `/tutor/personal` | Tutor profile and personal information |
| **My Class** | `Users` | `/tutor/class` | Class management and student overview |
| **Timetable** | `Calendar` | `/tutor/timetable` | Schedule and class timing information |
| **Verify Marks** | `ClipboardList` | `/tutor/marks` | Academic results verification for assigned class |
| **Notes Status** | `BookOpen` | `/tutor/notes` | Resource and notes tracking for class |
| **Assignment Status** | `FileText` | `/tutor/assignments` | Assignment oversight and tracking |
| **LMS Analytics** | `BarChart3` | `/tutor/lms` | Learning Management System statistics |
| **ECA Approvals** | `Trophy` | `/tutor/eca` | Extra-curricular activities verification |
| **Circulars** | `Bell` | `/tutor/circulars` | Announcements and notices |
| **Leave Approvals** | `ExternalLink` | `/tutor/leave` | Student leave request processing |

## 3. Sidebar Features
- **Collapsible State**: Can be toggled between expanded (280px) and collapsed (80px) modes.
- **Active State Styling**: Current route is highlighted with a primary background and glow effect (`bg-sidebar-primary`).
- **User Profile**: Displays logged-in tutor's avatar, name, and role at the bottom.
- **Theme Toggle**: Allows switching between Light and Dark modes.
- **Logout Action**: Dedicated button to terminate the session.

## 4. Role-Specific Customization
The tutor sidebar is specifically designed for class in-charge responsibilities, focusing on:
- Student management and monitoring
- Academic verification tasks
- Class performance analytics
- Approval workflows for assigned batch and section

## 5. Code Reference
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