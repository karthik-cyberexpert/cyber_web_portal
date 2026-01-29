import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';

const AcademicsPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
        <PublicNavbar />
        
        <div className="fixed inset-0 z-0 pointer-events-none">
             <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
        </div>

        <section className="relative z-10 pt-32 pb-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Academic <span className="text-primary">Curriculum</span></h2>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Our comprehensive curriculum covers the entire spectrum of cyber security, ensuring a robust foundation and specialized expertise. We follow a credit-based system that allows flexibility and depth.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { title: "Network Security", desc: "Deep dive into securing network infrastructures and protocols. Includes hands-on training with firewalls and IDS/IPS." },
                                { title: "Ethical Hacking", desc: "Methodologies for penetration testing and vulnerability assessment. Certified Ethical Hacker (CEH) aligned syllabus." },
                                { title: "Cryptography", desc: "Mathematical foundations of secure communication and data protection. Study of symmetric, asymmetric, and quantum cryptography." },
                                { title: "Cyber Forensics", desc: "Investigation techniques for digital crimes and incidents. Evidence collection, analysis, and legal procedures." },
                                { title: "Cloud Security", desc: "Securing cloud environments, virtualization, and containers. AWS and Azure security best practices." },
                                { title: "Malware Analysis", desc: "Reverse engineering and dissecting malware to understand its behavior and origin." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-white/50">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-l from-primary/10 to-transparent rounded-3xl" />
                         <div className="grid grid-cols-2 gap-4 h-full sticky top-32">
                            <div className="space-y-4 mt-8">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" className="rounded-2xl w-full h-48 object-cover opacity-80" alt="Code" />
                                <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800" className="rounded-2xl w-full h-64 object-cover opacity-80" alt="Screen" />
                            </div>
                            <div className="space-y-4">
                                <img src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800" className="rounded-2xl w-full h-64 object-cover opacity-80" alt="Server" />
                                <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800" className="rounded-2xl w-full h-48 object-cover opacity-80" alt="Hacker" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        <PublicFooter />
    </div>
  );
};

export default AcademicsPage;
