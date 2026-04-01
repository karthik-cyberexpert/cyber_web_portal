import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Lock, Sparkles, Code2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';

const PublicFooter = () => {
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (showProfile) {
      const timer = setTimeout(() => {
        setShowProfile(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showProfile]);

  return (
      <footer className="relative z-10 border-t border-white/5 bg-black/80 backdrop-blur-md pt-16 pb-8 text-white select-none">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div className="space-y-4 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img src={logo} alt="ACE Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-lg font-bold text-white">Adhiyamaan College</span>
                    </div>
                    <p className="text-white/40 leading-relaxed max-w-sm">
                        The Department of CSE(Cyber Security) at Adhiyamaan College of Engineering is dedicated to excellence in cybersecurity education and research, preparing students for successful careers in this critical field.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Quick Links</h3>
                    <ul className="space-y-2 text-white/50">
                        <li><Link to="/" className="hover:text-primary transition-colors focus:outline-none">Home</Link></li>
                        <li><Link to="/about" className="hover:text-primary transition-colors focus:outline-none">About Us</Link></li>
                        <li><Link to="/facilities" className="hover:text-primary transition-colors focus:outline-none">Facilities</Link></li>
                        <li><Link to="/academics" className="hover:text-primary transition-colors focus:outline-none">Academics</Link></li>
                        <li><Link to="/contact" className="hover:text-primary transition-colors focus:outline-none">Contact</Link></li>
                        <li><Link to="/login" className="hover:text-primary transition-colors focus:outline-none">Login</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Contact Info</h3>
                    <ul className="space-y-4 text-white/50">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">Adhiyamaan College of Engineering, Hosur, TN 635109</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm">+91 9487819149</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm">hod_cse-cs@adhiyamaan.ac.in</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                <p>&copy; {new Date().getFullYear()} Adhiyamaan College of Engineering. All Rights Reserved.</p>
                <div className="flex items-center gap-6 relative">
                    <p className="flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Secured by Dept of CSE(Cyber Security)
                    </p>
                    <button 
                      onClick={() => setShowProfile(true)}
                      className="group flex items-center gap-2 hover:text-white transition-all duration-300 relative focus:outline-none"
                    >
                      <Sparkles className="w-3 h-3 text-primary group-hover:animate-spin-slow" />
                      Designed by <span className="font-bold underline decoration-primary/30 underline-offset-4 group-hover:decoration-primary transition-all">Karthikeyan.S</span>
                    </button>

                    {/* Profile Modal */}
                    <AnimatePresence>
                      {showProfile && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: -10, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                          className="absolute bottom-full right-0 sm:right-0 mb-6 z-[100] w-[calc(100vw-32px)] sm:w-[350px] max-w-[400px]"
                        >
                          <div className="p-8 rounded-[2.5rem] bg-[#0c0c0c] border border-white/10 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative">
                            {/* Animated Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20" />
                            
                            <div className="relative flex flex-col items-center text-center space-y-6">
                              {/* Avatar */}
                              <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-125 animate-pulse" />
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-2xl font-black text-white relative border-4 border-[#121212]">
                                  KS
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-xl font-bold text-white tracking-tight">Karthikeyan S</h4>
                                
                                <div className="space-y-1 pt-2">
                                  <div className="flex items-center gap-2 justify-center text-white/50 text-xs">
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    <span>BE-CSE (Cyber Security)</span>
                                  </div>
                                  <p className="text-[11px] font-medium text-white/30 italic uppercase tracking-wider">
                                    2024–2028 Batch
                                  </p>
                                </div>
                              </div>

                              {/* Progress bar (Visual timer) */}
                              <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mt-2">
                                <motion.div 
                                  initial={{ width: "100%" }}
                                  animate={{ width: "0%" }}
                                  transition={{ duration: 5, ease: "linear" }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
      </footer>
  );
};

export default PublicFooter;
