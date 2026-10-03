import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import {
  CompassIcon,
  SwordsIcon,
  LibraryIcon,
  Gamepad2Icon,
  UsersIcon,
  WrenchIcon,
  UserIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  MenuIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Suspense, useState, type ReactNode } from "react";

import { ItemContent, ItemTitle } from "@pokedata/ui/components/item";
import { Button } from "@pokedata/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pokedata/ui/components/dialog";
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

type MobileLevel = "pages" | "items" | "content";

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
      ? "content"
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
function Crumbs({
  state,
  compact = false,
}: {
  state: ReturnType<typeof useShellState>;
  compact?: boolean;
}) {
  if (!state.section) return null;

  const crumbClass = "min-w-0 truncate transition-colors hover:text-foreground";

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground",
        !compact && "xl:hidden",
        compact && "max-sm:hidden",
      )}
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

const SECTION_ICONS = [
  CompassIcon,
  SwordsIcon,
  LibraryIcon,
  Gamepad2Icon,
  UsersIcon,
  WrenchIcon,
  UserIcon,
];

function SectionRail({
  activeSection,
  expanded,
  onToggle,
}: {
  activeSection?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Column className="w-16 shrink-0">
      <nav aria-label="Sections" className="flex flex-col items-center gap-2 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={expanded ? "Replier la navigation" : "Déplier la navigation"}
          title={expanded ? "Replier la navigation" : "Déplier la navigation"}
          aria-expanded={expanded}
          aria-controls="navigation-pages"
        >
          {expanded ? <PanelLeftCloseIcon /> : <MenuIcon />}
        </Button>
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[index]!;
          return (
            <Button
              key={section.path}
              variant={activeSection === section.title ? "default" : "ghost"}
              size="icon"
              nativeButton={false}
              aria-label={section.title}
              title={section.title}
              aria-current={activeSection === section.title ? "true" : undefined}
              render={<Link to={section.path} preload={false} />}
            >
              <Icon />
            </Button>
          );
        })}
      </nav>
    </Column>
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
  const compact = state.detail && state.itemsColumn === "pokemon";
  const [navigationExpanded, setNavigationExpanded] = useState(false);
  const [listHidden, setListHidden] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
            <Crumbs state={state} compact={compact} />
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
          {compact ? (
            <SectionRail
              activeSection={state.section?.title}
              expanded={navigationExpanded}
              onToggle={() => setNavigationExpanded((value) => !value)}
            />
          ) : (
            <Column className="w-full xl:w-44 xl:shrink-0">
              <ColumnBody>
                <ColumnList
                  selectedIndex={sections.findIndex(
                    (entry) => entry.title === state.section?.title,
                  )}
                >
                  <nav aria-label="Sections" className="flex flex-col p-2">
                    <SectionRows activeSection={state.section?.title} />
                  </nav>
                </ColumnList>
              </ColumnBody>
            </Column>
          )}

          {state.section && (!compact || navigationExpanded) ? (
            <Column
              id="navigation-pages"
              mobile={state.level === "pages"}
              className="w-full xl:w-56 xl:shrink-0"
            >
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

          {ItemsColumn && (!compact || !listHidden) ? (
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
              "@container min-w-0 flex-1 overflow-y-auto transition-opacity duration-200 data-pending:opacity-60 data-pending:delay-200",
              state.level !== "content" && "max-xl:hidden",
            )}
          >
            {compact ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden xl:inline-flex"
                  aria-expanded={!listHidden}
                  aria-controls="pokemon-list"
                  onClick={() => setListHidden((value) => !value)}
                >
                  {listHidden ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
                  {listHidden ? "Afficher les Pokémon" : "Masquer la liste"}
                </Button>
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <DialogTrigger
                    render={<Button variant="secondary" size="sm" className="xl:hidden" />}
                  >
                    <PanelLeftOpenIcon /> Changer de Pokémon
                  </DialogTrigger>
                  <DialogContent className="h-[80svh]">
                    <DialogHeader>
                      <DialogTitle>Changer de Pokémon</DialogTitle>
                      <DialogDescription>
                        Recherchez un Pokémon ou filtrez la liste.
                      </DialogDescription>
                    </DialogHeader>
                    <Suspense fallback={<ColumnSkeleton />}>
                      <PokemonColumn
                        mobile
                        className="w-full flex-1 border-r-0 xl:basis-auto"
                        onSelect={() => setPickerOpen(false)}
                      />
                    </Suspense>
                  </DialogContent>
                </Dialog>
                <span className="text-xs text-muted-foreground">Pokédex national</span>
              </div>
            ) : null}
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
