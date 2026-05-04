"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  BarChart,
  Brain,
  Menu,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  Globe,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "SOLUTIONS", href: "#features" },
  { title: "WORKFLOW", href: "#workflow" },
  { title: "RESOURCES", href: "#footer" },
  { title: "DASHBOARD", href: "/dashboard" },
];

const labels = [
  { icon: Sparkles, label: "Real-time_Feedback" },
  { icon: MessageSquare, label: "Company_Specific" },
  { icon: Activity, label: "Voice_Interaction" },
];

const features = [
  {
    icon: BarChart,
    label: "Advanced Analytics",
    description: "Gain deeper insights into your soft skills and technical accuracy with our cutting-edge predictive models.",
  },
  {
    icon: Zap,
    label: "Intelligent Automation",
    description: "Streamline the placement process with AI-powered automation solutions and automated scheduling.",
  },
  {
    icon: Activity,
    label: "Real-time Insights",
    description: "Make informed decisions faster with immediate corrective feedback during your interview sessions.",
  },
];

const workflowSteps = [
  {
    icon: FileText,
    title: "Upload JD",
    description: "TPO uploads the Job Description for the upcoming placement drive.",
  },
  {
    icon: Users,
    title: "Assign Drive",
    description: "Filter and assign the mock drive to eligible students based on criteria.",
  },
  {
    icon: MessageSquare,
    title: "AI Interview",
    description: "Students participate in a voice-to-voice AI interview tailored to the JD.",
  },
  {
    icon: CheckCircle,
    title: "Get Reports",
    description: "Instant, detailed feedback reports are generated for both students and TPOs.",
  },
];

const stats = [
  { label: "Interviews Conducted", value: "10,000+" },
  { label: "Universities Onboarded", value: "50+" },
  { label: "Placement Success Rate", value: "92%" },
  { label: "AI Latency", value: "< 2s" },
];

