import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Menu, X, Globe, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';

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

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
            className="lg:hidden w-12 h-12 flex items-center justify-end text-white relative z-[60]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                    <motion.div
                        key="close"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                    >
                        <X className="w-8 h-8" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                    >
                        <Menu className="w-8 h-8" />
                    </motion.div>
                )}
            </AnimatePresence>
          </button>
        </div>

        {/* Side Panel (Mobile/Tablet) */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] lg:hidden"
                    />

                    {/* Side Panel Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-[300px] xs:w-[350px] bg-black/95 backdrop-blur-2xl border-l border-white/10 z-[55] lg:hidden flex flex-col pt-24 pb-12 px-8"
                    >
                        <div className="flex flex-col gap-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">Navigation</p>
                            <div className="space-y-4">
                                {navLinks.map((link, idx) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                    >
                                        <Link 
                                            to={link.path} 
                                            className={`text-2xl font-black italic uppercase tracking-tighter block transition-all hover:text-primary hover:pl-4 ${isActive(link.path)}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 space-y-6">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full bg-primary text-white py-8 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase tracking-widest italic group">
                                    Secure Login
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Connect with us</p>
                                <div className="flex gap-4">
                                    {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                        <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-primary hover:bg-primary/10 transition-all border border-white/5">
                                            <Icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-3 text-white/40">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-xs font-bold">cse-cyber@adhiyamaan.ac.in</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/40">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-xs font-bold">+91 4344 260570</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-8">
                             <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-primary animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">ACE Cyber Security Hub</span>
                             </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </nav>
  );
};

export default PublicNavbar;
