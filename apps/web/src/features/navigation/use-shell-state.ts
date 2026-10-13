import { useMatches } from "@tanstack/react-router";

import { pages as allPages, sections, staticPages } from "@/features/navigation/pages";

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

export type MobileLevel = "pages" | "items" | "content";

/** Où se trouve-t-on : la section (colonne 1), la page (colonne 2), et ce que la route demande. */
export function useShellState() {
  const matches = useMatches();
  const fullPath = normalize(matches.at(-1)?.fullPath ?? "/");

  const sectionTitle = allPages.find((page) => page.path === fullPath)?.section;
  const section = sections.find((entry) => entry.title === sectionTitle);

  const pages = section
    ? staticPages.filter((page) => page.section === section.title && page.path !== section.path)
    : [];
  const page = pages
    .filter((entry) => fullPath === entry.path || fullPath.startsWith(`${entry.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const itemsColumn = matches
    .map((match) => match.staticData.itemsColumn)
    .filter(Boolean)
    .at(-1);
  const detail = matches.some((match) => match.staticData.detail);

  // Sous `xl`, comme sur catalog.design, une seule colonne occupe le panneau : celle
  // du niveau où l'on se trouve. On descend d'un niveau à chaque clic et on
  // remonte par le fil d'Ariane de l'en-tête.
  const level: MobileLevel =
    fullPath === "/"
      ? "content"
      : section && fullPath === section.path
        ? "pages"
        : itemsColumn && !detail
          ? "items"
          : "content";

  // Une fiche ouverte à côté de sa liste : la navigation se replie en rail d'icônes.
  const compact = detail && itemsColumn !== undefined;

  return { section, pages, page, itemsColumn, detail, level, compact };
}

export type ShellState = ReturnType<typeof useShellState>;
