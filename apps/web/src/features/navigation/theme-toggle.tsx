import { useHydrated } from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { Within } from "@/components/ui/within";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Le serveur ignore le thème choisi : on ne le reflète qu'après l'hydratation.
  const isDark = useHydrated() && resolvedTheme === "dark";

  return (
    <Within
      aria-label="Thème sombre"
      aria-pressed={isDark}
      data-cuelume-toggle=""
      title={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-lg text-foreground ring-1 ring-border transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
}
