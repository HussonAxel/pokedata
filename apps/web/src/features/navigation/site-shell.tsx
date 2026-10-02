import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, type ReactNode } from "react";

import { ItemContent, ItemTitle } from "@pokedata/ui/components/item";
import { Button } from "@pokedata/ui/components/button";
import { Skeleton } from "@pokedata/ui/components/skeleton";
import { cn } from "@pokedata/ui/lib/utils";
import {
  Column,
  ColumnBody,
  ColumnItem,
  ColumnList,
  Columns,
  ColumnsPanel,
  ColumnsPanelHeader,
  LIST_COLUMN_WIDTH,
} from "@/components/columns-panel";
import { Within } from "@/components/ui/within";
import { pages as allPages, sections, staticPages } from "@/features/navigation/pages";
import { PokemonColumn } from "@/features/pokedex/pokemon-column";

/**
 * Troisième colonne d'une page : la liste d'éléments dont chaque ligne ouvre un
 * détail. Une route la réclame via `staticData.itemsColumn`.
 */
const ITEMS_COLUMNS = {
  pokemon: PokemonColumn,
} as const;

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

type MobileLevel = "sections" | "pages" | "items" | "content";

/** Où se trouve-t-on : la section (colonne 1), la page (colonne 2), et ce que la route demande. */
function useShellState() {
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
      ? "sections"
      : section && fullPath === section.path
        ? "pages"
        : itemsColumn && !detail
          ? "items"
          : "content";

  return { section, pages, page, itemsColumn, detail, level };
}

function SectionRows({ activeSection }: { activeSection?: string }) {
  return sections.map((section) => (
    <ColumnItem
      key={section.path}
      selected={section.title === activeSection}
      render={<Link to={section.path} preload={false} />}
    >
      <ItemContent>
        <ItemTitle>{section.title}</ItemTitle>
      </ItemContent>
    </ColumnItem>
  ));
}

function PageRows({
  pages,
  activePath,
}: {
  pages: ReturnType<typeof useShellState>["pages"];
  activePath?: string;
}) {
  return pages.map((page) => (
    <ColumnItem
      key={page.path}
      selected={page.path === activePath}
      render={<Link to={page.path} preload={page.section === "Mon espace" ? false : "intent"} />}
    >
      <ItemContent>
        <ItemTitle>{page.title}</ItemTitle>
      </ItemContent>
    </ColumnItem>
  ));
}

/** Sous `xl` : le chemin parcouru, chaque étape ramène au niveau correspondant. */
function Crumbs({ state }: { state: ReturnType<typeof useShellState> }) {
  if (!state.section) return null;

  const crumbClass = "min-w-0 truncate transition-colors hover:text-foreground";

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground xl:hidden"
    >
      <span aria-hidden="true">/</span>
      <Link to={state.section.path} preload={false} className={cn(crumbClass, "shrink-0")}>
        {state.section.title}
      </Link>
      {state.page ? (
        <>
          <span aria-hidden="true">/</span>
          <Link to={state.page.path} className={crumbClass}>
            {state.page.title}
          </Link>
        </>
      ) : null}
    </nav>
  );
}

function ColumnSkeleton() {
  return (
    <Column mobile animate={false} className={LIST_COLUMN_WIDTH}>
      <div aria-busy="true" className="flex flex-col gap-3 p-3">
        <span className="sr-only">Chargement de la liste</span>
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </Column>
  );
}

/**
 * Coquille du site : un panneau à colonnes façon catalog.design. Sections →
 * pages → éléments → détail ; chaque niveau est une vraie route, donc l'URL
 * décrit toujours l'état des colonnes.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const state = useShellState();
  // Une navigation est en cours : l'URL a changé, la nouvelle vue n'est pas encore prête.
  const pending = useRouterState({ select: (router) => router.isLoading });
  const pathname = useMatches().at(-1)?.pathname;
  const ItemsColumn = state.itemsColumn ? ITEMS_COLUMNS[state.itemsColumn] : undefined;

  return (
    <div className="h-svh p-4 xl:p-8">
      <a href="#contenu" className="sr-only focus:not-sr-only">
        Aller au contenu
      </a>
      <ColumnsPanel>
        <ColumnsPanelHeader>
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="shrink-0 text-xl font-bold tracking-tight sm:text-2xl">
              Pokedata
            </Link>
            <Crumbs state={state} />
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground sm:gap-5">
            <Button
              variant="secondary"
              size="sm"
              nativeButton={false}
              className="max-sm:hidden"
              render={<Link to="/login" />}
            >
              Connexion
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Connexion"
              nativeButton={false}
              className="sm:hidden"
              render={<Link to="/login" />}
            >
              <UserIcon />
            </Button>
            <Within
              aria-label="Thème sombre"
              aria-pressed={isDark}
              title={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xl text-foreground transition-colors hover:bg-accent active:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            />
          </div>
        </ColumnsPanelHeader>

        <Columns>
          <Column mobile={state.level === "sections"} className="w-full xl:w-44 xl:shrink-0">
            <ColumnBody>
              <ColumnList
                selectedIndex={sections.findIndex((entry) => entry.title === state.section?.title)}
              >
                <nav aria-label="Sections" className="flex flex-col p-2">
                  <SectionRows activeSection={state.section?.title} />
                </nav>
              </ColumnList>
            </ColumnBody>
          </Column>

          {state.section ? (
            <Column mobile={state.level === "pages"} className="w-full xl:w-56 xl:shrink-0">
              <ColumnBody>
                {/* La colonne reste en place d'une section à l'autre ; seules ses pages fondent. */}
                <ColumnList
                  selectedIndex={state.pages.findIndex((entry) => entry.path === state.page?.path)}
                >
                  <nav
                    key={state.section.title}
                    aria-label={state.section.title}
                    className="flex flex-col p-2 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
                  >
                    <PageRows pages={state.pages} activePath={state.page?.path} />
                  </nav>
                </ColumnList>
              </ColumnBody>
            </Column>
          ) : null}

          {ItemsColumn ? (
            <Suspense fallback={<ColumnSkeleton />}>
              <ItemsColumn mobile={!state.detail} />
            </Suspense>
          ) : null}

          <div
            data-scroll-restoration-id="content"
            aria-busy={pending || undefined}
            data-pending={pending || undefined}
            // Sous `xl`, seul le niveau courant s'affiche (voir `level`). L'ancienne
            // vue reste affichée pendant le chargement ; elle ne s'estompe que si
            // celui-ci dure, pour qu'un clic servi par le cache ne clignote pas.
            className={cn(
              "min-w-0 flex-1 overflow-y-auto transition-opacity duration-200 data-pending:opacity-60 data-pending:delay-200",
              state.level !== "content" && "max-xl:hidden",
            )}
          >
            {/* Clé = chemin : changer de page ou de Pokémon fond en douceur, changer un filtre ne remonte rien. */}
            <div
              key={pathname}
              className="h-full animate-in fade-in-0 duration-150 motion-reduce:animate-none"
            >
              {children}
            </div>
          </div>
        </Columns>
      </ColumnsPanel>
    </div>
  );
}
