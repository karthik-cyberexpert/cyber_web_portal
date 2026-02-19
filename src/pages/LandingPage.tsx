import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Cpu, 
  Network, 
  Terminal, 
  Users, 
  Trophy,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const highlights = [
    {
      icon: <Network className="w-8 h-8" />,
      title: "Network Security",
      description: "Master the art of defending complex network architectures and communication protocols."
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: "Ethical Hacking",
      description: "Learn to think like a hacker to build stronger, more resilient digital defenses."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Cryptography",
      description: "Understand the mathematical foundations of secure data encryption and privacy."
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Digital Forensics",
      description: "Acquire skills to investigate cyber crimes and recover critical digital evidence."
    }
  ];

  const stats = [
    { value: "100%", label: "Placement Support" },
    { value: "500+", label: "Expert Engineers" },
    { value: "15+", label: "Research Projects" },
    { value: "24/7", label: "Lab Access" }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden">
      <PublicNavbar />
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] opacity-30 mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] " />
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Empowering Future Cyber Guardians
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl xs:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Mastering the <br />
              <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent bg-300% animate-gradient">
                Digital Frontier
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg lg:text-xl text-white/50 max-w-xl leading-relaxed"
            >
              Join the CSE Cyber Security department at Adhiyamaan College of Engineering. We equip students with cutting-edge skills to protect the digital landscape of tomorrow.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 relative overflow-hidden group w-full sm:w-auto">
                  <span className="relative z-10 flex items-center gap-2">Student Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </Button>
              </Link>
              <a href="#about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 hover:text-white text-white/70 w-full sm:w-auto">
                  Explore Programs
                </Button>
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="relative glass-card p-8 rounded-3xl border-primary/20 bg-black/40 backdrop-blur-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-white/5 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-primary animate-bounce-slow" />
                  </div>
                  <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4">
                    <div className="w-8 h-1 bg-primary rounded-full mb-2" />
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4">
                    <div className="w-10 h-1 bg-blue-500 rounded-full mb-2" />
                    <div className="w-16 h-1 bg-white/20 rounded-full" />
                  </div>
                  <div className="h-40 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-transparent border border-white/5 flex items-center justify-center">
                    <Terminal className="w-16 h-16 text-blue-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-white/5 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div 
                {...fadeInUp}
                key={idx} 
                className="text-center space-y-2"
              >
                <h3 className="text-4xl lg:text-5xl font-bold gradient-text">{stat.value}</h3>
                <p className="text-white/40 font-medium uppercase tracking-widest text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              {...fadeInUp}
              className="lg:w-1/2 space-y-6"
            >
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase">About Our Department</h2>
              <h3 className="text-4xl lg:text-5xl font-bold">Pioneering Cybersecurity Education</h3>
              <p className="text-white/60 leading-relaxed text-lg">
                The Department of CSE - Cyber Security at Adhiyamaan College of Engineering (ACE) 
                is committed to delivering world-class education in the most critical field of modern 
                computing. Our mission is to produce highly skilled cyber-professionals with deep 
                technical expertise and strong ethical values.
              </p>
              <div className="space-y-4">
                {[
                  "AICTE Approved & NBA Accredited Program",
                  "State-of-the-Art Cybersecurity Labs",
                  "Industry Integrated Curriculum",
                  "Excellent Placement Record in Top Tech Firms"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-white/80 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/about">
                <Button variant="link" className="text-primary p-0 h-auto font-bold text-lg group">
                  Learn more about us <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <motion.div 
              {...fadeInUp}
              className="lg:w-1/2"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px]" />
                <div className="relative h-full w-full glass-card rounded-[2rem] p-4 animate-float">
                  <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
                    alt="Cyber Security Lab" 
                    className="w-full h-full object-cover rounded-[1.5rem] opacity-80"
                  />
                  <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl border-primary/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">#1</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider">in Region</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs/Specializations */}
      <section className="relative z-10 py-24 bg-black/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-blue-500 tracking-widest uppercase">Our Core Specializations</h2>
            <h3 className="text-4xl lg:text-5xl font-bold">Engineered for Technical Excellence</h3>
            <p className="text-white/40 text-lg">
              Our curriculum is designed to cover the entire spectrum of cybersecurity, 
              from low-level binary analysis to high-level cloud architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => (
              <motion.div 
                {...fadeInUp}
                key={idx}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 text-primary">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-white/40 leading-relaxed text-sm group-hover:text-white/60 transition-colors">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Preview */}
      <section className="relative z-10 py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-12 lg:p-20 overflow-hidden relative border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
              <div className="lg:w-1/2 space-y-6">
                <h3 className="text-3xl lg:text-4xl font-bold leading-tight">Advanced Research & Training Facilities</h3>
                <p className="text-white/50 text-lg leading-relaxed">
                  We provide our students with industry-standard labs and resources, 
                  including 24/7 access to specialized cybersecurity toolkits and 
                  high-performance computing environments.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Cyber Range",
                    "Forensics Lab",
                    "Network Ops Center",
                    "Incubation Center"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/70 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/facilities">
                  <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-white/90">
                    Tour our campus
                  </Button>
                </Link>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                  <div className="h-64 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
                    <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="h-64 rounded-2xl overflow-hidden glass-card p-2">
                    <img src="https://images.unsplash.com/photo-1510511459019-5dee9954889c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="h-48 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section Preview */}
      <section id="contact" className="relative z-10 py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div {...fadeInUp} className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-primary tracking-widest uppercase">Get in Touch</h2>
                <h3 className="text-4xl font-bold">Ready to take the next step?</h3>
                <p className="text-white/50 text-lg">
                  Whether you are a prospective student or an industry partner, 
                  we would love to hear from you.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: <Mail className="w-6 h-6" />, label: "Email", value: "hod_cse-cs@adhiyamaan.ac.in" },
                  { icon: <Phone className="w-6 h-6" />, label: "Call", value: "+91 9487819149" },
                  { icon: <MapPin className="w-6 h-6" />, label: "Location", value: "ACE, Hosur, TN, India" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 border-l-primary border-l-2">
                    <div className="text-primary">{item.icon}</div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-bold">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeInUp} className="glass-card p-8 rounded-3xl border-white/10">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">First Name</label>
                    <input type="text" className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary outline-none transition-all" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Last Name</label>
                    <input type="text" className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary outline-none transition-all" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Email Address</label>
                  <input type="email" className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary outline-none transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/60">Message</label>
                  <textarea className="w-full h-32 rounded-xl bg-white/5 border border-white/10 p-4 focus:border-primary outline-none transition-all resize-none" placeholder="How can we help you?" />
                </div>
                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
