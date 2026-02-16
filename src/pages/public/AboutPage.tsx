import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Eye, Award, Users, BookOpen, Lock, Terminal } from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';

const AboutPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
            <PublicNavbar />
            
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] opacity-30 mix-blend-screen" />
            </div>

            {/* Header Section */}
            <section className="relative z-10 pt-40 pb-20 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 text-center space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl lg:text-6xl font-bold tracking-tight"
                    >
                        About Our <span className="gradient-text">Department</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-lg max-w-2xl mx-auto"
                    >
                        Nurturing the next generation of cybersecurity leaders at Adhiyamaan College of Engineering.
                    </motion.p>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="relative z-10 py-24">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                        {...fadeInUp}
                        className="glass-card p-10 rounded-[2.5rem] border-primary/20 bg-primary/5 space-y-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <Target className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Our Mission</h2>
                        <p className="text-white/60 leading-relaxed text-lg italic">
                            "To provide students with a solid foundation in computer science and specialized knowledge in cybersecurity. 
                            We aim to develop technical proficiency and ethical understanding necessary to protect global digital infrastructure."
                        </p>
                    </motion.div>

                    <motion.div 
                        {...fadeInUp}
                        className="glass-card p-10 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5 space-y-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                            <Eye className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Our Vision</h2>
                        <p className="text-white/60 leading-relaxed text-lg italic">
                            "To be a premier center of excellence for cybersecurity education and research, 
                            producing innovative leaders capable of securing the digital world against evolving cyber threats."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Department Overview */}
            <section className="relative z-10 py-24 bg-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeInUp} className="space-y-6">
                            <h2 className="text-3xl lg:text-4xl font-bold">A Legacy of <span className="text-primary">Excellence</span></h2>
                            <p className="text-white/60 leading-relaxed text-lg">
                                The CSE (Cyber Security) department at ACE Hosur was established to address the 
                                critical shortage of skilled security professionals. Our curriculum is integrated 
                                with industry certifications (CompTIA, CEH, CISSP) to ensure students are 
                                job-ready from day one.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <Award />, text: "NBA Accredited" },
                                    { icon: <Users />, text: "Expert Faculty" },
                                    { icon: <BookOpen />, text: "Digital Library" },
                                    { icon: <Lock />, text: "Zero Trust focus" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                                        <div className="text-primary">{item.icon}</div>
                                        <span className="font-medium text-white/80">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div {...fadeInUp} className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px]" />
                            <div className="relative glass-card overflow-hidden rounded-[2rem] border-white/10">
                                <img 
                                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
                                    alt="Cyber Lab" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="relative z-10 py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold">Our Core Values</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Technical Rigor",
                                desc: "Deep diving into system internals, cryptography, and network protocols."
                            },
                            {
                                title: "Ethical Integrity",
                                desc: "Upholding the highest standards of professional and ethical conduct in cyberspace."
                            },
                            {
                                title: "Continuous Learning",
                                desc: "Staying ahead of the rapidly changing threat landscape through constant research."
                            }
                        ].map((item, idx) => (
                            <motion.div 
                                {...fadeInUp}
                                key={idx}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 hover:bg-white/10 transition-colors"
                            >
                                <h4 className="text-xl font-bold text-primary">{item.title}</h4>
                                <p className="text-white/40 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default AboutPage;
