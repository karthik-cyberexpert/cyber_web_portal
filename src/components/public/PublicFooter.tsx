import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Clock, Lock } from 'lucide-react';

const PublicFooter = () => {
  return (
      <footer className="relative z-10 border-t border-white/5 bg-black/80 backdrop-blur-md pt-16 pb-8 text-white">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="space-y-4 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-white">Adhiyamaan College</span>
                    </div>
                    <p className="text-white/40 leading-relaxed max-w-sm">
                        The Department of Cyber Security at Adhiyamaan College of Engineering is dedicated to excellence in cybersecurity education and research, preparing students for successful careers in this critical field.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Quick Links</h3>
                    <ul className="space-y-2 text-white/50">
                        <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link to="/facilities" className="hover:text-primary transition-colors">Facilities</Link></li>
                        <li><Link to="/academics" className="hover:text-primary transition-colors">Academics</Link></li>
                        <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Contact Info</h3>
                    <ul className="space-y-4 text-white/50">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">Adhiyamaan College of Engineering, Hosur, Tamil Nadu 635109</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm">+91 9487819149</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm">hod_cse-cs@adhiyamaan.ac.in</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm">Mon-Sat: 8:30 AM - 4:05 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                <p>&copy; {new Date().getFullYear()} Adhiyamaan College of Engineering. All Rights Reserved.</p>
                <div className="flex items-center gap-6">
                    <p className="flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Secured by Dept of Cyber Security
                    </p>
                    <p>Designed by Karthikeyan.S</p>
                </div>
            </div>
        </div>
      </footer>
  );
};

export default PublicFooter;
