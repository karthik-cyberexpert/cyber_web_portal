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
  Sparkles
} from 'lucide-react';
import { UserRole } from '@/lib/auth';

interface SidebarLink {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
}

const studentLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
  { label: 'Personal Details', icon: User, path: '/student/personal' },
  { label: 'Academic Details', icon: GraduationCap, path: '/student/academic' },
  { label: 'Timetable & Syllabus', icon: Calendar, path: '/student/timetable' },
  { label: 'Marks & Grades', icon: ClipboardList, path: '/student/marks' },
  { label: 'Notes & Question Bank', icon: BookOpen, path: '/student/notes' },
  { label: 'Assignments', icon: FileText, path: '/student/assignments', badge: '3' },
  { label: 'Circulars', icon: Bell, path: '/student/circulars', badge: 'New' },
  { label: 'Leave Portal', icon: ExternalLink, path: '/student/leave' },
  { label: 'LMS Quiz', icon: Trophy, path: '/student/lms' },
  { label: 'ECA & Achievements', icon: Sparkles, path: '/student/eca' },
  { label: 'Resume Builder', icon: FileCheck, path: '/student/resume' },
];

const facultyLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/faculty' },
  { label: 'Personal Details', icon: User, path: '/faculty/personal' },
  { label: 'My Classes', icon: Calendar, path: '/faculty/classes' },
  { label: 'Timetable', icon: Calendar, path: '/faculty/timetable' },
  { label: 'Marks Entry', icon: ClipboardList, path: '/faculty/marks', badge: '5' },
  { label: 'Notes Upload', icon: BookOpen, path: '/faculty/notes' },
  { label: 'Assignments', icon: FileText, path: '/faculty/assignments' },
  { label: 'Circulars', icon: Bell, path: '/faculty/circulars' },
];

const tutorLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/tutor' },
  { label: 'Class Analytics', icon: BarChart3, path: '/tutor/analytics' },
  { label: 'Personal Details', icon: User, path: '/tutor/personal' },
  { label: 'My Class', icon: Users, path: '/tutor/class' },
  { label: 'Timetable', icon: Calendar, path: '/tutor/timetable' },
  { label: 'Verify Marks', icon: ClipboardList, path: '/tutor/marks', badge: '12' },
  { label: 'Notes Status', icon: BookOpen, path: '/tutor/notes' },
  { label: 'Assignment Status', icon: FileText, path: '/tutor/assignments' },
  { label: 'LMS Analytics', icon: BarChart3, path: '/tutor/lms' },
  { label: 'ECA Approvals', icon: Trophy, path: '/tutor/eca', badge: '2' },
  { label: 'Circulars', icon: Bell, path: '/tutor/circulars' },
  { label: 'Leave Approvals', icon: ExternalLink, path: '/tutor/leave', badge: '4' },
];

const adminLinks: SidebarLink[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Manage Students', icon: GraduationCap, path: '/admin/students' },
  { label: 'Manage Faculty', icon: Users, path: '/admin/faculty' },
  { label: 'Manage Tutors', icon: Users, path: '/admin/tutors' },
  { label: 'Batches & Classes', icon: Users, path: '/admin/batches' },
  { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
  { label: 'Approve Marks', icon: ClipboardList, path: '/admin/marks', badge: '8' },
  { label: 'Notes Analytics', icon: BookOpen, path: '/admin/notes' },
    { label: 'Assignments', icon: FileText, path: '/admin/assignments' },
    { label: 'Circulars', icon: Bell, path: '/admin/circulars' },
    { label: 'Leave Approvals', icon: ExternalLink, path: '/admin/leave', badge: '6' },
    { label: 'LMS Management', icon: Trophy, path: '/admin/lms' },
    { label: 'ECA Analytics', icon: Sparkles, path: '/admin/eca' },
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
}

export default function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
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
                <p className="font-bold text-sidebar-foreground text-sm">CSE Department</p>
                <p className="text-xs text-sidebar-foreground/60">TN Engineering</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2">
        <ul className="space-y-1">
          {links.map((link, index) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <motion.li
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <NavLink
                  to={link.path}
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

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent',
          collapsed && 'justify-center'
        )}>
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
        </div>

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

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar rounded-full border border-sidebar-border flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
