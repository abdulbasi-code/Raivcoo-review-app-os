// terms-of-service.tsx
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

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex justify-center">
      <main className="pb-12 md:pb-16 space-y-16 mt-32 container">
        <FadeInSection delay={0.2}>
          <BlurFade delay={0.25} inView>
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-normal tracking-tighter lg:text-5xl text-transparent bg-clip-text dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.00)_202.08%)]">
                Terms of Service
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-2 px-4">
                Please read these terms carefully before using the test platform
              </p>
            </div>
          </BlurFade>
        </FadeInSection>

        <Card className="mx-auto border-0">
          <CardContent className="p-4 sm:p-8 md:p-12">
            <div className="space-y-6 sm:space-y-8">
              <Section title="Acceptance of Terms" index={0}>
                <p className="text-muted-foreground">
                  By accessing and using test, you agree to be bound by these
                  Terms of Service. If you do not agree with any part of these
                  terms, you may not use the platform.
                </p>
              </Section>

              <Section title="Platform Overview" index={1}>
                <p className="text-muted-foreground">
                  test provides a video review system for editors and clients to
                  collaborate. Features include timestamped commenting, live
                  step tracking, and project rounds. Videos are linked from
                  third-party sources. This setup may evolve to include direct
                  uploads or hybrid hosting.
                </p>
              </Section>

              <Section title="User Requirements" index={2}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Users must be 13 years of age or older</li>
                  <li>You are responsible for your account activity</li>
                  <li>Impersonation or account sharing is not allowed</li>
                </ul>
              </Section>

              <Section title="Media Responsibility" index={3}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>
                    All videos must be legally owned or licensed by the user
                  </li>
                  <li>We do not host videos; all links are user-provided</li>
                  <li>
                    Users are responsible for complying with third-party host
                    terms (Google Drive, Dropbox, Vimeo, etc.)
                  </li>
                </ul>
              </Section>

              <Section title="Notifications & Email Policy" index={4}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Users will receive email updates for review activity</li>
                  <li>Most project-based notifications can be disabled</li>
                  <li>
                    Core emails such as login verification cannot be turned off
                  </li>
                  <li>
                    Email address changes must go through support and are
                    subject to account status
                  </li>
                </ul>
              </Section>

              <Section title="Adobe Extension" index={5}>
                <p className="text-muted-foreground">
                  Our Adobe extension allows users to access test project data
                  within Adobe apps. It uses the same authentication and
                  respects the same permissions as the web version. No
                  additional data is collected or stored locally by the
                  extension.
                </p>
              </Section>

              <Section title="Subscription and Billing" index={6}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>
                    Subscriptions are manually renewed — there is no auto-renew
                  </li>
                  <li>
                    Future updates may introduce auto-renewal, with opt-out
                    options
                  </li>
                  <li>
                    Access to Pro features is granted during an active billing
                    cycle
                  </li>
                </ul>
              </Section>

              <Section title="Refunds" index={7}>
                <p className="text-muted-foreground">
                  There is no guaranteed refund policy. We may review refund
                  requests based on usage, technical issues, or other reasonable
                  factors. We reserve the right to introduce a structured refund
                  process at any time.
                </p>
              </Section>

              <Section title="Account Termination" index={8}>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>
                    Accounts may be suspended or banned for violating terms
                  </li>
                  <li>Deleted accounts are not recoverable</li>
                </ul>
              </Section>

              <Section title="Limitation of Liability" index={9}>
                <p className="text-muted-foreground">
                  test is provided "as is" without warranties. We are not liable
                  for loss of data, failed video links, or external service
                  errors. Our liability is limited to the subscription amount
                  paid in the last 90 days, if any.
                </p>
              </Section>

              <Section title="Changes to Terms" index={10}>
                <p className="text-muted-foreground">
                  These terms are subject to change as features and integrations
                  evolve. Users will be notified of significant changes.
                  Continued use of the platform means acceptance of updated
                  terms.
                </p>
              </Section>

              <Section title="Contact" index={11}>
                <p className="text-muted-foreground">
                  For questions or support:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Email: support@test.com</li>
                  <li>Discord: https://discord.gg/G5AZBEP5</li>
                </ul>
              </Section>
            </div>

            <FadeInSection delay={0.4}>
              <div className="mt-12 text-center space-y-6">
                <p className="text-muted-foreground">
                  Need help understanding our terms?
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

export default TermsOfService;
