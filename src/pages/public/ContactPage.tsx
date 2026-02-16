import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { MapPin, Mail, Phone, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactPage = () => {
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
                        Contact <span className="gradient-text">Us</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-lg max-w-2xl mx-auto"
                    >
                        Have questions? We're here to help you navigate your journey in cybersecurity.
                    </motion.p>
                </div>
            </section>

            <section className="relative z-10 py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Info Cards */}
                        <div className="space-y-8">
                            <motion.div {...fadeInUp} className="space-y-6">
                                <h2 className="text-3xl font-bold">Get in Touch</h2>
                                <p className="text-white/60 text-lg">
                                    Our department is open for inquiries from prospective students, 
                                    parents, and industry partners. Feel free to reach out via any 
                                    of the channels below.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        icon: <Mail className="w-6 h-6" />,
                                        title: "Email",
                                        value: "hod_cse-cs@adhiyamaan.ac.in",
                                        link: "mailto:hod_cse-cs@adhiyamaan.ac.in"
                                    },
                                    {
                                        icon: <Phone className="w-6 h-6" />,
                                        title: "Phone",
                                        value: "+91 9487819149",
                                        link: "tel:+919487819149"
                                    },
                                    {
                                        icon: <MapPin className="w-6 h-6" />,
                                        title: "Location",
                                        value: "ACE Hosur, Tamil Nadu",
                                        link: "#"
                                    },
                                    {
                                        icon: <Clock className="w-6 h-6" />,
                                        title: "Office Hours",
                                        value: "8:30 AM - 4:05 PM",
                                        link: "#"
                                    }
                                ].map((item, idx) => (
                                    <motion.a 
                                        {...fadeInUp}
                                        key={idx}
                                        href={item.link}
                                        className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
                                    >
                                        <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-sm text-white/40 break-words">{item.value}</p>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <motion.div 
                            {...fadeInUp}
                            className="glass-card p-8 lg:p-12 rounded-[2.5rem] border-white/10 bg-black/40 backdrop-blur-2xl"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Send a Message</h3>
                            </div>
                            
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60">Subject</label>
                                    <select className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option className="bg-black">General Inquiry</option>
                                        <option className="bg-black">Admissions</option>
                                        <option className="bg-black">Industry Collaboration</option>
                                        <option className="bg-black">Student Feedback</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60">Your Message</label>
                                    <textarea 
                                        className="w-full h-40 rounded-2xl bg-white/5 border border-white/10 p-6 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" 
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/25 group">
                                    Send Message
                                    <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Map Section */}
                    <motion.div 
                        {...fadeInUp}
                        className="mt-24 rounded-[3rem] overflow-hidden border border-white/10 h-[500px] relative group"
                    >
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3893.30829377402!2d77.8763663148182!3d12.627885991083984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae7a5655555555%3A0x6b0ce3b707440409!2sAdhiyamaan%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1625641234567!5m2!1sen!2sin" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) shadow-xl' }} 
                            allowFullScreen={true} 
                            loading="lazy"
                        />
                    </motion.div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default ContactPage;