export function IntervYouHero() {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const workflowRef = React.useRef(null);
  const statsRef = React.useRef(null);
  
  const isWorkflowInView = useInView(workflowRef, { once: true, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.1 });
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const titleWords = [
    "THE",
    "AI", 
    "REVOLUTION",
    "FOR",
    "CAMPUS",
    "PLACEMENTS",
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 selection:text-on-surface overflow-x-hidden relative">
      <div className="noise" />
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header>
          <div className="flex h-20 items-center justify-between">
            <motion.a 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              href="/" 
              className="flex items-center gap-2"
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <span className="font-headline text-2xl font-bold tracking-tighter text-white">IntervYou<span className="text-primary italic">.AI</span></span>
              </div>
            </motion.a>

            <nav className="hidden md:flex items-center space-x-10">
              {navigationItems.map((item, index) => (
                <motion.a
                  key={item.title}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  href={item.href}
                  className="text-[11px] font-headline font-bold text-on-surface-variant hover:text-primary transition-all tracking-[0.2em] relative group"
                >
                  {item.title}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full" />
                </motion.a>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button
                variant="default"
                className="hidden md:inline-flex bg-white text-black hover:bg-primary hover:text-white font-bold h-11 px-8 rounded-full text-xs uppercase tracking-widest transition-all duration-500 shadow-xl shadow-white/5"
                onClick={() => navigate("/login")}
              >
                GET STARTED <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-surface-container-low border-l border-outline-variant/30 p-10">
                  <nav className="flex flex-col gap-8 mt-12">
                    {navigationItems.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="text-sm font-headline font-bold text-on-surface hover:text-primary transition-colors tracking-widest"
                      >
                        {item.title}
                      </a>
                    ))}
                    <Button 
                      className="bg-primary text-black font-bold h-12 rounded-lg"
                      onClick={() => navigate("/login")}
                    >
                      GET STARTED <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </header>

        <main>
          <section className="container py-32 relative">
            <div className="flex flex-col items-center text-center">
              <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                <Sparkles className="w-3 h-3" /> Empowering the Next Generation
              </div>
              <motion.h1
                initial={{ filter: "blur(20px)", opacity: 0, y: 50 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative font-headline text-5xl font-black sm:text-6xl md:text-7xl lg:text-8xl max-w-6xl mx-auto leading-[0.9] text-white tracking-tighter"
              >
                {titleWords.map((text, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, rotateX: 90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ 
                      delay: 0.4 + (index * 0.08), 
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                    className={cn(
                      "inline-block mx-1 md:mx-3",
                      text === "AI" && "text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic"
                    )}
                  >
                    {text}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mx-auto mt-12 max-w-2xl text-xl text-on-surface-variant font-body leading-relaxed opacity-80"
              >
                Transforming campus recruitment into a data-driven success story with high-fidelity voice-to-voice AI intelligence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 1.6, 
                  duration: 0.8,
                }}
                className="mt-16 flex flex-col md:flex-row items-center gap-8"
              >
                <Button
                  size="lg"
                  className="bg-primary text-black font-headline font-bold text-xl rounded-full px-14 py-8 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500"
                  onClick={() => navigate("/login")}
                >
                  START NOW <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
                
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-surface-container overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-background bg-primary flex items-center justify-center text-black text-[10px] font-bold">
                    +10k
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="container py-32 border-t border-white/5" ref={ref} id="features">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
              <div className="max-w-2xl">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block"
                >
                  Core Capabilities
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  className="text-5xl md:text-6xl font-headline font-black text-white tracking-tighter leading-none"
                >
                  ENGINEERED FOR <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">EXCELLENCE.</span>
                </motion.h2>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                className="text-on-surface-variant max-w-xs text-sm leading-relaxed"
              >
                Our platform leverages the latest in Large Language Models and STT/TTS to provide an indistinguishable human experience.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2 }}
                  className="group relative p-12 bg-surface-container-low/30 rounded-[3rem] border border-white/5 hover:border-primary/20 transition-all duration-700 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                  <div className="mb-10 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:rotate-12 transition-all duration-500">
                    <feature.icon className="h-8 w-8 text-white group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="mb-6 text-2xl font-headline font-bold text-white tracking-tight">
                    {feature.label}
                  </h3>
                  <p className="text-on-surface-variant font-body text-base leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="container py-24 border-t border-outline-variant/10" id="workflow" ref={workflowRef}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-extrabold text-white tracking-tight mb-4">HOW_IT_WORKS</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isWorkflowInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/20 flex flex-col items-center text-center group hover:bg-surface-container hover:border-primary/20 transition-all duration-500 shadow-xl"
                >
                  <div className="text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h4 className="font-headline text-lg font-bold mb-4 text-white uppercase">{step.title}</h4>
                  <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="container py-24 border-t border-outline-variant/10" ref={statsRef}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-2 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest text-center opacity-60">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="py-24 border-t border-outline-variant/10 mt-20" id="footer">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-headline text-2xl font-bold tracking-tighter text-white">IntervYou.AI</span>
              </div>
              <p className="text-on-surface-variant font-body text-sm max-w-sm mb-10 leading-relaxed">
                Empowering the next generation of professionals with AI-driven interview intelligence. Industrial-grade preparation for top-tier careers.
              </p>
              <div className="flex space-x-8">
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
            
            <div>
              <h5 className="font-headline text-xs font-bold text-white uppercase tracking-widest mb-8">Platform</h5>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a href="#features" className="hover:text-primary transition-colors">FEATURES</a></li>
                <li><a href="#workflow" className="hover:text-primary transition-colors">WORKFLOW</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">DASHBOARD</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-headline text-xs font-bold text-white uppercase tracking-widest mb-8">Legal</h5>
              <ul className="space-y-4 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">PRIVACY</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">TERMS</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">COOKIES</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-outline-variant/10 pt-12">
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
              © 2026 IntervYou.AI // PROFESSIONAL PREPARATION // ALL_RIGHTS_RESERVED
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-on-surface-variant opacity-40" />
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Region: Global Server</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
