// privacy-policy.tsx
"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import BlurFade from "@/components/ui/blur-fade";
import { RevButtons } from "@/components/ui/RevButtons";

interface FadeInSectionProps {
  children: ReactNode;
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

interface SectionProps {
  title: string;
  children: React.ReactNode;
  index: number;
}

const Section = ({ title, children, index }: SectionProps) => (
  <FadeInSection delay={index * 0.1}>
    <BlurFade delay={index * 0.15} inView>
      <div className="rounded-lg p-4 sm:p-6 md:p-8 duration-300 bg-card">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-base sm:text-lg">
              {index + 1}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
            {title}
          </h2>
        </div>
        <div className="prose prose-gray dark:prose-invert max-w-none prose-base sm:prose-lg">
          {children}
        </div>
      </div>
    </BlurFade>
  </FadeInSection>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="pb-12 md:pb-16 space-y-16 mt-32 container">
        <FadeInSection delay={0.2}>
          <BlurFade delay={0.25} inView>
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-normal tracking-tighter lg:text-5xl text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-2 px-4">
                How we handle your information and communication preferences
              </p>
            </div>
          </BlurFade>
        </FadeInSection>

        <Card className="mx-auto border-0">
          <CardContent className="p-4 sm:p-8 md:p-12">
            <div className="space-y-6 sm:space-y-8">
              <Section title="Information We Collect" index={0}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Account details like name and email</li>
                  <li>Authentication methods (OAuth or email verification)</li>
                  <li>Metadata from projects, comments, and steps</li>
                  <li>Uploaded images for comments or references</li>
                  <li>Usage activity data to improve performance</li>
                </ul>
              </Section>

              <Section title="Media Handling" index={1}>
                <p className="text-muted-foreground">
                  Media is currently linked from platforms like Google Drive,
                  Dropbox, or Vimeo. No video content is hosted. This may change
                  in the future to allow uploads or hybrid storage.
                </p>
              </Section>

              <Section title="Email Communication" index={2}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>
                    Project-related notifications like comments, rounds, and
                    live updates
                  </li>
                  <li>Users can disable most non-essential notifications</li>
                  <li>Login and security-related emails cannot be disabled</li>
                  <li>
                    Changing email addresses requires support review and is not
                    guaranteed
                  </li>
                </ul>
              </Section>

              <Section title="Data Access and Deletion" index={3}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Users may request full account deletion at any time</li>
                  <li>
                    Once deleted, data is permanently removed without a recovery
                    period
                  </li>
                  <li>Users cannot currently export activity logs</li>
                </ul>
              </Section>

              <Section title="Adobe Extension" index={4}>
                <p className="text-muted-foreground">
                  If you use our official Adobe extensions, they interact with
                  your project data in the same way the web app does. No extra
                  data is collected.
                </p>
              </Section>

              <Section title="Security and Updates" index={5}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Data is encrypted in transit and at rest</li>
                  <li>
                    Privacy terms and data handling practices may change over
                    time
                  </li>
                </ul>
              </Section>
            </div>

            <FadeInSection delay={0.4}>
              <div className="mt-12 text-center space-y-6">
                <p className="text-muted-foreground">
                  For privacy-related concerns, contact:
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Link href="/support">
                    <RevButtons variant="default" size="lg">
                      Contact Support
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </RevButtons>
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </CardContent>
        </Card>
      </main>
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-14%] h-[120%] skew-y-12"
        )}
      />
    </div>
  );
};

export default PrivacyPolicy;
