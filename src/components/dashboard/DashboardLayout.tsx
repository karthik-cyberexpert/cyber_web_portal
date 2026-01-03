import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import NotificationDropdown from '@/components/dashboard/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Hook to track if screen is desktop size (lg breakpoint = 1024px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isDesktop;
}

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isDesktop = useIsDesktop();

  // Get profile path based on user role
  const getProfilePath = () => {
    switch (user?.role) {
      case 'admin': return '/admin/profile';
      case 'tutor': return '/tutor/personal';
      case 'faculty': return '/faculty/personal';
      default: return '/student/personal';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Only rendered on desktop */}
      {isDesktop && (
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Only rendered when open */}
      {!isDesktop && mobileMenuOpen && (
        <div className="fixed left-0 top-0 h-screen z-50">
          <DashboardSidebar
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
            onNavigate={() => setMobileMenuOpen(false)}
            isMobile={true}
          />
        </div>
      )}

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ 
          marginLeft: sidebarCollapsed ? 80 : 280,
          paddingLeft: sidebarCollapsed ? 0 : 0 // Managed by margin
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen hidden lg:block landscape:block"
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="relative hidden md:block 3xl:w-[500px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="w-full pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationDropdown />
              <Link to={getProfilePath()} className="hidden xs:flex items-center gap-3 pl-3 border-l border-border hover:opacity-80 transition-opacity cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-primary/20"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>

      {/* Mobile Main Content */}
      <main className="lg:hidden min-h-screen portrait:block">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 xs:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationDropdown />
              <Link to={getProfilePath()} className="hover:opacity-80 transition-opacity">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 xs:w-9 xs:h-9 rounded-xl object-cover"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Page Content */}
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
