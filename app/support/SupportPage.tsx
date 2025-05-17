"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Twitter, Mail, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import img4 from "../../public/icons/4.png";
import { RevButtons } from "@/components/ui/RevButtons";
interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeInSection = ({
  children,
  delay = 0,
  className = "",
}: FadeInSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
    amount: 0.3,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

const HeroSection = () => (
  <section className="container mx-auto px-4 mt-28">
    <FadeInSection delay={0.2}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1
          className="text-4xl md:text-5xl font-normal tracking-tighter lg:text-5xl text-transparent bg-clip-text 
          dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
          bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
        >
          How Can We Help You?
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 px-4">
          Get the support you need through multiple channels - we're here to
          help
        </p>
      </div>
    </FadeInSection>
  </section>
);

const SupportOptionsSection = () => {
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const handleOptionClick = (title: string) => {
    setDialogTitle(title);
    setOpen(true);
  };

  const handleEmailContact = () => {
    window.location.href =
      "mailto:ravivcoo@gmail.com?subject=" + encodeURIComponent(dialogTitle);
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          {/* Add text-center class for small screens and remove it for lg screens */}
          <div className="space-y-6 text-center md:text-left">
            <h3
              className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text 
              dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
              bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]"
            >
              Ways to Get Support
            </h3>
            <ul className="space-y-4">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div>
                  <p className="font-medium ">Report Issues</p>
                  <p className="text-muted-foreground">
                    Let us know about any bugs or technical problems
                  </p>
                </div>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div>
                  <p className="font-medium">Get Help</p>
                  <p className="text-muted-foreground">
                    Ask questions and get guidance on using the platform
                  </p>
                </div>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div>
                  <p className="font-medium">Join Community</p>
                  <p className="text-muted-foreground">
                    Connect with other users in our Discord server
                  </p>
                </div>
              </li>
            </ul>
            <div className="pt-4 flex justify-center md:justify-start">
              <RevButtons
                onClick={() => handleOptionClick("Support Request")}
                variant="default"
              >
                Get Support
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </RevButtons>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Image
              placeholder="blur"
              quality={100}
              loading="lazy"
              src={img4}
              alt="Support Features"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </motion.div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="p-5">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                Choose how you'd like to contact us:
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <RevButtons
                variant="outline"
                className="w-full"
                onClick={handleEmailContact}
              >
                <Mail className="w-4 h-4 mr-2" />
                Via Email
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </RevButtons>
              <Link
                href="https://twitter.com/raivcoo"
                target="_blank"
                className="w-full"
              >
                <RevButtons variant="info" className="w-full">
                  <Twitter className="w-4 h-4 mr-2" />
                  Via Twitter
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </RevButtons>
              </Link>
              <Link
                href="https://discord.gg/G5AZBEP5"
                target="_blank"
                className="w-full"
              >
                <RevButtons variant="default" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Join Discord Server
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </RevButtons>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </motion.div>
  );
};

export default function SupportPage() {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="pb-12 md:pb-16 relative z-10 space-y-16 mt-16">
        <HeroSection />
        <SupportOptionsSection />
      </main>
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-14%] h-[90%] skew-y-12"
        )}
      />
    </div>
  );
}
