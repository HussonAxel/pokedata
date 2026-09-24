import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { Within } from "@/components/ui/within";
import { sections } from "@/features/navigation/pages";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="border-b border-border/70 bg-background/75 px-5 py-4 backdrop-blur-xl md:px-8">
      <a href="#contenu" className="sr-only focus:not-sr-only">
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          <span className="text-primary">Poke</span>data
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/recherche" className="py-2 transition-colors hover:text-foreground">
            Rechercher
          </Link>
          <Link to="/login" className="py-2 transition-colors hover:text-foreground">
            Connexion
          </Link>
          <Within
            aria-label="Thème sombre"
            aria-pressed={isDark}
            title={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xl text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        </div>
      </div>
      <nav
        aria-label="Navigation principale"
        className="mx-auto mt-3 flex max-w-6xl flex-wrap gap-2"
      >
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            preload={false}
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{
              className: "bg-primary/10 font-semibold text-primary",
              "aria-current": "page",
            }}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </header>
  );
}
