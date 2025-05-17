import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "border-2 inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-[#4C1D95]/40 text-purple-500 hover:bg-[#4C1D95]/60",
        destructive: "bg-[#7F1D1D]/40 text-red-500 hover:bg-[#7F1D1D]/60",
        outline: "bg-[#1F1F1F] hover:bg-[#2D2D2D] hover:text-white",
        secondary: "bg-[#5B21B6]/40 text-[#A78BFA] hover:bg-[#5B21B6]/60",
        ghost: "bg-transparent hover:bg-[#2D2D2D] hover:text-white",
        link: "bg-transparent text-[#8B5CF6] underline-offset-4 hover:underline border-transparent",
        success: "bg-[#064E3B]/40 text-green-500 hover:bg-[#064E3B]/60",
        info: "bg-[#1E40AF]/40 text-blue-500 hover:bg-[#1E40AF]/60",
        warning: "bg-[#78350F]/40 text-yellow-500 hover:bg-[#78350F]/60",
        edit: "bg-[#6366F1] text-white hover:bg-[#6366F1]/90",
        settings: "bg-[#64748B] text-white hover:bg-[#64748B]/90",
        cyan: "bg-[#164E63]/40 text-cyan-500 hover:bg-[#164E63]/60",
        yellow: "bg-[#FACC15] text-white hover:bg-[#FACC15]/90",
        red: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90",
        blue: "bg-[#2563EB] text-white hover:bg-[#2563EB]/90",
        pink: "bg-[#EC4899] text-white hover:bg-[#EC4899]/90",
        gray: "bg-[#71717A] text-white hover:bg-[#71717A]/90",
        gold: "bg-[#D4A017] text-white hover:bg-[#D4A017]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
