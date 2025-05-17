"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="gray_plus"
      className="rounded-full"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Toggle theme, current theme is ${theme}`}
    >
      <div className="relative w-[1.2rem] h-[1.2rem] ">
        {theme === "light" ? (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        )}
      </div>
      <span className="sr-only">
        {theme === "light" ? "Light" : "Dark"} mode
      </span>
    </Button>
  );
}
