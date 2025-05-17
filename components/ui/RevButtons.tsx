import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex  items-center border-2 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#4C1D95]/40 text-purple-500 hover:bg-[#4C1D95]/60",
        destructive: "bg-[#7F1D1D]/40 text-red-500 hover:bg-[#7F1D1D]/60",
        secondary: "bg-[#5B21B6]/40 text-[#A78BFA] hover:bg-[#5B21B6]/60",
        success: "bg-[#064E3B]/40 text-green-500 hover:bg-[#064E3B]/60",
        info: "bg-[#1E40AF]/40 text-blue-500 hover:bg-[#1E40AF]/60",
        warning: "bg-[#78350F]/40 text-yellow-500 hover:bg-[#78350F]/60",
        edit: "bg-[#312E81]/40 text-[#6366F1] hover:bg-[#312E81]/60",
        settings: "bg-[#334155]/40 text-[#64748B] hover:bg-[#334155]/60",
        cyan: "bg-[#155E75]/40 text-[#06B6D4] hover:bg-[#155E75]/60",
        yellow: "bg-[#854D0E]/40 text-[#FACC15] hover:bg-[#854D0E]/60",
        red: "bg-[#7F1D1D]/40 text-[#EF4444] hover:bg-[#7F1D1D]/60",
        blue: "bg-[#1E3A8A]/40 text-[#2563EB] hover:bg-[#1E3A8A]/60",
        pink: "bg-[#831843]/40 text-[#EC4899] hover:bg-[#831843]/60",
        gray: "bg-[#3F3F46]/40 text-[#71717A] hover:bg-[#3F3F46]/60",
        gold: "bg-[#92400E]/40 text-[#D4A017] hover:bg-[#92400E]/60",

        // Exceptions (leave these alone)
        outline: "bg-[#1F1F1F] hover:bg-[#2D2D2D] text-white",
        ghost: "bg-transparent border-0 hover:bg-[#2D2D2D] text-white",
        link: "bg-transparent text-[#8B5CF6] underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

const RevButtons = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
RevButtons.displayName = "RevButtons";

// Optional: extracted reference colors
export const colors = {
  default: "#8B5CF6",
  destructive: "#F43F5E",
  secondary: "#A78BFA",
  success: "#10B981",
  info: "#3B82F6",
  warning: "#F59E0B",
  edit: "#6366F1",
  settings: "#64748B",
  cyan: "#06B6D4",
  yellow: "#FACC15",
  red: "#EF4444",
  blue: "#2563EB",
  pink: "#EC4899",
  gray: "#71717A",
  gold: "#D4A017",
};

export { RevButtons, buttonVariants };
