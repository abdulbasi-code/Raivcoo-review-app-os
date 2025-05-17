// app/home/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { RevButtons } from "@/components/ui/RevButtons";
import { BorderTrail } from "@/components/ui/border-trail";
import { GridBackground, Spotlight } from "@/components/ui/spotlight-new";
import { BentoDemo } from "../bentos";
import { Badge } from "@/components/ui/badge";

import { TextShimmer } from "@/components/ui/text-shimmer";

function AnimatedSection({ children, className }: any) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-screen bg-background overflow-hidden text-foreground">
      <GridBackground />
      <Spotlight />
      <div className="relative z-40">
        <section className="pt-32 pb-10 px-4  text-center container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="bg-black/70">
              <TextShimmer> Open beta </TextShimmer>
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl mt-3 font-bold tracking-tight text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
          >
            Simple Feedback, Faster Revisions.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mt-6"
          >
            TEST is built for solo editors who need fast client feedback. No
            logins. Just send a link and get comments at the right time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex  flex-row gap-4 justify-center mt-8"
          >
            <Link href="/signup">
              <RevButtons size="lg" variant="default" className="px-4">
                Start For Free
              </RevButtons>
            </Link>
            <button
              onClick={() => {
                featuresRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <RevButtons size="lg" variant="outline" className="px-4">
                Explore Features
              </RevButtons>
            </button>
          </motion.div>
        </section>

        <AnimatedSection className="">
          <div className="container mx-auto px-4">
            <div className="relative rounded-xl overflow-hidden border border-[#3F3F3F] shadow-2xl max-w-5xl mx-auto">
              <Image
                quality={100}
                priority
                src="/1.png"
                alt="TEST Dashboard"
                width={1200}
                height={700}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-20"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-16">
          <div ref={featuresRef} className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
              Built for Solo Editor Workflows
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              TEST helps solo editors get clear client feedback without logins
              or distractions.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection className="container mx-auto px-4">
          <div className="container mx-auto px-4">
            <BentoDemo />
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <Image
                quality={100}
                priority
                src="/2.png"
                alt="Client Comment Flow"
                width={600}
                height={400}
                className="w-full h-auto rounded-xl border border-[#3F3F3F] shadow-xl"
              />
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
                  Share Edits. Collect Feedback. Stay on Track.
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Share your video link. Clients can leave timestamped feedback,
                  attach images, and trigger a new round automatically. You can
                  protect the review page with a password and track each round
                  as it progresses.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>
                      Supports YouTube, Vimeo, Google Drive, Dropbox & images
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>Clients can leave feedback without logging in</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>Automatic round creation from feedback</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>Optional password protection for review pages</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>Live round tracking and comment history</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
                  Access Feedback Where You Work
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  View client comments directly inside your Adobe workspace — no
                  switching tools or tabs.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Premiere Pro",
                    "After Effects",
                    "Animate",
                    "Illustrator",
                    "Photoshop",
                  ].map((app) => (
                    <li key={app} className="flex items-start">
                      <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                      <span>Adobe {app}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-purple-500 mr-2 mt-1" />
                    <span>Browser access when you're not in Adobe</span>
                  </li>
                </ul>
              </div>
              <Image
                quality={100}
                priority
                src="/3.png"
                alt="App Access"
                width={600}
                height={400}
                className="w-full h-auto rounded-xl border border-[#3F3F3F] shadow-xl order-1 md:order-2"
              />
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-card border-2 border-[#3F3F3F] rounded-xl p-12 max-w-3xl mx-auto relative overflow-hidden">
              <BorderTrail />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
                Get Feedback. Move Faster.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Made for solo editors to get feedback and move through revisions
                quickly.
              </p>

              <Link href="/signup">
                <RevButtons size="lg" variant="default">
                  Start For Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </RevButtons>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
