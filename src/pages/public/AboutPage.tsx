import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Shield } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
        <PublicNavbar />
        
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] opacity-30 mix-blend-screen" />
        </div>

        <section className="relative z-10 pt-32 pb-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <img 
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
                                alt="Cyber Security Lab" 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center gap-2 text-white/80 mb-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium tracking-wider uppercase">Established 2023</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Excellence in Cyber Education</h3>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            About <span className="text-primary">Us</span>
                        </h2>
                        <p className="text-white/60 text-lg leading-relaxed">
                            The Department of Cyber Security is a pioneering center of excellence dedicated to shaping the next generation of digital defenders. We blend theoretical foundations with hands-on practical experience in network security, cryptography, and ethical hacking.
                        </p>
                        <p className="text-white/60 text-lg leading-relaxed">
                            Our curriculum is designed in collaboration with industry experts to ensure students are equipped with current technologies and methodologies to tackle modern cyber threats.
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-3xl font-bold text-white mb-1">100%</h4>
                                <p className="text-sm text-white/50">Placement Support</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-3xl font-bold text-white mb-1">50+</h4>
                                <p className="text-sm text-white/50">Industry Partners</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Content for specific page */}
                <div className="mt-24 space-y-16">
                     <div className="text-center max-w-3xl mx-auto space-y-6">
                        <h3 className="text-3xl font-bold text-white">Our Mission</h3>
                        <p className="text-white/60 text-lg leading-relaxed">To provide world-class education in cybersecurity, fostering a culture of innovation, ethics, and excellence. We aim to produce industry-ready professionals capable of securing the digital world.</p>
                     </div>
                     
                     <div className="text-center max-w-3xl mx-auto space-y-6">
                        <h3 className="text-3xl font-bold text-white">Our Vision</h3>
                        <p className="text-white/60 text-lg leading-relaxed">To be a globally recognized department for cybersecurity education and research, contributing specifically to national and international security infrastructure.</p>
                     </div>
                </div>
            </div>
        </section>

        <PublicFooter />
    </div>
  );
};

export default AboutPage;
