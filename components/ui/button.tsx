import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center  justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        twitter_plus: "bg-cyan-500/10  text-cyan-500 hover:bg-cyan-500/30",
        facebook_plus: "bg-cyan-500/10  text-cyan-500 hover:bg-cyan-500/30",
        cyan_plus:
          "dark:bg-[#0a1c1f] bg-[#e6f8fb] border text-cyan-500 dark:hover:bg-cyan-500/20 hover:bg-cyan-500/30",
        twitter: "bg-cyan-500 text-primary-foreground hover:bg-cyan-500/90",
        facebook: "bg-blue-500 text-primary-foreground hover:bg-blue-500/90",
        instagram: "bg-pink-500 text-primary-foreground hover:bg-pink-500/90",
        tiktok:
          "bg-black dark:text-primary text-primary-foreground hover:bg-black/90", // Add TikTok styling
        youtube: "bg-red-500 text-primary-foreground hover:bg-red-500/90",
        purple_plus:
          "dark:bg-[#1a1222] bg-[#f6eefe] border-2 text-purple-500 dark:hover:bg-purple-500/20 hover:bg-purple-500/30",
        white_plus:
          "bg-white/10 border dark:border-primary/10 text-primary hover:bg-white/30",
        yellow_plus:
          "dark:bg-[#211b0a] bg-[#fdf7e6] border-2 text-yellow-400 dark:hover:bg-yellow-500/20 hover:bg-yellow-500/30",
        gray_plus: "bg-gray-700/10 border-2 text-gray-300 hover:bg-gray-700/30",
        red_plus:
          "dark:bg-[#211010] bg-[#fdecec] border-2 text-red-500 dark:hover:bg-red-500/20 hover:bg-red-500/30",
        blue_plus:
          "dark:bg-[#0f1622] bg-[#ebf2fe] border-2 text-blue-500 dark:hover:bg-blue-500/20 hover:bg-blue-500/30",
        green_plus:
          "dark:bg-[#0b1c16] bg-[#e7f8f2] border-2 text-emerald-500 dark:hover:bg-emerald-500/20 hover:bg-emerald-500/30",
        green: "bg-green-500 text-primary-foreground hover:bg-green-500/90",
        blue: "bg-blue-500 text-primary-foreground hover:bg-blue-500/90",
        yellow: "bg-yellow-500 text-primary-foreground hover:bg-yellow-500/90",
        purple: "bg-purple-500 text-primary-foreground hover:bg-purple-500/90",

        red: "bg-red-500 text-primary-foreground hover:bg-red-500/90",

        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        success: "bg-green-500 text-primary-foreground hover:bg-green-600",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
