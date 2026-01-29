import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';

const FacilitiesPage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
        <PublicNavbar />
        
        <div className="fixed inset-0 z-0 pointer-events-none">
             <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
        </div>

      <section className="relative z-10 pt-32 pb-24">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">World-Class Facilities</h2>
                <div className="w-20 h-1 bg-primary mx-auto rounded-full"/>
                <p className="text-white/50 max-w-2xl mx-auto text-lg">
                    State-of-the-art infrastructure designed to foster innovation and practical learning.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    title="Cyber Range Lab"
                    desc="A simulated environment for cyber warfare training, allowing students to practice defense and attack strategies safely."
                    image="https://images.unsplash.com/photo-1558494949-ef2bb6affa03?auto=format&fit=crop&q=80&w=800"
                    badge="FLAGSHIP"
                    delay={0.1}
                />
                <FeatureCard 
                    title="IoT Security Lab"
                    desc="Dedicated hardware and tools for testing and securing Internet of Things devices and networks."
                    image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
                    delay={0.2}
                />
                <FeatureCard 
                    title="Forensics Workstations"
                    desc="High-performance systems equipped with industry-standard digital forensics and investigation software."
                    image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
                    delay={0.3}
                />
                <FeatureCard 
                    title="Smart Lecture Halls"
                    desc="Interactive learning environments with smart boards, audio systems, and lecture capture capabilities."
                    image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                    delay={0.4}
                />
                <FeatureCard 
                    title="Innovation Hub"
                    desc="A collaborative space for students to work on projects, hackathons, and research initiatives."
                    image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                    delay={0.5}
                />
                <FeatureCard 
                    title="Research Center"
                    desc="Dedicated facility for advanced research in cryptography, blockchain, and network security."
                    image="https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800"
                    delay={0.6}
                />
            </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

const FeatureCard = ({ title, desc, image, badge, delay }: { title: string, desc: string, image: string, badge?: string, delay: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -10 }}
        className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300"
    >
        <div className="aspect-video relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
            />
            {badge && (
                <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
                    {badge}
                </span>
            )}
        </div>
        
        <div className="p-8 relative z-20 -mt-12">
            <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-white/60 leading-relaxed font-light">
                {desc}
            </p>
        </div>
    </motion.div>
);

export default FacilitiesPage;
