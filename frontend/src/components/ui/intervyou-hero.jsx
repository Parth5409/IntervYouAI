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
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 selection:text-on-surface overflow-x-hidden">
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 glow-mesh pointer-events-none z-0"></div>
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header>
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-headline text-xl font-bold tracking-tighter text-white">IntervYou.AI</span>
              </div>
            </a>

            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-xs font-headline font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
                >
                  {item.title}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                className="hidden md:inline-flex bg-primary text-black font-bold h-10 px-6 rounded-lg text-xs uppercase tracking-widest"
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
            </div>
          </div>
        </header>

        <main>
          <section className="container py-24 relative">
            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative font-headline text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto leading-tight text-white"
              >
                {titleWords.map((text, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6 
                    }}
                    className="inline-block mx-2 md:mx-4"
                  >
                    {text}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="mx-auto mt-8 max-w-2xl text-lg text-on-surface-variant font-body leading-relaxed"
              >
                Empowering institutions with cutting-edge AI solutions to transform
                campus recruitment into a data-driven success story.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-12 flex flex-wrap justify-center gap-8"
              >
                {labels.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 1.8 + (index * 0.1), 
                      duration: 0.6,
                    }}
                    className="flex items-center gap-2.5 px-4"
                  >
                    <feature.icon className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-widest">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 2.4, 
                  duration: 0.6,
                }}
              >
                <Button
                  size="lg"
                  className="mt-14 bg-primary text-black font-headline font-bold text-lg rounded-xl px-12 py-7 shadow-lg shadow-primary/10 hover:brightness-110 transition-all"
                  onClick={() => navigate("/login")}
                >
                  GET STARTED <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </section>

          <section className="container py-24 border-t border-outline-variant/10" ref={ref} id="features">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              className="text-center text-4xl font-headline font-extrabold mb-16 text-white tracking-tight"
            >
              UNLOCK THE POWER OF <span className="text-primary italic">AI</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="grid md:grid-cols-3 max-w-6xl mx-auto gap-px bg-outline-variant/30 border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex flex-col items-center text-center p-12 bg-surface group hover:bg-surface-container transition-all duration-500 relative"
                >
                  <div className="mb-8 rounded-2xl bg-primary/10 p-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-5 text-xl font-headline font-bold text-white tracking-tight uppercase group-hover:text-primary transition-colors">
                    {feature.label}
                  </h3>
                  <p className="text-on-surface-variant font-body text-base leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
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
              © 2026 IntervYou.AI // INDUSTRIAL_INTELLIGENCE // ALL_RIGHTS_RESERVED
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-on-surface-variant opacity-40" />
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Region: Global_Node_01</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
