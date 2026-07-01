"use client"

import { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowRight, Play, Github, MessageCircle } from "lucide-react";
import Typewriter from 'typewriter-effect';
import { AppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { startGithubLogin } from "@/lib/auth";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = AppStore.useState(s => s.isAuthenticated);
  const router = useRouter();
  const scrollToNextSection = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/95 z-10" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container relative z-20 text-center px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
              Trusted by 50+ developers and managers
            </div>
            <div className="text-muted-foreground text-sm">
              3-day free trial • No credit card required
            </div>
          </div>
          <div className="h-[200px] flex items-center justify-center">
            <Typewriter
              options={{
                strings: [
                  "Track your devs without slowing them down.",
                  "Status updates without the standups.",
                  "PM like a founder, not like a spreadsheet.",
                  "Automatic tracking for devs in flow.",
                  "Know who's working, without asking.",
                  "Build fast. Track smart. Skip the micromanagement."
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 30,
                delay: 50,
                cursor: "|",
                wrapperClassName: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
                cursorClassName: "text-primary"
              }}
            />
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Fully Open Source tool to tell you the tasks your developers have done in projects.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button onClick={() => {
              if (isAuthenticated) {
                router.push('/dashboard');
              } else {
                startGithubLogin();
              }
            }} size="lg" className="text-lg group">
              <Github className="mr-2 h-5 w-5" />
              Start free trial (10s)
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* <Button size="lg" variant="outline" className="text-lg group" onClick={() => router.push('/demo')}>
              See demo
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button> */}
            <Button size="lg" variant="outline" className="text-lg group" onClick={() => window.open("https://wa.me/919896039378?text=Hi%20Himanshu,%20I%20am%20interested%20in%20your%20product%20and%20would%20like%20to%20know%20more%20about%20it.", "_blank")}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to Founder {':)'}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 cursor-pointer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={scrollToNextSection}
        >
          <ChevronDown className="h-10 w-10 animate-bounce text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
}