import React from "react";

interface children {
  children: React.ReactNode;
}

function TitleS({ children }: children) {
  return (
    <button className="bg-slate-100 dark:bg-slate-800 no-underline group cursor-pointer relative  shadow-zinc-900/20 dark:shadow-zinc-900 rounded-full p-px text-lg font-semibold leading-6 text-slate-900 dark:text-white inline-block">
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.8)_0%,rgba(56,189,248,0)_75%)] dark:bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </span>
      <div className="relative flex space-x-2 items-center z-10 rounded-full bg-white/90 dark:bg-zinc-950 py-2 px-6 ring-1 ring-slate-900/10 dark:ring-white/10">
        {children}
      </div>
      <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-400/0 via-blue-400/90 to-blue-400/0 dark:from-emerald-400/0 dark:via-emerald-400/90 dark:to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
    </button>
  );
}

export default TitleS;
