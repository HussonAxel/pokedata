import { Button } from "@pokedata/ui/components/button";
import { ItemContent, ItemTitle } from "@pokedata/ui/components/item";
import { Link } from "@tanstack/react-router";
import { MenuIcon, PanelLeftCloseIcon } from "lucide-react";

import { Column, ColumnBody, ColumnItem, ColumnList } from "@/components/columns-panel";
import { sections } from "@/features/navigation/pages";
import { useShellLayout } from "@/features/navigation/shell-layout";
import type { ShellState } from "@/features/navigation/use-shell-state";

/** Première colonne : les sections du site, en libellés techniques. */
export function SectionColumn({ state }: { state: ShellState }) {
  const active = state.section?.title;

  return (
    <Column className="w-full xl:w-44 xl:shrink-0">
      <ColumnBody>
        <ColumnList selectedIndex={sections.findIndex((entry) => entry.title === active)}>
          <nav aria-label="Sections" className="flex flex-col p-2">
            {sections.map((section) => (
              <ColumnItem
                key={section.path}
                selected={section.title === active}
                render={<Link to={section.path} preload={false} />}
              >
                <ItemContent>
                  <ItemTitle>
                    <span className="label-mono">{section.title}</span>
                  </ItemTitle>
                </ItemContent>
              </ColumnItem>
            ))}
          </nav>
        </ColumnList>
      </ColumnBody>
    </Column>
  );
}

/** Deuxième colonne : les pages de la section courante. */
export function PageColumn({ state }: { state: ShellState }) {
  if (!state.section) return null;

  return (
    <Column
      id="navigation-pages"
      mobile={state.level === "pages"}
      className="w-full xl:w-56 xl:flex-none"
    >
      <ColumnBody>
        {/* La colonne reste en place d'une section à l'autre ; seules ses pages fondent. */}
        <ColumnList
          selectedIndex={state.pages.findIndex((entry) => entry.path === state.page?.path)}
        >
          <nav
            key={state.section.title}
            aria-label={state.section.title}
            className="flex animate-in flex-col p-2 duration-150 fade-in-0 motion-reduce:animate-none"
          >
            {state.pages.map((page) => (
              <ColumnItem
                key={page.path}
                selected={page.path === state.page?.path}
                render={
                  <Link to={page.path} preload={page.section === "Mon espace" ? false : "intent"} />
                }
              >
                <ItemContent>
                  <ItemTitle>{page.title}</ItemTitle>
                </ItemContent>
              </ColumnItem>
            ))}
          </nav>
        </ColumnList>
      </ColumnBody>
    </Column>
  );
}

/** Sur une fiche, les sections se replient en rail d'icônes. */
export function SectionRail({ state }: { state: ShellState }) {
  const {
    state: { navigationExpanded },
    actions: { toggleNavigation },
  } = useShellLayout();
  const active = state.section?.title;
  const toggleLabel = navigationExpanded ? "Replier la navigation" : "Déplier la navigation";

  return (
    <Column className="w-16 shrink-0">
      <nav aria-label="Sections" className="flex flex-col items-center gap-2 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNavigation}
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={navigationExpanded}
          aria-controls="navigation-pages"
        >
          {navigationExpanded ? <PanelLeftCloseIcon /> : <MenuIcon />}
        </Button>
        {sections.map(({ path, title, icon: Icon }) => (
          <Button
            key={path}
            variant={active === title ? "default" : "ghost"}
            size="icon"
            nativeButton={false}
            aria-label={title}
            title={title}
            aria-current={active === title ? "true" : undefined}
            render={<Link to={path} preload={false} />}
          >
            <Icon />
          </Button>
        ))}
      </nav>
    </Column>
  );
}
