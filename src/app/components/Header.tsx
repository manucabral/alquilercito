"use client";

import { useTheme } from "@/app/providers/ThemeProvider";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="font-semibold tracking-tight text-base sm:text-lg text-foreground">
            Alquilercito
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border/60 hover:border-foreground/40 text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? (
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
              <path
                strokeWidth="1.5"
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
              />
            </svg>
          ) : (
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
