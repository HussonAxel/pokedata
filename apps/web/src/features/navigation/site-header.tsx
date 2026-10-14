import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@pokedata/ui/components/breadcrumb";
import { Button } from "@pokedata/ui/components/button";
import { cn } from "@pokedata/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";

import { ThemeToggle } from "@/features/navigation/theme-toggle";
import { UserMenu } from "@/features/navigation/user-menu";
import { useSearchShortcut } from "@/features/search/use-search-shortcut";
import type { ShellState } from "@/features/navigation/use-shell-state";

/** Barre givrée flottante, détachée du panneau à colonnes (docs/design.md). */
export function SiteHeader({ state }: { state: ShellState }) {
  useSearchShortcut();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 rounded-xl bg-card px-4 ring-1 ring-border backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-4">
        <Logo />
        <Crumbs state={state} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label="Rechercher (/)"
          title="Rechercher (/ ou Ctrl+K)"
          render={<Link to="/recherche" />}
        >
          <SearchIcon />
        </Button>
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-1.5 font-dot text-xl leading-none font-black tracking-wider uppercase sm:text-2xl"
    >
      Pokedata
      <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
    </Link>
  );
}

/**
 * Le chemin parcouru. À partir de `xl`, les colonnes le montrent déjà ; sur une
 * fiche, le rail les remplace et le fil reste utile, sauf sur petit écran.
 */
function Crumbs({ state }: { state: ShellState }) {
  if (!state.section) return null;

  return (
    <Breadcrumb
      aria-label="Fil d'Ariane"
      className={cn("min-w-0 overflow-hidden", state.compact ? "max-sm:hidden" : "xl:hidden")}
    >
      <BreadcrumbList className="min-w-0 flex-nowrap">
        {/* Sur petit écran, seul le dernier niveau reste : la section cède la place à la page. */}
        <BreadcrumbSeparator className={cn(state.page && "max-sm:hidden")}>/</BreadcrumbSeparator>
        <BreadcrumbItem className={cn("min-w-0", state.page ? "shrink-0 max-sm:hidden" : "")}>
          <BreadcrumbLink
            className="min-w-0"
            render={<Link to={state.section.path} preload={false} />}
          >
            <span className="block truncate">{state.section.title}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {state.page ? (
          <>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbLink className="min-w-0" render={<Link to={state.page.path} />}>
                <span className="block truncate">{state.page.title}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
