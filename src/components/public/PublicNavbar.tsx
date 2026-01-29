import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';

const PublicNavbar = () => {
    const location = useLocation();
    
    const isActive = (path: string) => {
        return location.pathname === path ? "text-white" : "text-white/60 hover:text-white";
    };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo & College Info */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-primary/90 uppercase">Adhiyamaan College</span>
              <span className="text-xs font-semibold text-white/60">Dept of Cyber Security</span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link to="/" className={`transition-colors ${isActive('/')}`}>Home</Link>
                <Link to="/about" className={`transition-colors ${isActive('/about')}`}>About Us</Link>
                <Link to="/facilities" className={`transition-colors ${isActive('/facilities')}`}>Facilities</Link>
                <Link to="/academics" className={`transition-colors ${isActive('/academics')}`}>Academics</Link>
                <Link to="/projects" className={`transition-colors ${isActive('/projects')}`}>Projects</Link>
                <Link to="/contact" className={`transition-colors ${isActive('/contact')}`}>Contact</Link>
            </div>
             <Link to="/login">
                <Button className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-6 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Login <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </Link>
          </div>
        </div>
    </nav>
  );
};

export default PublicNavbar;
