"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariantsOuter = cva("", {
  variants: {
    variant: {
      primary:
        " border border-[1px] dark:border-[2px] border-black/10 dark:border-black bg-gradient-to-b from-black/70 to-black dark:from-white dark:to-white/80 p-[1px] transition duration-300 ease-in-out",
      outline:
        "border-[1px] border-black/20 dark:border-neutral-950 bg-transparent p-[1px] transition duration-300 ease-in-out hover:border-black/30 dark:hover:border-neutral-800",
      accent:
        "border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-indigo-300/90 to-indigo-500 dark:from-indigo-200/70 dark:to-indigo-500 p-[1px] transition duration-300 ease-in-out",

      red: " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-red-300/90 to-red-500 dark:from-red-200/70 dark:to-red-500 p-[1px] transition duration-300 ease-in-out",

      wrong:
        " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-rose-300/90 to-rose-500 dark:from-rose-200/70 dark:to-rose-500 p-[1px] transition duration-300 ease-in-out",

      blue: "gap-2 bg-gradient-to-b from-blue-400 to-blue-600 text-sm text-white transition duration-300 ease-in-out hover:from-blue-400/70 hover:to-blue-600/70 dark:hover:from-blue-400/70 dark:hover:to-blue-600/70 active:from-blue-400/80 active:to-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-blue-400/30 disabled:to-blue-600/30 dark:disabled:from-blue-400/30 dark:disabled:to-blue-600/30",

      cyan: "border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-cyan-300/90 to-cyan-500 dark:from-cyan-200/70 dark:to-cyan-500 p-[1px] transition duration-300 ease-in-out",

      yellow:
        " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-yellow-300/90 to-yellow-500 dark:from-yellow-200/70 dark:to-yellow-500 p-[1px] transition duration-300 ease-in-out",

      purple:
        " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-purple-300/90 to-purple-500 dark:from-purple-200/70 dark:to-purple-500 p-[1px] transition duration-300 ease-in-out",

      gray: " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-gray-300/90 to-gray-500 dark:from-gray-200/70 dark:to-gray-500 p-[1px] transition duration-300 ease-in-out",

      share:
        "gap-2 bg-gradient-to-b from-emerald-400 to-emerald-600 text-sm text-white transition duration-300 ease-in-out hover:from-emerald-400/70 hover:to-emerald-600/70 dark:hover:from-emerald-400/70 dark:hover:to-emerald-600/70 active:from-emerald-400/80 active:to-emerald-600/80 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-emerald-400/30 disabled:to-emerald-600/30 dark:disabled:from-emerald-400/30 dark:disabled:to-emerald-600/30",
      link: " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-sky-300/90 to-sky-500 dark:from-sky-200/70 dark:to-sky-500 p-[1px] transition duration-300 ease-in-out",

      green:
        " border-[1px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-green-300/90 to-green-500 dark:from-green-200/70 dark:to-green-500 p-[1px] transition duration-300 ease-in-out",

      destructive:
        " border-[1px] dark:border-[2px] border-black/10 dark:border-neutral-950 bg-gradient-to-b from-red-300/90 to-red-500 dark:from-red-300/90 dark:to-red-500 p-[1px] transition duration-300 ease-in-out",

      secondary:
        " border-[1px] dark:border-[2px] border-black/20 bg-white/50 dark:border-neutral-950 dark:bg-neutral-600/50 p-[1px] transition duration-300 ease-in-out",

      minimal:
        "group  border-[1px] dark:border-[2px] border-black/20 bg-white/50 dark:border-neutral-950 dark:bg-neutral-600/80 p-[1px] active:bg-neutral-200 dark:active:bg-neutral-800 hover:bg-gradient-to-t hover:from-neutral-100 to-white dark:hover:from-neutral-600/50 dark:hover:to-neutral-600/70 active:bg-neutral-200 dark:active:bg-neutral-800",

      icon: "group rounded-full border dark:border-neutral-950 border-black/10 dark:bg-neutral-600/50 bg-white/50 p-[1px] active:bg-neutral-200 dark:active:bg-neutral-800 hover:bg-gradient-to-t hover:from-neutral-100 to-white dark:hover:from-neutral-700 dark:hover:to-neutral-600 active:bg-neutral-200 dark:active:bg-neutral-800",
    },
    size: {
      sm: "rounded-full",
      default: "rounded-full",
      lg: "rounded-full",
      icon: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

const innerDivVariants = cva(
  " h-full flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        primary:
          "gap-2 bg-gradient-to-b from-neutral-800 to-black dark:from-neutral-200 dark:to-neutral-50 text-sm text-white/90 dark:text-black/80 transition duration-300 ease-in-out hover:from-stone-800 hover:to-neutral-800/70 dark:hover:from-stone-200 dark:hover:to-neutral-200 dark:active:from-stone-300 dark:active:to-neutral-300 active:bg-gradient-to-b active:from-black active:to-black",
        outline:
          "gap-2 bg-transparent text-sm text-black dark:text-white transition duration-300 ease-in-out hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10",
        accent:
          "gap-2 bg-gradient-to-b from-indigo-400 to-indigo-600 text-sm text-white transition duration-300 ease-in-out hover:bg-gradient-to-b hover:from-indigo-400/70 hover:to-indigo-600/70 dark:hover:from-indigo-400/70 dark:hover:to-indigo-600/70 active:bg-gradient-to-b active:from-indigo-400/80 active:to-indigo-600/80 dark:active:from-indigo-400 dark:active:to-indigo-600",

        red: "gap-2 bg-gradient-to-b from-red-400 to-red-600 text-sm text-white transition duration-300 ease-in-out hover:from-red-400/70 hover:to-red-600/70 dark:hover:from-red-400/70 dark:hover:to-red-600/70 active:from-red-400/80 active:to-red-600/80",

        wrong:
          "gap-2 bg-gradient-to-b from-rose-400 to-rose-600 text-sm text-white transition duration-300 ease-in-out hover:from-rose-400/70 hover:to-rose-600/70 dark:hover:from-rose-400/70 dark:hover:to-rose-600/70 active:from-rose-400/80 active:to-rose-600/80",

        blue: "gap-2 bg-gradient-to-b from-blue-400 to-blue-600 text-sm text-white transition duration-300 ease-in-out hover:from-blue-400/70 hover:to-blue-600/70 dark:hover:from-blue-400/70 dark:hover:to-blue-600/70 active:from-blue-400/80 active:to-blue-600/80",

        cyan: "gap-2 bg-gradient-to-b from-cyan-400 to-cyan-600 text-sm text-white transition duration-300 ease-in-out hover:from-cyan-400/70 hover:to-cyan-600/70 dark:hover:from-cyan-400/70 dark:hover:to-cyan-600/70 active:from-cyan-400/80 active:to-cyan-600/80",

        yellow:
          "gap-2 bg-gradient-to-b from-yellow-400 to-yellow-600 text-sm text-black transition duration-300 ease-in-out hover:from-yellow-400/70 hover:to-yellow-600/70 dark:hover:from-yellow-400/70 dark:hover:to-yellow-600/70 active:from-yellow-400/80 active:to-yellow-600/80",

        purple:
          "gap-2 bg-gradient-to-b from-purple-400 to-purple-600 text-sm text-white transition duration-300 ease-in-out hover:from-purple-400/70 hover:to-purple-600/70 dark:hover:from-purple-400/70 dark:hover:to-purple-600/70 active:from-purple-400/80 active:to-purple-600/80",

        gray: "gap-2 bg-gradient-to-b from-gray-400 to-gray-600 text-sm text-white transition duration-300 ease-in-out hover:from-gray-400/70 hover:to-gray-600/70 dark:hover:from-gray-400/70 dark:hover:to-gray-600/70 active:from-gray-400/80 active:to-gray-600/80",

        share:
          "gap-2 bg-gradient-to-b from-emerald-400 to-emerald-600 text-sm text-white transition duration-300 ease-in-out hover:from-emerald-400/70 hover:to-emerald-600/70 dark:hover:from-emerald-400/70 dark:hover:to-emerald-600/70 active:from-emerald-400/80 active:to-emerald-600/80",

        link: "gap-2 bg-gradient-to-b from-sky-400 to-sky-600 text-sm text-white transition duration-300 ease-in-out hover:from-sky-400/70 hover:to-sky-600/70 dark:hover:from-sky-400/70 dark:hover:to-sky-600/70 active:from-sky-400/80 active:to-sky-600/80",

        green:
          "gap-2 bg-gradient-to-b from-green-400 to-green-600 text-sm text-white transition duration-300 ease-in-out hover:from-green-400/70 hover:to-green-600/70 dark:hover:from-green-400/70 dark:hover:to-green-600/70 active:from-green-400/80 active:to-green-600/80",

        destructive:
          "gap-2 bg-gradient-to-b from-red-400/60 to-red-500/60 text-sm text-white transition duration-300 ease-in-out hover:bg-gradient-to-b hover:from-red-400/70 hover:to-red-600/70 dark:hover:from-red-400/70 dark:hover:to-red-500/80 active:bg-gradient-to-b active:from-red-400/80 active:to-red-600/80 dark:active:from-red-400 dark:active:to-red-500",

        secondary:
          "bg-gradient-to-b from-neutral-100/80 to-neutral-200/50 dark:from-neutral-800 dark:to-neutral-700/50 text-sm text-black dark:text-white transition duration-300 ease-in-out hover:bg-gradient-to-b hover:from-neutral-200/40 hover:to-neutral-300/60 dark:hover:from-neutral-700 dark:hover:to-neutral-700/60 active:bg-gradient-to-b active:from-neutral-200/60 active:to-neutral-300/70 dark:active:from-neutral-800 dark:active:to-neutral-700",

        minimal:
          "bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-700/50 text-sm text-black dark:text-white transition duration-300 ease-in-out group-hover:bg-gradient-to-b group-hover:from-neutral-50/50 group-hover:to-neutral-100/60 dark:group-hover:from-neutral-700 dark:group-hover:to-neutral-700/60 group-active:bg-gradient-to-b group-active:from-neutral-100/60 group-active:to-neutral-100/90 dark:group-active:from-neutral-800 dark:group-active:to-neutral-700",

        icon: "bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-700/50 text-black dark:text-white group-active:bg-neutral-200 dark:group-active:bg-neutral-800 rounded-full",
      },
      size: {
        sm: "text-xs rounded-full px-4 py-1",
        default: "text-sm rounded-full px-4 py-2",
        lg: "text-base rounded-full px-4 py-2",
        icon: "rounded-full p-1",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "destructive"
    | "minimal"
    | "icon"
    | "red"
    | "wrong"
    | "blue"
    | "cyan"
    | "yellow"
    | "purple"
    | "gray"
    | "share"
    | "link"
    | "green"
    | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const TextureButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "default",
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariantsOuter({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <div className={cn(innerDivVariants({ variant, size }))}>
          {children}
        </div>
      </Comp>
    );
  }
);

TextureButton.displayName = "TextureButton";

export { TextureButton };
