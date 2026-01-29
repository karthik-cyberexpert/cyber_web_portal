import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
        <PublicNavbar />
        
        <div className="fixed inset-0 z-0 pointer-events-none">
             <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] opacity-40 mix-blend-screen" />
        </div>

      <section className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Get in <span className="text-primary">Touch</span></h2>
                 <p className="text-white/50">We'd love to hear from you. Reach out to us for any queries.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Visit Us</h4>
                    <p className="text-white/60 leading-relaxed">
                        Department of Cyber Security,<br/>
                        Adhiyamaan College of Engineering,<br/>
                        Hosur, Tamil Nadu 635109
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Email Us</h4>
                    <p className="text-white/60 leading-relaxed space-y-2">
                        <a href="mailto:hod_cse-cs@adhiyamaan.ac.in" className="block hover:text-white transition-colors">hod_cse-cs@adhiyamaan.ac.in</a>
                        <a href="mailto:admissions@adhiyamaan.ac.in" className="block hover:text-white transition-colors">admissions@adhiyamaan.ac.in</a>
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Call Us</h4>
                    <p className="text-white/60 leading-relaxed">
                        <span className="block">+91 9487819149</span>
                        <span className="block">04344 - 261001</span>
                        <span className="block text-sm mt-4 text-white/40 flex items-center justify-center gap-2">
                            <Clock className="w-3 h-3" /> Mon-Sat: 8:30 AM - 4:05 PM
                        </span>
                    </p>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-16 rounded-3xl overflow-hidden border border-white/10 h-[400px] bg-white/5 flex items-center justify-center relative">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3893.30829377402!2d77.8763663148182!3d12.627885991083984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae7a5655555555%3A0x6b0ce3b707440409!2sAdhiyamaan%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1625641234567!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                    allowFullScreen={true} 
                    loading="lazy"
                />
            </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;
