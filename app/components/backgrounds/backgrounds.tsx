"use client";
// backgrounds
import FlickeringGrid from "@/components/ui/flickering-grid";
import GridPattern from "@/components/ui/grid-pattern";
import Ripple from "@/components/ui/ripple";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
//
import { motion } from "framer-motion";
import React, { ReactNode } from "react";
interface children {
  children: React.ReactNode;
}
export function FlickeringGridBg({ children }: children) {
  return (
    <div className="relative rounded-lg w-full bg-background overflow-hidden border">
      <div>
        {" "}
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
        <div className="relative z-10 ">{children}</div>
      </div>
    </div>
  );
}

export function RippleBg({ children }: children) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <Ripple mainCircleSize={240} mainCircleOpacity={0.24} numCircles={8} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function DotPatternBg({ children }: children) {
  return (
    <div className="relative flex  w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export function DotPatternLinearGradientBg({ children }: children) {
  return (
    <div className="relative flex   items-center justify-center overflow-hidden rounded-lg  bg-background  ">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
        )}
      />
      <div className="relative z-10 w-full ">{children}</div>
    </div>
  );
}

export function GridPatternLinearGradientBg({ children }: children) {
  return (
    <div className="relative flex  flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
      <GridPattern
        width={20}
        height={20}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
        )}
      />
      <div className="relative z-1 w-full ">{children}</div>
    </div>
  );
}

export function GridPatternDashedBg({ children }: children) {
  return (
    <div className="relative flex  items-center justify-center overflow-hidden rounded-lg  bg-background  ">
      <GridPattern
        width={120}
        height={120}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="relative z-10 w-full ">{children}</div>
    </div>
  );
}

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col  min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900  text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

export function AuroraBackgroundBg({ children }: children) {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className=" w-full ">{children}</div>
      </motion.div>
    </AuroraBackground>
  );
}

import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export function BackgroundBeamsWithCollisionBg({ children }: children) {
  return (
    <BackgroundBeamsWithCollision>
      <div className=" w-full  ">{children}</div>
    </BackgroundBeamsWithCollision>
  );
}

export function Random({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-[url('/img/1.png')] bg-cover bg-center bg-no-repeat">
      {children}
    </div>
  );
}
