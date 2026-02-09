"use client";

import * as React from "react";
import {
  Activity,
  ArrowRight,
  BarChart,
  Brain,
  Menu,
  Plug,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  Globe,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { title: "SOLUTIONS", href: "#features" },
  { title: "WORKFLOW", href: "#workflow" },
  { title: "RESOURCES", href: "#footer" },
  { title: "DASHBOARD", href: "/dashboard" },
];

const labels = [
  { icon: Sparkles, label: "Real-time_Feedback" },
  { icon: Plug, label: "Company_Specific" },
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="container mx-auto px-4">
        <header>
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-mono text-xl font-bold tracking-tighter">IntervYou.AI</span>
              </div>
            </a>

            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="text-base font-mono text-foreground hover:text-primary transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                className="rounded-none hidden md:inline-flex bg-primary hover:bg-primary/90 hover:text-slate-950 font-mono text-slate-950 font-bold"
                onClick={() => navigate("/login")}
              >
                GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="rounded-none border-l border-border bg-background p-10">
                  <nav className="flex flex-col gap-8 mt-12">
                    {navigationItems.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="text-base font-mono text-foreground hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                    <Button 
                      className="cursor-pointer rounded-none bg-primary hover:bg-primary/90 font-mono text-slate-950 font-bold h-12"
                      onClick={() => navigate("/login")}
                    >
                      GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main>
          <section className="container py-24 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 -z-10" />
            
            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative font-mono text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto leading-tight"
              >
                {titleWords.map((text, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.15, 
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
                className="mx-auto mt-8 max-w-2xl text-xl text-foreground font-mono"
              >
                We empower institutions with cutting-edge AI solutions to transform
                campus recruitment into a data-driven success story.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="mt-12 flex flex-wrap justify-center gap-6"
              >
                {labels.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 1.8 + (index * 0.15), 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100,
                      damping: 10
                    }}
                                      className="flex items-center gap-2 px-6"
                                    >
                                      <feature.icon className="h-5 w-5 text-primary" />
                                      <span className="text-base font-mono uppercase tracking-widest">{feature.label}</span>
                                    </motion.div>                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 2.4, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 10
                }}
              >
                <Button
                  size="lg"
                  className="cursor-pointer rounded-none mt-12 bg-primary hover:bg-primary/90 font-mono text-slate-950 font-bold px-10 h-14"
                  onClick={() => navigate("/login")}
                >
                  GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </section>

          <section className="container py-24 border-t border-border" ref={ref} id="features">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                delay: 0.2, 
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              className="text-center text-4xl font-mono font-bold mb-12 uppercase tracking-tighter"
            >
              Unlock the Power of AI
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid md:grid-cols-3 max-w-6xl mx-auto border border-border"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    delay: 0.4 + (index * 0.2), 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  className="flex flex-col items-center text-center p-8 bg-background border-r last:border-r-0 border-border group hover:bg-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
                  <div className="mb-6 rounded-none bg-primary/10 p-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 relative z-10">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl font-mono font-bold uppercase tracking-tight group-hover:text-primary transition-colors relative z-10">
                    {feature.label}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground font-mono text-base leading-relaxed transition-colors relative z-10">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="container py-24 border-t border-border" id="workflow" ref={workflowRef}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-mono font-bold uppercase tracking-tighter mb-4">How_It_Works</h2>
              <div className="h-1 w-20 bg-primary mx-auto" />
            </div>

            <div className="grid md:grid-cols-4 gap-px bg-border border border-border">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isWorkflowInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="bg-background p-8 flex flex-col items-center text-center group hover:bg-primary/[0.03] transition-all duration-300"
                >
                  <div className="text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h4 className="font-mono text-xl font-bold mb-3 uppercase group-hover:text-primary transition-colors">{step.title}</h4>
                  <p className="text-muted-foreground group-hover:text-foreground font-mono text-base leading-relaxed transition-colors">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="container py-24 border-t border-border" ref={statsRef}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-4xl md:text-5xl font-mono font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground uppercase tracking-widest text-center">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="py-20 border-t border-border mt-20" id="footer">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-mono text-2xl font-bold tracking-tighter">IntervYou.AI</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm max-w-sm mb-8 leading-relaxed">
                Empowering the next generation of professionals with AI-driven interview intelligence. Industrial-grade preparation for top-tier careers.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
            
            <div>
              <h5 className="font-mono text-sm font-bold uppercase tracking-widest mb-6">Platform</h5>
              <ul className="space-y-4 font-mono text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors uppercase">Features</a></li>
                <li><a href="#workflow" className="hover:text-primary transition-colors uppercase">Workflow</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors uppercase">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-sm font-bold uppercase tracking-widest mb-6">Legal</h5>
              <ul className="space-y-4 font-mono text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors uppercase">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors uppercase">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors uppercase">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-border pt-10">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              © 2026 IntervYou.AI // INDUSTRIAL_INTELLIGENCE // ALL_RIGHTS_RESERVED
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Region: Global_Node_01</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
