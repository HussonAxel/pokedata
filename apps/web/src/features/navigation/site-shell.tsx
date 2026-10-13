import { cn } from "@pokedata/ui/lib/utils";
import { useMatches, useRouterState } from "@tanstack/react-router";
import { Suspense, type ReactNode } from "react";

import { Columns, ColumnsPanel } from "@/components/columns-panel";
import { ColumnSkeleton } from "@/features/navigation/column-skeleton";
import { DetailToolbar } from "@/features/navigation/detail-toolbar";
import { ITEMS_COLUMNS } from "@/features/navigation/items-columns";
import { PageColumn, SectionColumn, SectionRail } from "@/features/navigation/section-nav";
import { ShellLayoutProvider, useShellLayout } from "@/features/navigation/shell-layout";
import { SiteHeader } from "@/features/navigation/site-header";
import { useShellState, type ShellState } from "@/features/navigation/use-shell-state";

/**
 * Coquille du site : une barre givrée flottante au-dessus d'un panneau à
 * colonnes façon catalog.design. Sections → pages → éléments → détail ; chaque
 * niveau est une vraie route, donc l'URL décrit toujours l'état des colonnes.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const state = useShellState();

  return (
    <ShellLayoutProvider>
      <div className="flex h-svh flex-col gap-3 p-3 xl:gap-4 xl:p-5">
        <a href="#contenu" className="sr-only focus:not-sr-only">
          Aller au contenu
        </a>
        <SiteHeader state={state} />
        <ColumnsPanel>
          <Columns>
            <ShellColumns state={state} />
            <ShellContent state={state}>{children}</ShellContent>
          </Columns>
        </ColumnsPanel>
      </div>
    </ShellLayoutProvider>
  );
}

function ShellColumns({ state }: { state: ShellState }) {
  const {
    state: { navigationExpanded, listHidden },
  } = useShellLayout();
  const ItemsColumn = state.itemsColumn ? ITEMS_COLUMNS[state.itemsColumn].Column : undefined;

  return (
    <>
      {state.compact ? <SectionRail state={state} /> : <SectionColumn state={state} />}
      {!state.compact || navigationExpanded ? <PageColumn state={state} /> : null}
      {ItemsColumn && (!state.compact || !listHidden) ? (
        <Suspense fallback={<ColumnSkeleton />}>
          <ItemsColumn mobile={!state.detail} />
        </Suspense>
      ) : null}
    </>
  );
}

function ShellContent({ state, children }: { state: ShellState; children: ReactNode }) {
  // Une navigation est en cours : l'URL a changé, la nouvelle vue n'est pas encore prête.
  const pending = useRouterState({ select: (router) => router.isLoading });
  const pathname = useMatches().at(-1)?.pathname;

  return (
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
      {state.compact && state.itemsColumn ? <DetailToolbar column={state.itemsColumn} /> : null}
      {/* Clé = chemin : changer de page ou de Pokémon fond en douceur, changer un filtre ne remonte rien. */}
      <div
        key={pathname}
        className="h-full animate-in duration-150 fade-in-0 motion-reduce:animate-none"
      >
        {children}
      </div>
    </div>
  );
}
