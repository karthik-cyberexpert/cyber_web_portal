import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { BookOpen, ArrowRight } from 'lucide-react';

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
        <PublicNavbar />
        
        <div className="fixed inset-0 z-0 pointer-events-none">
             <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        </div>

      <section className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Student <span className="text-blue-500">Innovation</span></h2>
                 <p className="text-white/50">Showcasing groundbreaking projects from our talented students.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "AI Threat Detection", cat: "Machine Learning", color: "bg-purple-500", desc: "A system using machine learning algorithms to detect and classify zero-day exploits in real-time network traffic." },
                    { title: "Blockchain Voting", cat: "Web3 Security", color: "bg-emerald-500", desc: "Decentralized and immutable voting platform ensuring transparency and preventing electoral fraud." },
                    { title: "Secure Chat App", cat: "Cryptography", color: "bg-blue-500", desc: "End-to-end encrypted messaging application using post-quantum cryptography algorithms." },
                    { title: "IoT Home Guard", cat: "IoT Security", color: "bg-orange-500", desc: "Smart home firewall that monitors IoT device traffic and blocks unauthorized access attempts." },
                    { title: "PhishGuard", cat: "Network Security", color: "bg-red-500", desc: "Browser extension using natural language processing to identify and block sophisticated phishing attacks." },
                    { title: "Cloud Sentinel", cat: "Cloud Security", color: "bg-cyan-500", desc: "Automated compliance monitoring and remediation tool for multi-cloud environments." }
                ].map((project, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-8 hover:border-primary/50 transition-all cursor-pointer group hover:bg-white/10"
                    >
                        <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center mb-6`}>
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                        <p className="text-white/50 mb-4">{project.cat}</p>
                        <p className="text-white/40 text-sm mb-6 leading-relaxed">{project.desc}</p>
                        <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ProjectsPage;
