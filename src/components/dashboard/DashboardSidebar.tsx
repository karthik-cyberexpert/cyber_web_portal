import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Calendar,
  ClipboardList,
  FileText,
  BookOpen,
  Bell,
  ExternalLink,
  Trophy,
  FileCheck,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '@/lib/auth';

interface SidebarLink {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  children?: SidebarLink[];
}

const studentLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
  { label: 'Personal Details', icon: User, path: '/student/personal' },
  { 
    label: 'Academic Details', 
    icon: GraduationCap, 
    path: '/student/academic-menu',
    children: [
      { label: 'Timetable & Syllabus', icon: Calendar, path: '/student/timetable' },
      { label: 'Marks & Grades', icon: ClipboardList, path: '/student/marks' },
      { label: 'Notes & Question Bank', icon: BookOpen, path: '/student/notes' },
      { label: 'Assignments', icon: FileText, path: '/student/assignments' },
    ]
  },
  { label: 'Circulars', icon: Bell, path: '/student/circulars' },
  { 
    label: 'Portals', 
    icon: ExternalLink, 
    path: '/student/portals-menu',
    children: [
      { label: 'Leave Portal', icon: ExternalLink, path: '/student/leave' },
      { label: 'OD Portal', icon: ExternalLink, path: '/student/od' },
      { label: 'Feedback Portal', icon: ExternalLink, path: '/student/feedback' },
      { label: 'Grievance Portal', icon: ExternalLink, path: '/student/grievance' },
      { label: 'Lost & Found', icon: ExternalLink, path: '/student/lost-found' },
    ]
  },
  { label: 'LMS Quiz', icon: Trophy, path: '/student/lms' },
  { label: 'ECA & Achievements', icon: Sparkles, path: '/student/eca' },
  { label: 'Resume Builder', icon: FileCheck, path: '/student/resume' },
];

const facultyLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/faculty' },
  { label: 'Personal Details', icon: User, path: '/faculty/personal' },
  { 
    label: 'My Classes', 
    icon: Calendar, 
    path: '/faculty/classes-menu',
    children: [
      { label: 'My Subjects', icon: BookOpen, path: '/faculty/classes' },
      { label: 'Students', icon: Users, path: '/faculty/students' }
    ]
  },
  { label: 'Timetable', icon: Calendar, path: '/faculty/timetable' },
  { label: 'Marks Entry', icon: ClipboardList, path: '/faculty/marks' },
  { label: 'Notes Upload', icon: BookOpen, path: '/faculty/notes' },
  { label: 'Assignments', icon: FileText, path: '/faculty/assignments' },
  { label: 'Circulars', icon: Bell, path: '/faculty/circulars' },
];

const tutorLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/tutor' },
  { 
    label: 'Class Analytics', 
    icon: BarChart3, 
    path: '/tutor/analytics-menu',
    children: [
      { label: 'Anaytics', icon: BarChart3, path: '/tutor/analytics' },
      { label: 'My Class', icon: Users, path: '/tutor/class' },
      { label: 'Class Time Table', icon: Calendar, path: '/tutor/timetable' },
      { label: 'Verify Marks', icon: ClipboardList, path: '/tutor/marks' },
      { label: 'Notes Status', icon: BookOpen, path: '/tutor/notes' },
      { label: 'Assignment Status', icon: FileText, path: '/tutor/assignments' },
      { label: 'LMS Analytics', icon: BarChart3, path: '/tutor/lms' },
      { label: 'ECA Analytics', icon: Trophy, path: '/tutor/eca' },
      { label: 'Circulars', icon: Bell, path: '/tutor/circulars' },
    ]
  },
  // Portals
  { 
    label: 'Portals', 
    icon: ExternalLink, 
    path: '/tutor/portals-menu',
    children: [
      { label: 'Leave Approvals', icon: ExternalLink, path: '/tutor/leave' },
      { label: 'OD Approvals', icon: ExternalLink, path: '/tutor/od' },
      { label: 'Grievance Portal', icon: ExternalLink, path: '/tutor/grievance' },
      { label: 'Lost & Found', icon: ExternalLink, path: '/tutor/lost-found' },
    ]
  },
  { 
    label: 'Reports', 
    icon: BarChart3, 
    path: '/tutor/reports',
    children: [
      { label: 'Leave Report', icon: FileText, path: '/tutor/reports/leave' },
      { label: 'OD Report', icon: ExternalLink, path: '/tutor/reports/od' },
      { label: 'Marks Report', icon: ClipboardList, path: '/tutor/reports/marks' },
    ]
  },
  // Faculty Responsibilities
  { label: 'Personal Details', icon: User, path: '/tutor/personal' },
  { 
    label: 'My Subjects', 
    icon: BookOpen, 
    path: '/faculty/classes-menu',
    children: [
      { label: 'Course and Syllabus', icon: BookOpen, path: '/faculty/classes' },
      { label: 'Students', icon: Users, path: '/faculty/students' }
    ]
  },
  { label: 'My Timetable', icon: Calendar, path: '/faculty/timetable' },
  { label: 'Marks Entry', icon: ClipboardList, path: '/faculty/marks' },
  { label: 'Notes Upload', icon: BookOpen, path: '/faculty/notes' },
  { label: 'Assignments', icon: FileText, path: '/faculty/assignments' },
  { label: 'Faculty Circulars', icon: Bell, path: '/faculty/circulars' },
];

const adminLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { 
    label: 'Manage', 
    icon: Users, 
    path: '/admin/manage',
    children: [
      { label: 'Students', icon: GraduationCap, path: '/admin/students' },
      { label: 'Faculty', icon: Users, path: '/admin/faculty' },
      { label: 'Tutors', icon: Users, path: '/admin/tutors' },
      { label: 'Subjects', icon: BookOpen, path: '/admin/subjects' }
    ]
  },
  { 
    label: 'Manage Schedule', 
    icon: Users, 
    path: '/admin/parent',
    children: [
      { label: 'Exam Schedule', icon: Calendar, path: '/admin/schedule/exams' },
      { label: 'Holidays Schedule', icon: Calendar, path: '/admin/schedule/holidays' }
    ]
  },
  { label: 'Batches & Classes', icon: Users, path: '/admin/batches' },
  { 
    label: 'Timetable', 
    icon: Calendar, 
    path: '/admin/timetable',
    children: [
      { label: 'Student Timetable', icon: GraduationCap, path: '/admin/timetable/students' },
      { label: 'Faculty Timetable', icon: Users, path: '/admin/timetable/faculty' }
    ]
  },
  { label: 'Approve Marks', icon: ClipboardList, path: '/admin/marks' },
  {
    label: 'Portals',
    icon: ExternalLink,
    path: '/admin/portals',
    children: [
      { label: 'Leave Requests', icon: ExternalLink, path: '/admin/requests/leave' },
      { label: 'OD Requests', icon: ExternalLink, path: '/admin/requests/od' },
      { label: 'Feedback Portal', icon: ExternalLink, path: '/admin/feedback' },
      { label: 'Grievance Portal', icon: ExternalLink, path: '/admin/grievance' },
      { label: 'Lost & Found', icon: ExternalLink, path: '/admin/lost-found' },
    ]
  },
  { 
    label: 'Reports', 
    icon: BarChart3, 
    path: '/admin/reports',
    children: [
      { label: 'Leave Report', icon: FileText, path: '/admin/reports/leave' },
      { label: 'OD Report', icon: ExternalLink, path: '/admin/reports/od' },
      { label: 'Marks Report', icon: ClipboardList, path: '/admin/reports/marks' },
    ]
  },
  { label: 'Circulars', icon: Bell, path: '/admin/circulars' },
  { 
    label: 'Analytics', 
    icon: BarChart3, 
    path: '/admin/analytics',
    children: [
      { label: 'Notes Analytics', icon: BookOpen, path: '/admin/notes' },
      { label: 'Assignments', icon: FileText, path: '/admin/assignments' },
      { label: 'LMS Management', icon: Trophy, path: '/admin/lms' },
      { label: 'ECA Analytics', icon: Sparkles, path: '/admin/eca' }
    ]
  },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

const getLinksByRole = (role: UserRole): SidebarLink[] => {
  switch (role) {
    case 'student': return studentLinks;
    case 'faculty': return facultyLinks;
    case 'tutor': return tutorLinks;
    case 'admin': return adminLinks;
    default: return [];
  }
};

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  isMobile: boolean;
}

export default function DashboardSidebar({ collapsed, onToggle, onNavigate, isMobile }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const links = getLinksByRole(user.role);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 border-r border-sidebar-border"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <p className="font-bold text-sidebar-foreground text-sm">Cyber Security Department</p>
                <p className="text-xs text-sidebar-foreground/60">Your Institution</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 short:py-1 px-2">
        <ul className="space-y-1 short:space-y-0.5">
          {links.map((link, index) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            if (link.children) {
              const isChildActive = link.children.some(child => location.pathname === child.path);
              const [isExpanded, setIsExpanded] = React.useState(isChildActive);
              
              const toggleExpand = (e: React.MouseEvent) => {
                e.preventDefault();
                setIsExpanded(!isExpanded);
              };

              // Auto-expand if child is active (run only once or when location changes)
              React.useEffect(() => {
                if (isChildActive) setIsExpanded(true);
              }, [isChildActive]);

              return (
                <motion.li
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    onClick={toggleExpand}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer',
                      (isActive || isChildActive)
                        ? 'bg-sidebar-primary/10 text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                     {(isActive || isChildActive) && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                      />
                    )}
                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform',
                      (isActive || isChildActive) ? 'text-primary scale-110' : 'group-hover:scale-105'
                    )} />
                    <AnimatePresence>
                      {!collapsed && (
                        <>
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1"
                          >
                            {link.label}
                          </motion.span>
                           <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && !collapsed && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-sidebar-accent/30 mt-1 rounded-lg"
                      >
                         {link.children.map(child => {
                           const isChildLinkActive = location.pathname === child.path;
                           return (
                             <li key={child.path}>
                               <NavLink 
                                 to={child.path}
                                 onClick={onNavigate}
                                 className={cn(
                                   'flex items-center gap-3 pl-11 pr-3 py-2 text-sm transition-colors',
                                   isChildLinkActive 
                                    ? 'text-primary font-medium bg-primary/5' 
                                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                                 )}
                               >
                                  {child.label}
                               </NavLink>
                             </li>
                           );
                         })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            }

            return (
              <motion.li
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <NavLink
                  to={link.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                    />
                  )}
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  )} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && link.badge && (
                    <span className={cn(
                      'ml-auto text-xs px-2 py-0.5 rounded-full',
                      link.badge === 'New'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    )}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            'w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'justify-center px-0'
          )}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {!collapsed && <span className="ml-3 text-sm">Toggle Theme</span>}
        </Button>

        {/* User Profile - Clickable to Personal Details */}
        <NavLink 
          to={user.role === 'admin' ? '/admin/profile' : user.role === 'tutor' ? '/tutor/personal' : user.role === 'faculty' ? '/faculty/personal' : '/student/personal'}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-lg object-cover"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 text-sm">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Hidden on Mobile */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar rounded-full border border-sidebar-border items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
