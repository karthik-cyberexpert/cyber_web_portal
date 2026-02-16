import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path ? "text-primary" : "text-white/60 hover:text-white";
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Facilities', path: '/facilities' },
        { name: 'Academics', path: '/academics' },
        { name: 'Projects', path: '/projects' },
        { name: 'Contact', path: '/contact' },
    ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 h-16' : 'bg-transparent h-24'
    }`}>
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo & College Info */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-white uppercase">Adhiyamaan</span>
              <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest leading-tight">Cyber Security Dept</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                {navLinks.map((link) => (
                    <Link 
                        key={link.name}
                        to={link.path} 
                        className={`transition-all duration-300 hover:tracking-[0.2em] ${isActive(link.path)}`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
             <Link to="/login">
                <Button className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] rounded-full px-8 h-10 transition-all shadow-lg shadow-primary/25">
                  Secure Login <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 space-y-4 animate-fade-in-up">
                {navLinks.map((link) => (
                    <Link 
                        key={link.name}
                        to={link.path} 
                        className={`block text-lg font-semibold ${isActive(link.path)}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-white py-6 mt-4">
                        Secure Login <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        )}
    </nav>
  );
};

export default PublicNavbar;
