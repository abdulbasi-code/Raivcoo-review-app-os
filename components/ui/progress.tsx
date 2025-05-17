// @ts-nocheck
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    colorScheme?: "red" | "orange" | "blue" | "green";
  }
>(({ className, value, colorScheme, ...props }, ref) => {
  // Determine color based on progress value or use passed colorScheme
  const dynamicColorScheme =
    colorScheme ||
    (value < 25
      ? "red"
      : value < 50
        ? "orange"
        : value < 75
          ? "blue"
          : "green");

  // Set background and foreground colors based on colorScheme
  const bgColorMap = {
    red: "bg-red-900/40",
    orange: "bg-orange-900/40",
    blue: "bg-blue-900/40",
    green: "bg-[#064E3B]/40",
  };

  const fgColorMap = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden border-2 border-dashed rounded-[5px]",
        bgColorMap[dynamicColorScheme],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          fgColorMap[dynamicColorScheme]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
